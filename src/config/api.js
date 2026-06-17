/**
 * API 配置文件
 * 统一管理后端接口的基础 URL 和其他配置
 */

// 后端 API 基础 URL
export const API_BASE_URL = 'http://124.221.107.68:1899';
// export const API_BASE_URL = 'http://127.0.0.1:9090';

// 头像获取接口
export const AVATAR_API = `${API_BASE_URL}/api/image/avatar/get`;

// 头像上传接口
export const AVATAR_UPLOAD_API = `${API_BASE_URL}/api/image/avatar/upload`;

// 头像恢复接口
export const AVATAR_RESET_DEFAULT_API = `${API_BASE_URL}/api/image/avatar/reset-default`;

// 同步 Bilibili 头像接口
export const AVATAR_SYNC_BILIBILI_API = `${API_BASE_URL}/api/image/avatar/sync-bilibili`;

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
  PAGE: `${API_BASE_URL}/api/user/profile/page`, // 用户分页查询（公开接口）
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
  MY_WORKS: `${API_BASE_URL}/api/work/my-works`, // 查询自己的作品（需登录），路径后拼 /current/size
  UPDATE: `${API_BASE_URL}/api/work/update`,      // 修改作品（需登录）
  DELETE: `${API_BASE_URL}/api/work/delete`,       // 删除作品（需登录）
};

// 作品上传接口
export const WORK_UPLOAD_API = `${API_BASE_URL}/api/image/work/upload`;

// 创作者作品系列管理接口
export const CREATOR_SERIES_API = {
  ADD: `${API_BASE_URL}/api/work/series/add`,                        // 新增系列
  UPDATE: `${API_BASE_URL}/api/work/series/update`,                   // 更新系列
  DELETE: `${API_BASE_URL}/api/work/series/delete`,                   // 删除系列
  BATCH_ADD_WORKS: `${API_BASE_URL}/api/work/series/batch-add-works`, // 批量添加作品到系列
  BATCH_REMOVE_WORKS: `${API_BASE_URL}/api/work/series/batch-remove-works`, // 批量从系列移除作品
};

// 评论相关接口
export const COMMENT_API = {
  LIST: `${API_BASE_URL}/api/comment/list`,    // 查询评论列表（公开接口，路径后拼 workId）
  ADD: `${API_BASE_URL}/api/comment/add`,       // 新增评论（需登录）
  DELETE: `${API_BASE_URL}/api/comment/delete`, // 删除评论（需登录，仅可删除自己的评论）
};

// 作品图片获取接口
export const WORK_IMAGE_API = `${API_BASE_URL}/api/image/work/get`;

// 管理员查看作品图片接口（可查看未通过审核的图片）
export const WORK_IMAGE_ADMIN_API = `${API_BASE_URL}/api/image/work/admin-view`;

// 管理员查看头像接口（可查看未通过审核的头像）
export const AVATAR_ADMIN_API = `${API_BASE_URL}/api/image/avatar/admin-view`;

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
  ...CREATOR_SERIES_API, // 展开创作者系列管理接口
};

