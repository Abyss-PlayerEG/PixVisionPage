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
        {
            path: '/profile/:identifier?',
            name: 'profile',
            component: () => import('../views/Profile.vue'),
            meta: { requiresAuth: true }, // 标记需要登录访问
        },
        // 404页面 - 捕获所有未匹配的路径（必须放在最后）
        {
            path: '/:pathMatch(.*)*',
            name: 'notFound',
            component: () => import('../views/NotFound.vue'),
        },
        // 以下路由仅在开发环境启用,构建后自动去除以下路由
        ...(import.meta.env.DEV ? [
            {
                path: '/demo/toast',
                name: 'toastDemo',
                component: () => import('../views/demo/ToastDemo.vue'),
            },
            {
                path: '/demo/icons',
                name: 'icons',
                component: () => import('../views/demo/IconDemo.vue'),
            }
        ] : []),
    ],
})

// 全局前置守卫 - 检查需要认证的路由
router.beforeEach((to, from, next) => {
    // 检查路由是否需要认证
    if (to.meta.requiresAuth) {
        // 检查是否有 token
        const token = localStorage.getItem('token');
        
        if (!token) {
            // 未登录，重定向到404页面
            next({ name: 'notFound' });
        } else {
            // 已登录，允许访问
            next();
        }
    } else {
        // 不需要认证的路由，直接放行
        next();
    }
});

export default router
