/**
 * 作品瀑布流业务逻辑
 * 负责获取作品数据并转换为瀑布流组件所需格式
 */

import { ref, onMounted } from 'vue'
import { fetchWorkPage, transformWorksToWaterfallFormat } from '@/api/workApi'

export const useWorkWaterfall = () => {
  // 瀑布流图片数据
  const waterfallImages = ref([])
  
  // 加载状态
  const isLoading = ref(false)
  
  // 错误信息
  const error = ref(null)

  /**
   * 加载作品数据
   * @param {number} page - 页码（从1开始）
   * @param {number} size - 每页数量
   */
  const loadWorks = async (page = 1, size = 50) => {
    try {
      isLoading.value = true
      error.value = null
      
      const result = await fetchWorkPage(page, size)
      
      if (result.success && result.data && result.data.records) {
        // 转换数据格式
        const transformed = transformWorksToWaterfallFormat(result.data.records)
        waterfallImages.value = transformed
      } else {
        error.value = result.message || '获取作品数据失败'
      }
    } catch (err) {
      error.value = '网络错误，请稍后重试'
    } finally {
      isLoading.value = false
    }
  }

  // 组件挂载时自动加载第一页数据
  onMounted(() => {
    loadWorks(1, 200)
  })

  return {
    waterfallImages,
    isLoading,
    error,
    loadWorks,
  }
}
