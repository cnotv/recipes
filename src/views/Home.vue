<template>
  <div class="home-page">
    <header class="app-header">
      <h1>{{ $t('recipeCollection') }}</h1>
      <div class="header-controls">
        <div class="language-selector">
          <label for="language">{{ $t('language') }}</label>
          <select id="language" v-model="currentLanguage">
            <option value="en">{{ $t('english') }}</option>
            <option value="de">{{ $t('german') }}</option>
            <option value="jp">{{ $t('japanese') }}</option>
            <option value="th">{{ $t('thai') }}</option>
          </select>
        </div>
        <div class="cuisine-selector">
          <label for="cuisine">{{ $t('cuisine') }}</label>
          <select id="cuisine" v-model="selectedCuisine">
            <option value="">{{ $t('allCuisines') }} ({{ recipes.length }})</option>
            <option 
              v-for="cuisine in availableCuisines" 
              :key="cuisine.name" 
              :value="cuisine.name"
            >
              {{ cuisine.name }} ({{ cuisine.count }})
            </option>
          </select>
        </div>
        <div class="recipes-info">
          {{ filteredRecipes.length }} {{ $t('recipesFound') }}
          <span v-if="recipes.length < totalRecipeCount" class="loading-progress">
            ({{ recipes.length }}/{{ totalRecipeCount }} loaded)
          </span>
        </div>
      </div>
    </header>

    <main class="main-content">
      <!-- Language detection notification -->
      <div 
        v-if="showLanguageDetectionInfo" 
        class="language-detection-banner"
        @click="showLanguageDetectionInfo = false"
      >
        <span>🌍 {{ $t('languageAutoSet', { language: getLanguageName(currentLanguage) }) }} {{ $t('languageAutoSetDescription') }}</span>
        <button class="close-btn" @click.stop="showLanguageDetectionInfo = false">×</button>
      </div>

      <div v-if="loading" class="loading">
        {{ $t('loading') }}
      </div>

      <div v-else-if="error" class="error">
        {{ error }}
      </div>

      <div v-else>
        <div v-if="totalRecipeCount === 0" class="no-recipes">
          {{ $t('noRecipesAvailable', { language: getLanguageName(currentLanguage) }) }}
        </div>

        <div v-else>
          <div class="recipes-grid">
            <!-- Display loaded recipes -->
            <RecipeCard
              v-for="recipe in displayedRecipes"
              :key="recipe.url"
              :recipe="recipe"
              :current-language="currentLanguage"
              @view-recipe="viewRecipe"
            />
            
            <!-- Display skeletons for recipes still loading -->
            <RecipeSkeleton
              v-for="n in skeletonCount"
              :key="`skeleton-${n}`"
            />
          </div>

          <!-- Infinite scroll loading indicator -->
          <div v-if="isLoadingMore" class="loading-more">
            <div class="loading-spinner"></div>
            <span>{{ $t('loadingMore') }}...</span>
          </div>

          <!-- End of results indicator -->
          <div v-if="!hasMoreRecipes && displayedRecipes.length > 0" class="no-more-recipes">
            {{ $t('allRecipesLoaded') }}
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import RecipeCard from '../components/RecipeCard.vue'
import RecipeSkeleton from '../components/RecipeSkeleton.vue'
import { useLanguagePreference } from '../composables/useLanguagePreference'
import { useInfiniteScroll } from '../composables/useInfiniteScroll'
import type { Recipe, SupportedLanguage } from '../types/Recipe'

const router = useRouter()
const { currentLanguage, getLanguageName, wasLanguageAutoDetected } = useLanguagePreference()

// Show a subtle notification when language was auto-detected
const showLanguageDetectionInfo = ref(false)

// Reactive state
const recipes = ref<Recipe[]>([])
const loading = ref(true)
const error = ref('')
const selectedCuisine = ref('')
const recipesPerPage = 12
const currentDisplayCount = ref(recipesPerPage)

// Progressive loading state
const totalRecipeCount = ref(0)
const allRecipeFiles = ref<string[]>([])
const loadingRecipeIndex = ref(0)

// Infinite scroll state
const isLoadingMore = ref(false)
const hasMoreRecipes = computed(() => {
  return currentDisplayCount.value < filteredRecipes.value.length
})

// Skeleton state
const skeletonCount = computed(() => {
  // Show skeletons for recipes that are still loading
  const remainingToLoad = totalRecipeCount.value - recipes.value.length
  const remainingToDisplay = Math.max(0, currentDisplayCount.value - recipes.value.length)
  return Math.min(remainingToLoad, remainingToDisplay)
})

