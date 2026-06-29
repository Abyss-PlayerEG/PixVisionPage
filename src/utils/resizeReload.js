/**
 * 窗口大小变化自动刷新
 * 解决部分响应式布局在窗口大小变化时需要重新渲染的问题
 * 开发环境不刷新，避免影响开发体验
 */

/**
 * 初始化窗口大小变化自动刷新
 */
export const initResizeReload = () => {
  if (import.meta.env.DEV) {
    console.log('[Resize] 开发环境，跳过窗口大小变化自动刷新')
    return
  }

  let resizeTimer = null
  let enabled = false

  const onResize = () => {
    if (!enabled) return
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      console.log('[Resize] 窗口大小变化，自动刷新页面')
      window.location.reload()
    }, 500)
  }

  // 页面所有资源加载完成后，再等 3 秒才启用
  // 避免字体加载、动态内容渲染等触发的初始 resize 导致无限刷新
  const enableAfterSettle = () => {
    setTimeout(() => {
      enabled = true
      window.addEventListener('resize', onResize)
      console.log('[Resize] 已启用窗口大小变化自动刷新')
    }, 3000)
  }

  if (document.readyState === 'complete') {
    enableAfterSettle()
  } else {
    window.addEventListener('load', enableAfterSettle, { once: true })
  }
}
