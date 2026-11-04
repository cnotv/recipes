import type { z } from 'zod'
import type { recipeFileSchema } from './recipe-schema.ts'

export type RecipeFile = z.infer<typeof recipeFileSchema>

export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface RecipeImage {
  url: string
  alt: string
  step: number
}

export interface RecipeMetadata {
  id: string
  slug: string
  filename: string
  url?: string
  cuisine?: string
  languages: string[]
  title: string
  description: string
  keywords: string
  stepCount: number
  ingredientCount: number
  estimatedTime: number
  difficulty: Difficulty
  ingredientPreview: string[]
  images: RecipeImage[]
  featuredImage: string | null
  dateAdded: string
  lastModified: string
  searchText: string
  tags: string[]
}

export interface ProcessedRecipe {
  recipe: RecipeFile
  metadata: RecipeMetadata
}
