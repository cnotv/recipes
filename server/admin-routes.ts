import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import type { Context, Hono, MiddlewareHandler } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { z } from 'zod'
import { createRateLimiter } from './rate-limit.ts'
import { findRecipeById, toRecipeDetail } from './recipes.ts'
import { clientAddress } from './submission-routes.ts'
import { decideSubmission, findSubmission, listSubmissionsWithStatus } from './submissions.ts'
import type { SubmissionContext } from './submission-types.ts'
import type { ServerConfig } from './types.ts'

const COOKIE_NAME = 'recipes_admin'
const SESSION_MS = 8 * 60 * 60 * 1000
const SIGN_IN_ATTEMPTS = 10
const SIGN_IN_WINDOW_MS = 15 * 60 * 1000

const signInBodySchema = z.object({ token: z.string().max(500) })

const digest = (value: string): Buffer => createHash('sha256').update(value).digest()

/** Compares hashes of equal length so neither the length nor the content of the token leaks through timing. */
const tokenMatches = (given: string, expected: string): boolean => timingSafeEqual(digest(given), digest(expected))

/** Registers the admin routes; without RECIPES_ADMIN_TOKEN they all answer 404. */
export const registerAdminRoutes = (app: Hono, { database, services }: SubmissionContext, config: ServerConfig): void => {
  const { adminToken } = config
  const sessions = new Map<string, number>()
  const signInLimiter = createRateLimiter({ limit: SIGN_IN_ATTEMPTS, windowMs: SIGN_IN_WINDOW_MS, now: services.now })

  const isSignedIn = (context: Context): boolean => {
    const token = getCookie(context, COOKIE_NAME)
    const expires = token === undefined ? undefined : sessions.get(token)
    if (token !== undefined && expires !== undefined && expires <= services.now().getTime()) sessions.delete(token)
    return expires !== undefined && expires > services.now().getTime()
  }

  const requireAdmin: MiddlewareHandler = async (context, next) => {
    const isSessionRoute = context.req.path === '/api/admin/session'
    if (isSessionRoute && context.req.method === 'GET') return next()
    if (adminToken === undefined) return context.json({ error: 'Admin is disabled' }, 404)
    if (isSessionRoute) return next()
    if (!isSignedIn(context)) return context.json({ error: 'Sign in first' }, 401)
    await next()
  }
  app.use('/api/admin/*', requireAdmin)

  app.get('/api/admin/session', (context) =>
    context.json({ enabled: adminToken !== undefined, signedIn: adminToken !== undefined && isSignedIn(context) }),
  )

  app.post('/api/admin/session', async (context) => {
    const limit = signInLimiter(clientAddress(context, config.trustProxy))
    if (!limit.allowed) {
      return context.json({ error: 'Too many attempts, try again later' }, 429, { 'Retry-After': String(limit.retryAfterSeconds) })
    }
    const body = signInBodySchema.safeParse(await context.req.json().catch(() => undefined))
    if (!body.success || adminToken === undefined || !tokenMatches(body.data.token, adminToken)) {
      return context.json({ error: 'Wrong token' }, 401)
    }
    const session = randomBytes(32).toString('hex')
    sessions.set(session, services.now().getTime() + SESSION_MS)
    setCookie(context, COOKIE_NAME, session, {
      httpOnly: true,
      sameSite: 'Strict',
      secure: config.siteUrl.startsWith('https://'),
      path: '/',
      maxAge: SESSION_MS / 1000,
    })
    return context.json({ signedIn: true })
  })

  app.delete('/api/admin/session', (context) => {
    const token = getCookie(context, COOKIE_NAME)
    if (token !== undefined) sessions.delete(token)
    deleteCookie(context, COOKIE_NAME, { path: '/' })
    return context.json({ signedIn: false })
  })

  app.get('/api/admin/submissions', (context) =>
    context.json(
      listSubmissionsWithStatus(database, 'pending').flatMap((row) => {
        const recipe = row.recipeId === null ? undefined : findRecipeById(database, row.recipeId)
        return recipe ? [{ id: row.id, url: row.url, translated: row.translated, recipe: toRecipeDetail(recipe) }] : []
      }),
    ),
  )

  const decide = (decision: 'published' | 'rejected') => async (context: Context) => {
    const id = z.string().uuid().safeParse(context.req.param('id'))
    const row = id.success ? findSubmission(database, id.data) : undefined
    if (row === undefined) return context.json({ error: 'Submission not found' }, 404)
    if (row.status !== 'pending') return context.json({ error: 'This submission is not waiting for a decision' }, 409)
    await decideSubmission({ database, services }, row, decision)
    return context.json({ id: row.id, status: decision })
  }
  app.post('/api/admin/submissions/:id/approve', decide('published'))
  app.post('/api/admin/submissions/:id/reject', decide('rejected'))
}
