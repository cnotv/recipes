import { ref, computed, watch } from 'vue'

export type Theme = 'masculine-kawaii' | 'pink-kawaii' | 'dark-mode' | 'nature'

export interface ThemeConfig {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    border: string
  }
  gradients: {
    background: string
    header: string
    card: string
    button: string
  }
  fonts: {
    primary: string
    header: string
  }
  icons: {
    primary: string
    secondary: string
  }
}

const themes: Record<Theme, ThemeConfig> = {
  'masculine-kawaii': {
    name: 'blueKawaii',
    colors: {
      primary: '#4a90e2',
      secondary: '#6c757d',
      accent: '#3478d4',
      background: '#f8fafc',
      surface: '#fff',
      text: '#2d3748',
      border: '#e2e8f0'
    },
    gradients: {
      background: 'linear-gradient(135deg, #e8f4f8 0%, #f0f8ff 25%, #f5f7fa 50%, #eef2f7 75%, #f8fafc 100%)',
      header: 'linear-gradient(135deg, #4a90e2, #5ca7f2, #74b9ff, #a29bfe)',
      card: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)',
      button: 'linear-gradient(135deg, #4a90e2, #3478d4)'
    },
    fonts: {
      primary: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      header: "'JetBrains Mono', 'Poppins', monospace"
    },
    icons: {
      primary: '⚡',
      secondary: '(◕‿◕)ゞ'
    }
  },
  'pink-kawaii': {
    name: 'pinkKawaii',
    colors: {
      primary: '#ffb3d9',
      secondary: '#ff9ec7',
      accent: '#e91e63',
      background: '#fff5f5',
      surface: '#fff',
      text: '#8b5a8c',
      border: '#ffccf0'
    },
    gradients: {
      background: 'linear-gradient(135deg, #ffeef8 0%, #fff0f5 25%, #fff5f5 50%, #fdf2f8 75%, #fff 100%)',
      header: 'linear-gradient(135deg, #ffb3d9, #ff9ec7, #ffccf0, #fde2e7)',
      card: 'linear-gradient(135deg, #fff 0%, #fff5f5 100%)',
      button: 'linear-gradient(135deg, #ffb3d9, #ff9ec7)'
    },
    fonts: {
      primary: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      header: "'JetBrains Mono', 'Poppins', monospace"
    },
    icons: {
      primary: '♡',
      secondary: '(◕‿◕)♡'
    }
  },
  'dark-mode': {
    name: 'darkMode',
    colors: {
      primary: '#bb86fc',
      secondary: '#03dac6',
      accent: '#cf6679',
      background: '#121212',
      surface: '#1e1e1e',
      text: '#e0e0e0',
      border: '#333'
    },
    gradients: {
      background: 'linear-gradient(135deg, #0a0a0a 0%, #121212 25%, #1a1a1a 50%, #1e1e1e 75%, #242424 100%)',
      header: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460, #533483)',
      card: 'linear-gradient(135deg, #1e1e1e 0%, #252525 100%)',
      button: 'linear-gradient(135deg, #bb86fc, #9965f4)'
    },
    fonts: {
      primary: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      header: "'JetBrains Mono', 'Poppins', monospace"
    },
    icons: {
      primary: '🌙',
      secondary: '(◉‿◉)'
    }
  },
  'nature': {
    name: 'nature',
    colors: {
      primary: '#4caf50',
      secondary: '#8bc34a',
      accent: '#2e7d32',
      background: '#f1f8e9',
      surface: '#fff',
      text: '#2e5d2e',
      border: '#c8e6c9'
    },
    gradients: {
      background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 25%, #f3e5f5 50%, #e0f2f1 75%, #e8f5e8 100%)',
      header: 'linear-gradient(135deg, #4caf50, #66bb6a, #81c784, #a5d6a7)',
      card: 'linear-gradient(135deg, #fff 0%, #f1f8e9 100%)',
      button: 'linear-gradient(135deg, #4caf50, #2e7d32)'
    },
    fonts: {
      primary: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      header: "'JetBrains Mono', 'Poppins', monospace"
    },
    icons: {
      primary: '🌿',
      secondary: '(◕‿◕)🌸'
    }
  }
}

const THEME_STORAGE_KEY = 'preferred-theme'

// Get initial theme from localStorage or default to masculine-kawaii
const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme
    if (saved && saved in themes) {
      return saved
    }
  }
  return 'masculine-kawaii'
}

const currentTheme = ref<Theme>(getInitialTheme())

export const useTheme = () => {
  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    }
  }

  const themeConfig = computed(() => themes[currentTheme.value])

  // Watch for theme changes and apply CSS variables
  watch(themeConfig, (config) => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement
      root.style.setProperty('--theme-primary', config.colors.primary)
      root.style.setProperty('--theme-secondary', config.colors.secondary)
      root.style.setProperty('--theme-accent', config.colors.accent)
      root.style.setProperty('--theme-background', config.colors.background)
      root.style.setProperty('--theme-surface', config.colors.surface)
      root.style.setProperty('--theme-text', config.colors.text)
      root.style.setProperty('--theme-border', config.colors.border)
      root.style.setProperty('--theme-bg-gradient', config.gradients.background)
      root.style.setProperty('--theme-header-gradient', config.gradients.header)
      root.style.setProperty('--theme-card-gradient', config.gradients.card)
      root.style.setProperty('--theme-button-gradient', config.gradients.button)
      root.style.setProperty('--theme-font-primary', config.fonts.primary)
      root.style.setProperty('--theme-font-header', config.fonts.header)
      root.style.setProperty('--theme-primary-icon', `"${config.icons.primary}"`)
      root.style.setProperty('--theme-secondary-icon', `"${config.icons.secondary}"`)
      
      // Theme-specific decorations
      if (config.name === 'Pink Kawaii') {
        root.style.setProperty('--theme-icons', '"♡✨♡✨♡"')
        root.style.setProperty('--theme-grid-decoration', '"♡ ♡ ♡"')
      } else if (config.name === 'Dark Mode') {
        root.style.setProperty('--theme-icons', '"🌙✨🌙✨🌙"')
        root.style.setProperty('--theme-grid-decoration', '"🌙 ⭐ 🌙"')
      } else if (config.name === 'Nature') {
        root.style.setProperty('--theme-icons', '"🌿✨🌿✨🌿"')
        root.style.setProperty('--theme-grid-decoration', '"🌿 🌸 🌿"')
      } else {
        root.style.setProperty('--theme-icons', '"⚡✨⚡✨⚡"')
        root.style.setProperty('--theme-grid-decoration', '"⚡ ⚡ ⚡"')
      }
    }
  }, { immediate: true })

  return {
    currentTheme,
    setTheme,
    themeConfig,
    themes,
    availableThemes: Object.keys(themes) as Theme[]
  }
}
