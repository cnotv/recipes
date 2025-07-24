import { ref } from 'vue'

export const useServiceWorker = () => {
  const needRefresh = ref(false)
  const updateAvailable = ref(false)
  const offlineReady = ref(false)

  const updateServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          window.location.reload()
        }
      } catch (error) {
        console.error('Service worker update failed:', error)
      }
    }
  }

  const closePrompt = () => {
    offlineReady.value = false
    needRefresh.value = false
    updateAvailable.value = false
  }

  return {
    needRefresh,
    updateAvailable,
    offlineReady,
    updateServiceWorker,
    closePrompt
  }
}
