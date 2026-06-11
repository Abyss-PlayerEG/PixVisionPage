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
        // 管理员后台
        {
            path: '/admin',
            name: 'admin',
            component: () => import('../views/Admin.vue'),
            meta: { requiresAuth: true },
        },
        // 创作者面板
        {
            path: '/creator',
            name: 'creator',
            component: () => import('../views/CreatorPanel.vue'),
            meta: { requiresAuth: true },
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

    // 管理员路由 - 额外检查角色权限
    if (to.name === 'admin') {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const userRole = userInfo.user_role || 0;
        
        // 只有审核员(55)和系统管理员(77)可以访问管理后台
        if (userRole !== 55 && userRole !== 77) {
            return { name: 'home' };
        }
    }

    // 创作者路由 - 额外检查角色权限
    if (to.name === 'creator') {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const userRole = userInfo.user_role || 0;
        
        // 只有创作者(22)和系统管理员(77)可以访问创作中心
        if (userRole !== 22 && userRole !== 77) {
            return { name: 'profileMe' };
        }
    }

    // 已登录或不需要认证，直接放行
});

export default router
