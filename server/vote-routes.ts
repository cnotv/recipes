import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { DatabaseSync } from 'node:sqlite'
import type { Context, Hono } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { streamSSE } from 'hono/streaming'
import { z } from 'zod'
import {
  addParticipant,
  buildViewer,
  buildVoteState,
  castVote,
  closeVoteSession,
  createVoteSession,
  findParticipantName,
  findVoteSession,
  renameParticipant,
  statusOf,
} from './vote-sessions.ts'
import type { VoteSessionRow } from './vote-sessions.ts'
import { createVoteBroadcaster } from './vote-events.ts'
import type { ServerConfig } from './types.ts'

const HEARTBEAT_MS = 15_000
const DEFAULT_DURATION_MS = 24 * 60 * 60 * 1000
const LONGEST_SESSION_MS = 30 * 24 * 60 * 60 * 1000
const COOKIE_MAX_AGE_SECONDS = 60 * 24 * 60 * 60

const sessionIdSchema = z.string().regex(/^[A-Za-z0-9_-]{22}$/)
const createBodySchema = z.object({
  name: z.string().trim().min(1).max(80),
  recipeSlugs: z.array(z.string().regex(/^[a-z0-9-]{1,200}$/)).min(1).max(50),
  endsAt: z.iso.datetime().optional(),
})
const joinBodySchema = z.object({ name: z.string().trim().min(1).max(40) })
const voteBodySchema = z.object({ recipeSlug: z.string().regex(/^[a-z0-9-]{1,200}$/) })

const readJson = async (context: Context): Promise<unknown> => context.req.json().catch(() => undefined)

const isHttps = (context: Context): boolean =>
  context.req.header('x-forwarded-proto') === 'https' || new URL(context.req.url).protocol === 'https:'

/** Cookies are scoped to one session's API path, so a browser sends them only there. */
const setSessionCookie = (context: Context, sessionId: string, name: 'creator' | 'participant', value: string): void =>
  setCookie(context, name, value, {
    path: `/api/vote-sessions/${sessionId}`,
    httpOnly: true,
    sameSite: 'Lax',
    secure: isHttps(context),
    maxAge: COOKIE_MAX_AGE_SECONDS,
  })

