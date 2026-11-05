import type { RecipeMetadata } from './useRecipes'

// ponytail: Netlify previews only; delete this file and the VITE_DATA_SOURCE branch in useRecipes
// with the cloud deploy (#9), when the API is the only source.

export interface StaticListQuery {
  q?: string
  cuisine?: string
  difficulty?: string
  language?: string
  page: number
  pageSize: number
}

// The static build has summaries only, so text search covers what a card shows.
const matchesText = (recipe: RecipeMetadata, text: string): boolean =>
  [recipe.title, recipe.keywords, ...recipe.ingredientPreview].some((part) => part.toLowerCase().includes(text.toLowerCase()))

/** Filters and paginates summaries the way `GET /api/recipes` does. */
export const listStaticRecipes = (recipes: RecipeMetadata[], query: StaticListQuery) => {
  const matching = recipes.filter(
    (recipe) =>
      (!query.q || matchesText(recipe, query.q)) &&
      (!query.cuisine || recipe.cuisine === query.cuisine) &&
      (!query.difficulty || recipe.difficulty === query.difficulty) &&
      (!query.language || recipe.languages.includes(query.language)),
  )
  const start = (query.page - 1) * query.pageSize
  return { items: matching.slice(start, start + query.pageSize), total: matching.length }
}

/** An old `/recipe/<encoded url>` link carries the source URL; a slug is returned as it is. */
export const resolveStaticSlug = (recipes: RecipeMetadata[], slugOrUrl: string): string =>
  /^https?:\/\//.test(slugOrUrl) ? (recipes.find((recipe) => recipe.url === slugOrUrl)?.slug ?? slugOrUrl) : slugOrUrl

export const loadStaticIndex = async (): Promise<RecipeMetadata[]> => {
  const response = await fetch('/static-api/recipes.json')
  if (!response.ok) throw new Error('Failed to load recipes')
  return response.json()
}
