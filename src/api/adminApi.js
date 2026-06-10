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

    const statusCode = result.recode
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
 * @param {number} [params.page=1] - 当前页
 * @param {number} [params.size=20] - 每页数量
 * @param {string} [params.nickname] - 昵称关键字模糊查询
 * @param {number} [params.user_role] - 用户角色筛选
 * @param {number} [params.status] - 用户状态筛选
 * @param {boolean} [params.is_delete] - 是否已删除
 * @param {string} [params.orderBy] - 排序：newest/oldest
 * @returns {Promise<Object>} { success, data: { records, total, current, size } }
 */
export const fetchUserList = async (params = {}) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    const { page = 1, size = 20, nickname = '', user_role, status, is_delete = false, orderBy = 'newest' } = params
    const formData = new URLSearchParams()
    formData.append('page', page)
    formData.append('size', size)
    if (nickname) formData.append('nickname', nickname)
    if (user_role) formData.append('user_role', user_role)
    if (status !== undefined && status !== '') formData.append('status', status)
    if (is_delete !== undefined) formData.append('is_delete', is_delete)
    formData.append('orderBy', orderBy)

    console.log('📋 获取用户列表:', ADMIN_API.USER_LIST, '参数:', { page, size, nickname: nickname || '(无)', user_role, status, is_delete, orderBy })
    const response = await fetch(ADMIN_API.USER_LIST, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })
    const result = await response.json()
    console.log('用户列表响应:', JSON.stringify(result, null, 2))

    const statusCode = result.recode
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
 * 更新用户状态（封禁/解封）
 * @param {number|number[]} userIds - 用户 ID 或用户 ID 数组
 * @param {number} newStatus - 新状态码：10=正常, 20=冻结, 30=封禁
 * @returns {Promise<Object>} { success, message }
 */
export const updateUserStatus = async (userIds, newStatus) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    const ids = Array.isArray(userIds) ? userIds : [userIds]
    const action = newStatus === 30 ? '封禁' : newStatus === 20 ? '冻结' : '解封'
    console.log(`🔒 ${action}用户:`, ids)
    const formData = new URLSearchParams()
    ids.forEach(id => formData.append('userIds', id))
    formData.append('newStatus', String(newStatus))

    const response = await fetch(ADMIN_API.USER_UPDATE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })
    const result = await response.json()
    console.log('用户状态更新响应:', JSON.stringify(result, null, 2))

    if (result.recode === 200) {
      console.log(`✅ 用户${action}成功`)
      return { success: true, message: result.message || '操作成功', data: result.data }
    }
    console.error(`❌ 用户${action}失败:`, result.message)
    return { success: false, message: result.message || '操作失败' }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 删除用户（批量，兼容单个）
 * @param {number|number[]} userIds - 用户 ID 或用户 ID 数组
 * @returns {Promise<Object>} { success, message }
 */
