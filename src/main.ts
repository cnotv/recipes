import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { i18n } from './composables/useI18n'

const app = createApp(App).use(router).use(i18n)

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const { registerSW } = await import('virtual:pwa-register')
      
      const updateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
          console.log('App update available')
          // You can show a toast or notification here
          if (confirm('New content available. Reload?')) {
            updateSW()
          }
        },
        onOfflineReady() {
          console.log('App ready to work offline')
          // You can show a toast notification here
        },
        onRegistered(r: ServiceWorkerRegistration | undefined) {
          console.log('SW Registered: ' + r)
        },
        onRegisterError(error: any) {
          console.log('SW registration error', error)
        }
      })
    } catch (error) {
      console.log('PWA not available:', error)
    }
  })
}

app.mount('#app')
