<script setup>
import { ref, reactive, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { showError, showSuccess } from '@/utils/notification.js'
import {
  deleteAccount,
  sendDeleteAccountCode,
  changePassword,
  sendChangePasswordCode,
  changeEmail,
  sendChangeEmailCode
} from '@/api/accountApi.js'

const props = defineProps({
  show: { type: Boolean, default: false },
})

const emit = defineEmits(['update:show'])

const router = useRouter()

// ── 状态 ──
const isVisible = ref(false)
const overlayRef = ref(null)
const dialogRef = ref(null)
const isSubmitting = ref(false)

// 当前激活的标签页
const activeTab = ref('password') // password | email | delete

// ── 密码修改表单 ──
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
  vCode: '',
})

const passwordFieldStates = reactive({
  oldPassword: { status: 'idle', message: '' },
  newPassword: { status: 'idle', message: '' },
  confirmPassword: { status: 'idle', message: '' },
  vCode: { status: 'idle', message: '' },
})

// ── 邮箱修改表单 ──
const emailForm = reactive({
  newEmail: '',
  vCode: '',
})

const emailFieldStates = reactive({
  newEmail: { status: 'idle', message: '' },
  vCode: { status: 'idle', message: '' },
})

// ── 账号注销表单 ──
const deleteForm = reactive({
  vCode: '',
  confirmText: '',
})

const deleteFieldStates = reactive({
  vCode: { status: 'idle', message: '' },
})

// ── 验证码倒计时 ──
const passwordCodeButton = reactive({
  text: '获取验证码',
  disabled: false,
  countdown: 0,
})

const emailCodeButton = reactive({
  text: '获取验证码',
  disabled: false,
  countdown: 0,
})

const deleteCodeButton = reactive({
  text: '获取验证码',
  disabled: false,
  countdown: 0,
})

let passwordCountdownTimer = null
let emailCountdownTimer = null
let deleteCountdownTimer = null

// ── 密码强度检测 ──
const passwordStrength = ref(0) // 0-3
const passwordStrengthText = ref('')

const checkPasswordStrength = (password) => {
  if (!password) {
    passwordStrength.value = 0
    passwordStrengthText.value = ''
    return
  }

  let strength = 0
  if (password.length >= 6) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^a-zA-Z0-9]/.test(password)) strength++

  passwordStrength.value = Math.min(strength, 3)
  
  const texts = ['', '弱', '中', '强']
  passwordStrengthText.value = texts[passwordStrength.value]
}

// ── 表单验证 ──
const validatePasswordForm = () => {
  let isValid = true

  // 旧密码
  if (!passwordForm.oldPassword) {
    passwordFieldStates.oldPassword = { status: 'error', message: '请输入旧密码' }
    isValid = false
  } else {
    passwordFieldStates.oldPassword = { status: 'success', message: '' }
  }

  // 新密码
  if (!passwordForm.newPassword) {
    passwordFieldStates.newPassword = { status: 'error', message: '请输入新密码' }
    isValid = false
  } else if (passwordForm.newPassword.length < 6 || passwordForm.newPassword.length > 16) {
    passwordFieldStates.newPassword = { status: 'error', message: '密码长度为6-16位' }
    isValid = false
  } else if (!/^[a-zA-Z0-9_.]+$/.test(passwordForm.newPassword)) {
    passwordFieldStates.newPassword = { status: 'error', message: '只允许字母、数字、_、.' }
    isValid = false
  } else if (passwordForm.newPassword === passwordForm.oldPassword) {
    passwordFieldStates.newPassword = { status: 'error', message: '新密码不能与旧密码相同' }
    isValid = false
  } else {
    passwordFieldStates.newPassword = { status: 'success', message: '' }
  }

  // 确认密码
  if (!passwordForm.confirmPassword) {
    passwordFieldStates.confirmPassword = { status: 'error', message: '请确认新密码' }
    isValid = false
  } else if (passwordForm.confirmPassword !== passwordForm.newPassword) {
    passwordFieldStates.confirmPassword = { status: 'error', message: '两次密码不一致' }
    isValid = false
  } else {
    passwordFieldStates.confirmPassword = { status: 'success', message: '' }
  }

  // 验证码
  if (!passwordForm.vCode) {
    passwordFieldStates.vCode = { status: 'error', message: '请输入验证码' }
    isValid = false
  } else {
    passwordFieldStates.vCode = { status: 'success', message: '' }
  }

  return isValid
}

