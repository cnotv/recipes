<template>
  <div class="recipe-detail-page">
    <header class="page-header">
      <div class="header-content">
        <button class="back-btn" @click="goBackToHome">
          <span class="back-arrow">←</span>
          <span class="back-text">{{ $t('backToHome') }}</span>
        </button>
        
        <div class="center-controls">
          <KawaiiSelector
            v-model="currentTheme"
            :options="themeOptions"
            :label="$t('theme')"
            @update:model-value="(value) => setTheme(value as any)"
          />
        </div>

        <div class="header-controls">
          <KawaiiSelector
            v-model="currentLanguage"
            :options="languageOptions"
            :label="$t('language')"
            @update:model-value="updateLanguage"
          />
        </div>
      </div>
    </header>

    <main class="main-content">
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <span>{{ $t('loading') }}...</span>
      </div>

      <div v-else-if="error" class="error">
        {{ error }}
      </div>

      <div v-else-if="recipeData" class="recipe-content">
        <div class="recipe-header">
          <h1 class="recipe-title">{{ recipeData.title }}</h1>
          <div class="recipe-meta">
                        <a v-if="recipe?.url" :href="recipe.url" target="_blank" rel="noopener noreferrer" class="source-link">
              {{ $t('viewOriginalRecipe') }}
            </a>
            <div class="recipe-stats">
              <span class="stat">{{ recipeData.ingredients.length }} {{ $t('ingredients') }}</span>
              <span class="stat">{{ recipeData.steps.length }} {{ $t('steps') }}</span>
            </div>
          </div>
        </div>

        <div class="recipe-sections">
          <section class="ingredients-section">
            <h2>{{ $t('ingredients') }}</h2>
            <ul class="ingredients-list">
              <li v-for="(ingredient, index) in recipeData.ingredients" :key="index" class="ingredient-item">
                <span class="ingredient-text">{{ ingredient }}</span>
              </li>
            </ul>
          </section>

          <section class="instructions-section">
            <h2>{{ $t('instructions') }}</h2>
            <div class="steps-container">
              <div v-for="(step, index) in recipeData.steps" :key="index" class="step-item">
                <div class="step-header">
                  <div class="step-number">{{ index + 1 }}</div>
                  <h3 class="step-title">{{ $t('step') }} {{ index + 1 }}</h3>
                </div>
                <div class="step-content">
                  <div v-if="step.image" class="step-image">
                    <img :src="step.image" :alt="`${$t('step')} ${index + 1}`" @error="handleImageError" />
                  </div>
                  <p class="step-text">{{ step.content }}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { useLanguagePreference } from '../composables/useLanguagePreference'
import { createRecipeMeta, updateMetaTags } from '../composables/useMeta'
import KawaiiSelector from '../components/KawaiiSelector.vue'
import type { Recipe, SupportedLanguage } from '../types/Recipe'

const route = useRoute()
const router = useRouter()
const { currentLanguage, getLanguageName } = useLanguagePreference()
const { currentTheme, setTheme, availableThemes } = useTheme()

// Reactive state
const recipe = ref<Recipe | null>(null)
const loading = ref(true)
const error = ref('')

// Meta management - will be updated when recipe loads

// Options for KawaiiSelector components
const themeOptions = computed(() => 
  availableThemes.map(themeKey => ({
    value: themeKey,
    label: themeKey === 'masculine-kawaii' ? 'Blue Kawaii' :
           themeKey === 'pink-kawaii' ? 'Pink Kawaii' :
           themeKey === 'dark-mode' ? 'Dark Mode' :
           themeKey === 'nature' ? 'Nature' : themeKey
  }))
)

const languageOptions = computed(() => [
  { value: 'en', label: getLanguageName('en') },
  { value: 'de', label: getLanguageName('de') },
  { value: 'jp', label: getLanguageName('jp') },
  { value: 'th', label: getLanguageName('th') }
])

// Override language from URL query if provided
const urlLanguage = route.query.lang as SupportedLanguage
if (urlLanguage && ['en', 'de', 'jp', 'th'].includes(urlLanguage)) {
  currentLanguage.value = urlLanguage
}

// Computed properties
const recipeData = computed(() => {
  if (!recipe.value) return null
  return recipe.value.languages[currentLanguage.value] || 
         recipe.value.languages.en || 
         Object.values(recipe.value.languages)[0]
})

