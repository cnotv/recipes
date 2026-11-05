import { z } from 'zod'
import type { RecipeDifficulty } from './types.ts'
import type { ImportedRecipe, SourceLanguage } from './submission-types.ts'

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'", '#x27': "'" }
const TRACKING_PARAMETER = /^(utm_|fbclid$|gclid$|mc_|ref$)/

const decodeEntities = (text: string): string => text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (whole, name: string) => ENTITIES[name] ?? whole)

const cleanText = (text: string): string => decodeEntities(text.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()

/** Plain text of a page for the model: no scripts, styles or tags, cut to `limit` characters. */
export const htmlToText = (html: string, limit: number): string =>
  cleanText(html.replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, ' ')).slice(0, limit)

const asList = <Item>(value: Item | Item[] | undefined): Item[] => (value === undefined ? [] : Array.isArray(value) ? value : [value])

const instructionSchema: z.ZodType<string[]> = z.lazy(() =>
  z.union([
    z.string().transform((text) => text.split(/\r?\n/).map(cleanText).filter(Boolean)),
    z.array(instructionSchema).transform((parts) => parts.flat()),
    z
      .object({ text: z.string().optional(), itemListElement: z.unknown().optional() })
      .transform((node) =>
        node.itemListElement === undefined ? (node.text === undefined ? [] : [cleanText(node.text)].filter(Boolean)) : instructionSchema.parse(node.itemListElement),
      ),
  ]),
)

const imageSchema = z.union([z.string(), z.object({ url: z.string() }).transform((image) => image.url)])

const recipeNodeSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  recipeIngredient: z.array(z.string()).default([]),
  recipeInstructions: instructionSchema.default([]),
  recipeCuisine: z.union([z.string(), z.array(z.string())]).optional(),
  image: z.union([imageSchema, z.array(imageSchema)]).optional(),
})

const isHttpUrl = (value: string): boolean => /^https?:\/\//i.test(value)

/** Easy up to a short list, Hard for a long one; the pages do not state it. */
export const estimateDifficulty = (stepCount: number, ingredientCount: number): RecipeDifficulty =>
  stepCount <= 4 && ingredientCount <= 8 ? 'Easy' : stepCount <= 9 ? 'Medium' : 'Hard'

const toImportedRecipe = (node: z.infer<typeof recipeNodeSchema>): ImportedRecipe | undefined => {
  const ingredients = node.recipeIngredient.map(cleanText).filter(Boolean)
  const steps = node.recipeInstructions
  const title = cleanText(node.name)
  if (title === '' || ingredients.length === 0 || steps.length === 0) return undefined
  const cuisine = asList(node.recipeCuisine).map(cleanText).find(Boolean)
  const coverImage = asList(node.image).find(isHttpUrl)
  const description = node.description === undefined ? '' : cleanText(node.description)
  return {
    title,
    ...(description === '' ? {} : { description }),
    ingredients,
    steps,
    ...(cuisine === undefined ? {} : { cuisine }),
    difficulty: estimateDifficulty(steps.length, ingredients.length),
    ...(coverImage === undefined ? {} : { coverImage }),
  }
}

const JSON_LD_BLOCK = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text) as unknown
  } catch {
    return undefined
  }
}

const graphSchema = z.object({ '@graph': z.unknown().optional() })

const flattenNodes = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value.flatMap(flattenNodes)
  const node = graphSchema.safeParse(value)
  return node.success ? [value, ...flattenNodes(node.data['@graph'])] : []
}

const isRecipeType = (node: unknown): boolean => {
  const parsed = z.object({ '@type': z.union([z.string(), z.array(z.string())]) }).safeParse(node)
  return parsed.success && asList(parsed.data['@type']).includes('Recipe')
}

/** The first schema.org Recipe in the page's JSON-LD blocks, or undefined when there is none or it is incomplete. */
export const extractJsonLdRecipe = (html: string): ImportedRecipe | undefined =>
  [...html.matchAll(JSON_LD_BLOCK)]
    .flatMap((block) => flattenNodes(parseJson(block[1])))
    .filter(isRecipeType)
    .map((node) => recipeNodeSchema.safeParse(node))
    .flatMap((parsed) => (parsed.success ? [toImportedRecipe(parsed.data)] : []))
    .find((recipe) => recipe !== undefined)

const LANGUAGE_BY_CODE: Record<string, SourceLanguage> = { en: 'en', de: 'de', ja: 'jp', th: 'th' }

/** The site's language key for the page's `lang` attribute; other languages are filed under en until translated. */
export const detectSourceLanguage = (html: string): SourceLanguage => {
  const code = /<html[^>]*\slang=["']?([a-z]{2,3})/i.exec(html)?.[1]?.toLowerCase()
  return (code === undefined ? undefined : LANGUAGE_BY_CODE[code]) ?? 'en'
}

/** One form per link: lower case host, no fragment, default port, tracking parameters or trailing slash. */
export const normalizeUrl = (value: string): string => {
  const url = new URL(value)
  const kept = [...url.searchParams.entries()].filter(([key]) => !TRACKING_PARAMETER.test(key)).sort(([a], [b]) => a.localeCompare(b))
  const search = new URLSearchParams(kept).toString()
  const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : url.pathname
  return `${url.protocol}//${url.host}${path}${search === '' ? '' : `?${search}`}`
}
