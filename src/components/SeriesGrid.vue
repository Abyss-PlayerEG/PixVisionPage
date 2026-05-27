<template>
  <section class="sg-gallery" ref="galleryRef">
    <!-- 骨架屏 -->
    <div v-if="seriesList.length === 0 && !initialLoadingDone" class="sg-skeleton-grid">
      <div
        v-for="(item, i) in skeletonItems"
        :key="'sk-' + i"
        class="sg-skeleton-card"
        :style="item.style"
      ></div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="seriesList.length === 0 && initialLoadingDone" class="sg-empty">
      <p>暂无合集</p>
    </div>

    <!-- 真实网格 -->
    <div v-else class="sg-grid">
      <div
        v-for="(series, idx) in seriesList"
        :key="series.seriesId"
        class="sg-card"
        :style="{
          gridColumn: `span ${series.colSpan}`,
          gridRow: `span ${series.rowSpan}`,
          animationDelay: `${idx * 0.05}s`,
        }"
        @click="emit('series-click', series)"
      >
        <!-- 封面图 -->
        <img
          v-if="series.coverUrl"
          :src="series.coverUrl"
          :alt="series.title"
          class="sg-cover"
          loading="lazy"
        />
        <!-- 无封面占位 -->
        <div v-else class="sg-cover-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>

        <!-- 渐变遮罩 + 文字信息 -->
        <div class="sg-card-info">
          <h3 class="sg-card-title">{{ series.title }}</h3>
          <p v-if="series.description" class="sg-card-desc">{{ series.description }}</p>
        </div>
      </div>
    </div>

    <!-- 底部哨兵 -->
    <div ref="sentinelRef" class="sg-sentinel">
      <div v-if="isLoading" class="sg-loading">
        <svg class="sg-spinner" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32" stroke-linecap="round">
            <animate attributeName="stroke-dashoffset" values="32;0" dur="0.8s" repeatCount="indefinite" />
          </circle>
        </svg>
        <span>加载中...</span>
      </div>
      <div v-else-if="!hasMore && seriesList.length > 0" class="sg-no-more">— 没有更多了 —</div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { SERIES_API, getWorkImageUrl } from '@/config/api'

const props = defineProps({
  userId: { type: Number, required: true },
  keyword: { type: String, default: '' },
  orderBy: { type: String, default: 'newest' },
})

const emit = defineEmits(['series-click'])

// ── 状态 ──
const seriesList = ref([])
const isLoading = ref(false)
const hasMore = ref(true)
const initialLoadingDone = ref(false)

const galleryRef = ref(null)
const sentinelRef = ref(null)
let _currentPage = 1
let observer = null

// ── 随机跨度池 ──
const COL_SPAN_POOL = [3, 4, 5, 6, 3, 5, 4, 6, 3, 4, 5, 3, 6, 4, 5, 6]

// ── 骨架屏 ──
const skeletonItems = Array.from({ length: 8 }, (_, i) => {
  const colSpan = COL_SPAN_POOL[i % COL_SPAN_POOL.length]
  const rowSpan = colSpan >= 5 ? 2 : colSpan === 4 ? 3 : 2
  return {
    style: {
      gridColumn: `span ${colSpan}`,
      gridRow: `span ${rowSpan}`,
      animationDelay: `${i * 0.04}s`,
    },
  }
})

// ── 数据获取 ──
const fetchSeries = async ({ reset = false, size = 10 } = {}) => {
  if (isLoading.value) return
  if (!props.userId) return

  if (reset) {
    _currentPage = 1
    seriesList.value = []
    hasMore.value = true
  }

  try {
    isLoading.value = true

    const queryParams = new URLSearchParams()
    if (props.keyword) queryParams.append('keyword', props.keyword)
    if (props.orderBy) queryParams.append('orderBy', props.orderBy)
    const qs = queryParams.toString()
    const url = `${SERIES_API.PAGE}/${props.userId}/${_currentPage}/${size}${qs ? '?' + qs : ''}`

    console.log('[SeriesGrid] 请求:', url)
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    const result = await response.json()
    console.log('[SeriesGrid] 响应:', result)

    const statusCode = result.code || result.recode
    if (statusCode === 200 && result.data && result.data.records) {
      const transformed = result.data.records.map((series, idx) => {
        const poolIdx = (seriesList.value.length + idx) % COL_SPAN_POOL.length
        const colSpan = COL_SPAN_POOL[poolIdx]
        const rowSpan = colSpan >= 5 ? 2 : colSpan === 4 ? 3 : 2
        return {
          seriesId: series.series_id,
          userId: series.user_id,
          title: series.series_title || '',
          description: series.about_text || '',
          coverUrl: series.thumb_url ? getWorkImageUrl(series.thumb_url) : null,
          colSpan,
          rowSpan,
        }
      })

      if (reset) {
        seriesList.value = transformed
      } else {
        seriesList.value = [...seriesList.value, ...transformed]
      }

      const total = result.data.total || 0
      hasMore.value = seriesList.value.length < total

      if (hasMore.value) _currentPage++
    } else {
      hasMore.value = false
    }

    initialLoadingDone.value = true
  } catch (err) {
    console.error('[SeriesGrid] 加载失败:', err)
    hasMore.value = false
    initialLoadingDone.value = true
  } finally {
    isLoading.value = false
  }
}

