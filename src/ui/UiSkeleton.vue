<script setup lang="ts">
withDefaults(defineProps<{ width?: string; height?: string; round?: boolean }>(), {
  width: '100%',
  height: '1rem',
  round: false,
})
</script>

<template>
  <span
    class="ui-skeleton"
    :class="{ 'ui-skeleton--round': round }"
    :style="{ width, height }"
    aria-hidden="true"
  />
</template>

<style>
.ui-skeleton {
  display: block;
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, var(--color-bg-subtle) 25%, var(--color-bg-disabled) 50%, var(--color-bg-subtle) 75%);
  background-size: 200% 100%;
  animation: ui-skeleton-shimmer 1.4s linear infinite;
}

.ui-skeleton--round {
  border-radius: var(--radius-full);
}

@keyframes ui-skeleton-shimmer {
  to {
    background-position: -200% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ui-skeleton {
    animation: none;
  }
}
</style>
