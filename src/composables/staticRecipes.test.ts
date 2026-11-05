import { describe, expect, it } from 'vitest'
import { listStaticRecipes, resolveStaticSlug } from './staticRecipes'
import type { RecipeMetadata } from './useRecipes'

const recipe = (overrides: Partial<RecipeMetadata>): RecipeMetadata => ({
  id: 'x', slug: 'x', languages: ['en'], title: 'X', description: '', keywords: '', stepCount: 1, ingredientCount: 1,
  estimatedTime: 15, difficulty: 'Easy', ingredientPreview: [], images: [], featuredImage: null, dateAdded: '', lastModified: '', tags: [],
  ...overrides,
})

const soup = recipe({ slug: 'tomato-soup', title: 'Tomato Soup', cuisine: 'Italian', languages: ['en', 'de'], url: 'https://example.com/soup/' })
const curry = recipe({ slug: 'chickpea-curry', title: 'Chickpea Curry', cuisine: 'Indian', difficulty: 'Medium', ingredientPreview: ['coconut milk'] })
const all = [soup, curry]
const slugs = (query: Partial<Parameters<typeof listStaticRecipes>[1]>) =>
  listStaticRecipes(all, { page: 1, pageSize: 12, ...query }).items.map((item) => item.slug)

describe('static recipe source', () => {
  it('filters by cuisine, difficulty, language and text', () => {
    expect(slugs({ cuisine: 'Indian' })).toEqual(['chickpea-curry'])
    expect(slugs({ difficulty: 'Easy' })).toEqual(['tomato-soup'])
    expect(slugs({ language: 'de' })).toEqual(['tomato-soup'])
    expect(slugs({ q: 'COCONUT' })).toEqual(['chickpea-curry'])
  })

  it('paginates and reports the total across pages', () => {
    expect(listStaticRecipes(all, { page: 2, pageSize: 1 })).toEqual({ items: [curry], total: 2 })
  })

  it('resolves an old source URL link to the slug and leaves a slug alone', () => {
    expect(resolveStaticSlug(all, 'https://example.com/soup/')).toBe('tomato-soup')
    expect(resolveStaticSlug(all, 'tomato-soup')).toBe('tomato-soup')
    expect(resolveStaticSlug(all, 'https://example.com/unknown')).toBe('https://example.com/unknown')
  })
})