// 关注相关接口
export const FOLLOW_API = {
  TOGGLE: `${API_BASE_URL}/api/follow/toggle`, // POST，路径后拼 /userId
  STATUS: `${API_BASE_URL}/api/follow/status`, // GET，路径后拼 /userId
  FOLLOWERS: `${API_BASE_URL}/api/follow/followers`, // GET，路径后拼 /userId/current/size
  FOLLOWING: `${API_BASE_URL}/api/follow/following`, // GET，路径后拼 /userId/current/size
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

// 权限变更相关接口
export const ROLE_API = {
  APPLY: `${API_BASE_URL}/api/user/profile/role/apply`,           // 申请权限变更
  SEND_CODE: `${API_BASE_URL}/api/mail/send-role-change-code`,    // 发送权限变更验证码
};

// 历史记录相关接口
export const HISTORY_API = {
  PAGE: `${API_BASE_URL}/api/history`,         // GET，路径后拼 /current/size
  DELETE: `${API_BASE_URL}/api/history/delete`, // POST，批量删除历史记录
};

// 搜索相关接口
export const SEARCH_API = {
  // 作品搜索（公开接口）
  // GET /api/work/page/{current}/{size}?workTitle=xxx&userId=xxx&seriesId=xxx&isOriginal=true/false
  WORK_PAGE: (current, size) => `${API_BASE_URL}/api/work/page/${current}/${size}`,
  
  // 合集搜索（公开接口）
  // GET /api/work/series/page/{userId}/{current}/{size}?keyword=xxx
  SERIES_PAGE: (userId, current, size) => `${API_BASE_URL}/api/work/series/page/${userId}/${current}/${size}`,
  
  // 用户搜索（公开接口）
  // GET /api/user/profile/page/{current}/{size}?keyword=xxx
  USER_PAGE: (current, size) => `${API_BASE_URL}/api/user/profile/page/${current}/${size}`,
};

// 消息相关接口
export const MESSAGE_API = {
  UNREAD_COUNT: `${API_BASE_URL}/api/message/unread-count`,
  CONVERSATIONS: `${API_BASE_URL}/api/message/conversations`,
  CHAT: `${API_BASE_URL}/api/message/chat`,
  SEND: `${API_BASE_URL}/api/message/send`,
  READ_CONVERSATION: `${API_BASE_URL}/api/message/read/conversation`,
  READ_ALL: `${API_BASE_URL}/api/message/read-all`,
  RECALL: `${API_BASE_URL}/api/message/recall`,
  DELETE: `${API_BASE_URL}/api/message/delete`,
  BATCH_DELETE: `${API_BASE_URL}/api/message/batch-delete`,
  SYSTEM: `${API_BASE_URL}/api/message/system`,
};

// WebSocket 连接地址
export const WS_URL = `${API_BASE_URL.replace('http', 'ws')}/api/ws/notification`;

// 管理员相关接口
export const ADMIN_API = {
  DASHBOARD: `${API_BASE_URL}/api/admin/dashboard`,
  // 用户管理
  USER_LIST: `${API_BASE_URL}/api/admin/user/page-select`,                          // GET, ?page/size/nickname
  USER_UPDATE: `${API_BASE_URL}/api/admin/user/update/user-role-status`,             // POST, body: userIds[]/newRole/newStatus
  USER_DELETE: `${API_BASE_URL}/api/admin/user/delete`,                              // POST, body: userIds[]
  USER_CREATE: `${API_BASE_URL}/api/admin/user/create`,                              // POST, body: username/password/confirmPassword/nickname/email
  USER_RESET_PWD: `${API_BASE_URL}/api/admin/user/update/password`,                  // POST, body: userIds[]
  USER_INIT_AVATAR: `${API_BASE_URL}/api/admin/user/init-avatar-nickname`,           // POST, body: userIds[]
  USER_REFRESH_CACHE: `${API_BASE_URL}/api/admin/user/refresh-permission-cache`,    // POST, 刷新权限缓存
  // 作品管理
  WORK_LIST: (current, size) => `${API_BASE_URL}/api/admin/works/page/${current}/${size}`, // GET, ?keyword=
  WORK_DELETE: `${API_BASE_URL}/api/admin/works/delete`,                             // POST, body: workIds[]
  WORK_APPROVAL: `${API_BASE_URL}/api/admin/works/update/approval-status`,           // POST, body: workIds[]/approvalStatus
  WORK_TITLE: `${API_BASE_URL}/api/admin/works/update/work-title`,                   // POST, body: workIds[]/workTitle
  // 评论管理
  COMMENT_LIST: (current, size) => `${API_BASE_URL}/api/admin/comments/page/${current}/${size}`, // GET, ?keyword=
  COMMENT_DELETE: `${API_BASE_URL}/api/admin/comments/delete`,                       // POST, body: commentIds[]
  COMMENT_APPROVAL: `${API_BASE_URL}/api/admin/comments/update/approval-status`,     // POST, body: commentIds[]/approvalStatus
  // 合集管理
  SERIES_LIST: (current, size) => `${API_BASE_URL}/api/admin/series/page/${current}/${size}`, // GET, ?keyword=
  SERIES_DELETE: `${API_BASE_URL}/api/admin/series/delete`,                          // POST, body: seriesIds[]/deleteWorks
  SERIES_APPROVAL: `${API_BASE_URL}/api/admin/series/update/approval-status`,        // POST, body: seriesIds[]/approvalStatus
  SERIES_UPDATE: `${API_BASE_URL}/api/admin/series/update/series-info`,              // POST, body: seriesIds[]/seriesName/seriesDescription
  // 审核记录
  AUDIT_RECORDS: (current, size) => `${API_BASE_URL}/api/admin/audit-records/page/${current}/${size}`, // GET
  // 用户数据变更审核
  PENDING_CHANGES: (current, size) => `${API_BASE_URL}/api/admin/user-data-change/pending/${current}/${size}`, // GET
  REVIEW_CHANGES: `${API_BASE_URL}/api/admin/user-data-change/review`,               // POST, body: lockIds[]/approved
  // 操作日志
  LOGS: (current, size) => `${API_BASE_URL}/api/admin/logs/page/${current}/${size}`, // GET
};

// 获取作品图片完整 URL
export const getWorkImageUrl = (filePath) => {
  if (!filePath) {
    return '';
  }
  return `${WORK_IMAGE_API}?filePath=${encodeURIComponent(filePath)}`;
};

// 管理员获取作品图片完整 URL（可查看未通过审核的图片）
export const getAdminWorkImageUrl = (filePath) => {
  if (!filePath) {
    return '';
  }
  return `${WORK_IMAGE_ADMIN_API}?filePath=${encodeURIComponent(filePath)}`;
};

// 管理员获取头像完整 URL（可查看未通过审核的头像）
export const getAdminAvatarUrl = (filePath) => {
  if (!filePath) {
    return `${AVATAR_ADMIN_API}?filePath=default/1.png`;
  }
  return `${AVATAR_ADMIN_API}?filePath=${encodeURIComponent(filePath)}`;
};
