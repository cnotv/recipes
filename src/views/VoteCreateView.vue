<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import UiButton from '../ui/UiButton.vue'
import UiCheckbox from '../ui/UiCheckbox.vue'
import UiEmptyState from '../ui/UiEmptyState.vue'
import UiInput from '../ui/UiInput.vue'
import UiSelect from '../ui/UiSelect.vue'
import UiToast from '../ui/UiToast.vue'
import { useRecipes } from '../composables/useRecipes'
import type { RecipeMetadata } from '../composables/useRecipes'
import { createVote, voteAvailable } from '../composables/voteApi'
import { useVoteText } from '../composables/voteText'
import './vote.css'

const ALL_CUISINES = '__all__'
const DEFAULT_DURATION_MS = 24 * 60 * 60 * 1000
const MINUTE_MS = 60 * 1000

const text = useVoteText()
const router = useRouter()
const { loadRecipeIndex } = useRecipes()

// A datetime-local input wants local time without a zone.
const toLocalInputValue = (date: Date): string => new Date(date.getTime() - date.getTimezoneOffset() * MINUTE_MS).toISOString().slice(0, 16)

const name = ref('')
const endsAt = ref(toLocalInputValue(new Date(Date.now() + DEFAULT_DURATION_MS)))
const cuisine = ref(ALL_CUISINES)
const recipes = ref<RecipeMetadata[]>([])
const selected = ref<string[]>([])
const loading = ref(true)
const failed = ref(false)
const submitting = ref(false)

const cuisineOptions = computed(() => [
  { value: ALL_CUISINES, label: text('allCuisines') },
  ...[...new Set(recipes.value.flatMap((recipe) => (recipe.cuisine ? [recipe.cuisine] : [])))].sort().map((value) => ({ value, label: value })),
])
const shown = computed(() => recipes.value.filter((recipe) => cuisine.value === ALL_CUISINES || recipe.cuisine === cuisine.value))
const canCreate = computed(() => name.value.trim().length > 0 && selected.value.length > 0 && !submitting.value)

const setSelected = (slug: string, checked: boolean | 'indeterminate'): void => {
  selected.value = checked === true ? [...new Set([...selected.value, slug])] : selected.value.filter((chosen) => chosen !== slug)
}
const selectAllShown = (): void => {
  selected.value = [...new Set([...selected.value, ...shown.value.map((recipe) => recipe.slug)])]
}
const clearSelection = (): void => {
  selected.value = []
}

const submit = async (): Promise<void> => {
  submitting.value = true
  failed.value = false
  try {
    const id = await createVote({ name: name.value.trim(), recipeSlugs: selected.value, endsAt: new Date(endsAt.value).toISOString() })
    await router.push({ name: 'vote-session', params: { id } })
  } catch {
    failed.value = true
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  if (!voteAvailable) return
  recipes.value = await loadRecipeIndex().catch(() => [])
  loading.value = false
})
</script>

<template>
  <main class="vote-page">
    <UiEmptyState v-if="!voteAvailable" icon="info" :title="text('staticTitle')" :description="text('staticText')" />
    <template v-else>
      <header class="vote-page__section">
        <h1 class="vote-page__title">{{ text('startTitle') }}</h1>
        <p class="vote-page__intro">{{ text('startIntro') }}</p>
      </header>
      <form class="vote-page__section" @submit.prevent="submit">
        <div class="vote-page__row">
          <UiInput v-model="name" :label="text('nameLabel')" />
          <UiInput v-model="endsAt" type="datetime-local" :label="text('endLabel')" />
        </div>
        <div class="vote-page__row">
          <UiSelect v-model="cuisine" :label="text('cuisineLabel')" :options="cuisineOptions" />
          <UiButton variant="secondary" @click="selectAllShown">{{ text('selectAll') }}</UiButton>
          <UiButton variant="ghost" @click="clearSelection">{{ text('clearSelection') }}</UiButton>
        </div>
        <h2 class="vote-page__heading">{{ text('recipesHeading') }} ({{ text('selectedCount', { n: selected.length }) }})</h2>
        <p v-if="loading" class="vote-page__intro">{{ text('loadingRecipes') }}</p>
        <p v-else-if="shown.length === 0" class="vote-page__intro">{{ text('noRecipes') }}</p>
        <div v-else class="vote-picker">
          <UiCheckbox
            v-for="recipe in shown"
            :key="recipe.slug"
            :label="recipe.title"
            :model-value="selected.includes(recipe.slug)"
            @update:model-value="(checked) => setSelected(recipe.slug, checked)"
          />
        </div>
        <div class="vote-page__row">
          <UiButton type="submit" :disabled="!canCreate">{{ text('createButton') }}</UiButton>
        </div>
      </form>
      <UiToast v-model:open="failed" tone="danger" :title="text('createFailed')" :close-label="text('closeLabel')" />
    </template>
  </main>
</template>
