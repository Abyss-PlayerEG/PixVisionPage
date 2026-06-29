import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {banner} from "@/egg.js";

import App from './App.vue'
import router from './router'
import { initAuthInterceptor } from '@/utils/authInterceptor'
// import { initResizeReload } from '@/utils/resizeReload'  // 已禁用：会导致生产环境页面加载时无限刷新

// 品牌色彩变量（全局 CSS 自定义属性）
import '@/assets/CSS/variables.css'

//字体引入
import '@/assets/FONTS/font.css' // 引入字体声明文件

// 初始化全局功能
initAuthInterceptor() // 401 拦截器
// initResizeReload()    // 窗口大小变化自动刷新 — 已禁用：resize 事件在页面加载时触发导致无限 reload

// 控制台横幅

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')

// 显示横幅
banner()
