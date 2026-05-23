import { createApp, h } from 'vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

/**
 * 显示居中确认弹窗
 * @param {Object} options
 * @param {string} options.message - 消息内容（必填）
 * @param {string} [options.title='确认'] - 标题
 * @param {string} [options.yesText='是'] - 确认按钮文字
 * @param {string} [options.noText='否'] - 取消按钮文字
 * @param {string} [options.type='info'] - 场景类型: 'info' 正常消息 | 'warning' 警告 | 'danger' 严重
 * @returns {Promise<boolean>} true=确认, false=取消
 *
 * @example
 * const confirmed = await showConfirm({ message: '确定要删除吗？', type: 'danger' })
 * if (confirmed) { ... }
 */
export const showConfirm = (options = {}) => {
  const {
    message,
    title = '确认',
    yesText = '是',
    noText = '否',
    type = 'info',
  } = options

  if (!message) {
    console.error('[ConfirmDialog] message 参数为必填项')
    return Promise.resolve(false)
  }

  return new Promise((resolve) => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    let cleanupDone = false
    const cleanup = () => {
      if (cleanupDone) return
      cleanupDone = true
      setTimeout(() => {
        app.unmount()
        if (document.body.contains(container)) {
          document.body.removeChild(container)
        }
      }, 350)
    }

    const app = createApp({
      data() {
        return { show: true }
      },
      render() {
        return h(ConfirmDialog, {
          message,
          title,
          yesText,
          noText,
          type,
          show: this.show,
          'onUpdate:show': (val) => { this.show = val },
          onConfirm: () => {
            resolve(true)
            cleanup()
          },
          onCancel: () => {
            resolve(false)
            cleanup()
          },
        })
      },
    })

    app.mount(container)
  })
}

export default { showConfirm }
