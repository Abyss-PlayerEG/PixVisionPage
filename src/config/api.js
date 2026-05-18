/**
 * API 配置文件
 * 统一管理后端接口的基础 URL 和其他配置
 */

// 后端 API 基础 URL
export const API_BASE_URL = 'http://127.0.0.1:9090';

// 头像获取接口
export const AVATAR_API = `${API_BASE_URL}/api/image/avatar/get`;

// 用户认证相关接口
export const AUTH_API = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
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

// 用户信息相关接口
export const USER_API = {
  PROFILE_ME: `${API_BASE_URL}/api/user/profile/me`,
};

// 获取完整的头像 URL
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) {
    // 默认头像
    return `${AVATAR_API}?filePath=default/1.png`;
  }
  return `${AVATAR_API}?filePath=${encodeURIComponent(avatarPath)}`;
};

// 作品相关接口
export const WORK_API = {
  PAGE: `${API_BASE_URL}/api/work/page`,
};

// 作品图片获取接口
export const WORK_IMAGE_API = `${API_BASE_URL}/api/image/work/get`;

// 获取作品图片完整 URL
export const getWorkImageUrl = (filePath) => {
  if (!filePath) {
    return '';
  }
  return `${WORK_IMAGE_API}?filePath=${encodeURIComponent(filePath)}`;
};
