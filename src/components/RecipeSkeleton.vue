<script setup lang="ts">
import UiSkeleton from '../ui/UiSkeleton.vue'
</script>

<template>
  <div class="recipe-skeleton">
    <UiSkeleton height="9rem" />
    <UiSkeleton width="70%" height="1.25rem" />
    <UiSkeleton width="40%" />
  </div>
</template>

<style>
.recipe-skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border: var(--size-border) solid var(--color-border-default);
  border-radius: var(--radius-lg);
  background: var(--color-bg-surface);
}
</style>
