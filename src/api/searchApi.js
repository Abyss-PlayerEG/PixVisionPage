/**
 * 搜索相关 API 模块
 * 封装作品、合集、用户的搜索接口
 */
import { SEARCH_API, getWorkImageUrl, getAvatarUrl } from '../config/api'

/**
 * 搜索作品列表
 * @param {Object} params - 搜索参数
 * @param {number} params.current - 当前页码（从1开始）
 * @param {number} params.size - 每页大小（1-500）
 * @param {string} [params.workTitle] - 作品标题（可选，模糊查询）
 * @param {number} [params.userId] - 用户ID（可选，精确查询）
 * @param {number} [params.seriesId] - 系列ID（可选，精确查询）
 * @param {boolean} [params.isOriginal] - 是否原创（可选）
 * @returns {Promise<{success: boolean, data?: Object, message?: string}>}
 */
export const searchWorks = async (params) => {
  const { current = 1, size = 20, workTitle, userId, seriesId, isOriginal } = params

  try {
    // 构建查询参数
    const queryParams = new URLSearchParams()
    if (workTitle) queryParams.append('workTitle', workTitle)
    if (userId !== undefined && userId !== null) queryParams.append('userId', userId)
    if (seriesId !== undefined && seriesId !== null) queryParams.append('seriesId', seriesId)
    if (isOriginal !== undefined && isOriginal !== null) queryParams.append('isOriginal', isOriginal)

    const qs = queryParams.toString()
    const url = `${SEARCH_API.WORK_PAGE(current, size)}${qs ? '?' + qs : ''}`

    console.log('🔍 搜索作品:', url, '参数:', { current, size, workTitle: workTitle || '(无)', userId, seriesId, isOriginal })

    const token = localStorage.getItem('token')
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(url, { method: 'GET', headers })
    const result = await response.json()
    console.log('作品搜索响应:', JSON.stringify(result, null, 2))

    const statusCode = result.code || result.recode
    if (statusCode === 200 && result.data) {
      console.log('✅ 作品搜索成功，记录数:', result.data.records?.length || 0)
      return { success: true, data: result.data }
    } else {
      console.error('❌ 作品搜索失败:', result.message)
      return { success: false, message: result.message || '搜索作品失败' }
    }
  } catch (error) {
    console.error('❌ 网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 搜索合集列表
 * @param {Object} params - 搜索参数
 * @param {number} params.userId - 用户ID（必填）
 * @param {number} params.current - 当前页码（从1开始）
 * @param {number} params.size - 每页大小（1-500）
 * @param {string} [params.keyword] - 搜索关键词（可选，同时匹配标题和描述）
 * @returns {Promise<{success: boolean, data?: Object, message?: string}>}
 */
export const searchSeries = async (params) => {
  const { userId, current = 1, size = 20, keyword } = params

  if (!userId) {
    console.error('❌ 搜索合集需要提供userId')
    return { success: false, message: '缺少用户ID参数' }
  }

  try {
    // 构建查询参数
    const queryParams = new URLSearchParams()
    if (keyword) queryParams.append('keyword', keyword)

    const qs = queryParams.toString()
    const url = `${SEARCH_API.SERIES_PAGE(userId, current, size)}${qs ? '?' + qs : ''}`

    console.log('🔍 搜索合集:', url, '参数:', { userId, current, size, keyword: keyword || '(无)' })

    const token = localStorage.getItem('token')
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(url, { method: 'GET', headers })
    const result = await response.json()
    console.log('合集搜索响应:', JSON.stringify(result, null, 2))

    const statusCode = result.code || result.recode
    if (statusCode === 200 && result.data) {
      console.log('✅ 合集搜索成功，记录数:', result.data.records?.length || 0)
      return { success: true, data: result.data }
    } else {
      console.error('❌ 合集搜索失败:', result.message)
      return { success: false, message: result.message || '搜索合集失败' }
    }
  } catch (error) {
    console.error('❌ 网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 获取单个用户的详细信息（包含统计数据）
 * @param {number} userId - 用户ID
 * @returns {Promise<Object|null>} 用户详细信息或null
 */
const fetchUserDetail = async (userId) => {
  try {
    const url = `${SEARCH_API.USER_DETAIL}?userId=${userId}`
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
    const result = await response.json()
    const statusCode = result.code || result.recode
    if (statusCode === 200 && result.data) {
      return result.data
    }
    return null
  } catch (error) {
    console.warn('获取用户详情失败:', userId, error)
    return null
  }
}

/**
 * 搜索用户列表
 * @param {Object} params - 搜索参数
 * @param {number} params.current - 当前页码（从1开始）
 * @param {number} params.size - 每页大小（1-500）
 * @param {string} [params.keyword] - 搜索关键词（可选，支持UUID精确查询或用户名/邮箱/昵称模糊查询）
 * @returns {Promise<{success: boolean, data?: Object, message?: string}>}
 */
export const searchUsers = async (params) => {
  const { current = 1, size = 20, keyword } = params

  try {
    // 构建查询参数
    const queryParams = new URLSearchParams()
    if (keyword) queryParams.append('keyword', keyword)

    const qs = queryParams.toString()
    const url = `${SEARCH_API.USER_PAGE(current, size)}${qs ? '?' + qs : ''}`

    console.log('🔍 搜索用户:', url, '参数:', { current, size, keyword: keyword || '(无)' })

    const token = localStorage.getItem('token')
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(url, { method: 'GET', headers })
    const result = await response.json()
    console.log('用户搜索响应:', JSON.stringify(result, null, 2))

    const statusCode = result.code || result.recode
    if (statusCode === 200 && result.data) {
      const records = result.data.records || []
      console.log('✅ 用户搜索成功，记录数:', records.length)

      // 为每个用户获取详细统计数据
      const enrichedRecords = await Promise.all(
        records.map(async (user) => {
          const detail = await fetchUserDetail(user.user_id)
          if (detail) {
            // 合并统计数据到用户对象
            return {
              ...user,
              work_count: detail.work_count ?? user.work_count ?? 0,
              total_likes: detail.total_likes ?? user.total_likes ?? 0,
              total_views: detail.total_views ?? user.total_views ?? 0,
              total_stars: detail.total_stars ?? user.total_stars ?? 0
            }
          }
          return user
        })
      )

      return {
        success: true,
        data: {
          ...result.data,
          records: enrichedRecords
        }
      }
    } else {
      console.error('❌ 用户搜索失败:', result.message)
      return { success: false, message: result.message || '搜索用户失败' }
    }
  } catch (error) {
    console.error('❌ 网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 转换作品数据为瀑布流格式
 * @param {Array} works - 作品列表
 * @returns {Array} 转换后的瀑布流数据
 */
export const transformWorksToWaterfallFormat = (works) => {
  if (!works || !Array.isArray(works)) return []

  return works.map(work => ({
    id: work.work_id || work.workId,
    src: getWorkImageUrl(work.img_url || work.imgUrl),
    title: work.work_title || work.workTitle || '未命名作品',
    width: work.img_width || work.imgWidth || 400,
    height: work.img_height || work.imgHeight || 300,
    userId: work.user_id || work.userId,
    nickname: work.nickname || '未知用户',
    avatar: work.avatar_url || work.avatarUrl,
    likeCount: work.like_count || work.likeCount || 0,
    starCount: work.star_count || work.starCount || 0,
    viewCount: work.view_count || work.viewCount || 0,
    createTime: work.create_time || work.createTime
  }))
}
