<template>
  <div class="cp-panel" :class="{ 'mobile-show-chat': showChat && isMobile }">
    <!-- 左侧会话列表 -->
    <div class="cp-sidebar">
      <ConversationList
        :conversations="conversations"
        :loading="conversationsLoading"
        :finished="conversationsFinished"
        :active-user-id="activeUserId"
        :has-private-unread="privateUnread > 0"
        :system-unread="systemUnread"
        @select="handleSelectConversation"
        @selectPixBot="handleSelectPixBot"
        @load-more="loadMoreConversations"
        @mark-all-read="handleMarkAllRead"
      />
    </div>

    <!-- 右侧聊天窗口 -->
    <div class="cp-main">
      <!-- 移动端返回按钮 -->
      <button v-if="isMobile && showChat" class="cp-mobile-back" @click="handleClose">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span>返回</span>
      </button>
      
      <ChatWindow
        v-if="activeUserId"
        :chat-user="currentChatUser"
        :messages="isPixBot ? systemMessages : messages"
        :chat-loading="isPixBot ? systemLoading : chatLoading"
        :chat-finished="isPixBot ? systemFinished : chatFinished"
        :sending="sending"
        :current-user-id="currentUserId"
        :isPixBot="isPixBot"
        @send="handleSend"
        @load-earlier="handleLoadEarlier"
        @close="handleClose"
        @recall="handleRecall"
        @delete="handleDelete"
        @batch-delete="handleBatchDelete"
      />
      <!-- 未选择会话时的空状态 -->
      <div v-else class="cp-empty">
        <div class="cp-empty-icon">
          <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <p class="cp-empty-text">选择一个会话开始聊天</p>
        <p class="cp-empty-hint">从左侧列表中选择一个会话</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useMessage } from '@/composables/message/useMessage'
import { useChat } from '@/composables/message/useChat'
import { useWebSocket } from '@/composables/message/useWebSocket'
import { recallMessage, deleteMessage, batchDeleteMessages } from '@/api/messageApi'
import { showToast } from '@/utils/notification'
import ConversationList from './ConversationList.vue'
import ChatWindow from './ChatWindow.vue'

const router = useRouter()
const route = useRoute()

// 认证状态
const { userInfo } = useAuth()
const currentUserId = computed(() => userInfo.value?.user_id || userInfo.value?.userId)

// WebSocket
const { connect: connectWs, disconnect: disconnectWs, onMessage: onWsMessage } = useWebSocket()

// 会话列表
const {
  conversations,
  conversationsLoading,
  conversationsFinished,
  privateUnread,
  systemUnread,
  loadConversations,
  loadMoreConversations,
  openConversation,
  refreshUnreadCount,
  handleMarkAllAsRead,
  loadSystemMessages,
  systemMessages,
  systemLoading,
  systemFinished,
  loadMoreSystemMessages,
  addSystemMessage,
} = useMessage()

// 聊天逻辑
const {
  currentChatUser,
  messages,
  chatLoading,
  chatFinished,
  sending,
  openChat,
  loadEarlierMessages,
  send,
  closeChat,
  setCurrentUserId,
  handleIncomingMessage,
} = useChat()

// 当前激活的会话用户ID（可以是数字用户ID或字符串'pixbot'）
const activeUserId = ref(null)

// 是否为 PixBot 模式
const isPixBot = computed(() => activeUserId.value === 'pixbot')

// 移动端面板切换状态
const showChat = ref(false)
const isMobile = ref(false)

/**
 * 检测是否为移动端
 */
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 监听窗口大小变化
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

/**
 * 选择会话
 */
