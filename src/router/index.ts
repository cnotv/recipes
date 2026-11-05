import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/HomeView.vue'
import RecipeDetail from '../views/RecipeDetail.vue'
import VoteCreate from '../views/VoteCreateView.vue'
import VoteSession from '../views/VoteSessionView.vue'
import Offline from '../views/OfflineView.vue'
import NotFound from '../views/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/daily-vote',
      redirect: { name: 'vote-create' }
    },
    {
      path: '/vote/new',
      name: 'vote-create',
      component: VoteCreate
    },
    {
      path: '/vote/:id',
      name: 'vote-session',
      component: VoteSession,
      props: true
    },
    {
      path: '/recipe/:slug',
      name: 'recipe-detail',
      component: RecipeDetail,
      props: true
    },
    {
      path: '/submit',
      name: 'submit',
      component: () => import('../views/SubmitView.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue')
    },
    {
      path: '/ui',
      name: 'ui-kit',
      component: () => import('../ui/UiKitPage.vue')
    },
    {
      path: '/offline',
      name: 'offline',
      component: Offline
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound
    }
  ]
})

export default router
