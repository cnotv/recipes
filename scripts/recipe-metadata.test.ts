import { describe, expect, it } from 'vitest'
import {
  estimateDifficulty,
  estimateTime,
  generateSlug,
  processRecipe,
} from './recipe-metadata.ts'
import type { RecipeFile } from './recipe-types.ts'

const now = new Date('2026-01-02T03:04:05.000Z')

const english = {
  title: 'Tomato Soup: The Best!',
  ingredients: ['4 tomatoes', 'salt'],
  steps: [{ content: 'Chop.', image: 'a.jpg' }, 'Simmer for 2 hours.'],
}

const soup: RecipeFile = {
  cuisine: 'Italian',
  languages: {
    en: english,
  },
}

describe('recipe metadata', () => {
  it('builds a slug from the English title', () => {
    expect(generateSlug(soup)).toBe('tomato-soup-the-best')
  })

  it('adds time mentioned in a step to the base estimate', () => {
    expect(estimateTime(english)).toBe(2 * 5 + 2 * 2 + 120)
  })

  it('never estimates below fifteen minutes', () => {
    expect(estimateTime({})).toBe(15)
  })

  it('rates a short recipe Easy and a long one Hard', () => {
    expect(estimateDifficulty(english)).toBe('Easy')
    expect(estimateDifficulty({ steps: Array.from({ length: 9 }, () => 'x') })).toBe('Hard')
  })

  it('collects the metadata of one recipe', () => {
    const { metadata } = processRecipe(soup, 'soup.json', now)
    expect(metadata).toMatchObject({
      id: 'soup',
      stepCount: 2,
      featuredImage: 'a.jpg',
      images: [{ url: 'a.jpg', alt: 'Step 1', step: 1 }],
      dateAdded: now.toISOString(),
    })
    expect(metadata.tags).toContain('Vegetarian')
  })
})