const handleSelectConversation = async (conv) => {
  activeUserId.value = conv.other_user_id
  // 移动端显示聊天窗口
  if (isMobile.value) {
    showChat.value = true
  }
  // 更新 URL 参数
  router.replace({
    path: '/messages',
    query: { userId: conv.other_user_id }
  })
  // 标记会话为已读
  await openConversation(conv.other_user_id)
  // 打开聊天（传入完整用户信息）
  openChat({
    user_id: conv.other_user_id,
    nickname: conv.other_nickname,
    avatar_url: conv.other_avatar_url,
    username: conv.other_username,
  })
}

/**
 * 选择 PixBot 系统通知会话
 */
const handleSelectPixBot = async () => {
  activeUserId.value = 'pixbot'
  // 移动端显示聊天窗口
  if (isMobile.value) {
    showChat.value = true
  }
  // 更新 URL 参数
  router.replace({
    path: '/messages',
    query: { userId: 'pixbot' }
  })
  // 设置 PixBot 虚拟用户信息（让 ChatWindow 显示聊天界面）
  currentChatUser.value = {
    user_id: 'pixbot',
    nickname: 'PixBot',
    avatar_url: null,
    username: 'pixbot',
  }
  // 加载系统通知
  await loadSystemMessages()
  // 标记系统通知为已读
  await handleMarkAllAsRead('system')
}

/**
 * 发送消息
 */
const handleSend = async (content) => {
  if (activeUserId.value && !isPixBot.value) {
    await send(activeUserId.value, content)
  }
}

/**
 * 加载更早消息
 */
const handleLoadEarlier = () => {
  if (isPixBot.value) {
    loadMoreSystemMessages()
  } else if (activeUserId.value) {
    loadEarlierMessages(activeUserId.value)
  }
}

/**
 * 关闭聊天
 */
const handleClose = () => {
  activeUserId.value = null
  showChat.value = false
  closeChat()
  router.replace({ path: '/messages' })
}

/**
 * 全部标记已读
 */
const handleMarkAllRead = async () => {
  await handleMarkAllAsRead('private')
}

/**
 * 撤销消息
 */
const handleRecall = async (messageId) => {
  const result = await recallMessage(messageId)
  if (result.success) {
    showToast({ title: '成功', message: '消息已撤销', type: 'success' })
    // 重新加载聊天记录
    if (isPixBot.value) {
      // PixBot 系统通知：重新加载系统通知列表
      await loadSystemMessages()
    } else if (activeUserId.value) {
      // 普通私信：重新加载聊天记录
      await openChat({
        user_id: activeUserId.value,
        nickname: currentChatUser.value?.nickname,
        avatar_url: currentChatUser.value?.avatar_url,
        username: currentChatUser.value?.username,
      })
    }
    // 刷新会话列表（更新最后一条消息）
    await loadConversations()
  } else {
    showToast({ title: '撤销失败', message: result.message, type: 'error' })
  }
}

/**
 * 删除消息
 */
const handleDelete = async (messageId) => {
  const result = await deleteMessage(messageId)
  if (result.success) {
    showToast({ title: '成功', message: '消息已删除', type: 'success' })
    // 重新加载聊天记录
    if (isPixBot.value) {
      // PixBot 系统通知：重新加载系统通知列表
      await loadSystemMessages()
    } else if (activeUserId.value) {
      // 普通私信：重新加载聊天记录
      await openChat({
        user_id: activeUserId.value,
        nickname: currentChatUser.value?.nickname,
        avatar_url: currentChatUser.value?.avatar_url,
        username: currentChatUser.value?.username,
      })
    }
    // 刷新会话列表（更新最后一条消息）
    await loadConversations()
  } else {
    showToast({ title: '删除失败', message: result.message, type: 'error' })
  }
}

/**
 * 批量删除消息
 */