// Watch for recipe data changes to update meta tags
watch(recipeData, (newRecipeData) => {
  if (newRecipeData && recipe.value) {
    // Determine the best image to use: cover image or first step image
    const metaImage = recipe.value.cover || 
                     (newRecipeData.steps?.[0]?.image) || 
                     undefined
    
    const recipeMeta = createRecipeMeta({
      title: newRecipeData.title,
      description: newRecipeData.steps?.[0]?.content || `Delicious ${recipe.value.cuisine || ''} recipe with step-by-step instructions.`,
      image: metaImage,
      cuisine: recipe.value.cuisine,
      ingredients: newRecipeData.ingredients,
      steps: newRecipeData.steps,
      url: recipe.value.url,
      fileName: route.params.url as string
    }, currentLanguage.value)
    updateMetaTags(recipeMeta)
  }
}, { immediate: true })

// Watch for language changes to update meta tags
watch(currentLanguage, () => {
  // Trigger meta update when language changes
  if (recipeData.value && recipe.value) {
    const metaImage = recipe.value.cover || 
                     (recipeData.value.steps?.[0]?.image) || 
                     undefined
    
    const recipeMeta = createRecipeMeta({
      title: recipeData.value.title,
      description: recipeData.value.steps?.[0]?.content || `Delicious ${recipe.value.cuisine || ''} recipe with step-by-step instructions.`,
      image: metaImage,
      cuisine: recipe.value.cuisine,
      ingredients: recipeData.value.ingredients,
      steps: recipeData.value.steps,
      url: recipe.value.url,
      fileName: route.params.url as string
    }, currentLanguage.value)
    updateMetaTags(recipeMeta)
  }
})

// Helper function to update recipe meta tags
const updateRecipeMetaTags = () => {
  if (recipeData.value && recipe.value) {
    const metaImage = recipe.value.cover || 
                     (recipeData.value.steps?.[0]?.image) || 
                     undefined
    
    const recipeMeta = createRecipeMeta({
      title: recipeData.value.title,
      description: recipeData.value.steps?.[0]?.content || `Delicious ${recipe.value.cuisine || ''} recipe with step-by-step instructions.`,
      image: metaImage,
      cuisine: recipe.value.cuisine,
      ingredients: recipeData.value.ingredients,
      steps: recipeData.value.steps,
      url: recipe.value.url,
      fileName: route.params.url as string
    }, currentLanguage.value)
    updateMetaTags(recipeMeta)
  }
}

// Methods
const loadRecipe = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const recipeUrl = route.params.url as string
    if (!recipeUrl) {
      error.value = 'Recipe URL not provided'
      return
    }

    // Try to get recipe from sessionStorage first
    const storedRecipe = sessionStorage.getItem('currentRecipe')
    if (storedRecipe) {
      try {
        recipe.value = JSON.parse(storedRecipe)
        // Set language from query params if available
        const langParam = route.query.lang as SupportedLanguage
        if (langParam && recipe.value && recipe.value.languages[langParam]) {
          currentLanguage.value = langParam
        }
        // Ensure meta tags are updated immediately
        updateRecipeMetaTags()
        return
      } catch (err) {
        console.log('Failed to parse stored recipe data')
      }
    }

    // Fallback: try to load recipe from JSON files
    await loadRecipeFromFiles(decodeURIComponent(recipeUrl))
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load recipe'
    console.error('Error loading recipe:', err)
  } finally {
    loading.value = false
  }
}

