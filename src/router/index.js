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

        // 以下路由仅在开发环境启用,构建后自动去除以下路由
        ...(import.meta.env.DEV ? [
            {
                path: '/demo/toast',
                name: 'toastDemo',
                component: () => import('../views/demo/ToastDemo.vue'),
            },
        ] : []),
                
        // 404页面 - 捕获所有未匹配的路径（必须放在最后）
        {
            path: '/:pathMatch(.*)*',
            name: 'notFound',
            component: () => import('../views/NotFound.vue'),
        },
    ],
})

export default router
