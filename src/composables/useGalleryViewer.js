/**
 * GalleryViewer — 合集作品预览 Composable
 *
 * 管理 Gallery 页面所有业务逻辑：合集数据加载、图片切换、
 * 导航状态、GSAP 动画、返回路由。
 *
 * @module useGalleryViewer
 */

import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getWorkImageUrl } from '@/config/api'
import { fetchSeriesDetail } from '@/api/creatorApi'
import gsap from 'gsap'

export const useGalleryViewer = (props, emit) => {
  const route = useRoute()
  const router = useRouter()

  // ── Refs ────────────────────────────────────────────────────
  const containerRef = ref(null)
  const cardRef = ref(null)
  const navRef = ref(null)
  const topLeftRef = ref(null)
  const bgRef = ref(null)

  // ═══════════════════════════════════════════════════════════
  // 合集模式 — 加载合集内所有作品
  // ═══════════════════════════════════════════════════════════
  const resolvedSeriesId = computed(() => {
    if (props.seriesId) return Number(props.seriesId)
    if (route.query.seriesId) return Number(route.query.seriesId)
    return null
  })

  const works = ref([])
  const currentIndex = ref(0)
  const seriesLoading = ref(false)
  const loadError = ref('')

  const loadSeriesWorks = async () => {
    const sid = resolvedSeriesId.value
    if (!sid) return

    seriesLoading.value = true
    loadError.value = ''

    try {
      const result = await fetchSeriesDetail(sid)
      if (result.success && result.data) {
        works.value = (result.data.records || []).map(w => ({
          id: w.work_id,
          title: w.work_title || '未命名作品',
          imgUrl: w.imgFullUrl || '',
          thumbUrl: w.thumbFullUrl || '',
        }))
        currentIndex.value = 0
      } else {
        loadError.value = result.message || '加载合集失败'
      }
    } catch {
      loadError.value = '网络错误，请稍后重试'
    }

    seriesLoading.value = false
  }

  // ═══════════════════════════════════════════════════════════
  // 当前作品 / 图片 / 标题
  // ═══════════════════════════════════════════════════════════
  const currentWork = computed(() => works.value[currentIndex.value] || null)

  const currentImage = computed(() => {
    if (currentWork.value) return currentWork.value.imgUrl || ''
    if (props.imagePath) {
      return props.imagePath.startsWith('http') ? props.imagePath : getWorkImageUrl(props.imagePath)
    }
    return ''
  })

  const currentTitle = computed(() => {
    if (currentWork.value) return currentWork.value.title
    return props.workTitle || route.query.title || '未命名作品'
  })

  const totalCount = computed(() => works.value.length)

  const bgStyle = computed(() => ({
    backgroundImage: currentImage.value ? `url(${currentImage.value})` : 'none',
  }))

  // ═══════════════════════════════════════════════════════════
  // 导航状态
  // ═══════════════════════════════════════════════════════════
  const canGoPrev = computed(() => works.value.length > 0 && currentIndex.value > 0)
  const canGoNext = computed(() => works.value.length > 0 && currentIndex.value < works.value.length - 1)

  const goPrev = () => {
    if (!canGoPrev.value) return
    currentIndex.value--
    emit('prev')
  }

  const goNext = () => {
    if (!canGoNext.value) return
    currentIndex.value++
    emit('next')
  }

  // ═══════════════════════════════════════════════════════════
  // GSAP 动画
  // ═══════════════════════════════════════════════════════════
  let ctx = null

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  onMounted(async () => {
    if (resolvedSeriesId.value) {
      await loadSeriesWorks()
    }

    if (prefersReduced) return

    ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

      tl.fromTo(bgRef.value,
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
        0
      )
      .fromTo(cardRef.value,
        { scale: 0.92, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'expo.out' },
        0.08
      )
      .fromTo(topLeftRef.value,
        { opacity: 0, y: -12 },
        { opacity: 1, y: 0, duration: 0.4 },
        0.12
      )
      .fromTo(navRef.value,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.45 },
        0.18
      )
    }, containerRef.value)
  })

  // 切换图片时的卡片过渡动画
  watch(currentIndex, () => {
    if (prefersReduced || !cardRef.value) return
    nextTick(() => {
      gsap.fromTo(cardRef.value,
        { opacity: 0, scale: 0.97 },
        { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
      )
    })
  })

  onUnmounted(() => {
    if (ctx) {
      ctx.revert()
      ctx = null
    }
  })

  // ═══════════════════════════════════════════════════════════
  // 关闭 / 返回
  // ═══════════════════════════════════════════════════════════
  const handleClose = () => {
    emit('close')
    if (resolvedSeriesId.value) {
      router.replace({ name: 'creatorT', query: { tab: 'collections' } })
    } else if (window.history.length > 1) {
      router.back()
    } else {
      router.replace({ name: 'creatorT' })
    }
  }

  return {
    // Refs
    containerRef, cardRef, navRef, topLeftRef, bgRef,
    // State
    resolvedSeriesId, works, currentIndex, seriesLoading, loadError,
    // Computed
    currentWork, currentImage, currentTitle, totalCount, bgStyle,
    // Navigation
    canGoPrev, canGoNext, goPrev, goNext,
    // Handlers
    handleClose,
  }
}
