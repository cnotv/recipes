<script setup lang="ts">
import { iconPaths } from './icons'
import type { IconName } from './types'

withDefaults(defineProps<{ name: IconName; size?: number }>(), { size: 20 })
</script>

<template>
  <svg
    class="ui-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path v-for="path in iconPaths[name]" :key="path" :d="path" />
  </svg>
</template>

<style>
.ui-icon {
  flex: none;
}
</style>
