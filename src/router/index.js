import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:'/',
      name:'home',
      component: () => import('../views/mainIndex.vue'),
    },
    {
      path:'/login',
      name:'login',
      component: () => import('../views/loginView.vue'),
    },
    {
      path:'/toast-demo',
      name:'toastDemo',
      component: () => import('../views/ToastDemo.vue'),
    },
  ],
})

export default router
