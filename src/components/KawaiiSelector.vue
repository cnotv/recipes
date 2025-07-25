<template>
  <div class="kawaii-selector">
    <label v-if="label">{{ label }}</label>
    <select 
      :value="modelValue" 
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      :class="{ 'full-width': fullWidth }"
    >
      <option 
        v-for="option in options" 
        :key="option.value" 
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
interface Option {
  value: string
  label: string
}

interface Props {
  modelValue: string
  options: Option[]
  label?: string
  fullWidth?: boolean
}

defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style scoped>
.kawaii-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--theme-surface, #fff);
  padding: 10px 16px;
  border-radius: 20px;
  border: 2px solid var(--theme-primary, #4a90e2);
  transition: all 0.3s ease;
}

.kawaii-selector:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.2);
}

.kawaii-selector label {
  font-weight: 600;
  color: var(--theme-text, #2d3748);
  font-size: 13px;
  white-space: nowrap;
}

.kawaii-selector select {
  padding: 4px 8px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  background: var(--theme-background, #f8fafc);
  color: var(--theme-text, #2d3748);
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
}

.kawaii-selector select.full-width {
  min-width: 120px;
}

.kawaii-selector select:hover {
  background: var(--theme-border, #e2e8f0);
}

.kawaii-selector select option {
  background: var(--theme-surface, #fff);
  color: var(--theme-text, #2d3748);
  padding: 8px;
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .kawaii-selector {
    padding: 8px 12px;
    gap: 6px;
  }
  
  .kawaii-selector select {
    min-width: 80px;
    font-size: 12px;
  }
  
  .kawaii-selector select.full-width {
    min-width: 90px;
  }
}
</style>
