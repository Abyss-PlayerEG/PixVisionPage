<template>
  <section class="waterfall-gallery" ref="sectionRef">
    <div class="gallery-track" ref="trackRef">
      <!-- 骨架屏 -->
      <template v-if="images.length === 0">
        <div
          v-for="(column, colIndex) in skeletonColumns"
          :key="'skeleton-' + colIndex"
          class="gallery-column"
          :style="{ width: columnWidth + 'px' }"
        >
          <div
            v-for="(height, idx) in column"
            :key="idx"
            class="skeleton-block"
            :style="{ height: height + 'px' }"
          ></div>
        </div>
      </template>

      <!-- 真实图片瀑布流 -->
      <template v-else>
        <div
          v-for="(column, colIndex) in imageColumns"
          :key="'img-' + colIndex"
          class="gallery-column"
          :style="{ width: columnWidth + 'px' }"
        >
          <div
            v-for="(img, imgIndex) in column"
            :key="imgIndex"
            class="image-card"
            :style="{ height: img.height + 'px' }"
          >
            <div
              class="image-skeleton"
              :class="{ 'skeleton-hidden': loadedImages[img.workId || img.src] }"
            ></div>
            <img
              :src="img.src"
              :alt="img.alt || ''"
              class="gallery-image"
              :class="{ 'image-loaded': loadedImages[img.workId || img.src] }"
              loading="lazy"
              @load="onImageLoad(img)"
              @error="onImageError(img)"
              @click="emit('image-click', img)"
            />
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ---------- Props ----------
const props = defineProps({
  externalImages: { type: Array, default: () => [] },
  columnWidth: { type: Number, default: 300 },
  pinOffsetTop: { type: Number, default: 0 },
})

const emit = defineEmits(['image-click'])

// ---------- Constants ----------
// 骨架屏列数，确保水平滚动距离足够覆盖宽屏
const COLUMNS_COUNT = 16
// 5 档基础高度，构建列内视觉节奏差异，避免同列图片高度雷同
const BASE_HEIGHTS = [260, 310, 360, 410, 460]
// 列内图片之间的垂直间距
const COLUMN_GAP = 8

// ---------- Refs ----------
const sectionRef = ref(null)
const trackRef = ref(null)
const images = ref([])
const skeletonColumns = ref([])
const activeColumns = ref(0)

// Per-image loading state: tracks which images have loaded (or errored)
const loadedImages = reactive({})

const onImageLoad = (img) => {
  loadedImages[img.workId || img.src] = true
}

const onImageError = (img) => {
  loadedImages[img.workId || img.src] = true
}
let scrollTriggerInstance = null
let lastTotalWidth = 0

// ---------- Skeleton ----------
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const buildSkeleton = () => {
  const cols = COLUMNS_COUNT
  const columnData = []
  let lastNonEmpty = -1
  for (let i = 0; i < cols; i++) {
    const itemsCount = rand(3, 6)
    const heights = Array.from({ length: itemsCount }, () => rand(100, 400))
    columnData.push(heights)
    if (heights.length > 0) lastNonEmpty = i
  }
  skeletonColumns.value = columnData
  activeColumns.value = lastNonEmpty + 1
}

// ---------- Data sync ----------
watch(() => props.externalImages, (newVal) => {
  images.value = newVal
  // Reset per-image load state for new data
  Object.keys(loadedImages).forEach(key => delete loadedImages[key])
}, { deep: true })

// ---------- Column layout ----------
// 将平铺图片数组按 90% 视口高度分列，列内高度随机、列尾自适应填满
// 算法：每列累计高度接近 CONTAINER_HEIGHT 时换列，最后一张拉伸/收缩到刚好贴底
const imageColumns = computed(() => {
  // 取视口 90% 高度作为列容器，预留顶部 NavBar + 底部间距
  const CONTAINER_HEIGHT = window.innerHeight * 0.9
  const columnsArr = []
  let currentColHeight = 0
  // 追踪当前列已使用的高度档位，优先选择未出现过的档位增加视觉变化
  let usedHeightsInCol = new Set()

  columnsArr.push([])

  images.value.forEach((img) => {
    const currentCol = columnsArr[columnsArr.length - 1]
    const projectedHeight = currentColHeight + (currentColHeight > 0 ? COLUMN_GAP : 0)
    const remainingSpace = CONTAINER_HEIGHT - projectedHeight

    let currentHeight

    // 剩余空间 < 350px 时触发列尾自适应：最后一张直接填满剩余空间（保底 160px）
    if (remainingSpace < 350) {
      currentHeight = Math.max(remainingSpace, 160)
      currentCol.push({ ...img, height: currentHeight })
      columnsArr.push([])
      currentColHeight = 0
      usedHeightsInCol.clear()
    } else {
      // 从 5 档高度中随机选取，优先排除本列已出现的档位
      const availableHeights = BASE_HEIGHTS.filter(h => !usedHeightsInCol.has(h))
      if (availableHeights.length === 0) usedHeightsInCol.clear()

      const pool = availableHeights.length > 0 ? availableHeights : BASE_HEIGHTS
      currentHeight = pool[Math.floor(Math.random() * pool.length)]
      usedHeightsInCol.add(currentHeight)

      // 二次校验：如果随机高度导致溢出，同样执行自适应换列
      if (projectedHeight + currentHeight > CONTAINER_HEIGHT) {
        currentHeight = Math.max(remainingSpace, 160)
        currentCol.push({ ...img, height: currentHeight })
        columnsArr.push([])
        currentColHeight = 0
        usedHeightsInCol.clear()
      } else {
        currentCol.push({ ...img, height: currentHeight })
        currentColHeight = projectedHeight + currentHeight
      }
    }
  })

  // 移除末尾空列（最后一列恰好填满时会产生）
  if (columnsArr.length > 1 && columnsArr[columnsArr.length - 1].length === 0) {
    columnsArr.pop()
  }

  activeColumns.value = columnsArr.length
  return columnsArr
})

