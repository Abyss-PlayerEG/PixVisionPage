<template>
  <div class="cw-container">
    <!-- 无聊天对象时的占位 -->
    <div v-if="!chatUser" class="cw-placeholder">
      <svg class="cw-placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="9" y1="10" x2="15" y2="10" />
      </svg>
      <span>选择一个会话开始聊天</span>
    </div>

    <!-- 聊天界面 -->
    <template v-else>
      <!-- 聊天头部 -->
      <div class="cw-header">
        <div class="cw-header-info" @click="isPixBot ? null : goToProfile">
          <!-- PixBot 特殊头像 -->
          <div v-if="isPixBot" class="cw-header-avatar pixbot-header-avatar">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#00A947" stroke-width="1.5">
              <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20z"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="15" y1="9" x2="15.01" y2="9" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </div>
          <!-- 普通用户头像 -->
          <img
            v-else
            class="cw-header-avatar"
            :src="getAvatarUrl(chatUser.avatar_url)"
            :alt="chatUser.nickname"
          />
          <span class="cw-header-name" :class="{ 'pixbot-header-name': isPixBot }">
            {{ isPixBot ? 'PixBot' : (chatUser.nickname || '未知用户') }}
          </span>
        </div>
        <div class="cw-header-actions">
          <button v-if="isMultiSelectMode" class="cw-header-btn cancel" @click="cancelMultiSelect">
            取消
          </button>
          <button class="cw-header-close" @click="isMultiSelectMode ? cancelMultiSelect() : $emit('close')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 消息列表 -->
      <div class="cw-messages" ref="messagesRef" @scroll="handleScroll">
        <!-- 加载更早消息提示 -->
        <div v-if="chatLoading" class="cw-load-hint">
          <div class="cw-load-spinner"></div>
          <span>加载中...</span>
        </div>
        <div v-else-if="chatFinished && messages.length > 0" class="cw-load-hint">
          — 到底了 —
        </div>
        <div v-else-if="!chatFinished && messages.length > 0" class="cw-load-hint cw-load-more-hint">
          下拉加载更多
        </div>

        <!-- 消息项 -->
        <div
          v-for="msg in messages"
          :key="msg.message_id"
          class="cw-msg"
          :class="{ 
            sent: isMine(msg), 
            received: !isMine(msg),
            selected: selectedMessageIds.has(msg.message_id)
          }"
          @contextmenu.prevent="showContextMenu($event, msg)"
          @click="isMultiSelectMode && toggleSelect(msg.message_id)"
        >
          <!-- 多选复选框 -->
          <div v-if="isMultiSelectMode" class="cw-checkbox" :class="{ checked: selectedMessageIds.has(msg.message_id) }">
            <svg v-if="selectedMessageIds.has(msg.message_id)" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          </div>
          
          <!-- 接收的消息显示头像 -->
          <div v-if="!isMine(msg) && isPixBot" class="cw-msg-avatar pixbot-msg-avatar">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#00A947" stroke-width="1.5">
              <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20z"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="15" y1="9" x2="15.01" y2="9" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </div>
          <img
            v-else-if="!isMine(msg)"
            class="cw-msg-avatar"
            :src="getAvatarUrl(chatUser.avatar_url)"
            :alt="chatUser.nickname"
            @click.stop="goToProfile"
          />
          <div class="cw-msg-body">
            <div class="cw-msg-bubble">{{ msg.message }}</div>
            <div class="cw-msg-meta">
              <span class="cw-msg-time">{{ formatTime(msg.create_time) }}</span>
              <!-- 自己发送的消息显示已读/未读状态 -->
              <span v-if="isMine(msg)" class="cw-msg-status" :class="{ read: msg.is_read }">
                <svg v-if="msg.is_read" class="cw-status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <svg v-else class="cw-status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span class="cw-status-text">{{ msg.is_read ? '已读' : '未读' }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!chatLoading && messages.length === 0" class="cw-empty">
          {{ isPixBot ? '暂无系统通知' : '暂无聊天记录，发送第一条消息吧' }}
        </div>
      </div>

      <!-- 批量操作栏 -->
      <div v-if="isMultiSelectMode" class="cw-batch-bar">
        <span class="cw-batch-count">已选 {{ selectedMessageIds.size }} 条</span>
        <button 
          class="cw-batch-btn" 
          :disabled="selectedMessageIds.size === 0"
          @click="handleBatchDelete"
        >
          删除
        </button>
      </div>

      <!-- 输入区域 -->
      <div v-else class="cw-input-area">
        <!-- PixBot 模式显示禁用提示 -->
        <div v-if="isPixBot" class="cw-pixbot-hint">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>系统通知，无法回复</span>
        </div>
        <!-- 普通聊天输入框 -->
        <template v-else>
          <div class="cw-input-wrapper">
            <textarea
              ref="inputRef"
              v-model="inputText"
              class="cw-input"
              placeholder="输入消息..."
              rows="1"
              @keydown.enter.exact.prevent="handleSend"
              @input="autoResize"
            ></textarea>
          </div>
          <button
            class="cw-send-btn"
            :class="{ active: canSend }"
            :disabled="!canSend || sending"
            @click="handleSend"
          >
            <svg v-if="!sending" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
            <div v-else class="cw-send-loading"></div>
          </button>
        </template>
      </div>

      <!-- 右键菜单 -->
      <Teleport to="body">
        <div
          v-if="contextMenu.visible"
          class="cw-context-menu"
          :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
          @click.stop
        >
          <button
            v-if="contextMenu.msg && canRecall(contextMenu.msg)"
            class="cw-context-item recall"
            @click="handleRecall"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 10h10a5 5 0 0 1 5 5v2M3 10l4-4M3 10l4 4"/>
            </svg>
            <span>撤销</span>
          </button>
          <button class="cw-context-item delete" @click="handleDelete">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M8 6V4h8v2M5 6v14a2 2 0 002 2h10a2 2 0 002-2V6"/>
            </svg>
            <span>删除</span>
          </button>
          <div class="cw-context-divider"></div>
          <button class="cw-context-item select" @click="handleMultiSelect">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span>多选</span>
          </button>
        </div>
      </Teleport>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAvatarUrl } from '@/config/api'

