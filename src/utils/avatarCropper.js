import { createApp, h } from 'vue'
import AvatarCropper from '../components/AvatarCropper.vue'

/**
 * 显示头像裁剪弹窗
 * @param {Object} [options]
 * @param {string} [options.title='裁剪头像'] - 弹窗标题
 * @param {number} [options.outputSize=512] - 输出图片尺寸（像素）
 * @param {number} [options.previewSize=300] - 裁剪区预览尺寸（像素）
 * @returns {Promise<{ blob: Blob|null, file: File|null, dataUrl: string|null, canceled: boolean }>}
 *
 * @example
 * const result = await showAvatarCropper({ title: '修改头像' })
 * if (!result.canceled && result.blob) {
 *   // 使用 result.blob 上传到后端
 *   const formData = new FormData()
 *   formData.append('file', result.blob, 'avatar.png')
 *   await fetch('/api/user/avatar/upload', { method: 'POST', body: formData })
 * }
 */
export const showAvatarCropper = (options = {}) => {
  const {
    title = '裁剪头像',
    outputSize = 512,
    previewSize = 300,
  } = options

  return new Promise((resolve) => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    let settled = false
    const cleanup = () => {
      if (settled) return
      settled = true
      setTimeout(() => {
        app.unmount()
        if (document.body.contains(container)) {
          document.body.removeChild(container)
        }
      }, 300)
    }

    const app = createApp({
      data() {
        return { show: true }
      },
      render() {
        return h(AvatarCropper, {
          title,
          outputSize,
          previewSize,
          show: this.show,
          'onUpdate:show': (val) => { this.show = val },
          onConfirm: (result) => {
            resolve({
              blob: result.blob,
              file: result.file,
              dataUrl: result.dataUrl,
              canceled: false,
            })
            cleanup()
          },
          onCancel: () => {
            resolve({ blob: null, file: null, dataUrl: null, canceled: true })
            cleanup()
          },
        })
      },
    })

    app.mount(container)
  })
}

export default { showAvatarCropper }
