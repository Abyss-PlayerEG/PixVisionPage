/**
 * 作品相关 API 调用
 */

import { WORK_API, getWorkImageUrl } from '../config/api';

/**
 * 获取作品分页数据
 * @param {Object} params - 查询参数
 * @param {number} params.current - 当前页码 (默认 1)
 * @param {number} params.size - 每页数量 (默认 10, 最大 500)
 * @param {string} [params.workTitle] - 作品标题 (模糊查询)
 * @param {number} [params.userId] - 用户 ID
 * @param {number} [params.seriesId] - 系列 ID
 * @param {boolean} [params.isOriginal] - 是否原创
 * @returns {Promise<Object>} 标准化返回格式
 */
export const fetchWorkPage = async ({ 
  current = 1, 
  size = 10, 
  workTitle, 
  userId, 
  seriesId, 
  isOriginal 
} = {}) => {
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams();
    queryParams.append('current', current);
    queryParams.append('size', size);
    if (workTitle) queryParams.append('workTitle', workTitle);
    if (userId !== undefined) queryParams.append('userId', userId);
    if (seriesId !== undefined) queryParams.append('seriesId', seriesId);
    if (isOriginal !== undefined) queryParams.append('isOriginal', isOriginal);

    const url = `${WORK_API.PAGE}/${current}/${size}?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    console.log('[API] 原始响应数据:', result);

    // 兼容 code 和 recode 字段
    const statusCode = result.code || result.recode;

    if (statusCode === 200 && result.data) {
      return {
        success: true,
        data: result.data,
        message: result.message,
      };
    } else {
      return {
        success: false,
        message: result.message || '获取作品列表失败',
      };
    }
  } catch (error) {
    console.error('获取作品列表失败:', error);
    return {
      success: false,
      message: '网络错误，请稍后重试',
    };
  }
};

/**
 * 将作品数据转换为瀑布流组件所需格式
 * @param {Array} records - 作品记录数组
 * @returns {Array} 转换后的图片数据数组
 */
export const transformWorksToWaterfallFormat = (records) => {
  if (!records || !Array.isArray(records)) {
    return [];
  }

  // 定义可选的基础高度 (5个档位，增加视觉丰富度)
  const baseHeights = [260, 310, 360, 410, 460];
  
  // 模拟列高度追踪
  const CONTAINER_HEIGHT = window.innerHeight * 0.9; 
  let simulatedColumnHeight = 0;
  
  // 用于记录每一列的图片索引范围，方便最后交换
  const columns = [];
  let currentColumnIndices = [];

  const result = records.map((work, index) => {
    // 调试日志：检查第一条数据的字段
    if (index === 0) {
      console.log('[API] 第一条作品原始数据:', work);
    }

    let currentHeight;

    // 计算加入这张图后的预估高度
    const gap = 8; // 间距
    const projectedHeight = simulatedColumnHeight + (simulatedColumnHeight > 0 ? gap : 0);
    
    // 如果剩余空间不足 350px，则最后一张图的高度设为剩余高度
    if (CONTAINER_HEIGHT - projectedHeight < 350) {
      currentHeight = Math.max(CONTAINER_HEIGHT - projectedHeight, 100); // 确保最小高度
      
      // 记录当前列的最后一个索引
      currentColumnIndices.push(index);
      columns.push([...currentColumnIndices]);
      currentColumnIndices = []; // 开启新列
      
      // 重置模拟列高
      simulatedColumnHeight = 0;
    } else {
      // 否则从预设值中随机选择
      currentHeight = baseHeights[Math.floor(Math.random() * baseHeights.length)];
      simulatedColumnHeight = projectedHeight + currentHeight;
      currentColumnIndices.push(index);
    }
    
    const imageUrl = getWorkImageUrl(work.img_url);
    if (index === 0) {
      console.log('[API] 第一条图片生成的 URL:', imageUrl);
    }

    return {
      src: imageUrl,
      alt: work.work_title || '',
      height: currentHeight,
      // 保留原始数据以便后续使用
      workId: work.work_id,
      workTitle: work.work_title,
      userId: work.user_id,
    };
  });

  // 如果最后一列还有残留索引，也加入记录
  if (currentColumnIndices.length > 0) {
    columns.push([...currentColumnIndices]);
  }

  // 执行分组交换逻辑
  columns.forEach((colIndices, colIndex) => {
    if (colIndices.length < 2) return;

    const remainder = colIndex % 3;
    
    if (remainder === 1) {
      // 第 2, 5, 8... 列：交换最后一张和倒数第二张
      const lastIdx = colIndices[colIndices.length - 1];
      const secondLastIdx = colIndices[colIndices.length - 2];
      const tempHeight = result[lastIdx].height;
      result[lastIdx].height = result[secondLastIdx].height;
      result[secondLastIdx].height = tempHeight;
    } else if (remainder === 2) {
      // 第 3, 6, 9... 列：交换最后一张和第一张
      const lastIdx = colIndices[colIndices.length - 1];
      const firstIdx = colIndices[0];
      const tempHeight = result[lastIdx].height;
      result[lastIdx].height = result[firstIdx].height;
      result[firstIdx].height = tempHeight;
    }
    // remainder === 0 (第 1, 4, 7... 列) 不做任何交换
  });

  // 单独处理最后一列：计算总高度，将留白部分全部加给最后一张图片
  if (columns.length > 0) {
    const lastColIndices = columns[columns.length - 1];
    if (lastColIndices.length > 0) {
      let currentColTotalHeight = 0;
      
      // 计算当前列所有图片的总高度（含间距）
      lastColIndices.forEach((idx, i) => {
        currentColTotalHeight += result[idx].height;
        if (i > 0) currentColTotalHeight += 8; // 加上间距
      });

      // 计算留白空间
      const remainingSpace = CONTAINER_HEIGHT - currentColTotalHeight;
      
      // 如果有留白（且留白不是负数），加到最后一张图上
      if (remainingSpace > 0) {
        const lastImgIdx = lastColIndices[lastColIndices.length - 1];
        result[lastImgIdx].height += remainingSpace;
      }
    }
  }
  
  return result;
};
