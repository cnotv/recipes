import { ref, watch } from 'vue'

const CUISINE_STORAGE_KEY = 'preferred-cuisine'

// Get initial cuisine from localStorage or default to empty (all cuisines)
const getInitialCuisine = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(CUISINE_STORAGE_KEY)
    return saved || ''
  }
  return ''
}

const selectedCuisine = ref<string>(getInitialCuisine())

export const useCuisinePreference = () => {
  const setCuisine = (cuisine: string) => {
    selectedCuisine.value = cuisine
    if (typeof window !== 'undefined') {
      localStorage.setItem(CUISINE_STORAGE_KEY, cuisine)
    }
  }

  // Watch for changes and save to localStorage
  watch(selectedCuisine, (newCuisine) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CUISINE_STORAGE_KEY, newCuisine)
    }
  })

  return {
    selectedCuisine,
    setCuisine
  }
}
