import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import type { DatabaseSync } from 'node:sqlite'
import { listAllPublishedRecipes, replaceRecipeImages } from './recipes.ts'
import { isRemoteImage, thumbnailPath } from './image-links.ts'
import type { MediaStore } from './submission-types.ts'
import type { StoredRecipe } from './types.ts'

const MEDIA_PREFIX = '/media/'
const MAX_WIDTH = 640
const THUMBNAIL_WIDTH = 400
const WEBP_QUALITY = 70
const PARALLEL_DOWNLOADS = 6
// A decompression bomb is a small file that decodes to a huge bitmap.
const MAX_PIXELS = 40_000_000

/** The same source link always maps to the same file, so a second run finds it already stored. */
export const localImagePath = (sourceUrl: string): string =>
  `${MEDIA_PREFIX}${createHash('sha256').update(sourceUrl).digest('hex').slice(0, 32)}.webp`

const toWebp = (bytes: Buffer, width: number): Promise<Buffer> =>
  sharp(bytes, { limitInputPixels: MAX_PIXELS })
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer()

/**
 * Stores one source picture and returns its local path. An empty string means the picture is gone or
 * unreadable, so the link is dropped. A network failure throws: the link stays and a later run retries.
 */
const storeImage = async (store: MediaStore, sourceUrl: string): Promise<string> => {
  const path = localImagePath(sourceUrl)
  const fileOf = (mediaPath: string): string => join(store.directory, mediaPath.slice(MEDIA_PREFIX.length))
  if (existsSync(fileOf(path)) && existsSync(fileOf(thumbnailPath(path)))) return path
  const bytes = await store.fetchImage(sourceUrl)
  if (bytes === undefined) return ''
  const converted = await Promise.all([toWebp(bytes, MAX_WIDTH), toWebp(bytes, THUMBNAIL_WIDTH)]).catch(() => undefined)
  if (converted === undefined) return ''
  await mkdir(store.directory, { recursive: true })
  await Promise.all([writeFile(fileOf(path), converted[0]), writeFile(fileOf(thumbnailPath(path)), converted[1])])
  return path
}

const inBatches = async <Item, Result>(items: Item[], size: number, work: (item: Item) => Promise<Result>): Promise<Result[]> =>
  items.length === 0
    ? []
    : [...(await Promise.all(items.slice(0, size).map(work))), ...(await inBatches(items.slice(size), size, work))]

const imagesOf = (recipe: StoredRecipe): string[] => [
  ...(recipe.coverImage === null ? [] : [recipe.coverImage]),
  ...Object.values(recipe.languages).flatMap((translation) => translation.steps.map((step) => step.image)),
]

const remoteImagesOf = (recipe: StoredRecipe): string[] => [...new Set(imagesOf(recipe).filter(isRemoteImage))]

/** The recipe with every remote picture replaced by its stored copy, or removed when the source is gone. */
export const localizeRecipeImages = async (store: MediaStore, recipe: StoredRecipe): Promise<StoredRecipe> => {
  const sources = remoteImagesOf(recipe)
  const replacements = new Map(
    await inBatches(sources, PARALLEL_DOWNLOADS, async (source): Promise<[string, string]> => [
      source,
      await storeImage(store, source).catch(() => source),
    ]),
  )
  const replace = (image: string): string => replacements.get(image) ?? image
  return {
    ...recipe,
    coverImage: recipe.coverImage === null ? null : replace(recipe.coverImage) || null,
    languages: Object.fromEntries(
      Object.entries(recipe.languages).map(([language, translation]) => [
        language,
        { ...translation, steps: translation.steps.map((step) => ({ ...step, image: replace(step.image) })) },
      ]),
    ),
  }
}

/** Stores the pictures of one recipe in the database; returns whether anything changed. */
export const localizeStoredRecipe = async (database: DatabaseSync, store: MediaStore, recipe: StoredRecipe): Promise<boolean> => {
  if (remoteImagesOf(recipe).length === 0) return false
  replaceRecipeImages(database, await localizeRecipeImages(store, recipe), recipe.slug)
  return true
}

/** One recipe after another; the start-up pass for the seeded recipes and for any approval that missed a download. */
export const localizePublishedRecipes = async (database: DatabaseSync, store: MediaStore): Promise<number> =>
  (
    await listAllPublishedRecipes(database).reduce<Promise<boolean[]>>(
      async (done, recipe) => [...(await done), await localizeStoredRecipe(database, store, recipe)],
      Promise.resolve([]),
    )
  ).filter(Boolean).length
