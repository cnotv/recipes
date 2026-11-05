import { randomUUID } from 'node:crypto'
import type { DatabaseSync } from 'node:sqlite'
import { z } from 'zod'
import { detectSourceLanguage, extractJsonLdRecipe, htmlToText } from './import-recipe.ts'
import { extractRecipeWithModel, translateRecipe } from './model-recipe.ts'
import { insertRecipeReturningId, recipeSlugExists, setRecipeStatus } from './recipes.ts'
import type { ImportedRecipe, SourceLanguage, SubmissionContext, SubmissionRow, SubmissionStatus } from './submission-types.ts'
import type { StoredRecipe, StoredTranslation } from './types.ts'
import { userError, userMessage } from './user-error.ts'

const MODEL_PAGE_TEXT_LIMIT = 30_000
const UNFINISHED: SubmissionStatus[] = ['queued', 'importing', 'translating']

const statusSchema = z.enum(['queued', 'importing', 'translating', 'pending', 'published', 'rejected', 'failed'])

const rowSchema = z
  .object({
    id: z.string(),
    url: z.string(),
    normalized_url: z.string(),
    status: statusSchema,
    reason: z.string().nullable(),
    translated: z.number(),
    recipe_id: z.number().nullable(),
  })
  .transform(
    (row): SubmissionRow => ({
      id: row.id,
      url: row.url,
      normalizedUrl: row.normalized_url,
      status: row.status,
      reason: row.reason,
      translated: row.translated === 1,
      recipeId: row.recipe_id,
    }),
  )

const parseRow = (row: unknown): SubmissionRow | undefined => (row === undefined ? undefined : rowSchema.parse(row))

export const findSubmission = (database: DatabaseSync, id: string): SubmissionRow | undefined =>
  parseRow(database.prepare('SELECT * FROM submissions WHERE id = ?').get(id))

export const findSubmissionByUrl = (database: DatabaseSync, normalizedUrl: string): SubmissionRow | undefined =>
  parseRow(database.prepare('SELECT * FROM submissions WHERE normalized_url = ?').get(normalizedUrl))

export const listSubmissionsWithStatus = (database: DatabaseSync, status: SubmissionStatus): SubmissionRow[] =>
  z
    .array(rowSchema)
    .parse(database.prepare('SELECT * FROM submissions WHERE status = ? ORDER BY created_at, rowid').all(status))

type Patch = { status: SubmissionStatus; reason?: string | null; translated?: boolean; recipeId?: number | null }

const updateSubmission = (context: SubmissionContext, id: string, patch: Patch): void => {
  context.database
    .prepare(
      'UPDATE submissions SET status = ?, reason = ?, translated = COALESCE(?, translated), recipe_id = COALESCE(?, recipe_id), updated_at = ? WHERE id = ?',
    )
    .run(
      patch.status,
      patch.reason ?? null,
      patch.translated === undefined ? null : Number(patch.translated),
      patch.recipeId ?? null,
      context.services.now().toISOString(),
      id,
    )
}

/** Stores a new row in the queue, or re-queues a failed one for the same link. */
export const queueSubmission = (context: SubmissionContext, url: string, normalizedUrl: string): SubmissionRow => {
  const existing = findSubmissionByUrl(context.database, normalizedUrl)
  const id = existing?.id ?? randomUUID()
  const stamp = context.services.now().toISOString()
  if (existing === undefined) {
    context.database
      .prepare("INSERT INTO submissions (id, url, normalized_url, status, created_at, updated_at) VALUES (?, ?, ?, 'queued', ?, ?)")
      .run(id, url, normalizedUrl, stamp, stamp)
  } else {
    updateSubmission(context, id, { status: 'queued' })
  }
  context.services.queue.enqueue(() => runSubmission(context, id))
  return { id, url, normalizedUrl, status: 'queued', reason: null, translated: false, recipeId: null }
}

/** After a restart, queue again whatever had not finished. */
export const resumeUnfinishedSubmissions = (context: SubmissionContext): void =>
  UNFINISHED.flatMap((status) => listSubmissionsWithStatus(context.database, status)).forEach((row) =>
    context.services.queue.enqueue(() => runSubmission(context, row.id)),
  )

const slugify = (title: string): string =>
  title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

const uniqueSlug = (database: DatabaseSync, title: string, id: string): string => {
  const base = slugify(title) || 'recipe'
  return recipeSlugExists(database, base) ? `${base}-${id.slice(0, 8)}` : base
}

const withReason = async <Value>(fallback: string, work: () => Promise<Value>): Promise<Value> =>
  work().catch((error: unknown) => {
    throw userError(userMessage(error, fallback))
  })

const toSingleLanguage = (imported: ImportedRecipe, language: SourceLanguage): Record<string, StoredTranslation> => ({
  [language]: {
    title: imported.title,
    ...(imported.description === undefined ? {} : { description: imported.description }),
    ingredients: imported.ingredients,
    steps: imported.steps.map((content) => ({ content, image: '' })),
  },
})

const readRecipe = async ({ services }: SubmissionContext, html: string): Promise<ImportedRecipe> => {
  const fromJsonLd = extractJsonLdRecipe(html)
  if (fromJsonLd !== undefined) return fromJsonLd
  const { callModel } = services
  if (callModel === undefined) throw userError('The page has no recipe data and reading it with a language model is not set up')
  return withReason('The recipe could not be read from the page', () => extractRecipeWithModel(callModel, htmlToText(html, MODEL_PAGE_TEXT_LIMIT)))
}

const importSubmission = async (context: SubmissionContext, row: SubmissionRow): Promise<void> => {
  const page = await withReason('The page could not be fetched', () => context.services.fetchPage(row.url))
  const imported = await readRecipe(context, page.body)
  const sourceLanguage = detectSourceLanguage(page.body)
  updateSubmission(context, row.id, { status: 'translating' })
  const { callModel } = context.services
  const translations =
    callModel === undefined ? undefined : await withReason('The recipe could not be translated', () => translateRecipe(callModel, imported, sourceLanguage))
  const languages = translations ?? toSingleLanguage(imported, sourceLanguage)
  const recipe: StoredRecipe = {
    slug: uniqueSlug(context.database, translations?.en.title ?? imported.title, row.id),
    sourceUrl: row.normalizedUrl,
    cuisine: imported.cuisine ?? null,
    difficulty: imported.difficulty,
    status: 'pending',
    coverImage: imported.coverImage ?? null,
    createdAt: context.services.now().toISOString(),
    languages,
  }
  const recipeId = insertRecipeReturningId(context.database, recipe)
  updateSubmission(context, row.id, { status: 'pending', translated: translations !== undefined, recipeId })
}

/** The background job: fetch, read, translate, store as pending; any failure ends as a stored reason. */
export const runSubmission = async (context: SubmissionContext, id: string): Promise<void> => {
  const row = findSubmission(context.database, id)
  if (row === undefined || !UNFINISHED.includes(row.status)) return
  updateSubmission(context, id, { status: 'importing' })
  await importSubmission(context, row).catch((error: unknown) =>
    updateSubmission(context, id, { status: 'failed', reason: userMessage(error, 'The import failed') }),
  )
}

/** Approve publishes the recipe; reject keeps the rows so the same link is not imported again. */
export const decideSubmission = (context: SubmissionContext, row: SubmissionRow, decision: 'published' | 'rejected'): void => {
  if (row.recipeId !== null) setRecipeStatus(context.database, row.recipeId, decision)
  updateSubmission(context, row.id, { status: decision })
}
