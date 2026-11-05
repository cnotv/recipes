import { createMemoryHistory, createRouter } from 'vue-router'
import { i18n } from '../../composables/useI18n'
import HomeView from '../HomeView.vue'
import RecipeDetail from '../RecipeDetail.vue'
import type { RecipeMetadata } from '../../composables/useRecipes'

const placeholderRoute = { template: '<div />' }

export const createTestRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: HomeView },
      { path: '/recipe/:slug', name: 'recipe-detail', component: RecipeDetail, props: true },
      { path: '/daily-vote', name: 'daily-vote', component: placeholderRoute },
      { path: '/:pathMatch(.*)*', name: 'not-found', component: placeholderRoute },
    ],
  })

export const testPlugins = (router: ReturnType<typeof createTestRouter>) => [router, i18n]

export const buildMetadata = (overrides: Partial<RecipeMetadata> & { slug: string; title: string }): RecipeMetadata => ({
  id: overrides.slug,
  cuisine: 'Italian',
  languages: ['en'],
  description: 'A tasty dish',
  keywords: '',
  stepCount: 2,
  ingredientCount: 3,
  estimatedTime: 30,
  difficulty: 'easy',
  ingredientPreview: ['salt'],
  images: [],
  featuredImage: null,
  dateAdded: '2024-01-01',
  lastModified: '2024-01-01',
  tags: [],
  ...overrides,
})
