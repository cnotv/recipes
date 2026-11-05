import type { DatabaseSync, SQLInputValue } from 'node:sqlite'
import { z } from 'zod'
import { withoutRemoteImages } from './image-links.ts'
import { processRecipe } from '../scripts/recipe-metadata.ts'
import type { ProcessedRecipe, RecipeFile } from '../scripts/recipe-types.ts'
import type { CuisineCount, RecipeListQuery, RecipeStatus, RecipeSummary, StoredRecipe } from './types.ts'

const parsedJson = <Schema extends z.ZodType>(schema: Schema) => z.string().transform((text) => JSON.parse(text) as unknown).pipe(schema)

const recipeRowSchema = z.object({
  id: z.number(),
  slug: z.string(),
  source_url: z.string().nullable(),
  cuisine: z.string().nullable(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  status: z.enum(['published', 'pending', 'rejected']),
  cover_image: z.string().nullable(),
  created_at: z.string(),
})

const translationRowSchema = z.object({
  recipe_id: z.number(),
  language: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  ingredients: parsedJson(z.array(z.string())),
  steps: parsedJson(z.array(z.object({ content: z.string(), image: z.string() }))),
})

const countRowSchema = z.object({ total: z.number() })
const cuisineRowSchema = z.object({ name: z.string(), count: z.number() })

const escapeLike = (text: string): string => text.replace(/[\\%_]/g, (character) => `\\${character}`)

const placeholders = (values: unknown[]): string => values.map(() => '?').join(', ')

const withTranslations = (database: DatabaseSync, rows: z.infer<typeof recipeRowSchema>[]): StoredRecipe[] => {
  const ids = rows.map((row) => row.id)
  const translations = z
    .array(translationRowSchema)
    .parse(
      ids.length === 0
        ? []
        : database.prepare(`SELECT * FROM recipe_translations WHERE recipe_id IN (${placeholders(ids)}) ORDER BY rowid`).all(...ids),
    )
  return rows.map((row) => ({
    slug: row.slug,
    sourceUrl: row.source_url,
    cuisine: row.cuisine,
    difficulty: row.difficulty,
    status: row.status,
    coverImage: row.cover_image,
    createdAt: row.created_at,
    languages: Object.fromEntries(
      translations
        .filter((translation) => translation.recipe_id === row.id)
        .map(({ language, title, description, ingredients, steps }) => [
          language,
          { title, ingredients, steps, ...(description === null ? {} : { description }) },
        ]),
    ),
  }))
}

/** Stores a recipe and its translations in one transaction. */
export const insertRecipe = (database: DatabaseSync, recipe: StoredRecipe): void => {
  database.exec('BEGIN')
  const { lastInsertRowid } = database
    .prepare(
      'INSERT INTO recipes (slug, source_url, cuisine, difficulty, status, cover_image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    .run(recipe.slug, recipe.sourceUrl, recipe.cuisine, recipe.difficulty, recipe.status, recipe.coverImage, recipe.createdAt)
  const insertTranslation = database.prepare(
    'INSERT INTO recipe_translations (recipe_id, language, title, description, ingredients, steps) VALUES (?, ?, ?, ?, ?, ?)',
  )
  Object.entries(recipe.languages).forEach(([language, translation]) =>
    insertTranslation.run(
      lastInsertRowid,
      language,
      translation.title,
      translation.description ?? null,
      JSON.stringify(translation.ingredients),
      JSON.stringify(translation.steps),
    ),
  )
  database.exec('COMMIT')
}

export const countRecipes = (database: DatabaseSync): number =>
  countRowSchema.parse(database.prepare('SELECT COUNT(*) AS total FROM recipes').get()).total

type Clause = { sql: string; params: SQLInputValue[] }

const listClauses = (query: RecipeListQuery): Clause[] => [
  { sql: "r.status = 'published'", params: [] },
  ...(query.cuisine ? [{ sql: 'r.cuisine = ?', params: [query.cuisine] }] : []),
  ...(query.difficulty ? [{ sql: 'r.difficulty = ?', params: [query.difficulty] }] : []),
  ...(query.language
    ? [
        {
          sql: 'EXISTS (SELECT 1 FROM recipe_translations t WHERE t.recipe_id = r.id AND t.language = ?)',
          params: [query.language],
        },
      ]
    : []),
  ...(query.q
    ? [
        {
          sql: "EXISTS (SELECT 1 FROM recipe_translations t WHERE t.recipe_id = r.id AND (t.title LIKE ? ESCAPE '\\' OR t.ingredients LIKE ? ESCAPE '\\'))",
          params: [`%${escapeLike(query.q)}%`, `%${escapeLike(query.q)}%`],
        },
      ]
    : []),
]

/** One page of published recipes matching the filters, newest first, and the total across all pages. */
export const listPublishedRecipes = (
  database: DatabaseSync,
  query: RecipeListQuery,
): { recipes: StoredRecipe[]; total: number } => {
  const clauses = listClauses(query)
  const where = clauses.map((clause) => clause.sql).join(' AND ')
  const params = clauses.flatMap((clause) => clause.params)
  const total = countRowSchema.parse(database.prepare(`SELECT COUNT(*) AS total FROM recipes r WHERE ${where}`).get(...params)).total
  const rows = z
    .array(recipeRowSchema)
    .parse(
      database
        .prepare(`SELECT r.* FROM recipes r WHERE ${where} ORDER BY r.created_at DESC, r.id DESC LIMIT ? OFFSET ?`)
        .all(...params, query.pageSize, (query.page - 1) * query.pageSize),
    )
  return { recipes: withTranslations(database, rows), total }
}

/** Every published recipe, for the sitemap. */
export const listAllPublishedRecipes = (database: DatabaseSync): StoredRecipe[] =>
  withTranslations(
    database,
    z.array(recipeRowSchema).parse(database.prepare("SELECT * FROM recipes WHERE status = 'published' ORDER BY id").all()),
  )

const findPublishedBy = (database: DatabaseSync, column: 'slug' | 'source_url', value: string): StoredRecipe | undefined => {
  const row = database.prepare(`SELECT * FROM recipes WHERE ${column} = ? AND status = 'published'`).get(value)
  return row === undefined ? undefined : withTranslations(database, [recipeRowSchema.parse(row)])[0]
}

export const findPublishedRecipeBySlug = (database: DatabaseSync, slug: string): StoredRecipe | undefined =>
  findPublishedBy(database, 'slug', slug)

/** Resolves the source link of the old `/recipe/<encoded url>` addresses. */
export const findPublishedRecipeBySourceUrl = (database: DatabaseSync, sourceUrl: string): StoredRecipe | undefined =>
  findPublishedBy(database, 'source_url', sourceUrl)

export const listCuisines = (database: DatabaseSync): CuisineCount[] =>
  z
    .array(cuisineRowSchema)
    .parse(
      database
        .prepare(
          "SELECT cuisine AS name, COUNT(*) AS count FROM recipes WHERE status = 'published' AND cuisine IS NOT NULL GROUP BY cuisine ORDER BY cuisine",
        )
        .all(),
    )

/** The shape the metadata helpers in `scripts/` read. */
export const toRecipeFile = (stored: StoredRecipe): RecipeFile => {
  const recipe = withoutRemoteImages(stored)
  return {
    url: recipe.sourceUrl ?? undefined,
    cuisine: recipe.cuisine ?? undefined,
    cover: recipe.coverImage ?? undefined,
    dateAdded: recipe.createdAt,
    languages: recipe.languages,
  }
}

/** Derived metadata keyed by the stored slug, which stays unique where a title-made slug may not. */
export const toProcessedRecipe = (recipe: StoredRecipe, now: Date): ProcessedRecipe => {
  const processed = processRecipe(toRecipeFile(recipe), `${recipe.slug}.json`, now)
  return { ...processed, metadata: { ...processed.metadata, id: recipe.slug, slug: recipe.slug } }
}

export const toRecipeSummary = (recipe: StoredRecipe, now: Date): RecipeSummary => {
  const metadata = toProcessedRecipe(recipe, now).metadata
  return {
    id: metadata.id,
    slug: metadata.slug,
    url: metadata.url,
    cuisine: metadata.cuisine,
    languages: metadata.languages,
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    stepCount: metadata.stepCount,
    ingredientCount: metadata.ingredientCount,
    estimatedTime: metadata.estimatedTime,
    difficulty: metadata.difficulty,
    ingredientPreview: metadata.ingredientPreview,
    images: metadata.images,
    featuredImage: metadata.featuredImage,
    dateAdded: metadata.dateAdded,
    lastModified: metadata.lastModified,
    tags: metadata.tags,
  }
}

/** The recipe in the shape the detail page reads: every translation, steps with image and text. */
export const toRecipeDetail = (stored: StoredRecipe) => {
  const recipe = withoutRemoteImages(stored)
  return {
    slug: recipe.slug,
    url: recipe.sourceUrl ?? '',
    cuisine: recipe.cuisine ?? '',
    difficulty: recipe.difficulty,
    ...(recipe.coverImage === null ? {} : { cover: recipe.coverImage }),
    languages: recipe.languages,
  }
}

/** A recipe of any status by its row id, for the admin preview. */
export const findRecipeById = (database: DatabaseSync, id: number): StoredRecipe | undefined => {
  const row = database.prepare('SELECT * FROM recipes WHERE id = ?').get(id)
  return row === undefined ? undefined : withTranslations(database, [recipeRowSchema.parse(row)])[0]
}

/** Stores a recipe and returns its row id, so a submission can point at it. */
export const insertRecipeReturningId = (database: DatabaseSync, recipe: StoredRecipe): number => {
  insertRecipe(database, recipe)
  return z.object({ id: z.number() }).parse(database.prepare('SELECT id FROM recipes WHERE slug = ?').get(recipe.slug)).id
}

/** Writes the cover and the step pictures of a recipe, after they were stored locally. */
export const replaceRecipeImages = (database: DatabaseSync, recipe: StoredRecipe, slug: string): void => {
  database.exec('BEGIN')
  database.prepare('UPDATE recipes SET cover_image = ? WHERE slug = ?').run(recipe.coverImage, slug)
  const update = database.prepare(
    'UPDATE recipe_translations SET steps = ? WHERE language = ? AND recipe_id = (SELECT id FROM recipes WHERE slug = ?)',
  )
  Object.entries(recipe.languages).forEach(([language, translation]) => update.run(JSON.stringify(translation.steps), language, slug))
  database.exec('COMMIT')
}

export const setRecipeStatus = (database: DatabaseSync, id: number, status: RecipeStatus): void => {
  database.prepare('UPDATE recipes SET status = ? WHERE id = ?').run(status, id)
}

export const recipeSlugExists = (database: DatabaseSync, slug: string): boolean =>
  database.prepare('SELECT 1 FROM recipes WHERE slug = ?').get(slug) !== undefined

/** Every source link in the collection, whatever the recipe's status, for the duplicate check. */
export const listSourceUrls = (database: DatabaseSync): string[] =>
  z
    .array(z.object({ source_url: z.string() }))
    .parse(database.prepare('SELECT source_url FROM recipes WHERE source_url IS NOT NULL').all())
    .map((row) => row.source_url)
