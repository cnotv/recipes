<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import UiBadge from '../ui/UiBadge.vue'
import UiButton from '../ui/UiButton.vue'
import UiEmptyState from '../ui/UiEmptyState.vue'
import UiIcon from '../ui/UiIcon.vue'
import UiSkeleton from '../ui/UiSkeleton.vue'
import { isSupportedLanguage, useLanguagePreference } from '../composables/useLanguagePreference'
import { applyHead, siteOrigin } from '../composables/useHead'
import { recipeHead } from '../../scripts/seo.ts'
import { useRecipes } from '../composables/useRecipes'
import type { Recipe } from '../types/Recipe'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { loadRecipe: fetchRecipe } = useRecipes()
const { currentLanguage } = useLanguagePreference()

const recipe = ref<Recipe | null>(null)
const loading = ref(true)
const error = ref('')

const urlLanguage = route.query.lang
if (isSupportedLanguage(urlLanguage)) currentLanguage.value = urlLanguage

const recipeData = computed(() => {
  const found = recipe.value
  return found ? (found.languages[currentLanguage.value] ?? found.languages.en ?? Object.values(found.languages)[0]) : null
})

const sourceHost = computed(() => {
  const address = recipe.value?.url
  return address && URL.canParse(address) ? new URL(address).hostname.replace(/^www\./, '') : ''
})

const refreshHead = () => {
  const found = recipe.value
  if (!found || !recipeData.value) return
  applyHead(recipeHead({ ...found, slug: found.slug ?? String(route.params.slug) }, currentLanguage.value, siteOrigin()))
}

const loadRecipe = async () => {
  try {
    loading.value = true
    error.value = ''
    const found = await fetchRecipe(String(route.params.slug))
    if (!found) {
      error.value = t('recipeNotFound')
      return
    }
    recipe.value = found
    // An old link made of the source URL becomes the slug address.
    if (found.slug && found.slug !== route.params.slug) {
      router.replace({ name: 'recipe-detail', params: { slug: found.slug }, query: route.query })
    }
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : t('error')
    console.error('Error loading recipe:', caught)
  } finally {
    loading.value = false
  }
}

const goBackToHome = () => router.push({ name: 'home', query: { lang: currentLanguage.value } })

const hideBrokenImage = (event: Event) => {
  if (event.target instanceof HTMLElement) event.target.hidden = true
}

watch([recipeData, currentLanguage], refreshHead, { immediate: true })

watch(currentLanguage, (language) => router.replace({ ...route, query: { ...route.query, lang: language } }))

watch(() => route.params.slug, (slug) => slug && loadRecipe(), { immediate: true })
</script>

<template>
  <div class="page">
    <div>
      <UiButton variant="ghost" size="sm" @click="goBackToHome">
        <UiIcon name="arrow-left" :size="16" />{{ t('backToHome') }}
      </UiButton>
    </div>

    <div v-if="loading" class="page page--loading" aria-busy="true">
      <UiSkeleton width="60%" height="2.5rem" />
      <UiSkeleton height="12rem" />
    </div>

    <UiEmptyState v-else-if="error" :heading-level="1" icon="alert" :title="error">
      <UiButton @click="goBackToHome">{{ t('backToHome') }}</UiButton>
    </UiEmptyState>

    <template v-else-if="recipeData">
      <div class="page">
        <h1 class="page-title">{{ recipeData.title }}</h1>
        <div class="meta-row">
          <UiBadge v-if="recipe?.cuisine" tone="brand">{{ recipe.cuisine }}</UiBadge>
          <UiBadge>{{ recipeData.ingredients.length }} {{ t('ingredients') }}</UiBadge>
          <UiBadge>{{ recipeData.steps.length }} {{ t('steps') }}</UiBadge>
        </div>
        <!-- The text and pictures are copied from this page, so the credit comes before the recipe. -->
        <aside v-if="recipe?.url && sourceHost" class="recipe-source">
          <h2 class="recipe-source__title">{{ t('sourceHeading') }}</h2>
          <p>{{ t('sourceNote', { site: sourceHost }) }}</p>
          <a :href="recipe.url" target="_blank" rel="noopener noreferrer">{{ t('sourceLink', { site: sourceHost }) }}</a>
        </aside>
      </div>

      <div class="recipe-sections">
        <section class="recipe-panel">
          <h2 class="section-title">{{ t('ingredients') }}</h2>
          <ul class="ingredient-list">
            <li v-for="(ingredient, index) in recipeData.ingredients" :key="index">{{ ingredient }}</li>
          </ul>
        </section>

        <section class="recipe-panel">
          <h2 class="section-title">{{ t('instructions') }}</h2>
          <ol class="step-list">
            <li v-for="(step, index) in recipeData.steps" :key="index" class="step-item">
              <div class="meta-row">
                <UiBadge tone="brand">{{ index + 1 }}</UiBadge>
                <h3 class="visually-hidden">{{ t('step') }} {{ index + 1 }}</h3>
              </div>
              <img
                v-if="step.image"
                class="step-image"
                :src="step.image"
                :alt="`${t('step')} ${index + 1}`"
                loading="lazy"
                decoding="async"
                @error="hideBrokenImage"
              />
              <p>{{ step.content }}</p>
            </li>
          </ol>
        </section>
      </div>
    </template>
  </div>
</template>
