import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import RecipeDetail from '../views/RecipeDetail.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/recipe/:url',
      name: 'recipe-detail',
      component: RecipeDetail,
      props: true
    }
  ]
})

export default router
