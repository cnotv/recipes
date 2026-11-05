import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { countRecipes } from './recipes.ts'
import {
  ADMIN_TOKEN,
  API_KEY,
  createSubmissionTestApp,
  recipePage,
  send,
  signIn,
  stubModel,
  submissionBodySchema,
  submit,
} from './submission-test-support.ts'
import { get, listSlugs } from './test-support.ts'

const SOUP_URL = 'https://recipes-source.example/tomato-soup'
const BLOG_URL = 'https://recipes-source.example/blog-post'
const BLOG_PAGE = '<html lang="en"><body><h1>Pasta</h1><p>Boil pasta. Add salt.</p></body></html>'

const accepted = async (setup: Parameters<typeof createSubmissionTestApp>[0], url = SOUP_URL) => {
  const test = createSubmissionTestApp(setup)
  const { body, status } = await submit(test.app, url)
  expect(status).toBe(202)
  await test.queue.idle()
  const id = submissionBodySchema.parse(body).id
  const state = submissionBodySchema.parse(await (await send(test.app, 'GET', `/api/submissions/${id}`)).json())
  return { ...test, id, state }
}

const pendingListSchema = z.array(
  z.object({
    id: z.string(),
    url: z.string(),
    translated: z.boolean(),
    recipe: z.object({ slug: z.string(), languages: z.record(z.string(), z.object({ title: z.string() })) }),
  }),
)

describe('importing a link', () => {
  it('imports JSON-LD without a model key and holds the recipe, untranslated, for approval', async () => {
    const { app, state, database } = await accepted({ pages: { [SOUP_URL]: recipePage() } })
    expect(state.status).toBe('pending')
    expect(countRecipes(database)).toBe(4)
    expect(await listSlugs(app, '')).toEqual(['chickpea-curry', 'tomato-soup'])
    const cookie = await signIn(app)
    const pending = pendingListSchema.parse(await (await send(app, 'GET', '/api/admin/submissions', undefined, cookie)).json())
    expect(pending).toHaveLength(1)
    expect(pending[0]).toMatchObject({ url: SOUP_URL, translated: false })
    expect(Object.keys(pending[0].recipe.languages)).toEqual(['en'])
  })

  it('translates into en, de, jp and th when a model is configured', async () => {
    const { app, state } = await accepted({ pages: { [SOUP_URL]: recipePage() }, callModel: stubModel() })
    expect(state.status).toBe('pending')
    const cookie = await signIn(app)
    const [item] = pendingListSchema.parse(await (await send(app, 'GET', '/api/admin/submissions', undefined, cookie)).json())
    expect(item.translated).toBe(true)
    expect(Object.keys(item.recipe.languages)).toEqual(['en', 'de', 'jp', 'th'])
  })

  it('falls back to the model for a page without JSON-LD', async () => {
    const { state, app } = await accepted({ pages: { [BLOG_URL]: BLOG_PAGE }, callModel: stubModel() }, BLOG_URL)
    expect(state.status).toBe('pending')
    const cookie = await signIn(app)
    const [item] = pendingListSchema.parse(await (await send(app, 'GET', '/api/admin/submissions', undefined, cookie)).json())
    expect(item.recipe.languages.en.title).toBe('en title')
  })

  it('fails with a reason when there is no JSON-LD and no model', async () => {
    const { state, database } = await accepted({ pages: { [BLOG_URL]: BLOG_PAGE } }, BLOG_URL)
    expect(state.status).toBe('failed')
    expect(state.reason).toContain('no recipe data')
    expect(countRecipes(database)).toBe(3)
  })

  it('stores nothing when the translation fails validation', async () => {
    const { state, database } = await accepted({
      pages: { [SOUP_URL]: recipePage() },
      callModel: stubModel({ translation: { en: { title: 'only english' } } }),
    })
    expect(state.status).toBe('failed')
    expect(state.reason).toContain('translation')
    expect(countRecipes(database)).toBe(3)
  })

  it('stores nothing when the translation drops a step', async () => {
    const { state, database } = await accepted({
      pages: { [SOUP_URL]: recipePage() },
      callModel: stubModel({ translation: ({ ingredients }: { ingredients: number }) => ({ en: ok(ingredients, 1), de: ok(ingredients, 1), jp: ok(ingredients, 1), th: ok(ingredients, 1) }) }),
    })
    expect(state.status).toBe('failed')
    expect(countRecipes(database)).toBe(3)
  })

  it('reports an unreachable page without internals and an unreadable model without the key', async () => {
    const unreachable = await accepted({ pages: {} })
    expect(unreachable.state).toMatchObject({ status: 'failed', reason: 'The page could not be fetched' })
    const broken = await accepted({
      pages: { [SOUP_URL]: recipePage() },
      callModel: async () => {
        throw new Error(`401 for key ${API_KEY}`)
      },
    })
    expect(broken.state.status).toBe('failed')
    expect(JSON.stringify(broken.state)).not.toContain(API_KEY)
  })

  it('never puts the model key in any response', async () => {
    const { app, id } = await accepted({
      pages: { [SOUP_URL]: recipePage() },
      callModel: stubModel(),
      config: { openRouterApiKey: API_KEY },
    })
    const cookie = await signIn(app)
    const bodies = await Promise.all(
      [`/api/submissions/${id}`, '/api/admin/submissions', '/api/admin/session', '/api/health'].map(async (path) =>
        (await send(app, 'GET', path, undefined, cookie)).text(),
      ),
    )
    expect(bodies.join('')).not.toContain(API_KEY)
  })

  it('answers 404 for an unknown submission', async () => {
    const { app } = createSubmissionTestApp()
    expect((await send(app, 'GET', '/api/submissions/nothing')).status).toBe(404)
    expect((await send(app, 'GET', '/api/submissions/7')).status).toBe(404)
  })

  it('picks up a submission left unfinished by a restart', async () => {
    const first = createSubmissionTestApp({ pages: { [SOUP_URL]: recipePage() } })
    first.database
      .prepare(
        "INSERT INTO submissions (id, url, normalized_url, status, created_at, updated_at) VALUES ('11111111-1111-4111-8111-111111111111', ?, ?, 'importing', 'now', 'now')",
      )
      .run(SOUP_URL, SOUP_URL)
    const { createApp } = await import('./app.ts')
    const { createJobQueue } = await import('./submission-services.ts')
    const { testConfig } = await import('./test-support.ts')
    const queue = createJobQueue()
    createApp(first.database, testConfig, {
      fetchPage: async (url) => ({ finalUrl: url, body: recipePage() }),
      callModel: undefined,
      queue,
      now: () => new Date(),
      lookup: async () => [{ address: '93.184.216.34', family: 4 }],
    })
    await queue.idle()
    const row = first.database.prepare("SELECT status FROM submissions WHERE id = '11111111-1111-4111-8111-111111111111'").get()
    expect(row).toEqual({ status: 'pending' })
  })
})

