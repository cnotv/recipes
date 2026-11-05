// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

import UiInput from '../UiInput.vue'
import UiTextarea from '../UiTextarea.vue'
import UiCheckbox from '../UiCheckbox.vue'
import UiSelect from '../UiSelect.vue'

describe('UiInput and UiTextarea', () => {
  it.each([
    ['input', UiInput],
    ['textarea', UiTextarea],
  ] as const)('%s links its label and updates the model', async (tag, component) => {
    const wrapper = mount(component, { props: { label: 'Name', 'onUpdate:modelValue': (value: string) => wrapper.setProps({ modelValue: value }) } })
    const control = wrapper.find(tag)
    expect(wrapper.find('label').attributes('for')).toBe(control.attributes('id'))
    await control.setValue('Okonomiyaki')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Okonomiyaki'])
  })

  it('shows an error and marks the control invalid', () => {
    const wrapper = mount(UiInput, { props: { label: 'Email', error: 'Bad address' } })
    const control = wrapper.find('input')
    expect(control.attributes('aria-invalid')).toBe('true')
    expect(wrapper.find(`#${control.attributes('aria-describedby')}`).text()).toBe('Bad address')
  })

  it('disables the control', () => {
    expect(mount(UiInput, { props: { label: 'Name', disabled: true } }).find('input').attributes('disabled')).toBeDefined()
  })
})

describe('UiCheckbox', () => {
  it('toggles on click and exposes the checked state', async () => {
    const wrapper = mount(UiCheckbox, {
      props: { label: 'Vegetarian', modelValue: false, 'onUpdate:modelValue': (value: boolean) => wrapper.setProps({ modelValue: value }) },
    })
    const box = wrapper.find('button')
    expect(box.attributes('role')).toBe('checkbox')
    expect(box.attributes('aria-checked')).toBe('false')
    await box.trigger('click')
    expect(box.attributes('aria-checked')).toBe('true')
  })

  it('does not toggle when disabled', async () => {
    const wrapper = mount(UiCheckbox, { props: { label: 'Locked', disabled: true } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})

describe('UiSelect', () => {
  it('renders a labelled combobox showing the chosen option', async () => {
    const wrapper = mount(UiSelect, {
      props: { label: 'Cuisine', modelValue: 'it', options: [{ value: 'it', label: 'Italian' }, { value: 'jp', label: 'Japanese' }] },
    })
    await flushPromises()
    const trigger = wrapper.find('button')
    expect(trigger.attributes('role')).toBe('combobox')
    expect(wrapper.find('label').attributes('for')).toBe(trigger.attributes('id'))
    expect(trigger.text()).toContain('Italian')
  })
})
