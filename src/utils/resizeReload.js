/**
 * 窗口大小变化自动刷新
 * 解决部分响应式布局在窗口大小变化时需要重新渲染的问题
 * 开发环境不刷新，避免影响开发体验
 */

/**
 * 初始化窗口大小变化自动刷新
 */
export const initResizeReload = () => {
  // 仅生产环境启用
  if (import.meta.env.DEV) {
    console.log('[Resize] 开发环境，跳过窗口大小变化自动刷新')
    return
  }

  let resizeTimer = null
  
  window.addEventListener('resize', () => {
    if (resizeTimer) clearTimeout(resizeTimer)
    
    resizeTimer = setTimeout(() => {
      console.log('[Resize] 窗口大小变化，自动刷新页面')
      window.location.reload()
    }, 500)
  })
}
