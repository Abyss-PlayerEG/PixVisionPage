/**
 * 删除确认 Composable
 * 封装删除确认弹窗的状态和逻辑
 * 
 * @module useDeleteConfirm
 */

import { ref } from 'vue'

/**
 * 创建删除确认控制器
 * @param {Function} handleDeleteWork - 删除作品接口
 * @param {Function} handleDeleteSeries - 删除合集接口
 * @returns 删除确认相关的状态和方法
 */
export const useDeleteConfirm = (handleDeleteWork, handleDeleteSeries, handleBatchDeleteWorks) => {
  // 弹窗状态
  const show = ref(false)
  const title = ref('')
  const message = ref('')
  const noText = ref('取消')
  const yesText = ref('确认删除')
  let callback = null

  /**
   * 确认删除作品（单选）
   * @param {Object} work - 要删除的作品
   */
  const confirmDeleteWork = (work) => {
    title.value = '删除作品'
    message.value = `确定要删除作品「${work.work_title || '未命名'}」吗？此操作不可撤销。`
    noText.value = '取消'
    yesText.value = '确认删除'
    callback = () => handleDeleteWork(work.work_id)
    show.value = true
  }

  /**
   * 确认批量删除作品（多选）
   */
  const confirmBatchDeleteWorks = () => {
    title.value = '删除作品'
    message.value = '所选图片一经删除无法恢复。'
    noText.value = '我再想想'
    yesText.value = '确定删除'
    callback = () => handleBatchDeleteWorks()
    show.value = true
  }

  /**
   * 确认删除合集
   * @param {Object} series - 要删除的合集
   */
  const confirmDeleteSeries = (series) => {
    title.value = '删除合集'
    message.value = `确定要删除合集「${series.series_title || '未命名'}」吗？合集内的作品不会被删除。`
    noText.value = '取消'
    yesText.value = '确认删除'
    callback = () => handleDeleteSeries(series.series_id, false)
    show.value = true
  }

  /**
   * 执行删除操作
   */
  const execute = async () => {
    if (callback) await callback()
    show.value = false
    callback = null
  }

  /**
   * 取消删除
   */
  const cancel = () => {
    show.value = false
    callback = null
  }

  return {
    show,
    title,
    message,
    noText,
    yesText,
    confirmDeleteWork,
    confirmBatchDeleteWorks,
    confirmDeleteSeries,
    execute,
    cancel
  }
}
