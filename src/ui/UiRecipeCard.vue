<script setup lang="ts">
import UiBadge from './UiBadge.vue'
import UiIcon from './UiIcon.vue'
import type { RecipeCardData } from './types'

defineProps<{
  recipe: RecipeCardData
  /** Marks the card as the vote winner, with this text on a saffron badge. */
  highlight?: string
  minutesLabel: string
}>()
const emit = defineEmits<{ open: [] }>()
</script>

<template>
  <article class="ui-recipe-card">
    <div class="ui-recipe-card__media">
      <img v-if="recipe.imageUrl" :src="recipe.imageUrl" alt="" loading="lazy" />
      <UiIcon v-else name="star" :size="32" />
      <UiBadge v-if="highlight" tone="highlight" class="ui-recipe-card__flag">{{ highlight }}</UiBadge>
    </div>
    <div class="ui-recipe-card__body">
      <h3 class="ui-recipe-card__title">
        <button class="ui-recipe-card__open" type="button" @click="emit('open')">{{ recipe.title }}</button>
      </h3>
      <div class="ui-recipe-card__meta">
        <UiBadge tone="brand">{{ recipe.cuisine }}</UiBadge>
        <span class="ui-recipe-card__time"><UiIcon name="clock" :size="16" />{{ recipe.minutes }} {{ minutesLabel }}</span>
      </div>
    </div>
  </article>
</template>

<style>
.ui-recipe-card {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: var(--size-border) solid var(--color-border-default);
  border-radius: var(--radius-lg);
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-raised);
}

.ui-recipe-card:focus-within {
  outline: var(--size-border-strong) solid var(--color-border-focus);
  outline-offset: 2px;
}

.ui-recipe-card__media {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 16 / 10;
  background: var(--color-bg-brand-subtle);
  color: var(--color-text-brand);
}

.ui-recipe-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ui-recipe-card__flag {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
}

.ui-recipe-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
}

.ui-recipe-card__title {
  font: 700 var(--font-size-lg) / var(--font-line-snug) var(--font-family-display);
}

.ui-recipe-card__open {
  padding: 0;
  border: 0;
  background: none;
  color: var(--color-text-primary);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

/* Stretches the one real button over the whole card so it is a single tab stop. */
.ui-recipe-card__open::after {
  content: '';
  position: absolute;
  inset: 0;
}

.ui-recipe-card__open:focus-visible {
  outline: none;
}

.ui-recipe-card__meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.ui-recipe-card__time {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--color-text-secondary);
  font: 400 var(--font-size-sm) / 1 var(--font-family-body);
}
</style>
