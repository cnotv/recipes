import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { openDatabase } from './database.ts'
import { listPublishedRecipes } from './recipes.ts'
import { seedRecipes } from './seed.ts'

const english = (title: string) => ({ en: { title, ingredients: ['salt'], steps: ['Stir.'] } })

const seedDirectory = (files: Record<string, unknown>): string => {
  const directory = mkdtempSync(join(tmpdir(), 'recipes-seed-'))
  Object.entries(files).forEach(([name, content]) => writeFileSync(join(directory, name), JSON.stringify(content)))
  return directory
}

const everything = { page: 1, pageSize: 100 }

describe('seed', () => {
  it('imports a recipe file with normalized steps and a slug', () => {
    const database = openDatabase(':memory:')
    const directory = seedDirectory({
      'soup.json': { url: 'https://example.com/soup', cuisine: 'Italian', cover: 'c.jpg', languages: english('Tomato Soup!') },
    })
    expect(seedRecipes(database, directory)).toBe(1)
    const [recipe] = listPublishedRecipes(database, everything).recipes
    expect(recipe).toMatchObject({ slug: 'tomato-soup', sourceUrl: 'https://example.com/soup', coverImage: 'c.jpg' })
    expect(recipe.languages.en.steps).toEqual([{ content: 'Stir.', image: '' }])
  })

  it('imports every element of a JSON array file, reading each recipe from its output', () => {
    const database = openDatabase(':memory:')
    const directory = seedDirectory({
      'cabbage.json': [
        { title: 'Cabbage | Blog', output: { url: 'https://example.com/a', languages: english('Cluj Cabbage') } },
        { title: 'Other | Blog', output: { url: 'https://example.com/b', languages: english('Plum Dumplings') } },
      ],
    })
    expect(seedRecipes(database, directory)).toBe(2)
    expect(listPublishedRecipes(database, everything).recipes.map((recipe) => recipe.slug).sort()).toEqual([
      'cluj-cabbage',
      'plum-dumplings',
    ])
  })

  it('keeps slugs unique when two titles collide', () => {
    const database = openDatabase(':memory:')
    const directory = seedDirectory({
      'a.json': { url: 'https://example.com/a', languages: english('Soup') },
      'b.json': { url: 'https://example.com/b', languages: english('Soup') },
    })
    seedRecipes(database, directory)
    expect(listPublishedRecipes(database, everything).recipes.map((recipe) => recipe.slug).sort()).toEqual(['soup', 'soup-2'])
  })

  it('does nothing when recipes already exist', () => {
    const database = openDatabase(':memory:')
    const directory = seedDirectory({ 'soup.json': { url: 'https://example.com/soup', languages: english('Soup') } })
    seedRecipes(database, directory)
    expect(seedRecipes(database, directory)).toBe(0)
    expect(listPublishedRecipes(database, everything).total).toBe(1)
  })

  it('imports every recipe shipped in server/seed/recipes, the array file included', () => {
    const database = openDatabase(':memory:')
    mkdirSync(join(import.meta.dirname, 'seed', 'recipes'), { recursive: true })
    const imported = seedRecipes(database, join(import.meta.dirname, 'seed', 'recipes'))
    const { recipes, total } = listPublishedRecipes(database, everything)
    expect(imported).toBe(27)
    expect(total).toBe(27)
    expect(recipes.map((recipe) => recipe.slug)).toContain('cluj-style-cabbage')
  })
})
