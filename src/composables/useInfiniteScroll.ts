import { ref, onMounted, onUnmounted } from 'vue'

export function useInfiniteScroll(loadMore: () => void, threshold = 100) {
  const isLoading = ref(false)
  const hasMore = ref(true)

  const handleScroll = () => {
    if (isLoading.value || !hasMore.value) return

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight

    // Check if user is near the bottom of the page
    if (scrollTop + windowHeight >= documentHeight - threshold) {
      isLoading.value = true
      loadMore()
    }
  }

  const reset = () => {
    hasMore.value = true
    isLoading.value = false
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setHasMore = (more: boolean) => {
    hasMore.value = more
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return {
    isLoading,
    hasMore,
    reset,
    setLoading,
    setHasMore
  }
}
