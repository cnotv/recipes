import { ref, onMounted, onUnmounted } from 'vue'

export function useLazyImage(src: string, fallback: string = '') {
  const imageRef = ref<HTMLImageElement | null>(null)
  const isLoaded = ref(false)
  const isInView = ref(false)
  const hasError = ref(false)
  const currentSrc = ref('')

  let observer: IntersectionObserver | null = null

  const loadImage = (imageSrc: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        currentSrc.value = imageSrc
        isLoaded.value = true
        hasError.value = false
        resolve()
      }
      img.onerror = () => {
        hasError.value = true
        if (fallback && imageSrc !== fallback) {
          // Try fallback image
          loadImage(fallback).then(resolve).catch(reject)
        } else {
          // Use placeholder
          currentSrc.value = 'https://via.placeholder.com/300x200/E5E7EB/9CA3AF?text=No+Image'
          isLoaded.value = true
          reject(new Error('Failed to load image'))
        }
      }
      img.src = imageSrc
    })
  }

  const initIntersectionObserver = () => {
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      // Fallback for environments without IntersectionObserver
      isInView.value = true
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoaded.value) {
            isInView.value = true
            loadImage(src).catch(() => {
              // Error handling is done in loadImage
            })
            
            // Stop observing once we start loading
            if (observer && imageRef.value) {
              observer.unobserve(imageRef.value)
            }
          }
        })
      },
      {
        rootMargin: '50px', // Start loading 50px before the image enters the viewport
        threshold: 0.1
      }
    )

    if (imageRef.value) {
      observer.observe(imageRef.value)
    }
  }

  const cleanup = () => {
    if (observer && imageRef.value) {
      observer.unobserve(imageRef.value)
    }
    observer = null
  }

  onMounted(() => {
    initIntersectionObserver()
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    imageRef,
    currentSrc,
    isLoaded,
    isInView,
    hasError,
    initIntersectionObserver,
    cleanup
  }
}
