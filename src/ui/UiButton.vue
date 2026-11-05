<script setup lang="ts">
import type { ButtonVariant, ControlSize, ForcedState } from './types'

withDefaults(
  defineProps<{
    variant?: ButtonVariant
    size?: ControlSize
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
    forcedState?: ForcedState
  }>(),
  { variant: 'primary', size: 'md', disabled: false, type: 'button', forcedState: undefined },
)
</script>

<template>
  <button
    class="ui-button"
    :class="[`ui-button--${variant}`, `ui-button--${size}`]"
    :type="type"
    :disabled="disabled"
    :data-forced="forcedState"
  >
    <slot />
  </button>
</template>

<style>
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: var(--size-control-md);
  padding: 0 var(--space-5);
  border: var(--size-border-strong) solid transparent;
  border-radius: var(--radius-md);
  font: 600 var(--font-size-md) / 1 var(--font-family-body);
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
}

.ui-button--sm {
  min-height: var(--size-control-sm);
  padding: 0 var(--space-4);
  font-size: var(--font-size-sm);
}

.ui-button--primary {
  background: var(--color-bg-brand);
  color: var(--color-text-on-brand);
}

.ui-button--primary:hover:not(:disabled),
.ui-button--primary[data-forced='hover'] {
  background: var(--color-bg-brand-hover);
}

.ui-button--secondary {
  background: var(--color-bg-surface);
  border-color: var(--color-border-strong);
  color: var(--color-text-primary);
}

.ui-button--secondary:hover:not(:disabled),
.ui-button--secondary[data-forced='hover'] {
  background: var(--color-bg-subtle);
}

.ui-button--ghost {
  background: transparent;
  color: var(--color-text-brand);
}

.ui-button--ghost:hover:not(:disabled),
.ui-button--ghost[data-forced='hover'] {
  background: var(--color-bg-brand-subtle);
}

.ui-button--danger {
  background: var(--color-bg-danger);
  color: var(--color-text-on-brand);
}

.ui-button--danger:hover:not(:disabled),
.ui-button--danger[data-forced='hover'] {
  background: var(--color-bg-danger-hover);
}

.ui-button:focus-visible,
.ui-button[data-forced='focus'] {
  outline: var(--size-border-strong) solid var(--color-border-focus);
  outline-offset: 2px;
}

.ui-button:disabled {
  background: var(--color-bg-disabled);
  border-color: transparent;
  color: var(--color-text-muted);
  cursor: not-allowed;
}
</style>
