import type { Recipe } from '../types/Recipe'
import { listStaticRecipes, loadStaticIndex, resolveStaticSlug } from './staticRecipes'

/** One card of `GET /api/recipes`. */
export interface RecipeMetadata {
  id: string
  slug: string
  url?: string
  cuisine?: string
  languages: string[]
  title: string
  description: string
  keywords: string
  stepCount: number
  ingredientCount: number
  estimatedTime: number
  difficulty: string
  ingredientPreview: string[]
  images: Array<{ url: string; alt: string; step: number }>
  featuredImage: string | null
  dateAdded: string
  lastModified: string
  tags: string[]
}

interface RecipePage {
  items: RecipeMetadata[]
  total: number
}

// The largest page the API allows.
const PAGE_SIZE = 100

const fetchJson = async <Body>(path: string): Promise<Body> => {
  const response = await fetch(path)
  if (!response.ok) throw new Error(`Request to ${path} failed with ${response.status}`)
  return response.json()
}

// Chosen once at build time: the API, or the JSON files of the Netlify preview build.
const useStaticSource = import.meta.env.VITE_DATA_SOURCE === 'static'

const fetchRecipePage = async (page: number): Promise<RecipePage> =>
  useStaticSource
    ? listStaticRecipes(await loadStaticIndex(), { page, pageSize: PAGE_SIZE })
    : fetchJson<RecipePage>(`/api/recipes?pageSize=${PAGE_SIZE}&page=${page}`)

const fetchRecipePages = async (page: number): Promise<RecipeMetadata[]> => {
  const { items, total } = await fetchRecipePage(page)
  return page * PAGE_SIZE >= total ? items : [...items, ...(await fetchRecipePages(page + 1))]
}

/** Recipes come from the server's SQLite database through `/api`. */
export function useRecipes() {
  /** Every published recipe, page after page. */
  const loadRecipeIndex = (): Promise<RecipeMetadata[]> => fetchRecipePages(1)

  /** One recipe with all its translations, or undefined when the slug is unknown. */
  const loadRecipe = async (slug: string): Promise<Recipe | undefined> => {
    const index = useStaticSource ? await loadStaticIndex() : []
    const resolved = resolveStaticSlug(index, slug)
    // Netlify answers a missing file with the app shell, so unknown slugs are ruled out first.
    if (useStaticSource && !index.some((recipe) => recipe.slug === resolved)) return undefined
    const response = await fetch(
      useStaticSource ? `/static-api/recipes/${encodeURIComponent(resolved)}.json` : `/api/recipes/${encodeURIComponent(resolved)}`,
    )
    if (response.status === 404) return undefined
    if (!response.ok) throw new Error(`Failed to load recipe ${slug}`)
    return response.json()
  }

  return { loadRecipeIndex, loadRecipe }
}
