<template>
  <div class="home-page">
    <header class="app-header">
      <h1>{{ $t('recipeCollection') }}</h1>
      <div class="header-controls">
        <KawaiiSelector
          v-model="currentLanguage"
          :options="languageOptions"
          :label="$t('language')"
        />
        
        <KawaiiSelector
          v-model="selectedCuisine"
          :options="cuisineOptions"
          :label="$t('cuisine')"
          full-width
        />
        
        <KawaiiSelector
          v-model="currentTheme"
          :options="themeOptions"
          :label="$t('theme')"
          @update:model-value="setTheme(currentTheme)"
        />
        
        <div class="recipes-info">
          {{ filteredRecipes.length }} {{ $t('recipesFound') }}
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
import KawaiiSelector from '../components/KawaiiSelector.vue'
import { useLanguagePreference } from '../composables/useLanguagePreference'
import { useInfiniteScroll } from '../composables/useInfiniteScroll'
import { useTheme } from '../composables/useTheme'
import { useCuisinePreference } from '../composables/useCuisinePreference'
import { useI18n } from 'vue-i18n'
import { useMeta, createHomeMeta } from '../composables/useMeta'
import type { Recipe, SupportedLanguage } from '../types/Recipe'

// Setup SEO meta tags for home page
useMeta(createHomeMeta())

const router = useRouter()
const { t } = useI18n()
const { currentLanguage, getLanguageName, wasLanguageAutoDetected } = useLanguagePreference()
const { currentTheme, setTheme, availableThemes } = useTheme()
const { selectedCuisine } = useCuisinePreference()

// Show a subtle notification when language was auto-detected
const showLanguageDetectionInfo = ref(false)

// Reactive state
const recipes = ref<Recipe[]>([])
const loading = ref(true)
const error = ref('')
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

// Options for KawaiiSelector components
const languageOptions = computed(() => [
  { value: 'en', label: getLanguageName('en') },
  { value: 'de', label: getLanguageName('de') },
  { value: 'jp', label: getLanguageName('jp') },
  { value: 'th', label: getLanguageName('th') }
])

const cuisineOptions = computed(() => [
  { value: '', label: `${t('allCuisines')} (${recipes.value.length})` },
  ...availableCuisines.value.map(cuisine => ({
    value: cuisine.name,
    label: `${cuisine.name} (${cuisine.count})`
  }))
])

const themeOptions = computed(() => 
  availableThemes.map(themeKey => ({
    value: themeKey,
    label: themeKey === 'masculine-kawaii' ? 'Blue Kawaii' :
           themeKey === 'pink-kawaii' ? 'Pink Kawaii' :
           themeKey === 'dark-mode' ? 'Dark Mode' :
           themeKey === 'nature' ? 'Nature' : themeKey
  }))
)

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
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