const router = useRouter()

const props = defineProps({
  chatUser: { type: Object, default: null },
  messages: { type: Array, default: () => [] },
  chatLoading: { type: Boolean, default: false },
  chatFinished: { type: Boolean, default: false },
  sending: { type: Boolean, default: false },
  currentUserId: { type: Number, default: null },
  isPixBot: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'send', 'loadEarlier', 'recall', 'delete', 'batchDelete'])

const messagesRef = ref(null)
const inputRef = ref(null)
const inputText = ref('')

// 右键菜单状态
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  msg: null,
})

// 多选模式状态
const isMultiSelectMode = ref(false)
const selectedMessageIds = ref(new Set())

const canSend = computed(() => inputText.value.trim().length > 0)

/**
 * 跳转到用户个人主页
 */
const goToProfile = () => {
  if (props.chatUser?.username) {
    router.push(`/profile/${props.chatUser.username}`)
  }
}

/**
 * 判断消息是否是自己发的
 */
const isMine = (msg) => {
  return msg.from_user_id == props.currentUserId
}

/**
 * 判断消息是否可以撤销（2分钟内且是自己发送的）
 */
const canRecall = (msg) => {
  if (!isMine(msg)) return false
  if (!msg.create_time) return false
  const msgTime = new Date(msg.create_time).getTime()
  const now = Date.now()
  const TWO_MINUTES = 2 * 60 * 1000
  return (now - msgTime) <= TWO_MINUTES
}

/**
 * 显示右键菜单
 */
const showContextMenu = (event, msg) => {
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    msg: msg,
  }
}

/**
 * 隐藏右键菜单
 */
const hideContextMenu = () => {
  contextMenu.value.visible = false
}

/**
 * 撤销消息
 */
const handleRecall = () => {
  if (contextMenu.value.msg) {
    emit('recall', contextMenu.value.msg.message_id)
  }
  hideContextMenu()
}

/**
 * 删除消息
 */
const handleDelete = () => {
  if (contextMenu.value.msg) {
    emit('delete', contextMenu.value.msg.message_id)
  }
  hideContextMenu()
}

/**
 * 进入多选模式
 */
const handleMultiSelect = () => {
  isMultiSelectMode.value = true
  // 把右键点击的消息加入选中
  if (contextMenu.value.msg) {
    selectedMessageIds.value.add(contextMenu.value.msg.message_id)
  }
  hideContextMenu()
}

/**
 * 切换消息选中状态
 */
const toggleSelect = (messageId) => {
  if (selectedMessageIds.value.has(messageId)) {
    selectedMessageIds.value.delete(messageId)
  } else {
    selectedMessageIds.value.add(messageId)
  }
  // 触发响应式更新
  selectedMessageIds.value = new Set(selectedMessageIds.value)
}

/**
 * 取消多选模式
 */
