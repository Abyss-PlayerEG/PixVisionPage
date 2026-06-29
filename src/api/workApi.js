/**
 * 作品相关 API 调用
 */

import { WORK_API, COMMENT_API, LIKE_API, STAR_API, SERIES_API, USER_API, getWorkImageUrl, getAvatarUrl } from '../config/api';
import { getUserInfoByUsernameOrUuid } from './profileApi';
import { getUserDataList } from './userDataApi';

/**
 * 获取单个作品详细信息
 * @param {number} workId - 作品 ID
 * @returns {Promise<Object>} { success, data: Works, message }
 */
export const fetchWorkDetail = async (workId) => {
  try {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const url = `${WORK_API.DETAIL}/${workId}`;
    console.log('[API] 请求作品详情:', url, token ? '(已携带Token)' : '(未登录，游客访问)');
    const response = await fetch(url, { method: 'GET', headers });
    const result = await response.json();
    console.log('[API] 作品详情响应:', JSON.stringify(result, null, 2));
    const statusCode = result.code || result.recode;
    if (statusCode === 200 && result.data) {
      return { success: true, data: result.data };
    }
    // 公开接口：401 不暴露错误信息给游客
    if (statusCode === 401) {
      return { success: false, message: '作品不存在或已删除' };
    }
    return { success: false, message: result.message || '作品不存在或已删除' };
  } catch (error) {
    console.error('[API] 作品详情请求失败:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/**
 * 获取当前最大作品 ID
 * @returns {Promise<Object>} { success, data: number (lastId), message }
 */
export const getLastWorkId = async () => {
  try {
    const url = WORK_API.LAST_ID;
    console.log('[API] 请求最大作品ID:', url);
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    const result = await response.json();
    console.log('[API] 最大作品ID响应:', JSON.stringify(result, null, 2));
    const statusCode = result.code || result.recode;
    if (statusCode === 200 && result.data !== null && result.data !== undefined) {
      return { success: true, data: Number(result.data) };
    }
    return { success: false, message: result.message || '获取最大作品ID失败' };
  } catch (error) {
    console.error('[API] 获取最大作品ID请求失败:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/**
 * 随机获取一个作品
 * @returns {Promise<Object>} { success, data: number (workId), message }
 */
export const fetchRandomWork = async () => {
  try {
    const url = WORK_API.RANDOM;
    console.log('[API] 请求随机作品:', url);
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    const result = await response.json();
    console.log('[API] 随机作品响应:', JSON.stringify(result, null, 2));
    const statusCode = result.recode || result.code;
    if (statusCode === 200 && result.data !== null && result.data !== undefined) {
      return { success: true, data: Number(result.data) };
    }
    return { success: false, message: result.message || '获取随机作品失败' };
  } catch (error) {
    console.error('[API] 随机作品请求失败:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/**
 * 获取作品评论列表
 * @param {number} workId - 作品 ID
 * @param {string} [orderBy='newest'] - 排序方式
 * @returns {Promise<Object>}
 */
export const fetchCommentList = async (workId, orderBy = 'newest') => {
  try {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const queryParams = new URLSearchParams();
    if (orderBy) queryParams.append('orderBy', orderBy);
    const queryString = queryParams.toString();
    const url = `${COMMENT_API.LIST}/${workId}${queryString ? '?' + queryString : ''}`;
    console.log('[API] 请求评论列表:', url);
    const response = await fetch(url, { method: 'GET', headers });
    const result = await response.json();
    console.log('[API] 评论列表响应:', JSON.stringify(result, null, 2));
    const statusCode = result.code || result.recode;
    if (statusCode === 200 && result.data) {
      const comments = result.data.map(transformComment);
      return { success: true, data: comments };
    }
    // 公开接口：401 视为空评论，不暴露给游客
    if (statusCode === 401) {
      return { success: true, data: [] };
    }
    return { success: false, message: result.message || '获取评论失败' };
  } catch (error) {
    console.error('[API] 评论列表请求失败:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/** 转换评论数据，拼接头像 URL 并递归处理子评论 */
const transformComment = (comment) => {
  const transformed = { ...comment, avatarUrl: getAvatarUrl(comment.user_avatar || '') };
  if (comment.children && Array.isArray(comment.children)) {
    transformed.children = comment.children.map(transformComment);
  }
  return transformed;
};

/**
 * 发表评论
 * @param {Object} params
 * @param {number} params.workId
 * @param {number} params.commentFloor - 1=一级, 2=二级
 * @param {string} params.commentText - 最多125字
 * @param {number} [params.parentCommentId]
 * @param {number} [params.repliedUserId]
 * @returns {Promise<Object>}
 */
export const addComment = async ({ workId, commentFloor, commentText, parentCommentId, repliedUserId }) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: '请先登录后再发表评论' };
    }
    const params = new URLSearchParams();
    params.append('workId', workId);
    params.append('commentFloor', commentFloor);
    params.append('commentText', commentText);
    if (parentCommentId !== undefined && parentCommentId !== null) {
      params.append('parentCommentId', parentCommentId);
    }
    if (repliedUserId !== undefined && repliedUserId !== null) {
      params.append('repliedUserId', repliedUserId);
    }
    console.log('[API] 发表评论:', { workId, commentFloor, commentText, parentCommentId, repliedUserId });
    const response = await fetch(`${COMMENT_API.ADD}?${params.toString()}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const result = await response.json();
    console.log('[API] 评论发表响应:', JSON.stringify(result, null, 2));
    const statusCode = result.code || result.recode;
    if (statusCode === 200) {
      return { success: true, data: result.data, message: result.message };
    }
    return { success: false, message: result.message || '评论发表失败' };
  } catch (error) {
    console.error('[API] 评论发表请求失败:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/**
 * 删除评论（仅可删除自己的评论）
 * @param {number} commentId - 评论 ID
 * @returns {Promise<Object>} { success, data, message }
 */
export const deleteComment = async (commentId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: '请先登录后再操作' };
    }
    const url = `${COMMENT_API.DELETE}?commentId=${commentId}`;
    console.log('[API] 删除评论:', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': `Bearer ${token}` },
    });
    const result = await response.json();
    console.log('[API] 删除评论响应:', JSON.stringify(result, null, 2));
    const statusCode = result.code || result.recode;
    if (statusCode === 200 && result.data === true) {
      return { success: true, message: result.message || '评论已删除' };
    }
    return { success: false, message: result.message || '删除评论失败' };
  } catch (error) {
    console.error('[API] 删除评论请求失败:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/**
 * 切换点赞状态（点赞/取消）
 * @param {number} workId - 作品 ID
 * @returns {Promise<Object>} { success, data: boolean (true=已点赞, false=未点赞), message }
 */
export const toggleLike = async (workId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: '请先登录后再操作' };
    }
    const url = `${LIKE_API.TOGGLE}/${workId}`;
    console.log('[API] 切换点赞:', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const result = await response.json();
    console.log('[API] 点赞响应:', JSON.stringify(result, null, 2));
    const statusCode = result.code || result.recode;
    if (statusCode === 200) {
      return { success: true, data: result.data, message: result.message };
    }
    return { success: false, message: result.message || '操作失败' };
  } catch (error) {
    console.error('[API] 点赞请求失败:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/**
 * 切换收藏状态（收藏/取消）
 * @param {number} workId - 作品 ID
 * @returns {Promise<Object>} { success, data: boolean (true=已收藏, false=未收藏), message }
 */
export const toggleStar = async (workId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: '请先登录后再操作' };
    }
    const url = `${STAR_API.TOGGLE}/${workId}`;
    console.log('[API] 切换收藏:', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const result = await response.json();
    console.log('[API] 收藏响应:', JSON.stringify(result, null, 2));
    const statusCode = result.code || result.recode;
    if (statusCode === 200) {
      return { success: true, data: result.data, message: result.message };
    }
    return { success: false, message: result.message || '操作失败' };
  } catch (error) {
    console.error('[API] 收藏请求失败:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/**
 * 查询当前用户对作品的点赞状态
 * @param {number} workId - 作品 ID
 * @returns {Promise<Object>} { success, data: boolean, message }
 */
export const fetchLikeStatus = async (workId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return { success: false, message: '未登录' };
    const url = `${LIKE_API.STATUS}/${workId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const result = await response.json();
    const statusCode = result.code || result.recode;
    if (statusCode === 200) {
      return { success: true, data: result.data };
    }
    return { success: false, message: result.message };
  } catch (error) {
    console.error('[API] 点赞状态查询失败:', error);
    return { success: false, message: '网络错误' };
  }
};

/**
 * 查询当前用户对作品的收藏状态
 * @param {number} workId - 作品 ID
 * @returns {Promise<Object>} { success, data: boolean, message }
 */
export const fetchStarStatus = async (workId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return { success: false, message: '未登录' };
    const url = `${STAR_API.STATUS}/${workId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const result = await response.json();
    const statusCode = result.code || result.recode;
    if (statusCode === 200) {
      return { success: true, data: result.data };
    }
    return { success: false, message: result.message };
  } catch (error) {
    console.error('[API] 收藏状态查询失败:', error);
    return { success: false, message: '网络错误' };
  }
};

/**
 * 获取作品分页数据
 */
export const fetchWorkPage = async ({ current = 1, size = 10, workTitle, userId, seriesId, isOriginal } = {}) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('current', current);
    queryParams.append('size', size);
    if (workTitle) queryParams.append('workTitle', workTitle);
    if (userId !== undefined) queryParams.append('userId', userId);
    if (seriesId !== undefined) queryParams.append('seriesId', seriesId);
    if (isOriginal !== undefined) queryParams.append('isOriginal', isOriginal);
    const url = `${WORK_API.PAGE}/${current}/${size}?${queryParams.toString()}`;
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    const result = await response.json();
    console.log('[API] 原始响应数据:', result);
    const statusCode = result.code || result.recode;
    if (statusCode === 200 && result.data) {
      return { success: true, data: result.data, message: result.message };
    }
    // 公开接口：401 视为空数据，不暴露给游客
    if (statusCode === 401) {
      return { success: true, data: { records: [], total: 0 } };
    }
    return { success: false, message: result.message || '获取作品列表失败' };
  } catch (error) {
    console.error('获取作品列表失败:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/**
 * 获取用户点赞的作品列表（分页）
 * @param {Object} params
 * @param {number} params.userId - 用户 ID，必填
 * @param {number} [params.current=1] - 当前页码
 * @param {number} [params.size=20] - 每页大小，范围 1-500
 * @param {string} [params.orderBy='newest'] - 排序方式，newest/oldest
 * @returns {Promise<Object>} { success, data: { records, total, ... }, message }
 */
export const fetchUserLikedWorks = async ({ userId, current = 1, size = 20, orderBy } = {}) => {
  try {
    const queryParams = new URLSearchParams()
    if (orderBy) queryParams.append('orderBy', orderBy)
    const qs = queryParams.toString()
    const url = `${LIKE_API.USER_LIKED}/${userId}/${current}/${size}${qs ? '?' + qs : ''}`;
    console.log('[API] 请求用户点赞作品:', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await response.json();
    console.log('[API] 用户点赞作品响应:', result);
    const statusCode = result.code || result.recode;
    if (statusCode === 200 && result.data) {
      return { success: true, data: result.data, message: result.message };
    }
    return { success: false, message: result.message || '获取点赞作品失败' };
  } catch (error) {
    console.error('[API] 获取点赞作品失败:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/**
 * 获取用户收藏的作品列表（分页）
 * @param {Object} params
 * @param {number} params.userId - 用户 ID，必填
 * @param {number} [params.current=1] - 当前页码
 * @param {number} [params.size=20] - 每页大小，范围 1-500
 * @param {string} [params.orderBy='newest'] - 排序方式，newest/oldest
 * @returns {Promise<Object>} { success, data: { records, total, ... }, message }
 */
export const fetchUserStarredWorks = async ({ userId, current = 1, size = 20, orderBy } = {}) => {
  try {
    const queryParams = new URLSearchParams()
    if (orderBy) queryParams.append('orderBy', orderBy)
    const qs = queryParams.toString()
    const url = `${STAR_API.USER_STARRED}/${userId}/${current}/${size}${qs ? '?' + qs : ''}`;
    console.log('[API] 请求用户收藏作品:', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await response.json();
    console.log('[API] 用户收藏作品响应:', result);
    const statusCode = result.code || result.recode;
    if (statusCode === 200 && result.data) {
      return { success: true, data: result.data, message: result.message };
    }
    return { success: false, message: result.message || '获取收藏作品失败' };
  } catch (error) {
    console.error('[API] 获取收藏作品失败:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/**
 * 获取用户作品系列分页列表（公开接口）
 * @param {Object} params
 * @param {number} [params.userId] - 用户 ID，可选，不传则查询所有用户
 * @param {number} [params.current=1] - 当前页码
 * @param {number} [params.size=10] - 每页大小，范围 1-500
 * @param {string} [params.keyword] - 搜索关键词，可选
 * @returns {Promise<Object>} { success, data: { records, total, ... }, message }
 */
export const fetchUserSeries = async ({ userId = null, current = 1, size = 10, keyword } = {}) => {
  try {
    const queryParams = new URLSearchParams()
    if (userId) queryParams.append('userId', userId)
    if (keyword) queryParams.append('keyword', keyword)
    const qs = queryParams.toString()
    const url = `${SERIES_API.PAGE}/${current}/${size}${qs ? '?' + qs : ''}`
    console.log('[API] 请求用户系列列表:', url)
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    const result = await response.json()
    console.log('[API] 用户系列列表响应:', result)
    const statusCode = result.code || result.recode
    if (statusCode === 200 && result.data) {
      if (result.data.records) {
        result.data.records = result.data.records.map(series => ({
          ...series,
          coverUrl: series.thumb_url ? getWorkImageUrl(series.thumb_url) : null,
        }))
      }
      return { success: true, data: result.data, message: result.message }
    }
    // 公开接口：401 视为空数据，不暴露给游客
    if (statusCode === 401) {
      return { success: true, data: { records: [], total: 0 } }
    }
    return { success: false, message: result.message || '获取系列列表失败' }
  } catch (error) {
    console.error('[API] 获取系列列表失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 将 Series 数据转换为 SeriesGrid 组件所需格式
 * @param {Array} records - API 返回的 series 列表
 * @returns {Array}
 */
export const transformSeriesToGridFormat = (records) => {
  if (!records || !Array.isArray(records)) return []
  const pool = [3, 4, 5, 6, 3, 5, 4, 6, 3, 4, 5, 3, 6, 4, 5, 6]
  let poolIdx = 0
  return records.map((series) => {
    const colSpan = pool[poolIdx % pool.length]
    poolIdx++
    const rowSpan = colSpan >= 5 ? 2 : colSpan === 4 ? 3 : 2
    return {
      seriesId: series.series_id,
      userId: series.user_id,
      title: series.series_title || '',
      description: series.about_text || '',
      coverUrl: series.coverUrl || null,
      colSpan,
      rowSpan,
    }
  })
}

/**
 * 将作品数据转换为瀑布流组件所需格式
 */
export const transformWorksToWaterfallFormat = (records) => {
  if (!records || !Array.isArray(records)) return [];
  const baseHeights = [260, 310, 360, 410, 460];
  const CONTAINER_HEIGHT = window.innerHeight * 0.9;
  let simulatedColumnHeight = 0;
  const columns = [];
  let currentColumnIndices = [];
  const result = records.map((work, index) => {
    if (index === 0) {
      console.log('[API] 第一条作品原始数据:', work);
      console.log('[API] thumb_url:', work.thumb_url, '| img_url:', work.img_url);
    }
    let currentHeight;
    const gap = 8;
    const projectedHeight = simulatedColumnHeight + (simulatedColumnHeight > 0 ? gap : 0);
    if (CONTAINER_HEIGHT - projectedHeight < 350) {
      currentHeight = Math.max(CONTAINER_HEIGHT - projectedHeight, 100);
      currentColumnIndices.push(index);
      columns.push([...currentColumnIndices]);
      currentColumnIndices = [];
      simulatedColumnHeight = 0;
    } else {
      currentHeight = baseHeights[Math.floor(Math.random() * baseHeights.length)];
      simulatedColumnHeight = projectedHeight + currentHeight;
      currentColumnIndices.push(index);
    }
    const imageUrl = getWorkImageUrl(work.thumb_url);
    if (index === 0) console.log('[API] 第一条缩略图生成的 URL:', imageUrl);
    const fullImageUrl = work.img_url ? getWorkImageUrl(work.img_url) : imageUrl;
    return { src: imageUrl, alt: work.work_title || '', height: currentHeight, workId: work.work_id, workTitle: work.work_title, userId: work.user_id, imgUrl: fullImageUrl };
  });
  if (currentColumnIndices.length > 0) columns.push([...currentColumnIndices]);
  columns.forEach((colIndices, colIndex) => {
    if (colIndices.length < 2) return;
    const remainder = colIndex % 3;
    if (remainder === 1) {
      const lastIdx = colIndices[colIndices.length - 1];
      const secondLastIdx = colIndices[colIndices.length - 2];
      const tempHeight = result[lastIdx].height;
      result[lastIdx].height = result[secondLastIdx].height;
      result[secondLastIdx].height = tempHeight;
    } else if (remainder === 2) {
      const lastIdx = colIndices[colIndices.length - 1];
      const firstIdx = colIndices[0];
      const tempHeight = result[lastIdx].height;
      result[lastIdx].height = result[firstIdx].height;
      result[firstIdx].height = tempHeight;
    }
  });
  if (columns.length > 0) {
    const lastColIndices = columns[columns.length - 1];
    if (lastColIndices.length > 0) {
      let currentColTotalHeight = 0;
      lastColIndices.forEach((idx, i) => { currentColTotalHeight += result[idx].height; if (i > 0) currentColTotalHeight += 8; });
      const remainingSpace = CONTAINER_HEIGHT - currentColTotalHeight;
      if (remainingSpace > 0) {
        const lastImgIdx = lastColIndices[lastColIndices.length - 1];
        result[lastImgIdx].height += remainingSpace;
      }
    }
  }
  return result;
};

/**
 * 获取作品发布者的详细信息（包括用户资料和联系方式）
 * @param {number} userId - 发布者用户 ID
 * @returns {Promise<Object>} { success, data: { avatar, displayName, username, bio, works, totalViews, totalLikes, totalStars, contactItems } }
 */
export const fetchPublisherInfo = async (userId) => {
  try {
    console.log('[API] 获取发布者信息: userId=', userId);

    // 并行获取用户基本资料和拓展数据（联系方式）
    // 使用 userId 查询用户信息（公开接口）
    const profileUrl = `${USER_API.PROFILE_INFO}?userId=${userId}`
    const [profileResponse, contactResult] = await Promise.all([
      fetch(profileUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' } }).then(r => r.json()),
      getUserDataList(userId),
    ]);

    const profileResult = {
      success: (profileResponse.code || profileResponse.recode) === 200 && profileResponse.data,
      data: profileResponse.data
    }

    const userData = profileResult.success ? profileResult.data : null;
    const contactData = contactResult.success ? contactResult.data : [];

    // 构建联系方式列表（含名称和内容，供模板使用）
    const contactItems = contactData.map(item => ({
      name: item.user_data_name,
      content: item.user_data,
    }));

    if (userData) {
      console.log('[API] 发布者信息获取成功:', { nickname: userData.nickname, username: userData.username });
      return {
        success: true,
        data: {
          avatar: getAvatarUrl(userData.avatar_url || ''),
          displayName: userData.nickname || '未设置昵称',
          username: userData.username || '',
          bio: '',
          works: userData.work_count || 0,
          totalViews: userData.total_views || 0,
          totalLikes: userData.total_likes || 0,
          totalStars: userData.total_stars || 0,
          contactItems,
        },
      };
    }

    // 用户信息获取失败时降级为 mock 数据
    console.warn('[API] 发布者信息获取失败，使用降级数据');
    return {
      success: false,
      data: {
        avatar: getAvatarUrl(''),
        displayName: `创作者 #${userId}`,
        username: `user_${userId}`,
        bio: '',
        works: 0,
        totalViews: 0,
        totalLikes: 0,
        totalStars: 0,
        contactItems: [],
      },
    };
  } catch (error) {
    console.error('[API] 获取发布者信息异常:', error);
    return {
      success: false,
      data: {
        avatar: getAvatarUrl(''),
        displayName: `创作者 #${userId}`,
        username: `user_${userId}`,
        bio: '',
        works: 0,
        totalViews: 0,
        totalLikes: 0,
        totalStars: 0,
        contactItems: [],
      },
    };
  }
};
