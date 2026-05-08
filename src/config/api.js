/**
 * API 配置文件
 * 统一管理后端接口的基础 URL 和其他配置
 */

// 后端 API 基础 URL
export const API_BASE_URL = 'http://172.18.8.66:9090';

// 头像获取接口
export const AVATAR_API = `${API_BASE_URL}/api/image/avatar/get`;

// 用户认证相关接口
export const AUTH_API = {
  LOGIN: `${API_BASE_URL}/api/user/auth/login`,
  REGISTER: `${API_BASE_URL}/api/user/auth/register`,
};

// 邮件验证码相关接口
export const MAIL_API = {
  SEND_REGISTER_CODE: `${API_BASE_URL}/api/mail/send-register-code`,
  SEND_LOGIN_CODE: `${API_BASE_URL}/api/mail/send-login-code`,
  SEND_FORGET_PASSWORD_CODE: `${API_BASE_URL}/api/mail/send-forget-password-code`,
};

// 密码管理相关接口
export const PASSWORD_API = {
  FORGOT: `${API_BASE_URL}/api/user/password/forgot`,
};

// 获取完整的头像 URL
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) {
    // 默认头像
    return `${AVATAR_API}?filePath=default/1.png`;
  }
  return `${AVATAR_API}?filePath=${encodeURIComponent(avatarPath)}`;
};
