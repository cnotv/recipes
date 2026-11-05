import { z } from 'zod'

const stepSchema = z.union([
  z.string(),
  z.object({ content: z.string().optional(), image: z.string().optional() }),
])

const languageSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  ingredients: z.array(z.string()).optional(),
  steps: z.array(stepSchema).optional(),
})

export const recipeFileSchema = z.object({
  url: z.string().optional(),
  cuisine: z.string().optional(),
  dateAdded: z.string().optional(),
  languages: z.record(z.string(), languageSchema).optional(),
})

export const recipeIndexSchema = z.array(z.string())
