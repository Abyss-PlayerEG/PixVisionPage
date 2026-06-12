<script setup>
import { watch, onUnmounted } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useWebSocket } from '@/composables/message/useWebSocket';
import { showToast } from '@/utils/notification';

// 认证状态
const { isLoggedIn } = useAuth();

// 路由状态
const route = useRoute();

// WebSocket 连接管理
const { connect, disconnect, onMessage } = useWebSocket();

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

// 全局消息通知处理
let unsubscribeWs = null;

watch(isLoggedIn, (loggedIn) => {
  if (loggedIn) {
    // 注册全局消息监听
    unsubscribeWs = onMessage((data) => {
      if (!data || !data.type) return;
      
      const msg = data.data;
      if (!msg) return;
      
      // 如果当前在消息页面，不显示 toast（避免多余通知）
      const isMessagesPage = route.path === '/messages';
      if (isMessagesPage) {
        console.log('📨 当前在消息页面，跳过 toast 通知');
        return;
      }
      
      // 私信消息通知
      if (msg.message_type === 'private') {
        showToast({
          title: msg.from_nickname || '新消息',
          message: msg.message || msg.content || '收到一条私信',
          type: 'info',
          duration: 4000,
        });
      }
      
      // 系统通知
      if (msg.message_type === 'system') {
        showToast({
          title: '系统通知',
          message: msg.message || msg.content || '收到一条系统通知',
          type: 'info',
          duration: 5000,
        });
      }
    });
  } else {
    // 登出时取消监听
    if (unsubscribeWs) {
      unsubscribeWs();
      unsubscribeWs = null;
    }
  }
}, { immediate: true });

// 组件卸载时清理
onUnmounted(() => {
  if (unsubscribeWs) {
    unsubscribeWs();
  }
});
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
