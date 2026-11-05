import { describe, expect, it } from 'vitest'
import { extractRecipeWithModel, translateRecipe } from './model-recipe.ts'
import type { ImportedRecipe, ModelCall } from './submission-types.ts'

const recipe: ImportedRecipe = {
  title: 'Soup',
  ingredients: ['tomato', 'salt'],
  steps: ['Chop', 'Simmer', 'Serve'],
  difficulty: 'Easy',
}

const translation = (ingredients = 2, steps = 3) => ({
  title: 'T',
  ingredients: Array.from({ length: ingredients }, (_, index) => `i${index}`),
  steps: Array.from({ length: steps }, (_, index) => `s${index}`),
})

const answering = (body: unknown): ModelCall => async () => (typeof body === 'string' ? body : JSON.stringify(body))

describe('translateRecipe', () => {
  const all = { en: translation(), de: translation(), jp: translation(), th: translation() }

  it('returns the four languages, accepting a fenced JSON answer', async () => {
    const result = await translateRecipe(answering(`\`\`\`json\n${JSON.stringify(all)}\n\`\`\``), recipe, 'en')
    expect(Object.keys(result)).toEqual(['en', 'de', 'jp', 'th'])
    expect(result.de.steps).toHaveLength(3)
  })

  it('puts the recipe text in the user message, not the system message', async () => {
    const seen: string[][] = []
    await translateRecipe(async ({ system, user }) => (seen.push([system, user]), JSON.stringify(all)), recipe, 'en')
    expect(seen[0][1]).toContain('Chop')
    expect(seen[0][0]).not.toContain('Chop')
  })

  it.each([
    ['text that is not JSON', 'Sure! Here you go.'],
    ['a missing language', { en: translation(), de: translation(), jp: translation() }],
    ['an empty title', { ...all, de: { ...translation(), title: '' } }],
    ['a different number of steps', { ...all, th: translation(2, 2) }],
    ['a different number of ingredients', { ...all, jp: translation(1, 3) }],
    ['a non string step', { ...all, en: { ...translation(), steps: [1, 2, 3] } }],
  ])('rejects %s', async (_name, body) => {
    await expect(translateRecipe(answering(body), recipe, 'en')).rejects.toThrow('translation')
  })
})

describe('extractRecipeWithModel', () => {
  const answer = { title: 'Pasta', ingredients: ['pasta'], steps: ['Boil'], cuisine: 'Italian', difficulty: 'Easy' }

  it('parses a valid recipe', async () => {
    expect(await extractRecipeWithModel(answering(answer), 'page text')).toEqual(answer)
  })

  it('fails with a reason when the page has no recipe', async () => {
    await expect(extractRecipeWithModel(answering({ error: 'no recipe' }), 'blog post')).rejects.toThrow('does not contain a recipe')
  })

  it.each([
    ['no steps', { ...answer, steps: [] }],
    ['an unknown difficulty', { ...answer, difficulty: 'Impossible' }],
    ['not JSON', 'I cannot do that'],
  ])('rejects %s', async (_name, body) => {
    await expect(extractRecipeWithModel(answering(body), 'page text')).rejects.toThrow('could not read')
  })
})
