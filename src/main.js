import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {banner} from "@/egg.js";

import App from './App.vue'
import router from './router'

// 控制台横幅

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')

// 显示横幅
banner()
