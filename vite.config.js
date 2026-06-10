import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '0.0.0.0', // 允许外部 IP 访问
    port: 8080,       // 指定端口
    proxy: {
      '/api': {
        target: 'https://pix-version-api.playereg.top',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  // ... 其他配置
  preview: {
    port: 3000,        // 指定预览服务器端口
    strictPort: true,  // 如果端口被占用则直接报错，而不是尝试下一个端口
  },
})
