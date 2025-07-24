import { ref, computed } from 'vue'
import type { Recipe } from '../types/Recipe'

interface RecipeIndex {
  url: string
  cuisine: string
  fileName: string
}

export function useLazyRecipes() {
  const allRecipeFiles = ref<RecipeIndex[]>([])
  const loadedRecipes = ref<Recipe[]>([])
  const loading = ref(false)
  const error = ref('')
  const loadingProgress = ref(0)

  // Load the index first to get all available recipes
  const loadRecipeIndex = async (): Promise<void> => {
    try {
      loading.value = true
      error.value = ''
      
      const indexResponse = await fetch('/recipes/index.json')
      if (!indexResponse.ok) {
        throw new Error('Failed to load recipe index')
      }
      
      const recipeFiles = await indexResponse.json()
      if (!Array.isArray(recipeFiles)) {
        throw new Error('Invalid recipe index format')
      }

      // Create index entries for each recipe file
      const indexEntries: RecipeIndex[] = []
      
      for (const fileName of recipeFiles) {
        try {
          // Load just the basic metadata without the full recipe content
          const response = await fetch(`/recipes/${fileName}`)
          if (response.ok) {
            const data = await response.json()
            if (data && data.url) {
              indexEntries.push({
                url: data.url,
                cuisine: data.cuisine || 'Unknown',
                fileName: fileName
              })
            }
          }
        } catch (err) {
          console.warn(`Failed to load metadata for ${fileName}:`, err)
        }
      }
      
      allRecipeFiles.value = indexEntries
      console.log(`Loaded index for ${indexEntries.length} recipes`)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load recipe index'
      console.error('Error loading recipe index:', err)
    } finally {
      loading.value = false
    }
  }

  // Load recipes in batches
  const loadRecipeBatch = async (startIndex: number, batchSize: number = 6): Promise<Recipe[]> => {
    const endIndex = Math.min(startIndex + batchSize, allRecipeFiles.value.length)
    const batch = allRecipeFiles.value.slice(startIndex, endIndex)
    const batchRecipes: Recipe[] = []

    for (let i = 0; i < batch.length; i++) {
      const recipeFile = batch[i]
      try {
        const response = await fetch(`/recipes/${recipeFile.fileName}`)
        if (response.ok) {
          const data = await response.json()
          if (data && data.url && data.languages) {
            batchRecipes.push({
              url: data.url,
              cuisine: data.cuisine || recipeFile.cuisine,
              languages: data.languages
            })
          }
        }
        
        // Update loading progress
        loadingProgress.value = ((startIndex + i + 1) / allRecipeFiles.value.length) * 100
      } catch (err) {
        console.warn(`Failed to load recipe ${recipeFile.fileName}:`, err)
      }
    }

    return batchRecipes
  }

  // Load initial batch of recipes
  const loadInitialRecipes = async (batchSize: number = 6): Promise<void> => {
    if (allRecipeFiles.value.length === 0) {
      await loadRecipeIndex()
    }

    if (allRecipeFiles.value.length === 0) {
      error.value = 'No recipes found'
      return
    }

    try {
      loading.value = true
      const initialBatch = await loadRecipeBatch(0, batchSize)
      loadedRecipes.value = initialBatch
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load initial recipes'
    } finally {
      loading.value = false
    }
  }

  // Load more recipes (for infinite scroll)
  const loadMoreRecipes = async (batchSize: number = 6): Promise<boolean> => {
    if (loading.value || loadedRecipes.value.length >= allRecipeFiles.value.length) {
      return false
    }

    try {
      loading.value = true
      const startIndex = loadedRecipes.value.length
      const moreBatch = await loadRecipeBatch(startIndex, batchSize)
      loadedRecipes.value.push(...moreBatch)
      
      return startIndex + batchSize < allRecipeFiles.value.length
    } catch (err) {
      console.error('Failed to load more recipes:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Computed properties
  const totalRecipeCount = computed(() => allRecipeFiles.value.length)
  const loadedRecipeCount = computed(() => loadedRecipes.value.length)
  const hasMoreRecipes = computed(() => loadedRecipeCount.value < totalRecipeCount.value)
  const isLoadingComplete = computed(() => !loading.value && loadedRecipeCount.value === totalRecipeCount.value)

  return {
    // State
    loadedRecipes,
    loading,
    error,
    loadingProgress,
    
    // Computed
    totalRecipeCount,
    loadedRecipeCount,
    hasMoreRecipes,
    isLoadingComplete,
    
    // Methods
    loadRecipeIndex,
    loadInitialRecipes,
    loadMoreRecipes
  }
}
