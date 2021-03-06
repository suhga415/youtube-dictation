import { createRouter, createWebHistory, RouteRecordRaw, useRoute } from 'vue-router'
import Home from '../views/Home.vue'
import Dictation from '../views/Dictation.vue'
import DictationIndex from '../views/DictationIndex.vue'
import User from '../views/User.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/dictation',
    name: 'dictation-index',
    component: DictationIndex
  },
  {
    path: '/dictation/:id/:lang/:transl?',
    name: 'dictation',
    component: Dictation
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/user',
    name: 'user',
    component: User
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
