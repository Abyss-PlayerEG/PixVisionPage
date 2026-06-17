<template>
  <div class="top-nav-bar" ref="navBarRef">
    <button class="nav-btn back-btn" @click="goBack">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      <span>{{ backText }}</span>
    </button>
    <button class="nav-btn home-btn" @click="goHome">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      <span>{{ homeText }}</span>
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  backText: {
    type: String,
    default: '返回'
  },
  homeText: {
    type: String,
    default: '首页'
  },
  showBack: {
    type: Boolean,
    default: true
  },
  showHome: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()
const navBarRef = ref(null)
let pageshowHandler = null

const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push('/')
}

// 修复浏览器返回时 BFCache 导致的样式问题
const handleBFCache = () => {
  if (navBarRef.value) {
    // 强制重新应用样式
    navBarRef.value.style.display = 'none'
    void navBarRef.value.offsetHeight // 强制同步重排
    navBarRef.value.style.display = ''
  }
}

onMounted(() => {
  // 监听 pageshow 事件，处理 BFCache 恢复的情况
  pageshowHandler = (event) => {
    if (event.persisted) {
      // 页面从 BFCache 恢复，强制刷新布局
      requestAnimationFrame(() => {
        handleBFCache()
      })
    }
  }
  window.addEventListener('pageshow', pageshowHandler)
})

onUnmounted(() => {
  // 清理 pageshow 事件监听
  if (pageshowHandler) {
    window.removeEventListener('pageshow', pageshowHandler)
  }
})
</script>

<style scoped>
.top-nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 1000;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: var(--text-secondary, #aaa);
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary, #fff);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.nav-btn:active {
  transform: translateY(0);
}

.nav-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

@media (max-width: 768px) {
  .top-nav-bar {
    height: 56px;
    padding: 0 16px;
  }

  .nav-btn {
    padding: 6px 12px;
    font-size: 13px;
  }

  .nav-btn svg {
    width: 16px;
    height: 16px;
  }
}
</style>
