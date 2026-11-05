<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import RecipeSkeleton from '../components/RecipeSkeleton.vue'
import UiButton from '../ui/UiButton.vue'
import UiEmptyState from '../ui/UiEmptyState.vue'
import UiRecipeCard from '../ui/UiRecipeCard.vue'
import UiSelect from '../ui/UiSelect.vue'
import UiToast from '../ui/UiToast.vue'
import { useCuisinePreference } from '../composables/useCuisinePreference'
import { useInfiniteScroll } from '../composables/useInfiniteScroll'
import { isSupportedLanguage, useLanguagePreference } from '../composables/useLanguagePreference'
import { useRecipes } from '../composables/useRecipes'
import type { RecipeMetadata } from '../composables/useRecipes'
import type { SupportedLanguage } from '../types/Recipe'

// The select cannot hold an empty value, so "all cuisines" travels under this key.
const ALL_CUISINES = 'all'
const recipesPerPage = 12

const cuisineOf = (recipe: RecipeMetadata) => recipe.cuisine || 'Unknown'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const { currentLanguage, getLanguageName, wasLanguageAutoDetected, setLanguage } = useLanguagePreference()
const { selectedCuisine } = useCuisinePreference()
const { loadRecipeIndex } = useRecipes()

const showLanguageDetectionInfo = ref(false)
const recipeMetadata = ref<RecipeMetadata[]>([])
const loading = ref(true)
const error = ref('')
const currentDisplayCount = ref(recipesPerPage)
const isLoadingMore = ref(false)

const availableCuisines = computed(() => {
  const counts = recipeMetadata.value.reduce(
    (found, recipe) => found.set(cuisineOf(recipe), (found.get(cuisineOf(recipe)) ?? 0) + 1),
    new Map<string, number>(),
  )
  return [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name))
})

const filteredRecipes = computed(() =>
  recipeMetadata.value.filter(
    (recipe) =>
      recipe.languages.includes(currentLanguage.value) &&
      (selectedCuisine.value === '' || cuisineOf(recipe) === selectedCuisine.value),
  ),
)

const displayedRecipes = computed(() => filteredRecipes.value.slice(0, currentDisplayCount.value))
const hasMoreRecipes = computed(() => currentDisplayCount.value < filteredRecipes.value.length)

const cuisineOptions = computed(() => [
  { value: ALL_CUISINES, label: `${t('allCuisines')} (${recipeMetadata.value.length})` },
  ...availableCuisines.value.map(({ name, count }) => ({ value: name, label: `${name} (${count})` })),
])

const cuisineChoice = computed(() => selectedCuisine.value || ALL_CUISINES)

const chooseCuisine = (value: string | undefined) => {
  selectedCuisine.value = value === undefined || value === ALL_CUISINES ? '' : value
}

const { reset: resetInfiniteScroll } = useInfiniteScroll(() => {
  if (isLoadingMore.value) return
  isLoadingMore.value = true
  // A short pause keeps the skeleton row visible long enough to read as progress.
  setTimeout(() => {
    currentDisplayCount.value = Math.min(currentDisplayCount.value + recipesPerPage, filteredRecipes.value.length)
    isLoadingMore.value = false
  }, 500)
})

const resetDisplayedRecipes = () => {
  currentDisplayCount.value = recipesPerPage
  resetInfiniteScroll()
}

const loadRecipes = async () => {
  try {
    loading.value = true
    error.value = ''
    recipeMetadata.value = await loadRecipeIndex()
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : t('error')
    console.error('Error loading recipes:', caught)
  } finally {
    loading.value = false
    resetDisplayedRecipes()
  }
}

const viewRecipe = (recipe: RecipeMetadata, language: SupportedLanguage) =>
  router.push({ name: 'recipe-detail', params: { slug: recipe.slug }, query: { lang: language } })

onMounted(async () => {
  const urlLanguage = route.query.lang
  if (isSupportedLanguage(urlLanguage)) setLanguage(urlLanguage)
  await loadRecipes()
  showLanguageDetectionInfo.value = wasLanguageAutoDetected.value
})

watch([currentLanguage, selectedCuisine], resetDisplayedRecipes)

watch(currentLanguage, (language) => router.replace({ ...route, query: { ...route.query, lang: language } }), { flush: 'post' })
</script>

<template>
  <div class="page">
    <div class="page-heading">
      <h1 class="page-title">{{ t('recipeCollection') }}</h1>
      <p v-if="!loading && !error" class="page-note">{{ filteredRecipes.length }} {{ t('recipesFound') }}</p>
    </div>

    <div class="filters">
      <!-- Keyed by the count because the select keeps the label it first rendered for the chosen value. -->
      <UiSelect
        :key="recipeMetadata.length"
        :label="t('cuisine')"
        :options="cuisineOptions"
        :model-value="cuisineChoice"
        @update:model-value="chooseCuisine"
      />
    </div>

    <UiToast
      v-if="showLanguageDetectionInfo"
      v-model:open="showLanguageDetectionInfo"
      tone="info"
      :title="t('languageAutoSet', { language: getLanguageName(currentLanguage) })"
      :description="t('languageAutoSetDescription')"
      :close-label="t('close')"
      :duration="8000"
    />

    <div v-if="loading" class="recipes-grid" aria-busy="true">
      <RecipeSkeleton v-for="placeholder in recipesPerPage / 2" :key="placeholder" />
    </div>

    <UiEmptyState v-else-if="error" :heading-level="2" icon="alert" :title="t('error')" :description="error">
      <UiButton @click="loadRecipes">{{ t('retry') }}</UiButton>
    </UiEmptyState>

    <UiEmptyState
      v-else-if="filteredRecipes.length === 0"
      :heading-level="2"
      icon="search"
      :title="t('noRecipes')"
      :description="t('noRecipesAvailable', { language: getLanguageName(currentLanguage) })"
    />

    <template v-else>
      <div class="recipes-grid">
        <UiRecipeCard
          v-for="recipe in displayedRecipes"
          :key="recipe.slug"
          :recipe="{
            title: recipe.title,
            cuisine: cuisineOf(recipe),
            minutes: recipe.estimatedTime,
            imageUrl: recipe.featuredImage ?? undefined,
          }"
          :heading-level="2"
          :minutes-label="t('minutes')"
          @open="viewRecipe(recipe, currentLanguage)"
        />
        <template v-if="isLoadingMore">
          <RecipeSkeleton v-for="placeholder in 3" :key="`more-${placeholder}`" />
        </template>
      </div>
      <p v-if="isLoadingMore" class="visually-hidden" role="status">{{ t('loadingMore') }}</p>
      <p v-if="!hasMoreRecipes" class="page-note">{{ t('allRecipesLoaded') }}</p>
    </template>
  </div>
</template>
