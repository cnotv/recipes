<script setup lang="ts">
import { useId } from 'vue'
import { CheckboxIndicator, CheckboxRoot } from 'reka-ui'
import UiIcon from './UiIcon.vue'

defineProps<{ label: string; disabled?: boolean }>()
const model = defineModel<boolean>({ default: false })
const id = useId()
</script>

<template>
  <div class="ui-checkbox">
    <CheckboxRoot :id="id" v-model="model" class="ui-checkbox__box" :disabled="disabled">
      <CheckboxIndicator class="ui-checkbox__indicator"><UiIcon name="check" :size="14" /></CheckboxIndicator>
    </CheckboxRoot>
    <label class="ui-checkbox__label" :for="id">{{ label }}</label>
  </div>
</template>

<style>
.ui-checkbox {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.ui-checkbox__box {
  display: grid;
  place-items: center;
  width: var(--size-icon-lg);
  height: var(--size-icon-lg);
  padding: 0;
  border: var(--size-border-strong) solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-bg-surface);
  color: var(--color-text-on-brand);
  cursor: pointer;
}

.ui-checkbox__box[data-state='checked'] {
  background: var(--color-bg-brand);
  border-color: var(--color-bg-brand);
}

.ui-checkbox__box:focus-visible {
  outline: var(--size-border-strong) solid var(--color-border-focus);
  outline-offset: 2px;
}

.ui-checkbox__box[data-disabled] {
  background: var(--color-bg-disabled);
  border-color: var(--color-bg-disabled);
  cursor: not-allowed;
}

.ui-checkbox__label {
  font: 400 var(--font-size-md) / var(--font-line-snug) var(--font-family-body);
  color: var(--color-text-primary);
}
</style>
