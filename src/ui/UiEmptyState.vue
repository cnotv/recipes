<script setup lang="ts">
import UiIcon from './UiIcon.vue'
import type { IconName } from './types'

withDefaults(
  defineProps<{ icon: IconName; title: string; description?: string; headingLevel?: 1 | 2 | 3 }>(),
  { description: undefined, headingLevel: 3 },
)
</script>

<template>
  <div class="ui-empty">
    <span class="ui-empty__icon"><UiIcon :name="icon" :size="32" /></span>
    <component :is="`h${headingLevel}`" class="ui-empty__title">{{ title }}</component>
    <p v-if="description" class="ui-empty__description">{{ description }}</p>
    <div v-if="$slots.default" class="ui-empty__action"><slot /></div>
  </div>
</template>

<style>
.ui-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-12) var(--space-6);
  text-align: center;
}

.ui-empty__icon {
  display: grid;
  place-items: center;
  width: var(--size-avatar-lg);
  height: var(--size-avatar-lg);
  border-radius: var(--radius-full);
  background: var(--color-bg-brand-subtle);
  color: var(--color-text-brand);
}

.ui-empty__title {
  color: var(--color-text-primary);
  font: 700 var(--font-size-xl) / var(--font-line-snug) var(--font-family-display);
}

.ui-empty__description {
  max-width: 28rem;
  color: var(--color-text-secondary);
  font: 400 var(--font-size-md) / var(--font-line-normal) var(--font-family-body);
}
</style>
