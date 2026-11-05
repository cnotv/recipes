import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { DatabaseSync } from 'node:sqlite'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { createApp } from './app.ts'
import { createTestDatabase, testConfig } from './test-support.ts'
import { purgeOldVoteSessions } from './vote-sessions.ts'

type App = ReturnType<typeof createApp>

const stateSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['open', 'closed', 'expired']),
  options: z.array(z.object({ slug: z.string(), votes: z.number(), minutes: z.number() })),
  participants: z.array(z.object({ name: z.string(), hasVoted: z.boolean() })),
  totalVotes: z.number(),
  winnerSlugs: z.array(z.string()),
  viewer: z.object({ isCreator: z.boolean(), participantName: z.string().nullable(), votedSlug: z.string().nullable() }).optional(),
})

const send = (app: App, method: string, path: string, body?: unknown, cookie = '', headers: Record<string, string> = {}) =>
  app.request(`http://localhost${path}`, {
    method,
    headers: { host: 'localhost:4330', 'content-type': 'application/json', ...(cookie ? { cookie } : {}), ...headers },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })

const cookieOf = (response: Response): string =>
  response.headers
    .getSetCookie()
    .map((line) => line.split(';')[0])
    .join('; ')

const setup = () => {
  const database = createTestDatabase()
  const app = createApp(database, testConfig)
  return { database, app }
}

const createSession = async (app: App, body: Record<string, unknown> = {}) => {
  const response = await send(app, 'POST', '/api/vote-sessions', { name: 'Friday dinner', recipeSlugs: ['tomato-soup', 'chickpea-curry'], ...body })
  const { id } = z.object({ id: z.string() }).parse(await response.json())
  return { id, response, creatorCookie: cookieOf(response) }
}

const joinAs = async (app: App, id: string, name: string) =>
  cookieOf(await send(app, 'POST', `/api/vote-sessions/${id}/join`, { name }))

const readState = async (app: App, id: string, cookie = '') =>
  stateSchema.parse(await (await send(app, 'GET', `/api/vote-sessions/${id}`, undefined, cookie)).json())

describe('creating a vote session', () => {
  it('returns an unguessable id and a creator cookie scoped to the session', async () => {
    const { app } = setup()
    const { id, response } = await createSession(app)
    expect(response.status).toBe(201)
    expect(id).toMatch(/^[A-Za-z0-9_-]{22}$/)
    const cookie = response.headers.getSetCookie()[0]
    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('SameSite=Lax')
    expect(cookie).toContain(`Path=/api/vote-sessions/${id}`)
    expect(cookie).not.toContain('Secure')
    expect(cookie).not.toContain(id.slice(0, 8) + '.')
  })

  it('marks the cookie Secure behind an https proxy', async () => {
    const { app } = setup()
    const response = await send(app, 'POST', '/api/vote-sessions', { name: 'x', recipeSlugs: ['tomato-soup'] }, '', { 'x-forwarded-proto': 'https' })
    expect(response.headers.getSetCookie()[0]).toContain('Secure')
  })

  it('does not derive the creator cookie from the session id', async () => {
    const { app } = setup()
    const { id, creatorCookie } = await createSession(app)
    expect(creatorCookie.split('=')[1]).not.toBe(id)
  })

  it('defaults to 24 hours and lists the chosen recipes with no votes', async () => {
    const { app } = setup()
    const { id } = await createSession(app)
    const state = await readState(app, id)
    expect(state).toMatchObject({ name: 'Friday dinner', status: 'open', totalVotes: 0, winnerSlugs: [] })
    expect(state.options.map((option) => option.slug)).toEqual(['tomato-soup', 'chickpea-curry'])
    const raw = z.object({ endsAt: z.string() }).parse(await (await send(app, 'GET', `/api/vote-sessions/${id}`)).json())
    const hours = (new Date(raw.endsAt).getTime() - Date.now()) / 3_600_000
    expect(hours).toBeGreaterThan(23.9)
    expect(hours).toBeLessThanOrEqual(24)
  })

  it.each([
    ['no recipes', { recipeSlugs: [] }],
    ['a blank name', { name: '  ' }],
    ['an unknown recipe', { recipeSlugs: ['nothing'] }],
    ['an unpublished recipe', { recipeSlugs: ['draft-soup'] }],
    ['an end time in the past', { endsAt: '2020-01-01T00:00:00.000Z' }],
    ['an end time beyond 30 days', { endsAt: new Date(Date.now() + 40 * 86_400_000).toISOString() }],
  ])('rejects %s', async (_label, override) => {
    const { app } = setup()
    expect((await send(app, 'POST', '/api/vote-sessions', { name: 'x', recipeSlugs: ['tomato-soup'], ...override })).status).toBe(400)
  })

  it('refuses a cross-origin or non-JSON create', async () => {
    const { app } = setup()
    const body = { name: 'x', recipeSlugs: ['tomato-soup'] }
    expect((await send(app, 'POST', '/api/vote-sessions', body, '', { origin: 'https://evil.example' })).status).toBe(403)
    expect((await send(app, 'POST', '/api/vote-sessions', body, '', { 'content-type': 'text/plain' })).status).toBe(415)
  })
})

