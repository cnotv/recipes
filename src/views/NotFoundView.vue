<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import UiButton from '../ui/UiButton.vue'
import UiEmptyState from '../ui/UiEmptyState.vue'

const { t } = useI18n()
const router = useRouter()
</script>

<template>
  <UiEmptyState :heading-level="1" icon="search" :title="t('notFoundTitle')" :description="t('notFoundDescription')">
    <UiButton @click="router.push('/')">{{ t('backToHome') }}</UiButton>
  </UiEmptyState>
</template>
