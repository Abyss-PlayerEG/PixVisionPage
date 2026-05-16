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

  const result = records.map((work) => {
    // 生成 200-500 之间的随机高度
    const randomHeight = Math.floor(Math.random() * (500 - 200 + 1)) + 200;
    
    const imageUrl = getWorkImageUrl(work.img_url)

    return {
      src: imageUrl,
      alt: work.work_title || '',
      height: randomHeight,
      // 保留原始数据以便后续使用
      workId: work.work_id,
      workTitle: work.work_title,
      userId: work.user_id,
    };
  });
  
  return result;
};
