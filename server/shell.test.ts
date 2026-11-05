import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createApp } from './app.ts'
import { createTestDatabase, get, testConfig } from './test-support.ts'

const directory = mkdtempSync(join(tmpdir(), 'recipes-shell-'))
writeFileSync(join(directory, 'index.html'), '<!doctype html><html lang="en"><head><!--head--></head><body><div id="app"></div></body></html>')
const app = createApp(createTestDatabase(), { ...testConfig, staticDirectory: directory })

describe('the app shell', () => {
  it('gives the home page its own head', async () => {
    const response = await get(app, '/')
    const html = await response.text()
    expect(response.status).toBe(200)
    expect(html).toContain('<title data-head>Recipe Collection: international recipes in four languages</title>')
    expect(html).toContain('rel="canonical" href="https://recipes.test/"')
    expect(html).toContain('"@type":"WebSite"')
  })

  it('puts a Recipe in the JSON-LD of a recipe page and honours the language', async () => {
    const html = await (await get(app, '/recipe/tomato-soup?lang=de')).text()
    expect(html).toContain('<html lang="de"')
    expect(html).toContain('<title data-head>Tomatensuppe | Rezeptsammlung</title>')
    expect(html).toContain('"@type":"Recipe"')
    expect(html).toContain('href="https://recipes.test/recipe/tomato-soup?lang=de"')
  })

  it('answers 404 with a noindex head for an unknown recipe, an unknown path and a draft', async () => {
    await Promise.all(
      ['/recipe/not-a-recipe', '/no/such/page', '/recipe/draft-soup'].map(async (path) => {
        const response = await get(app, path)
        expect(response.status).toBe(404)
        expect(await response.text()).toContain('content="noindex, nofollow"')
      }),
    )
  })

  it('serves robots.txt with the sitemap address', async () => {
    const text = await (await get(app, '/robots.txt')).text()
    expect(text).toContain('Sitemap: https://recipes.test/sitemap.xml')
  })

  it('lists the legal pages in the sitemap', async () => {
    const xml = await (await get(app, '/sitemap.xml')).text()
    expect(xml).toContain('https://recipes.test/impressum')
    expect(xml).toContain('https://recipes.test/datenschutz')
  })
})
