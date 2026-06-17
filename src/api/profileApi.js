/**
 * Profile 页面联调代码
 * 包含用户信息获取等 API 调用
 * 
 * @module profileApi
 */

import { USER_API, AUTH_API, AVATAR_UPLOAD_API, AVATAR_RESET_DEFAULT_API, AVATAR_SYNC_BILIBILI_API, ROLE_API } from '../config/api';

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
 * 根据用户名或 UUID 查询其他用户的信息（公开接口，无需登录）
 * @param {Object} params - 查询参数
 * @param {string} [params.username] - 用户名（可选，与 uuid 二选一）
 * @param {string} [params.uuid] - 用户 UUID（可选，与 username 二选一）
 * @returns {Promise<Object>} 用户信息结果
 */
export const getUserInfoByUsernameOrUuid = async (params = {}) => {
  try {
    const { username, uuid } = params;
    
    // 校验参数：username 或 uuid 至少提供一个
    if (!username && !uuid) {
      console.error('❌ 请提供用户名或 UUID');
      return { success: false, message: '请提供用户名或 UUID' };
    }

    // 构建查询参数
    const queryParams = new URLSearchParams();
    if (username) {
      queryParams.append('username', username);
    }
    if (uuid) {
      queryParams.append('uuid', uuid);
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
 * 修改用户昵称
 * @param {string} nickname - 新昵称，长度 1-20 个字符
 * @returns {Promise<Object>} { success, message }
 */
export const updateNickname = async (nickname) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: '用户未登录' };
    }

    if (!nickname || nickname.trim().length === 0) {
      return { success: false, message: '昵称不能为空' };
    }

    if (nickname.trim().length > 20) {
      return { success: false, message: '昵称长度不能超过20个字符' };
    }

    console.log('📝 修改昵称:', nickname);

    const response = await fetch(`${USER_API.NICKNAME_CHANGE}?nickname=${encodeURIComponent(nickname.trim())}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();
    console.log('昵称修改响应:', JSON.stringify(result, null, 2));

    const statusCode = result.code || result.recode;
    if (statusCode === 200) {
      console.log('✅ 昵称修改成功');
      return { success: true, message: result.message || '昵称修改成功' };
    }
    console.error('❌ 昵称修改失败:', result.message);
    return { success: false, message: result.message || '昵称修改失败' };
  } catch (error) {
    console.error('昵称修改网络错误:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/**
 * ============================================
 * 工具函数
 * ============================================
 */

/**
 * 恢复初始头像（随机分配 default/1.png ~ default/21.png）
 * @returns {Promise<Object>} { success, data: { avatar_url }, message }
 */
export const resetDefaultAvatar = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: '用户未登录' };
    }

    console.log('🔄 恢复初始头像...');

    const response = await fetch(AVATAR_RESET_DEFAULT_API, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const result = await response.json();
    console.log('初始头像恢复响应:', JSON.stringify(result, null, 2));

    const statusCode = result.code || result.recode;
    if (statusCode === 200) {
      console.log('✅ 初始头像恢复成功');
      return { success: true, data: result.data, message: result.message || '头像已恢复' };
    }
    console.error('❌ 初始头像恢复失败:', result.message);
    return { success: false, message: result.message || '头像恢复失败' };
  } catch (error) {
    console.error('恢复初始头像网络错误:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/**
 * 同步 Bilibili 头像
 * @returns {Promise<Object>} { success, data: { avatar_url }, message }
 */
export const syncBilibiliAvatar = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: '用户未登录' };
    }

    console.log('🔵 同步 Bilibili 头像...');

    const response = await fetch(AVATAR_SYNC_BILIBILI_API, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const result = await response.json();
    console.log('Bilibili 头像同步响应:', JSON.stringify(result, null, 2));

    const statusCode = result.code || result.recode;
    if (statusCode === 200) {
      console.log('✅ Bilibili 头像同步成功');
      return { success: true, data: result.data, message: result.message || 'B站头像同步成功' };
    }
    console.error('❌ Bilibili 头像同步失败:', result.message);
    return { success: false, message: result.message || 'B站头像同步失败' };
  } catch (error) {
    console.error('同步Bilibili头像网络错误:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/**
 * 上传头像
 * @param {Blob} blob - 裁剪后的图片 Blob（PNG 格式）
 * @returns {Promise<Object>} 上传结果 { success, data: { avatar_url }, message }
 */
export const uploadAvatar = async (blob) => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('❌ 未找到 Token，用户未登录');
      return { success: false, message: '用户未登录' };
    }

    console.log('📤 上传头像，大小:', (blob.size / 1024).toFixed(1), 'KB');

    const formData = new FormData();
    formData.append('file', blob, 'avatar.png');

    const response = await fetch(AVATAR_UPLOAD_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();
    console.log('头像上传接口响应:', JSON.stringify(result, null, 2));

    const statusCode = result.code || result.recode;

    if (statusCode === 200) {
      console.log('✅ 头像上传成功');
      return { success: true, data: result.data, message: result.message || '头像更新成功' };
    } else {
      console.error('❌ 头像上传失败:', result.message);
      return { success: false, message: result.message || '头像上传失败' };
    }
  } catch (error) {
    console.error('头像上传网络请求失败:', error);
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
 * ============================================
 * 权限变更功能
 * ============================================
 */

/**
 * 申请成为创作者（发送验证码）
 * @returns {Promise<Object>} { success, message }
 */
export const sendRoleChangeCode = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: '用户未登录' };
    }

    console.log('发送权限变更验证码请求...');

    const response = await fetch(ROLE_API.SEND_CODE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();
    console.log('发送验证码响应:', JSON.stringify(result, null, 2));

    const statusCode = result.code || result.recode;
    if (statusCode === 200) {
      console.log('验证码发送成功');
      return { success: true, message: result.message || '验证码已发送到您的邮箱' };
    }
    console.error('验证码发送失败:', result.message);
    return { success: false, message: result.message || '验证码发送失败' };
  } catch (error) {
    console.error('发送验证码网络错误:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/**
 * 申请成为创作者（提交申请）
 * @param {string} vCode - 邮箱验证码
 * @returns {Promise<Object>} { success, message }
 */
export const applyCreatorRole = async (vCode) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: '用户未登录' };
    }

    if (!vCode || vCode.trim().length === 0) {
      return { success: false, message: '请输入验证码' };
    }

    console.log('申请成为创作者，验证码:', vCode);

    const response = await fetch(`${ROLE_API.APPLY}?targetRole=22&vCode=${encodeURIComponent(vCode.trim())}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();
    console.log('申请创作者响应:', JSON.stringify(result, null, 2));

    const statusCode = result.code || result.recode;
    if (statusCode === 200 && result.data) {
      console.log('申请成功:', result.data);
      return { success: true, message: result.data };
    }
    console.error('申请失败:', result.message);
    return { success: false, message: result.message || '申请失败' };
  } catch (error) {
    console.error('申请创作者网络错误:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
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