* {
  font-family: var(--theme-font-primary, 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
}

.app-header h1 {
  font-family: var(--theme-font-header, 'JetBrains Mono', 'Poppins', monospace) !important;
}

.home-page {
  min-height: 100vh;
  background: var(--theme-bg-gradient, linear-gradient(135deg, #e8f4f8 0%, #f0f8ff 25%, #f5f7fa 50%, #eef2f7 75%, #f8fafc 100%));
  background-size: 400% 400%;
  animation: gentleFloat 20s ease infinite;
}

@keyframes gentleFloat {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.app-header {
  background: var(--theme-header-gradient, linear-gradient(135deg, #4a90e2, #5ca7f2, #74b9ff, #a29bfe));
  background-size: 300% 300%;
  animation: softGradient 15s ease infinite;
  border-bottom: 2px solid var(--theme-accent, #3478d4);
  padding: 24px;
  box-shadow: 0 4px 20px rgba(52, 120, 212, 0.3);
  border-radius: 0 0 25px 25px;
  backdrop-filter: blur(10px);
  position: relative;
}

.app-header::before {
  content: var(--theme-icons, '⚡✨⚡✨⚡');
  position: absolute;
  top: 10px;
  right: 20px;
  font-size: 12px;
  opacity: 0.7;
  animation: sparkle 3s ease-in-out infinite;
}

@keyframes softGradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes sparkle {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

.app-header h1 {
  font-size: 2.2rem;
  font-weight: 800;
  background: linear-gradient(45deg, #fff, #e6f3ff, #fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
  text-shadow: 1px 1px 3px rgba(52, 120, 212, 0.3);
  position: relative;
  font-family: var(--theme-font-header, 'JetBrains Mono', 'Poppins', monospace);
}

.app-header h1::after {
  content: var(--theme-secondary-icon, '(◕‿◕)ゞ');
  position: absolute;
  right: -10px;
  top: -5px;
  font-size: 0.4em;
  color: #fff;
  animation: bounce 2s ease-in-out infinite;
}

.header-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.recipes-info {
  background: var(--theme-card-gradient, linear-gradient(135deg, #fff, #f8fafc));
  color: var(--theme-text, #2d3748);
  font-size: 16px;
  font-weight: 700;
  padding: 12px 20px;
  border-radius: 30px;
  border: 2px solid var(--theme-primary, #4a90e2);
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
  position: relative;
}

.recipes-info::after {
  content: var(--theme-primary-icon, '⚡');
  position: absolute;
  right: -8px;
  top: -8px;
  font-size: 16px;
  background: var(--theme-surface, #fff);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: twinkle 2s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.1); }
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
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border: 2px solid #4a90e2;
  border-radius: 25px;
  padding: 16px 20px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #2d3748;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
  position: relative;
}

.language-detection-banner::before {
  content: '(◕‿◕)ゞ';
  position: absolute;
  left: -10px;
  top: -10px;
  background: #fff;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.4);
}

.language-detection-banner:hover {
  background: linear-gradient(135deg, #e2e8f0, #cbd5e0);
  transform: scale(1.02);
}

.close-btn {
  background: #4a90e2;
  border: 2px solid #fff;
  font-size: 16px;
  color: #fff;
  cursor: pointer;
  padding: 0;
  margin-left: 12px;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  font-weight: bold;
}

.close-btn:hover {
  background: #3478d4;
  transform: rotate(90deg) scale(1.1);
}

.loading, .error, .no-recipes {
  text-align: center;
  padding: 32px 16px;
  font-size: 18px;
  color: var(--theme-text, #2d3748);
  background: rgba(255, 255, 255, 0.9);
  border-radius: 25px;
  backdrop-filter: blur(10px);
  border: 2px solid var(--theme-primary, #4a90e2);
  font-weight: 600;
  position: relative;
}

.loading::before {
  content: var(--theme-secondary-icon, '(◉‿◉)');
  display: block;
  font-size: 24px;
  margin-bottom: 10px;
  animation: spin 2s ease-in-out infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  color: #e53e3e;
  background: linear-gradient(135deg, #fed7d7, #fbb6ce);
  border: 2px solid #e53e3e;
  border-radius: 25px;
  box-shadow: 0 4px 15px rgba(229, 62, 62, 0.2);
}

.error::before {
  content: '(╥﹏╥)';
  display: block;
  font-size: 24px;
  margin-bottom: 10px;
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  margin-bottom: 24px;
  padding: 25px;
  background: var(--theme-surface, rgba(255, 255, 255, 0.8));
  border-radius: 30px;
  backdrop-filter: blur(10px);
  border: 2px solid var(--theme-border, rgba(74, 144, 226, 0.3));
  position: relative;
}

.recipes-grid::before {
  content: var(--theme-grid-decoration, '⚡ ⚡ ⚡');
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--theme-surface, #fff);
  padding: 5px 15px;
  border-radius: 20px;
  color: var(--theme-primary, #4a90e2);
  font-size: 12px;
  border: 2px solid var(--theme-primary, #4a90e2);
}

/* Infinite scroll styles */
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 16px;
  color: #2d3748;
  font-size: 16px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 25px;
  backdrop-filter: blur(10px);
  border: 2px solid #4a90e2;
  position: relative;
}

.loading-more::before {
  content: '(◕‿◕)';
  margin-right: 10px;
  font-size: 18px;
  animation: bounce 1s ease-in-out infinite;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(74, 144, 226, 0.3);
  border-radius: 50%;
  border-top-color: #4a90e2;
  border-right-color: #3478d4;
  animation: gentleSpin 1.5s ease-in-out infinite;
}

@keyframes gentleSpin {
  to {
    transform: rotate(360deg);
  }
}

.no-more-recipes {
  text-align: center;
  padding: 32px 16px;
  color: #2d3748;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #f7fafc, #edf2f7);
  border-radius: 25px;
  margin-top: 24px;
  border: 2px solid #6c757d;
  box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
  position: relative;
}

.no-more-recipes::before {
  content: '(◉‿◉)ゞ';
  display: block;
  font-size: 20px;
  margin-bottom: 10px;
  color: #4a90e2;
}

@media (max-width: 768px) {
  .app-header {
    padding: 12px 16px;
    border-radius: 0 0 15px 15px;
  }
  
  .app-header h1 {
    font-size: 1.8rem;
  }
  
  .header-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .language-selector, .cuisine-selector {
    width: 100%;
    justify-content: center;
  }
  
  .recipes-info {
    align-self: center;
  }
  
  .main-content {
    padding: 16px 12px;
  }
  
  .recipes-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    padding: 15px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .recipes-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 22px;
  }
}

@media (min-width: 1025px) {
  .recipes-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 30px;
  }
}

/* Infinite scroll styles */
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 16px;
  color: #8b5a8c;
  font-size: 16px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 25px;
  backdrop-filter: blur(10px);
  border: 2px solid #ffb3d9;
  position: relative;
}

.loading-more::before {
  content: '(◕‿◕)';
  margin-right: 10px;
  font-size: 18px;
  animation: bounce 1s ease-in-out infinite;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 179, 217, 0.3);
  border-radius: 50%;
  border-top-color: #ffb3d9;
  border-right-color: #ff9ec7;
  animation: gentleSpin 1.5s ease-in-out infinite;
}

@keyframes gentleSpin {
  to {
    transform: rotate(360deg);
  }
}

.no-more-recipes {
  text-align: center;
  padding: 32px 16px;
  color: #8b5a8c;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #fff0f5, #f0f8ff);
  border-radius: 25px;
  margin-top: 24px;
  border: 2px solid #ffb3d9;
  box-shadow: 0 4px 15px rgba(255, 179, 217, 0.3);
  position: relative;
}

.no-more-recipes::before {
  content: '(◉‿◉)ノ♡';
  display: block;
  font-size: 20px;
  margin-bottom: 10px;
  color: #ff9ec7;
}
</style>