const validateEmailForm = () => {
  let isValid = true

  // 新邮箱
  if (!emailForm.newEmail) {
    emailFieldStates.newEmail = { status: 'error', message: '请输入新邮箱' }
    isValid = false
  } else if (!/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(emailForm.newEmail)) {
    emailFieldStates.newEmail = { status: 'error', message: '邮箱格式不正确' }
    isValid = false
  } else {
    emailFieldStates.newEmail = { status: 'success', message: '' }
  }

  // 验证码
  if (!emailForm.vCode) {
    emailFieldStates.vCode = { status: 'error', message: '请输入验证码' }
    isValid = false
  } else {
    emailFieldStates.vCode = { status: 'success', message: '' }
  }

  return isValid
}

const validateDeleteForm = () => {
  let isValid = true

  // 确认文本
  if (deleteForm.confirmText !== '确认注销') {
    showError('请输入"确认注销"以确认操作')
    isValid = false
  }

  // 验证码
  if (!deleteForm.vCode) {
    deleteFieldStates.vCode = { status: 'error', message: '请输入验证码' }
    isValid = false
  } else {
    deleteFieldStates.vCode = { status: 'success', message: '' }
  }

  return isValid
}

// ── 验证码发送 ──
const startCountdown = (button, timerRef) => {
  button.countdown = 60
  button.text = '60s'
  button.disabled = true

  timerRef = setInterval(() => {
    button.countdown--
    if (button.countdown > 0) {
      button.text = `${button.countdown}s`
    } else {
      clearInterval(timerRef)
      button.disabled = false
      button.text = '获取验证码'
    }
  }, 1000)

  return timerRef
}

const handleSendPasswordCode = async () => {
  if (passwordCodeButton.disabled) return

  passwordCodeButton.disabled = true
  passwordCodeButton.text = '发送中...'

  const result = await sendChangePasswordCode()

  if (result.success) {
    passwordCountdownTimer = startCountdown(passwordCodeButton, passwordCountdownTimer)
  } else {
    passwordCodeButton.disabled = false
    passwordCodeButton.text = '获取验证码'
    showError(result.message)
  }
}

const handleSendEmailCode = async () => {
  if (emailCodeButton.disabled) return

  if (!emailForm.newEmail || !/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(emailForm.newEmail)) {
    emailFieldStates.newEmail = { status: 'error', message: '请先输入正确的邮箱' }
    return
  }

  emailCodeButton.disabled = true
  emailCodeButton.text = '发送中...'

  const result = await sendChangeEmailCode({ newEmail: emailForm.newEmail })

  if (result.success) {
    emailCountdownTimer = startCountdown(emailCodeButton, emailCountdownTimer)
  } else {
    emailCodeButton.disabled = false
    emailCodeButton.text = '获取验证码'
    showError(result.message)
  }
}

const handleSendDeleteCode = async () => {
  if (deleteCodeButton.disabled) return

  deleteCodeButton.disabled = true
  deleteCodeButton.text = '发送中...'

  const result = await sendDeleteAccountCode()

  if (result.success) {
    deleteCountdownTimer = startCountdown(deleteCodeButton, deleteCountdownTimer)
  } else {
    deleteCodeButton.disabled = false
    deleteCodeButton.text = '获取验证码'
    showError(result.message)
  }
}