describe('joining and voting', () => {
  it('joins with a name and a participant cookie, and shows the participant', async () => {
    const { app } = setup()
    const { id } = await createSession(app)
    const response = await send(app, 'POST', `/api/vote-sessions/${id}/join`, { name: 'Mika' })
    expect(response.status).toBe(200)
    expect(response.headers.getSetCookie()[0]).toContain('HttpOnly')
    const state = await readState(app, id, cookieOf(response))
    expect(state.participants).toEqual([{ name: 'Mika', hasVoted: false }])
    expect(state.viewer).toEqual({ isCreator: false, participantName: 'Mika', votedSlug: null })
  })

  it('needs a name to join', async () => {
    const { app } = setup()
    const { id } = await createSession(app)
    expect((await send(app, 'POST', `/api/vote-sessions/${id}/join`, { name: ' ' })).status).toBe(400)
  })

  it('joining again from the same browser keeps one participant', async () => {
    const { app } = setup()
    const { id } = await createSession(app)
    const cookie = await joinAs(app, id, 'Mika')
    await send(app, 'POST', `/api/vote-sessions/${id}/join`, { name: 'Mika S' }, cookie)
    expect((await readState(app, id)).participants).toEqual([{ name: 'Mika S', hasVoted: false }])
  })

  it('counts a vote and tells the voter which recipe they picked', async () => {
    const { app } = setup()
    const { id } = await createSession(app)
    const cookie = await joinAs(app, id, 'Mika')
    expect((await send(app, 'PUT', `/api/vote-sessions/${id}/vote`, { recipeSlug: 'tomato-soup' }, cookie)).status).toBe(200)
    const state = await readState(app, id, cookie)
    expect(state.options.find((option) => option.slug === 'tomato-soup')?.votes).toBe(1)
    expect(state.totalVotes).toBe(1)
    expect(state.participants[0].hasVoted).toBe(true)
    expect(state.viewer?.votedSlug).toBe('tomato-soup')
  })

  it('moves the vote when it is changed, never adding a second one', async () => {
    const { app } = setup()
    const { id } = await createSession(app)
    const cookie = await joinAs(app, id, 'Mika')
    await send(app, 'PUT', `/api/vote-sessions/${id}/vote`, { recipeSlug: 'tomato-soup' }, cookie)
    await send(app, 'PUT', `/api/vote-sessions/${id}/vote`, { recipeSlug: 'chickpea-curry' }, cookie)
    const state = await readState(app, id, cookie)
    expect(state.options.map((option) => option.votes)).toEqual([0, 1])
    expect(state.totalVotes).toBe(1)
  })

  it('refuses a vote without joining, with a foreign cookie, or for a recipe outside the session', async () => {
    const { app } = setup()
    const first = await createSession(app)
    const second = await createSession(app)
    const path = `/api/vote-sessions/${first.id}/vote`
    expect((await send(app, 'PUT', path, { recipeSlug: 'tomato-soup' })).status).toBe(403)
    const otherSessionCookie = await joinAs(app, second.id, 'Mika')
    expect((await send(app, 'PUT', path, { recipeSlug: 'tomato-soup' }, otherSessionCookie)).status).toBe(403)
    const cookie = await joinAs(app, first.id, 'Mika')
    const narrow = await createSession(app, { recipeSlugs: ['tomato-soup'] })
    const narrowCookie = await joinAs(app, narrow.id, 'Mika')
    expect((await send(app, 'PUT', `/api/vote-sessions/${narrow.id}/vote`, { recipeSlug: 'chickpea-curry' }, narrowCookie)).status).toBe(400)
    expect((await send(app, 'PUT', path, { recipeSlug: 'tomato-soup' }, cookie)).status).toBe(200)
  })

  it('enforces one vote per participant in the database itself', async () => {
    const { app, database } = setup()
    const { id } = await createSession(app)
    const cookie = await joinAs(app, id, 'Mika')
    await send(app, 'PUT', `/api/vote-sessions/${id}/vote`, { recipeSlug: 'tomato-soup' }, cookie)
    const duplicate = () =>
      database
        .prepare("INSERT INTO votes (session_id, participant_id, recipe_id, voted_at) SELECT session_id, participant_id, recipe_id, 'now' FROM votes")
        .run()
    expect(duplicate).toThrow(/UNIQUE/)
  })

  it('refuses a vote for a recipe that is not in the session, even straight in the database', async () => {
    const { app, database } = setup()
    const narrow = await createSession(app, { recipeSlugs: ['tomato-soup'] })
    const cookie = await joinAs(app, narrow.id, 'Mika')
    const insertForeignRecipe = () =>
      database
        .prepare("INSERT INTO votes (session_id, participant_id, recipe_id, voted_at) SELECT ?, id, (SELECT id FROM recipes WHERE slug = 'chickpea-curry'), 'now' FROM participants")
        .run(narrow.id)
    expect(cookie).not.toBe('')
    expect(insertForeignRecipe).toThrow(/FOREIGN KEY/)
  })
})