export const deleteUser = async (userIds) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    const ids = Array.isArray(userIds) ? userIds : [userIds]
    console.log('🗑️ 删除用户:', ids)
    const formData = new URLSearchParams()
    ids.forEach(id => formData.append('userIds', id))

    const response = await fetch(ADMIN_API.USER_DELETE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })
    const result = await response.json()
    console.log('用户删除响应:', JSON.stringify(result, null, 2))

    if (result.recode === 200) {
      console.log('✅ 用户删除成功')
      return { success: true, message: result.message || '删除成功', data: result.data }
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
 * @param {number} [params.current=1] - 当前页
 * @param {number} [params.size=20] - 每页数量
 * @param {string} [params.keyword] - 模糊搜索作品标题
 * @param {string} [params.orderBy] - 排序：newest/oldest/mostLikes/mostStars/mostViews
 * @param {number} [params.approvalStatus] - 审核状态筛选
 * @param {boolean} [params.isOriginal] - 原创/转载筛选
 * @returns {Promise<Object>} { success, data: { records, total, current, size } }
 */
export const fetchWorkList = async (params = {}) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    const { current = 1, size = 20, keyword = '', orderBy = 'newest', approvalStatus, isOriginal } = params
    const queryParts = []
    if (keyword) queryParts.push(`keyword=${encodeURIComponent(keyword)}`)
    queryParts.push(`orderBy=${orderBy}`)
    if (approvalStatus !== undefined && approvalStatus !== '') queryParts.push(`approvalStatus=${approvalStatus}`)
    if (isOriginal !== undefined && isOriginal !== '') queryParts.push(`isOriginal=${isOriginal}`)
    let url = ADMIN_API.WORK_LIST(current, size)
    if (queryParts.length > 0) url += '?' + queryParts.join('&')

    console.log('📋 获取作品列表:', url, '参数:', { current, size, keyword: keyword || '(无)', orderBy, approvalStatus, isOriginal })
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const result = await response.json()
    console.log('作品列表响应:', JSON.stringify(result, null, 2))

    const statusCode = result.recode
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
 * 删除作品（批量，兼容单个）
 * @param {number|number[]} workIds - 作品 ID 或作品 ID 数组
 * @returns {Promise<Object>} { success, message }
 */
export const deleteWork = async (workIds) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    const ids = Array.isArray(workIds) ? workIds : [workIds]
    console.log('🗑️ 删除作品:', ids)
    const formData = new URLSearchParams()
    ids.forEach(id => formData.append('workIds', id))

    const response = await fetch(ADMIN_API.WORK_DELETE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })
    const result = await response.json()
    console.log('作品删除响应:', JSON.stringify(result, null, 2))

    if (result.recode === 200) {
      console.log('✅ 作品删除成功')
      return { success: true, message: result.message || '删除成功', data: result.data }
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
 * @param {number} [params.current=1] - 当前页
 * @param {number} [params.size=20] - 每页数量
 * @param {string} [params.keyword] - 模糊搜索评论内容
 * @param {string} [params.orderBy] - 排序：newest/oldest
 * @param {number} [params.approvalStatus] - 审核状态筛选
 * @param {number} [params.workId] - 作品ID筛选
 * @param {number} [params.userId] - 用户ID筛选
 * @param {number} [params.commentFloor] - 评论层级 1/2
 * @returns {Promise<Object>} { success, data: { records, total, current, size } }
 */
export const fetchCommentList = async (params = {}) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    const { current = 1, size = 20, keyword = '', orderBy = 'newest', approvalStatus, workId, userId, commentFloor } = params
    const queryParts = []
    if (keyword) queryParts.push(`keyword=${encodeURIComponent(keyword)}`)
    queryParts.push(`orderBy=${orderBy}`)
    if (approvalStatus !== undefined && approvalStatus !== '') queryParts.push(`approvalStatus=${approvalStatus}`)
    if (workId !== undefined && workId !== '') queryParts.push(`workId=${workId}`)
    if (userId !== undefined && userId !== '') queryParts.push(`userId=${userId}`)
    if (commentFloor !== undefined && commentFloor !== '') queryParts.push(`commentFloor=${commentFloor}`)
    let url = ADMIN_API.COMMENT_LIST(current, size)
    if (queryParts.length > 0) url += '?' + queryParts.join('&')

    console.log('📋 获取评论列表:', url, '参数:', { current, size, keyword: keyword || '(无)', orderBy, approvalStatus, workId, userId, commentFloor })
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const result = await response.json()
    console.log('评论列表响应:', JSON.stringify(result, null, 2))

    const statusCode = result.recode
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
 * 删除评论（批量，兼容单个）
 * @param {number|number[]} commentIds - 评论 ID 或评论 ID 数组
 * @returns {Promise<Object>} { success, message }
 */
export const deleteComment = async (commentIds) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    const ids = Array.isArray(commentIds) ? commentIds : [commentIds]
    console.log('🗑️ 删除评论:', ids)
    const formData = new URLSearchParams()
    ids.forEach(id => formData.append('commentIds', id))

    const response = await fetch(ADMIN_API.COMMENT_DELETE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })
    const result = await response.json()
    console.log('评论删除响应:', JSON.stringify(result, null, 2))

    if (result.recode === 200) {
      console.log('✅ 评论删除成功')
      return { success: true, message: result.message || '删除成功', data: result.data }
    }
    console.error('❌ 评论删除失败:', result.message)
    return { success: false, message: result.message || '删除失败' }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

// ─── 用户管理扩展 ───

/**
 * 创建新用户
 * @param {Object} params - { username, password, confirmPassword, nickname, email, role?, status? }
 */
export const createUser = async (params = {}) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    const { username, password, confirmPassword, nickname, email, role = 11, status = 10 } = params
    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)
    formData.append('confirmPassword', confirmPassword)
    formData.append('nickname', nickname)
    formData.append('email', email)
    formData.append('role', role)
    formData.append('status', status)

    console.log('👤 创建用户:', username)
    const response = await fetch(ADMIN_API.USER_CREATE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })
    const result = await response.json()
    const statusCode = result.recode
    if (statusCode === 200) {
      console.log('✅ 用户创建成功')
      return { success: true, message: result.message || '创建成功', data: result.data }
    }
    console.error('❌ 用户创建失败:', result.message)
    return { success: false, message: result.message || '创建失败' }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 重置用户密码
 * @param {number} userId - 用户 ID
 */