// ── 表单提交 ──
const handleSubmitPassword = async () => {
  if (isSubmitting.value) return
  if (!validatePasswordForm()) return

  isSubmitting.value = true

  const result = await changePassword({
    oldPassword: passwordForm.oldPassword,
    newPassword: passwordForm.newPassword,
    confirmPassword: passwordForm.confirmPassword,
    vCode: passwordForm.vCode,
  })

  isSubmitting.value = false

  if (result.success) {
    showSuccess(result.message || '密码修改成功，请重新登录')
    // 后端会清理token，清除本地存储并跳转登录
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    closeDialog()
    router.push('/login')
  } else {
    showError(result.message)
  }
}

const handleSubmitEmail = async () => {
  if (isSubmitting.value) return
  if (!validateEmailForm()) return

  isSubmitting.value = true

  const result = await changeEmail({
    newEmail: emailForm.newEmail,
    vCode: emailForm.vCode,
  })

  isSubmitting.value = false

  if (result.success) {
    showSuccess(result.message || '邮箱修改成功')
    // 清空表单
    emailForm.newEmail = ''
    emailForm.vCode = ''
    Object.keys(emailFieldStates).forEach(key => {
      emailFieldStates[key] = { status: 'idle', message: '' }
    })
  } else {
    showError(result.message)
  }
}

const handleDeleteAccount = async () => {
  if (isSubmitting.value) return
  if (!validateDeleteForm()) return

  isSubmitting.value = true

  const result = await deleteAccount({
    vCode: deleteForm.vCode,
  })

  isSubmitting.value = false

  if (result.success) {
    showSuccess('账号已注销')
    closeDialog()
    // 跳转到首页
    router.push('/')
  } else {
    showError(result.message)
  }
}

// ── 切换标签页 ──
const switchTab = (tab) => {
  activeTab.value = tab
}

// ── GSAP 动画 ──
const closeDialog = () => {
  if (!isVisible.value) return

  const tl = gsap.timeline({
    onComplete: () => {
      isVisible.value = false
      emit('update:show', false)
    }
  })
  tl.to(dialogRef.value, { scale: 0.95, autoAlpha: 0, duration: 0.2, ease: 'power2.in' }, 0)
    .to(overlayRef.value, { autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, 0)
}

const showDialog = () => {
  if (isVisible.value) return
  isVisible.value = true

  nextTick(() => {
    if (!dialogRef.value || !overlayRef.value) return
    gsap.set(overlayRef.value, { autoAlpha: 0 })
    gsap.set(dialogRef.value, { scale: 0.9, autoAlpha: 0 })

    gsap.timeline()
      .to(overlayRef.value, { autoAlpha: 1, duration: 0.25, ease: 'power2.out' }, 0)
      .to(dialogRef.value, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'back.out(1.4)' }, 0.04)
  })
}

const onOverlayClick = (e) => {
  if (e.target === overlayRef.value) closeDialog()
}

watch(() => props.show, (v) => {
  if (v) showDialog()
  else if (isVisible.value) closeDialog()
})

onMounted(() => {
  if (props.show) showDialog()
})

onUnmounted(() => {
  if (dialogRef.value) gsap.killTweensOf(dialogRef.value)
  if (overlayRef.value) gsap.killTweensOf(overlayRef.value)
  // 清除倒计时
  if (passwordCountdownTimer) clearInterval(passwordCountdownTimer)
  if (emailCountdownTimer) clearInterval(emailCountdownTimer)
  if (deleteCountdownTimer) clearInterval(deleteCountdownTimer)
})

