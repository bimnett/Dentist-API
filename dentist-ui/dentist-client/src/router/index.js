import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AppointmentView from '../views/AppointmentView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/appointments',
      name: 'appointments',
      component: AppointmentView,
      meta: { requiresAuth: true },
    },
  ],
})

export default router
