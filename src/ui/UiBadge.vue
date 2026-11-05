<script setup lang="ts">
import type { BadgeTone } from './types'

withDefaults(defineProps<{ tone?: BadgeTone }>(), { tone: 'neutral' })
</script>

<template>
  <span class="ui-badge" :class="`ui-badge--${tone}`"><slot /></span>
</template>

<style>
.ui-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font: 600 var(--font-size-xs) / 1 var(--font-family-body);
}

.ui-badge--neutral {
  background: var(--color-bg-subtle);
  color: var(--color-text-secondary);
}

.ui-badge--brand {
  background: var(--color-bg-brand-subtle);
  color: var(--color-text-brand);
}

.ui-badge--success {
  background: var(--color-bg-success);
  color: var(--color-text-success);
}

.ui-badge--highlight {
  background: var(--color-bg-highlight);
  color: var(--color-text-highlight);
}

.ui-badge--danger {
  background: var(--color-bg-danger-subtle);
  color: var(--color-text-danger);
}
</style>
