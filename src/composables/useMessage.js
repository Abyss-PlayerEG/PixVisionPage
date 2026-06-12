/**
 * 消息状态管理 Composable
 * 管理未读计数、会话列表、系统通知
 * 
 * 状态提升到模块级别，确保所有组件共享同一份数据
 */
import { ref, computed } from 'vue'
import {
  getUnreadCount,
  getConversations,
  getSystemMessages,
  markConversationAsRead,
  markAllAsRead,
} from '@/api/messageApi'

// ========== 模块级别共享状态 ==========
// 未读消息计数（全局共享）
const unreadCount = ref({
  total: 0,
  private: 0,
  system: 0,
})

// 会话列表（全局共享）
const conversations = ref([])
const conversationsLoading = ref(false)
const conversationsPage = ref(1)
const conversationsFinished = ref(false)

// 系统通知（全局共享）
const systemMessages = ref([])
const systemLoading = ref(false)
const systemPage = ref(1)
const systemFinished = ref(false)

// 计算属性
const hasUnread = computed(() => unreadCount.value.total > 0)
const privateUnread = computed(() => unreadCount.value.private)
const systemUnread = computed(() => unreadCount.value.system)

export function useMessage() {
  /**
   * 刷新未读消息数量
   */
  const refreshUnreadCount = async () => {
    const result = await getUnreadCount()
    if (result.success) {
      unreadCount.value = result.data
    }
  }

  /**
   * 获取特定会话的未读数
   * @param {number} otherUserId - 对方用户ID
   * @returns {Promise<number>} 未读数量
   */
  const getConversationUnread = async (otherUserId) => {
    const result = await getUnreadCount(otherUserId)
    return result.success ? result.data?.total || 0 : 0
  }

  /**
   * 加载会话列表（首次或刷新）
   * @param {boolean} [isRead] - 已读状态筛选（可选：false-只返回未读会话）
   */
  const loadConversations = async (isRead) => {
    conversationsLoading.value = true
    conversationsPage.value = 1
    conversationsFinished.value = false

    const result = await getConversations(1, 20, isRead)
    if (result.success) {
      conversations.value = result.data.records || []
      conversationsPage.value = 2
      // 判断是否已加载全部
      if (!result.data.records || result.data.records.length < 20) {
        conversationsFinished.value = true
      }
    }

    conversationsLoading.value = false
  }

  /**
   * 加载更多会话（下一页）
   * @param {boolean} [isRead] - 已读状态筛选（可选：false-只返回未读会话）
   */
  const loadMoreConversations = async (isRead) => {
    if (conversationsLoading.value || conversationsFinished.value) return

    conversationsLoading.value = true
    const result = await getConversations(conversationsPage.value, 20, isRead)

    if (result.success && result.data.records) {
      conversations.value.push(...result.data.records)
      conversationsPage.value++
      if (result.data.records.length < 20) {
        conversationsFinished.value = true
      }
    }

    conversationsLoading.value = false
  }

  /**
   * 打开会话（标记已读 + 更新本地状态）
   * @param {number} otherUserId - 对方用户ID
   */
  const openConversation = async (otherUserId) => {
    await markConversationAsRead(otherUserId)

    // 更新本地会话未读数
    const conv = conversations.value.find(c => c.other_user_id === otherUserId)
    if (conv && conv.unread_count > 0) {
      unreadCount.value.private -= conv.unread_count
      unreadCount.value.total -= conv.unread_count
      conv.unread_count = 0
    }
  }

  /**
   * 加载系统通知（首次或刷新）
   */
  const loadSystemMessages = async (project, isRead) => {
    systemLoading.value = true
    systemPage.value = 1
    systemFinished.value = false

    const result = await getSystemMessages(1, 20, project, isRead)
    if (result.success) {
      // API 返回降序，反转为升序（聊天界面：旧消息在上，新消息在下）
      const records = result.data.records || []
      systemMessages.value = records.reverse()
      systemPage.value = 2
      if (!result.data.records || result.data.records.length < 20) {
        systemFinished.value = true
      }
    }

    systemLoading.value = false
  }

  /**
   * 加载更多系统通知
   */
  const loadMoreSystemMessages = async (project, isRead) => {
    if (systemLoading.value || systemFinished.value) return

    systemLoading.value = true
    const result = await getSystemMessages(systemPage.value, 20, project, isRead)

    if (result.success && result.data.records) {
      // API 返回更早的消息（降序），反转后添加到开头
      const records = result.data.records.reverse()
      systemMessages.value.unshift(...records)
      systemPage.value++
      if (result.data.records.length < 20) {
        systemFinished.value = true
      }
    }

    systemLoading.value = false
  }

  /**
   * 实时追加系统通知（WebSocket 推送时调用）
   * @param {object} message - 系统通知消息对象
   */
  const addSystemMessage = (message) => {
    if (!message) return
    // 避免重复添加
    const exists = systemMessages.value.some(m => m.message_id === message.message_id)
    if (!exists) {
      // 新消息添加到末尾（升序：最新在最后）
      systemMessages.value.push(message)
      console.log('✅ 实时追加系统通知:', message.message_id)
    }
  }

  /**
   * 全部标记已读
   * @param {string} [messageType] - 消息类型（可选）
   */
  const handleMarkAllAsRead = async (messageType) => {
    const result = await markAllAsRead(messageType)
    if (result.success) {
      // 刷新未读数
      await refreshUnreadCount()
      // 更新本地会话列表的未读数
      if (!messageType || messageType === 'private') {
        conversations.value.forEach(c => { c.unread_count = 0 })
      }
    }
    return result
  }

  /**
   * WebSocket 消息处理
   * @param {object} data - WebSocket 消息数据
   */
  const handleWsMessage = (data) => {
    if (!data || !data.type) return

    switch (data.type) {
      case 'notification':
        // 新消息通知（联调文档 4.4.1）
        console.log('📨 收到新消息通知，刷新未读数')
        refreshUnreadCount()
        break
      case 'message_recall':
        // 消息撤销通知（联调文档 4.4.2）
        console.log('🔄 收到消息撤销通知，刷新未读数')
        refreshUnreadCount()
        break
      case 'messages_read':
        // 已读回执通知（联调文档 4.4.3）
        console.log('✅ 收到已读回执，刷新未读数')
        refreshUnreadCount()
        break
      default:
        // 其他消息类型
        break
    }
  }

  return {
    // 未读计数
    unreadCount,
    hasUnread,
    privateUnread,
    systemUnread,
    refreshUnreadCount,
    getConversationUnread,

    // 会话列表
    conversations,
    conversationsLoading,
    conversationsFinished,
    loadConversations,
    loadMoreConversations,
    openConversation,

    // 系统通知
    systemMessages,
    systemLoading,
    systemFinished,
    loadSystemMessages,
    loadMoreSystemMessages,
    addSystemMessage,

    // 操作
    handleMarkAllAsRead,

    // WebSocket 处理
    handleWsMessage,
  }
}