defineExpose({ showDialog, closeDialog })
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      ref="overlayRef"
      class="am-overlay"
      @click="onOverlayClick"
    >
      <div ref="dialogRef" class="am-dialog" @click.stop>
        <!-- 标题 -->
        <h3 class="am-title">账号管理</h3>

        <!-- 标签页导航 -->
        <div class="am-tabs">
          <button
            class="am-tab"
            :class="{ 'am-tab--active': activeTab === 'password' }"
            @click="switchTab('password')"
          >
            <svg class="am-tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>修改密码</span>
          </button>
          <button
            class="am-tab"
            :class="{ 'am-tab--active': activeTab === 'email' }"
            @click="switchTab('email')"
          >
            <svg class="am-tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span>安全邮箱</span>
          </button>
          <button
            class="am-tab am-tab--danger"
            :class="{ 'am-tab--active': activeTab === 'delete' }"
            @click="switchTab('delete')"
          >
            <svg class="am-tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            <span>账号注销</span>
          </button>
        </div>

        <!-- 标签页内容 -->
        <div class="am-content">
          <!-- 密码修改 -->
          <div v-if="activeTab === 'password'" class="am-panel">
            <div class="am-form-group">
              <label class="am-label">旧密码</label>
              <input
                v-model="passwordForm.oldPassword"
                class="am-input"
                :class="{ 'am-input--error': passwordFieldStates.oldPassword.status === 'error' }"
                type="password"
                placeholder="请输入当前密码"
                maxlength="16"
              />
              <span v-if="passwordFieldStates.oldPassword.message" class="am-error">
                {{ passwordFieldStates.oldPassword.message }}
              </span>
            </div>

            <div class="am-form-group">
              <label class="am-label">新密码</label>
              <input
                v-model="passwordForm.newPassword"
                class="am-input"
                :class="{ 'am-input--error': passwordFieldStates.newPassword.status === 'error' }"
                type="password"
                placeholder="6-16位，字母/数字/_/."
                maxlength="16"
                @input="checkPasswordStrength(passwordForm.newPassword)"
              />
              <span v-if="passwordFieldStates.newPassword.message" class="am-error">
                {{ passwordFieldStates.newPassword.message }}
              </span>
              <!-- 密码强度指示器 -->
              <div v-if="passwordForm.newPassword" class="am-strength">
                <div class="am-strength-bars">
                  <div
                    v-for="i in 3"
                    :key="i"
                    class="am-strength-bar"
                    :class="{ 'am-strength-bar--active': passwordStrength >= i }"
                    :style="{ background: passwordStrength >= i ? (passwordStrength === 1 ? '#ff5c5c' : passwordStrength === 2 ? '#f0a020' : '#00A947') : '' }"
                  ></div>
                </div>
                <span class="am-strength-text" :style="{ color: passwordStrength === 1 ? '#ff5c5c' : passwordStrength === 2 ? '#f0a020' : '#00A947' }">
                  {{ passwordStrengthText }}
                </span>
              </div>
            </div>

            <div class="am-form-group">
              <label class="am-label">确认新密码</label>
              <input
                v-model="passwordForm.confirmPassword"
                class="am-input"
                :class="{ 'am-input--error': passwordFieldStates.confirmPassword.status === 'error' }"
                type="password"
                placeholder="再次输入新密码"
                maxlength="16"
              />
              <span v-if="passwordFieldStates.confirmPassword.message" class="am-error">
                {{ passwordFieldStates.confirmPassword.message }}
              </span>
            </div>

            <div class="am-form-group">
              <label class="am-label">验证码</label>
              <div class="am-code-row">
                <input
                  v-model="passwordForm.vCode"
                  class="am-input am-input--code"
                  :class="{ 'am-input--error': passwordFieldStates.vCode.status === 'error' }"
                  type="text"
                  placeholder="请输入验证码"
                  maxlength="6"
                />
                <button
                  class="am-code-btn"
                  :disabled="passwordCodeButton.disabled"
                  @click="handleSendPasswordCode"
                >
                  {{ passwordCodeButton.text }}
                </button>
              </div>
              <span v-if="passwordFieldStates.vCode.message" class="am-error">
                {{ passwordFieldStates.vCode.message }}
              </span>
            </div>

            <button
              class="am-submit-btn"
              :disabled="isSubmitting"
              @click="handleSubmitPassword"
            >
              <svg v-if="isSubmitting" class="am-spinner" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32" stroke-linecap="round">
                  <animate attributeName="stroke-dashoffset" values="32;0" dur="0.8s" repeatCount="indefinite" />
                </circle>
              </svg>
              <span v-else>修改密码</span>
            </button>
          </div>

          <!-- 邮箱修改 -->
          <div v-if="activeTab === 'email'" class="am-panel">
            <div class="am-form-group">
              <label class="am-label">新邮箱</label>
              <input
                v-model="emailForm.newEmail"
                class="am-input"
                :class="{ 'am-input--error': emailFieldStates.newEmail.status === 'error' }"
                type="email"
                placeholder="请输入新邮箱地址"
                maxlength="100"
              />
              <span v-if="emailFieldStates.newEmail.message" class="am-error">
                {{ emailFieldStates.newEmail.message }}
              </span>
            </div>

            <div class="am-form-group">
              <label class="am-label">验证码</label>
              <div class="am-code-row">
                <input
                  v-model="emailForm.vCode"
                  class="am-input am-input--code"
                  :class="{ 'am-input--error': emailFieldStates.vCode.status === 'error' }"
                  type="text"
                  placeholder="请输入验证码"
                  maxlength="6"
                />
                <button
                  class="am-code-btn"
                  :disabled="emailCodeButton.disabled"
                  @click="handleSendEmailCode"
                >
                  {{ emailCodeButton.text }}
                </button>
              </div>
              <span v-if="emailFieldStates.vCode.message" class="am-error">
                {{ emailFieldStates.vCode.message }}
              </span>
            </div>

            <button
              class="am-submit-btn"
              :disabled="isSubmitting"
              @click="handleSubmitEmail"
            >
              <svg v-if="isSubmitting" class="am-spinner" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32" stroke-linecap="round">
                  <animate attributeName="stroke-dashoffset" values="32;0" dur="0.8s" repeatCount="indefinite" />
                </circle>
              </svg>
              <span v-else>修改邮箱</span>
            </button>
          </div>

          <!-- 账号注销 -->
          <div v-if="activeTab === 'delete'" class="am-panel">
            <div class="am-warning">
              <svg class="am-warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <div class="am-warning-content">
                <p class="am-warning-title">警告：此操作不可逆</p>
                <p class="am-warning-text">账号注销后，您的所有数据将被永久删除，且无法恢复。</p>
              </div>
            </div>

            <div class="am-form-group">
              <label class="am-label">请输入"确认注销"以确认操作</label>
              <input
                v-model="deleteForm.confirmText"
                class="am-input"
                type="text"
                placeholder="确认注销"
                maxlength="4"
              />
            </div>

            <div class="am-form-group">
              <label class="am-label">验证码</label>
              <div class="am-code-row">
                <input
                  v-model="deleteForm.vCode"
                  class="am-input am-input--code"
                  :class="{ 'am-input--error': deleteFieldStates.vCode.status === 'error' }"
                  type="text"
                  placeholder="请输入验证码"
                  maxlength="6"
                />
                <button
                  class="am-code-btn am-code-btn--danger"
                  :disabled="deleteCodeButton.disabled"
                  @click="handleSendDeleteCode"
                >
                  {{ deleteCodeButton.text }}
                </button>
              </div>
              <span v-if="deleteFieldStates.vCode.message" class="am-error">
                {{ deleteFieldStates.vCode.message }}
              </span>
            </div>

            <button
              class="am-submit-btn am-submit-btn--danger"
              :disabled="isSubmitting"
              @click="handleDeleteAccount"
            >
              <svg v-if="isSubmitting" class="am-spinner" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32" stroke-linecap="round">
                  <animate attributeName="stroke-dashoffset" values="32;0" dur="0.8s" repeatCount="indefinite" />
                </circle>
              </svg>
              <span v-else>确认注销账号</span>
            </button>
          </div>
        </div>

        <!-- 关闭按钮 -->
        <button class="am-close" @click="closeDialog" title="关闭">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ── 遮罩 ── */
