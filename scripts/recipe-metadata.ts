import type { Difficulty, ProcessedRecipe, RecipeFile, RecipeImage, RecipeMetadata } from './recipe-types.ts'

type RecipeLanguage = NonNullable<RecipeFile['languages']>[string]
type RecipeStep = NonNullable<RecipeLanguage['steps']>[number]

const MIN_WORD_LENGTH = 4
const MAX_KEYWORDS = 15
const MINUTES_PER_STEP = 5
const MINUTES_PER_INGREDIENT = 2
const MIN_TOTAL_MINUTES = 15
const COMPLEX_TERMS = ['fold', 'whisk', 'braise', 'flambé', 'tempering', 'sous vide']

const stepText = (step: RecipeStep): string => (typeof step === 'string' ? step : (step.content ?? ''))

const stepImage = (step: RecipeStep): string | undefined => (typeof step === 'string' ? undefined : step.image)

/** The English text of a recipe, else its first language, else nothing. */
export const primaryLanguage = (recipe: RecipeFile): RecipeLanguage => {
  const languages = recipe.languages ?? {}
  return languages.en ?? Object.values(languages)[0] ?? {}
}

/** Lowercase, hyphen separated slug of the primary title. */
export const generateSlug = (recipe: RecipeFile): string =>
  (primaryLanguage(recipe).title ?? 'recipe')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

/** Minutes: a base per step and ingredient, plus the first time mentioned in each step. */
export const estimateTime = (language: RecipeLanguage): number => {
  const steps = language.steps ?? []
  const mentionedMinutes = steps.map((step) => {
    const match = stepText(step).match(/(\d+)\s*(minutes?|mins?|hours?|hrs?)/i)
    if (!match) return 0
    const isHours = /hour|hr/i.test(match[2])
    return Number.parseInt(match[1], 10) * (isHours ? 60 : 1)
  })
  const total =
    steps.length * MINUTES_PER_STEP +
    (language.ingredients?.length ?? 0) * MINUTES_PER_INGREDIENT +
    mentionedMinutes.reduce((sum, minutes) => sum + minutes, 0)
  return Math.max(total, MIN_TOTAL_MINUTES)
}

/** Easy, Medium or Hard from the step, ingredient and technique counts. */
export const estimateDifficulty = (language: RecipeLanguage): Difficulty => {
  const steps = language.steps?.length ?? 0
  const ingredients = language.ingredients?.length ?? 0
  const stepsText = (language.steps ?? []).map(stepText).join(' ').toLowerCase()
  const complexTechniques = COMPLEX_TERMS.filter((term) => stepsText.includes(term)).length
  if (steps > 8 || ingredients > 12 || complexTechniques > 2) return 'Hard'
  if (steps > 5 || ingredients > 8 || complexTechniques > 0) return 'Medium'
  return 'Easy'
}

/** The explicit description, else a sentence built from the counts. */
export const generateDescription = (language: RecipeLanguage): string =>
  language.description ??
  `Learn how to make ${language.title ?? 'Recipe'}. This recipe includes ${language.ingredients?.length ?? 0} ingredients and ${language.steps?.length ?? 0} detailed steps.`

const longWords = (text: string): string[] =>
  text
    .split(/\s+/)
    .filter((word) => word.length >= MIN_WORD_LENGTH)
    .map((word) => word.toLowerCase())

/** Comma separated keywords: cuisine, title and ingredient words, capped. */
export const generateKeywords = (recipe: RecipeFile, language: RecipeLanguage): string => {
  const keywords = new Set([
    ...(recipe.cuisine ? [recipe.cuisine.toLowerCase()] : []),
    ...longWords(language.title ?? ''),
    ...(language.ingredients ?? []).flatMap(longWords),
    'recipe',
    'cooking',
    'food',
  ])
  return [...keywords].slice(0, MAX_KEYWORDS).join(', ')
}

