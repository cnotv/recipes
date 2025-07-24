<template>
  <div class="pwa-status">
    <!-- Offline indicator -->
    <div v-if="!isOnline" class="offline-indicator">
      📡 You're offline - using cached content
    </div>
    
    <!-- Update available notification -->
    <div v-if="needRefresh" class="update-notification">
      <span>🔄 New version available!</span>
      <button @click="updateApp" class="update-btn">Update</button>
      <button @click="dismissUpdate" class="dismiss-btn">×</button>
    </div>
    
    <!-- Install prompt -->
    <div v-if="showInstallPrompt" class="install-prompt">
      <span>📱 Install Recipe Collection as an app</span>
      <button @click="installApp" class="install-btn">Install</button>
      <button @click="dismissInstall" class="dismiss-btn">×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isOnline = ref(navigator.onLine)
const needRefresh = ref(false)
const showInstallPrompt = ref(false)
let deferredPrompt: any = null

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine
}

const updateApp = () => {
  window.location.reload()
}

const dismissUpdate = () => {
  needRefresh.value = false
}

const installApp = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)
    deferredPrompt = null
    showInstallPrompt.value = false
  }
}

const dismissInstall = () => {
  showInstallPrompt.value = false
  deferredPrompt = null
}

const handleBeforeInstallPrompt = (e: Event) => {
  e.preventDefault()
  deferredPrompt = e
  showInstallPrompt.value = true
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  
  // Check for service worker updates
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      needRefresh.value = true
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
})
</script>

<style scoped>
.pwa-status {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.offline-indicator,
.update-notification,
.install-prompt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.offline-indicator {
  background: #ff9800;
  color: white;
}

.update-notification {
  background: #2196f3;
  color: white;
}

.install-prompt {
  background: #4caf50;
  color: white;
}

.update-btn,
.install-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  margin-left: 12px;
  transition: background-color 0.2s;
}

.update-btn:hover,
.install-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.dismiss-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  margin-left: 8px;
  line-height: 1;
  opacity: 0.8;
}

.dismiss-btn:hover {
  opacity: 1;
}
</style>
