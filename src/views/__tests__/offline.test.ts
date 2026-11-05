// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestRouter, testPlugins } from './support'
import OfflineView from '../OfflineView.vue'

describe('offline view', () => {
  it('offers a retry while the browser is offline', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
    const wrapper = mount(OfflineView, { global: { plugins: testPlugins(createTestRouter()) } })
    expect(wrapper.find('h1').text()).toContain('Offline')
    const retry = wrapper.findAll('button').find((button) => button.text().includes('Retry'))
    expect(retry?.attributes('disabled')).toBeUndefined()
  })
})
