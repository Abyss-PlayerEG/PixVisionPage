/**
 * 滑动指示器 Composable
 * 封装指示器的位置计算和更新逻辑
 * 
 * @module useIndicatorSlider
 */

import { ref, nextTick } from 'vue'

/**
 * 创建滑动指示器控制器
 * @param {Object} options - 配置选项
 * @param {string} options.defaultLeft - 默认 left 值，默认 '4px'
 * @param {string} options.defaultWidth - 默认 width 值，默认 '0px'
 * @returns 指示器相关的状态和方法
 */
export const useIndicatorSlider = (options = {}) => {
  const {
    defaultLeft = '4px',
    defaultWidth = '0px'
  } = options

  // 容器 ref
  const containerRef = ref(null)
  
  // 指示器样式
  const indicatorStyle = ref({
    left: defaultLeft,
    width: defaultWidth
  })

  /**
   * 更新指示器位置
   * @param {string} activeSelector - 当前激活元素的 CSS 选择器，例如 '.cp-filter-tab.active'
   */
  const update = (activeSelector) => {
    nextTick(() => {
      if (!containerRef.value) return
      
      const activeBtn = containerRef.value.querySelector(activeSelector)
      if (activeBtn) {
        const containerRect = containerRef.value.getBoundingClientRect()
        const btnRect = activeBtn.getBoundingClientRect()
        indicatorStyle.value = {
          left: `${btnRect.left - containerRect.left}px`,
          width: `${btnRect.width}px`
        }
      }
    })
  }

  /**
   * 重置指示器到默认位置
   */
  const reset = () => {
    indicatorStyle.value = {
      left: defaultLeft,
      width: defaultWidth
    }
  }

  return {
    containerRef,
    indicatorStyle,
    update,
    reset
  }
}
