// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { nextTick } from 'vue'
import UiButton from '../UiButton.vue'
import UiIconButton from '../UiIconButton.vue'
import type { ButtonVariant } from '../types'

const variants: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger']

describe('UiButton', () => {
  it.each(variants)('renders the %s variant', (variant) => {
    const wrapper = mount(UiButton, { props: { variant }, slots: { default: 'Save' } })
    expect(wrapper.classes()).toContain(`ui-button--${variant}`)
    expect(wrapper.text()).toBe('Save')
  })

  it('renders the small size and a pinned state', () => {
    const wrapper = mount(UiButton, { props: { size: 'sm', forcedState: 'hover' } })
    expect(wrapper.classes()).toContain('ui-button--sm')
    expect(wrapper.attributes('data-forced')).toBe('hover')
  })

  it('emits click when enabled and stays silent when disabled', async () => {
    const enabled = mount(UiButton)
    await enabled.trigger('click')
    expect(enabled.emitted('click')).toHaveLength(1)
    const disabled = mount(UiButton, { props: { disabled: true } })
    expect(disabled.attributes('disabled')).toBeDefined()
    await disabled.trigger('click')
    expect(disabled.emitted('click')).toBeUndefined()
  })

  it('is a native button, so Enter and Space activate it', () => {
    expect(mount(UiButton).element.tagName).toBe('BUTTON')
    expect(mount(UiButton).attributes('type')).toBe('button')
  })
})

describe('UiIconButton', () => {
  it.each(variants)('renders the %s variant with an accessible name', async (variant) => {
    const wrapper = mount(UiIconButton, { props: { icon: 'heart', label: 'Vote', variant } })
    await nextTick()
    expect(wrapper.attributes('aria-label')).toBe('Vote')
    expect(wrapper.classes()).toContain(`ui-button--${variant}`)
    expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true')
  })

  it('disables and shrinks', () => {
    const wrapper = mount(UiIconButton, { props: { icon: 'plus', label: 'Add', size: 'sm', disabled: true } })
    expect(wrapper.classes()).toContain('ui-button--sm')
    expect(wrapper.attributes('disabled')).toBeDefined()
  })
})
