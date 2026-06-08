import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {banner} from "@/egg.js";

import App from './App.vue'
import router from './router'

//字体引入
import '@/assets/FONTS/font.css' // 引入字体声明文件

// ============================================
// 全局 401 拦截器
// 当后端返回 401 时，自动清理前端 token
// ============================================
let isHandling401 = false

const handle401 = () => {
  if (isHandling401) return
  isHandling401 = true
  
  console.warn('[Auth] Token 已失效，清理登录状态')
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  
  // 显示提示后跳转首页
  setTimeout(() => {
    window.location.href = '/'
    isHandling401 = false
  }, 1500)
}

// 重写全局 fetch，自动拦截 HTTP 401
const originalFetch = window.fetch
window.fetch = async function(...args) {
  const response = await originalFetch.apply(this, args)
  
  if (response.status === 401) {
    handle401()
  }
  
  return response
}

// 控制台横幅

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')

// 显示横幅
banner()
