import { readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const recipesDirectory = join(import.meta.dirname, '..', 'public', 'recipes')
const notRecipes = ['index.json', 'recipes.json']

const files = await readdir(recipesDirectory)
const recipeFiles = files.filter((file) => file.endsWith('.json') && !notRecipes.includes(file))

await writeFile(join(recipesDirectory, 'index.json'), JSON.stringify(recipeFiles, null, 2))
console.log(`Generated recipe index with ${recipeFiles.length} files`)