describe('closing and expiry', () => {
  it('lets only the creator close, then shows the winner and stops votes', async () => {
    const { app } = setup()
    const { id, creatorCookie } = await createSession(app)
    const mika = await joinAs(app, id, 'Mika')
    const sam = await joinAs(app, id, 'Sam')
    await send(app, 'PUT', `/api/vote-sessions/${id}/vote`, { recipeSlug: 'chickpea-curry' }, mika)
    await send(app, 'PUT', `/api/vote-sessions/${id}/vote`, { recipeSlug: 'chickpea-curry' }, sam)
    expect((await send(app, 'POST', `/api/vote-sessions/${id}/close`, {}, mika)).status).toBe(403)
    expect((await send(app, 'POST', `/api/vote-sessions/${id}/close`, {})).status).toBe(403)
    expect((await send(app, 'POST', `/api/vote-sessions/${id}/close`, {}, creatorCookie)).status).toBe(200)
    const state = await readState(app, id, creatorCookie)
    expect(state).toMatchObject({ status: 'closed', winnerSlugs: ['chickpea-curry'] })
    expect(state.viewer?.isCreator).toBe(true)
    expect((await send(app, 'PUT', `/api/vote-sessions/${id}/vote`, { recipeSlug: 'tomato-soup' }, mika)).status).toBe(409)
    expect((await send(app, 'POST', `/api/vote-sessions/${id}/join`, { name: 'Late' })).status).toBe(409)
  })

  it('reports a tie as several winners', async () => {
    const { app } = setup()
    const { id, creatorCookie } = await createSession(app)
    await send(app, 'PUT', `/api/vote-sessions/${id}/vote`, { recipeSlug: 'tomato-soup' }, await joinAs(app, id, 'A'))
    await send(app, 'PUT', `/api/vote-sessions/${id}/vote`, { recipeSlug: 'chickpea-curry' }, await joinAs(app, id, 'B'))
    await send(app, 'POST', `/api/vote-sessions/${id}/close`, {}, creatorCookie)
    expect((await readState(app, id)).winnerSlugs).toEqual(['tomato-soup', 'chickpea-curry'])
  })

  it('stops taking votes once the end time passes', async () => {
    const { app, database } = setup()
    const { id } = await createSession(app)
    const cookie = await joinAs(app, id, 'Mika')
    await send(app, 'PUT', `/api/vote-sessions/${id}/vote`, { recipeSlug: 'tomato-soup' }, cookie)
    database.prepare('UPDATE vote_sessions SET ends_at = ?').run(new Date(Date.now() - 1000).toISOString())
    expect((await send(app, 'PUT', `/api/vote-sessions/${id}/vote`, { recipeSlug: 'chickpea-curry' }, cookie)).status).toBe(409)
    expect(await readState(app, id)).toMatchObject({ status: 'expired', winnerSlugs: ['tomato-soup'] })
  })

  it('deletes sessions 30 days after they ended, with their votes', async () => {
    const { app, database } = setup()
    const old = await createSession(app)
    const recent = await createSession(app)
    await send(app, 'PUT', `/api/vote-sessions/${old.id}/vote`, { recipeSlug: 'tomato-soup' }, await joinAs(app, old.id, 'Mika'))
    const day = 86_400_000
    database.prepare('UPDATE vote_sessions SET ends_at = ? WHERE id = ?').run(new Date(Date.now() - 31 * day).toISOString(), old.id)
    database.prepare('UPDATE vote_sessions SET ends_at = ? WHERE id = ?').run(new Date(Date.now() - 29 * day).toISOString(), recent.id)
    expect(purgeOldVoteSessions(database, new Date())).toBe(1)
    expect((await send(app, 'GET', `/api/vote-sessions/${old.id}`)).status).toBe(404)
    expect((await send(app, 'GET', `/api/vote-sessions/${recent.id}`)).status).toBe(200)
    expect(countRows(database, 'votes')).toBe(0)
    expect(countRows(database, 'participants')).toBe(0)
  })
})