.am-overlay {
  position: fixed;
  inset: 0;
  z-index: 11000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
}

/* ── 弹窗卡片 ── */
.am-dialog {
  position: relative;
  width: 440px;
  max-width: calc(100vw - 48px);
  max-height: 85vh;
  padding: 28px 24px 24px;
  border-radius: 16px;
  background: #1a1a1a;
  border: 1px solid #333;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── 标题 ── */
.am-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  text-align: center;
  margin: 0 0 20px;
}

/* ── 标签页导航 ── */
.am-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  margin-bottom: 20px;
}

.am-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.am-tab:hover {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.04);
}

.am-tab--active {
  background: rgba(0, 169, 71, 0.15);
  color: #00A947;
}

.am-tab--active:hover {
  background: rgba(0, 169, 71, 0.2);
  color: #00A947;
}

.am-tab--danger.am-tab--active {
  background: rgba(255, 92, 92, 0.15);
  color: #ff5c5c;
}

.am-tab--danger.am-tab--active:hover {
  background: rgba(255, 92, 92, 0.2);
  color: #ff5c5c;
}

.am-tab-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* ── 内容区域 ── */
.am-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.am-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── 表单组 ── */
.am-form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.am-label {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
}

.am-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.am-input:focus {
  border-color: rgba(0, 169, 71, 0.5);
}

