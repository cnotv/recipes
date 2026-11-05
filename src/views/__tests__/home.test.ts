// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { buildMetadata, createTestRouter, testPlugins } from './support'
import HomeView from '../HomeView.vue'
import { useCuisinePreference } from '../../composables/useCuisinePreference'
import { useLanguagePreference } from '../../composables/useLanguagePreference'

const recipes = [
  buildMetadata({ slug: 'curry', title: 'Green curry', cuisine: 'Thai', languages: ['en', 'de'] }),
  buildMetadata({ slug: 'sushi', title: 'Sushi rolls', cuisine: 'Japanese', languages: ['de'] }),
  ...Array.from({ length: 14 }, (_, index) =>
    buildMetadata({ slug: `pasta-${index}`, title: `Pasta number ${index}`, cuisine: 'Italian' }),
  ),
]

vi.mock('../../composables/useRecipes', () => ({
  useRecipes: () => ({ loadRecipeIndex: async () => recipes, loadRecipe: async () => undefined }),
}))

const mountHome = async () => {
  const router = createTestRouter()
  await router.push('/')
  const wrapper = mount(HomeView, { global: { plugins: testPlugins(router) } })
  await flushPromises()
  return { wrapper, router }
}

describe('home view', () => {
  beforeEach(() => {
    localStorage.clear()
    useCuisinePreference().setCuisine('')
    useLanguagePreference().setLanguage('en')
  })

  afterEach(() => vi.useRealTimers())

  it('shows the first page of recipes in the chosen language', async () => {
    const { wrapper } = await mountHome()
    expect(wrapper.text()).toContain('Pasta number 0')
    expect(wrapper.text()).toContain('Green curry')
    expect(wrapper.text()).not.toContain('Pasta number 13')
    expect(wrapper.text()).not.toContain('Sushi rolls')
  })

  it('narrows the list to the preferred cuisine', async () => {
    useCuisinePreference().setCuisine('Thai')
    const { wrapper } = await mountHome()
    expect(wrapper.text()).toContain('Green curry')
    expect(wrapper.text()).not.toContain('Pasta number 0')
  })

  it('follows the language preference and writes it to the address', async () => {
    const { wrapper, router } = await mountHome()
    useLanguagePreference().setLanguage('de')
    await flushPromises()
    expect(wrapper.text()).toContain('Sushi rolls')
    expect(wrapper.text()).not.toContain('Pasta number 0')
    expect(router.currentRoute.value.query.lang).toBe('de')
  })

  it('loads the next page when the reader scrolls to the bottom', async () => {
    const { wrapper } = await mountHome()
    vi.useFakeTimers()
    window.dispatchEvent(new Event('scroll'))
    await vi.advanceTimersByTimeAsync(600)
    await flushPromises()
    expect(wrapper.text()).toContain('Pasta number 13')
  })

  it('opens a recipe with its language in the address', async () => {
    const { wrapper, router } = await mountHome()
    const open = wrapper.findAll('button').find((button) => button.text().includes('Green curry') || button.text().includes('View Recipe'))
    expect(open).toBeDefined()
    await open?.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('recipe-detail')
    expect(router.currentRoute.value.query.lang).toBe('en')
  })
})
