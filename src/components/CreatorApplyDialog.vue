<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { sendRoleChangeCode, applyCreatorRole } from '@/api/profileApi'
import { showSuccess, showError, showLoading } from '@/utils/notification.js'

const props = defineProps({
  show: { type: Boolean, default: false },
})

const emit = defineEmits(['update:show', 'success', 'cancel'])

const isVisible = ref(false)
const overlayRef = ref(null)
const dialogRef = ref(null)

// 状态管理
const step = ref(1) // 1: 阅读声明, 2: 输入验证码
const isConfirmed = ref(false) // 是否已确认声明
const vCode = ref('')
const isSending = ref(false)
const isSubmitting = ref(false)
const countdown = ref(0)
let countdownTimer = null

// 关闭弹窗
const closeDialog = () => {
  if (!isVisible.value) return

  const tl = gsap.timeline({
    onComplete: () => {
      isVisible.value = false
      emit('update:show', false)
      emit('cancel')
      // 重置状态
      resetState()
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

// 重置状态
const resetState = () => {
  step.value = 1
  isConfirmed.value = false
  vCode.value = ''
  isSending.value = false
  isSubmitting.value = false
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  countdown.value = 0
}

// 显示弹窗
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

// 点击遮罩层
const onOverlayClick = (e) => {
  if (e.target === overlayRef.value) closeDialog()
}

// 确认声明，进入下一步并自动发送验证码
const confirmDeclaration = async () => {
  isConfirmed.value = true
  step.value = 2
  
  // 自动发送验证码
  await handleSendCode()
}

// 发送验证码
const handleSendCode = async () => {
  if (isSending.value || countdown.value > 0) return
  
  isSending.value = true
  const loadingToast = showLoading('验证码发送中...')
  const result = await sendRoleChangeCode()
  loadingToast.close()
  isSending.value = false

  if (result.success) {
    // 发送成功
    showSuccess('验证码已发送到您的注册邮箱，请查收')
    startCountdown(60)
  } else if (result.message && result.message.includes('已存在')) {
    // 验证码已存在，从消息中提取剩余秒数
    const match = result.message.match(/(\d+)秒/)
    const remainingSeconds = match ? parseInt(match[1]) : 60
    showError(result.message)
    startCountdown(remainingSeconds)
  } else {
    showError(result.message || '验证码发送失败')
  }
}

// 开始倒计时
const startCountdown = (seconds) => {
  countdown.value = seconds
  if (countdownTimer) clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

// 提交申请
const handleSubmit = async () => {
  if (isSubmitting.value) return
  
  if (!vCode.value || vCode.value.trim().length === 0) {
    showError('请输入验证码')
    return
  }

  isSubmitting.value = true
  const result = await applyCreatorRole(vCode.value)
  isSubmitting.value = false

  if (result.success) {
    emit('success', result.message)
    closeDialog()
  } else {
    showError(result.message || '申请失败')
  }
}

// 监听 show 变化
watch(() => props.show, (newVal) => {
  if (newVal) showDialog()
  else if (isVisible.value) closeDialog()
})

onUnmounted(() => {
  if (dialogRef.value) gsap.killTweensOf(dialogRef.value)
  if (overlayRef.value) gsap.killTweensOf(overlayRef.value)
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
})

onMounted(() => {
  if (props.show) showDialog()
})

defineExpose({ showDialog, closeDialog })
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      ref="overlayRef"
      class="cad-overlay"
      @click="onOverlayClick"
    >
      <div
        ref="dialogRef"
        class="cad-dialog"
      >
        <!-- 图标区域 -->
        <div class="cad-icon">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
        </div>

        <!-- 标题 -->
        <h3 class="cad-title">申请成为创作者</h3>

        <!-- 第一步：声明 -->
        <div v-if="step === 1" class="cad-content">
          <div class="cad-declaration">
            <h4 class="cad-declaration-title">创作者声明</h4>
            <div class="cad-declaration-content">
              <p>成为创作者后，您将获得以下权限：</p>
              <ul>
                <li>上传和发布原创作品</li>
                <li>创建作品合集</li>
                <li>管理自己的作品</li>
              </ul>
              <p>同时，您需要遵守以下规范：</p>
              <ul>
                <li>确保上传的作品不侵犯他人版权</li>
                <li>作品内容需符合平台规范</li>
                <li>不发布违规、低俗或有害内容</li>
                <li>违规内容将被审核删除，严重者将取消创作者资格</li>
              </ul>
            </div>
          </div>
          <div class="cad-actions">
            <button class="cad-btn cad-btn--cancel" @click="closeDialog">取消</button>
            <button class="cad-btn cad-btn--confirm" @click="confirmDeclaration">
              我已阅读并同意
            </button>
          </div>
        </div>

        <!-- 第二步：输入验证码 -->
        <div v-else-if="step === 2" class="cad-content">
          <p class="cad-hint">
            验证码已发送到您的注册邮箱，请查收
            <span v-if="countdown > 0" class="cad-countdown">({{ countdown }}s)</span>
          </p>
          <div class="cad-code-input-wrapper">
            <input
              v-model="vCode"
              class="cad-code-input"
              type="text"
              placeholder="请输入6位验证码"
              maxlength="6"
              @input="vCode = vCode.toUpperCase()"
              @keyup.enter="handleSubmit"
            />
          </div>
          <div class="cad-actions">
            <button class="cad-btn cad-btn--cancel" @click="closeDialog">取消</button>
            <button 
              class="cad-btn cad-btn--apply"
              :disabled="!vCode || vCode.trim().length === 0 || isSubmitting"
              @click="handleSubmit"
            >
              {{ isSubmitting ? '提交中...' : '确认申请' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* 遮罩层 */
.cad-overlay {
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
.cad-dialog {
  width: 440px;
  max-width: calc(100vw - 48px);
  max-height: calc(100vh - 48px);
  padding: 32px 28px 24px;
  border-radius: 16px;
  background: #1a1a1a;
  border: 1px solid #333;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
  text-align: center;
  overflow-y: auto;
}

/* 图标 */
.cad-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: rgba(0, 169, 71, 0.1);
  color: #00A947;
}

/* 标题 */
.cad-title {
  font-size: 17px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 20px;
  text-align: center;
}

/* 内容区 */
.cad-content {
  text-align: left;
}

/* 声明区域 */
.cad-declaration {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.cad-declaration-title {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 12px;
}

.cad-declaration-content {
  font-size: 13px;
  color: #aaaaaa;
  line-height: 1.8;
}

.cad-declaration-content p {
  margin: 0 0 8px;
}

.cad-declaration-content ul {
  margin: 0 0 12px;
  padding-left: 20px;
}

.cad-declaration-content li {
  margin-bottom: 4px;
}

/* 提示文字 */
.cad-hint {
  font-size: 13px;
  color: #aaaaaa;
  margin: 0 0 16px;
  text-align: center;
}

/* 验证码输入区域 */
.cad-code-input-wrapper {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.cad-countdown {
  color: #00A947;
  font-weight: 500;
}

.cad-code-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  color: #ffffff;
  font-size: 15px;
  letter-spacing: 4px;
  text-align: center;
  outline: none;
  transition: all 0.2s ease;
}

.cad-code-input:focus {
  border-color: rgba(0, 169, 71, 0.5);
  background: rgba(0, 169, 71, 0.05);
}

.cad-code-input::placeholder {
  letter-spacing: 0;
  color: rgba(255, 255, 255, 0.3);
}

/* 按钮区 */
.cad-actions {
  display: flex;
  gap: 12px;
}

.cad-btn {
  flex: 1;
  padding: 12px 0;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cad-btn--cancel {
  background: rgba(255, 255, 255, 0.08);
  color: #cecece;
}

.cad-btn--cancel:hover {
  background: rgba(255, 255, 255, 0.14);
}

.cad-btn--cancel:active {
  transform: scale(0.97);
}

.cad-btn--confirm {
  background: #00A947;
  color: #ffffff;
}

.cad-btn--confirm:hover {
  background: #009940;
}

.cad-btn--confirm:active {
  transform: scale(0.97);
}

.cad-btn--apply {
  background: #00A947;
  color: #ffffff;
}

.cad-btn--apply:hover:not(:disabled) {
  background: #009940;
}

.cad-btn--apply:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cad-btn--apply:active:not(:disabled) {
  transform: scale(0.97);
}

/* 响应式 */
@media (max-width: 480px) {
  .cad-dialog {
    padding: 24px 20px 20px;
  }
  
  .cad-actions {
    flex-direction: column-reverse;
    gap: 8px;
  }
}
</style>