const handleBatchDelete = async (messageIds) => {
  if (!messageIds || messageIds.length === 0) return
  const result = await batchDeleteMessages(messageIds)
  if (result.success) {
    showToast({ title: '成功', message: `已删除 ${messageIds.length} 条消息`, type: 'success' })
    // 重新加载聊天记录
    if (isPixBot.value) {
      // PixBot 系统通知：重新加载系统通知列表
      await loadSystemMessages()
    } else if (activeUserId.value) {
      // 普通私信：重新加载聊天记录
      await openChat({
        user_id: activeUserId.value,
        nickname: currentChatUser.value?.nickname,
        avatar_url: currentChatUser.value?.avatar_url,
        username: currentChatUser.value?.username,
      })
    }
    // 刷新会话列表（更新最后一条消息）
    await loadConversations()
  } else {
    showToast({ title: '批量删除失败', message: result.message, type: 'error' })
  }
}

/**
 * 从 URL 参数初始化聊天（页面刷新时）
 */
const initFromRoute = async () => {
  const userId = route.query.userId

  // 先加载会话列表
  await loadConversations()

  // 如果有 userId 参数，打开对应聊天
  if (userId) {
    // PixBot 系统通知
    if (userId === 'pixbot') {
      await handleSelectPixBot()
      return
    }
    
    const id = Number(userId)
    activeUserId.value = id

    // 从会话列表中查找对方信息
    const conv = conversations.value.find(c => c.other_user_id === id)
    
    if (conv) {
      // 找到会话，使用会话中的完整信息
      console.log('✅ 从会话列表找到用户信息:', conv.other_nickname)
      await openConversation(id)
      await openChat({
        user_id: id,
        nickname: conv.other_nickname,
        avatar_url: conv.other_avatar_url,
        username: conv.other_username,
      })
    } else {
      // 未找到会话，先标记已读，再加载聊天（会从消息中提取信息）
      console.log('⚠️ 会话列表中未找到用户，将从消息中提取信息')
      await openConversation(id)
      await openChat({ user_id: id })
    }
  }
}

// 监听用户ID变化
watch(currentUserId, (newId) => {
  if (newId) {
    setCurrentUserId(newId)
  }
})

// WebSocket 消息处理
let unsubscribeWs = null

const handleWsMessage = (data) => {
  if (!data || !data.type) return

  const msg = data.data
  if (!msg) return

  console.log('📨 收到WebSocket消息:', JSON.stringify(data, null, 2))

  // 处理消息撤销通知 - 根据联调文档 4.4.2
  if (data.type === 'message_recall') {
    console.log('🔄 收到消息撤销通知，刷新聊天记录')
    if (activeUserId.value && !isPixBot.value) {
      openChat({
        user_id: activeUserId.value,
        nickname: currentChatUser.value?.nickname,
        avatar_url: currentChatUser.value?.avatar_url,
        username: currentChatUser.value?.username,
      })
    }
    loadConversations()
    return
  }

  // 处理消息删除通知 - 支持多种格式
  const isDelete = 
    data.type === 'MESSAGE_DELETE' || 
    data.type === 'DELETE' ||
    data.type === 'delete' ||
    msg.type === 'delete' ||
    msg.action === 'delete' ||
    (msg.message_type === 'system' && msg.project === 'message_delete')
  
  if (isDelete) {
    console.log('🔄 收到消息删除通知，刷新聊天记录')
    if (activeUserId.value && !isPixBot.value) {
      openChat({
        user_id: activeUserId.value,
        nickname: currentChatUser.value?.nickname,
        avatar_url: currentChatUser.value?.avatar_url,
      })
    }
    loadConversations()
    return
  }

  // 处理消息已读通知（根据联调文档 4.4.3）
  if (data.type === 'messages_read') {
    const readerId = data.data?.reader_id
    console.log('✅ 收到消息已读通知，reader_id:', readerId)
    
    if (readerId && !isPixBot.value) {
      // 更新本地消息列表中，发送给该读者的消息的已读状态
      messages.value.forEach(m => {
        // 当前用户发送的消息，且接收者是 readerId
        if (m.from_user_id === currentUserId.value && m.to === readerId) {
          m.is_read = true
        }
      })
      console.log('✅ 已更新发送给用户', readerId, '的消息为已读')
    }
    return
  }

  // 处理私信消息 (type=notification 且内部 message_type=private)
  if (msg.message_type === 'private') {
    console.log('📨 收到私信消息:', msg)

    const fromUserId = msg.from_user_id
    const toUserId = msg.to || msg.to_user_id

    // 如果消息来自当前聊天对象，添加到聊天记录并标记已读
    if (fromUserId === activeUserId.value && !isPixBot.value) {
      console.log('✅ 消息来自当前聊天对象，添加到聊天记录')
      handleIncomingMessage(msg)
      // 标记会话已读（因为用户正在查看这个会话）
      openConversation(fromUserId)
    }

    // 如果是发送给当前用户的消息，更新会话列表和未读计数
    if (toUserId === currentUserId.value) {
      loadConversations()
      refreshUnreadCount()
    }
    return
  }

  // 处理系统通知消息 (type=notification 且内部 message_type=system)
  if (msg.message_type === 'system') {
    console.log('📢 收到系统通知消息:', msg)

    // 如果正在查看 PixBot 聊天窗口，实时追加到列表并标记已读
    if (isPixBot.value) {
      // 标记消息为已读（本地状态）
      msg.is_read = true
      addSystemMessage(msg)
      // 调用 API 标记系统通知为已读
      handleMarkAllAsRead('system')
    }

    // 更新未读计数
    refreshUnreadCount()
    return
  }
}

