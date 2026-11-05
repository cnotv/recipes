<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import UiBadge from '../ui/UiBadge.vue'
import UiButton from '../ui/UiButton.vue'
import UiEmptyState from '../ui/UiEmptyState.vue'

const { t } = useI18n()
const router = useRouter()
const isOnline = ref(navigator.onLine)

const syncOnlineStatus = () => {
  isOnline.value = navigator.onLine
  // Leave the offline page shortly after the connection returns.
  if (isOnline.value) setTimeout(() => router.push('/'), 1000)
}

const retryConnection = () =>
  fetch('/vite.svg', { cache: 'no-store' })
    .then(() => {
      isOnline.value = true
      syncOnlineStatus()
    })
    .catch(() => {
      isOnline.value = false
    })

onMounted(() => {
  window.addEventListener('online', syncOnlineStatus)
  window.addEventListener('offline', syncOnlineStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', syncOnlineStatus)
  window.removeEventListener('offline', syncOnlineStatus)
})
</script>

<template>
  <div class="centered">
    <UiEmptyState :heading-level="1" icon="alert" :title="t('offlineTitle')" :description="t('offlineDescription')">
      <UiBadge :tone="isOnline ? 'success' : 'danger'">{{ isOnline ? t('statusOnline') : t('statusOffline') }}</UiBadge>
      <UiButton :disabled="isOnline" @click="retryConnection">
        {{ isOnline ? t('connected') : t('retryConnection') }}
      </UiButton>
    </UiEmptyState>
  </div>
</template>
