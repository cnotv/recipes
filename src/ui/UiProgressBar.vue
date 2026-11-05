<script setup lang="ts">
import { ProgressIndicator, ProgressRoot } from 'reka-ui'

defineProps<{ value: number; label: string }>()
</script>

<template>
  <ProgressRoot class="ui-progress" :model-value="value" :aria-label="label">
    <ProgressIndicator class="ui-progress__bar" :style="{ width: `${value}%` }" />
  </ProgressRoot>
</template>

<style>
.ui-progress {
  height: var(--space-2);
  overflow: hidden;
  border-radius: var(--radius-full);
  background: var(--color-bg-subtle);
}

.ui-progress__bar {
  height: 100%;
  border-radius: var(--radius-full);
  background: var(--color-bg-brand);
  transition: width 0.3s;
}
</style>