.am-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.am-input--error {
  border-color: rgba(255, 92, 92, 0.5);
}

.am-input--error:focus {
  border-color: rgba(255, 92, 92, 0.7);
}

.am-error {
  font-size: 12px;
  color: #ff5c5c;
}

/* ── 验证码行 ── */
.am-code-row {
  display: flex;
  gap: 8px;
}

.am-input--code {
  flex: 1;
}

.am-code-btn {
  flex-shrink: 0;
  width: 100px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: rgba(0, 169, 71, 0.15);
  color: #00A947;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.am-code-btn:hover:not(:disabled) {
  background: rgba(0, 169, 71, 0.25);
}

.am-code-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.am-code-btn--danger {
  background: rgba(255, 92, 92, 0.15);
  color: #ff5c5c;
}

.am-code-btn--danger:hover:not(:disabled) {
  background: rgba(255, 92, 92, 0.25);
}

/* ── 密码强度 ── */
.am-strength {
  display: flex;
  align-items: center;
  gap: 8px;
}

.am-strength-bars {
  display: flex;
  gap: 4px;
}

.am-strength-bar {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.1);
  transition: background 0.2s ease;
}

.am-strength-text {
  font-size: 12px;
  font-weight: 500;
}

/* ── 警告区域 ── */
.am-warning {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: rgba(255, 92, 92, 0.08);
  border: 1px solid rgba(255, 92, 92, 0.2);
  border-radius: 10px;
}

.am-warning-icon {
  width: 24px;
  height: 24px;
  color: #ff5c5c;
  flex-shrink: 0;
  margin-top: 2px;
}

.am-warning-content {
  flex: 1;
}

.am-warning-title {
  font-size: 14px;
  font-weight: 600;
  color: #ff5c5c;
  margin: 0 0 4px;
}

.am-warning-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  line-height: 1.5;
}

/* ── 提交按钮 ── */
.am-submit-btn {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 10px;
  background: #00A947;
  color: #ffffff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.am-submit-btn:hover:not(:disabled) {
  filter: brightness(0.9);
}

.am-submit-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.am-submit-btn:disabled {
  opacity: 0.5;
  cursor: wait;
}

.am-submit-btn--danger {
  background: #ff5c5c;
}

.am-submit-btn--danger:hover:not(:disabled) {
  background: #e04848;
}

/* ── 关闭按钮 ── */
.am-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  transition: all 0.2s ease;
}

.am-close:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
}

/* ── 加载动画 ── */
.am-spinner {
  animation: am-spin 1s linear infinite;
}

@keyframes am-spin {
  to { transform: rotate(360deg); }
}

/* ── 响应式 ── */
@media (max-width: 480px) {
  .am-dialog {
    padding: 20px 16px 16px;
  }

  .am-tabs {
    flex-direction: column;
  }

  .am-tab {
    justify-content: flex-start;
    padding: 10px 12px;
  }

  .am-code-btn {
    width: 90px;
    font-size: 12px;
  }
}
</style>