export const resetUserPassword = async (userId) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    console.log('🔑 重置密码:', userId)
    const formData = new URLSearchParams()
    formData.append('userIds', userId)
    const response = await fetch(ADMIN_API.USER_RESET_PWD, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })
    const result = await response.json()
    const statusCode = result.recode
    if (statusCode === 200) {
      console.log('✅ 密码重置成功')
      return { success: true, message: result.message || '密码重置成功，新密码已发送至邮箱' }
    }
    return { success: false, message: result.message || '密码重置失败' }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

// ─── 作品管理扩展 ───

/**
 * 更新作品审核状态
 * @param {number} workId
 * @param {number} approvalStatus - 10=通过, 20=待审, 30=不通过
 */
export const updateWorkApproval = async (workId, approvalStatus) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    const labels = { 10: '通过', 20: '待审', 30: '不通过' }
    console.log(`📝 作品审核 ${labels[approvalStatus]}:`, workId)
    const formData = new URLSearchParams()
    formData.append('workIds', workId)
    formData.append('approvalStatus', approvalStatus)
    const response = await fetch(ADMIN_API.WORK_APPROVAL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })
    const result = await response.json()
    const statusCode = result.recode
    if (statusCode === 200) {
      console.log('✅ 作品审核更新成功')
      return { success: true, message: result.message || '操作成功' }
    }
    return { success: false, message: result.message || '操作失败' }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 批量更新作品标题
 * @param {number} workId
 * @param {string} workTitle - 新标题（最多16字符）
 */
export const updateWorkTitle = async (workId, workTitle) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    console.log('✏️ 更新作品标题:', workId, '→', workTitle)
    const formData = new URLSearchParams()
    formData.append('workIds', workId)
    formData.append('workTitle', workTitle)
    const response = await fetch(ADMIN_API.WORK_TITLE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })
    const result = await response.json()
    const statusCode = result.recode
    if (statusCode === 200) {
      console.log('✅ 标题更新成功')
      return { success: true, message: result.message || '标题更新成功' }
    }
    return { success: false, message: result.message || '标题更新失败' }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

// ─── 评论管理扩展 ───

/**
 * 更新评论审核状态
 * @param {number} commentId
 * @param {number} approvalStatus - 10=通过, 30=不通过
 */
export const updateCommentApproval = async (commentId, approvalStatus) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    const labels = { 10: '通过', 30: '不通过' }
    console.log(`💬 评论审核 ${labels[approvalStatus]}:`, commentId)
    const formData = new URLSearchParams()
    formData.append('commentIds', commentId)
    formData.append('approvalStatus', approvalStatus)
    const response = await fetch(ADMIN_API.COMMENT_APPROVAL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })
    const result = await response.json()
    const statusCode = result.recode
    if (statusCode === 200) {
      console.log('✅ 评论审核更新成功')
      return { success: true, message: result.message || '操作成功' }
    }
    return { success: false, message: result.message || '操作失败' }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

// ─── 审核记录 ───

/**
 * 获取 AI 审核记录（分页）
 * @param {Object} params
 * @param {number} [params.current=1]
 * @param {number} [params.size=20]
 * @param {number} [params.contentType] - 内容类型 100/200/300/400
 * @param {number} [params.approvalStatus] - 审核状态 10/20/30
 * @param {string} [params.keyword] - 模糊搜索审核原因
 * @param {string} [params.orderBy] - 排序 newest/oldest
 */
export const fetchAuditRecords = async (params = {}) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }
    const { current = 1, size = 20, contentType, approvalStatus, keyword = '', orderBy = 'newest' } = params
    const queryParts = []
    if (keyword) queryParts.push(`keyword=${encodeURIComponent(keyword)}`)
    queryParts.push(`orderBy=${orderBy}`)
    if (contentType !== undefined && contentType !== '') queryParts.push(`contentType=${contentType}`)
    if (approvalStatus !== undefined && approvalStatus !== '') queryParts.push(`approvalStatus=${approvalStatus}`)
    let url = ADMIN_API.AUDIT_RECORDS(current, size)
    if (queryParts.length > 0) url += '?' + queryParts.join('&')
    console.log('📋 获取审核记录:', url, '参数:', { current, size, contentType, approvalStatus, keyword: keyword || '(无)', orderBy })
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const result = await response.json()
    const statusCode = result.recode
    if (statusCode === 200 && result.data) {
      return { success: true, data: result.data }
    }
    return { success: false, message: result.message || '获取审核记录失败' }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

