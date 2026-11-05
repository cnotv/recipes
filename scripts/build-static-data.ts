import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { openDatabase } from '../server/database.ts'
import { listAllPublishedRecipes, listCuisines, toProcessedRecipe, toRecipeDetail, toRecipeSummary } from '../server/recipes.ts'
import { localizePublishedRecipes } from '../server/media.ts'
import { createImageFetcher } from '../server/safe-fetch.ts'
import { seedRecipes } from '../server/seed.ts'
import { buildSitemap } from './recipe-metadata.ts'
import { buildRobots, recipeHead, renderShell, staticPageHead } from './seo.ts'
import type { HeadModel } from './seo-types.ts'

// ponytail: Netlify previews only, delete with netlify.toml once the cloud deploy (#9) is the live site.
// Writes the API's responses as files into the build output so the UI can run without a server.
const outputDirectory = process.argv[2] ?? 'dist'
const siteUrl = process.env.URL ?? 'https://cnotv-recipes.netlify.app'
const apiDirectory = join(outputDirectory, 'static-api')

const database = openDatabase(':memory:')
seedRecipes(database, join(import.meta.dirname, '..', 'server', 'seed', 'recipes'))
// The build copies every picture into dist/media, so the preview never reaches another site.
await localizePublishedRecipes(database, { directory: join(outputDirectory, 'media'), fetchImage: createImageFetcher() })
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

// Without a server there is nothing to put a page's head into the HTML, so each page gets its own file.
const shell = await readFile(join(outputDirectory, 'index.html'), 'utf8')
const writePage = async (path: string, head: HeadModel) => {
  await mkdir(join(outputDirectory, path), { recursive: true })
  await writeFile(join(outputDirectory, path, 'index.html'), renderShell(shell, head))
}
await Promise.all([
  writeFile(join(outputDirectory, 'robots.txt'), buildRobots(siteUrl)),
  writeFile(join(outputDirectory, 'index.html'), renderShell(shell, staticPageHead('home', 'en', siteUrl))),
  ...(['voteNew', 'submit', 'impressum', 'datenschutz'] as const).map((page) =>
    writePage({ voteNew: 'vote/new', submit: 'submit', impressum: 'impressum', datenschutz: 'datenschutz' }[page], staticPageHead(page, 'en', siteUrl)),
  ),
  ...recipes.map((recipe) => writePage(join('recipe', recipe.slug), recipeHead(toRecipeDetail(recipe), 'en', siteUrl))),
])
console.log(`Wrote ${recipes.length} recipes to ${apiDirectory}`)
