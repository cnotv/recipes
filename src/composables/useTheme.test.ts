// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { useTheme } from './useTheme'

describe('theme mode', () => {
  afterEach(() => useTheme().setMode('system'))

  it.each([
    ['light', 'light'],
    ['dark', 'dark'],
  ] as const)('%s pins data-theme and is remembered', async (mode, attribute) => {
    useTheme().setMode(mode)
    await nextTick()
    expect(document.documentElement.getAttribute('data-theme')).toBe(attribute)
    expect(localStorage.getItem('preferred-theme')).toBe(mode)
  })

  it('system hands the choice back to the media query', async () => {
    useTheme().setMode('dark')
    await nextTick()
    useTheme().setMode('system')
    await nextTick()
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })
})
