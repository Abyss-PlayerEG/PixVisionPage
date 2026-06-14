/**
 * 全局 401 拦截器
 * 当后端返回 401 时，自动清理前端 token 并跳转首页
 * 同时监听 localStorage 变化，实现跨标签页登出同步
 */

let isHandling401 = false

const handle401 = () => {
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

/**
 * 初始化 401 拦截器
 */
export const initAuthInterceptor = () => {
  // 监听 localStorage 变化（跨标签页同步）
  window.addEventListener('storage', (e) => {
    if (e.key === 'token' && !e.newValue) {
      handle401()
    }
  })

  // 重写全局 fetch，自动拦截 HTTP 401
  const originalFetch = window.fetch
  window.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args)
    
    if (response.status === 401) {
      handle401()
    }
    
    return response
  }
}
