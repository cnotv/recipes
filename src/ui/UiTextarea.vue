<script setup lang="ts">
import { computed, useId } from 'vue'
import './field.css'

const props = defineProps<{
  label: string
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  rows?: number
}>()
const model = defineModel<string>({ default: '' })
const id = useId()
const describedBy = computed(() => (props.error || props.hint ? `${id}-note` : undefined))
</script>

<template>
  <div class="ui-field">
    <label class="ui-field__label" :for="id">{{ label }}</label>
    <textarea
      :id="id"
      v-model="model"
      class="ui-field__control"
      :class="{ 'ui-field__control--error': error }"
      :rows="rows ?? 4"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="describedBy"
    />
    <p v-if="error || hint" :id="`${id}-note`" class="ui-field__note" :class="{ 'ui-field__note--error': error }">
      {{ error || hint }}
    </p>
  </div>
</template>
