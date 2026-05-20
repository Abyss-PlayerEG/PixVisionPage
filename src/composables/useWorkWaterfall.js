/**
 * 通用瀑布流数据加载器
 * 支持分页、筛选及自动图片 URL 转换
 */

import { ref } from 'vue'
import { fetchWorkPage, transformWorksToWaterfallFormat } from '@/api/workApi'

export const useWorkWaterfall = () => {
  // 瀑布流图片数据
  const waterfallImages = ref([])
  
  // 加载状态
  const isLoading = ref(false)
  
  // 错误信息
  const error = ref(null)

  // 分页状态
  const currentPage = ref(1)
  const pageSize = ref(500)
  const hasMore = ref(true)
  
  // 自动加载状态
  const autoLoadEnabled = ref(false)

  /**
   * 切换自动加载模式
   */
  const toggleAutoLoad = (enabled) => {
    autoLoadEnabled.value = enabled
  }

  /**
   * 加载作品数据 (支持重置或追加)
   * @param {Object} options - 加载选项
   * @param {boolean} [options.reset=false] - 是否重置当前列表（用于搜索或刷新）
   * @param {Object} [options.filters={}] - 筛选参数 (workTitle, userId, etc.)
   * @param {number} [options.size] - 可选，覆盖默认的每页数量
   */
  const loadWorks = async ({ reset = false, filters = {}, size } = {}) => {
    if (isLoading.value) return

    try {
      isLoading.value = true
      error.value = null
      
      // 如果是重置，回到第一页
      if (reset) {
        currentPage.value = 1
        waterfallImages.value = []
      }

      // 如果传入了 size，则使用传入的，否则使用默认值
      const requestSize = size || pageSize.value;

      const result = await fetchWorkPage({
        current: currentPage.value,
        size: requestSize,
        ...filters
      })
      
      console.log('[Composable] API 返回结果:', result);

      if (result.success && result.data && result.data.records) {
        const newRecords = result.data.records
        console.log('[Composable] 获取到的记录数:', newRecords.length);
        
        // 转换数据格式并应用视觉算法
        const transformed = transformWorksToWaterfallFormat(newRecords)
        console.log('[Composable] 转换后的图片数据条数:', transformed.length);
        if (transformed.length > 0) {
          console.log('[Composable] 第一张图片对象:', transformed[0]);
        }
        
        // 追加或覆盖数据
        if (reset) {
          waterfallImages.value = transformed
        } else {
          waterfallImages.value = [...waterfallImages.value, ...transformed]
        }

        // 判断是否还有更多数据
        const total = result.data.total || 0
        const currentTotal = waterfallImages.value.length
        hasMore.value = currentTotal < total
        
        // 如果还有更多，页码 +1
        if (hasMore.value) {
          currentPage.value++
        }
      } else {
        error.value = result.message || '获取作品数据失败'
        hasMore.value = false
      }
    } catch (err) {
      error.value = '网络错误，请稍后重试'
      console.error('瀑布流加载失败:', err)
      hasMore.value = false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 加载更多 (下一页)
   */
  const loadMore = () => {
    if (!hasMore.value || isLoading.value) return
    loadWorks({ reset: false })
  }

  /**
   * 刷新数据 (回到第一页)
   */
  const refresh = (filters = {}) => {
    loadWorks({ reset: true, filters })
  }

  return {
    waterfallImages,
    isLoading,
    error,
    hasMore,
    autoLoadEnabled,
    loadWorks,
    loadMore,
    refresh,
    toggleAutoLoad,
  }
}
