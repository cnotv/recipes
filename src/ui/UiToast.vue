<script setup lang="ts">
import { ToastClose, ToastDescription, ToastProvider, ToastRoot, ToastTitle, ToastViewport } from 'reka-ui'
import UiIcon from './UiIcon.vue'
import type { IconName, ToastTone } from './types'

withDefaults(
  defineProps<{ title: string; description?: string; tone?: ToastTone; closeLabel: string; duration?: number }>(),
  { tone: 'info', description: undefined, duration: 5000 },
)
const open = defineModel<boolean>('open', { default: false })
const toneIcon: Record<ToastTone, IconName> = { info: 'info', success: 'check', danger: 'alert' }
</script>

<template>
  <ToastProvider :duration="duration">
    <ToastRoot v-model:open="open" class="ui-toast" :class="`ui-toast--${tone}`">
      <UiIcon :name="toneIcon[tone]" />
      <div class="ui-toast__text">
        <ToastTitle class="ui-toast__title">{{ title }}</ToastTitle>
        <ToastDescription v-if="description" class="ui-toast__description">{{ description }}</ToastDescription>
      </div>
      <ToastClose class="ui-toast__close" :aria-label="closeLabel"><UiIcon name="close" :size="16" /></ToastClose>
    </ToastRoot>
    <ToastViewport class="ui-toast__viewport" />
  </ToastProvider>
</template>

<style>
.ui-toast__viewport {
  position: fixed;
  right: var(--space-4);
  bottom: var(--space-4);
  z-index: 70;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: min(24rem, calc(100vw - var(--space-8)));
  margin: 0;
  padding: 0;
  list-style: none;
}

.ui-toast {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  border: var(--size-border) solid var(--color-border-default);
  border-radius: var(--radius-md);
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-raised);
}

.ui-toast--info .ui-icon {
  color: var(--color-text-brand);
}

.ui-toast--success .ui-icon {
  color: var(--color-text-success);
}

.ui-toast--danger .ui-icon {
  color: var(--color-text-danger);
}

.ui-toast__text {
  flex: 1;
}

.ui-toast__title {
  font: 700 var(--font-size-md) / var(--font-line-snug) var(--font-family-body);
}

.ui-toast__description {
  color: var(--color-text-secondary);
  font: 400 var(--font-size-sm) / var(--font-line-normal) var(--font-family-body);
}

.ui-toast__close {
  padding: var(--space-1);
  border: 0;
  border-radius: var(--radius-sm);
  background: none;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.ui-toast__close:focus-visible {
  outline: var(--size-border-strong) solid var(--color-border-focus);
}
</style>
