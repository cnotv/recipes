<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import { useId } from 'vue'
import UiIconButton from './UiIconButton.vue'

defineProps<{ title: string; description?: string; closeLabel: string }>()
// Reka leaves the id of the content empty, which is invalid HTML; a generated one replaces it.
const contentId = useId()
const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="ui-dialog__overlay" />
      <DialogContent :id="contentId" class="ui-dialog__content">
        <div class="ui-dialog__head">
          <DialogTitle class="ui-dialog__title">{{ title }}</DialogTitle>
          <DialogClose as-child><UiIconButton icon="close" :label="closeLabel" size="sm" /></DialogClose>
        </div>
        <DialogDescription v-if="description" class="ui-dialog__description">{{ description }}</DialogDescription>
        <div class="ui-dialog__body"><slot /></div>
        <div v-if="$slots.footer" class="ui-dialog__footer"><slot name="footer" /></div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style>
.ui-dialog__overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: var(--color-bg-overlay);
}

.ui-dialog__content {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 51;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: min(32rem, calc(100vw - var(--space-8)));
  max-height: 85vh;
  padding: var(--space-6);
  overflow: auto;
  transform: translate(-50%, -50%);
  border: var(--size-border) solid var(--color-border-default);
  border-radius: var(--radius-xl);
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-raised);
}

.ui-dialog__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.ui-dialog__title {
  font: 700 var(--font-size-xl) / var(--font-line-snug) var(--font-family-display);
}

.ui-dialog__description {
  color: var(--color-text-secondary);
  font: 400 var(--font-size-md) / var(--font-line-normal) var(--font-family-body);
}

.ui-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-2);
}
</style>
