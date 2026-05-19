/**
 * 用户拓展数据 API 调用
 * @module userDataApi
 */

import { USER_DATA_API } from '../config/api';

/**
 * 查询用户所有拓展数据（公开接口，无需登录）
 * @param {number} userId - 用户 ID
 * @returns {Promise<Object>} 拓展数据列表结果
 */
export const getUserDataList = async (userId) => {
  try {
    // 校验参数
    if (!userId || typeof userId !== 'number') {
      console.error('❌ 用户 ID 无效');
      return { success: false, message: '用户 ID 无效' };
    }

    console.log(`发送获取用户拓展数据请求: userId=${userId}`);

    // 构建查询参数
    const params = new URLSearchParams();
    params.append('userId', userId);

    // 调用后端接口
    const response = await fetch(`${USER_DATA_API.LIST}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    // 打印响应日志
    console.log('用户拓展数据接口响应:', JSON.stringify(result, null, 2));

    // 兼容 code 和 recode 字段
    const statusCode = result.code || result.recode;

    if (statusCode === 200 && Array.isArray(result.data)) {
      // 过滤掉可能的 null 或无效数据
      const validData = result.data.filter(item => 
        item && item.user_data_name && item.user_data
      );
      
      console.log('✅ 获取用户拓展数据成功，共', validData.length, '条有效数据');
      
      return { 
        success: true, 
        data: validData,
        message: result.message 
      };
    } else {
      console.error('❌ 获取用户拓展数据失败:', result.message);
      return { 
        success: false, 
        message: result.message || '查询失败' 
      };
    }
  } catch (error) {
    console.error('网络请求失败:', error);
    return { 
      success: false, 
      message: '网络错误，请稍后重试' 
    };
  }
};
