<script setup lang="ts">
defineProps<{ brand: string }>()
</script>

<template>
  <header class="ui-header">
    <span class="ui-header__brand">{{ brand }}</span>
    <nav v-if="$slots.default" class="ui-header__nav"><slot /></nav>
    <div v-if="$slots.actions" class="ui-header__actions"><slot name="actions" /></div>
  </header>
</template>

<style>
.ui-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-6);
  min-height: var(--size-control-lg);
  padding: var(--space-2) var(--space-4);
  border-bottom: var(--size-border) solid var(--color-border-default);
  background: var(--color-bg-surface);
}

.ui-header__brand {
  color: var(--color-text-brand);
  font: 800 var(--font-size-xl) / 1 var(--font-family-display);
}

.ui-header__nav {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.ui-header__actions {
  display: flex;
  gap: var(--space-2);
  margin-left: auto;
}

@media (max-width: 40rem) {
  .ui-header__nav {
    order: 3;
    flex-basis: 100%;
  }
}
</style>