const countRows = (database: DatabaseSync, table: string): number =>
  z.object({ total: z.number() }).parse(database.prepare(`SELECT COUNT(*) AS total FROM ${table}`).get()).total

describe('unknown ids', () => {
  it.each([
    ['GET', ''],
    ['POST', '/join'],
    ['PUT', '/vote'],
    ['POST', '/close'],
    ['GET', '/events'],
  ])('answers 404 for %s %s', async (method, suffix) => {
    const { app } = setup()
    const body = method === 'GET' ? undefined : { name: 'x', recipeSlug: 'tomato-soup' }
    expect((await send(app, method, `/api/vote-sessions/${'a'.repeat(22)}${suffix}`, body)).status).toBe(404)
    expect((await send(app, method, `/api/vote-sessions/short${suffix}`, body)).status).toBe(404)
  })
})

describe('live results', () => {
  it('emits the new tally on the event stream when someone votes', async () => {
    const { app } = setup()
    const { id } = await createSession(app)
    const cookie = await joinAs(app, id, 'Mika')
    const response = await send(app, 'GET', `/api/vote-sessions/${id}/events`)
    expect(response.headers.get('content-type')).toContain('text/event-stream')
    const reader = (response.body as ReadableStream<Uint8Array>).getReader()
    const decoder = new TextDecoder()
    const readEvent = async () => {
      const { value } = await reader.read()
      return stateSchema.parse(JSON.parse(decoder.decode(value).split('data: ')[1]))
    }
    expect((await readEvent()).totalVotes).toBe(0)
    await send(app, 'PUT', `/api/vote-sessions/${id}/vote`, { recipeSlug: 'tomato-soup' }, cookie)
    const updated = await readEvent()
    expect(updated.totalVotes).toBe(1)
    expect(updated.options[0].votes).toBe(1)
    expect(updated.participants).toEqual([{ name: 'Mika', hasVoted: true }])
    await reader.cancel()
  })
})

describe('the share page', () => {
  it('puts the session name in the title and the preview tags', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'vote-shell-'))
    writeFileSync(
      join(directory, 'index.html'),
      '<html><head><title>Recipes</title><meta property="og:title" content="Recipes" /><meta property="og:description" content="d" /><meta property="og:url" content="u" /><link rel="canonical" href="u" /></head><body></body></html>',
    )
    const database = createTestDatabase()
    const app = createApp(database, { ...testConfig, staticDirectory: directory })
    const { id } = await createSession(app, { name: 'Tom & <Jerry>' })
    const html = await (await app.request(`http://localhost/vote/${id}`, { headers: { host: 'localhost:4330' } })).text()
    expect(html).toContain('<title>Tom &#38; &#60;Jerry&#62; | Recipe vote</title>')
    expect(html).toContain('og:title" content="Tom &#38; &#60;Jerry&#62; | Recipe vote"')
    expect(html).toContain(`og:url" content="https://recipes.test/vote/${id}"`)
    expect(html).toContain(`rel="canonical" href="https://recipes.test/vote/${id}"`)
  })
})