// ---------- ScrollTrigger ----------
// 核心：将垂直滚动映射为 track 的水平 translateX，pin 住画廊容器
// scrub: 0.6 — 跟手但保留平滑过渡，避免 1s 滞后感
// invalidateOnRefresh — 窗口 resize 后重新计算起止位置，防止错位
// anticipatePin: false — 避免快速滚过时触发预判导致抽搐
const initOrRefreshScrollTrigger = () => {
  nextTick(() => {
    const track = trackRef.value
    if (!track) return

    const cols = activeColumns.value || COLUMNS_COUNT
    const currentTotalWidth = cols * props.columnWidth
    const scrollDistance = currentTotalWidth - window.innerWidth

    if (scrollDistance <= 0) {
      if (scrollTriggerInstance) {
        scrollTriggerInstance.kill()
        scrollTriggerInstance = null
        lastTotalWidth = 0
      }
      return
    }

    if (lastTotalWidth !== currentTotalWidth) {
      if (scrollTriggerInstance) {
        scrollTriggerInstance.kill()
        scrollTriggerInstance = null
      }

      const startValue = props.pinOffsetTop > 0
        ? `top top+=${props.pinOffsetTop}`
        : 'top top'

      scrollTriggerInstance = gsap.to(track, {
        x: -scrollDistance,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.value,
          start: startValue,
          end: () => `+=${scrollDistance}`,
          scrub: 0.6,
          pin: true,
          anticipatePin: false,
          pinSpacing: true,
          invalidateOnRefresh: true,
          id: 'waterfall-gallery',
        },
      })

      lastTotalWidth = currentTotalWidth
    } else {
      ScrollTrigger.refresh()
    }
  })
}

watch(images, () => {
  initOrRefreshScrollTrigger()
})

const onResize = () => {
  if (images.value.length === 0) buildSkeleton()
  ScrollTrigger.refresh()
}

onMounted(() => {
  buildSkeleton()
  // 如果父组件在挂载前已有数据（SSR/缓存场景），直接同步
  if (props.externalImages && props.externalImages.length > 0) {
    images.value = props.externalImages
  }

  // 延迟 300ms 初始化 ScrollTrigger —— 等待上方 sticky hero 完成布局，
  // 确保 trigger 的起始位置计算不被未稳定的 DOM 高度干扰
  setTimeout(() => {
    initOrRefreshScrollTrigger()
    ScrollTrigger.refresh()
  }, 300)

  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill()
    scrollTriggerInstance = null
  }
})
</script>

<style scoped>
/* 画廊容器 —— pin 的目标元素，固定 90vh 高度使每列可见范围一致 */
.waterfall-gallery {
  position: relative;
  width: 100%;
  height: 90vh;
  overflow: hidden;
  border-radius: 20px;
}

/* 水平轨道 —— GSAP 驱动 translateX，提升到独立合成层避免重绘 */
.gallery-track {
  display: flex;
  height: 100%;
  will-change: transform;
  transition: none; /* 防止 CSS transition 与 GSAP scrub 冲突产生抖动 */
}

.gallery-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 4px;
  flex-shrink: 0;
}

/* 骨架屏 —— 渐变动画模拟数据加载中的占位效果 */
.skeleton-block {
  width: 100%;
  background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  border-radius: 8px;
  animation: skeletonShimmer 1.8s infinite ease-in-out;
}

@keyframes skeletonShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 图片卡片 —— 包裹图片和骨架屏的容器 */
.image-card {
  position: relative;
  width: 100%;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

/* 单图骨架屏 —— 与全局骨架屏共用 shimmer 动画，绝对定位覆盖卡片 */
.image-skeleton {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  border-radius: 8px;
  animation: skeletonShimmer 1.8s infinite ease-in-out;
  opacity: 1;
  transition: opacity 0.5s ease;
  z-index: 1;
}

.image-skeleton.skeleton-hidden {
  opacity: 0;
  pointer-events: none;
}

/* 真实图片 —— 初始透明，加载完成后淡入 */
.gallery-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.5s ease, transform 0.3s ease;
}

.gallery-image.image-loaded {
  opacity: 1;
}

.gallery-image.image-loaded:hover {
  transform: scale(1.02);
}
</style>
