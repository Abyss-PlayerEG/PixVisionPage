/**
 * 创作者面板 API 调用
 * 纯 HTTP 请求层，无 Vue 依赖
 *
 * @module creatorApi
 */

import { WORK_API, WORK_UPLOAD_API, SERIES_API, getWorkImageUrl } from '../config/api'

// ==================== 作品管理 ====================

/**
 * 分页查询当前用户自己的作品（包含所有审核状态）
 * @param {Object} params
 * @param {number} params.current - 当前页码（从1开始）
 * @param {number} params.size - 每页大小（1-500）
 * @param {number} [params.approvalStatus] - 审核状态筛选（10-正常/20-待审核/30-未过审）
 * @param {string} [params.keyword] - 关键字搜索（模糊查询作品标题）
 * @returns {Promise<Object>} { success, data: { records, total, pages, current, size }, message }
 */
export const fetchMyWorks = async ({ current = 1, size = 20, approvalStatus, keyword } = {}) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    let url = `${WORK_API.MY_WORKS}/${current}/${size}`
    const params = new URLSearchParams()
    if (approvalStatus !== undefined && approvalStatus !== null && approvalStatus !== '') {
      params.append('approvalStatus', approvalStatus)
    }
    if (keyword && keyword.trim()) {
      params.append('keyword', keyword.trim())
    }
    const qs = params.toString()
    if (qs) url += `?${qs}`

    console.log('[CreatorAPI] 查询我的作品:', url, { keyword: keyword || '(无)' })
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const result = await response.json()
    console.log('[CreatorAPI] 我的作品响应:', JSON.stringify(result, null, 2))

    const statusCode = result.code || result.recode
    if (statusCode === 200 && result.data) {
      // 为每条记录拼接缩略图 URL
      // 注意：创作者(22)无权访问 admin-view 接口，只有审核通过的作品才能显示图片
      if (result.data.records) {
        result.data.records = result.data.records.map(work => {
          const isApproved = work.approval_status === 10
          return {
            ...work,
            // 只有审核通过的作品才拼接图片 URL，否则返回 null（显示占位符）
            thumbFullUrl: isApproved && work.thumb_url ? getWorkImageUrl(work.thumb_url) : null,
            imgFullUrl: isApproved && work.img_url ? getWorkImageUrl(work.img_url) : null,
          }
        })
      }
      console.log('✅ 我的作品查询成功')
      return { success: true, data: result.data }
    }
    console.error('❌ 我的作品查询失败:', result.message)
    return { success: false, message: result.message || '查询失败' }
  } catch (error) {
    console.error('[CreatorAPI] 查询我的作品失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 上传作品（Multipart 表单）
 * @param {Object} params
 * @param {File} params.file - 图片文件（JPG/JPEG/PNG，最大32MB）
 * @param {string} params.workTitle - 作品标题（最多16个中文字符）
 * @param {number} [params.seriesId] - 系列ID（0表示不属于任何系列）
 * @param {boolean} params.isOriginal - 是否原创
 * @param {string} [params.outUrl] - 转载链接（转载时必填）
 * @returns {Promise<Object>} { success, data, message }
 */
export const uploadWork = async ({ file, workTitle, seriesId, isOriginal, outUrl }) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    const formData = new FormData()
    formData.append('file', file)

    const params = new URLSearchParams()
    params.append('workTitle', workTitle)
    if (seriesId !== undefined && seriesId !== null) params.append('seriesId', seriesId)
    params.append('isOriginal', isOriginal)
    if (outUrl) params.append('outUrl', outUrl)

    console.log('[CreatorAPI] 上传作品:', { workTitle, seriesId, isOriginal, outUrl })
    const response = await fetch(`${WORK_UPLOAD_API}?${params.toString()}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    })
    const result = await response.json()
    console.log('[CreatorAPI] 上传响应:', JSON.stringify(result, null, 2))

    const statusCode = result.code || result.recode
    if (statusCode === 200 && result.data === true) {
      console.log('✅ 作品上传成功')
      return { success: true, data: result.data, message: result.message }
    }
    console.error('❌ 作品上传失败:', result.message)
    return { success: false, message: result.message || '上传失败' }
  } catch (error) {
    console.error('[CreatorAPI] 作品上传失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 修改作品信息
 * @param {Object} params
 * @param {number} params.workId - 作品ID（必填）
 * @param {string} [params.workTitle] - 新标题
 * @param {File} [params.file] - 新图片文件
 * @param {number} [params.seriesId] - 系列ID（0=移除系列）
 * @param {boolean} [params.isOriginal] - 是否原创
 * @param {string} [params.outUrl] - 转载链接
 * @returns {Promise<Object>} { success, data, message }
 */
export const updateWork = async ({ workId, workTitle, file, seriesId, isOriginal, outUrl }) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    const params = new URLSearchParams()
    params.append('workId', workId)
    if (workTitle !== undefined && workTitle !== null) params.append('workTitle', workTitle)
    if (seriesId !== undefined && seriesId !== null) params.append('seriesId', seriesId)
    if (isOriginal !== undefined && isOriginal !== null) params.append('isOriginal', isOriginal)
    if (outUrl !== undefined) params.append('outUrl', outUrl)

    const fetchOptions = {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    }

    // 如果有新图片文件，使用 FormData
    if (file) {
      const formData = new FormData()
      formData.append('file', file)
      fetchOptions.body = formData
    }

    console.log('[CreatorAPI] 修改作品:', { workId, workTitle, seriesId, isOriginal, outUrl, hasFile: !!file })
    const response = await fetch(`${WORK_API.UPDATE}?${params.toString()}`, fetchOptions)
    const result = await response.json()
    console.log('[CreatorAPI] 修改响应:', JSON.stringify(result, null, 2))

    const statusCode = result.code || result.recode
    if (statusCode === 200 && result.data === true) {
      console.log('✅ 作品修改成功')
      return { success: true, data: result.data, message: result.message }
    }
    console.error('❌ 作品修改失败:', result.message)
    return { success: false, message: result.message || '修改失败' }
  } catch (error) {
    console.error('[CreatorAPI] 作品修改失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 删除作品（支持批量）
 * @param {number[]} workIds - 作品ID列表
 * @returns {Promise<Object>} { success, data, message }
 */
export const deleteWorks = async (workIds) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    const params = new URLSearchParams()
    workIds.forEach(id => params.append('workIds', id))

    console.log('[CreatorAPI] 删除作品:', workIds)
    const response = await fetch(`${WORK_API.DELETE}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    const result = await response.json()
    console.log('[CreatorAPI] 删除响应:', JSON.stringify(result, null, 2))

    const statusCode = result.code || result.recode
    if (statusCode === 200 && result.data === true) {
      console.log('✅ 作品删除成功')
      return { success: true, data: result.data, message: result.message }
    }
    console.error('❌ 作品删除失败:', result.message)
    return { success: false, message: result.message || '删除失败' }
  } catch (error) {
    console.error('[CreatorAPI] 作品删除失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

// ==================== 合集/系列管理 ====================

/**
 * 新增作品系列
 * @param {Object} params
 * @param {string} params.seriesTitle - 系列标题（最多16个中文字符，必填）
 * @param {string} [params.aboutText] - 系列描述（最多24个中文字符）
 * @returns {Promise<Object>} { success, data, message }
 */
export const addSeries = async ({ seriesTitle, aboutText }) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    const params = new URLSearchParams()
    params.append('seriesTitle', seriesTitle)
    if (aboutText) params.append('aboutText', aboutText)

    console.log('[CreatorAPI] 新增系列:', { seriesTitle, aboutText })
    const response = await fetch(`${SERIES_API.ADD}?${params.toString()}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const result = await response.json()
    console.log('[CreatorAPI] 新增系列响应:', JSON.stringify(result, null, 2))

    const statusCode = result.code || result.recode
    if (statusCode === 200 && result.data === true) {
      console.log('✅ 系列新增成功')
      return { success: true, data: result.data, message: result.message }
    }
    console.error('❌ 系列新增失败:', result.message)
    return { success: false, message: result.message || '新增失败' }
  } catch (error) {
    console.error('[CreatorAPI] 系列新增失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 更新作品系列信息
 * @param {Object} params
 * @param {number} params.seriesId - 系列ID（必填）
 * @param {string} [params.seriesTitle] - 新标题
 * @param {string} [params.aboutText] - 新描述
 * @returns {Promise<Object>} { success, data, message }
 */
export const updateSeries = async ({ seriesId, seriesTitle, aboutText }) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    const params = new URLSearchParams()
    params.append('seriesId', seriesId)
    if (seriesTitle !== undefined && seriesTitle !== null) params.append('seriesTitle', seriesTitle)
    if (aboutText !== undefined && aboutText !== null) params.append('aboutText', aboutText)

    console.log('[CreatorAPI] 更新系列:', { seriesId, seriesTitle, aboutText })
    const response = await fetch(`${SERIES_API.UPDATE}?${params.toString()}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const result = await response.json()
    console.log('[CreatorAPI] 更新系列响应:', JSON.stringify(result, null, 2))

    const statusCode = result.code || result.recode
    if (statusCode === 200 && result.data === true) {
      console.log('✅ 系列更新成功')
      return { success: true, data: result.data, message: result.message }
    }
    console.error('❌ 系列更新失败:', result.message)
    return { success: false, message: result.message || '更新失败' }
  } catch (error) {
    console.error('[CreatorAPI] 系列更新失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 删除作品系列
 * @param {number} seriesId - 系列ID
 * @param {boolean} deleteWorks - 是否同时删除系列内作品
 * @returns {Promise<Object>} { success, data, message }
 */
export const deleteSeries = async (seriesId, deleteWorks = false) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    const params = new URLSearchParams()
    params.append('seriesId', seriesId)
    params.append('deleteWorks', deleteWorks)

    console.log('[CreatorAPI] 删除系列:', { seriesId, deleteWorks })
    const response = await fetch(`${SERIES_API.DELETE}?${params.toString()}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const result = await response.json()
    console.log('[CreatorAPI] 删除系列响应:', JSON.stringify(result, null, 2))

    const statusCode = result.code || result.recode
    if (statusCode === 200 && result.data === true) {
      console.log('✅ 系列删除成功')
      return { success: true, data: result.data, message: result.message }
    }
    console.error('❌ 系列删除失败:', result.message)
    return { success: false, message: result.message || '删除失败' }
  } catch (error) {
    console.error('[CreatorAPI] 系列删除失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 批量添加作品到系列
 * @param {number[]} workIds - 作品ID列表
 * @param {number} seriesId - 系列ID
 * @returns {Promise<Object>} { success, data, message }
 */
export const batchAddWorksToSeries = async (workIds, seriesId) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    const params = new URLSearchParams()
    params.append('workIds', workIds.join(','))
    params.append('seriesId', seriesId)

    console.log('[CreatorAPI] 批量添加作品到系列:', { workIds, seriesId })
    const response = await fetch(`${SERIES_API.BATCH_ADD_WORKS}?${params.toString()}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const result = await response.json()
    console.log('[CreatorAPI] 批量添加响应:', JSON.stringify(result, null, 2))

    const statusCode = result.code || result.recode
    if (statusCode === 200 && result.data === true) {
      console.log('✅ 批量添加成功')
      return { success: true, data: result.data, message: result.message }
    }
    console.error('❌ 批量添加失败:', result.message)
    return { success: false, message: result.message || '操作失败' }
  } catch (error) {
    console.error('[CreatorAPI] 批量添加作品到系列失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 批量从系列移除作品
 * @param {number[]} workIds - 作品ID列表
 * @param {number} seriesId - 系列ID
 * @returns {Promise<Object>} { success, data, message }
 */
export const batchRemoveWorksFromSeries = async (workIds, seriesId) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return { success: false, message: '未登录' }

    const params = new URLSearchParams()
    params.append('workIds', workIds.join(','))
    params.append('seriesId', seriesId)

    console.log('[CreatorAPI] 批量从系列移除作品:', { workIds, seriesId })
    const response = await fetch(`${SERIES_API.BATCH_REMOVE_WORKS}?${params.toString()}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const result = await response.json()
    console.log('[CreatorAPI] 批量移除响应:', JSON.stringify(result, null, 2))

    const statusCode = result.code || result.recode
    if (statusCode === 200 && result.data === true) {
      console.log('✅ 批量移除成功')
      return { success: true, data: result.data, message: result.message }
    }
    console.error('❌ 批量移除失败:', result.message)
    return { success: false, message: result.message || '操作失败' }
  } catch (error) {
    console.error('[CreatorAPI] 批量从系列移除作品失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}