const cancelMultiSelect = () => {
  isMultiSelectMode.value = false
  selectedMessageIds.value = new Set()
}

/**
 * 批量删除选中的消息
 */
const handleBatchDelete = () => {
  if (selectedMessageIds.value.size === 0) return
  emit('batchDelete', Array.from(selectedMessageIds.value))
  cancelMultiSelect()
}

// 点击其他地方关闭菜单
if (typeof window !== 'undefined') {
  window.addEventListener('click', hideContextMenu)
}

// 组件卸载时清理
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('click', hideContextMenu)
  }
})

/**
 * 发送消息
 */
const handleSend = async () => {
  if (!canSend.value || props.sending) return

  const content = inputText.value.trim()
  if (content) {
    emit('send', content)
    inputText.value = ''
    // 重置 textarea 高度
    await nextTick()
    if (inputRef.value) {
      inputRef.value.style.height = 'auto'
    }
  }
}

/**
 * 自动调整 textarea 高度
 */
const autoResize = () => {
  const el = inputRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

/**
 * 滚动处理（加载更早消息）
 */
const handleScroll = () => {
  const el = messagesRef.value
  if (!el || props.chatLoading || props.chatFinished) return

  // 滚动到顶部 100px 以内时加载更早消息
  if (el.scrollTop <= 100) {
    // 记录当前滚动位置和高度
    const prevScrollHeight = el.scrollHeight
    const prevScrollTop = el.scrollTop
    
    emit('loadEarlier')
    
    // 加载后恢复滚动位置（等待DOM更新）
    nextTick(() => {
      const newScrollHeight = el.scrollHeight
      el.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight)
    })
  }
}

/**
 * 滚动到底部
 */
const scrollToBottom = async (smooth = true) => {
  await nextTick()
  if (messagesRef.value) {
    messagesRef.value.scrollTo({
      top: messagesRef.value.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    })
  }
}

/**
 * 格式化时间
 */
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const time = `${hours}:${minutes}`

  if (diff < 86400000) return time

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  if (date.getFullYear() === now.getFullYear()) {
    return `${month}-${day} ${time}`
  }

  return `${date.getFullYear()}-${month}-${day} ${time}`
}

// 监听消息变化，自动滚动到底部
watch(() => props.messages.length, async (newLen, oldLen) => {
  if (newLen > oldLen) {
    await scrollToBottom()
  }
})

// 暴露方法给父组件
defineExpose({
  scrollToBottom,
  focusInput: () => inputRef.value?.focus(),
})
</script>

<style scoped>
.cw-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* 占位状态 */
.cw-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.2);
  font-size: 14px;
  gap: 16px;
}

.cw-placeholder-icon {
  width: 48px;
  height: 48px;
}

/* 聊天头部 */
.cw-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  flex-shrink: 0;
}

.cw-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: opacity 0.25s ease;
}

.cw-header-info:hover {
  opacity: 0.8;
}

.cw-header-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  object-fit: cover;
  background: #2a2a2a;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: border-color 0.25s ease;
}

.cw-header-avatar:hover {
  border-color: #00A947;
}

.cw-header-name {
  font-family: sul-gm1, sans-serif;
  font-size: 15px;
  color: #ffffff;
}

.cw-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cw-header-btn {
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #1a1a1a;
  color: #cecece;
  font-size: 13px;
  font-family: '微软雅黑', sans-serif;
  cursor: pointer;
  transition: all 0.25s ease;
}

.cw-header-btn.cancel {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.cw-header-btn.cancel:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.cw-header-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.25s ease;
}

.cw-header-close svg {
  width: 18px;
  height: 18px;
}

.cw-header-close:hover {
  color: #e64d3c;
  background: rgba(230, 77, 60, 0.15);
}

/* 消息列表 */
.cw-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.cw-messages::-webkit-scrollbar {
  display: none;
}

.cw-load-hint {
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.2);
  padding: 12px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 加载动画 */
.cw-load-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: #00A947;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 下拉加载更多提示 */
.cw-load-more-hint {
  color: rgba(255, 255, 255, 0.15);
  font-size: 11px;
  letter-spacing: 0.5px;
}

.cw-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: rgba(255, 255, 255, 0.2);
  font-size: 13px;
}

/* 消息气泡 */
.cw-msg {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  max-width: 75%;
  cursor: pointer;
  transition: all 0.25s ease;
}