const loadRecipeFromFiles = async (targetUrl: string) => {
  // Optimized approach: Only load the specific recipe file we need
  // First, try to find the recipe by URL in the index without loading all files
  try {
    const indexResponse = await fetch('/recipes/index.json')
    if (indexResponse.ok) {
      const recipeFiles = await indexResponse.json()
      if (Array.isArray(recipeFiles)) {
        // Search through files one by one, but stop when we find the right one
        for (const fileName of recipeFiles) {
          try {
            const response = await fetch(`/recipes/${fileName}`)
            if (response.ok) {
              const data = await response.json()
              // Check if this is the recipe we're looking for
              if (data && data.url === targetUrl) {
                // Found it! Load the complete recipe data and stop
                recipe.value = data
                // Update meta tags immediately
                updateRecipeMetaTags()
                return
              }
            }
          } catch (err) {
            console.log(`Failed to load ${fileName}:`, err)
          }
        }
      }
    }
  } catch (err) {
    console.log('Recipe index not found')
  }

  // If not found in index, try to guess filename from URL
  try {
    // Extract potential filename patterns from the URL
    const urlParts = targetUrl.split('/')
    const lastPart = urlParts[urlParts.length - 1]
    
    // Try common filename patterns based on URL structure
    const possibleFilenames = [
      `${lastPart}.json`,
      `${lastPart} • Just One Cookbook.json`,
      `${lastPart} - Hot Thai Kitchen!.json`,
      `${lastPart} - La Ricetta di GialloZafferano.json`,
      `${lastPart} Recipe.json`
    ]
    
    for (const filename of possibleFilenames) {
      try {
        const response = await fetch(`/recipes/${encodeURIComponent(filename)}`)
        if (response.ok) {
          const data = await response.json()
          if (data && data.url === targetUrl) {
            recipe.value = data
            // Update meta tags immediately
            updateRecipeMetaTags()
            return
          }
        }
      } catch (err) {
        // Continue to next filename pattern
      }
    }
  } catch (err) {
    console.log('Direct filename guess failed')
  }

  error.value = 'Recipe not found'
}

const updateLanguage = () => {
  // Update URL with language parameter
  router.replace({ 
    ...route, 
    query: { ...route.query, lang: currentLanguage.value } 
  })
}

