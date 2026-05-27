/**
 * Profile 内容区通用瀑布流数据加载器
 * 接受一个 fetch 函数，统一处理分页、转换、状态管理
 *
 * @param {Function} fetchFn - 数据获取函数，签名为 ({ current, size, ...extra }) => Promise
 *                             返回格式：{ success, data: { records, total } }
 * @returns {Object} { images, isLoading, hasMore, loadFirst, loadMore, refresh }
 */

import { ref } from 'vue'
import { transformWorksToWaterfallFormat } from '@/api/workApi'

export const useProfileContent = (fetchFn) => {
  const images = ref([])
  const isLoading = ref(false)
  const hasMore = ref(true)

  let _currentPage = 1
  let _extraParams = {}

  /**
   * 加载数据
   * @param {Object} options
   * @param {boolean} [options.reset=false]
   * @param {number} [options.size=20]
   * @param {Object} [options.extraParams={}] - 额外参数透传给 fetchFn
   */
  const loadWorks = async ({ reset = false, size = 20, extraParams = {} } = {}) => {
    if (isLoading.value) return

    if (reset) {
      _currentPage = 1
      _extraParams = extraParams
      images.value = []
      hasMore.value = true
    }

    try {
      isLoading.value = true

      const result = await fetchFn({
        current: _currentPage,
        size,
        ..._extraParams,
      })

      if (result.success && result.data && result.data.records) {
        const transformed = transformWorksToWaterfallFormat(result.data.records)

        if (reset) {
          images.value = transformed
        } else {
          images.value = [...images.value, ...transformed]
        }

        const total = result.data.total || 0
        hasMore.value = images.value.length < total

        if (hasMore.value) {
          _currentPage++
        }
      } else {
        hasMore.value = false
      }
    } catch (err) {
      console.error('[ProfileContent] 加载失败:', err)
      hasMore.value = false
    } finally {
      isLoading.value = false
    }
  }

  /** 加载下一页 */
  const loadMore = ({ size } = {}) => {
    if (!hasMore.value || isLoading.value) return
    loadWorks({ reset: false, size })
  }

  /** 刷新（重置到第一页，可传入新的 extraParams） */
  const refresh = (extraParams = {}, size) => {
    loadWorks({ reset: true, size, extraParams })
  }

  return {
    images,
    isLoading,
    hasMore,
    loadFirst: (size, extraParams) => loadWorks({ reset: true, size, extraParams }),
    loadMore,
    refresh,
  }
}