// ─── 用户数据变更审核 ───

/**
 * 获取待审核的用户数据变更（分页）
 * @param {Object} params
 * @param {number} [params.current=1]
 * @param {number} [params.size=20]
 * @param {number} [params.type] - 变更类型 100/200/300
 */
export const fetchPendingChanges = async (params = {}) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }
    const { current = 1, size = 20, type } = params
    const queryParts = []
    if (type !== undefined && type !== '') queryParts.push(`type=${type}`)
    let url = ADMIN_API.PENDING_CHANGES(current, size)
    if (queryParts.length > 0) url += '?' + queryParts.join('&')
    console.log('📋 获取待审核变更:', url, '参数:', { current, size, type })
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const result = await response.json()
    const statusCode = result.recode
    if (statusCode === 200 && result.data) {
      return { success: true, data: result.data }
    }
    return { success: false, message: result.message || '获取待审核变更失败' }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

export const reviewDataChanges = async (lockIds, approved) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }
    const action = approved ? '通过' : '拒绝'
    console.log(`🔍 ${action}变更:`, lockIds)
    const formData = new URLSearchParams()
    lockIds.forEach(id => formData.append('lockIds', id))
    formData.append('approved', approved)
    const response = await fetch(ADMIN_API.REVIEW_CHANGES, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })
    const result = await response.json()
    const statusCode = result.recode
    if (statusCode === 200) {
      return { success: true, message: result.message || `${action}成功` }
    }
    return { success: false, message: result.message || `${action}失败` }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

// ─── 操作日志 ───

/**
 * 获取操作日志（分页）
 * @param {Object} params
 * @param {number} [params.current=1]
 * @param {number} [params.size=20]
 * @param {string} [params.keyword] - 模糊搜索操作事件
 * @param {string} [params.orderBy] - 排序 newest/oldest
 */
export const fetchOperationLogs = async (params = {}) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }
    const { current = 1, size = 20, keyword = '', orderBy = 'newest' } = params
    const queryParts = []
    if (keyword) queryParts.push(`keyword=${encodeURIComponent(keyword)}`)
    queryParts.push(`orderBy=${orderBy}`)
    let url = ADMIN_API.LOGS(current, size)
    if (queryParts.length > 0) url += '?' + queryParts.join('&')
    console.log('📋 获取操作日志:', url, '参数:', { current, size, keyword: keyword || '(无)', orderBy })
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const result = await response.json()
    const statusCode = result.recode
    if (statusCode === 200 && result.data) {
      return { success: true, data: result.data }
    }
    return { success: false, message: result.message || '获取操作日志失败' }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

// ─── 合集管理 ───

/**
 * 获取合集列表（分页）
 * @param {Object} params - 查询参数
 * @param {number} [params.current=1] - 当前页
 * @param {number} [params.size=20] - 每页数量
 * @param {string} [params.keyword] - 模糊搜索合集标题
 * @param {string} [params.orderBy] - 排序：newest/oldest
 * @param {number} [params.status] - 审核状态筛选
 * @param {number} [params.userId] - 用户ID筛选
 * @returns {Promise<Object>} { success, data: { records, total, current, size } }
 */
export const fetchSeriesList = async (params = {}) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    const { current = 1, size = 20, keyword = '', orderBy = 'newest', status, userId } = params
    const queryParts = []
    if (keyword) queryParts.push(`keyword=${encodeURIComponent(keyword)}`)
    queryParts.push(`orderBy=${orderBy}`)
    if (status !== undefined && status !== '') queryParts.push(`status=${status}`)
    if (userId !== undefined && userId !== '') queryParts.push(`userId=${userId}`)
    let url = ADMIN_API.SERIES_LIST(current, size)
    if (queryParts.length > 0) url += '?' + queryParts.join('&')

    console.log('📋 获取合集列表:', url, '参数:', { current, size, keyword: keyword || '(无)', orderBy, status, userId })
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const result = await response.json()
    console.log('合集列表响应:', JSON.stringify(result, null, 2))

    if (result.recode === 200 && result.data) {
      console.log('✅ 合集列表获取成功')
      return { success: true, data: result.data }
    }
    console.error('❌ 合集列表获取失败:', result.message)
    return { success: false, message: result.message || '获取合集列表失败' }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 删除合集（批量，兼容单个）
 * @param {number|number[]} seriesIds - 合集 ID 或合集 ID 数组
 * @param {boolean} [deleteWorks=false] - 是否删除合集内的作品
 * @returns {Promise<Object>} { success, message }
 */
