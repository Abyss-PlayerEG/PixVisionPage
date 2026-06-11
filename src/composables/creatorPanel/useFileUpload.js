/**
 * 文件上传 Composable
 * 封装文件上传的拖拽、验证、预览逻辑
 * 
 * @module useFileUpload
 */

import { ref } from 'vue'
import { showError } from '@/utils/notification'

/**
 * 创建文件上传控制器
 * @param {Object} options - 配置选项
 * @param {number} options.maxSize - 最大文件大小（MB），默认 32
 * @param {string[]} options.allowedTypes - 允许的文件类型，默认 ['image/jpeg', 'image/png']
 * @param {Function} options.onFileSet - 文件设置后的回调
 * @returns 文件上传相关的状态和方法
 */
export const useFileUpload = (options = {}) => {
  const {
    maxSize = 32,
    allowedTypes = ['image/jpeg', 'image/png'],
    onFileSet
  } = options

  // 拖拽状态
  const isDragOver = ref(false)
  const dragCounter = ref(0)  // 处理嵌套元素触发的多次 enter/leave

  // 文件状态
  const file = ref(null)
  const preview = ref(null)

  /**
   * 验证文件
   * @param {File} newFile - 要验证的文件
   * @returns {boolean} 是否通过验证
   */
  const validateFile = (newFile) => {
    if (!newFile) return false

    // 验证格式
    if (!allowedTypes.includes(newFile.type)) {
      showError('仅支持 JPG/JPEG/PNG 格式')
      return false
    }

    // 验证大小
    if (newFile.size > maxSize * 1024 * 1024) {
      showError(`文件大小不能超过 ${maxSize}MB`)
      return false
    }

    return true
  }

  /**
   * 设置文件并生成预览
   * @param {File} newFile - 要设置的文件
   * @returns {boolean} 是否设置成功
   */
  const setFile = (newFile) => {
    if (!validateFile(newFile)) return false

    file.value = newFile
    
    // 生成预览
    const reader = new FileReader()
    reader.onload = (e) => {
      preview.value = e.target.result
    }
    reader.readAsDataURL(newFile)

    if (onFileSet) onFileSet(newFile)
    return true
  }

  /**
   * 设置预览 URL（用于编辑时显示原有图片）
   * @param {string} url - 图片 URL
   */
  const setPreviewUrl = (url) => {
    preview.value = url
  }

  /**
   * 移除文件
   */
  const removeFile = () => {
    file.value = null
    preview.value = null
  }

  // ── 拖拽事件处理 ──

  const onDragEnter = (e) => {
    e.preventDefault()
    dragCounter.value++
    if (dragCounter.value === 1) isDragOver.value = true
  }

  const onDragOver = (e) => {
    e.preventDefault()
  }

  const onDragLeave = (e) => {
    e.preventDefault()
    dragCounter.value--
    if (dragCounter.value <= 0) {
      dragCounter.value = 0
      isDragOver.value = false
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    isDragOver.value = false
    dragCounter.value = 0
    const droppedFile = e.dataTransfer?.files?.[0]
    if (droppedFile) setFile(droppedFile)
  }

  return {
    // 状态
    isDragOver,
    file,
    preview,
    // 方法
    setFile,
    setPreviewUrl,
    removeFile,
    // 拖拽事件
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop
  }
}
