// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

import { nextTick } from 'vue'
import UiTabs from '../UiTabs.vue'
import UiDialog from '../UiDialog.vue'
import UiToast from '../UiToast.vue'

const items = [
  { value: 'a', label: 'Ingredients' },
  { value: 'b', label: 'Steps' },
]

describe('UiTabs', () => {
  it('renders tabs and the active panel', () => {
    const wrapper = mount(UiTabs, { props: { items, modelValue: 'a' }, slots: { a: 'Panel A', b: 'Panel B' } })
    const triggers = wrapper.findAll('[role=tab]')
    expect(triggers).toHaveLength(2)
    expect(triggers[0].attributes('aria-selected')).toBe('true')
    expect(wrapper.find('[role=tabpanel]').text()).toBe('Panel A')
  })

  it('activates a tab when it takes focus, which is what the arrow keys do', async () => {
    const wrapper = mount(UiTabs, {
      attachTo: document.body,
      props: { items, modelValue: 'a', 'onUpdate:modelValue': (value: string) => wrapper.setProps({ modelValue: value }) },
      slots: { a: 'Panel A', b: 'Panel B' },
    })
    await wrapper.findAll('[role=tab]')[1].trigger('focus')
    await flushPromises()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b'])
    wrapper.unmount()
  })
})

describe('UiDialog', () => {
  it('shows a labelled modal and closes on Escape', async () => {
    const wrapper = mount(UiDialog, {
      attachTo: document.body,
      props: { open: true, title: 'Delete', description: 'Sure?', closeLabel: 'Close' },
      slots: { default: 'Body', footer: '<button>Ok</button>' },
    })
    await nextTick()
    const dialog = document.body.querySelector('[role=dialog]')
    expect(dialog).not.toBeNull()
    expect(dialog?.textContent).toContain('Delete')
    expect(document.body.querySelector('[aria-label=Close]')).not.toBeNull()
    dialog?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
    wrapper.unmount()
  })

  it('renders nothing while closed', () => {
    mount(UiDialog, { attachTo: document.body, props: { open: false, title: 'Hidden', closeLabel: 'Close' } })
    expect(document.body.querySelector('[role=dialog]')).toBeNull()
  })
})

describe('UiToast', () => {
  it.each(['info', 'success', 'danger'] as const)('renders the %s tone with a close control', async (tone) => {
    const wrapper = mount(UiToast, { attachTo: document.body, props: { open: true, title: 'Saved', tone, closeLabel: 'Dismiss' } })
    await nextTick()
    expect(document.body.querySelector(`.ui-toast--${tone}`)).not.toBeNull()
    expect(document.body.querySelector('[aria-label=Dismiss]')).not.toBeNull()
    wrapper.unmount()
  })
})