// Computed properties
const availableCuisines = computed(() => {
  const cuisineMap = new Map<string, number>()
  
  recipes.value.forEach(recipe => {
    const cuisine = recipe.cuisine || 'Unknown'
    cuisineMap.set(cuisine, (cuisineMap.get(cuisine) || 0) + 1)
  })
  
  return Array.from(cuisineMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

const filteredRecipes = computed(() => {
  return recipes.value.filter(recipe => {
    // Filter by language availability
    const hasLanguage = recipe.languages[currentLanguage.value] !== undefined
    
    // Filter by cuisine if selected
    const matchesCuisine = selectedCuisine.value === '' || 
      (recipe.cuisine && recipe.cuisine === selectedCuisine.value)
    
    return hasLanguage && matchesCuisine
  })
})

const displayedRecipes = computed(() => {
  return filteredRecipes.value.slice(0, currentDisplayCount.value)
})

// Infinite scroll setup
const loadMoreRecipes = () => {
  if (isLoadingMore.value) return
  
  isLoadingMore.value = true
  
  // Simulate loading delay for better UX
  setTimeout(() => {
    const nextCount = currentDisplayCount.value + recipesPerPage
    const maxCount = filteredRecipes.value.length
    
    currentDisplayCount.value = Math.min(nextCount, maxCount)
    isLoadingMore.value = false
  }, 500)
}

const { reset: resetInfiniteScroll } = useInfiniteScroll(loadMoreRecipes)

// Reset display when filters change
const resetDisplayedRecipes = () => {
  currentDisplayCount.value = recipesPerPage
  resetInfiniteScroll()
}

// Methods
// Progressive loading methods
const loadRecipeIndex = async (): Promise<void> => {
  try {
    const indexResponse = await fetch('/recipes/index.json')
    if (indexResponse.ok) {
      const recipeFiles = await indexResponse.json()
      if (Array.isArray(recipeFiles)) {
        allRecipeFiles.value = recipeFiles
        totalRecipeCount.value = recipeFiles.length
        console.log(`Found ${recipeFiles.length} recipe files`)
      }
    }
  } catch (err) {
    console.log('Recipe index not found')
    error.value = 'Recipe index not found. Please check your recipe files.'
  }
}

const loadSingleRecipe = async (fileName: string): Promise<Recipe | null> => {
  try {
    const response = await fetch(`/recipes/${fileName}`)
    if (response.ok) {
      const data = await response.json()
      if (data && data.url && data.languages) {
        return {
          url: data.url,
          cuisine: data.cuisine || 'Unknown',
          languages: data.languages
        }
      }
    }
  } catch (err) {
    console.log(`Failed to load ${fileName}:`, err)
  }
  return null
}

const loadNextRecipe = async (): Promise<void> => {
  if (loadingRecipeIndex.value >= allRecipeFiles.value.length) {
    return
  }
  
  const fileName = allRecipeFiles.value[loadingRecipeIndex.value]
  const recipe = await loadSingleRecipe(fileName)
  
  if (recipe) {
    recipes.value.push(recipe)
  }
  
  loadingRecipeIndex.value++
  
  // Continue loading next recipe with a small delay to prevent blocking
  if (loadingRecipeIndex.value < allRecipeFiles.value.length) {
    setTimeout(() => {
      loadNextRecipe()
    }, 50) // 50ms delay between recipe loads
  }
}

const loadRecipes = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // First load the recipe index to know how many recipes we have
    await loadRecipeIndex()
    
    if (totalRecipeCount.value === 0) {
      error.value = 'No recipes found. Please add JSON files to the public/recipes/ directory.'
      return
    }
    
    // Start loading recipes progressively
    loadNextRecipe()
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load recipes'
    console.error('Error loading recipes:', err)
  } finally {
    loading.value = false
    resetDisplayedRecipes()
  }
}

const viewRecipe = (recipe: Recipe, language: SupportedLanguage) => {
  const encodedUrl = encodeURIComponent(recipe.url)
  // Store recipe data in sessionStorage for the detail page
  sessionStorage.setItem('currentRecipe', JSON.stringify(recipe))
  router.push({
    name: 'recipe-detail',
    params: { url: encodedUrl },
    query: { lang: language }
  })
}

// Watch for filter changes to reset display
watch([currentLanguage, selectedCuisine], () => {
  resetDisplayedRecipes()
})

// Lifecycle
onMounted(() => {
  loadRecipes()
  
  // Show language detection info if language was auto-detected
  if (wasLanguageAutoDetected.value) {
    showLanguageDetectionInfo.value = true
    // Auto hide after 5 seconds
    setTimeout(() => {
      showLanguageDetectionInfo.value = false
    }, 5000)
  }
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: #f8fafc;
}

.app-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 16px;
}

.header-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.language-selector label {
  font-weight: 500;
  color: #374151;
}

.language-selector select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.cuisine-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cuisine-selector label {
  font-weight: 500;
  color: #374151;
}

.cuisine-selector select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.recipes-info {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.loading-progress {
  color: #3b82f6;
  font-size: 12px;
  margin-left: 8px;
}

.main-content {
  width: 100%;
  padding: 24px;
}

.language-detection-banner {
  background: #e0f2fe;
  border: 1px solid #b3e5fc;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #01579b;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.language-detection-banner:hover {
  background: #b3e5fc;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #01579b;
  cursor: pointer;
  padding: 0;
  margin-left: 12px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: rgba(1, 87, 155, 0.1);
}

.loading, .error, .no-recipes {
  text-align: center;
  padding: 32px 16px;
  font-size: 18px;
  color: #6b7280;
}

.error {
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .app-header {
    padding: 12px 16px;
  }
  
  .app-header h1 {
    font-size: 1.5rem;
  }
  
  .header-controls {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .main-content {
    padding: 16px 12px;
  }
  
  .recipes-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .recipes-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (min-width: 1025px) {
  .recipes-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }
}

/* Infinite scroll styles */
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 16px;
  color: #6b7280;
  font-size: 16px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.no-more-recipes {
  text-align: center;
  padding: 32px 16px;
  color: #9ca3af;
  font-size: 14px;
  border-top: 1px solid #e5e7eb;
  margin-top: 24px;
}
</style>
