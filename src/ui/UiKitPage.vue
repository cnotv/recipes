<script setup lang="ts">
import { onBeforeUnmount, ref, watchEffect } from 'vue'
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/hanken-grotesk'
import './tokens.css'
import UiAvatar from './UiAvatar.vue'
import UiBadge from './UiBadge.vue'
import UiButton from './UiButton.vue'
import UiCheckbox from './UiCheckbox.vue'
import UiDialog from './UiDialog.vue'
import UiEmptyState from './UiEmptyState.vue'
import UiFooter from './UiFooter.vue'
import UiHeader from './UiHeader.vue'
import UiIcon from './UiIcon.vue'
import UiIconButton from './UiIconButton.vue'
import UiInput from './UiInput.vue'
import UiProgressBar from './UiProgressBar.vue'
import UiRecipeCard from './UiRecipeCard.vue'
import UiSelect from './UiSelect.vue'
import UiSkeleton from './UiSkeleton.vue'
import UiTabs from './UiTabs.vue'
import UiTextarea from './UiTextarea.vue'
import UiToast from './UiToast.vue'
import { iconNames } from './icons'
import type { BadgeTone, ButtonVariant, ForcedState } from './types'

const variants: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger']
const states: { label: string; forced?: ForcedState; disabled?: boolean }[] = [
  { label: 'default' },
  { label: 'hover', forced: 'hover' },
  { label: 'focus', forced: 'focus' },
  { label: 'disabled', disabled: true },
]
const tones: BadgeTone[] = ['neutral', 'brand', 'success', 'highlight', 'danger']

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const theme = ref<'light' | 'dark'>(prefersDark ? 'dark' : 'light')
watchEffect(() => {
  document.documentElement.dataset.theme = theme.value
})
onBeforeUnmount(() => {
  delete document.documentElement.dataset.theme
})

const name = ref('')
const notes = ref('')
const cuisine = ref('italian')
const cuisines = [
  { value: 'italian', label: 'Italian' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'bulgarian', label: 'Bulgarian' },
]
const vegetarian = ref(true)
const tab = ref('ingredients')
const tabs = [
  { value: 'ingredients', label: 'Ingredients' },
  { value: 'steps', label: 'Steps' },
]
const dialogOpen = ref(false)
const toastOpen = ref(false)
const sampleRecipe = { title: 'Saltimbocca alla romana', cuisine: 'Italian', minutes: 30 }
</script>

