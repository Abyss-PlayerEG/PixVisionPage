<template>
  <div v-if="isLoggedIn" class="msg-notification" ref="containerRef">
    <!-- 消息图标按钮 -->
    <div class="msg-trigger" @click="togglePanel" :class="{ active: panelOpen }">
      <svg class="msg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <!-- 未读角标 -->
      <span v-if="unreadCount.total > 0" class="msg-badge">
        {{ unreadCount.total > 99 ? '99+' : unreadCount.total }}
      </span>
    </div>

    <!-- 下拉面板 -->
    <Transition name="panel-fade">
      <div v-if="panelOpen" class="msg-panel">
        <!-- 面板头部 -->
        <div class="panel-header">
          <span class="panel-title">消息</span>
          <div class="panel-actions">
            <button v-if="unreadCount.total > 0" class="action-btn" @click="handleMarkAllRead">
              全部已读
            </button>
            <button class="action-btn view-all" @click="goToMessages">
              查看全部
            </button>
          </div>
        </div>

        <!-- 标签切换 -->
        <div class="panel-tabs">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'private' }"
            @click="activeTab = 'private'"
          >
            私信
            <span v-if="unreadCount.private > 0" class="tab-badge">{{ unreadCount.private }}</span>
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'system' }"
            @click="switchToSystem"
          >
            通知
            <span v-if="unreadCount.system > 0" class="tab-badge">{{ unreadCount.system }}</span>
          </button>
        </div>

        <!-- 私信会话列表 -->
        <div v-if="activeTab === 'private'" class="panel-body">
          <div v-if="conversationsLoading && conversations.length === 0" class="loading-hint">
            加载中...
          </div>
          <div v-else-if="conversations.length === 0" class="empty-hint">
            暂无未读私信
          </div>
          <div
            v-for="conv in conversations"
            :key="conv.other_user_id"
            class="conv-item"
            @click="handleOpenConversation(conv)"
          >
            <div class="conv-avatar">
              <img :src="getAvatarUrl(conv.other_avatar_url)" :alt="conv.other_nickname" />
              <span v-if="conv.unread_count > 0" class="conv-unread-dot"></span>
            </div>
            <div class="conv-info">
              <div class="conv-name">{{ conv.other_nickname || '未知用户' }}</div>
              <div class="conv-last-msg">{{ conv.last_message || '' }}</div>
            </div>
            <div class="conv-meta">
              <div class="conv-time">{{ formatTime(conv.last_message_time) }}</div>
              <span v-if="conv.unread_count > 0" class="conv-unread-count">
                {{ conv.unread_count > 99 ? '99+' : conv.unread_count }}
              </span>
            </div>
          </div>
        </div>

        <!-- 系统通知列表 -->
        <div v-else class="panel-body">
          <div v-if="systemLoading && systemMessages.length === 0" class="loading-hint">
            加载中...
          </div>
          <div v-else-if="systemMessages.length === 0" class="empty-hint">
            暂无未读通知
          </div>
          <div
            v-for="msg in systemMessages"
            :key="msg.message_id"
            class="notif-item"
            :class="{ unread: !msg.is_read }"
            @click="goToMessages"
          >
            <div class="notif-project">{{ getProjectLabel(msg.project) }}</div>
            <div class="notif-content" v-html="msg.message"></div>
            <div class="notif-time">{{ formatTime(msg.create_time) }}</div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useMessage } from '@/composables/message/useMessage'
import { useWebSocket } from '@/composables/message/useWebSocket'
import { getAvatarUrl } from '@/config/api'
import { showInfo } from '@/utils/notification'

const router = useRouter()
const containerRef = ref(null)
const panelOpen = ref(false)
const activeTab = ref('private')

// 认证状态
const { isLoggedIn } = useAuth()

// WebSocket
const { onMessage: onWsMessage } = useWebSocket()

const {
  unreadCount,
  conversations,
  conversationsLoading,
  systemMessages,
  systemLoading,
  refreshUnreadCount,
  loadConversations,
  loadSystemMessages,
  openConversation,
  handleMarkAllAsRead,
} = useMessage()

let clickOutsideHandler = null
let unsubscribeWs = null

// WebSocket 消息处理
const handleWsMessage = (data) => {
  if (!data || !data.type) return
  
  const msg = data.data
  if (!msg) return
  
  // 收到新消息通知时刷新未读数
  if (data.type === 'notification') {
    console.log('📨 MessageNotification 收到新消息，刷新未读数')
    refreshUnreadCount()
    
    // 如果当前在消息页面，不显示 toast（避免多余通知）
    if (router.currentRoute.value.path === '/messages') {
      return
    }
    
    // 私信消息 Toast 提示
    if (msg.message_type === 'private') {
      const senderName = msg.from_nickname || msg.from_username || '好友'
      showInfo(`${senderName} 发来一条新消息`, '新消息')
    }
    
    // 系统通知 Toast 提示（只显示类型，不显示HTML内容）
    if (msg.message_type === 'system') {
      const typeLabel = getProjectLabel(msg.project)
      showInfo(`收到一条${typeLabel}`, '系统通知')
    }
  }
  
  // 收到已读回执时也刷新未读数
  if (data.type === 'messages_read') {
    console.log('✅ MessageNotification 收到已读回执，刷新未读数')
    refreshUnreadCount()
  }
}

/**
 * 切换面板显示
 */
