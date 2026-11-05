<script setup lang="ts">
import { computed } from 'vue'
import { AvatarFallback, AvatarImage, AvatarRoot } from 'reka-ui'
import type { AvatarSize } from './types'

const props = withDefaults(defineProps<{ name: string; src?: string; size?: AvatarSize }>(), { size: 'md' })
const initials = computed(() =>
  props.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join(''),
)
</script>

<template>
  <AvatarRoot class="ui-avatar" :class="`ui-avatar--${size}`">
    <AvatarImage v-if="src" class="ui-avatar__image" :src="src" :alt="name" />
    <AvatarFallback class="ui-avatar__fallback" :delay-ms="src ? 600 : undefined" :aria-label="name">{{ initials }}</AvatarFallback>
  </AvatarRoot>
</template>

<style>
.ui-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--size-avatar-md);
  height: var(--size-avatar-md);
  overflow: hidden;
  border-radius: var(--radius-full);
  background: var(--color-bg-brand-subtle);
  color: var(--color-text-brand);
  font: 700 var(--font-size-sm) / 1 var(--font-family-display);
}

.ui-avatar--sm {
  width: var(--size-avatar-sm);
  height: var(--size-avatar-sm);
  font-size: var(--font-size-xs);
}

.ui-avatar--lg {
  width: var(--size-avatar-lg);
  height: var(--size-avatar-lg);
  font-size: var(--font-size-lg);
}

.ui-avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
