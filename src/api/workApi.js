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
    console.log('获取作品列表:', { current, size });

    const response = await fetch(`${WORK_API.PAGE}/${current}/${size}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    console.log('作品列表响应:', JSON.stringify(result, null, 2));

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
    console.warn('records 为空或不是数组:', records)
    return [];
  }

  console.log('开始转换', records.length, '条记录')

  const result = records.map((work, index) => {
    // 生成 200-500 之间的随机高度
    const randomHeight = Math.floor(Math.random() * (500 - 200 + 1)) + 200;
    
    const imageUrl = getWorkImageUrl(work.img_url)

    if (index === 0) {
      console.log('第一条数据详情:', {
        work_id: work.work_id,
        img_url: work.img_url,
        work_title: work.work_title,
        生成的URL: imageUrl,
        height: randomHeight
      })
    }

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
  
  console.log('转换完成，返回', result.length, '条数据')
  return result;
};
