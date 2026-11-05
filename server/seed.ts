import { readdirSync, readFileSync } from 'node:fs'
import type { DatabaseSync } from 'node:sqlite'
import { join } from 'node:path'
import { z } from 'zod'
import { recipeFileSchema } from '../scripts/recipe-schema.ts'
import { estimateDifficulty, generateSlug, primaryLanguage } from '../scripts/recipe-metadata.ts'
import type { RecipeFile } from '../scripts/recipe-types.ts'
import { countRecipes, insertRecipe } from './recipes.ts'
import type { StoredRecipe, StoredTranslation } from './types.ts'

// Most files hold one recipe; one holds an array of `{ title, output }` wrappers.
const seedFileSchema = z.union([recipeFileSchema, z.array(z.object({ output: recipeFileSchema }))])

const recipesInFile = (content: unknown): RecipeFile[] => {
  const parsed = seedFileSchema.parse(content)
  return Array.isArray(parsed) ? parsed.map((wrapper) => wrapper.output) : [parsed]
}

const normalizedTranslations = (recipe: RecipeFile): Record<string, StoredTranslation> =>
  Object.fromEntries(
    Object.entries(recipe.languages ?? {}).flatMap(([language, text]) =>
      text.title
        ? [
            [
              language,
              {
                title: text.title,
                ...(text.description ? { description: text.description } : {}),
                ingredients: text.ingredients ?? [],
                steps: (text.steps ?? []).map((step) =>
                  typeof step === 'string' ? { content: step, image: '' } : { content: step.content ?? '', image: step.image ?? '' },
                ),
              },
            ],
          ]
        : [],
    ),
  )

const uniqueSlug = (base: string, taken: ReadonlySet<string>, suffix = 1): string => {
  const candidate = suffix === 1 ? base : `${base}-${suffix}`
  return taken.has(candidate) ? uniqueSlug(base, taken, suffix + 1) : candidate
}

const toStoredRecipes = (recipes: RecipeFile[], now: Date): StoredRecipe[] =>
  recipes
    .map((recipe) => ({ recipe, languages: normalizedTranslations(recipe) }))
    .filter(({ languages }) => Object.keys(languages).length > 0)
    .reduce<StoredRecipe[]>((stored, { recipe, languages }) => {
      const taken = new Set(stored.map((existing) => existing.slug))
      const difficultyText = primaryLanguage({ languages })
      return [
        ...stored,
        {
          slug: uniqueSlug(generateSlug({ languages }) || 'recipe', taken),
          sourceUrl: recipe.url ?? null,
          cuisine: recipe.cuisine ?? null,
          difficulty: estimateDifficulty(difficultyText),
          status: 'published',
          coverImage: recipe.cover ?? null,
          createdAt: recipe.dateAdded ?? now.toISOString(),
          languages,
        },
      ]
    }, [])

/**
 * Imports every JSON file of the directory when the recipes table is empty. Running it again
 * does nothing, so the files are an import source and never a second copy to keep in step.
 */
export const seedRecipes = (database: DatabaseSync, directory: string, now = new Date()): number => {
  if (countRecipes(database) > 0) return 0
  const recipes = readdirSync(directory)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .flatMap((name) => recipesInFile(JSON.parse(readFileSync(join(directory, name), 'utf8'))))
  const stored = toStoredRecipes(recipes, now)
  stored.forEach((recipe) => insertRecipe(database, recipe))
  return stored.length
}
