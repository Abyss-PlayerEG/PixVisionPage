/**
 * 合集弹窗 Composable
 * 封装合集编辑、合集详情、批量添加到合集的弹窗逻辑
 * 
 * @module useSeriesDialogs
 */

import { ref, reactive, nextTick } from 'vue'
import { showError } from '@/utils/notification'
import { useDialogAnimation } from './useDialogAnimation'

/**
 * 创建合集弹窗控制器
 * @param {Object} deps - 依赖注入
 * @param {Function} deps.handleAddSeries - 新增合集接口
 * @param {Function} deps.handleUpdateSeries - 更新合集接口
 * @param {Function} deps.handleRemoveWorkFromSeries - 从合集移除作品接口
 * @param {Function} deps.handleBatchAddToSeries - 批量添加到合集接口
 * @param {Function} deps.loadSeries - 加载合集列表
 * @param {import('vue').Ref} deps.seriesList - 合集列表
 * @param {import('vue').Ref} deps.selectedWorkIds - 选中的作品 ID 列表
 * @param {Function} deps.loadSeriesDetail - 加载合集详情
 * @returns 合集弹窗相关的状态和方法
 */
export const useSeriesDialogs = (deps) => {
  const {
    handleAddSeries,
    handleUpdateSeries,
    handleRemoveWorkFromSeries,
    handleBatchAddToSeries,
    loadSeries,
    seriesList,
    selectedWorkIds,
    loadSeriesDetail
  } = deps

  // ==================== 合集编辑弹窗 ====================
  const showAddSeriesDialog = ref(false)
  const showEditSeriesDialog = ref(false)
  const editSeriesTarget = ref(null)
  const seriesForm = reactive({ seriesTitle: '', aboutText: '' })

  const seriesOverlayRef = ref(null)
  const seriesDialogRef = ref(null)
  const seriesDialogAnim = useDialogAnimation(seriesOverlayRef, seriesDialogRef)

  const openAddSeriesDialog = () => {
    showAddSeriesDialog.value = true
    seriesDialogAnim.open()
  }

  const openEditSeriesDialog = (series) => {
    editSeriesTarget.value = series
    seriesForm.seriesTitle = series.series_title || ''
    seriesForm.aboutText = series.about_text || ''
    showEditSeriesDialog.value = true
    seriesDialogAnim.open()
  }

  const closeSeriesDialog = () => {
    seriesDialogAnim.close(() => {
      showAddSeriesDialog.value = false
      showEditSeriesDialog.value = false
      editSeriesTarget.value = null
      seriesForm.seriesTitle = ''
      seriesForm.aboutText = ''
    })
  }

  const submitSeriesForm = async () => {
    const title = seriesForm.seriesTitle.trim()
    if (!title) return

    if (showEditSeriesDialog.value && editSeriesTarget.value) {
      await handleUpdateSeries({
        seriesId: editSeriesTarget.value.series_id,
        seriesTitle: title,
        aboutText: seriesForm.aboutText.trim() || undefined,
      })
    } else {
      await handleAddSeries({
        seriesTitle: title,
        aboutText: seriesForm.aboutText.trim() || undefined,
      })
    }
    closeSeriesDialog()
  }

  // ==================== 合集详情弹窗 ====================
  const showSeriesDetailDialog = ref(false)
  const seriesDetail = ref(null)
  const seriesDetailLoading = ref(false)
  const seriesDetailWorks = ref([])
  const seriesDetailForm = reactive({ seriesTitle: '', aboutText: '' })

  const seriesDetailOverlayRef = ref(null)
  const seriesDetailDialogRef = ref(null)
  const seriesDetailDialogAnim = useDialogAnimation(seriesDetailOverlayRef, seriesDetailDialogRef)

  const openSeriesDetail = async (series) => {
    // 保存数据
    seriesDetail.value = {
      series_id: series.series_id,
      series_title: series.series_title,
      about_text: series.about_text,
    }
    seriesDetailForm.seriesTitle = series.series_title || ''
    seriesDetailForm.aboutText = series.about_text || ''
    seriesDetailWorks.value = []

    // 显示弹窗并执行入场动画
    showSeriesDetailDialog.value = true
    seriesDetailDialogAnim.open()

    // 加载作品列表
    loadSeriesDetail(series.series_id)
  }

  const closeSeriesDetailDialog = () => {
    seriesDetailDialogAnim.close(() => {
      showSeriesDetailDialog.value = false
    })
  }

  const submitSeriesDetailEdit = async () => {
    if (!seriesDetail.value) return
    const title = seriesDetailForm.seriesTitle.trim()
    if (!title) {
      showError('请输入合集名称')
      return
    }
    await handleUpdateSeries({
      seriesId: seriesDetail.value.series_id,
      seriesTitle: title,
      aboutText: seriesDetailForm.aboutText.trim() || undefined,
    })
  }

  const removeWorkFromSeries = async (workId) => {
    if (!seriesDetail.value) return
    await handleRemoveWorkFromSeries(workId, seriesDetail.value.series_id)
  }

  // ==================== 批量添加到合集弹窗 ====================
  const showAddToSeriesDialog = ref(false)
  const addToSeriesTargetId = ref(null)

  const addToSeriesOverlayRef = ref(null)
  const addToSeriesDialogRef = ref(null)
  const addToSeriesDialogAnim = useDialogAnimation(addToSeriesOverlayRef, addToSeriesDialogRef)

  const openAddToSeriesDialog = () => {
    addToSeriesTargetId.value = null
    showAddToSeriesDialog.value = true
    // 打开时自动加载合集列表
    if (seriesList.value.length === 0) {
      loadSeries({ reset: true })
    }
    addToSeriesDialogAnim.open()
  }

  const closeAddToSeriesDialog = () => {
    addToSeriesDialogAnim.close(() => {
      showAddToSeriesDialog.value = false
      addToSeriesTargetId.value = null
    })
  }

  const submitAddToSeries = async () => {
    if (!addToSeriesTargetId.value) {
      showError('请选择目标合集')
      return
    }
    await handleBatchAddToSeries(addToSeriesTargetId.value)
    closeAddToSeriesDialog()
  }

  /**
   * 清理动画（在 onUnmounted 中调用）
   */
  const cleanup = () => {
    seriesDialogAnim.cleanup()
    seriesDetailDialogAnim.cleanup()
    addToSeriesDialogAnim.cleanup()
  }

  return {
    // 合集编辑弹窗
    showAddSeriesDialog,
    showEditSeriesDialog,
    editSeriesTarget,
    seriesForm,
    seriesOverlayRef,
    seriesDialogRef,
    openAddSeriesDialog,
    openEditSeriesDialog,
    closeSeriesDialog,
    submitSeriesForm,

    // 合集详情弹窗
    showSeriesDetailDialog,
    seriesDetail,
    seriesDetailLoading,
    seriesDetailWorks,
    seriesDetailForm,
    seriesDetailOverlayRef,
    seriesDetailDialogRef,
    openSeriesDetail,
    closeSeriesDetailDialog,
    submitSeriesDetailEdit,
    removeWorkFromSeries,

    // 批量添加到合集弹窗
    showAddToSeriesDialog,
    addToSeriesTargetId,
    addToSeriesOverlayRef,
    addToSeriesDialogRef,
    openAddToSeriesDialog,
    closeAddToSeriesDialog,
    submitAddToSeries,

    // 清理
    cleanup
  }
}
