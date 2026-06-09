/**
 * API 配置文件
 * 统一管理后端接口的基础 URL 和其他配置
 */

// 后端 API 基础 URL
export const API_BASE_URL = 'https://pix-version-api.playereg.top/';
// export const API_BASE_URL = 'http://127.0.0.1:9090/';

// 头像获取接口
export const AVATAR_API = `${API_BASE_URL}api/image/avatar/get`;

// 头像上传接口
export const AVATAR_UPLOAD_API = `${API_BASE_URL}api/image/avatar/upload`;

// 头像恢复接口
export const AVATAR_RESET_DEFAULT_API = `${API_BASE_URL}api/image/avatar/reset-default`;

// 同步 Bilibili 头像接口
export const AVATAR_SYNC_BILIBILI_API = `${API_BASE_URL}api/image/avatar/sync-bilibili`;

// 用户认证相关接口
export const AUTH_API = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
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
  PROFILE_INFO: `${API_BASE_URL}/api/user/profile/info`, // 根据 userId 或 uuid 查询用户信息（公开接口）
  NICKNAME_CHANGE: `${API_BASE_URL}/api/user/profile/nickname/change`,
};

// 用户拓展数据相关接口
export const USER_DATA_API = {
  LIST: `${API_BASE_URL}/api/user/data/list`,      // 查询用户所有拓展数据（公开接口）
  ADD: `${API_BASE_URL}/api/user/data/add`,         // 新增用户拓展数据（需登录）
  DELETE: `${API_BASE_URL}/api/user/data/delete`,   // 删除用户拓展数据（需登录）
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
  DETAIL: `${API_BASE_URL}/api/work/detail`,  // 查询单个作品（公开接口）
  LAST_ID: `${API_BASE_URL}/api/work/last-id`, // 获取最大作品 ID
  RANDOM: `${API_BASE_URL}/api/work/random`,   // 随机获取一个作品
};

// 评论相关接口
export const COMMENT_API = {
  LIST: `${API_BASE_URL}/api/comment/list`,    // 查询评论列表（公开接口，路径后拼 workId）
  ADD: `${API_BASE_URL}/api/comment/add`,       // 新增评论（需登录）
  DELETE: `${API_BASE_URL}/api/comment/delete`, // 删除评论（需登录，仅可删除自己的评论）
};

// 作品图片获取接口
export const WORK_IMAGE_API = `${API_BASE_URL}/api/image/work/get`;

// 点赞相关接口
export const LIKE_API = {
  TOGGLE: `${API_BASE_URL}/api/like/toggle`,   // POST，路径后拼 /workId
  STATUS: `${API_BASE_URL}/api/like/status`,   // GET，路径后拼 /workId
  USER_LIKED: `${API_BASE_URL}/api/like/user-liked`, // GET，路径后拼 /userId/current/size
};

// 收藏相关接口
export const STAR_API = {
  TOGGLE: `${API_BASE_URL}/api/star/toggle`,   // POST，路径后拼 /workId
  STATUS: `${API_BASE_URL}/api/star/status`,   // GET，路径后拼 /workId
  USER_STARRED: `${API_BASE_URL}/api/star/user-starred`, // GET，路径后拼 /userId/current/size
};

// 作品系列相关接口
export const SERIES_API = {
  PAGE: `${API_BASE_URL}/api/work/series/page`, // GET，路径后拼 /userId/current/size
  DETAIL: `${API_BASE_URL}/api/work/series/detail`, // GET，路径后拼 /seriesId
};

// 账号管理相关接口
export const ACCOUNT_API = {
  DELETE_ACCOUNT: `${API_BASE_URL}/api/auth/delete-account`,           // 删除账号
  CHANGE_PASSWORD: `${API_BASE_URL}/api/user/password/change`,         // 修改密码
  CHANGE_EMAIL: `${API_BASE_URL}/api/user/profile/email/change`,       // 修改邮箱
};

// 账号管理相关邮件验证码接口
export const ACCOUNT_MAIL_API = {
  SEND_DELETE_ACCOUNT_CODE: `${API_BASE_URL}/api/mail/send-delete-account-code`,     // 发送注销账号验证码
  SEND_CHANGE_PASSWORD_CODE: `${API_BASE_URL}/api/mail/send-change-password-code`,   // 发送修改密码验证码
  SEND_CHANGE_EMAIL_CODE: `${API_BASE_URL}/api/mail/send-change-email-code`,         // 发送修改邮箱验证码
};

// 历史记录相关接口
export const HISTORY_API = {
  PAGE: `${API_BASE_URL}/api/history`,         // GET，路径后拼 /current/size
  DELETE: `${API_BASE_URL}/api/history/delete`, // POST，批量删除历史记录
};

// 获取作品图片完整 URL
export const getWorkImageUrl = (filePath) => {
  if (!filePath) {
    return '';
  }
  return `${WORK_IMAGE_API}?filePath=${encodeURIComponent(filePath)}`;
};
