<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  title: { type: String, default: '确认' },
  message: { type: String, required: true },
  show: { type: Boolean, default: false },
  yesText: { type: String, default: '是' },
  noText: { type: String, default: '否' },
})

const emit = defineEmits(['update:show', 'confirm', 'cancel', 'close'])

const isVisible = ref(false)
const overlayRef = ref(null)
const dialogRef = ref(null)

const closeDialog = (confirmed = false) => {
  if (!isVisible.value) return

  const tl = gsap.timeline({
    onComplete: () => {
      isVisible.value = false
      emit('update:show', false)
      if (confirmed) emit('confirm')
      else emit('cancel')
      emit('close')
    }
  })

  tl.to(dialogRef.value, {
    scale: 0.95,
    autoAlpha: 0,
    duration: 0.25,
    ease: "power2.in"
  }, 0)
  .to(overlayRef.value, {
    autoAlpha: 0,
    duration: 0.3,
    ease: "power2.in"
  }, 0)
}

const confirm = () => closeDialog(true)
const cancel = () => closeDialog(false)

const showDialog = () => {
  if (isVisible.value) return
  isVisible.value = true

  nextTick(() => {
    if (!dialogRef.value || !overlayRef.value) return

    gsap.set(overlayRef.value, { autoAlpha: 0 })
    gsap.set(dialogRef.value, { scale: 0.9, autoAlpha: 0 })

    const tl = gsap.timeline()
    tl.to(overlayRef.value, {
      autoAlpha: 1,
      duration: 0.3,
      ease: "power2.out"
    }, 0)
    .to(dialogRef.value, {
      scale: 1,
      autoAlpha: 1,
      duration: 0.35,
      ease: "back.out(1.4)"
    }, 0.05)
  })
}

const onOverlayClick = (e) => {
  if (e.target === overlayRef.value) cancel()
}

watch(() => props.show, (newVal) => {
  if (newVal) showDialog()
  else if (isVisible.value) cancel()
})

onUnmounted(() => {
  if (dialogRef.value) gsap.killTweensOf(dialogRef.value)
  if (overlayRef.value) gsap.killTweensOf(overlayRef.value)
})

// 处理初始 show=true 的情况（createApp 方式传入）
onMounted(() => {
  if (props.show) showDialog()
})

defineExpose({ showDialog, cancel })
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      ref="overlayRef"
      class="cd-overlay"
      @click="onOverlayClick"
    >
      <div
        ref="dialogRef"
        class="cd-dialog"
      >
        <!-- 图标区域 -->
        <div class="cd-icon">
          <svg viewBox="0 0 24 24" width="28" height="28">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>

        <!-- 标题（居中） -->
        <h3 class="cd-title">{{ title }}</h3>

        <!-- 消息内容 -->
        <p class="cd-message">{{ message }}</p>

        <!-- 按钮区 -->
        <div class="cd-actions">
          <button class="cd-btn cd-btn--no" @click="cancel">{{ noText }}</button>
          <button class="cd-btn cd-btn--yes" @click="confirm">{{ yesText }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* 遮罩层 */
.cd-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

/* 弹窗卡片 */
.cd-dialog {
  width: 380px;
  max-width: calc(100vw - 48px);
  padding: 32px 28px 24px;
  border-radius: 16px;
  background: #1a1a1a;
  border: 1px solid #333;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
  text-align: center;
}

/* 图标 */
.cd-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  color: #4a9eff;
}

/* 标题 */
.cd-title {
  font-size: 17px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px;
  text-align: center;
}

/* 消息 */
.cd-message {
  font-size: 14px;
  color: #aaaaaa;
  line-height: 1.6;
  margin: 0 0 28px;
  text-align: center;
  word-wrap: break-word;
}

/* 按钮区 */
.cd-actions {
  display: flex;
  gap: 12px;
}

.cd-btn {
  flex: 1;
  padding: 10px 0;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cd-btn--no {
  background: rgba(255, 255, 255, 0.08);
  color: #cecece;
}
.cd-btn--no:hover {
  background: rgba(255, 255, 255, 0.14);
}
.cd-btn--no:active {
  transform: scale(0.97);
}

.cd-btn--yes {
  background: #4a9eff;
  color: #ffffff;
}
.cd-btn--yes:hover {
  background: #3a8eef;
}
.cd-btn--yes:active {
  transform: scale(0.97);
}

/* 响应式 */
@media (max-width: 480px) {
  .cd-dialog {
    padding: 24px 20px 20px;
  }
  .cd-actions {
    flex-direction: column-reverse;
    gap: 8px;
  }
}
</style>