// 组件挂载时初始化
onMounted(() => {
  // 设置当前用户ID到useChat
  if (currentUserId.value) {
    setCurrentUserId(currentUserId.value)
  }

  // 连接 WebSocket
  connectWs()
  unsubscribeWs = onWsMessage(handleWsMessage)

  // 初始化（会加载会话列表）
  initFromRoute()
})

// 组件卸载时断开 WebSocket
onUnmounted(() => {
  if (unsubscribeWs) {
    unsubscribeWs()
  }
  disconnectWs()
})
</script>

<style scoped>
/* 面板容器 */
.cp-panel {
  display: flex;
  width: 100%;
  height: calc(100vh - 64px - 16px);
  min-height: 500px;
  gap: 0;
  background: rgba(10, 10, 10, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.5),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  position: relative;
}

/* 左侧会话列表 */
.cp-sidebar {
  width: 320px;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}

/* 右侧聊天区域 */
.cp-main {
  flex: 1;
  min-width: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  position: relative;
}

/* 移动端返回按钮 */
.cp-mobile-back {
  display: none;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  color: #00A947;
  font-size: 14px;
  font-family: '微软雅黑', sans-serif;
  cursor: pointer;
  transition: all 0.25s ease;
  width: 100%;
  box-sizing: border-box;
}

.cp-mobile-back:hover {
  background: rgba(0, 169, 71, 0.1);
}

.cp-mobile-back svg {
  flex-shrink: 0;
}

/* 空状态 */
.cp-empty {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.cp-empty-icon {
  color: #3a3a3a;
  opacity: 0.5;
}

.cp-empty-text {
  font-family: sul-gm1, sans-serif;
  font-size: 18px;
  color: #7e7e7e;
  margin: 0;
}

.cp-empty-hint {
  font-size: 14px;
  color: #555;
  margin: 0;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .cp-panel {
    flex-direction: column;
    height: calc(100vh - 50px);
    min-height: auto;
    border-radius: 0;
    gap: 0;
    position: relative;
  }

  .cp-sidebar {
    width: 100%;
    height: 100%;
    border-right: none;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .cp-main {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .cp-mobile-back {
    display: flex;
  }

  /* 显示聊天窗口时 */
  .cp-panel.mobile-show-chat .cp-sidebar {
    transform: translateX(-30%);
  }

  .cp-panel.mobile-show-chat .cp-main {
    transform: translateX(0);
  }
}
</style>