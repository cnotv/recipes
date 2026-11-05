import type { RecipeMetadata } from '../scripts/recipe-types.ts'

export type ServerConfig = {
  host: string
  port: number
  databasePath: string
  allowedHosts: string[]
  staticDirectory: string
  siteUrl: string
}

export type RecipeStatus = 'published' | 'pending' | 'rejected'

export type RecipeDifficulty = 'Easy' | 'Medium' | 'Hard'

export type StoredStep = { content: string; image: string }

export type StoredTranslation = {
  title: string
  description?: string
  ingredients: string[]
  steps: StoredStep[]
}

/** A recipe as the database holds it, with every translation attached. */
export type StoredRecipe = {
  slug: string
  sourceUrl: string | null
  cuisine: string | null
  difficulty: RecipeDifficulty
  status: RecipeStatus
  coverImage: string | null
  createdAt: string
  languages: Record<string, StoredTranslation>
}

export type RecipeListQuery = {
  q?: string
  cuisine?: string
  difficulty?: RecipeDifficulty
  language?: string
  page: number
  pageSize: number
}

/** One card of the recipe list: the derived metadata without the file and search fields. */
export type RecipeSummary = Omit<RecipeMetadata, 'filename' | 'searchText'>

export type RecipeListResponse = {
  items: RecipeSummary[]
  page: number
  pageSize: number
  total: number
}

export type CuisineCount = { name: string; count: number }
