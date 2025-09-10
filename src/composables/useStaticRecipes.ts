import { ref } from 'vue'

// Types for static data
export interface RecipeMetadata {
  id: string
  slug: string
  filename: string
  url: string
  cuisine: string
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
  searchText: string
  tags: string[]
}

export interface StaticData {
  recipes: RecipeMetadata[]
  totalCount: number
  buildTime: string
}

export interface RecipesByCuisine {
  [cuisine: string]: string[]
}

export interface RecipesByDifficulty {
  Easy: string[]
  Medium: string[]
  Hard: string[]
}

export interface LanguageStats {
  en: number
  de: number
  jp: number
  th: number
}

export interface SearchIndex {
  id: string
  title: string
  cuisine: string
  searchText: string
  tags: string[]
}

// Cache for static data
let staticDataCache: StaticData | null = null
let recipesByCuisineCache: RecipesByCuisine | null = null
let recipesByDifficultyCache: RecipesByDifficulty | null = null
let languageStatsCache: LanguageStats | null = null
let searchIndexCache: SearchIndex[] | null = null

/**
 * Composable for using pre-built static recipe data
 * This replaces client-side recipe loading with build-time generated data
 */
export function useStaticRecipes() {
  const loading = ref(false)
  const error = ref('')
  
  // Load main recipe index
  const loadRecipeIndex = async (): Promise<StaticData> => {
    if (staticDataCache) return staticDataCache
    
    try {
      loading.value = true
      const response = await fetch('/static-data/recipes-index.json')
      if (!response.ok) throw new Error('Failed to load recipe index')
      
      staticDataCache = await response.json()
      return staticDataCache!
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load recipes'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // Load recipes grouped by cuisine
  const loadRecipesByCuisine = async (): Promise<RecipesByCuisine> => {
    if (recipesByCuisineCache) return recipesByCuisineCache
    
    try {
      const response = await fetch('/static-data/recipes-by-cuisine.json')
      if (!response.ok) throw new Error('Failed to load recipes by cuisine')
      
      recipesByCuisineCache = await response.json()
      return recipesByCuisineCache!
    } catch (err) {
      console.error('Error loading recipes by cuisine:', err)
      return {}
    }
  }
  
  // Load recipes grouped by difficulty
  const loadRecipesByDifficulty = async (): Promise<RecipesByDifficulty> => {
    if (recipesByDifficultyCache) return recipesByDifficultyCache
    
    try {
      const response = await fetch('/static-data/recipes-by-difficulty.json')
      if (!response.ok) throw new Error('Failed to load recipes by difficulty')
      
      recipesByDifficultyCache = await response.json()
      return recipesByDifficultyCache!
    } catch (err) {
      console.error('Error loading recipes by difficulty:', err)
      return { Easy: [], Medium: [], Hard: [] }
    }
  }
  
  // Load language statistics
  const loadLanguageStats = async (): Promise<LanguageStats> => {
    if (languageStatsCache) return languageStatsCache
    
    try {
      const response = await fetch('/static-data/language-stats.json')
      if (!response.ok) throw new Error('Failed to load language stats')
      
      languageStatsCache = await response.json()
      return languageStatsCache!
    } catch (err) {
      console.error('Error loading language stats:', err)
      return { en: 0, de: 0, jp: 0, th: 0 }
    }
  }
  
  // Load search index
  const loadSearchIndex = async (): Promise<SearchIndex[]> => {
    if (searchIndexCache) return searchIndexCache
    
    try {
      const response = await fetch('/static-data/search-index.json')
      if (!response.ok) throw new Error('Failed to load search index')
      
      searchIndexCache = await response.json()
      return searchIndexCache!
    } catch (err) {
      console.error('Error loading search index:', err)
      return []
    }
  }
  
  // Load individual recipe metadata
  const loadRecipeMetadata = async (id: string): Promise<RecipeMetadata | null> => {
    try {
      const response = await fetch(`/static-data/recipes/${id}-meta.json`)
      if (!response.ok) return null
      
      return await response.json()
    } catch (err) {
      console.error(`Error loading metadata for recipe ${id}:`, err)
      return null
    }
  }
  
  // Load SEO data for a recipe
  const loadRecipeSEO = async (id: string) => {
    try {
      const response = await fetch(`/static-data/seo/${id}.json`)
      if (!response.ok) return null
      
      return await response.json()
    } catch (err) {
      console.error(`Error loading SEO data for recipe ${id}:`, err)
      return null
    }
  }
  
  // Search recipes using pre-built index
  const searchRecipes = async (query: string, filters?: {
    cuisine?: string
    difficulty?: string
    tags?: string[]
  }): Promise<SearchIndex[]> => {
    const searchIndex = await loadSearchIndex()
    
    if (!query.trim() && !filters) return searchIndex
    
    const queryLower = query.toLowerCase()
    
    return searchIndex.filter(recipe => {
      // Text search
      const matchesQuery = !query.trim() || 
        recipe.title.toLowerCase().includes(queryLower) ||
        recipe.searchText.includes(queryLower) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(queryLower))
      
      // Cuisine filter
      const matchesCuisine = !filters?.cuisine || recipe.cuisine === filters.cuisine
      
      // Difficulty filter (would need to be added to search index)
      const matchesDifficulty = !filters?.difficulty || recipe.tags.includes(filters.difficulty)
      
      // Tags filter
      const matchesTags = !filters?.tags?.length || 
        filters.tags.some(tag => recipe.tags.includes(tag))
      
      return matchesQuery && matchesCuisine && matchesDifficulty && matchesTags
    })
  }
  
  // Get available cuisines (computed from static data)
  const getAvailableCuisines = async (): Promise<string[]> => {
    const recipesByCuisine = await loadRecipesByCuisine()
    return Object.keys(recipesByCuisine).sort()
  }
  
  // Get available tags (computed from search index)
  const getAvailableTags = async (): Promise<string[]> => {
    const searchIndex = await loadSearchIndex()
    const allTags = searchIndex.flatMap(recipe => recipe.tags)
    return [...new Set(allTags)].sort()
  }
  
  // Get recipes for a specific cuisine
  const getRecipesByCuisine = async (cuisine: string): Promise<string[]> => {
    const recipesByCuisine = await loadRecipesByCuisine()
    return recipesByCuisine[cuisine] || []
  }
  
  // Get recipes for a specific difficulty
  const getRecipesByDifficulty = async (difficulty: 'Easy' | 'Medium' | 'Hard'): Promise<string[]> => {
    const recipesByDifficulty = await loadRecipesByDifficulty()
    return recipesByDifficulty[difficulty] || []
  }
  
  // Paginate results
  const paginateRecipes = (recipes: RecipeMetadata[] | SearchIndex[], page: number, pageSize: number) => {
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    
    return {
      items: recipes.slice(startIndex, endIndex),
      totalPages: Math.ceil(recipes.length / pageSize),
      currentPage: page,
      hasMore: endIndex < recipes.length
    }
  }
  
  return {
    // State
    loading,
    error,
    
    // Data loaders
    loadRecipeIndex,
    loadRecipesByCuisine,
    loadRecipesByDifficulty,
    loadLanguageStats,
    loadSearchIndex,
    loadRecipeMetadata,
    loadRecipeSEO,
    
    // Search and filtering
    searchRecipes,
    getAvailableCuisines,
    getAvailableTags,
    getRecipesByCuisine,
    getRecipesByDifficulty,
    
    // Utilities
    paginateRecipes
  }
}
