/**
 * 作品相关 API 调用
 */

import { WORK_API, getWorkImageUrl } from '../config/api';

/**
 * 获取作品分页数据
 * @param {number} current - 当前页码
 * @param {number} size - 每页数量
 * @returns {Promise<Object>} 标准化返回格式
 */
export const fetchWorkPage = async (current, size) => {
  try {
    const response = await fetch(`${WORK_API.PAGE}/${current}/${size}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

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
    
    const imageUrl = getWorkImageUrl(work.img_url)

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

  // 执行交换逻辑：遍历每一列，如果列内图片 >= 2，交换最后两张的高度
  columns.forEach(colIndices => {
    if (colIndices.length >= 2) {
      const lastIdx = colIndices[colIndices.length - 1];
      const secondLastIdx = colIndices[colIndices.length - 2];
      
      // 交换高度
      const tempHeight = result[lastIdx].height;
      result[lastIdx].height = result[secondLastIdx].height;
      result[secondLastIdx].height = tempHeight;
    }
  });
  
  return result;
};
