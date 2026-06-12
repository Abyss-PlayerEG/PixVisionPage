/**
 * 消息系统 API 模块
 * 封装所有消息相关 HTTP 请求
 */
import { MESSAGE_API } from '../config/api'

// 获取请求头（含 Token）
const getHeaders = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    return null
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

/**
 * 获取未读消息数量
 * @param {number} [otherUserId] - 对方用户ID（可选）
 *   - 不传时：返回所有未读消息的分类统计（总数、私信数、系统通知数）
 *   - 传入时：返回与该用户的会话未读数
 * @returns {Promise<{success: boolean, data?: {total: number, private: number, system: number}, message?: string}>}
 */
export const getUnreadCount = async (otherUserId) => {
  try {
    const headers = getHeaders()
    if (!headers) {
      console.warn('⚠️ 无 Token，跳过获取未读消息数')
      return { success: false, message: '未登录' }
    }

    let url = MESSAGE_API.UNREAD_COUNT
    if (otherUserId) {
      url += `?otherUserId=${otherUserId}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    })
    const result = await response.json()
    console.log('未读消息数量:', JSON.stringify(result, null, 2))

    if (result.recode === 200 && result.data) {
      console.log('✅ 获取未读消息数量成功')
      return { success: true, data: result.data }
    } else {
      console.error('❌ 获取未读消息数量失败:', result.message)
      return { success: false, message: result.message || '获取失败' }
    }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 获取会话列表
 * @param {number} current - 当前页码（从1开始）
 * @param {number} size - 每页大小
 * @param {boolean} [isRead] - 已读状态筛选（可选：false-只返回未读会话）
 * @returns {Promise<{success: boolean, data?: object, message?: string}>}
 */
export const getConversations = async (current = 1, size = 20, isRead) => {
  try {
    const headers = getHeaders()
    if (!headers) {
      console.warn('⚠️ 无 Token，跳过获取会话列表')
      return { success: false, message: '未登录' }
    }

    let url = `${MESSAGE_API.CONVERSATIONS}/${current}/${size}`
    if (isRead === false) {
      url += '?isRead=false'
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    })
    const result = await response.json()
    console.log('会话列表:', JSON.stringify(result, null, 2))

    if (result.recode === 200 && result.data) {
      console.log('✅ 获取会话列表成功')
      return { success: true, data: result.data }
    } else {
      console.error('❌ 获取会话列表失败:', result.message)
      return { success: false, message: result.message || '获取失败' }
    }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 获取聊天记录
 * @param {number} otherUserId - 对方用户ID
 * @param {number} current - 当前页码（从1开始）
 * @param {number} size - 每页大小
 * @returns {Promise<{success: boolean, data?: object, message?: string}>}
 */
export const getChatHistory = async (otherUserId, current = 1, size = 50) => {
  try {
    const headers = getHeaders()
    if (!headers) {
      console.warn('⚠️ 无 Token，跳过获取聊天记录')
      return { success: false, message: '未登录' }
    }

    const response = await fetch(`${MESSAGE_API.CHAT}/${otherUserId}/${current}/${size}`, {
      method: 'GET',
      headers: headers,
    })
    const result = await response.json()
    console.log('聊天记录:', JSON.stringify(result, null, 2))

    if (result.recode === 200 && result.data) {
      console.log('✅ 获取聊天记录成功')
      return { success: true, data: result.data }
    } else {
      console.error('❌ 获取聊天记录失败:', result.message)
      return { success: false, message: result.message || '获取失败' }
    }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 发送私信
 * @param {number} toUserId - 接收者用户ID
 * @param {string} content - 消息内容
 * @returns {Promise<{success: boolean, data?: boolean, message?: string}>}
 */
export const sendMessage = async (toUserId, content) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      console.warn('⚠️ 无 Token，跳过发送私信')
      return { success: false, message: '未登录' }
    }

    const params = new URLSearchParams({
      toUserId: toUserId,
      content: content,
    })

    const response = await fetch(`${MESSAGE_API.SEND}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    const result = await response.json()
    console.log('发送私信:', JSON.stringify(result, null, 2))

    if (result.recode === 200) {
      console.log('✅ 私信发送成功')
      return { success: true, data: result.data }
    } else {
      console.error('❌ 私信发送失败:', result.message)
      return { success: false, message: result.message || '发送失败' }
    }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 标记会话已读
 * @param {number} otherUserId - 对方用户ID
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const markConversationAsRead = async (otherUserId) => {
  try {
    const headers = getHeaders()
    if (!headers) {
      console.warn('⚠️ 无 Token，跳过标记会话已读')
      return { success: false, message: '未登录' }
    }

    const response = await fetch(`${MESSAGE_API.READ_CONVERSATION}/${otherUserId}`, {
      method: 'POST',
      headers: headers,
    })
    const result = await response.json()

    if (result.recode === 200) {
      console.log('✅ 标记会话已读成功')
      return { success: true }
    } else {
      console.error('❌ 标记会话已读失败:', result.message)
      return { success: false, message: result.message || '操作失败' }
    }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 全部标记已读
 * @param {string} [messageType] - 消息类型（可选：system/private）
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const markAllAsRead = async (messageType) => {
  try {
    const headers = getHeaders()
    if (!headers) {
      console.warn('⚠️ 无 Token，跳过全部标记已读')
      return { success: false, message: '未登录' }
    }

    let url = MESSAGE_API.READ_ALL
    if (messageType) {
      url += `?messageType=${messageType}`
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
    })
    const result = await response.json()

    if (result.recode === 200) {
      console.log('✅ 全部标记已读成功')
      return { success: true }
    } else {
      console.error('❌ 全部标记已读失败:', result.message)
      return { success: false, message: result.message || '操作失败' }
    }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 撤销消息
 * @param {number} messageId - 消息ID
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const recallMessage = async (messageId) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      console.warn('⚠️ 无 Token，跳过撤销消息')
      return { success: false, message: '未登录' }
    }

    // 联调文档规范：POST /api/message/recall/{messageId}（路径参数）
    const response = await fetch(`${MESSAGE_API.RECALL}/${messageId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    const result = await response.json()

    if (result.recode === 200) {
      console.log('✅ 撤销消息成功')
      return { success: true }
    } else {
      console.error('❌ 撤销消息失败:', result.message)
      return { success: false, message: result.message || '撤销失败' }
    }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 删除消息（使用批量删除接口）
 * @param {number} messageId - 消息ID
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const deleteMessage = async (messageId) => {
  // 使用批量删除接口，传入单个元素数组
  return batchDeleteMessages([messageId])
}

/**
 * 批量删除消息
 * @param {number[]} messageIds - 消息ID列表
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const batchDeleteMessages = async (messageIds) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      console.warn('⚠️ 无 Token，跳过批量删除消息')
      return { success: false, message: '未登录' }
    }

    // 联调文档规范：POST /api/message/batch-delete，Content-Type: application/json，Body: [1, 2, 3]
    const response = await fetch(MESSAGE_API.BATCH_DELETE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageIds),
    })
    const result = await response.json()

    if (result.recode === 200) {
      console.log('✅ 批量删除消息成功')
      return { success: true }
    } else {
      console.error('❌ 批量删除消息失败:', result.message)
      return { success: false, message: result.message || '删除失败' }
    }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 获取系统通知
 * @param {number} current - 当前页码（从1开始）
 * @param {number} size - 每页大小
 * @param {string} [project] - 消息主题（可选）
 * @param {boolean} [isRead] - 已读状态（可选）
 * @returns {Promise<{success: boolean, data?: object, message?: string}>}
 */
export const getSystemMessages = async (current = 1, size = 20, project, isRead) => {
  try {
    const headers = getHeaders()
    if (!headers) {
      console.warn('⚠️ 无 Token，跳过获取系统通知')
      return { success: false, message: '未登录' }
    }

    let url = `${MESSAGE_API.SYSTEM}/${current}/${size}`
    const params = new URLSearchParams()
    if (project) params.append('project', project)
    if (isRead !== undefined) params.append('isRead', isRead)
    const queryString = params.toString()
    if (queryString) url += `?${queryString}`

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    })
    const result = await response.json()
    console.log('系统通知:', JSON.stringify(result, null, 2))

    if (result.recode === 200 && result.data) {
      console.log('✅ 获取系统通知成功')
      return { success: true, data: result.data }
    } else {
      console.error('❌ 获取系统通知失败:', result.message)
      return { success: false, message: result.message || '获取失败' }
    }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}