const ok = (ingredients: number, steps: number) => ({
  title: 't',
  ingredients: Array.from({ length: ingredients }, () => 'i'),
  steps: Array.from({ length: steps }, () => 's'),
})

describe('submission limits', () => {
  it.each([
    'http://127.0.0.1/admin',
    'http://localhost:4330/api/health',
    'http://169.254.169.254/latest/meta-data/',
    'http://[::1]/',
    'http://10.0.0.5/',
    'http://192.168.1.1/',
    'file:///etc/passwd',
    'ftp://example.com/x',
    'https://user:pass@example.com/',
    'https://example.com:22/',
    'http://metadata.google.internal/',
    'javascript:alert(1)',
    'not a link',
  ])('refuses %s before anything is fetched', async (url) => {
    const { app, database } = createSubmissionTestApp()
    const { status } = await submit(app, url)
    expect(status).toBe(400)
    expect(database.prepare('SELECT COUNT(*) AS total FROM submissions').get()).toEqual({ total: 0 })
  })

  it('refuses a name that resolves to a private address', async () => {
    const { app } = createSubmissionTestApp()
    const rebinding = createSubmissionTestApp()
    const { createApp } = await import('./app.ts')
    const { testConfig } = await import('./test-support.ts')
    const guarded = createApp(rebinding.database, testConfig, {
      fetchPage: async () => ({ finalUrl: '', body: '' }),
      callModel: undefined,
      queue: rebinding.queue,
      now: () => new Date(),
      lookup: async () => [{ address: '127.0.0.1', family: 4 }],
    })
    expect((await submit(guarded, 'https://rebind.example/')).status).toBe(400)
    expect(app).toBeDefined()
  })

  it('rejects a body that is not JSON with a url', async () => {
    const { app } = createSubmissionTestApp()
    expect((await send(app, 'POST', '/api/submissions', { link: 'x' })).status).toBe(400)
    expect((await send(app, 'POST', '/api/submissions', { url: 'x'.repeat(3000) })).status).toBe(400)
    expect((await app.request('http://localhost/api/submissions', { method: 'POST', headers: { host: 'localhost:4330' } })).status).toBe(415)
  })

  it('limits submissions per address and recovers after the window', async () => {
    const clock = { now: new Date('2026-01-01T00:00:00Z') }
    const { app } = createSubmissionTestApp({ now: () => clock.now, pages: {} })
    const statuses = await Promise.all(
      Array.from({ length: 6 }, (_, index) => submit(app, `https://recipes-source.example/${index}`).then((result) => result.status)),
    )
    expect(statuses.filter((status) => status === 202)).toHaveLength(5)
    expect(statuses.filter((status) => status === 429)).toHaveLength(1)
    const limited = await send(app, 'POST', '/api/submissions', { url: 'https://recipes-source.example/again' })
    expect(Number(limited.headers.get('retry-after'))).toBeGreaterThan(0)
    expect((await submit(app, 'https://recipes-source.example/other', { 'x-forwarded-for': '198.51.100.9' })).status).toBe(202)
    clock.now = new Date('2026-01-01T02:00:00Z')
    expect((await submit(app, 'https://recipes-source.example/later')).status).toBe(202)
  })

  it('refuses a link already submitted, however it is spelled', async () => {
    const { app, queue } = createSubmissionTestApp({ pages: { [SOUP_URL]: recipePage() } })
    expect((await submit(app, SOUP_URL)).status).toBe(202)
    await queue.idle()
    const again = await submit(app, `${SOUP_URL}/?utm_source=mail#top`)
    expect(again.status).toBe(409)
    expect(again.body).toMatchObject({ error: expect.stringContaining('already') })
  })

  it('refuses a link already in the collection', async () => {
    const { app } = createSubmissionTestApp()
    expect((await submit(app, 'https://example.com/curry')).status).toBe(409)
    expect((await submit(app, 'https://example.com/tomato%20soup')).status).toBe(409)
  })

  it('lets a failed link be submitted again', async () => {
    const test = createSubmissionTestApp({ pages: {} })
    expect((await submit(test.app, SOUP_URL)).status).toBe(202)
    await test.queue.idle()
    expect((await submit(test.app, SOUP_URL)).status).toBe(202)
  })
})

