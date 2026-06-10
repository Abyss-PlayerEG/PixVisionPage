/**
 * 滚动加载 Composable
 * 实现 IntersectionObserver 自动加载更多
 */
import { ref, onMounted, onUnmounted } from 'vue'

export function useInfiniteScroll(loadMore, hasMore, loading) {
  const sentinelRef = ref(null)
  let observer = null

  const startObserver = () => {
    if (observer) observer.disconnect()
    
    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && hasMore.value && !loading.value) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (sentinelRef.value) {
      observer.observe(sentinelRef.value)
    }
  }

  const stopObserver = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  onMounted(() => {
    startObserver()
  })

  onUnmounted(() => {
    stopObserver()
  })

  return {
    sentinelRef,
    startObserver,
    stopObserver
  }
}
