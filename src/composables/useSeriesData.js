/**
 * 系列数据加载器
 * 用于首页n3_showIMG合集部分的数据加载
 */

import { ref } from 'vue'
import { fetchUserSeries } from '@/api/workApi'

export const useSeriesData = () => {
  // 系列数据
  const seriesList = ref([])
  
  // 加载状态
  const isLoading = ref(false)
  
  // 错误信息
  const error = ref(null)

  /**
   * 加载系列数据
   * @param {Object} options - 加载选项
   * @param {number} [options.userId] - 用户ID，可选，不传则查询所有用户
   * @param {number} [options.current=1] - 当前页码
   * @param {number} [options.size=10] - 每页数量
   * @param {string} [options.keyword] - 搜索关键词，可选
   * @param {boolean} [options.reset=false] - 是否重置当前列表
   */
  const loadSeries = async ({ userId = null, current = 1, size = 10, keyword, reset = false } = {}) => {
    if (isLoading.value) return

    try {
      isLoading.value = true
      error.value = null
      
      // 如果是重置，回到第一页
      if (reset) {
        seriesList.value = []
      }

      const result = await fetchUserSeries({
        userId,
        current,
        size,
        keyword
      })
      
      console.log('[Composable] 系列数据API返回结果:', result);

      if (result.success && result.data && result.data.records) {
        const newRecords = result.data.records
        console.log('[Composable] 获取到的系列记录数:', newRecords.length);
        
        // 追加或覆盖数据
        if (reset) {
          seriesList.value = newRecords
        } else {
          seriesList.value = [...seriesList.value, ...newRecords]
        }
      } else {
        error.value = result.message || '获取系列数据失败'
      }
    } catch (err) {
      error.value = '网络错误，请稍后重试'
      console.error('系列数据加载失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 刷新系列数据
   * @param {number} [userId] - 用户ID，可选
   * @param {number} [size=10] - 每页数量
   */
  const refreshSeries = (userId = null, size = 10) => {
    loadSeries({ userId, size, reset: true })
  }

  return {
    seriesList,
    isLoading,
    error,
    loadSeries,
    refreshSeries,
  }
}