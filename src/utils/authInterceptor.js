/**
 * 全局 401 拦截器（已禁用自动清理）
 * 不再自动清除 token 或跳转路由，避免误伤已登录用户
 */

export const initAuthInterceptor = () => {
  // 自动清理机制已移除
}
