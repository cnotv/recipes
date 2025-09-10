<template>
  <div v-if="isOpen" class="share-modal-overlay" @click="closeModal">
    <div class="share-modal" @click.stop>
      <div class="modal-header">
        <h3>{{ $t('vote.shareForVoting') }}</h3>
        <button class="close-btn" @click="closeModal" :title="$t('common.close')">
          ✕
        </button>
      </div>
      
      <div class="modal-content">
        <p class="share-description">
          {{ $t('vote.shareDescription') }}
        </p>
        
        <div class="url-container">
          <input 
            ref="urlInput"
            type="text" 
            :value="shareUrl" 
            readonly 
            class="share-url-input"
          />
          <button 
            class="copy-btn" 
            @click="copyUrl" 
            :class="{ copied: isCopied }"
            :title="$t('vote.copyLink')"
          >
            {{ isCopied ? $t('vote.copied') : $t('vote.copyLink') }}
          </button>
        </div>
        
        <div class="share-info">
          <p class="info-text">
            <span class="info-icon">ℹ️</span>
            {{ $t('vote.shareInfo') }}
          </p>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal">
          {{ $t('common.cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useSharing } from '../composables/useSharing'

interface Props {
  isOpen: boolean
  shareUrl: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const { copyToClipboard } = useSharing()

const urlInput = ref<HTMLInputElement>()
const isCopied = ref(false)

const closeModal = () => {
  emit('close')
  isCopied.value = false
}

const copyUrl = async () => {
  const success = await copyToClipboard(props.shareUrl)
  
  if (success) {
    isCopied.value = true
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
    
    // Select the URL text for visual feedback
    if (urlInput.value) {
      urlInput.value.select()
    }
  }
}

// Auto-select URL when modal opens
const selectUrl = () => {
  if (props.isOpen && urlInput.value) {
    nextTick(() => {
      urlInput.value?.select()
    })
  }
}

// Watch for modal opening
import { watch } from 'vue'
watch(() => props.isOpen, selectUrl)
</script>

<style scoped>
.share-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.share-modal {
  background: var(--color-background);
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1rem;
}

.modal-header h3 {
  margin: 0;
  color: var(--color-text);
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--color-surface);
  color: var(--color-text);
}

.modal-content {
  padding: 0 1.5rem;
}

.share-description {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.url-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.share-url-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid var(--color-border);
  border-radius: 0.5rem;
  background: var(--color-surface);
  color: var(--color-text);
  font-family: monospace;
  font-size: 0.9rem;
}

.share-url-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.copy-btn {
  padding: 0.75rem 1rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.copy-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.copy-btn.copied {
  background: var(--color-success);
}

.share-info {
  background: var(--color-info-bg);
  border: 1px solid var(--color-info-border);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.info-text {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 0;
  color: var(--color-info-text);
  font-size: 0.9rem;
  line-height: 1.4;
}

.info-icon {
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.modal-footer {
  padding: 1rem 1.5rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-surface-variant);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .share-modal {
    margin: 1rem;
    max-width: none;
  }
  
  .modal-header,
  .modal-content,
  .modal-footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .url-container {
    flex-direction: column;
  }
  
  .copy-btn {
    width: 100%;
  }
}
</style>
