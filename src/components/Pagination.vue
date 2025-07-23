<template>
  <div class="pagination" v-if="totalPages > 1">
    <button 
      class="pagination-btn" 
      :disabled="currentPage === 1"
      @click="$emit('page-change', currentPage - 1)"
    >
      ← Previous
    </button>
    
    <div class="pagination-numbers">
      <button
        v-for="page in visiblePages"
        :key="page"
        class="pagination-number"
        :class="{ active: page === currentPage }"
        @click="$emit('page-change', page)"
      >
        {{ page }}
      </button>
    </div>
    
    <button 
      class="pagination-btn" 
      :disabled="currentPage === totalPages"
      @click="$emit('page-change', currentPage + 1)"
    >
      Next →
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentPage: number
  totalPages: number
  maxVisiblePages?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxVisiblePages: 5
})

defineEmits<{
  'page-change': [page: number]
}>()

const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = props.maxVisiblePages
  const total = props.totalPages
  const current = props.currentPage
  
  if (total <= maxVisible) {
    // Show all pages if total is less than max visible
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Calculate which pages to show
    let start = Math.max(1, current - Math.floor(maxVisible / 2))
    let end = Math.min(total, start + maxVisible - 1)
    
    // Adjust start if we're near the end
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  }
  
  return pages
})
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 32px 0;
  flex-wrap: wrap;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.pagination-btn:disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
  border-color: #e5e7eb;
}

.pagination-numbers {
  display: flex;
  gap: 4px;
}

.pagination-number {
  width: 40px;
  height: 40px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-number:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.pagination-number.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.pagination-number.active:hover {
  background: #2563eb;
  border-color: #2563eb;
}

@media (max-width: 480px) {
  .pagination {
    gap: 4px;
  }
  
  .pagination-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .pagination-number {
    width: 36px;
    height: 36px;
    font-size: 12px;
  }
}
</style>