<template>
  <div class="ui-page">
    <UiHeader brand="Recipes UI kit">
      <a href="#buttons" class="ui-page__link">Buttons</a>
      <a href="#fields" class="ui-page__link">Fields</a>
      <a href="#display" class="ui-page__link">Display</a>
      <template #actions>
        <UiIconButton
          :icon="theme === 'dark' ? 'sun' : 'moon'"
          :label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
          @click="theme = theme === 'dark' ? 'light' : 'dark'"
        />
      </template>
    </UiHeader>

    <main class="ui-page__main">
      <h1 class="ui-page__title">Components</h1>

      <section id="buttons" class="ui-page__section">
        <h2>Button</h2>
        <div v-for="size in ['md', 'sm'] as const" :key="size" class="ui-page__grid">
          <template v-for="variant in variants" :key="variant">
            <UiButton
              v-for="state in states"
              :key="state.label"
              :variant="variant"
              :size="size"
              :disabled="state.disabled"
              :forced-state="state.forced"
            >
              {{ variant }} {{ state.label }}
            </UiButton>
          </template>
        </div>
        <h2>IconButton</h2>
        <div v-for="size in ['md', 'sm'] as const" :key="size" class="ui-page__grid">
          <template v-for="variant in variants" :key="variant">
            <UiIconButton
              v-for="state in states"
              :key="state.label"
              icon="heart"
              :label="`${variant} ${state.label}`"
              :variant="variant"
              :size="size"
              :disabled="state.disabled"
              :forced-state="state.forced"
            />
          </template>
        </div>
        <h2>Icons</h2>
        <ul class="ui-page__icons">
          <li v-for="icon in iconNames" :key="icon"><UiIcon :name="icon" :size="24" /><span>{{ icon }}</span></li>
        </ul>
      </section>

      <section id="fields" class="ui-page__section">
        <h2>Fields</h2>
        <div class="ui-page__form">
          <UiInput v-model="name" label="Recipe name" placeholder="Okonomiyaki" hint="Shown on the card." />
          <UiInput label="Email" type="email" model-value="not an email" error="Enter a valid email address." />
          <UiInput label="Disabled" model-value="Locked" disabled />
          <UiTextarea v-model="notes" label="Notes" placeholder="Anything to remember" />
          <UiSelect v-model="cuisine" label="Cuisine" :options="cuisines" />
          <UiCheckbox v-model="vegetarian" label="Vegetarian" />
          <UiCheckbox :model-value="false" label="Disabled option" disabled />
        </div>
      </section>

      <section id="display" class="ui-page__section">
        <h2>Badge</h2>
        <div class="ui-page__grid">
          <UiBadge v-for="tone in tones" :key="tone" :tone="tone">{{ tone }}</UiBadge>
        </div>
        <h2>Avatar</h2>
        <div class="ui-page__grid">
          <UiAvatar name="Giuseppe Leo" size="sm" />
          <UiAvatar name="Giuseppe Leo" />
          <UiAvatar name="Giuseppe Leo" size="lg" />
        </div>
        <h2>ProgressBar</h2>
        <div class="ui-page__stack">
          <UiProgressBar :value="25" label="Votes cast" />
          <UiProgressBar :value="70" label="Prep done" />
        </div>
        <h2>Tabs</h2>
        <UiTabs v-model="tab" :items="tabs">
          <template #ingredients>Veal, sage, prosciutto, butter, white wine.</template>
          <template #steps>Pound the veal, layer, pin, sear, then deglaze.</template>
        </UiTabs>
        <h2>Skeleton</h2>
        <div class="ui-page__stack">
          <UiSkeleton height="10rem" />
          <UiSkeleton width="60%" />
          <UiSkeleton width="3rem" height="3rem" round />
        </div>
        <h2>RecipeCard</h2>
        <div class="ui-page__grid ui-page__grid--cards">
          <UiRecipeCard :recipe="sampleRecipe" minutes-label="min" />
          <UiRecipeCard :recipe="sampleRecipe" highlight="Winner" minutes-label="min" />
        </div>
        <h2>Dialog and Toast</h2>
        <div class="ui-page__grid">
          <UiButton variant="secondary" @click="dialogOpen = true">Open dialog</UiButton>
          <UiButton variant="secondary" @click="toastOpen = true">Show toast</UiButton>
        </div>
        <UiDialog v-model:open="dialogOpen" title="Delete recipe" description="This removes it from your collection." close-label="Close">
          <p>You cannot undo this.</p>
          <template #footer>
            <UiButton variant="ghost" @click="dialogOpen = false">Cancel</UiButton>
            <UiButton variant="danger" @click="dialogOpen = false">Delete</UiButton>
          </template>
        </UiDialog>
        <UiToast v-model:open="toastOpen" title="Recipe saved" description="It is ready offline." tone="success" close-label="Dismiss" />
        <h2>EmptyState</h2>
        <UiEmptyState icon="search" title="No recipes found" description="Try another cuisine or clear the filters.">
          <UiButton variant="secondary">Clear filters</UiButton>
        </UiEmptyState>
      </section>
    </main>

    <UiFooter>
      <a href="#buttons" class="ui-page__link">Back to top</a>
      <template #note>Tokens come from the Recipes UI Kit Figma file.</template>
    </UiFooter>
  </div>
</template>

<style>
.ui-page {
  min-height: 100vh;
  background: var(--color-bg-page);
  color: var(--color-text-primary);
  font: 400 var(--font-size-md) / var(--font-line-normal) var(--font-family-body);
}

.ui-page__main {
  display: flex;
  flex-direction: column;
  gap: var(--space-10);
  max-width: 64rem;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
}

.ui-page__title {
  font: 800 var(--font-size-4xl) / var(--font-line-tight) var(--font-family-display);
}

.ui-page__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.ui-page__section h2 {
  font: 700 var(--font-size-2xl) / var(--font-line-snug) var(--font-family-display);
}

.ui-page__link {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  color: var(--color-text-brand);
  font-weight: 600;
}

.ui-page__grid {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}

.ui-page__grid--cards > * {
  flex: 1 1 16rem;
  max-width: 22rem;
}

.ui-page__stack,
.ui-page__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: 26rem;
}

.ui-page__icons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
  gap: var(--space-3);
  padding: 0;
  list-style: none;
}

.ui-page__icons li {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-3);
  border: var(--size-border) solid var(--color-border-default);
  border-radius: var(--radius-md);
  background: var(--color-bg-surface);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}
</style>