const loadMore = () => {
  if (!hasMore.value || isLoading.value) return
  fetchSeries({ reset: false })
}

const refresh = () => {
  fetchSeries({ reset: true })
}

// ── 监听 keyword 变化 ──
watch(() => props.keyword, () => {
  refresh()
})

// ── 监听 orderBy 变化 ──
watch(() => props.orderBy, () => {
  refresh()
})

// ── 监听 userId 变化 ──
watch(() => props.userId, (newVal) => {
  if (newVal) refresh()
})

// ── IntersectionObserver ──
const setupObserver = () => {
  if (observer) observer.disconnect()
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore.value && !isLoading.value) {
        loadMore()
      }
    },
    { root: null, rootMargin: '300px', threshold: 0 }
  )
  nextTick(() => {
    if (sentinelRef.value) observer.observe(sentinelRef.value)
  })
}

watch(() => seriesList.value.length, () => {
  nextTick(() => {
    if (observer && sentinelRef.value) {
      observer.unobserve(sentinelRef.value)
      observer.observe(sentinelRef.value)
    }
  })
})

onMounted(() => {
  setupObserver()
  if (props.userId) fetchSeries({ reset: true })
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<style scoped>
/* ── 容器 ── */
.sg-gallery {
  width: 100%;
  padding: 0 4px;
  box-sizing: border-box;
}

/* ── 网格 ── */
.sg-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-auto-rows: 140px;
  gap: 10px;
}

@media (max-width: 1400px) {
  .sg-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 1024px) {
  .sg-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 640px) {
  .sg-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 120px;
    gap: 6px;
  }
}

/* ── 卡片 ── */
.sg-card {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  background: #1a1a1a;
  animation: sg-fadeUp 0.5s ease both;
  min-height: 0;
}

@keyframes sg-fadeUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sg-card:hover {
  transform: translateY(-2px);
  transition: transform 0.25s ease;
}

.sg-card:hover .sg-cover {
  transform: scale(1.04);
}

/* ── 封面 ── */
.sg-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

/* ── 无封面占位 ── */
.sg-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
}

.sg-cover-placeholder svg {
  width: 36px;
  height: 36px;
  color: rgba(255, 255, 255, 0.15);
}

/* ── 文字覆盖层 ── */
.sg-card-info {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16px;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.75) 0%,
    rgba(0, 0, 0, 0.25) 50%,
    transparent 100%
  );
}

.sg-card-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sg-card-desc {
  margin: 4px 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* ── 骨架屏 ── */
.sg-skeleton-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-auto-rows: 140px;
  gap: 10px;
}

@media (max-width: 1400px) {
  .sg-skeleton-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 1024px) {
  .sg-skeleton-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 640px) {
  .sg-skeleton-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 120px;
    gap: 6px;
  }
}

.sg-skeleton-card {
  border-radius: 10px;
  background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: sg-shimmer 1.8s infinite ease-in-out;
}

@keyframes sg-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── 空状态 ── */
.sg-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.sg-empty p {
  color: rgba(255, 255, 255, 0.25);
  font-size: 14px;
  margin: 0;
}

/* ── 底部哨兵 ── */
.sg-sentinel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 0 32px;
  min-height: 48px;
}

.sg-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
}

.sg-spinner {
  animation: sg-spin 1s linear infinite;
  color: rgba(255, 255, 255, 0.5);
}

@keyframes sg-spin {
  to { transform: rotate(360deg); }
}

.sg-no-more {
  color: rgba(255, 255, 255, 0.2);
  font-size: 12px;
  user-select: none;
}
</style>
