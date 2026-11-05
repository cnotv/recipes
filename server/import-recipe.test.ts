import { describe, expect, it } from 'vitest'
import { detectSourceLanguage, extractJsonLdRecipe, htmlToText, normalizeUrl } from './import-recipe.ts'

const page = (jsonLd: unknown, lang = 'en') =>
  `<html lang="${lang}"><head><script type="application/ld+json">${JSON.stringify(jsonLd)}</script></head><body></body></html>`

const recipeNode = {
  '@type': 'Recipe',
  name: 'Tomato Soup &amp; Bread',
  description: 'Warm <b>and</b> simple.',
  recipeIngredient: ['4 tomatoes', ' salt '],
  recipeInstructions: [{ '@type': 'HowToStep', text: 'Chop.' }, { '@type': 'HowToStep', text: 'Simmer.' }],
  recipeCuisine: ['Italian'],
  image: { '@type': 'ImageObject', url: 'https://example.com/soup.jpg' },
}

describe('extractJsonLdRecipe', () => {
  it('reads a plain Recipe node', () => {
    expect(extractJsonLdRecipe(page(recipeNode))).toEqual({
      title: 'Tomato Soup & Bread',
      description: 'Warm and simple.',
      ingredients: ['4 tomatoes', 'salt'],
      steps: ['Chop.', 'Simmer.'],
      cuisine: 'Italian',
      difficulty: 'Easy',
      coverImage: 'https://example.com/soup.jpg',
    })
  })

  it('finds a Recipe inside an @graph and a type list', () => {
    const graph = { '@graph': [{ '@type': 'WebSite' }, { ...recipeNode, '@type': ['Recipe', 'Thing'] }] }
    expect(extractJsonLdRecipe(page(graph))?.title).toBe('Tomato Soup & Bread')
  })

  it('reads sectioned instructions and plain string instructions', () => {
    const sectioned = {
      ...recipeNode,
      recipeInstructions: [{ '@type': 'HowToSection', itemListElement: [{ '@type': 'HowToStep', text: 'A' }, { text: 'B' }] }],
    }
    expect(extractJsonLdRecipe(page(sectioned))?.steps).toEqual(['A', 'B'])
    expect(extractJsonLdRecipe(page({ ...recipeNode, recipeInstructions: 'Mix.\nBake.' }))?.steps).toEqual(['Mix.', 'Bake.'])
  })

  it('ignores a non http cover image', () => {
    expect(extractJsonLdRecipe(page({ ...recipeNode, image: 'javascript:alert(1)' }))?.coverImage).toBeUndefined()
  })

  it('skips broken JSON blocks and returns undefined without a Recipe', () => {
    expect(extractJsonLdRecipe('<script type="application/ld+json">{nope</script>')).toBeUndefined()
    expect(extractJsonLdRecipe(page({ '@type': 'Article', name: 'x' }))).toBeUndefined()
    expect(extractJsonLdRecipe('<p>plain</p>')).toBeUndefined()
  })

  it('refuses a Recipe without ingredients or steps rather than storing half of it', () => {
    expect(extractJsonLdRecipe(page({ ...recipeNode, recipeIngredient: [] }))).toBeUndefined()
    expect(extractJsonLdRecipe(page({ ...recipeNode, recipeInstructions: [] }))).toBeUndefined()
  })
})

describe('htmlToText', () => {
  it('drops scripts, styles and tags and collapses white space', () => {
    expect(htmlToText('<style>a{}</style><script>evil()</script><h1>Soup</h1>\n<p>Add   salt &amp; stir.</p>', 1000)).toBe(
      'Soup Add salt & stir.',
    )
  })

  it('truncates to the limit', () => {
    expect(htmlToText(`<p>${'a'.repeat(50)}</p>`, 10)).toHaveLength(10)
  })
})

describe('detectSourceLanguage', () => {
  it.each([
    ['<html lang="de-DE">', 'de'],
    ['<html lang="ja">', 'jp'],
    ['<html lang="th">', 'th'],
    ['<html lang="it">', 'en'],
    ['<html>', 'en'],
  ])('maps %s to %s', (html, expected) => {
    expect(detectSourceLanguage(html)).toBe(expected)
  })
})

describe('normalizeUrl', () => {
  it('treats scheme case, default ports, fragments, trailing slashes, tracking and query order as the same link', () => {
    const expected = normalizeUrl('https://example.com/recipe?a=1&b=2')
    expect(normalizeUrl('HTTPS://Example.com:443/recipe/?b=2&a=1#top')).toBe(expected)
    expect(normalizeUrl('https://example.com/recipe?utm_source=x&a=1&b=2&fbclid=z')).toBe(expected)
  })

  it('keeps different paths apart and the root slash', () => {
    expect(normalizeUrl('https://example.com/a')).not.toBe(normalizeUrl('https://example.com/b'))
    expect(normalizeUrl('https://example.com')).toBe('https://example.com/')
  })
})
