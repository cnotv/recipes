<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import UiButton from '../ui/UiButton.vue'
import UiDialog from '../ui/UiDialog.vue'
import UiToast from '../ui/UiToast.vue'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: string }>
}

const isInstallPromptEvent = (event: Event): event is InstallPromptEvent => 'prompt' in event && 'userChoice' in event

const { t } = useI18n()
const showOfflineNotice = ref(!navigator.onLine)
const needRefresh = ref(false)
const showInstallPrompt = ref(false)
const deferredPrompt = ref<InstallPromptEvent | null>(null)

const showOffline = () => {
  showOfflineNotice.value = true
}

const hideOffline = () => {
  showOfflineNotice.value = false
}

const updateApp = () => window.location.reload()

const installApp = async () => {
  const prompt = deferredPrompt.value
  deferredPrompt.value = null
  showInstallPrompt.value = false
  if (prompt) {
    await prompt.prompt()
    await prompt.userChoice
  }
}

const handleBeforeInstallPrompt = (event: Event) => {
  event.preventDefault()
  if (isInstallPromptEvent(event)) deferredPrompt.value = event
  showInstallPrompt.value = true
}

// The first controllerchange is the service worker taking over a fresh install, not an update.
const hadController = ref(false)

const markRefreshNeeded = () => {
  needRefresh.value = hadController.value
}

onMounted(() => {
  window.addEventListener('online', hideOffline)
  window.addEventListener('offline', showOffline)
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  if ('serviceWorker' in navigator) {
    hadController.value = Boolean(navigator.serviceWorker.controller)
    navigator.serviceWorker.addEventListener('controllerchange', markRefreshNeeded)
  }
})

onUnmounted(() => {
  window.removeEventListener('online', hideOffline)
  window.removeEventListener('offline', showOffline)
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  if ('serviceWorker' in navigator) navigator.serviceWorker.removeEventListener('controllerchange', markRefreshNeeded)
})
</script>

<template>
  <UiToast v-if="showOfflineNotice" v-model:open="showOfflineNotice" tone="info" :title="t('offlineBanner')" :close-label="t('close')" :duration="600000" />

  <UiDialog v-model:open="needRefresh" :title="t('updateAvailable')" :close-label="t('close')">
    <template #footer>
      <UiButton @click="updateApp">{{ t('update') }}</UiButton>
    </template>
  </UiDialog>

  <UiDialog v-model:open="showInstallPrompt" :title="t('installPrompt')" :close-label="t('close')">
    <template #footer>
      <UiButton @click="installApp">{{ t('install') }}</UiButton>
    </template>
  </UiDialog>
</template>
