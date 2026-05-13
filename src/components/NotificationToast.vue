<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import gsap from 'gsap'

// Props 定义
const props = defineProps({
  title: {
    type: String,
    default: '通知'
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info', // info, success, warning, error
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000 // 默认显示3秒
  },
  show: {
    type: Boolean,
    default: false
  }
})

// Emits 定义
const emit = defineEmits(['close'])

// 响应式数据
const isVisible = ref(false)
const toastRef = ref(null)

// 关闭弹窗
const closeToast = () => {
  if (!isVisible.value) return

  // GSAP 退出动画 - 使用 autoAlpha 替代 opacity
  gsap.to(toastRef.value, {
    x: 100,
    autoAlpha: 0,  // autoAlpha 同时控制 opacity 和 visibility
    duration: 0.8,
    ease: "power3.in",
    onComplete: () => {
      // 清除所有内联样式，避免影响下次显示
      gsap.set(toastRef.value, { clearProps: "all" })
      isVisible.value = false
      emit('close')
    }
  })
}

// 显示弹窗
const showToast = () => {
  if (isVisible.value) return

  isVisible.value = true

  // 使用 nextTick 确保 DOM 已更新
  nextTick(() => {
    if (!toastRef.value) return

    // 执行进入动画（元素已通过模板中的 style 初始隐藏）
    gsap.fromTo(toastRef.value,
      {
        x: 100,
        autoAlpha: 0
      },
      {
        x: 0,
        autoAlpha: 1,
        delay: 0.05,
        duration: 1,
        ease: "power3.out"
      }
    )

    // 自动关闭定时器
    if (props.duration > 0) {
      setTimeout(closeToast, props.duration)
    }
  })
}

// 监听 show prop 变化
watch(() => props.show, (newVal) => {
  if (newVal) {
    showToast()
  } else {
    closeToast()
  }
})

// 暴露方法给父组件
defineExpose({
  showToast,
  closeToast
})

// 生命周期
onMounted(() => {
  if (props.show) {
    showToast()
  }
})

onUnmounted(() => {
  // 清理 GSAP 动画
  if (toastRef.value) {
    gsap.killTweensOf(toastRef.value)
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      ref="toastRef"
      class="notification-toast"
      :class="`type-${type}`"
      :style="{ opacity: 0, visibility: 'hidden' }"
    >
      <div class="toast-content">
        <div class="toast-icon">
          <!-- 根据不同类型显示不同图标 -->
          <svg v-if="type === 'info'" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          <svg v-else-if="type === 'success'" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          <svg v-else-if="type === 'warning'" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
          <svg v-else-if="type === 'error'" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
          </svg>
        </div>

        <div class="toast-text">
          <div class="toast-title">{{ title }}</div>
          <div class="toast-message">{{ message }}</div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.notification-toast {
  position: fixed;
  bottom: 20px;
  right: -1px;
  z-index: 9999;
  max-width: 350px;
  min-width: 280px;
  background-color: #1a1a1a;
  border-radius: 12px 0 0 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid #333;
  overflow: hidden;
}

.toast-content {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
}

.toast-icon {
  flex-shrink: 0;
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
}

.type-info .toast-icon {
  color: #4a9eff;
}

.type-success .toast-icon {
  color: #2ecc71;
}

.type-warning .toast-icon {
  color: #f39c12;
}

.type-error .toast-icon {
  color: #e74c3c;
}

.toast-text {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
  line-height: 1.4;
}

.type-info .toast-title {
  color: #4A9EFF;
}

.type-success .toast-title {
  color: #2ECC71;
}

.type-warning .toast-title {
  color: #F39C12;
}

.type-error .toast-title {
  color: #E74C3C;
}

.toast-message {
  font-size: 13px;
  color: #cccccc;
  line-height: 1.4;
  word-wrap: break-word;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notification-toast {
    max-width: none;
    top: 10px;
    bottom: auto;
  }

  .toast-content {
    padding: 12px;
  }
}
</style>