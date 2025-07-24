import { ref, watch } from 'vue'
import type { SupportedLanguage } from '../types/Recipe'

/**
 * Language preference management composable
 * - Automatically detects user's region language on first visit
 * - Stores language preference in localStorage
 * - Provides reactive language state across the app
 */

const LANGUAGE_STORAGE_KEY = 'recipe-app-language'

// Function to detect user's region language
function detectUserLanguage(): SupportedLanguage {
  // Get browser language
  const browserLang = navigator.language.toLowerCase()
  
  // Map browser languages to our supported languages
  const languageMap: Record<string, SupportedLanguage> = {
    'en': 'en',
    'en-us': 'en',
    'en-gb': 'en',
    'en-au': 'en',
    'en-ca': 'en',
    'de': 'de',
    'de-de': 'de',
    'de-at': 'de',
    'de-ch': 'de',
    'ja': 'jp',
    'ja-jp': 'jp',
    'th': 'th',
    'th-th': 'th'
  }
  
  // Try exact match first
  if (languageMap[browserLang]) {
    return languageMap[browserLang]
  }
  
  // Try language code only (e.g., 'en' from 'en-US')
  const langCode = browserLang.split('-')[0]
  if (languageMap[langCode]) {
    return languageMap[langCode]
  }
  
  // Default to English
  return 'en'
}

// Function to get stored language preference
function getStoredLanguage(): SupportedLanguage | null {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (stored) {
      const supportedLanguages: SupportedLanguage[] = ['en', 'de', 'jp', 'th']
      if (supportedLanguages.includes(stored as SupportedLanguage)) {
        return stored as SupportedLanguage
      }
    }
  } catch (error) {
    console.warn('Failed to read language preference from localStorage:', error)
  }
  return null
}

// Function to store language preference
function storeLanguage(language: SupportedLanguage): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  } catch (error) {
    console.warn('Failed to store language preference to localStorage:', error)
  }
}

// Initialize language preference
const storedLanguage = getStoredLanguage()
const detectedLanguage = detectUserLanguage()
const defaultLanguage = storedLanguage || detectedLanguage

// Reactive language preference
export const currentLanguage = ref<SupportedLanguage>(defaultLanguage)

// Flag to track if we used auto-detection
export const wasLanguageAutoDetected = ref(!storedLanguage && detectedLanguage !== 'en')

// Watch for changes and store them
watch(currentLanguage, (newLanguage) => {
  storeLanguage(newLanguage)
}, { immediate: true })

// Composable function
export function useLanguagePreference() {
  const setLanguage = (language: SupportedLanguage) => {
    currentLanguage.value = language
  }
  
  const getLanguageName = (key: SupportedLanguage): string => {
    const languageNames: Record<SupportedLanguage, string> = {
      en: 'English',
      de: 'Deutsch',
      jp: '日本語',
      th: 'ไทย'
    }
    return languageNames[key] || key
  }
  
  return {
    currentLanguage,
    setLanguage,
    getLanguageName,
    detectUserLanguage,
    getStoredLanguage,
    wasLanguageAutoDetected
  }
}
