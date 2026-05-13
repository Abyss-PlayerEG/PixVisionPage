import {createRouter, createWebHistory} from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('../views/mainIndex.vue'),
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/loginView.vue'),
        },

        // 以下路由仅在开发环境启用，构建后自动去除以下路由
        ...(import.meta.env.DEV ? [
            {
                path: '/toast-demo',
                name: 'toastDemo',
                component: () => import('../views/demo/ToastDemo.vue'),
            },
        ] : []),
    ],
})

export default router