const goBackToHome = () => {
  // Navigate to home with current language parameter
  router.push({
    name: 'home',
    query: { lang: currentLanguage.value }
  })
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

// Watch for route changes
watch(() => route.params.url, () => {
  if (route.params.url) {
    loadRecipe()
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  loadRecipe()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

* {
  font-family: var(--theme-font-primary, 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
}

.recipe-detail-page {
  min-height: 100vh;
  background: var(--theme-bg-gradient, linear-gradient(135deg, #e8f4f8 0%, #f0f8ff 25%, #f5f7fa 50%, #eef2f7 75%, #f8fafc 100%));
  animation: gentleFloat 6s ease-in-out infinite;
}

@keyframes gentleFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-1px); }
}

.page-header {
  background: var(--theme-surface, #fff);
  border-bottom: 2px solid var(--theme-border, #e2e8f0);
  padding: 20px 24px;
  box-shadow: 0 4px 20px rgba(74, 144, 226, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.header-content {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 20px;
}

.back-btn {
  background: var(--theme-button-gradient, linear-gradient(135deg, #4a90e2, #3478d4));
  border: 2px solid var(--theme-primary, #4a90e2);
  color: white;
  padding: 12px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  justify-self: start;
}

.back-btn:hover {
  background: var(--theme-accent, linear-gradient(135deg, #3478d4, #2d69c4));
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
}

.center-controls {
  display: flex;
  justify-content: center;
}

.header-controls {
  display: flex;
  justify-content: flex-end;
}

.main-content {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 24px;
}

.loading, .error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px;
  font-size: 16px;
  color: var(--theme-text, #6b7280);
  background: var(--theme-card-gradient, linear-gradient(135deg, #fff 0%, #f8fafc 100%));
  border-radius: 25px;
  border: 2px solid var(--theme-border, #e5e7eb);
  gap: 12px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
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

.loading::before {
  display: none;
}

@keyframes pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

.error {
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
}

.recipe-content {
  background: var(--theme-card-gradient, linear-gradient(135deg, #fff 0%, #f8fafc 100%));
  border-radius: 25px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(74, 144, 226, 0.2);
  border: 2px solid var(--theme-primary, #4a90e2);
  animation: gentleFloat 4s ease-in-out infinite;
}

.recipe-header {
  padding: 40px;
  border-bottom: 2px solid var(--theme-border, #e5e7eb);
  background: var(--theme-header-gradient, linear-gradient(135deg, #4a90e2, #5ca7f2, #74b9ff, #a29bfe));
  color: white;
}

.recipe-title {
  margin: 0 0 20px 0;
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.2;
  font-family: var(--theme-font-header, 'JetBrains Mono', 'Poppins', monospace);
}

.recipe-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.source-link {
  color: white;
  text-decoration: none;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.source-link::before {
  content: '🔗';
  margin-right: 8px;
}

.source-link:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.recipe-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.stat:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.recipe-sections {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 0;
}

@media (max-width: 768px) {
  .recipe-sections {
    grid-template-columns: 1fr;
  }
}

.ingredients-section {
  padding: 40px;
  border-right: 2px solid var(--theme-border, #e5e7eb);
  background: var(--theme-background, linear-gradient(135deg, #f9fafb 0%, #f8fafc 100%));
}

.instructions-section {
  padding: 40px;
  background: var(--theme-card-gradient, linear-gradient(135deg, #fff 0%, #f8fafc 100%));
}

.ingredients-section h2,
.instructions-section h2 {
  margin: 0 0 30px 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--theme-text, #1f2937);
  border-bottom: 3px solid var(--theme-primary, #4a90e2);
  padding-bottom: 12px;
  font-family: var(--theme-font-header, 'JetBrains Mono', 'Poppins', monospace);
}

.ingredients-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ingredient-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: var(--theme-surface, #fff);
  border-radius: 12px;
  border: 1px solid var(--theme-border, #e5e7eb);
  transition: all 0.2s ease;
  font-size: 14px;
}

.ingredient-item:hover {
  background: var(--theme-hover, #f1f5f9);
  border-color: var(--theme-primary, #4a90e2);
}

.ingredient-item::before {
  content: '•';
  color: var(--theme-primary, #4a90e2);
  font-weight: bold;
  font-size: 12px;
  margin-right: 8px;
  flex-shrink: 0;
}

.ingredient-text {
  color: var(--theme-text, #374151);
  line-height: 1.6;
  font-weight: 500;
  flex: 1;
}

.steps-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.step-item {
  border: 2px solid var(--theme-border, #e5e7eb);
  border-radius: 25px;
  overflow: hidden;
  background: var(--theme-surface, #fff);
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.1);
  transition: all 0.3s ease;
}

.step-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(74, 144, 226, 0.2);
  border-color: var(--theme-primary, #4a90e2);
}

.step-header {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  background: var(--theme-background, linear-gradient(135deg, #f8fafc 0%, #f0f8ff 100%));
  border-bottom: 2px solid var(--theme-border, #e5e7eb);
}

.step-number {
  width: 50px;
  height: 50px;
  background: var(--theme-button-gradient, linear-gradient(135deg, #4a90e2, #3478d4));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  margin-right: 20px;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
  border: 3px solid var(--theme-surface, #fff);
}

.step-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--theme-text, #1f2937);
  font-family: var(--theme-font-header, 'JetBrains Mono', 'Poppins', monospace);
}

.step-content {
  padding: 24px;
  background: var(--theme-card-gradient, linear-gradient(135deg, #fff 0%, #f8fafc 100%));
}

.step-image {
  margin-bottom: 20px;
  border-radius: 15px;
  overflow: hidden;
  border: 2px solid var(--theme-border, #e5e7eb);
}

.step-image img {
  width: 100%;
  height: auto;
  max-height: 350px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.step-image:hover img {
  transform: scale(1.02);
}

.step-text {
  margin: 0;
  color: var(--theme-text, #374151);
  line-height: 1.7;
  font-size: 16px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .page-header {
    padding: 16px 20px;
  }
  
  .header-content {
    grid-template-columns: auto 1fr auto;
    gap: 8px;
    text-align: center;
  }
  
  .back-btn {
    justify-self: start;
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .back-btn .back-text {
    display: none;
  }
  
  .back-btn .back-arrow {
    font-size: 16px;
  }
  
  .center-controls {
    justify-self: center;
  }
  
  .header-controls {
    justify-self: end;
  }
  
  .main-content {
    padding: 20px 16px;
  }
  
  .recipe-header {
    padding: 24px 20px;
  }
  
  .recipe-title {
    font-size: 1.8rem;
  }
  
  .recipe-meta {
    flex-direction: column;
    gap: 16px;
  }
  
  .ingredients-section,
  .instructions-section {
    padding: 16px 12px;
  }
  
  .ingredients-section {
    border-right: none;
    border-bottom: 2px solid var(--theme-border, #e5e7eb);
  }
  
  .ingredient-item {
    padding: 6px 10px;
    font-size: 13px;
  }
}
</style>
