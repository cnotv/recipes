// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { i18n } from '../../composables/useI18n'
import { useLanguagePreference } from '../../composables/useLanguagePreference'
import LegalView from '../LegalView.vue'

describe('LegalView', () => {
  it('shows the German text for German and English for every other language, with the matching lang attribute', () => {
    const { setLanguage } = useLanguagePreference()
    setLanguage('de')
    const german = mount(LegalView, { props: { page: 'impressum' }, global: { plugins: [i18n] } })
    expect(german.find('h1').text()).toBe('Impressum')
    expect(german.attributes('lang')).toBe('de')
    setLanguage('th')
    const other = mount(LegalView, { props: { page: 'datenschutz' }, global: { plugins: [i18n] } })
    expect(other.find('h1').text()).toBe('Privacy policy')
    expect(other.attributes('lang')).toBe('en')
    expect(other.text()).toContain('Hetzner')
    expect(other.text()).toContain('OpenRouter')
  })
})