.cw-msg.sent {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.cw-msg.received {
  align-self: flex-start;
}

/* 多选模式消息样式 */
.cw-msg.selected {
  opacity: 0.8;
}

.cw-msg.selected .cw-msg-bubble {
  border: 2px solid #00A947;
  box-shadow: 0 0 0 4px rgba(0, 169, 71, 0.1);
}

/* 复选框 */
.cw-checkbox {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cw-checkbox.checked {
  background: #00A947;
  border-color: #00A947;
}

.cw-checkbox svg {
  width: 16px;
  height: 16px;
  color: #fff;
}

.cw-msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  object-fit: cover;
  background: #2a2a2a;
  border: 2px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  transition: border-color 0.25s ease;
  cursor: pointer;
}

.cw-msg-avatar:hover {
  border-color: #00A947;
}

.cw-msg-body {
  display: flex;
  flex-direction: column;
}

.cw-msg.sent .cw-msg-body {
  align-items: flex-end;
}

.cw-msg.received .cw-msg-body {
  align-items: flex-start;
}

.cw-msg-bubble {
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;
  transition: all 0.25s ease;
}

.cw-msg.sent .cw-msg-bubble {
  background: #00A947;
  color: #ffffff;
  border-bottom-right-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 169, 71, 0.2);
}

.cw-msg.sent .cw-msg-bubble:hover {
  background: #00c054;
  box-shadow: 0 6px 16px rgba(0, 169, 71, 0.3);
}

.cw-msg.received .cw-msg-bubble {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: rgba(255, 255, 255, 0.9);
  border-bottom-left-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.cw-msg.received .cw-msg-bubble:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.1);
}

.cw-msg-time {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.2);
  padding: 0 4px;
}

/* 消息元数据容器 */
.cw-msg-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  padding: 0 4px;
}

/* 消息已读/未读状态 */
.cw-msg-status {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
  transition: color 0.25s ease;
}

.cw-msg-status.read {
  color: #00A947;
}

.cw-status-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.cw-status-text {
  white-space: nowrap;
}

/* 批量操作栏 */
.cw-batch-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  flex-shrink: 0;
}

.cw-batch-count {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.cw-batch-btn {
  padding: 10px 24px;
  border-radius: 10px;
  border: 1px solid rgba(230, 77, 60, 0.3);
  background: rgba(230, 77, 60, 0.15);
  color: #e64d3c;
  font-size: 13px;
  font-family: '微软雅黑', sans-serif;
  cursor: pointer;
  transition: all 0.25s ease;
}

.cw-batch-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cw-batch-btn:not(:disabled):hover {
  background: rgba(230, 77, 60, 0.25);
  border-color: rgba(230, 77, 60, 0.5);
}

/* 输入区域 */
.cw-input-area {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  flex-shrink: 0;
}

.cw-input-wrapper {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: all 0.25s ease;
}

.cw-input-wrapper:focus-within {
  border-color: rgba(0, 169, 71, 0.5);
  background: rgba(255, 255, 255, 0.08);
}

.cw-input {
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  min-height: 20px;
  max-height: 120px;
  font-family: inherit;
}

.cw-input::placeholder {
  color: #555;
}

.cw-send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #1a1a1a;
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.cw-send-btn.active {
  background: #00A947;
  border-color: #00A947;
  color: #ffffff;
  cursor: pointer;
}

.cw-send-btn.active:hover {
  background: #00c054;
  border-color: #00c054;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 169, 71, 0.3);
}

.cw-send-btn svg {
  width: 18px;
  height: 18px;
}

.cw-send-loading {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 右键菜单 */
.cw-context-menu {
  position: fixed;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 4px;
  min-width: 120px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.cw-context-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-family: '微软雅黑', sans-serif;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.cw-context-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.cw-context-item.delete {
  color: #e64d3c;
}

.cw-context-item.delete:hover {
  background: rgba(230, 77, 60, 0.15);
}

.cw-context-item.recall {
  color: #f39c12;
}

.cw-context-item.recall:hover {
  background: rgba(243, 156, 18, 0.15);
}

.cw-context-item.select {
  color: #00A947;
}

.cw-context-item.select:hover {
  background: rgba(0, 169, 71, 0.15);
}

.cw-context-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 4px 0;
}

/* PixBot 特殊样式 */
.pixbot-header-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 169, 71, 0.1);
  border: 2px solid rgba(0, 169, 71, 0.2);
}

.pixbot-header-name {
  color: #00A947;
  font-weight: 600;
}

.pixbot-msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 169, 71, 0.1);
  border: 2px solid rgba(0, 169, 71, 0.2);
  flex-shrink: 0;
}

.cw-pixbot-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px 20px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 13px;
  font-family: '微软雅黑', sans-serif;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
</style>