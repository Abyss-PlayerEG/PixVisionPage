/**
 * 账号管理相关 API
 * 包含账号注销、密码修改、安全邮箱修改等功能
 * 
 * @module accountApi
 */

import { ACCOUNT_API, ACCOUNT_MAIL_API } from '../config/api';

/**
 * ============================================
 * 账号注销功能
 * ============================================
 */

/**
 * 删除账号（注销）
 * @param {Object} data - 注销数据
 * @param {string} data.vCode - 验证码
 * @returns {Promise<Object>} 注销结果
 */
export const deleteAccount = async (data) => {
  try {
    const token = localStorage.getItem('token');
    const formData = new URLSearchParams();
    formData.append('vCode', data.vCode.toUpperCase());

    console.log('发送账号注销请求:', { vCode: '(已隐藏)' });

    const response = await fetch(ACCOUNT_API.DELETE_ACCOUNT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();
    console.log('账号注销响应:', JSON.stringify(result, null, 2));

    const statusCode = result.code || result.recode;

    if (statusCode === 200) {
      console.log('✅ 账号注销成功');
      // 清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      return { success: true, data: result.data };
    } else {
      console.error('❌ 账号注销失败:', result.message);
      return { success: false, message: result.message || '账号注销失败' };
    }
  } catch (error) {
    console.error('网络请求失败:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/**
 * 发送注销账号验证码
 * @returns {Promise<Object>} 发送结果
 */
export const sendDeleteAccountCode = async () => {
  try {
    const token = localStorage.getItem('token');

    console.log('发送注销账号验证码请求');

    const response = await fetch(ACCOUNT_MAIL_API.SEND_DELETE_ACCOUNT_CODE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();
    console.log('发送注销验证码响应:', JSON.stringify(result, null, 2));

    const statusCode = result.code || result.recode;

    if (statusCode === 200 || result.data === true) {
      console.log('✅ 注销验证码发送成功');
      return { success: true, message: '验证码已发送到您的邮箱' };
    } else {
      console.error('❌ 注销验证码发送失败:', result.message);
      return { success: false, message: result.message || '验证码发送失败' };
    }
  } catch (error) {
    console.error('网络请求失败:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/**
 * ============================================
 * 密码修改功能
 * ============================================
 */

/**
 * 修改密码
 * @param {Object} data - 密码数据
 * @param {string} data.oldPassword - 旧密码
 * @param {string} data.newPassword - 新密码
 * @param {string} data.confirmPassword - 确认新密码
 * @param {string} data.vCode - 验证码
 * @returns {Promise<Object>} 修改结果
 */
export const changePassword = async (data) => {
  try {
    const token = localStorage.getItem('token');
    const formData = new URLSearchParams();
    formData.append('oldPassword', data.oldPassword);
    formData.append('newPassword', data.newPassword);
    formData.append('confirmPassword', data.confirmPassword);
    formData.append('vCode', data.vCode.toUpperCase());

    console.log('发送修改密码请求:', {
      oldPassword: '(已隐藏)',
      newPassword: '(已隐藏)',
      confirmPassword: '(已隐藏)',
      vCode: '(已隐藏)',
    });

    const response = await fetch(ACCOUNT_API.CHANGE_PASSWORD, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();
    console.log('修改密码响应:', JSON.stringify(result, null, 2));

    const statusCode = result.code || result.recode;

    if (statusCode === 200) {
      console.log('✅ 密码修改成功');
      return { success: true, data: result.data, message: result.message || '密码修改成功' };
    } else {
      console.error('❌ 密码修改失败:', result.message);
      return { success: false, message: result.message || '密码修改失败' };
    }
  } catch (error) {
    console.error('网络请求失败:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/**
 * 发送修改密码验证码
 * @returns {Promise<Object>} 发送结果
 */
export const sendChangePasswordCode = async () => {
  try {
    const token = localStorage.getItem('token');

    console.log('发送修改密码验证码请求');

    const response = await fetch(ACCOUNT_MAIL_API.SEND_CHANGE_PASSWORD_CODE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();
    console.log('发送修改密码验证码响应:', JSON.stringify(result, null, 2));

    const statusCode = result.code || result.recode;

    if (statusCode === 200 || result.data === true) {
      console.log('✅ 修改密码验证码发送成功');
      return { success: true, message: '验证码已发送到您的邮箱' };
    } else {
      console.error('❌ 修改密码验证码发送失败:', result.message);
      return { success: false, message: result.message || '验证码发送失败' };
    }
  } catch (error) {
    console.error('网络请求失败:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/**
 * ============================================
 * 安全邮箱修改功能
 * ============================================
 */

/**
 * 修改安全邮箱
 * @param {Object} data - 邮箱数据
 * @param {string} data.newEmail - 新邮箱
 * @param {string} data.vCode - 验证码
 * @returns {Promise<Object>} 修改结果
 */
export const changeEmail = async (data) => {
  try {
    const token = localStorage.getItem('token');
    const formData = new URLSearchParams();
    formData.append('newEmail', data.newEmail);
    formData.append('vCode', data.vCode.toUpperCase());

    console.log('发送修改邮箱请求:', {
      newEmail: data.newEmail,
      vCode: '(已隐藏)',
    });

    const response = await fetch(ACCOUNT_API.CHANGE_EMAIL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();
    console.log('修改邮箱响应:', JSON.stringify(result, null, 2));

    const statusCode = result.code || result.recode;

    if (statusCode === 200) {
      console.log('✅ 邮箱修改成功');
      return { success: true, data: result.data, message: result.message || '邮箱修改成功' };
    } else {
      console.error('❌ 邮箱修改失败:', result.message);
      return { success: false, message: result.message || '邮箱修改失败' };
    }
  } catch (error) {
    console.error('网络请求失败:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/**
 * 发送修改邮箱验证码
 * @param {Object} data - 邮箱数据
 * @param {string} data.newEmail - 新邮箱
 * @returns {Promise<Object>} 发送结果
 */
export const sendChangeEmailCode = async (data) => {
  try {
    const token = localStorage.getItem('token');

    console.log('发送修改邮箱验证码请求:', { newEmail: data.newEmail });

    const response = await fetch(`${ACCOUNT_MAIL_API.SEND_CHANGE_EMAIL_CODE}?newEmail=${encodeURIComponent(data.newEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();
    console.log('发送修改邮箱验证码响应:', JSON.stringify(result, null, 2));

    const statusCode = result.code || result.recode;

    if (statusCode === 200 || result.data === true) {
      console.log('✅ 修改邮箱验证码发送成功');
      return { success: true, message: '验证码已发送到新邮箱' };
    } else {
      console.error('❌ 修改邮箱验证码发送失败:', result.message);
      return { success: false, message: result.message || '验证码发送失败' };
    }
  } catch (error) {
    console.error('网络请求失败:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};
