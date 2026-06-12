/**
 * 聊天窗口逻辑 Composable
 * 管理消息收发、历史记录、滚动定位
 */
import { ref, nextTick } from 'vue'
import { getChatHistory, sendMessage } from '@/api/messageApi'

export function useChat() {
  // 当前聊天对象
  const currentChatUser = ref(null)

  // 聊天消息列表
  const messages = ref([])
  const chatLoading = ref(false)
  const chatPage = ref(1)
  const chatFinished = ref(false)

  // 发送状态
  const sending = ref(false)

  // 输入内容
  const inputText = ref('')

  // 滚动容器引用（由组件设置）
  let scrollContainerRef = null
  let currentUserId = null

  /**
   * 设置滚动容器引用
   * @param {HTMLElement} container
   */
  const setScrollContainer = (container) => {
    scrollContainerRef = container
  }

  /**
   * 设置当前用户 ID
   * @param {number} userId
   */
  const setCurrentUserId = (userId) => {
    currentUserId = userId
  }

  /**
   * 滚动到底部
   * @param {boolean} smooth - 是否平滑滚动
   */
  const scrollToBottom = async (smooth = true) => {
    await nextTick()
    if (scrollContainerRef) {
      scrollContainerRef.scrollTo({
        top: scrollContainerRef.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      })
    }
  }

  /**
   * 加载聊天历史（首次）
   * @param {number} otherUserId - 对方用户ID
   */
  const loadHistory = async (otherUserId) => {
    if (!otherUserId) return

    chatLoading.value = true
    chatPage.value = 1
    chatFinished.value = false

    const result = await getChatHistory(otherUserId, 1, 50)
    if (result.success) {
      // 接口返回按时间倒序，反转为正序（旧消息在上）
      const records = result.data.records || []
      messages.value = records.reverse()
      chatPage.value = 2
      if (records.length < 50) {
        chatFinished.value = true
      }
      
      // 从消息中提取对方信息（如果当前 chatUser 信息不完整）
      if (currentChatUser.value && !currentChatUser.value.nickname && records.length > 0) {
        const otherMsg = records.find(m => m.from_user_id === otherUserId)
        if (otherMsg) {
          currentChatUser.value = {
            ...currentChatUser.value,
            nickname: otherMsg.from_nickname,
            avatar_url: otherMsg.from_avatar_url,
            username: otherMsg.from_username,
          }
        }
      }
      
      // 滚动到底部
      await scrollToBottom(false)
    }

    chatLoading.value = false
  }

  /**
   * 加载更早的历史消息
   * @param {number} otherUserId - 对方用户ID
   */
  const loadEarlierMessages = async (otherUserId) => {
    if (chatLoading.value || chatFinished.value || !otherUserId) return

    chatLoading.value = true
    const result = await getChatHistory(otherUserId, chatPage.value, 50)

    if (result.success && result.data.records) {
      const records = result.data.records.reverse()
      // 记录当前滚动位置
      const prevHeight = scrollContainerRef ? scrollContainerRef.scrollHeight : 0

      messages.value = [...records, ...messages.value]
      chatPage.value++
      if (records.length < 50) {
        chatFinished.value = true
      }

      // 保持滚动位置（加载更早消息后不跳动）
      await nextTick()
      if (scrollContainerRef) {
        const newHeight = scrollContainerRef.scrollHeight
        scrollContainerRef.scrollTop = newHeight - prevHeight
      }
    }

    chatLoading.value = false
  }

  /**
   * 发送消息
   * @param {number} toUserId - 接收者用户ID
   * @param {string} content - 消息内容
   * @returns {Promise<boolean>} 是否发送成功
   */
  const send = async (toUserId, content) => {
    if (!content.trim() || sending.value) return false

    sending.value = true
    console.log('📤 发送消息:', { toUserId, content: content.trim() })
    
    const result = await sendMessage(toUserId, content.trim())
    console.log('📤 发送结果:', result)

    if (result.success) {
      inputText.value = ''
      sending.value = false
      
      // 重新加载聊天记录，获取服务器分配的真正 message_id
      // 这样撤销/删除功能才能正常工作
      await loadHistory(toUserId)
      return true
    }

    sending.value = false
    return false
  }

  /**
   * 处理通过 WebSocket 收到的新消息
   * @param {object} data - WebSocket 消息数据
   */
  const handleIncomingMessage = (data) => {
    if (!data || !currentChatUser.value) return

    // 如果消息来自当前聊天对象，追加到列表
    if (data.from_user_id === currentChatUser.value.user_id) {
      messages.value.push({
        message_id: data.message_id || Date.now(),
        from_user_id: data.from_user_id,
        to_user_id: data.to_user_id || currentUserId,
        message: data.message || data.content,
        create_time: data.create_time || new Date().toISOString(),
        is_read: false,
      })
      scrollToBottom()
    }
  }

  /**
   * 打开聊天窗口
   * @param {object} user - 聊天对象 { user_id, nickname, avatar_url }
   */
  const openChat = async (user) => {
    currentChatUser.value = user
    inputText.value = ''
    await loadHistory(user.user_id)
  }

  /**
   * 关闭聊天窗口
   */
  const closeChat = () => {
    currentChatUser.value = null
    messages.value = []
    chatPage.value = 1
    chatFinished.value = false
    inputText.value = ''
  }

  return {
    // 状态
    currentChatUser,
    messages,
    chatLoading,
    chatFinished,
    sending,
    inputText,

    // 方法
    setScrollContainer,
    setCurrentUserId,
    loadHistory,
    loadEarlierMessages,
    send,
    handleIncomingMessage,
    openChat,
    closeChat,
    scrollToBottom,
  }
}