const escapeHtml = (text: string): string =>
  text.replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`)

const withMetaContent = (html: string, property: string, value: string): string =>
  html.replace(new RegExp(`(<meta property="${property}" content=")[^"]*(")`), (_match, start: string, end: string) => `${start}${escapeHtml(value)}${end}`)

/** The single page app shell with this session's name in the title and the share preview tags. */
const renderSharePage = (html: string, session: VoteSessionRow, pageUrl: string): string => {
  const title = `${session.name} | Recipe vote`
  const description = 'Join this recipe vote and pick what to cook.'
  return [
    (page: string) => page.replace(/<title>[^<]*<\/title>/, () => `<title>${escapeHtml(title)}</title>`),
    (page: string) => withMetaContent(page, 'og:title', title),
    (page: string) => withMetaContent(page, 'og:description', description),
    (page: string) => withMetaContent(page, 'og:url', pageUrl),
    (page: string) => page.replace(/(<link rel="canonical" href=")[^"]*(")/, (_match, start: string, end: string) => `${start}${escapeHtml(pageUrl)}${end}`),
  ].reduce((page, step) => step(page), html)
}

/** Registers the vote session API and the share page; mutations are already behind the same origin JSON guard. */
export const registerVoteRoutes = (app: Hono, database: DatabaseSync, config: ServerConfig, clock: () => Date = () => new Date()): void => {
  const broadcaster = createVoteBroadcaster()
  const publishState = (session: VoteSessionRow): void => broadcaster.publish(buildVoteState(database, session, clock()))

  const withSession = (context: Context): VoteSessionRow | undefined => {
    const id = sessionIdSchema.safeParse(context.req.param('id'))
    return id.success ? findVoteSession(database, id.data) : undefined
  }

  app.post('/api/vote-sessions', async (context) => {
    const body = createBodySchema.safeParse(await readJson(context))
    if (!body.success) return context.json({ error: 'Invalid vote session', issues: body.error.issues }, 400)
    const now = clock()
    const endsAt = body.data.endsAt === undefined ? new Date(now.getTime() + DEFAULT_DURATION_MS) : new Date(body.data.endsAt)
    if (endsAt <= now || endsAt.getTime() - now.getTime() > LONGEST_SESSION_MS) {
      return context.json({ error: 'The end time must be in the future, within 30 days' }, 400)
    }
    const created = createVoteSession(
      database,
      { name: body.data.name, recipeSlugs: [...new Set(body.data.recipeSlugs)], endsAt },
      now,
    )
    if (created === undefined) return context.json({ error: 'Unknown recipe' }, 400)
    setSessionCookie(context, created.id, 'creator', created.creatorId)
    return context.json({ id: created.id }, 201)
  })

  app.get('/api/vote-sessions/:id', (context) => {
    const session = withSession(context)
    if (session === undefined) return context.json({ error: 'Vote session not found' }, 404)
    return context.json({
      ...buildVoteState(database, session, clock()),
      viewer: buildViewer(database, session, getCookie(context, 'creator'), getCookie(context, 'participant')),
    })
  })

  app.post('/api/vote-sessions/:id/join', async (context) => {
    const session = withSession(context)
    if (session === undefined) return context.json({ error: 'Vote session not found' }, 404)
    const body = joinBodySchema.safeParse(await readJson(context))
    if (!body.success) return context.json({ error: 'A display name is required' }, 400)
    const existing = getCookie(context, 'participant')
    if (existing !== undefined && findParticipantName(database, session.id, existing) !== undefined) {
      renameParticipant(database, session.id, existing, body.data.name)
    } else if (statusOf(session, clock()) !== 'open') {
      return context.json({ error: 'This vote is over' }, 409)
    } else {
      setSessionCookie(context, session.id, 'participant', addParticipant(database, session.id, body.data.name, clock()))
    }
    publishState(session)
    return context.json({ name: body.data.name })
  })

  app.put('/api/vote-sessions/:id/vote', async (context) => {
    const session = withSession(context)
    if (session === undefined) return context.json({ error: 'Vote session not found' }, 404)
    const body = voteBodySchema.safeParse(await readJson(context))
    if (!body.success) return context.json({ error: 'A recipe is required' }, 400)
    const participantId = getCookie(context, 'participant')
    if (participantId === undefined || findParticipantName(database, session.id, participantId) === undefined) {
      return context.json({ error: 'Join the vote first' }, 403)
    }
    if (statusOf(session, clock()) !== 'open') return context.json({ error: 'This vote is over' }, 409)
    if (!castVote(database, session.id, participantId, body.data.recipeSlug, clock())) {
      return context.json({ error: 'That recipe is not in this vote' }, 400)
    }
    publishState(session)
    return context.json({ votedSlug: body.data.recipeSlug })
  })

  app.post('/api/vote-sessions/:id/close', (context) => {
    const session = withSession(context)
    if (session === undefined) return context.json({ error: 'Vote session not found' }, 404)
    if (getCookie(context, 'creator') !== session.creator_id) return context.json({ error: 'Only the creator can close the vote' }, 403)
    closeVoteSession(database, session.id, clock())
    publishState({ ...session, closed_at: session.closed_at ?? clock().toISOString() })
    return context.json({ status: 'closed' })
  })

  app.get('/api/vote-sessions/:id/events', (context) => {
    const session = withSession(context)
    if (session === undefined) return context.json({ error: 'Vote session not found' }, 404)
    return streamSSE(context, async (stream) => {
      const send = (state: unknown) => stream.writeSSE({ event: 'state', data: JSON.stringify(state) })
      const unsubscribe = broadcaster.subscribe(session.id, send)
      await send(buildVoteState(database, findVoteSession(database, session.id) ?? session, clock()))
      // A proxy closes a silent connection, so a comment line goes out now and then.
      await new Promise<void>((resolve) => {
        const heartbeat = setInterval(() => void stream.write(': heartbeat\n\n'), HEARTBEAT_MS)
        stream.onAbort(() => {
          clearInterval(heartbeat)
          unsubscribe()
          resolve()
        })
      })
    })
  })

  app.get('/vote/:id', (context, next) => {
    const session = withSession(context)
    const html = session === undefined ? undefined : readShell(config.staticDirectory)
    if (session === undefined || html === undefined) return next()
    return context.html(renderSharePage(html, session, `${config.siteUrl}/vote/${session.id}`))
  })
}

const readShell = (staticDirectory: string): string | undefined => {
  try {
    return readFileSync(join(staticDirectory, 'index.html'), 'utf8')
  } catch {
    return undefined
  }
}