export const deleteSeries = async (seriesIds, deleteWorks = false) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    const ids = Array.isArray(seriesIds) ? seriesIds : [seriesIds]
    console.log('🗑️ 删除合集:', ids, '删除作品:', deleteWorks)
    const formData = new URLSearchParams()
    ids.forEach(id => formData.append('seriesIds', id))
    formData.append('deleteWorks', String(deleteWorks))

    const response = await fetch(ADMIN_API.SERIES_DELETE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })
    const result = await response.json()
    console.log('合集删除响应:', JSON.stringify(result, null, 2))

    if (result.recode === 200) {
      console.log('✅ 合集删除成功')
      return { success: true, message: result.message || '删除成功', data: result.data }
    }
    console.error('❌ 合集删除失败:', result.message)
    return { success: false, message: result.message || '删除失败' }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 更新合集审核状态
 * @param {number|number[]} seriesIds - 合集 ID 或合集 ID 数组
 * @param {number} approvalStatus - 审核状态：10=通过, 20=待审, 30=不通过
 * @returns {Promise<Object>} { success, message }
 */
export const updateSeriesApproval = async (seriesIds, approvalStatus) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    const ids = Array.isArray(seriesIds) ? seriesIds : [seriesIds]
    const labels = { 10: '通过', 20: '待审', 30: '不通过' }
    console.log(`📝 合集审核 ${labels[approvalStatus]}:`, ids)
    const formData = new URLSearchParams()
    ids.forEach(id => formData.append('seriesIds', id))
    formData.append('approvalStatus', approvalStatus)

    const response = await fetch(ADMIN_API.SERIES_APPROVAL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })
    const result = await response.json()
    console.log('合集审核响应:', JSON.stringify(result, null, 2))

    if (result.recode === 200) {
      console.log('✅ 合集审核更新成功')
      return { success: true, message: result.message || '操作成功', data: result.data }
    }
    console.error('❌ 合集审核更新失败:', result.message)
    return { success: false, message: result.message || '操作失败' }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

// ─── 权限管理 ───

/**
 * 批量更新用户角色
 * @param {number|number[]} userIds - 用户 ID 或用户 ID 数组
 * @param {number} newRole - 新角色代码：11=普通用户, 22=创作者, 55=审核员, 66=工单管理员, 77=系统管理员
 * @returns {Promise<Object>} { success, message }
 */
export const updateUserRole = async (userIds, newRole) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    const ids = Array.isArray(userIds) ? userIds : [userIds]
    const roleNames = { 11: '普通用户', 22: '创作者', 55: '审核员', 66: '工单管理员', 77: '系统管理员' }
    console.log(`🔑 更改用户角色为 ${roleNames[newRole]}:`, ids)
    const formData = new URLSearchParams()
    ids.forEach(id => formData.append('userIds', id))
    formData.append('newRole', String(newRole))

    const response = await fetch(ADMIN_API.USER_UPDATE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })
    const result = await response.json()
    console.log('用户角色更新响应:', JSON.stringify(result, null, 2))

    if (result.recode === 200) {
      console.log('✅ 用户角色更新成功')
      return { success: true, message: result.message || '角色更新成功，24小时内生效', data: result.data }
    }
    console.error('❌ 用户角色更新失败:', result.message)
    return { success: false, message: result.message || '操作失败' }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 刷新所有用户权限缓存
 * @returns {Promise<Object>} { success, message }
 */
export const refreshPermissionCache = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    console.log('🔄 刷新权限缓存...')
    const response = await fetch(ADMIN_API.USER_REFRESH_CACHE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    const result = await response.json()
    console.log('权限缓存刷新响应:', JSON.stringify(result, null, 2))

    if (result.recode === 200) {
      console.log('✅ 权限缓存刷新成功')
      return { success: true, message: result.message || '权限缓存刷新成功', data: result.data }
    }
    console.error('❌ 权限缓存刷新失败:', result.message)
    return { success: false, message: result.message || '操作失败' }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}
