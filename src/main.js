import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {banner} from "@/egg.js";

import App from './App.vue'
import router from './router'

//字体引入
import '@/assets/FONTS/font.css' // 引入字体声明文件

// 控制台横幅

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')

// 显示横幅
banner()