describe('approval', () => {
  it('publishes an approved recipe', async () => {
    const { app, id, queue } = await accepted({ pages: { [SOUP_URL]: recipePage() } })
    const cookie = await signIn(app)
    const response = await send(app, 'POST', `/api/admin/submissions/${id}/approve`, {}, cookie)
    expect(response.status).toBe(200)
    await queue.idle()
    expect(await listSlugs(app, '')).toHaveLength(3)
    expect(submissionBodySchema.parse(await (await send(app, 'GET', `/api/submissions/${id}`)).json()).status).toBe('published')
    expect(pendingListSchema.parse(await (await send(app, 'GET', '/api/admin/submissions', undefined, cookie)).json())).toEqual([])
  })

  it('keeps a rejected recipe hidden and blocks the same link', async () => {
    const { app, id } = await accepted({ pages: { [SOUP_URL]: recipePage() } })
    const cookie = await signIn(app)
    expect((await send(app, 'POST', `/api/admin/submissions/${id}/reject`, {}, cookie)).status).toBe(200)
    expect(await listSlugs(app, '')).toHaveLength(2)
    expect((await submit(app, SOUP_URL)).status).toBe(409)
  })

  it('refuses to decide a submission twice or one that is not waiting', async () => {
    const { app, id } = await accepted({ pages: { [SOUP_URL]: recipePage() } })
    const cookie = await signIn(app)
    await send(app, 'POST', `/api/admin/submissions/${id}/approve`, {}, cookie)
    expect((await send(app, 'POST', `/api/admin/submissions/${id}/reject`, {}, cookie)).status).toBe(409)
    expect((await send(app, 'POST', '/api/admin/submissions/missing/approve', {}, cookie)).status).toBe(404)
  })
})

