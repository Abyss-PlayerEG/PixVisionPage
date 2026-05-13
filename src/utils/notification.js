import { createApp, h } from 'vue'
import NotificationToast from '../components/NotificationToast.vue'

/**
 * 通知弹窗工具函数
 * 提供便捷的弹窗调用方式
 */

/**
 * 显示通知弹窗
 * @param {Object} options - 配置选项
 * @param {string} options.message - 消息内容（必填）
 * @param {string} options.title - 标题（可选，默认根据类型设置）
 * @param {string} options.type - 类型：info, success, warning, error（可选，默认 info）
 * @param {number} options.duration - 显示时长（毫秒）（可选，默认 3000）
 */
export const showToast = (options) => {
  const {
    message,
    title,
    type = 'info',
    duration = 3000
  } = options

  // 根据类型设置默认标题
  const defaultTitles = {
    info: '提示',
    success: '成功',
    warning: '警告',
    error: '错误'
  }

  const toastTitle = title || defaultTitles[type]

  // 创建容器元素
  const container = document.createElement('div')
  document.body.appendChild(container)

  // 创建 Vue 应用实例
  const app = createApp({
    render() {
      return h(NotificationToast, {
        message,
        title: toastTitle,
        type,
        duration,
        show: true,
        onClose: () => {
          // 清理 DOM
          setTimeout(() => {
            app.unmount()
            document.body.removeChild(container)
          }, 100)
        }
      })
    }
  })

  // 挂载应用
  app.mount(container)
}

/**
 * 快捷方法：显示信息提示
 */
export const showInfo = (message, title = '提示', duration = 3000) => {
  return showToast({ message, title, type: 'info', duration })
}

/**
 * 快捷方法：显示成功提示
 */
export const showSuccess = (message, title = '成功', duration = 3000) => {
  return showToast({ message, title, type: 'success', duration })
}

/**
 * 快捷方法：显示警告提示
 */
export const showWarning = (message, title = '警告', duration = 3000) => {
  return showToast({ message, title, type: 'warning', duration })
}

/**
 * 快捷方法：显示错误提示
 */
export const showError = (message, title = '错误', duration = 3000) => {
  return showToast({ message, title, type: 'error', duration })
}

// 导出默认对象，方便使用
export default {
  showToast,
  showInfo,
  showSuccess,
  showWarning,
  showError
}