<template>
  <div class="offline-page">
    <div class="offline-content">
      <div class="offline-icon">📡</div>
      <h1 class="offline-title">You're Offline</h1>
      <p class="offline-description">
        Don't worry! You can still browse your cached recipes.
        New recipes will be available when you're back online.
      </p>
      <div class="offline-status">
        <div class="status-indicator" :class="{ 'online': isOnline, 'offline': !isOnline }">
          {{ isOnline ? '🟢 Online' : '🔴 Offline' }}
        </div>
      </div>
      <button @click="retryConnection" class="retry-btn" :disabled="isOnline">
        {{ isOnline ? 'Connected!' : 'Retry Connection' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const isOnline = ref(navigator.onLine)
const router = useRouter()

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine
  if (isOnline.value) {
    // Redirect to home when back online
    setTimeout(() => {
      router.push('/')
    }, 1000)
  }
}

const retryConnection = () => {
  // Try to fetch a small resource to test connection
  fetch('/vite.svg', { cache: 'no-store' })
    .then(() => {
      isOnline.value = true
      updateOnlineStatus()
    })
    .catch(() => {
      console.log('Still offline')
    })
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})
</script>

<style scoped>
.offline-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.offline-content {
  text-align: center;
  background: white;
  padding: 3rem 2rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.offline-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.offline-title {
  font-size: 2rem;
  color: #1f2937;
  margin-bottom: 1rem;
  font-weight: 700;
}

.offline-description {
  color: #6b7280;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.offline-status {
  margin-bottom: 2rem;
}

.status-indicator {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.status-indicator.offline {
  background: #fee2e2;
  color: #dc2626;
}

.status-indicator.online {
  background: #dcfce7;
  color: #16a34a;
}

.retry-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
}

.retry-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.retry-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
