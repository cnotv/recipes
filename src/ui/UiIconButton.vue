<script setup lang="ts">
import UiIcon from './UiIcon.vue'
import type { ButtonVariant, ControlSize, ForcedState, IconName } from './types'

withDefaults(
  defineProps<{
    icon: IconName
    /** Accessible name; an icon alone says nothing to a screen reader. */
    label: string
    variant?: ButtonVariant
    size?: ControlSize
    disabled?: boolean
    forcedState?: ForcedState
  }>(),
  { variant: 'ghost', size: 'md', disabled: false, forcedState: undefined },
)
</script>

<template>
  <button
    class="ui-button ui-icon-button"
    :class="[`ui-button--${variant}`, `ui-button--${size}`]"
    type="button"
    :aria-label="label"
    :title="label"
    :disabled="disabled"
    :data-forced="forcedState"
  >
    <UiIcon :name="icon" :size="size === 'sm' ? 16 : 20" />
  </button>
</template>

<style>
.ui-icon-button {
  width: var(--size-control-md);
  padding: 0;
}

.ui-icon-button.ui-button--sm {
  width: var(--size-control-sm);
}
</style>
