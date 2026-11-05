<script setup lang="ts">
import { useId } from 'vue'
import './field.css'
import {
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from 'reka-ui'
import UiIcon from './UiIcon.vue'
import type { SelectOption } from './types'

defineProps<{ label: string; options: SelectOption[]; placeholder?: string; disabled?: boolean }>()
const model = defineModel<string>()
const id = useId()
</script>

<template>
  <div class="ui-field">
    <label class="ui-field__label" :for="id">{{ label }}</label>
    <SelectRoot v-model="model" :disabled="disabled">
      <SelectTrigger :id="id" class="ui-field__control ui-select__trigger">
        <SelectValue :placeholder="placeholder" />
        <UiIcon name="chevron-down" :size="16" />
      </SelectTrigger>
      <SelectPortal>
        <SelectContent class="ui-select__content" position="popper" :side-offset="4">
          <SelectViewport>
            <SelectItem v-for="option in options" :key="option.value" :value="option.value" class="ui-select__item">
              <SelectItemText>{{ option.label }}</SelectItemText>
              <SelectItemIndicator><UiIcon name="check" :size="16" /></SelectItemIndicator>
            </SelectItem>
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>
  </div>
</template>

<style>
.ui-select__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  text-align: left;
  cursor: pointer;
}

.ui-select__trigger[data-placeholder] {
  color: var(--color-text-muted);
}

.ui-select__content {
  z-index: 60;
  min-width: var(--reka-select-trigger-width);
  padding: var(--space-1);
  border: var(--size-border) solid var(--color-border-default);
  border-radius: var(--radius-md);
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-raised);
}

.ui-select__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  min-height: var(--size-control-sm);
  padding: 0 var(--space-3);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font: 400 var(--font-size-md) / 1 var(--font-family-body);
  cursor: pointer;
  outline: none;
}

.ui-select__item[data-highlighted] {
  background: var(--color-bg-brand-subtle);
  color: var(--color-text-brand);
}
</style>
