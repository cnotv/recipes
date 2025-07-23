<template>
  <div class="home-page">
    <header class="app-header">
      <h1>Recipe Collection</h1>
      <div class="header-controls">
        <div class="language-selector">
          <label for="language">Language:</label>
          <select id="language" v-model="currentLanguage" @change="resetToFirstPage">
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="jp">日本語</option>
            <option value="th">ไทย</option>
          </select>
        </div>
        <div class="recipes-info">
          {{ filteredRecipes.length }} recipes found
        </div>
      </div>
    </header>

    <main class="main-content">
      <div v-if="loading" class="loading">
        Loading recipes...
      </div>

      <div v-else-if="error" class="error">
        {{ error }}
      </div>

      <div v-else>
        <div v-if="paginatedRecipes.length === 0" class="no-recipes">
          No recipes available in {{ getLanguageName(currentLanguage) }}.
        </div>

        <div v-else>
          <div class="recipes-grid">
            <RecipeCard
              v-for="recipe in paginatedRecipes"
              :key="recipe.url"
              :recipe="recipe"
              :current-language="currentLanguage"
              @view-recipe="viewRecipe"
            />
          </div>

          <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
            @page-change="changePage"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import RecipeCard from '../components/RecipeCard.vue'
import Pagination from '../components/Pagination.vue'
import type { Recipe, SupportedLanguage } from '../types/Recipe'

const router = useRouter()

// Reactive state
const recipes = ref<Recipe[]>([])
const loading = ref(true)
const error = ref('')
const currentLanguage = ref<SupportedLanguage>('en')
const currentPage = ref(1)
const recipesPerPage = 6

// Computed properties
const filteredRecipes = computed(() => {
  return recipes.value.filter(recipe => 
    recipe.languages[currentLanguage.value] !== undefined
  )
})

const totalPages = computed(() => {
  return Math.ceil(filteredRecipes.value.length / recipesPerPage)
})

const paginatedRecipes = computed(() => {
  const start = (currentPage.value - 1) * recipesPerPage
  const end = start + recipesPerPage
  return filteredRecipes.value.slice(start, end)
})

// Methods
const loadRecipes = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const loadedRecipes: Recipe[] = []
    
    // Try to load the main recipes.json file first
    try {
      const response = await fetch('/recipes.json')
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          loadedRecipes.push(...data)
        }
      }
    } catch (err) {
      console.log('Main recipes.json not found, trying individual files...')
    }
    
    // Try to load the specific recipe file you have
    try {
      const response = await fetch('/recipes/Varză a la Cluj rețetă veche, prezentată amănunțit _ Laura Laurențiu.json')
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          // Transform the data structure to match our expected format
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
    
    recipes.value = loadedRecipes
    
    if (recipes.value.length === 0) {
      error.value = 'No recipes found. Please add JSON files to the public/recipes/ directory.'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load recipes'
    console.error('Error loading recipes:', err)
  } finally {
    loading.value = false
  }
}

const changePage = (page: number) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const resetToFirstPage = () => {
  currentPage.value = 1
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

const getLanguageName = (key: SupportedLanguage): string => {
  const languageNames: Record<SupportedLanguage, string> = {
    en: 'English',
    de: 'Deutsch',
    jp: 'Japanese',
    th: 'Thai'
  }
  return languageNames[key] || key
}

// Lifecycle
onMounted(() => {
  loadRecipes()
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
  gap: 16px;
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

.recipes-info {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.loading, .error, .no-recipes {
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

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

@media (max-width: 768px) {
  .app-header {
    padding: 16px;
  }
  
  .app-header h1 {
    font-size: 1.5rem;
  }
  
  .header-controls {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .main-content {
    padding: 24px 16px;
  }
  
  .recipes-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
