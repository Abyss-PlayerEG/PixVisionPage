/**
 * LoginView 页面联调代码
 * 包含登录、注册、忘记密码等功能的 API 调用和业务逻辑
 * 
 * @module loginViewApi
 */

import { AUTH_API, MAIL_API, PASSWORD_API } from '../config/api';

/**
 * ============================================
 * 登录功能
 * ============================================
 */

/**
 * 用户登录
 * @param {Object} loginData - 登录数据
 * @param {string} loginData.usernameOrEmail - 用户名或邮箱
 * @param {string} loginData.password - 密码
 * @param {string} loginData.vCode - 验证码
 * @returns {Promise<Object>} 登录结果
 */
export const handleLogin = async (loginData) => {
  try {
    // 构建表单数据
    const formData = new URLSearchParams();
    formData.append('usernameOrEmail', loginData.usernameOrEmail);
    formData.append('password', loginData.password);
    formData.append('vCode', loginData.vCode.toUpperCase()); // 验证码转为大写

    console.log('发送登录请求数据:', {
      usernameOrEmail: loginData.usernameOrEmail,
      password: '(已加密)',
      vCode: loginData.vCode.toUpperCase(),
    });

    // 调用后端登录接口
    const response = await fetch(AUTH_API.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const result = await response.json();

    // 打印后端返回的响应
    console.log('登录接口响应:', JSON.stringify(result, null, 2));

    // 根据业务状态码处理（兼容 code 和 recode 字段）
    const statusCode = result.code || result.recode;
    
    if (statusCode === 200 && result.data) {
      console.log('✅ 登录成功');
      console.log('完整的 result.data:', JSON.stringify(result.data, null, 2));

      // 保存 Token 到 localStorage
      if (result.data.token) {
        localStorage.setItem('token', result.data.token);
        console.log('Token 已保存:', result.data.token);
      } else {
        console.warn('⚠️ result.data 中没有 token 字段');
      }

      // 保存用户信息到 localStorage
      // 后端返回的用户信息直接在 result.data 中，需要排除 token 字段
      const userInfo = { ...result.data };
      delete userInfo.token; // 移除 token，只保存用户信息
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      console.log('用户信息已保存:', userInfo);

      return { success: true, data: result.data };
    } else {
      console.error('❌ 登录失败:', result.message);
      return { success: false, message: result.message || '登录失败，请检查用户名、密码和验证码' };
    }
  } catch (error) {
    console.error('网络请求失败:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/**
 * ============================================
 * 注册功能
 * ============================================
 */

/**
 * 用户注册
 * @param {Object} registerData - 注册数据
 * @param {string} registerData.username - 用户名
 * @param {string} registerData.password - 密码
 * @param {string} registerData.confirmPassword - 确认密码
 * @param {string} registerData.email - 邮箱
 * @param {string} registerData.vCode - 验证码
 * @param {string} [registerData.nickname] - 昵称（可选）
 * @returns {Promise<Object>} 注册结果
 */
export const handleRegister = async (registerData) => {
  try {
    // 构建表单数据
    const formData = new URLSearchParams();
    formData.append('username', registerData.username);
    formData.append('password', registerData.password);
    formData.append('confirmPassword', registerData.confirmPassword);

    // 昵称可选，如果为空则不传（后端会自动生成）
    if (registerData.nickname && registerData.nickname.trim()) {
      formData.append('nickname', registerData.nickname);
    }

    formData.append('email', registerData.email);
    formData.append('vCode', registerData.vCode.toUpperCase()); // 验证码转为大写

    // 打印即将发送的数据（调试用）
    console.log('发送注册数据:', {
      username: registerData.username,
      nickname: registerData.nickname || '(未填写，后端将自动生成)',
      email: registerData.email,
    });

    // 调用后端注册接口
    const response = await fetch(AUTH_API.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const result = await response.json();

    // 打印后端返回的JSON
    console.log('注册接口响应:', JSON.stringify(result, null, 2));

    // 根据业务状态码处理（兼容 code 和 recode 字段）
    const statusCode = result.code || result.recode;
    
    if (statusCode === 200) {
      console.log('✅ 注册成功');
      return { 
        success: true, 
        data: result.data,
        registeredUsername: registerData.username,
        registeredPassword: registerData.password
      };
    } else {
      console.error('❌ 注册失败:', result.message);
      return { success: false, message: result.message };
    }
  } catch (error) {
    console.error('网络请求失败:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/**
 * ============================================
 * 忘记密码功能
 * ============================================
 */

/**
 * 忘记密码 - 重置密码
 * @param {Object} forgotPasswordData - 忘记密码数据
 * @param {string} forgotPasswordData.usernameOrEmail - 用户名或邮箱
 * @param {string} forgotPasswordData.newPassword - 新密码
 * @param {string} forgotPasswordData.confirmPassword - 确认新密码
 * @param {string} forgotPasswordData.vCode - 验证码
 * @returns {Promise<Object>} 重置结果
 */
export const handleForgotPassword = async (forgotPasswordData) => {
  try {
    // 构建请求参数
    const params = new URLSearchParams();
    params.append('usernameOrEmail', forgotPasswordData.usernameOrEmail);
    params.append('newPassword', forgotPasswordData.newPassword);
    params.append('confirmPassword', forgotPasswordData.confirmPassword);
    params.append('vCode', forgotPasswordData.vCode.toUpperCase()); // 验证码转为大写

    console.log('发送忘记密码请求数据:', {
      usernameOrEmail: forgotPasswordData.usernameOrEmail,
      newPassword: '(已加密)',
      confirmPassword: '(已加密)',
      vCode: forgotPasswordData.vCode.toUpperCase(),
    });

    // 调用后端忘记密码接口
    const response = await fetch(PASSWORD_API.FORGOT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const result = await response.json();

    // 打印后端返回的响应
    console.log('忘记密码接口响应:', JSON.stringify(result, null, 2));

    // 根据业务状态码处理（兼容 code 和 recode 字段）
    const statusCode = result.code || result.recode;
    
    if (statusCode === 200) {
      console.log('✅ 密码重置成功');
      return { success: true, data: result.data };
    } else {
      console.error('❌ 密码重置失败:', result.message);
      return { success: false, message: result.message };
    }
  } catch (error) {
    console.error('网络请求失败:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};

/**
 * ============================================
 * 验证码发送功能
 * ============================================
 */

/**
 * 通用验证码发送函数
 * @param {Object} options - 配置选项
 * @param {string} options.apiUrl - API 地址
 * @param {Object} options.params - 请求参数
 * @param {Function} [options.validateFn] - 验证函数（可选）
 * @param {string} [options.fieldName] - 要验证的字段名（可选）
 * @param {boolean} [options.needCountdown=false] - 是否需要倒计时
 * @param {Function} [options.countdownFn] - 倒计时函数
 * @param {boolean} [options.showSuccessAlert=true] - 是否显示成功提示
 * @param {string} [options.successMessage="验证码已发送到您的邮箱，请查收"] - 成功提示消息
 * @param {string} [options.errorMessagePrefix="验证码发送失败"] - 错误提示前缀
 * @returns {Promise<Object>} 发送结果
 */
export const sendVerificationCode = async (options) => {
  const {
    apiUrl,
    params,
    validateFn,
    fieldName,
    needCountdown = false,
    countdownFn = null,
    showSuccessAlert = true,
    successMessage = "验证码已发送到您的邮箱，请查收",
    errorMessagePrefix = "验证码发送失败"
  } = options;

  // 验证字段（如果提供了验证函数）
  if (validateFn && fieldName) {
    const isValid = validateFn(fieldName);
    if (!isValid) {
      return { success: false, message: '验证失败' };
    }
  }

  console.log('发送验证码请求数据:', params);

  try {
    // 构建 URL 参数
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    // 调用后端接口发送验证码
    const response = await fetch(`${apiUrl}?${queryString}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    // 打印后端返回的响应
    console.log('发送验证码响应:', JSON.stringify(result, null, 2));

    const statusCode = result.code || result.recode;
    
    if (statusCode === 200 || result.data === true) {
      console.log("✅ 验证码发送成功");
      
      // 如果需要倒计时
      if (needCountdown && countdownFn) {
        countdownFn();
      } else if (showSuccessAlert) {
        alert(successMessage);
      }
      
      return { success: true, message: successMessage };
    } else {
      console.error(`❌ ${errorMessagePrefix}:`, result.message);
      return { success: false, message: result.message || errorMessagePrefix };
    }
  } catch (error) {
    console.error("发送验证码请求失败:", error);
    return { success: false, message: "网络错误，请稍后重试" };
  }
};

/**
 * 发送注册验证码
 * @param {Object} data - 注册数据
 * @param {string} data.email - 邮箱
 * @param {string} data.username - 用户名
 * @param {Function} [validateFn] - 验证函数（可选）
 * @returns {Promise<Object>} 发送结果
 */
export const sendRegisterCode = (data, validateFn) => {
  return sendVerificationCode({
    apiUrl: MAIL_API.SEND_REGISTER_CODE,
    params: {
      email: data.email,
      username: data.username,
    },
    validateFn,
    fieldName: 'email',
    needCountdown: true,
    showSuccessAlert: false,
  });
};

/**
 * 发送登录验证码
 * @param {Object} data - 登录数据
 * @param {string} data.usernameOrEmail - 用户名或邮箱
 * @param {Function} [validateFn] - 验证函数（可选）
 * @returns {Promise<Object>} 发送结果
 */
export const sendLoginCode = (data, validateFn) => {
  return sendVerificationCode({
    apiUrl: MAIL_API.SEND_LOGIN_CODE,
    params: {
      usernameOrEmail: data.usernameOrEmail,
    },
    validateFn,
    fieldName: 'usernameOrEmail',
    needCountdown: true,
    showSuccessAlert: false,
  });
};

/**
 * 发送忘记密码验证码
 * @param {Object} data - 忘记密码数据
 * @param {string} data.usernameOrEmail - 用户名或邮箱
 * @param {Function} [validateFn] - 验证函数（可选）
 * @returns {Promise<Object>} 发送结果
 */
export const sendForgotPasswordCode = (data, validateFn) => {
  return sendVerificationCode({
    apiUrl: MAIL_API.SEND_FORGET_PASSWORD_CODE,
    params: {
      usernameOrEmail: data.usernameOrEmail,
    },
    validateFn,
    fieldName: 'usernameOrEmail',
    needCountdown: true,
    showSuccessAlert: false,
  });
};

/**
 * ============================================
 * 工具函数
 * ============================================
 */

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
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
export const isLoggedIn = () => {
  return !!localStorage.getItem('token');
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