const togglePanel = () => {
  panelOpen.value = !panelOpen.value
  if (panelOpen.value) {
    refreshUnreadCount()
    // 每次打开面板都重新加载未读会话
    if (activeTab.value === 'private') {
      loadConversations(false)  // 只加载未读会话
    } else {
      loadSystemMessages(undefined, false)  // 只加载未读通知
    }
  }
}

/**
 * 切换到系统通知标签
 */
const switchToSystem = () => {
  activeTab.value = 'system'
  // 每次切换都重新加载未读通知
  loadSystemMessages(undefined, false)  // 只加载未读通知
}

/**
 * 打开会话
 */
const handleOpenConversation = async (conv) => {
  await openConversation(conv.other_user_id)
  panelOpen.value = false
  router.push({
    path: '/messages',
    query: { userId: conv.other_user_id },
  })
}

/**
 * 全部标记已读
 */
const handleMarkAllRead = async () => {
  await handleMarkAllAsRead()
}

/**
 * 跳转到消息中心
 */
const goToMessages = () => {
  panelOpen.value = false
  router.push('/messages')
}

/**
 * 点击外部关闭面板
 */
const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    panelOpen.value = false
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
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`

  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}

/**
 * 获取消息主题标签
 */
const getProjectLabel = (project) => {
  const labels = {
    work_audit: '作品审核',
    like: '点赞',
    star: '收藏',
    comment: '评论',
    system: '系统',
  }
  return labels[project] || project || '通知'
}

onMounted(() => {
  // 只在用户已登录时才获取未读消息数
  if (isLoggedIn.value) {
    refreshUnreadCount()
  }
  clickOutsideHandler = handleClickOutside
  document.addEventListener('click', clickOutsideHandler)
  
  // 注册 WebSocket 消息监听
  unsubscribeWs = onWsMessage(handleWsMessage)
})

onUnmounted(() => {
  if (clickOutsideHandler) {
    document.removeEventListener('click', clickOutsideHandler)
  }
  // 取消 WebSocket 消息监听
  if (unsubscribeWs) {
    unsubscribeWs()
  }
})

// 暴露给父组件
defineExpose({
  refreshUnreadCount,
})
</script>

<style scoped>
.msg-notification {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.msg-trigger {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
  color: rgba(255, 255, 255, 0.7);
}

.msg-trigger:hover,
.msg-trigger.active {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.msg-icon {
  width: 20px;
  height: 20px;
}

.msg-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: #e64d3c;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  line-height: 16px;
  text-align: center;
  border-radius: 999px;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 下拉面板 */
.msg-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 360px;
  max-height: 480px;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.2s;
}

.action-btn:hover {
  color: #00A947;
  background: rgba(0, 169, 71, 0.1);
}

.view-all {
  color: #00A947;
}

/* 标签切换 */
.panel-tabs {
  display: flex;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.tab-btn {
  flex: 1;
  background: none;
  border: none;
  padding: 10px 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.tab-btn:hover {
  color: rgba(255, 255, 255, 0.8);
}

.tab-btn.active {
  color: #ffffff;
  font-weight: 500;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  right: 20%;
  height: 2px;
  background: #00A947;
  border-radius: 1px;
}

.tab-badge {
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  background: #e64d3c;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  line-height: 14px;
  text-align: center;
  border-radius: 999px;
}

/* 面板内容 */
.panel-body {
  flex: 1;
  overflow-y: auto;
  max-height: 360px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.panel-body::-webkit-scrollbar {
  display: none;
}

.loading-hint,
.empty-hint {
  text-align: center;
  padding: 40px 16px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 13px;
}

/* 会话项 */
.conv-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.conv-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.conv-avatar {
  position: relative;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.conv-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  background: #2a2a2a;
}

.conv-unread-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background: #e64d3c;
  border: 2px solid #1a1a1a;
  border-radius: 50%;
}

.conv-info {
  flex: 1;
  min-width: 0;
}

.conv-name {
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conv-last-msg {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conv-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.conv-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  white-space: nowrap;
}

.conv-unread-count {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #e64d3c;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  line-height: 18px;
  text-align: center;
  border-radius: 999px;
}

/* 通知项 */
.notif-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  border-left: 3px solid transparent;
}

.notif-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.notif-item.unread {
  border-left-color: #00A947;
}

.notif-project {
  display: inline-block;
  font-size: 11px;
  color: #00A947;
  background: rgba(0, 169, 71, 0.1);
  padding: 1px 6px;
  border-radius: 3px;
  margin-bottom: 4px;
}

.notif-content {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-height: 20px;
}

/* HTML内容样式 */
.notif-content :deep(h1),
.notif-content :deep(h2),
.notif-content :deep(h3),
.notif-content :deep(p),
.notif-content :deep(hr) {
  display: inline;
  margin: 0;
  font-size: inherit;
}

.notif-content :deep(hr) {
  display: inline;
  border: none;
  margin: 0 4px;
}

.notif-content :deep(strong) {
  color: #00A947;
}

.notif-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
}

/* 面板动画 */
.panel-fade-enter-active {
  transition: all 0.2s ease;
}

.panel-fade-leave-active {
  transition: all 0.15s ease;
}

.panel-fade-enter-from,
.panel-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 响应式 */
@media (max-width: 480px) {
  .msg-panel {
    width: 320px;
    right: -40px;
  }
}
</style>
