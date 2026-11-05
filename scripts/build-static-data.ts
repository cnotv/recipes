import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { openDatabase } from '../server/database.ts'
import { listAllPublishedRecipes, listCuisines, toProcessedRecipe, toRecipeDetail, toRecipeSummary } from '../server/recipes.ts'
import { seedRecipes } from '../server/seed.ts'
import { buildSitemap } from './recipe-metadata.ts'

// ponytail: Netlify previews only, delete with netlify.toml once the cloud deploy (#9) is the live site.
// Writes the API's responses as files into the build output so the UI can run without a server.
const outputDirectory = process.argv[2] ?? 'dist'
const siteUrl = process.env.URL ?? 'https://cnotv-recipes.netlify.app'
const apiDirectory = join(outputDirectory, 'static-api')

const database = openDatabase(':memory:')
seedRecipes(database, join(import.meta.dirname, '..', 'server', 'seed', 'recipes'))
const recipes = listAllPublishedRecipes(database)
const now = new Date()
const writeJson = (path: string, data: unknown) => writeFile(path, JSON.stringify(data))

await mkdir(join(apiDirectory, 'recipes'), { recursive: true })
await Promise.all([
  writeJson(join(apiDirectory, 'recipes.json'), recipes.map((recipe) => toRecipeSummary(recipe, now))),
  writeJson(join(apiDirectory, 'cuisines.json'), listCuisines(database)),
  writeFile(
    join(outputDirectory, 'sitemap.xml'),
    buildSitemap(recipes.map((recipe) => toProcessedRecipe(recipe, now)), siteUrl, now.toISOString().split('T')[0]),
  ),
  ...recipes.map((recipe) => writeJson(join(apiDirectory, 'recipes', `${recipe.slug}.json`), toRecipeDetail(recipe))),
])
console.log(`Wrote ${recipes.length} recipes to ${apiDirectory}`)
