<script setup>
import { watch, onUnmounted } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useWebSocket } from '@/composables/message/useWebSocket';

// 认证状态
const { isLoggedIn } = useAuth();

// 路由状态
const route = useRoute();

// WebSocket 连接管理
const { connect, disconnect } = useWebSocket();

// 监听登录状态变化，自动管理 WebSocket 连接
watch(isLoggedIn, (newVal) => {
  if (newVal) {
    console.log('🔑 用户登录，建立 WebSocket 连接');
    connect();
  } else {
    console.log('🚪 用户登出，断开 WebSocket 连接');
    disconnect();
  }
}, { immediate: true });
</script>

<template>
  <RouterView />
</template>

<style>
/* 全局样式配置 */
*{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,body{
  background-color: #1a1a1a;
}

/* 全局滚动条样式 */
/* Webkit浏览器（Chrome, Safari, Edge等） */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #242424;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #505050;
  border-radius: 4px;
  transition: background 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: #777777;
}

::-webkit-scrollbar-corner {
  background: #242424;
}

/* Firefox浏览器 */
* {
  scrollbar-width: thin;
  scrollbar-color: #505050 #242424;
}
</style>
