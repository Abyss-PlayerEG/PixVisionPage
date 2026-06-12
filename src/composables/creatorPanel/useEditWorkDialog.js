/**
 * 编辑作品弹窗 Composable
 * 封装编辑作品弹窗的状态管理和业务逻辑
 * 
 * @module useEditWorkDialog
 */

import { ref, reactive, watch, nextTick } from 'vue'
import { showError } from '@/utils/notification'
import { useDialogAnimation } from './useDialogAnimation'
import { useFileUpload } from './useFileUpload'

/**
 * 创建编辑作品弹窗控制器
 * @param {Object} deps - 依赖注入
 * @param {import('vue').Ref} deps.seriesList - 合集列表
 * @param {Function} deps.loadSeries - 加载合集列表
 * @param {Function} deps.handleUpdateWork - 更新作品接口
 * @param {Function} deps.updateEditRadioIndicator - 更新编辑单选指示器
 * @param {Object} deps.radioIndicator - 外部传入的 radio 指示器实例
 * @returns 编辑作品弹窗相关的状态和方法
 */
export const useEditWorkDialog = (deps) => {
  const { seriesList, loadSeries, handleUpdateWork, updateEditRadioIndicator, radioIndicator } = deps

  // 弹窗状态
  const show = ref(false)
  const target = ref(null)
  const submitting = ref(false)

  // 表单数据
  const form = reactive({
    workTitle: '',
    seriesId: 0,
    isOriginal: true,
    outUrl: '',
    file: null,
    imagePreview: '',
  })

  // GSAP 动画 refs
  const overlayRef = ref(null)
  const dialogRef = ref(null)

  // 弹窗动画实例
  const dialogAnim = useDialogAnimation(overlayRef, dialogRef)

  // 文件上传实例
  const editFile = useFileUpload()

  // 文件输入 ref
  const fileInputRef = ref(null)

  // 监听 isOriginal 变化，更新指示器
  watch(() => form.isOriginal, () => {
    if (radioIndicator && radioIndicator.containerRef.value) {
      radioIndicator.update('.cp-radio-btn.active')
    }
  })

  /**
   * 打开编辑弹窗
   * @param {Object} work - 要编辑的作品数据
   */
  const open = (work) => {
    target.value = work
    form.workTitle = work.work_title || ''
    form.seriesId = work.series_id || 0
    form.isOriginal = work.is_original !== false
    form.outUrl = work.out_url || ''
    form.file = null
    form.imagePreview = work.thumbFullUrl || ''
    
    // 重置文件上传模块
    editFile.removeFile()
    
    show.value = true

    // 打开时自动加载合集列表
    if (seriesList.value.length === 0) {
      loadSeries({ reset: true })
    }

    // 使用弹窗动画模块
    dialogAnim.open()

    // 初始化指示器位置（延迟等待弹窗动画完成）
    if (radioIndicator) {
      radioIndicator.init('.cp-radio-btn.active', 350)
    }
    if (updateEditRadioIndicator) {
      setTimeout(() => updateEditRadioIndicator(), 350)
    }
  }

  /**
   * 关闭编辑弹窗
   */
  const close = () => {
    dialogAnim.close(() => {
      show.value = false
      submitting.value = false
    })
  }

  /**
   * 处理文件选择
   * @param {Event} e - 文件选择事件
   */
  const onFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      editFile.setFile(file)
      form.file = editFile.file.value
      form.imagePreview = editFile.preview.value
    }
    e.target.value = ''
  }

  /**
   * 移除已选择的文件
   */
  const removeFile = () => {
    if (form.imagePreview && form.file) {
      URL.revokeObjectURL(form.imagePreview)
    }
    editFile.removeFile()
    form.file = null
    form.imagePreview = target.value?.thumbFullUrl || ''
  }

  /**
   * 切换原创/转载
   * @param {boolean} value - 是否原创
   */
  const toggleOriginal = (value) => {
    if (form.isOriginal === value) return
    form.isOriginal = value
  }

  /**
   * 提交编辑
   */
  const submit = async () => {
    if (!target.value) return

    // 参数校验
    const newTitle = form.workTitle.trim()
    if (!newTitle) {
      showError('请输入作品标题')
      return
    }
    if (newTitle.length > 16) {
      showError('作品标题最多16个中文字符')
      return
    }
    if (!form.isOriginal && !form.outUrl.trim()) {
      showError('转载作品必须填写外部链接')
      return
    }

    submitting.value = true
    await handleUpdateWork({
      workId: target.value.work_id,
      workTitle: newTitle,
      file: form.file,
      seriesId: form.seriesId,
      isOriginal: form.isOriginal,
      outUrl: form.isOriginal ? undefined : form.outUrl.trim(),
    })
    submitting.value = false
    close()
  }

  /**
   * 清理动画（在 onUnmounted 中调用）
   */
  const cleanup = () => {
    dialogAnim.cleanup()
  }

  return {
    // 状态
    show,
    target,
    submitting,
    form,
    // refs
    overlayRef,
    dialogRef,
    fileInputRef,
    // 子模块
    editFile,
    // 方法
    open,
    close,
    onFileSelect,
    removeFile,
    toggleOriginal,
    submit,
    cleanup
  }
}
