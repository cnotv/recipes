// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createTestRouter, testPlugins } from './support'
import App from '../../App.vue'
import NotFoundView from '../NotFoundView.vue'
import { useTheme } from '../../composables/useTheme'

describe('app shell', () => {
  afterEach(() => useTheme().setMode('system'))

  it('has a header with Home and the theme and language controls, and a footer', async () => {
    const router = createTestRouter()
    await router.push('/daily-vote')
    const wrapper = mount(App, { global: { plugins: testPlugins(router) }, attachTo: document.body })
    await flushPromises()
    expect(wrapper.findAll('header .app-nav-link').map((link) => link.attributes('href'))).toEqual(['/', '/vote/new', '/submit'])
    const labels = wrapper.findAll('header label').map((label) => label.text())
    expect(labels).toEqual(['Language', 'Theme'])
    expect(wrapper.find('footer').exists()).toBe(true)
    wrapper.unmount()
  })
})

describe('not found view', () => {
  it('explains the dead end and links home', async () => {
    const router = createTestRouter()
    await router.push('/nowhere')
    const wrapper = mount(NotFoundView, { global: { plugins: testPlugins(router) } })
    expect(wrapper.find('h1').text()).toBe('Page not found')
    await wrapper.find('button').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('home')
  })
})
