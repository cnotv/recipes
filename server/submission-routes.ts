import type { DatabaseSync } from 'node:sqlite'
import { getConnInfo } from '@hono/node-server/conninfo'
import type { Context, Hono } from 'hono'
import { z } from 'zod'
import { registerAdminRoutes } from './admin-routes.ts'
import { normalizeUrl } from './import-recipe.ts'
import { createRateLimiter } from './rate-limit.ts'
import { listSourceUrls } from './recipes.ts'
import { assertPublicUrl } from './safe-fetch.ts'
import { findSubmission, findSubmissionByUrl, queueSubmission, resumeUnfinishedSubmissions } from './submissions.ts'
import type { SubmissionContext, SubmissionServices } from './submission-types.ts'
import type { ServerConfig } from './types.ts'
import { userMessage } from './user-error.ts'

const MAX_URL_LENGTH = 2000
const SUBMISSIONS_PER_WINDOW = 5
const HOUR_MS = 60 * 60 * 1000

const submissionBodySchema = z.object({ url: z.string().trim().min(1).max(MAX_URL_LENGTH) })
const submissionIdSchema = z.string().uuid()

/**
 * The address the rate limits key on. Behind the trusted reverse proxy that is the last entry the proxy
 * appended to X-Forwarded-For; otherwise the socket address. A client can forge the earlier entries, never the last.
 */
export const clientAddress = (context: Context, trustProxy: boolean): string => {
  const forwarded = context.req.header('x-forwarded-for')?.split(',').at(-1)?.trim()
  if (trustProxy && forwarded) return forwarded
  try {
    return getConnInfo(context).remote.address ?? 'unknown'
  } catch {
    return 'unknown'
  }
}

const publicView = (row: { id: string; status: string; reason: string | null }) => ({
  id: row.id,
  status: row.status,
  ...(row.reason === null ? {} : { reason: row.reason }),
})

const alreadyInCollection = (database: DatabaseSync, normalizedUrl: string): boolean =>
  listSourceUrls(database).some((sourceUrl) => URL.canParse(sourceUrl) && normalizeUrl(sourceUrl) === normalizedUrl)

/** Registers the public submission routes and the admin routes, and resumes unfinished imports. */
export const registerSubmissionRoutes = (
  app: Hono,
  database: DatabaseSync,
  config: ServerConfig,
  services: SubmissionServices,
): void => {
  const context: SubmissionContext = { database, services }
  const submissionLimiter = createRateLimiter({ limit: SUBMISSIONS_PER_WINDOW, windowMs: HOUR_MS, now: services.now })

  app.post('/api/submissions', async (request) => {
    const limit = submissionLimiter(clientAddress(request, config.trustProxy))
    if (!limit.allowed) {
      return request.json({ error: 'Too many submissions, try again later' }, 429, { 'Retry-After': String(limit.retryAfterSeconds) })
    }
    const body = submissionBodySchema.safeParse(await request.req.json().catch(() => undefined))
    if (!body.success) return request.json({ error: 'Send a JSON body with a url' }, 400)
    const checked = await assertPublicUrl(body.data.url, services.lookup).catch((error: unknown) => error)
    if (!(checked instanceof URL)) return request.json({ error: userMessage(checked, 'That link cannot be imported') }, 400)
    const normalizedUrl = normalizeUrl(checked.href)
    const existing = findSubmissionByUrl(database, normalizedUrl)
    if ((existing !== undefined && existing.status !== 'failed') || alreadyInCollection(database, normalizedUrl)) {
      return request.json({ error: 'This link was already submitted', ...(existing ? { status: existing.status } : {}) }, 409)
    }
    return request.json(publicView(queueSubmission(context, checked.href, normalizedUrl)), 202)
  })

  app.get('/api/submissions/:id', (request) => {
    const id = submissionIdSchema.safeParse(request.req.param('id'))
    const row = id.success ? findSubmission(database, id.data) : undefined
    return row ? request.json(publicView(row)) : request.json({ error: 'Submission not found' }, 404)
  })

  registerAdminRoutes(app, context, config)
  resumeUnfinishedSubmissions(context)
}
