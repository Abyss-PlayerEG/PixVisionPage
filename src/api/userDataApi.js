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
      // 保留完整数据（含 id 字段用于后续删除操作）
      const validData = result.data.filter(item => 
        item && item.user_data_name && item.user_data
      );
      
      console.log('✅ 获取用户拓展数据成功，共', validData.length, '条有效数据');
      console.log('📋 数据详情:', validData.map(d => ({ id: d.id, name: d.user_data_name, value: d.user_data })));
      
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

/**
 * 新增用户拓展数据（需登录）
 * @param {string} dataName - 数据类型名称（电话、邮箱、QQ、微信、Bilibili）
 * @param {string} dataContent - 数据内容，不超过 96 字符
 * @returns {Promise<Object>} { success, message }
 */
export const addUserData = async (dataName, dataContent) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: '用户未登录' };
    }

    if (!dataName || !dataContent) {
      return { success: false, message: '数据名称和值不能为空' };
    }

    if (dataContent.length > 96) {
      return { success: false, message: '数据内容不能超过 96 个字符' };
    }

    console.log('➕ 新增用户拓展数据:', dataName, '=', dataContent);

    const formData = new URLSearchParams();
    formData.append('dataName', dataName);
    formData.append('dataContent', dataContent);

    const response = await fetch(USER_DATA_API.ADD, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const result = await response.json();
    console.log('新增拓展数据响应:', JSON.stringify(result, null, 2));

    const statusCode = result.code || result.recode;

    // data: true   → 真正成功（含"已存在无需重复添加"）
    // data: null   → 特定错误（Token、校验、B站检测等）
    // data: false  → 通用失败
    if (statusCode === 200 && result.data === true) {
      console.log('✅ 新增拓展数据成功');
      return { success: true, message: result.message || '新增成功' };
    }

    console.error('❌ 新增拓展数据失败:', result.message);
    return { success: false, message: result.message || '新增失败' };
  } catch (error) {
    console.error('新增拓展数据网络错误:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/**
 * 批量删除用户拓展数据（需登录）
 * @param {number[]} dataIds - 要删除的数据 ID 数组，如 [1] 或 [1, 2, 3]
 * @returns {Promise<Object>} { success, message }
 */
export const deleteUserData = async (dataIds) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: '用户未登录' };
    }

    if (!dataIds || !Array.isArray(dataIds) || dataIds.length === 0) {
      return { success: false, message: '请提供要删除的数据 ID' };
    }

    console.log('🗑️ 批量删除用户拓展数据, IDs:', dataIds);

    const formData = new URLSearchParams();
    formData.append('dataIds', dataIds.join(','));

    const response = await fetch(USER_DATA_API.DELETE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const result = await response.json();
    console.log('删除拓展数据响应:', JSON.stringify(result, null, 2));

    const statusCode = result.code || result.recode;
    if (statusCode === 200) {
      console.log('✅ 删除拓展数据成功');
      return { success: true, message: result.message || '删除成功' };
    }
    console.error('❌ 删除拓展数据失败:', result.message);
    return { success: false, message: result.message || '删除失败' };
  } catch (error) {
    console.error('删除拓展数据网络错误:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};
