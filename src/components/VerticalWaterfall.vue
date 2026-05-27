<template>
  <section class="vw-gallery" ref="galleryRef">
    <!-- 无数据骨架屏 -->
    <div v-if="images.length === 0" class="vw-skeleton-grid" :style="gridStyle">
      <div
        v-for="(col, colIndex) in skeletonData"
        :key="'sk-' + colIndex"
        class="vw-column"
      >
        <div
          v-for="(h, idx) in col"
          :key="idx"
          class="vw-skeleton-block"
          :style="{ height: h + 'px' }"
        ></div>
      </div>
    </div>

    <!-- 真实图片瀑布流 -->
    <div v-else class="vw-grid" :style="gridStyle">
      <div
        v-for="(column, colIndex) in masonryColumns"
        :key="'col-' + colIndex"
        class="vw-column"
      >
        <div
          v-for="(img, imgIndex) in column"
          :key="img.workId || img.src || imgIndex"
          class="vw-card"
          :style="{ height: img.height + 'px' }"
          @click="emit('image-click', img)"
        >
          <!-- 图片骨架覆盖层 -->
          <div
            class="vw-card-skeleton"
            :class="{ 'vw-skeleton-hidden': loadedImages[img.workId || img.src] }"
          ></div>
          <img
            :src="img.src"
            :alt="img.alt || ''"
            class="vw-image"
            :class="{ 'vw-image-loaded': loadedImages[img.workId || img.src] }"
            loading="lazy"
            @load="onImageLoad(img, $event)"
            @error="onImageError(img)"
          />
          <!-- hover 标题覆盖层 -->
          <div
            v-if="img.workTitle || img.alt"
            class="vw-card-overlay"
          >
            <span class="vw-card-title">{{ img.workTitle || img.alt }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部状态指示 -->
    <div ref="sentinelRef" class="vw-sentinel">
      <!-- 加载中 -->
      <div v-if="isLoading" class="vw-loading">
        <svg class="vw-spinner" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32" stroke-linecap="round">
            <animate attributeName="stroke-dashoffset" values="32;0" dur="0.8s" repeatCount="indefinite" />
          </circle>
        </svg>
        <span>加载中...</span>
      </div>
      <!-- 没有更多 -->
      <div v-else-if="!hasMore && images.length > 0" class="vw-no-more">— 没有更多了 —</div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

// ── Props ──
const props = defineProps({
  /** 图片数据数组（与 transformWorksToWaterfallFormat 输出一致） */
  images: { type: Array, default: () => [] },
  /** 是否还有更多数据可加载 */
  hasMore: { type: Boolean, default: true },
  /** 是否正在加载中 */
  isLoading: { type: Boolean, default: false },
  /** 列间距，默认 8px */
  gap: { type: Number, default: 8 },
})

const emit = defineEmits(['load-more', 'image-click'])

// ── Refs ──
const galleryRef = ref(null)
const sentinelRef = ref(null)
const columnCount = ref(4)
const columnWidthPx = ref(300) // 单列实际像素宽度，默认 300
let observer = null
let resizeObserver = null

// 每张图片的加载状态
const loadedImages = ref({})

// 每张图片根据原图宽高比计算的实际渲染高度 { [key]: heightPx }
const imageHeights = reactive({})

/** 图片加载完成：获取原图宽高比，计算等比高度 */
const onImageLoad = (img, event) => {
  const key = img.workId || img.src
  loadedImages.value = { ...loadedImages.value, [key]: true }

  const imgEl = event?.target
  if (imgEl && imgEl.naturalWidth && imgEl.naturalHeight && columnWidthPx.value > 0) {
    const ratio = imgEl.naturalHeight / imgEl.naturalWidth
    imageHeights[key] = Math.round(columnWidthPx.value * ratio)
  }
}

const onImageError = (img) => {
  loadedImages.value = { ...loadedImages.value, [img.workId || img.src]: true }
}

// ── 响应式列数 ──
const calcColumnCount = () => {
  const w = window.innerWidth
  if (w < 640) return 2
  if (w < 1024) return 3
  return 4
}

const gridStyle = computed(() => ({
  '--vw-cols': columnCount.value,
  '--vw-gap': props.gap + 'px',
}))

// ── 骨架屏 ──
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const skeletonData = computed(() => {
  const cols = columnCount.value
  return Array.from({ length: cols }, () =>
    Array.from({ length: rand(4, 8) }, () => rand(140, 380))
  )
})

// ── 竖向瀑布流布局：最短列优先，高度基于原图宽高比 ──
const masonryColumns = computed(() => {
  if (props.images.length === 0) return []

  const cols = columnCount.value
  const columns = Array.from({ length: cols }, () => [])
  const colHeights = new Array(cols).fill(0)
  const colWidth = columnWidthPx.value || 300

  // 默认高度：未加载图片使用正方形估算
  const defaultHeight = colWidth

  props.images.forEach((img) => {
    // 找到当前最短列
    let minIdx = 0
    for (let i = 1; i < cols; i++) {
      if (colHeights[i] < colHeights[minIdx]) minIdx = i
    }

    // 优先使用已加载图片的实际等比高度，否则用正方形估算
    const key = img.workId || img.src
    const h = imageHeights[key] || defaultHeight

    columns[minIdx].push({ ...img, height: h })
    colHeights[minIdx] += h + props.gap
  })

  return columns
})

// ── 无感分页：IntersectionObserver 监听哨兵 ──
const setupObserver = () => {
  if (observer) observer.disconnect()

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry.isIntersecting && props.hasMore && !props.isLoading) {
        emit('load-more')
      }
    },
    {
      root: null,          // 视口
      rootMargin: '300px', // 提前 300px 触发
      threshold: 0,
    }
  )

  nextTick(() => {
    if (sentinelRef.value) {
      observer.observe(sentinelRef.value)
    }
  })
}

