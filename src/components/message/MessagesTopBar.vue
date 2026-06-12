<template>
  <header class="mtb-header">
    <!-- 左侧返回按钮 -->
    <button class="mtb-back" @click="handleBack">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      <span class="mtb-btn-text">返回</span>
    </button>

    <!-- 中间标题 -->
    <h1 class="mtb-title">消息中心</h1>

    <!-- 右侧首页按钮 -->
    <button class="mtb-home" @click="handleHome">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      <span class="mtb-btn-text">首页</span>
    </button>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

/**
 * 返回上一页
 */
const handleBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

/**
 * 跳转到首页
 */
const handleHome = () => {
  router.push('/')
}
</script>

<style scoped>
.mtb-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 5%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
}

/* 返回按钮 */
.mtb-back {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.25s ease;
  font-size: 14px;
  font-family: sul-gm1, sans-serif;
}

.mtb-back:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

.mtb-back:active {
  transform: scale(0.95);
}

/* 中间标题 */
.mtb-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  font-family: sul-gm1, sans-serif;
  white-space: nowrap;
}

/* 首页按钮 */
.mtb-home {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.25s ease;
  font-size: 14px;
  font-family: sul-gm1, sans-serif;
}

.mtb-home:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

.mtb-home:active {
  transform: scale(0.95);
}

/* 响应式设计 */
@media (max-width: 640px) {
  .mtb-header {
    padding: 0 16px;
  }

  .mtb-btn-text {
    display: none;
  }

  .mtb-back,
  .mtb-home {
    padding: 8px;
  }

  .mtb-title {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .mtb-title {
    font-size: 14px;
  }
}
</style>