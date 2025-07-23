<template>
  <div class="recipe-detail-page">
    <header class="page-header">
      <div class="header-content">
        <button class="back-btn" @click="$router.go(-1)">
          ← Back to Recipes
        </button>
        <div class="header-controls">
          <select v-if="recipe" v-model="selectedLanguage" class="language-selector" @change="updateLanguage">
            <option v-for="(_, key) in recipe.languages" :key="key" :value="key">
              {{ getLanguageName(key as string) }}
            </option>
          </select>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div v-if="loading" class="loading">
        Loading recipe...
      </div>

      <div v-else-if="error" class="error">
        {{ error }}
      </div>

      <div v-else-if="recipeData" class="recipe-content">
        <div class="recipe-header">
          <h1 class="recipe-title">{{ recipeData.title }}</h1>
          <div class="recipe-meta">
            <a v-if="recipe" :href="recipe.url" target="_blank" rel="noopener noreferrer" class="source-link">
              View Original Recipe
            </a>
            <div class="recipe-stats">
              <span class="stat">{{ recipeData.ingredients.length }} ingredients</span>
              <span class="stat">{{ recipeData.steps.length }} steps</span>
            </div>
          </div>
        </div>

        <div class="recipe-sections">
          <section class="ingredients-section">
            <h2>Ingredients</h2>
            <ul class="ingredients-list">
              <li v-for="(ingredient, index) in recipeData.ingredients" :key="index" class="ingredient-item">
                <span class="ingredient-text">{{ ingredient }}</span>
              </li>
            </ul>
          </section>

          <section class="instructions-section">
            <h2>Instructions</h2>
            <div class="steps-container">
              <div v-for="(step, index) in recipeData.steps" :key="index" class="step-item">
                <div class="step-header">
                  <div class="step-number">{{ index + 1 }}</div>
                  <h3 class="step-title">Step {{ index + 1 }}</h3>
                </div>
                <div class="step-content">
                  <div v-if="step.image" class="step-image">
                    <img :src="step.image" :alt="`Step ${index + 1}`" @error="handleImageError" />
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
import type { Recipe, SupportedLanguage } from '../types/Recipe'

const route = useRoute()
const router = useRouter()

// Reactive state
const recipe = ref<Recipe | null>(null)
const loading = ref(true)
const error = ref('')
const selectedLanguage = ref<SupportedLanguage>('en')

// Computed properties
const recipeData = computed(() => {
  if (!recipe.value) return null
  return recipe.value.languages[selectedLanguage.value] || 
         recipe.value.languages.en || 
         Object.values(recipe.value.languages)[0]
})

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
          selectedLanguage.value = langParam
        }
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
  const loadedRecipes: Recipe[] = []
  
  // Try main recipes.json
  try {
    const response = await fetch('/recipes.json')
    if (response.ok) {
      const data = await response.json()
      if (Array.isArray(data)) {
        loadedRecipes.push(...data)
      }
    }
  } catch (err) {
    console.log('Main recipes.json not found')
  }
  
  // Try individual recipe file
  try {
    const response = await fetch('/recipes/Varză a la Cluj rețetă veche, prezentată amănunțit _ Laura Laurențiu.json')
    if (response.ok) {
      const data = await response.json()
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.output && item.output.url && item.output.languages) {
            loadedRecipes.push({
              url: item.output.url,
              languages: item.output.languages
            })
          }
        }
      }
    }
  } catch (err) {
    console.log('Individual recipe file not found')
  }
  
  // Find the recipe with matching URL
  const foundRecipe = loadedRecipes.find(r => r.url === targetUrl)
  if (foundRecipe) {
    recipe.value = foundRecipe
  } else {
    error.value = 'Recipe not found'
  }
}

const updateLanguage = () => {
  // Update URL with language parameter
  router.replace({ 
    ...route, 
    query: { ...route.query, lang: selectedLanguage.value } 
  })
}

const getLanguageName = (key: string): string => {
  const languageNames: Record<string, string> = {
    en: 'English',
    de: 'Deutsch',
    jp: '日本語',
    th: 'ไทย'
  }
  return languageNames[key] || key.toUpperCase()
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
.recipe-detail-page {
  min-height: 100vh;
  background-color: #f8fafc;
}

.page-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.language-selector {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.loading, .error {
  text-align: center;
  padding: 48px 24px;
  font-size: 18px;
  color: #6b7280;
}

.error {
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
}

.recipe-content {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.recipe-header {
  padding: 32px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.recipe-title {
  margin: 0 0 16px 0;
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.recipe-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.source-link {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.source-link:hover {
  background: rgba(255, 255, 255, 0.3);
}

.recipe-stats {
  display: flex;
  gap: 16px;
}

.stat {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
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
  padding: 32px;
  border-right: 1px solid #e5e7eb;
  background: #f9fafb;
}

.instructions-section {
  padding: 32px;
}

.ingredients-section h2,
.instructions-section h2 {
  margin: 0 0 24px 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  border-bottom: 2px solid #3b82f6;
  padding-bottom: 8px;
}

.ingredients-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.ingredient-item {
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: flex-start;
}

.ingredient-item:last-child {
  border-bottom: none;
}

.ingredient-item::before {
  content: "•";
  color: #3b82f6;
  font-weight: bold;
  font-size: 18px;
  margin-right: 12px;
  flex-shrink: 0;
}

.ingredient-text {
  color: #374151;
  line-height: 1.5;
}

.steps-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.step-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.step-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.step-number {
  width: 40px;
  height: 40px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  margin-right: 16px;
  flex-shrink: 0;
}

.step-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.step-content {
  padding: 20px;
}

.step-image {
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
}

.step-image img {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: cover;
  display: block;
}

.step-text {
  margin: 0;
  color: #374151;
  line-height: 1.6;
  font-size: 16px;
}

@media (max-width: 768px) {
  .page-header {
    padding: 12px 16px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .main-content {
    padding: 16px 12px;
  }
  
  .recipe-header {
    padding: 20px 16px;
  }
  
  .recipe-title {
    font-size: 1.75rem;
  }
  
  .recipe-meta {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .recipe-sections {
    grid-template-columns: 1fr;
  }
  
  .ingredients-section,
  .instructions-section {
    padding: 20px 16px;
  }
  
  .ingredients-section {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .ingredient-text,
  .step-text {
    font-size: 15px;
  }
  
  .step-content {
    padding: 16px;
  }
  
  .step-header {
    padding: 12px 16px;
  }
  
  .step-number {
    width: 32px;
    height: 32px;
    font-size: 14px;
    margin-right: 12px;
  }
  
  .step-title {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 12px 8px;
  }
  
  .recipe-header {
    padding: 16px 12px;
  }
  
  .recipe-title {
    font-size: 1.5rem;
  }
  
  .ingredients-section,
  .instructions-section {
    padding: 16px 12px;
  }
  
  .ingredients-section h2,
  .instructions-section h2 {
    font-size: 1.25rem;
    margin-bottom: 16px;
  }
  
  .ingredient-text,
  .step-text {
    font-size: 14px;
  }
  
  .step-content {
    padding: 12px;
  }
  
  .step-header {
    padding: 10px 12px;
  }
}
</style>
