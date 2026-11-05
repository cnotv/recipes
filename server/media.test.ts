import { existsSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { createApp } from './app.ts'
import { thumbnailPath, withoutRemoteImages } from './image-links.ts'
import { localImagePath, localizePublishedRecipes, localizeRecipeImages } from './media.ts'
import { findPublishedRecipeBySlug } from './recipes.ts'
import { createTestDatabase, curry, get, testConfig } from './test-support.ts'
import type { MediaStore } from './submission-types.ts'
import type { StoredRecipe } from './types.ts'

const photo = (): Promise<Buffer> => sharp({ create: { width: 2000, height: 1000, channels: 3, background: '#c33' } }).png().toBuffer()

const storeWith = async (answers: Record<string, 'gone' | 'fail' | Buffer>): Promise<MediaStore> => ({
  directory: mkdtempSync(join(tmpdir(), 'recipes-media-')),
  fetchImage: async (url) => {
    const answer = answers[url]
    if (answer === 'fail') throw new Error('connect ETIMEDOUT')
    return answer === 'gone' || answer === undefined ? undefined : answer
  },
})

const withPictures: StoredRecipe = {
  ...curry,
  coverImage: 'https://source.test/cover.jpg',
  languages: {
    en: { title: 'Curry', ingredients: [], steps: [{ content: 'a', image: 'https://source.test/one.jpg' }, { content: 'b', image: '' }] },
    de: { title: 'Curry', ingredients: [], steps: [{ content: 'a', image: 'https://source.test/one.jpg' }] },
  },
}

describe('localizeRecipeImages', () => {
  it('stores a resized webp under /media and rewrites every use of the link', async () => {
    const bytes = await photo()
    const store = await storeWith({ 'https://source.test/cover.jpg': bytes, 'https://source.test/one.jpg': bytes })
    const result = await localizeRecipeImages(store, withPictures)
    expect(result.coverImage).toBe(localImagePath('https://source.test/cover.jpg'))
    expect(result.coverImage).toMatch(/^\/media\/[0-9a-f]{32}\.webp$/)
    expect(result.languages.en.steps[0].image).toBe(result.languages.de.steps[0].image)
    expect(result.languages.en.steps[1].image).toBe('')
    const file = join(store.directory, result.coverImage?.replace('/media/', '') ?? '')
    expect(existsSync(file)).toBe(true)
    expect((await sharp(file).metadata()).width).toBe(640)
    expect((await sharp(thumbnailPath(file)).metadata()).width).toBe(400)
  })

  it('drops a picture the source no longer has or that is not an image, and keeps one that failed to download', async () => {
    const store = await storeWith({
      'https://source.test/cover.jpg': 'gone',
      'https://source.test/one.jpg': 'fail',
    })
    const result = await localizeRecipeImages(store, withPictures)
    expect(result.coverImage).toBeNull()
    expect(result.languages.en.steps[0].image).toBe('https://source.test/one.jpg')
    const notAnImage = await localizeRecipeImages(await storeWith({ 'https://source.test/cover.jpg': Buffer.from('<html>') }), withPictures)
    expect(notAnImage.coverImage).toBeNull()
  })
})

describe('localizePublishedRecipes', () => {
  it('updates the database once and leaves local pictures alone on a second run', async () => {
    const bytes = await photo()
    const database = createTestDatabase([withPictures])
    const store = await storeWith({ 'https://source.test/cover.jpg': bytes, 'https://source.test/one.jpg': bytes })
    expect(await localizePublishedRecipes(database, store)).toBe(1)
    const stored = findPublishedRecipeBySlug(database, 'chickpea-curry')
    expect(stored?.coverImage).toMatch(/^\/media\//)
    expect(stored?.languages.de.steps[0].image).toMatch(/^\/media\//)
    expect(await localizePublishedRecipes(database, store)).toBe(0)
  })
})

describe('withoutRemoteImages', () => {
  it('hides links to other sites and keeps local ones', () => {
    const result = withoutRemoteImages({ ...withPictures, languages: { en: { ...withPictures.languages.en, steps: [{ content: 'a', image: '/media/x.webp' }, { content: 'b', image: '//cdn.test/y.jpg' }] } } })
    expect(result.coverImage).toBeNull()
    expect(result.languages.en.steps.map((step) => step.image)).toEqual(['/media/x.webp', ''])
  })
})

describe('GET /media', () => {
  it('serves a stored file with a long cache and answers 404 for a missing one', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'recipes-media-'))
    await sharp({ create: { width: 4, height: 4, channels: 3, background: '#fff' } }).webp().toFile(join(directory, 'a.webp'))
    const app = createApp(createTestDatabase(), { ...testConfig, mediaDirectory: directory })
    const found = await get(app, '/media/a.webp')
    expect(found.status).toBe(200)
    expect(found.headers.get('content-type')).toBe('image/webp')
    expect(found.headers.get('cache-control')).toContain('immutable')
    expect((await get(app, '/media/missing.webp')).status).toBe(404)
  })
})
