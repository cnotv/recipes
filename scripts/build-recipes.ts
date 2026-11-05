import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { recipeFileSchema, recipeIndexSchema } from './recipe-schema.ts'
import {
  buildSeoData,
  buildSitemap,
  countLanguages,
  groupByCuisine,
  groupByDifficulty,
  processRecipe,
} from './recipe-metadata.ts'

const SUPPORTED_LANGUAGES = ['en', 'de', 'jp', 'th']
// Placeholder until the real domain is known (#9).
const SITE_URL = 'https://your-domain.com'

const root = join(import.meta.dirname, '..', 'public')
const recipesDirectory = join(root, 'recipes')
const staticDataDirectory = join(root, 'static-data')

const readJson = async (path: string): Promise<unknown> => JSON.parse(await readFile(path, 'utf8'))
const writeJson = (path: string, data: unknown) => writeFile(path, JSON.stringify(data, null, 2))

const now = new Date()
const filenames = recipeIndexSchema.parse(await readJson(join(recipesDirectory, 'index.json')))
console.log(`Processing ${filenames.length} recipes`)

const loaded = await Promise.all(
  filenames.map(async (filename) => {
    const parsed = recipeFileSchema.safeParse(await readJson(join(recipesDirectory, filename)))
    if (!parsed.success) console.warn(`Skipping ${filename}: ${parsed.error.message}`)
    return parsed.success ? [processRecipe(parsed.data, filename, now)] : []
  }),
)
const recipes = loaded.flat()

await Promise.all(['recipes', 'seo'].map((name) => mkdir(join(staticDataDirectory, name), { recursive: true })))

await Promise.all([
  writeJson(join(staticDataDirectory, 'recipes-index.json'), {
    recipes: recipes.map(({ metadata }) => metadata),
    totalCount: recipes.length,
    buildTime: now.toISOString(),
  }),
  writeJson(join(staticDataDirectory, 'recipes-by-cuisine.json'), groupByCuisine(recipes)),
  writeJson(join(staticDataDirectory, 'recipes-by-difficulty.json'), groupByDifficulty(recipes)),
  writeJson(join(staticDataDirectory, 'language-stats.json'), countLanguages(recipes, SUPPORTED_LANGUAGES)),
  writeJson(
    join(staticDataDirectory, 'search-index.json'),
    recipes.map(({ recipe, metadata }) => ({
      id: metadata.id,
      title: metadata.title,
      cuisine: recipe.cuisine,
      searchText: metadata.searchText,
      tags: metadata.tags,
    })),
  ),
  ...recipes.flatMap((processed) => [
    writeJson(join(staticDataDirectory, 'recipes', `${processed.metadata.id}-meta.json`), processed.metadata),
    writeJson(join(staticDataDirectory, 'seo', `${processed.metadata.id}.json`), buildSeoData(processed)),
  ]),
  writeFile(join(root, 'sitemap.xml'), buildSitemap(recipes, SITE_URL, now.toISOString().split('T')[0])),
])

console.log(`Built ${recipes.length} recipes`)
