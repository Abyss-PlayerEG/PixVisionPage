/**
 * 滚动加载 Composable
 * 封装 IntersectionObserver 无限滚动加载逻辑
 * 
 * @module useScrollLoad
 */

import { ref, nextTick, onUnmounted } from 'vue'

/**
 * 创建滚动加载控制器
 * @param {Object} options - 配置选项
 * @param {Function} options.loadMore - 加载更多的回调函数
 * @param {Function} options.hasMore - 判断是否还有更多数据的函数
 * @param {Function} options.isLoading - 判断是否正在加载的函数
 * @param {number} options.rootMargin - 提前加载的边距，默认 200px
 * @returns 滚动加载相关的状态和方法
 */
export const useScrollLoad = (options = {}) => {
  const {
    loadMore,
    hasMore,
    isLoading,
    rootMargin = 200
  } = options

  // 触发元素 ref
  const triggerRef = ref(null)
  
  // IntersectionObserver 实例
  let observer = null

  /**
   * 初始化滚动观察器
   */
  const init = () => {
    // 先断开旧的
    destroy()

    nextTick(() => {
      if (triggerRef.value) {
        observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting && hasMore() && !isLoading()) {
              loadMore()
            }
          },
          { rootMargin: `${rootMargin}px` }
        )
        observer.observe(triggerRef.value)
        console.log('🔄 滚动加载观察器已初始化')
      }
    })
  }

  /**
   * 销毁滚动观察器
   */
  const destroy = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  // 组件卸载时自动销毁
  onUnmounted(() => {
    destroy()
  })

  return {
    triggerRef,
    init,
    destroy
  }
}
