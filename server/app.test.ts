import { describe, expect, it } from 'vitest'
import { createApp } from './app.ts'
import { createTestApp, createTestDatabase, detailBodySchema, get, listBodySchema, listSlugs, testConfig } from './test-support.ts'

describe('read routes', () => {
  it('reports health', async () => {
    const response = await get(createTestApp(), '/api/health')
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: 'ok' })
  })

  it('lists only published recipes, newest first, with a total', async () => {
    const body = listBodySchema.parse(await (await get(createTestApp(), '/api/recipes')).json())
    expect(body.total).toBe(2)
    expect(body.items.map((item) => item.slug)).toEqual(['chickpea-curry', 'tomato-soup'])
    expect(body.items[1]).toMatchObject({ title: 'Tomato Soup', languages: ['en', 'de'], difficulty: 'Easy' })
  })

  it('filters by cuisine, difficulty, language and search text', async () => {
    const app = createTestApp()
    expect(await listSlugs(app, 'cuisine=Indian')).toEqual(['chickpea-curry'])
    expect(await listSlugs(app, 'difficulty=Easy')).toEqual(['tomato-soup'])
    expect(await listSlugs(app, 'language=de')).toEqual(['tomato-soup'])
    expect(await listSlugs(app, 'q=tomaten')).toEqual(['tomato-soup'])
    expect(await listSlugs(app, 'q=100%25')).toEqual(['chickpea-curry'])
    expect(await listSlugs(app, 'q=%25')).toEqual(['chickpea-curry'])
  })

  it('paginates', async () => {
    const body = listBodySchema.parse(await (await get(createTestApp(), '/api/recipes?pageSize=1&page=2')).json())
    expect(body).toMatchObject({ page: 2, pageSize: 1, total: 2 })
    expect(body.items.map((item) => item.slug)).toEqual(['tomato-soup'])
  })

  it.each(['pageSize=0', 'pageSize=101', 'page=abc', 'difficulty=Brutal', 'language=english'])(
    'rejects the bad query %s',
    async (query) => {
      const response = await get(createTestApp(), `/api/recipes?${query}`)
      expect(response.status).toBe(400)
    },
  )

  it('returns one recipe with its translations', async () => {
    const body = detailBodySchema.parse(await (await get(createTestApp(), '/api/recipes/tomato-soup')).json())
    expect(body).toMatchObject({ slug: 'tomato-soup', url: 'https://example.com/tomato soup/', cuisine: 'Italian' })
    expect(body.languages.de.steps).toEqual([{ content: 'Köcheln.', image: 'a.jpg' }])
  })

  it('answers 404 for an unknown, unpublished or malformed slug', async () => {
    const app = createTestApp()
    expect((await get(app, '/api/recipes/nothing')).status).toBe(404)
    expect((await get(app, '/api/recipes/draft-soup')).status).toBe(404)
    expect((await get(app, '/api/recipes/NOT%20A%20SLUG')).status).toBe(404)
  })

  it('counts published recipes per cuisine', async () => {
    expect(await (await get(createTestApp(), '/api/cuisines')).json()).toEqual([
      { name: 'Indian', count: 1 },
      { name: 'Italian', count: 1 },
    ])
  })

  it('answers unknown API paths with JSON, not the app shell', async () => {
    const response = await get(createTestApp(), '/api/nothing')
    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'Not found' })
  })
})

describe('sitemap and old links', () => {
  it('builds the sitemap from the database', async () => {
    const response = await get(createTestApp(), '/sitemap.xml')
    const xml = await response.text()
    expect(response.headers.get('content-type')).toContain('application/xml')
    expect(xml).toContain('https://recipes.test/recipe/tomato-soup')
    expect(xml).not.toContain('draft-soup')
  })

  it('redirects an old encoded source URL link to the slug and keeps the query', async () => {
    const encoded = encodeURIComponent('https://example.com/tomato soup/')
    const response = await get(createTestApp(), `/recipe/${encoded}?lang=de`)
    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe('/recipe/tomato-soup?lang=de')
  })

  it('does not redirect a slug or an unknown source URL', async () => {
    const app = createTestApp()
    expect((await get(app, '/recipe/tomato-soup')).status).toBe(404)
    expect((await get(app, `/recipe/${encodeURIComponent('https://example.com/other')}`)).status).toBe(404)
  })
})

describe('host guard', () => {
  it.each(['evil.example', 'localhost.evil.example', ''])('refuses the Host %j on every path', async (host) => {
    const app = createTestApp()
    expect((await get(app, '/api/health', { host })).status).toBe(403)
    expect((await get(app, '/', { host })).status).toBe(403)
  })

  it('accepts the loopback names with and without a port', async () => {
    const app = createTestApp()
    expect((await get(app, '/api/health', { host: '127.0.0.1:4330' })).status).toBe(200)
    expect((await get(app, '/api/health', { host: '[::1]:4330' })).status).toBe(200)
    expect((await get(app, '/api/health', { host: 'LOCALHOST' })).status).toBe(200)
  })

  it('accepts a host added through the allowlist', async () => {
    const app = createApp(createTestDatabase(), { ...testConfig, allowedHosts: ['recipes.example'] })
    expect((await get(app, '/api/health', { host: 'recipes.example' })).status).toBe(200)
    expect((await get(app, '/api/health', { host: 'localhost' })).status).toBe(403)
  })
})

describe('same origin JSON check', () => {
  const post = (headers: Record<string, string>) =>
    createTestApp().request('http://localhost/api/recipes', {
      method: 'POST',
      body: '{}',
      headers: { host: 'localhost:4330', ...headers },
    })

  it('refuses a mutation from another origin', async () => {
    const response = await post({ origin: 'https://evil.example', 'content-type': 'application/json' })
    expect(response.status).toBe(403)
  })

  it('refuses a mutation that is not JSON', async () => {
    const response = await post({ origin: 'http://localhost:4330', 'content-type': 'application/x-www-form-urlencoded' })
    expect(response.status).toBe(415)
  })

  it('lets a same-origin JSON mutation through to the router', async () => {
    const response = await post({ origin: 'http://localhost:4330', 'content-type': 'application/json' })
    expect(response.status).toBe(404)
  })
})

describe('errors', () => {
  it('never leaks a stack trace or the failure message', async () => {
    const database = createTestDatabase()
    database.exec('DROP TABLE recipe_translations')
    const response = await get(createApp(database, testConfig), '/api/recipes/tomato-soup')
    const text = await response.text()
    expect(response.status).toBe(500)
    expect(JSON.parse(text)).toEqual({ error: 'Internal server error' })
    expect(text).not.toMatch(/recipe_translations|\bat \w/)
  })
})
