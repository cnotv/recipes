import { describe, expect, it } from 'vitest'
import { buildRobots, headForPath, recipeHead, renderHeadTags, renderShell, routeKind, staticPageHead } from './seo.ts'
import type { RecipeSeoInput } from './seo-types.ts'

const SITE = 'https://recipes.test'

const soup: RecipeSeoInput = {
  slug: 'tomato-soup',
  url: 'https://source.test/soup',
  cuisine: 'Italian',
  cover: '/media/cover.webp',
  createdAt: '2026-01-02T00:00:00.000Z',
  languages: {
    en: { title: 'Tomato <Soup>', ingredients: ['4 tomatoes'], steps: [{ content: 'Simmer.', image: '/media/step.webp' }, { content: 'Serve.', image: '' }] },
    de: { title: 'Tomatensuppe', ingredients: ['4 Tomaten'], steps: [{ content: 'Köcheln.', image: '' }] },
  },
}

describe('routeKind', () => {
  it.each([
    ['/', 'home'],
    ['/vote/new', 'voteNew'],
    ['/vote/abc123', 'voteSession'],
    ['/recipe/tomato-soup', 'recipe'],
    ['/impressum/', 'impressum'],
    ['/admin', 'private'],
    ['/nothing-here', 'notFound'],
    ['/recipe/', 'notFound'],
  ])('%s is %s', (path, kind) => {
    expect(routeKind(path)).toBe(kind)
  })
})

describe('recipeHead', () => {
  it('names the recipe, its canonical address, a picture on our origin and a Recipe in JSON-LD', () => {
    const head = recipeHead(soup, 'en', SITE)
    expect(head.title).toBe('Tomato <Soup> | Recipe Collection')
    expect(head.canonicalUrl).toBe(`${SITE}/recipe/tomato-soup`)
    expect(head.image).toBe(`${SITE}/media/cover.webp`)
    expect(head.jsonLd[0]).toMatchObject({
      '@type': 'Recipe',
      name: 'Tomato <Soup>',
      recipeIngredient: ['4 tomatoes'],
      isBasedOn: 'https://source.test/soup',
      image: [`${SITE}/media/cover.webp`, `${SITE}/media/step.webp`],
    })
  })

  it('lists the translations as alternates and keeps the language in the canonical address', () => {
    const head = recipeHead(soup, 'de', SITE)
    expect(head.lang).toBe('de')
    expect(head.canonicalUrl).toBe(`${SITE}/recipe/tomato-soup?lang=de`)
    expect(head.alternates.map((alternate) => alternate.lang)).toEqual(['en', 'de'])
  })

  it('falls back to a language the recipe has', () => {
    expect(recipeHead(soup, 'th', SITE).lang).toBe('en')
  })
})

describe('renderHeadTags and renderShell', () => {
  it('escapes text in attributes and keeps a closing script tag out of JSON-LD', () => {
    const head = { ...recipeHead(soup, 'en', SITE), description: 'a "quote" & more', jsonLd: [{ name: '</script><b>' }] }
    const tags = renderHeadTags(head)
    expect(tags).toContain('content="a &#34;quote&#34; &#38; more"')
    expect(tags).not.toContain('</script><b>')
    expect(tags).toContain('\\u003c/script>')
  })

  it('replaces the marker and the document language', () => {
    const html = renderShell('<html lang="en"><head><!--head--></head></html>', recipeHead(soup, 'de', SITE))
    expect(html).toContain('<html lang="de"')
    expect(html).toContain('<title data-head>Tomatensuppe | Rezeptsammlung</title>')
    expect(html).not.toContain('<!--head-->')
  })
})

describe('staticPageHead and headForPath', () => {
  it('gives every indexable page its own title and description', () => {
    const pages = ['/', '/vote/new', '/submit', '/impressum', '/datenschutz'].flatMap((path) => {
      const found = headForPath(path, 'en', SITE)
      return found ? [found.head] : []
    })
    expect(new Set(pages.map((head) => head.title)).size).toBe(5)
    expect(new Set(pages.map((head) => head.description)).size).toBe(5)
  })

  it('shows the legal pages in English for a language they do not exist in', () => {
    expect(staticPageHead('datenschutz', 'jp', SITE).lang).toBe('en')
    expect(staticPageHead('datenschutz', 'de', SITE).title).toBe('Datenschutzerklärung')
  })

  it('marks unknown and private pages noindex, and unknown ones 404', () => {
    expect(headForPath('/nope', 'en', SITE)).toMatchObject({ status: 404, head: { noindex: true } })
    expect(headForPath('/admin', 'en', SITE)).toMatchObject({ status: 200, head: { noindex: true } })
    expect(headForPath('/recipe/x', 'en', SITE)).toBeUndefined()
  })
})

describe('buildRobots', () => {
  it('points at the sitemap and keeps crawlers out of the API and admin', () => {
    const robots = buildRobots(SITE)
    expect(robots).toContain(`Sitemap: ${SITE}/sitemap.xml`)
    expect(robots).toContain('Disallow: /admin')
    expect(robots).toContain('Disallow: /api/')
  })
})
