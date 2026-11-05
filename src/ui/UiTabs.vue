<script setup lang="ts">
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import type { TabItem } from './types'

defineProps<{ items: TabItem[] }>()
const model = defineModel<string>({ required: true })
</script>

<template>
  <TabsRoot v-model="model" class="ui-tabs">
    <TabsList class="ui-tabs__list">
      <TabsTrigger v-for="item in items" :key="item.value" :value="item.value" class="ui-tabs__trigger">
        {{ item.label }}
      </TabsTrigger>
    </TabsList>
    <TabsContent v-for="item in items" :key="item.value" :value="item.value" class="ui-tabs__panel">
      <slot :name="item.value" />
    </TabsContent>
  </TabsRoot>
</template>

<style>
.ui-tabs__list {
  display: flex;
  gap: var(--space-1);
  border-bottom: var(--size-border) solid var(--color-border-default);
}

.ui-tabs__trigger {
  min-height: var(--size-control-md);
  padding: 0 var(--space-4);
  border: 0;
  border-bottom: var(--size-border-strong) solid transparent;
  margin-bottom: calc(var(--size-border) * -1);
  background: transparent;
  color: var(--color-text-secondary);
  font: 600 var(--font-size-md) / 1 var(--font-family-body);
  cursor: pointer;
}

.ui-tabs__trigger[data-state='active'] {
  border-bottom-color: var(--color-bg-brand);
  color: var(--color-text-brand);
}

.ui-tabs__trigger:focus-visible,
.ui-tabs__panel:focus-visible {
  outline: var(--size-border-strong) solid var(--color-border-focus);
  outline-offset: -2px;
}

.ui-tabs__panel {
  padding: var(--space-4) 0;
  color: var(--color-text-primary);
  font: 400 var(--font-size-md) / var(--font-line-normal) var(--font-family-body);
}
</style>
