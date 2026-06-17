<template>
  <TopNavBar back-text="返回" home-text="首页" />
  <main class="msg-main">
    <ChatPanel />
  </main>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import TopNavBar from '@/components/TopNavBar.vue'
import ChatPanel from '@/components/message/ChatPanel.vue'

const router = useRouter()
const { isLoggedIn } = useAuth()

/**
 * 检查登录状态
 */
onMounted(() => {
  if (!isLoggedIn.value) {
    console.warn('⚠️ 用户未登录，跳转到登录页')
    router.push('/login')
  }
})
</script>

<style scoped>
/* 主容器 */
.msg-main {
  padding: 64px 24px 16px 24px;
  width: 100%;
  height: 100vh;
  background: #0a0a0a;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

/* 艺术背景效果 */
.msg-main::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(0, 169, 71, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(0, 100, 200, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 60% 80%, rgba(100, 0, 200, 0.03) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

/* 网格纹理 */
.msg-main::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
  z-index: 0;
}

/* 确保子元素在背景之上 */
.msg-main > * {
  position: relative;
  z-index: 1;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .msg-main {
    padding: 56px 0 0;
  }
}
</style>
