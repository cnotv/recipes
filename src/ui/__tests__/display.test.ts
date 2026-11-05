// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

import UiBadge from '../UiBadge.vue'
import UiAvatar from '../UiAvatar.vue'
import UiProgressBar from '../UiProgressBar.vue'
import UiSkeleton from '../UiSkeleton.vue'
import UiEmptyState from '../UiEmptyState.vue'
import UiHeader from '../UiHeader.vue'
import UiFooter from '../UiFooter.vue'
import UiIcon from '../UiIcon.vue'
import UiRecipeCard from '../UiRecipeCard.vue'
import { iconNames } from '../icons'
import type { BadgeTone } from '../types'

describe('display components', () => {
  it.each(['neutral', 'brand', 'success', 'highlight', 'danger'] as BadgeTone[])('badge %s', (tone) => {
    expect(mount(UiBadge, { props: { tone }, slots: { default: 'x' } }).classes()).toContain(`ui-badge--${tone}`)
  })

  it('draws every icon with at least one path', () => {
    expect(iconNames).toHaveLength(16)
    iconNames.forEach((name) => expect(mount(UiIcon, { props: { name } }).findAll('path').length).toBeGreaterThan(0))
  })

  it.each(['sm', 'md', 'lg'] as const)('avatar falls back to initials in size %s', async (size) => {
    const wrapper = mount(UiAvatar, { props: { name: 'giuseppe leo', size } })
    await flushPromises()
    expect(wrapper.classes()).toContain(`ui-avatar--${size}`)
    expect(wrapper.text()).toBe('GL')
  })

  it('progress bar reports its value', () => {
    const wrapper = mount(UiProgressBar, { props: { value: 40, label: 'Votes' } })
    expect(wrapper.attributes('role')).toBe('progressbar')
    expect(wrapper.attributes('aria-valuenow')).toBe('40')
    expect(wrapper.attributes('aria-label')).toBe('Votes')
  })

  it('skeleton is hidden from assistive tech and sized', () => {
    const wrapper = mount(UiSkeleton, { props: { width: '50%', height: '2rem', round: true } })
    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.attributes('style')).toContain('width: 50%')
    expect(wrapper.classes()).toContain('ui-skeleton--round')
  })

  it('empty state shows title, description and action', () => {
    const wrapper = mount(UiEmptyState, { props: { icon: 'search', title: 'Nothing', description: 'Try again' }, slots: { default: '<button>Go</button>' } })
    expect(wrapper.find('h3').text()).toBe('Nothing')
    expect(wrapper.text()).toContain('Try again')
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('header and footer render their slots', () => {
    const header = mount(UiHeader, { props: { brand: 'Recipes' }, slots: { default: '<a>Home</a>', actions: '<b>Act</b>' } })
    expect(header.element.tagName).toBe('HEADER')
    expect(header.text()).toContain('Recipes')
    expect(header.find('nav a').exists()).toBe(true)
    const footer = mount(UiFooter, { slots: { default: '<a>Legal</a>', note: 'Made here' } })
    expect(footer.element.tagName).toBe('FOOTER')
    expect(footer.text()).toContain('Made here')
  })
})

describe('UiRecipeCard', () => {
  const recipe = { title: 'Gyudon', cuisine: 'Japanese', minutes: 25 }

  it('renders the recipe and a winner flag', () => {
    const wrapper = mount(UiRecipeCard, { props: { recipe, minutesLabel: 'min', highlight: 'Winner' } })
    expect(wrapper.find('h3').text()).toBe('Gyudon')
    expect(wrapper.text()).toContain('25 min')
    expect(wrapper.find('.ui-badge--highlight').text()).toBe('Winner')
  })

  it('opens from its single button, reachable by keyboard', async () => {
    const wrapper = mount(UiRecipeCard, { props: { recipe, minutesLabel: 'min' } })
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(1)
    await buttons[0].trigger('click')
    expect(wrapper.emitted('open')).toHaveLength(1)
  })
})
