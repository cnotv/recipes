import { ref, watch } from 'vue'
import type { ThemeMode } from '../types/Theme'

export const themeModes: ThemeMode[] = ['light', 'dark', 'system']

const THEME_STORAGE_KEY = 'preferred-theme'

const isThemeMode = (value: unknown): value is ThemeMode => themeModes.some((mode) => mode === value)

const readStoredMode = (): ThemeMode => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    // Values left by the retired kawaii themes fall back to following the system.
    return isThemeMode(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

const storeMode = (mode: ThemeMode) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode)
  } catch {
    // Private browsing can refuse storage; the choice then lasts for this visit only.
  }
}

/** Light and dark pin `data-theme`; system removes it so the media query in tokens.css decides. */
export const applyThemeMode = (mode: ThemeMode, root: HTMLElement = document.documentElement) =>
  mode === 'system' ? root.removeAttribute('data-theme') : root.setAttribute('data-theme', mode)

const mode = ref<ThemeMode>(readStoredMode())

watch(
  mode,
  (next) => {
    applyThemeMode(next)
    storeMode(next)
  },
  { immediate: true },
)

export const useTheme = () => ({
  mode,
  themeModes,
  setMode: (next: ThemeMode) => {
    mode.value = next
  },
})
