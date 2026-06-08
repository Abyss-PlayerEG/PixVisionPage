/**
 * 认证工具函数
 * 用于检查业务响应中的 401 状态码
 */

let isHandling401 = false

/**
 * 检查业务码是否为 401
 * 有些后端返回 HTTP 200，但业务码是 401（表示 token 失效）
 * @param {Object} result - 解析后的 JSON 响应
 * @returns {boolean} 是否是 401
 */
export const isTokenExpired = (result) => {
  const statusCode = result.code || result.recode
  return statusCode === 401
}

/**
 * 处理 token 失效
 * 清理本地存储并跳转到首页
 */
export const handleTokenExpired = () => {
  if (isHandling401) return
  isHandling401 = true
  
  console.warn('[Auth] Token 已失效，清理登录状态')
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  
  // 显示提示后跳转首页
  setTimeout(() => {
    window.location.href = '/'
    isHandling401 = false
  }, 1500)
}
