import type { DatabaseSync } from 'node:sqlite'
import { z } from 'zod'
import { createApp } from './app.ts'
import { openDatabase } from './database.ts'
import { insertRecipe } from './recipes.ts'
import type { ServerConfig, StoredRecipe } from './types.ts'

export const testConfig: ServerConfig = {
  host: '127.0.0.1',
  port: 4330,
  databasePath: ':memory:',
  mediaDirectory: 'does-not-exist-media',
  allowedHosts: ['localhost', '127.0.0.1', '[::1]'],
  staticDirectory: 'does-not-exist',
  siteUrl: 'https://recipes.test',
  openRouterModel: 'test/model:free',
  trustProxy: true,
}

export const soup: StoredRecipe = {
  slug: 'tomato-soup',
  sourceUrl: 'https://example.com/tomato soup/',
  cuisine: 'Italian',
  difficulty: 'Easy',
  status: 'published',
  coverImage: null,
  createdAt: '2026-01-02T00:00:00.000Z',
  languages: {
    en: { title: 'Tomato Soup', ingredients: ['4 tomatoes', 'salt'], steps: [{ content: 'Simmer.', image: 'a.jpg' }] },
    de: { title: 'Tomatensuppe', ingredients: ['4 Tomaten', 'Salz'], steps: [{ content: 'Köcheln.', image: 'a.jpg' }] },
  },
}

export const curry: StoredRecipe = {
  slug: 'chickpea-curry',
  sourceUrl: 'https://example.com/curry',
  cuisine: 'Indian',
  difficulty: 'Medium',
  status: 'published',
  coverImage: 'https://example.com/curry.jpg',
  createdAt: '2026-01-03T00:00:00.000Z',
  languages: { en: { title: 'Chickpea Curry', ingredients: ['chickpeas', '100% coconut milk'], steps: [] } },
}

export const hiddenDraft: StoredRecipe = {
  ...soup,
  slug: 'draft-soup',
  sourceUrl: null,
  status: 'pending',
}

export const createTestDatabase = (recipes: StoredRecipe[] = [soup, curry, hiddenDraft]): DatabaseSync => {
  const database = openDatabase(':memory:')
  recipes.forEach((recipe) => insertRecipe(database, recipe))
  return database
}

export const createTestApp = (config: ServerConfig = testConfig) => createApp(createTestDatabase(), config)

export const get = (app: ReturnType<typeof createApp>, path: string, headers: Record<string, string> = {}) =>
  app.request(`http://localhost${path}`, { headers: { host: 'localhost:4330', ...headers } })

const summarySchema = z.object({ slug: z.string(), title: z.string(), languages: z.array(z.string()), difficulty: z.string() })

export const listBodySchema = z.object({
  items: z.array(summarySchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
})

export const detailBodySchema = z.object({
  slug: z.string(),
  url: z.string(),
  cuisine: z.string(),
  languages: z.record(z.string(), z.object({ steps: z.array(z.object({ content: z.string(), image: z.string() })) })),
})

export const listSlugs = async (app: ReturnType<typeof createApp>, query: string): Promise<string[]> =>
  listBodySchema.parse(await (await get(app, `/api/recipes?${query}`)).json()).items.map((item) => item.slug)
