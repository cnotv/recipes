import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import RecipeDetail from '../views/RecipeDetail.vue'
import DailyVote from '../views/DailyVote.vue'
import Offline from '../views/Offline.vue'

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
      name: 'daily-vote',
      component: DailyVote
    },
    {
      path: '/recipe/:url',
      name: 'recipe-detail',
      component: RecipeDetail,
      props: true
    },
    {
      path: '/offline',
      name: 'offline',
      component: Offline
    }
  ]
})

export default router
