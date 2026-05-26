import { createApp, h } from 'vue'
import AvatarCropper from '../components/AvatarCropper.vue'

/**
 * 显示头像裁剪弹窗（标题自动切换：上传阶段「上传你的头像」→ 裁剪阶段「修改头像大小」）
 * @param {Object} [options]
 * @param {number} [options.outputSize=1024] - 输出图片尺寸（像素）
 * @param {number} [options.previewSize=300] - 裁剪区预览尺寸（像素）
 * @returns {Promise<{ blob: Blob|null, file: File|null, dataUrl: string|null, canceled: boolean }>}
 *
 * @example
 * const result = await showAvatarCropper()
 * if (!result.canceled && result.blob) {
 *   const formData = new FormData()
 *   formData.append('file', result.blob, 'avatar.png')
 *   await fetch('/api/user/avatar/upload', { method: 'POST', body: formData })
 * }
 */
export const showAvatarCropper = (options = {}) => {
  const {
    outputSize = 1024,
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
