// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createTestRouter, testPlugins } from './support'
import RecipeDetail from '../RecipeDetail.vue'
import { useLanguagePreference } from '../../composables/useLanguagePreference'
import type { Recipe } from '../../types/Recipe'

const recipe: Recipe = {
  slug: 'curry',
  url: 'https://example.com/curry',
  cuisine: 'Thai',
  languages: {
    en: { title: 'Green curry', ingredients: ['coconut milk', 'basil'], steps: [{ image: '', content: 'Simmer it' }, { image: '', content: 'Serve it' }] },
    de: { title: 'Gruenes Curry', ingredients: ['Kokosmilch'], steps: [{ image: '', content: 'Koecheln' }] },
  },
}

const loadRecipe = vi.fn(async (slug: string) => (slug === 'curry' ? recipe : undefined))
vi.mock('../../composables/useRecipes', () => ({
  useRecipes: () => ({ loadRecipe, loadRecipeIndex: async () => [] }),
}))

const mountDetail = async (path: string) => {
  const router = createTestRouter()
  await router.push(path)
  const wrapper = mount(RecipeDetail, { props: { slug: 'curry' }, global: { plugins: testPlugins(router) } })
  await flushPromises()
  return { wrapper, router }
}

describe('recipe detail view', () => {
  beforeEach(() => useLanguagePreference().setLanguage('en'))

  it('lists title, ingredients, steps and the source link', async () => {
    const { wrapper } = await mountDetail('/recipe/curry')
    expect(wrapper.find('h1').text()).toBe('Green curry')
    expect(wrapper.text()).toContain('coconut milk')
    expect(wrapper.text()).toContain('Simmer it')
    expect(wrapper.find('a[href="https://example.com/curry"]').exists()).toBe(true)
  })

  it('takes the language from the address', async () => {
    const { wrapper } = await mountDetail('/recipe/curry?lang=de')
    expect(wrapper.find('h1').text()).toBe('Gruenes Curry')
  })

  it('says so when the recipe does not exist', async () => {
    const router = createTestRouter()
    await router.push('/recipe/nothing')
    const wrapper = mount(RecipeDetail, { props: { slug: 'nothing' }, global: { plugins: testPlugins(router) } })
    await flushPromises()
    expect(wrapper.find('h1').text()).toBe('Recipe not found')
  })

  it('goes back home keeping the language', async () => {
    const { wrapper, router } = await mountDetail('/recipe/curry?lang=de')
    const back = wrapper.findAll('button').find((button) => button.text().includes('Zurück'))
    await back?.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('home')
    expect(router.currentRoute.value.query.lang).toBe('de')
  })
})
