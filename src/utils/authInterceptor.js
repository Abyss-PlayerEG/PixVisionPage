/**
 * Token 有效性验证
 * 应用启动时调用一次，过期 token 自动清除
 */

import { API_BASE_URL } from '@/config/api'

export const initAuthInterceptor = () => {
  const token = localStorage.getItem('token')
  if (!token) return

  fetch(`${API_BASE_URL}/api/user/profile/me`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  }).then(res => {
    if (res.status === 401) {
      console.warn('[Auth] Token 已过期，自动清除')
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }).catch(() => {
    // 网络异常不处理，保留 token
  })
}