/** Every step that carries an image, numbered from 1. */
export const extractImages = (language: RecipeLanguage): RecipeImage[] =>
  (language.steps ?? []).flatMap((step, index) => {
    const url = stepImage(step)
    return url ? [{ url, alt: `Step ${index + 1}`, step: index + 1 }] : []
  })

/** All text of all languages, lowercase, for full text search. */
export const generateSearchText = (recipe: RecipeFile): string =>
  [
    ...Object.values(recipe.languages ?? {}).flatMap((language) => [
      language.title,
      language.description,
      ...(language.ingredients ?? []),
      ...(language.steps ?? []).map(stepText),
    ]),
    recipe.cuisine,
  ]
    .filter((part): part is string => Boolean(part))
    .join(' ')
    .toLowerCase()

/** Cuisine, speed, diet and difficulty tags, without duplicates. */
export const generateTags = (recipe: RecipeFile, language: RecipeLanguage): string[] => {
  const minutes = estimateTime(language)
  const ingredientText = (language.ingredients ?? []).join(' ').toLowerCase()
  const hasMeat = ['meat', 'chicken', 'beef'].some((word) => ingredientText.includes(word))
  const tags = [
    ...(recipe.cuisine ? [recipe.cuisine] : []),
    ...(minutes <= 30 ? ['Quick'] : []),
    ...(minutes <= 15 ? ['Fast'] : []),
    ...(minutes >= 120 ? ['Slow Cook'] : []),
    ...(ingredientText.includes('vegetarian') || !hasMeat ? ['Vegetarian'] : []),
    ...(ingredientText.includes('vegan') ? ['Vegan'] : []),
    ...(/gluten[- ]free/.test(ingredientText) ? ['Gluten-Free'] : []),
    estimateDifficulty(language),
  ]
  return [...new Set(tags)]
}

/** Builds the full metadata record for one recipe file. */
export const processRecipe = (recipe: RecipeFile, filename: string, now: Date): ProcessedRecipe => {
  const language = primaryLanguage(recipe)
  const images = extractImages(language)
  const metadata: RecipeMetadata = {
    id: filename.replace('.json', ''),
    slug: generateSlug(recipe),
    filename,
    url: recipe.url,
    cuisine: recipe.cuisine,
    languages: Object.keys(recipe.languages ?? {}),
    title: language.title ?? 'Unknown Recipe',
    description: generateDescription(language),
    keywords: generateKeywords(recipe, language),
    stepCount: language.steps?.length ?? 0,
    ingredientCount: language.ingredients?.length ?? 0,
    estimatedTime: estimateTime(language),
    difficulty: estimateDifficulty(language),
    ingredientPreview: (language.ingredients ?? []).slice(0, 3),
    images,
    featuredImage: (language.steps ?? []).map(stepImage)[0] ?? null,
    dateAdded: recipe.dateAdded ?? now.toISOString(),
    lastModified: now.toISOString(),
    searchText: generateSearchText(recipe),
    tags: generateTags(recipe, language),
  }
  return { recipe, metadata }
}

const sitemapEntry = (location: string, lastModified: string, frequency: string, priority: string): string => `
  <url>
    <loc>${location}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>${frequency}</changefreq>
    <priority>${priority}</priority>
  </url>`

/** The sitemap XML for the home page, the vote and submit pages, the legal pages and every recipe. */
export const buildSitemap = (recipes: ProcessedRecipe[], baseUrl: string, today: string): string =>
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[
    sitemapEntry(baseUrl, today, 'weekly', '1.0'),
    sitemapEntry(`${baseUrl}/vote/new`, today, 'weekly', '0.8'),
    sitemapEntry(`${baseUrl}/submit`, today, 'monthly', '0.5'),
    sitemapEntry(`${baseUrl}/impressum`, today, 'yearly', '0.2'),
    sitemapEntry(`${baseUrl}/datenschutz`, today, 'yearly', '0.2'),
    ...recipes.map(({ metadata }) =>
      sitemapEntry(`${baseUrl}/recipe/${metadata.slug}`, metadata.lastModified.split('T')[0], 'monthly', '0.7'),
    ),
  ].join('')}
</urlset>`