describe('admin access', () => {
  it('needs a session for every admin route', async () => {
    const { app, id } = await accepted({ pages: { [SOUP_URL]: recipePage() } })
    expect((await send(app, 'GET', '/api/admin/submissions')).status).toBe(401)
    expect((await send(app, 'POST', `/api/admin/submissions/${id}/approve`, {})).status).toBe(401)
    expect((await send(app, 'POST', `/api/admin/submissions/${id}/reject`, {})).status).toBe(401)
    expect((await send(app, 'GET', '/api/admin/submissions', undefined, { cookie: 'recipes_admin=forged' })).status).toBe(401)
    expect(await listSlugs(app, '')).toHaveLength(2)
  })

  it('refuses a wrong token and sets no cookie', async () => {
    const { app } = createSubmissionTestApp()
    const response = await send(app, 'POST', '/api/admin/session', { token: 'wrong' })
    expect(response.status).toBe(401)
    expect(response.headers.get('set-cookie')).toBeNull()
  })

  it('sets an HttpOnly, SameSite strict cookie, Secure on https, and never echoes the token', async () => {
    const { app } = createSubmissionTestApp()
    const response = await send(app, 'POST', '/api/admin/session', { token: ADMIN_TOKEN })
    expect(response.status).toBe(200)
    const cookie = response.headers.get('set-cookie') ?? ''
    expect(cookie).toMatch(/HttpOnly/i)
    expect(cookie).toMatch(/SameSite=Strict/i)
    expect(cookie).toMatch(/Secure/i)
    expect(cookie).not.toContain(ADMIN_TOKEN)
    expect(await response.text()).not.toContain(ADMIN_TOKEN)
  })

  it('reports whether the caller is signed in, and signs out', async () => {
    const { app } = createSubmissionTestApp()
    const cookie = await signIn(app)
    expect(await (await send(app, 'GET', '/api/admin/session', undefined, cookie)).json()).toEqual({ enabled: true, signedIn: true })
    expect(await (await send(app, 'GET', '/api/admin/session')).json()).toEqual({ enabled: true, signedIn: false })
    await send(app, 'DELETE', '/api/admin/session', undefined, cookie)
    expect((await send(app, 'GET', '/api/admin/submissions', undefined, cookie)).status).toBe(401)
  })

  it('expires a session after its lifetime', async () => {
    const clock = { now: new Date('2026-01-01T00:00:00Z') }
    const { app } = createSubmissionTestApp({ now: () => clock.now })
    const cookie = await signIn(app)
    clock.now = new Date('2026-01-01T09:00:00Z')
    expect((await send(app, 'GET', '/api/admin/submissions', undefined, cookie)).status).toBe(401)
  })

  it('throttles repeated sign in guesses', async () => {
    const { app } = createSubmissionTestApp()
    const statuses = await Promise.all(
      Array.from({ length: 12 }, () => send(app, 'POST', '/api/admin/session', { token: 'guess' }).then((response) => response.status)),
    )
    expect(statuses).toContain(429)
    expect((await send(app, 'POST', '/api/admin/session', { token: ADMIN_TOKEN })).status).toBe(429)
  })

  it('is disabled without RECIPES_ADMIN_TOKEN', async () => {
    const { app } = createSubmissionTestApp({ config: { adminToken: undefined } })
    expect((await send(app, 'POST', '/api/admin/session', { token: ADMIN_TOKEN })).status).toBe(404)
    expect((await send(app, 'GET', '/api/admin/submissions')).status).toBe(404)
    expect(await (await send(app, 'GET', '/api/admin/session')).json()).toEqual({ enabled: false, signedIn: false })
  })

  it('refuses a cross-origin sign in', async () => {
    const { app } = createSubmissionTestApp()
    const response = await send(app, 'POST', '/api/admin/session', { token: ADMIN_TOKEN }, { origin: 'https://evil.example' })
    expect(response.status).toBe(403)
  })

  it('keeps the public list working alongside', async () => {
    const { app } = createSubmissionTestApp()
    expect((await get(app, '/api/recipes')).status).toBe(200)
  })
})