// 每次图片数据变化后重新绑定哨兵（哨兵被新图推到更下方）
watch(
  () => props.images.length,
  () => {
    nextTick(() => {
      if (observer && sentinelRef.value) {
        observer.unobserve(sentinelRef.value)
        observer.observe(sentinelRef.value)
      }
    })
  }
)

// 当 hasMore 变为 false 或 isLoading 变化时无需重新 observe，
// observer 回调内会自行判断

// ── 计算列宽（px） ──
const updateColumnWidth = () => {
  const el = galleryRef.value
  if (!el) return
  const cols = columnCount.value
  const totalGap = (cols - 1) * props.gap
  columnWidthPx.value = Math.round((el.clientWidth - totalGap) / cols)
}

// ── 生命周期 ──
const onResize = () => {
  columnCount.value = calcColumnCount()
  nextTick(() => updateColumnWidth())
}

onMounted(() => {
  columnCount.value = calcColumnCount()
  nextTick(() => updateColumnWidth())

  // ResizeObserver 监听容器宽度变化（比 window.resize 更精确）
  if (galleryRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateColumnWidth()
    })
    resizeObserver.observe(galleryRef.value)
  }

  window.addEventListener('resize', onResize)
  setupObserver()
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<style scoped>
/* ── 画廊容器 ── */
.vw-gallery {
  width: 100%;
  padding: 0 4px;
  box-sizing: border-box;
}

/* ── 栅格布局 ── */
.vw-grid,
.vw-skeleton-grid {
  display: flex;
  gap: var(--vw-gap, 8px);
  align-items: flex-start;
}

.vw-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--vw-gap, 8px);
  min-width: 0;
}

/* ── 骨架屏 ── */
.vw-skeleton-block {
  width: 100%;
  background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  border-radius: 8px;
  animation: vw-shimmer 1.8s infinite ease-in-out;
}

@keyframes vw-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── 图片卡片 ── */
.vw-card {
  position: relative;
  width: 100%;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

/* 单图骨架覆盖层 */
.vw-card-skeleton {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  border-radius: 8px;
  animation: vw-shimmer 1.8s infinite ease-in-out;
  opacity: 1;
  transition: opacity 0.5s ease;
  z-index: 1;
}

.vw-card-skeleton.vw-skeleton-hidden {
  opacity: 0;
  pointer-events: none;
}

/* 真实图片 */
.vw-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.5s ease, transform 0.3s ease;
}

.vw-image.vw-image-loaded {
  opacity: 1;
}

.vw-image.vw-image-loaded:hover {
  transform: scale(1.02);
}

/* ── hover 标题覆盖层 ── */
.vw-card-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  padding: 12px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.65) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 8px;
  pointer-events: none;
}

.vw-card:hover .vw-card-overlay {
  opacity: 1;
}

.vw-card-title {
  font-size: 13px;
  color: #ffffff;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
}

/* ── 底部哨兵区域 ── */
.vw-sentinel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 0 32px;
  min-height: 48px;
}

.vw-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
}

.vw-spinner {
  animation: vw-spin 1s linear infinite;
  color: rgba(255, 255, 255, 0.5);
}

@keyframes vw-spin {
  to { transform: rotate(360deg); }
}

.vw-no-more {
  color: rgba(255, 255, 255, 0.2);
  font-size: 12px;
  user-select: none;
}
</style>
