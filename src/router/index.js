import {createRouter, createWebHistory} from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    scrollBehavior() {
      return { top: 0 }
    },
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
        // 作品详情页
        {
            path: '/work/:id',
            name: 'workDetail',
            component: () => import('../views/WorkDetail.vue'),
        },
        // 个人主页
        {
            path: '/profile/me',
            name: 'profileMe',
            component: () => import('../views/Profile.vue'),
            meta: { requiresAuth: true }, // 个人主页，需要登录
        },
        // 访问者主页视角
        {
            path: '/profile/:identifier',
            name: 'profileVisitor',
            component: () => import('../views/Profile.vue'),
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
            },
            {
                path: '/demo/confirm',
                name: 'confirmDialogDemo',
                component: () => import('../views/demo/ConfirmDialogDemo.vue'),
            },
            {
                path: '/demo/avatar-cropper',
                name: 'avatarCropperDemo',
                component: () => import('../views/demo/AvatarCropperDemo.vue'),
            },
            {
                path: '/demo/vertical-waterfall',
                name: 'verticalWaterfallDemo',
                component: () => import('../views/demo/VerticalWaterfallDemo.vue'),
            },
            {
                path: '/demo/series-grid',
                name: 'seriesGridDemo',
                component: () => import('../views/demo/SeriesGridDemo.vue'),
            },
        ] : []),
    ],
})

// 全局前置守卫 - 检查需要认证的路由
router.beforeEach((to) => {
    // 检查路由是否需要认证
    if (to.meta.requiresAuth) {
        // 检查是否有 token
        const token = localStorage.getItem('token');
        
        if (!token) {
            // 未登录，重定向到登录页面
            return { name: 'login' };
        }
    }
    // 已登录或不需要认证，直接放行
});

export default router
