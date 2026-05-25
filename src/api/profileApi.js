/**
 * Profile 页面联调代码
 * 包含用户信息获取等 API 调用
 * 
 * @module profileApi
 */

import { USER_API, AUTH_API } from '../config/api';

/**
 * ============================================
 * 用户信息功能
 * ============================================
 */

/**
 * 获取当前登录用户的详细信息
 * @returns {Promise<Object>} 用户信息结果
 */
export const getUserProfile = async () => {
  try {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('❌ 未找到 Token，用户未登录');
      return { success: false, message: '用户未登录' };
    }

    console.log('发送获取用户信息请求...');

    // 调用后端接口 - 使用 GET 方法，Token 通过 Header 传递
    const response = await fetch(USER_API.PROFILE_ME, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    // 打印后端返回的响应
    console.log('用户信息接口响应:', JSON.stringify(result, null, 2));

    // 根据业务状态码处理（兼容 code 和 recode 字段）
    const statusCode = result.code || result.recode;
    
    if (statusCode === 200 && result.data) {
      console.log('✅ 获取用户信息成功');
      
      // 更新 localStorage 中的用户信息
      const userInfo = { ...result.data };
      delete userInfo.password; // 删除密码字段，不保存到本地
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      console.log('用户信息已更新到 localStorage');

      return { success: true, data: result.data };
    } else {
      console.error('❌ 获取用户信息失败:', result.message);
      return { success: false, message: result.message || '获取用户信息失败' };
    }
  } catch (error) {
    console.error('网络请求失败:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/**
 * 根据用户名、UUID 或用户 ID 查询其他用户的信息（公开接口，无需登录）
 * @param {Object} params - 查询参数
 * @param {string} [params.username] - 用户名（可选，与 uuid/userId 三选一）
 * @param {string} [params.uuid] - 用户 UUID（可选，与 username/userId 三选一）
 * @param {number} [params.userId] - 用户 ID（可选，与 username/uuid 三选一）
 * @returns {Promise<Object>} 用户信息结果
 */
export const getUserInfoByUsernameOrUuid = async (params = {}) => {
  try {
    const { username, uuid, userId } = params;
    
    // 校验参数：username、uuid、userId 至少提供一个
    if (!username && !uuid && !userId) {
      console.error('❌ 请提供用户名、UUID 或用户 ID');
      return { success: false, message: '请提供用户名、UUID 或用户 ID' };
    }

    // 构建查询参数
    const queryParams = new URLSearchParams();
    if (username) {
      queryParams.append('username', username);
    }
    if (uuid) {
      queryParams.append('uuid', uuid);
    }
    if (userId !== undefined && userId !== null) {
      queryParams.append('userId', userId);
    }

    const queryString = queryParams.toString();
    const apiUrl = `${USER_API.PROFILE_INFO}?${queryString}`;

    console.log('发送获取其他用户信息请求:', apiUrl);

    // 调用后端接口 - GET 方法，公开接口无需 Token
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    // 打印后端返回的响应
    console.log('其他用户信息接口响应:', JSON.stringify(result, null, 2));

    // 根据业务状态码处理（兼容 code 和 recode 字段）
    const statusCode = result.code || result.recode;
    
    if (statusCode === 200 && result.data) {
      console.log('✅ 获取其他用户信息成功');
      return { success: true, data: result.data };
    } else {
      console.error('❌ 获取其他用户信息失败:', result.message);
      return { success: false, message: result.message || '获取用户信息失败' };
    }
  } catch (error) {
    console.error('网络请求失败:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/**
 * ============================================
 * 工具函数
 * ============================================
 */

/**
 * 退出登录
 * @returns {Promise<Object>} 退出登录结果
 */
export const logoutApi = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('⚠️ 未找到 Token，直接清除本地数据');
      logout();
      return { success: true, message: '已退出登录' };
    }

    console.log('发送退出登录请求...');

    const response = await fetch(AUTH_API.LOGOUT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const result = await response.json();
    console.log('退出登录接口响应:', JSON.stringify(result, null, 2));

    // 无论后端返回什么，前端都清除登录状态
    logout();

    const statusCode = result.code || result.recode;
    if (statusCode === 200) {
      console.log('✅ 退出登录成功');
      return { success: true, message: result.message || '已退出登录' };
    } else {
      console.warn('⚠️ 后端返回非200，但前端已清除登录状态');
      return { success: true, message: '已退出登录' };
    }
  } catch (error) {
    console.error('退出登录网络请求失败:', error);
    // 网络错误也清除本地数据
    logout();
    return { success: true, message: '已退出登录' };
  }
};

/**
 * 获取当前登录用户信息
 * @returns {Object|null} 用户信息对象，如果未登录则返回 null
 */
export const getCurrentUser = () => {
  const userInfoStr = localStorage.getItem('userInfo');
  if (userInfoStr) {
    try {
      return JSON.parse(userInfoStr);
    } catch (error) {
      console.error('解析用户信息失败:', error);
      return null;
    }
  }
  return null;
};

/**
 * 退出登录
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  console.log('已退出登录');
};

/**
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
export const isLoggedIn = () => {
  return !!localStorage.getItem('token');
};

/**
 * 获取认证头（用于需要 Token 的请求）
 * @returns {Object} 包含 Authorization 头的对象
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }
  return {
    'Content-Type': 'application/json',
  };
};
