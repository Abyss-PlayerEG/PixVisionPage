/**
 * 管理员后台 API 调用
 * 纯 HTTP 请求层，无 Vue 依赖
 *
 * @module adminApi
 */

import { ADMIN_API } from '../config/api'

/**
 * 获取管理员仪表盘统计数据
 * @returns {Promise<Object>} { success, data: { totalUsers, totalWorks, totalComments, totalLikes, todayNewUsers, todayNewWorks } }
 */
export const fetchDashboard = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    console.log('📊 获取仪表盘数据...')
    const response = await fetch(ADMIN_API.DASHBOARD, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const result = await response.json()
    console.log('仪表盘响应:', JSON.stringify(result, null, 2))

    const statusCode = result.code || result.recode
    if (statusCode === 200 && result.data) {
      console.log('✅ 仪表盘数据获取成功')
      return { success: true, data: result.data }
    }
    console.error('❌ 仪表盘数据获取失败:', result.message)
    return { success: false, message: result.message || '获取仪表盘数据失败' }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 获取用户列表（分页）
 * @param {Object} params - 查询参数
 * @param {number} [params.current=1] - 当前页
 * @param {number} [params.size=20] - 每页数量
 * @param {string} [params.keyword] - 搜索关键词
 * @returns {Promise<Object>} { success, data: { records, total, current, size } }
 */
export const fetchUserList = async (params = {}) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    const { current = 1, size = 20, keyword = '' } = params
    const queryParams = new URLSearchParams()
    queryParams.append('current', current)
    queryParams.append('size', size)
    if (keyword) queryParams.append('keyword', keyword)

    const url = `${ADMIN_API.USER_LIST}?${queryParams.toString()}`
    console.log('📋 获取用户列表:', url)
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const result = await response.json()
    console.log('用户列表响应:', JSON.stringify(result, null, 2))

    const statusCode = result.code || result.recode
    if (statusCode === 200 && result.data) {
      console.log('✅ 用户列表获取成功')
      return { success: true, data: result.data }
    }
    console.error('❌ 用户列表获取失败:', result.message)
    return { success: false, message: result.message || '获取用户列表失败' }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 封禁/解封用户
 * @param {number} userId - 用户 ID
 * @param {boolean} ban - true=封禁, false=解封
 * @returns {Promise<Object>} { success, message }
 */
export const toggleUserBan = async (userId, ban) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    console.log(`${ban ? '🔒 封禁' : '🔓 解封'}用户:`, userId)
    const formData = new URLSearchParams()
    formData.append('userId', userId)
    formData.append('ban', ban)

    const response = await fetch(ADMIN_API.USER_BAN, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })
    const result = await response.json()

    const statusCode = result.code || result.recode
    if (statusCode === 200) {
      console.log(`✅ 用户${ban ? '封禁' : '解封'}成功`)
      return { success: true, message: result.message || '操作成功' }
    }
    console.error(`❌ 用户${ban ? '封禁' : '解封'}失败:`, result.message)
    return { success: false, message: result.message || '操作失败' }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 删除用户
 * @param {number} userId - 用户 ID
 * @returns {Promise<Object>} { success, message }
 */
export const deleteUser = async (userId) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    console.log('🗑️ 删除用户:', userId)
    const response = await fetch(ADMIN_API.USER_DELETE(userId), {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const result = await response.json()

    const statusCode = result.code || result.recode
    if (statusCode === 200) {
      console.log('✅ 用户删除成功')
      return { success: true, message: result.message || '删除成功' }
    }
    console.error('❌ 用户删除失败:', result.message)
    return { success: false, message: result.message || '删除失败' }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 获取作品列表（分页）
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>}
 */
export const fetchWorkList = async (params = {}) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    const { current = 1, size = 20, keyword = '' } = params
    const queryParams = new URLSearchParams()
    queryParams.append('current', current)
    queryParams.append('size', size)
    if (keyword) queryParams.append('keyword', keyword)

    const url = `${ADMIN_API.WORK_LIST}?${queryParams.toString()}`
    console.log('📋 获取作品列表:', url)
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const result = await response.json()

    const statusCode = result.code || result.recode
    if (statusCode === 200 && result.data) {
      console.log('✅ 作品列表获取成功')
      return { success: true, data: result.data }
    }
    console.error('❌ 作品列表获取失败:', result.message)
    return { success: false, message: result.message || '获取作品列表失败' }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 删除作品
 * @param {number} workId - 作品 ID
 * @returns {Promise<Object>}
 */
export const deleteWork = async (workId) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    console.log('🗑️ 删除作品:', workId)
    const response = await fetch(ADMIN_API.WORK_DELETE(workId), {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const result = await response.json()

    const statusCode = result.code || result.recode
    if (statusCode === 200) {
      console.log('✅ 作品删除成功')
      return { success: true, message: result.message || '删除成功' }
    }
    console.error('❌ 作品删除失败:', result.message)
    return { success: false, message: result.message || '删除失败' }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 获取评论列表（分页）
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>}
 */
export const fetchCommentList = async (params = {}) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    const { current = 1, size = 20, keyword = '' } = params
    const queryParams = new URLSearchParams()
    queryParams.append('current', current)
    queryParams.append('size', size)
    if (keyword) queryParams.append('keyword', keyword)

    const url = `${ADMIN_API.COMMENT_LIST}?${queryParams.toString()}`
    console.log('📋 获取评论列表:', url)
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const result = await response.json()

    const statusCode = result.code || result.recode
    if (statusCode === 200 && result.data) {
      console.log('✅ 评论列表获取成功')
      return { success: true, data: result.data }
    }
    console.error('❌ 评论列表获取失败:', result.message)
    return { success: false, message: result.message || '获取评论列表失败' }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 删除评论
 * @param {number} commentId - 评论 ID
 * @returns {Promise<Object>}
 */
export const deleteComment = async (commentId) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    console.log('🗑️ 删除评论:', commentId)
    const response = await fetch(ADMIN_API.COMMENT_DELETE(commentId), {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const result = await response.json()

    const statusCode = result.code || result.recode
    if (statusCode === 200) {
      console.log('✅ 评论删除成功')
      return { success: true, message: result.message || '删除成功' }
    }
    console.error('❌ 评论删除失败:', result.message)
    return { success: false, message: result.message || '删除失败' }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}
