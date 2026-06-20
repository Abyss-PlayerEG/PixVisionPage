/**
 * 上传表单 Composable
 *
 * 管理上传作品页面的 UI 交互逻辑：
 * 文件选择/拖拽、图片尺寸追踪、原创/转载切换指示器、
 * 合集系列弹窗、转载链接药丸动画、提交/取消操作。
 *
 * @module useUploadForm
 */

import { ref, computed, watch, nextTick } from 'vue'
import gsap from 'gsap'

export const useUploadForm = ({
  uploadForm,
  uploadLoading,
  uploadRadioIndicator,
  handleUpload,
  setUploadFile,
  removeUploadFile,
  resetUploadForm,
  loadWorks,
  fetchUserStats,
  switchTab,
  seriesList,
}) => {
  // ═══════════════════════════════════════════════════════════
  // 原创 / 转载 radio 指示器
  // ═══════════════════════════════════════════════════════════
  const uploadRadioGroupRef = uploadRadioIndicator.containerRef
  const uploadRadioIndicatorStyle = uploadRadioIndicator.indicatorStyle
  const updateUploadRadioIndicator = () => uploadRadioIndicator.update('.n3_uploadRadioBtn.active')

  const toggleUploadOriginal = (val) => {
    uploadForm.isOriginal = val
    nextTick(() => updateUploadRadioIndicator())
  }

  // ═══════════════════════════════════════════════════════════
  // 文件选择 / 拖拽
  // ═══════════════════════════════════════════════════════════
  const uploadFileInputRef = ref(null)

  const onUploadFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) setUploadFile(file)
  }

  const onUploadDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const onUploadDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer?.files?.[0]
    if (file) setUploadFile(file)
  }

  const onUploadRemoveFile = () => {
    removeUploadFile()
    if (uploadFileInputRef.value) uploadFileInputRef.value.value = ''
    uploadImageDimensions.value = { width: 0, height: 0 }
  }

  // ═══════════════════════════════════════════════════════════
  // 图片尺寸追踪
  // ═══════════════════════════════════════════════════════════
  const uploadImageDimensions = ref({ width: 0, height: 0 })

  watch(() => uploadForm.filePreview, (preview) => {
    if (!preview) {
      uploadImageDimensions.value = { width: 0, height: 0 }
      return
    }
    const img = new Image()
    img.onload = () => {
      uploadImageDimensions.value = { width: img.naturalWidth, height: img.naturalHeight }
    }
    img.src = preview
  })

  // ═══════════════════════════════════════════════════════════
  // 文件名截断显示
  // ═══════════════════════════════════════════════════════════
  const uploadFileNameDisplay = computed(() => {
    const name = uploadForm.file?.name || ''
    if (!name) return ''
    const dotIndex = name.lastIndexOf('.')
    const baseName = dotIndex > 0 ? name.substring(0, dotIndex) : name
    const ext = dotIndex > 0 ? name.substring(dotIndex) : ''
    if (baseName.length > 12) {
      return baseName.substring(0, 12) + '...' + ext
    }
    return name
  })

  // ═══════════════════════════════════════════════════════════
  // 提交 / 取消
  // ═══════════════════════════════════════════════════════════
  const submitUpload = async () => {
    const result = await handleUpload()
    if (result.success) {
      if (uploadFileInputRef.value) uploadFileInputRef.value.value = ''
      await fetchUserStats()
      switchTab('works')
    }
  }

  const cancelUpload = () => {
    resetUploadForm()
    if (uploadFileInputRef.value) uploadFileInputRef.value.value = ''
  }

  // ═══════════════════════════════════════════════════════════
  // 添加到合集弹窗
  // ═══════════════════════════════════════════════════════════
  const showUploadSeriesDialog = ref(false)
  const uploadSeriesTargetId = ref(0)

  const openUploadSeriesDialog = () => {
    uploadSeriesTargetId.value = uploadForm.seriesId || 0
    showUploadSeriesDialog.value = true
  }

  const confirmUploadSeries = () => {
    uploadForm.seriesId = uploadSeriesTargetId.value
    showUploadSeriesDialog.value = false
  }

  const closeUploadSeriesDialog = () => {
    showUploadSeriesDialog.value = false
  }

  // ═══════════════════════════════════════════════════════════
  // 转载链接药丸 入场 / 离场动画（右→左）
  // ═══════════════════════════════════════════════════════════
  const uploadLinkPillRef = ref(null)

  const onUploadLinkEnter = (el, done) => {
    gsap.fromTo(el,
      { x: 24, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out', onComplete: done }
    )
  }

  const onUploadLinkLeave = (el, done) => {
    gsap.to(el,
      { x: 24, opacity: 0, duration: 0.2, ease: 'power2.in', onComplete: done }
    )
  }

  return {
    // Radio 指示器
    uploadRadioGroupRef, uploadRadioIndicatorStyle,
    updateUploadRadioIndicator, toggleUploadOriginal,
    // 文件
    uploadFileInputRef,
    onUploadFileSelect, onUploadDragOver, onUploadDrop, onUploadRemoveFile,
    // 图片尺寸 + 文件名
    uploadImageDimensions, uploadFileNameDisplay,
    // 提交 / 取消
    submitUpload, cancelUpload,
    // 合集弹窗
    showUploadSeriesDialog, uploadSeriesTargetId,
    openUploadSeriesDialog, confirmUploadSeries, closeUploadSeriesDialog,
    // 转载链接药丸动画
    uploadLinkPillRef, onUploadLinkEnter, onUploadLinkLeave,
  }
}
