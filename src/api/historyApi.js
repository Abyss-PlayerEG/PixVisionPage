/**
 * 历史记录相关 API 调用
 */

import { HISTORY_API, getWorkImageUrl, getAvatarUrl } from '../config/api';

/**
 * 获取用户历史记录（分页）
 * @param {Object} params
 * @param {number} params.current - 当前页码，从 1 开始
 * @param {number} params.size - 每页大小，范围 1-500
 * @returns {Promise<Object>} { success, data: { records, total, current, size, pages }, message }
 */
export const fetchUserHistory = async ({ current = 1, size = 20 } = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: '用户未登录' };
    }

    const url = `${HISTORY_API.PAGE}/${current}/${size}`;
    console.log('[API] 请求用户历史记录:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    console.log('[API] 用户历史记录响应:', JSON.stringify(result, null, 2));

    const statusCode = result.code || result.recode;
    if (statusCode === 200 && result.data) {
      return { success: true, data: result.data, message: result.message };
    }
    return { success: false, message: result.message || '获取历史记录失败' };
  } catch (error) {
    console.error('[API] 获取历史记录失败:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/**
 * 删除历史记录
 * @param {Object} params
 * @param {Array<number>} [params.workIds] - 要删除的作品 ID 列表，当 clearAll 为 false 或 null 时必填
 * @param {boolean} [params.clearAll] - 是否清空所有历史记录，为 true 时 workIds 可为空
 * @returns {Promise<Object>} { success, data, message }
 */
export const deleteHistory = async ({ workIds, clearAll } = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: '用户未登录' };
    }

    // 构建请求体
    let body;
    if (clearAll === true) {
      body = 'clearAll=true';
    } else {
      if (!workIds || workIds.length === 0) {
        return { success: false, message: '请选择要删除的历史记录' };
      }
      // 将数组转为逗号分隔的字符串
      body = `workIds=${workIds.join(',')}`;
    }

    console.log('[API] 删除历史记录, 请求体:', body);

    const response = await fetch(HISTORY_API.DELETE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body,
    });

    const result = await response.json();
    console.log('[API] 删除历史记录响应:', JSON.stringify(result, null, 2));

    const statusCode = result.code || result.recode;
    if (statusCode === 200) {
      return { success: true, data: result.data, message: result.message || '历史记录删除成功' };
    }
    return { success: false, message: result.message || '删除历史记录失败' };
  } catch (error) {
    console.error('[API] 删除历史记录失败:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/**
 * 将历史记录数据转换为瀑布流组件所需格式
 * @param {Array} records - API 返回的历史记录列表
 * @returns {Array} 转换后的图片数据数组
 */
export const transformHistoryToWaterfallFormat = (records) => {
  if (!records || !Array.isArray(records)) return [];
  
  const baseHeights = [260, 310, 360, 410, 460];
  const CONTAINER_HEIGHT = window.innerHeight * 0.9;
  let simulatedColumnHeight = 0;
  const columns = [];
  let currentColumnIndices = [];
  
  const result = records.map((history, index) => {
    // 后端返回的是扁平结构，直接使用 history
    const work = history;
    
    if (index === 0) {
      console.log('[API] 第一条历史记录原始数据:', history);
      console.log('[API] work_id:', work.work_id);
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
    
    const imageUrl = getWorkImageUrl(work.thumb_url || work.img_url);
    const fullImageUrl = work.img_url ? getWorkImageUrl(work.img_url) : imageUrl;
    
    return {
      src: imageUrl,
      alt: work.work_title || '',
      height: currentHeight,
      workId: work.work_id,
      workTitle: work.work_title,
      userId: work.user_id,
      imgUrl: fullImageUrl,
      historyId: work.time, // 使用 time 作为唯一标识
      visitTime: work.time,
    };
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
      lastColIndices.forEach((idx, i) => {
        currentColTotalHeight += result[idx].height;
        if (i > 0) currentColTotalHeight += 8;
      });
      const remainingSpace = CONTAINER_HEIGHT - currentColTotalHeight;
      if (remainingSpace > 0) {
        const lastImgIdx = lastColIndices[lastColIndices.length - 1];
        result[lastImgIdx].height += remainingSpace;
      }
    }
  }
  
  return result;
};
