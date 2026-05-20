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
          <img
            v-for="(img, imgIndex) in column"
            :key="imgIndex"
            :src="img.src"
            :alt="img.alt || ''"
            :style="{ height: img.height + 'px', width: '100%' }"
            loading="lazy"
          />
        </div>
      </template>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

//todo 组件所需要的参数
// ---------- Props ----------
const props = defineProps({
  externalImages: { type: Array, default: () => [] }, // 需要插入的图片数据
  columnWidth: { type: Number, default: 300 },
  // 提前触发距离：当画廊顶部距离视口顶部还有该像素时就固定并开始水平滚动
  pinOffsetTop: { type: Number, default: 0 }
})

const COLUMNS_COUNT = 16
const sectionRef = ref(null)
const trackRef = ref(null)
const images = ref([])
const skeletonColumns = ref([])
const activeColumns = ref(0)
let scrollTriggerInstance = null
let lastTotalWidth = 0

const generateRandomHeights = (min = 100, max = 400, count = 4) => {
  const heights = []
  for (let i = 0; i < count; i++) {
    heights.push(Math.floor(Math.random() * (max - min + 1)) + min)
  }
  return heights
}

const buildSkeleton = () => {
  const cols = COLUMNS_COUNT
  const columnData = []
  let lastNonEmpty = -1
  for (let i = 0; i < cols; i++) {
    const itemsCount = Math.floor(Math.random() * 4) + 3
    const heights = generateRandomHeights(100, 400, itemsCount)
    columnData.push(heights)
    if (heights.length > 0) lastNonEmpty = i
  }
  skeletonColumns.value = columnData
  activeColumns.value = lastNonEmpty + 1
}

watch(() => props.externalImages, (newVal) => {
  console.log('[Waterfall Component] Props 变化，新数据条数:', newVal.length);
  images.value = newVal;
}, { deep: true });

const imageColumns = computed(() => {
  console.log('[Waterfall Component] 接收到的图片数据条数:', images.value.length);
  if (images.value.length > 0) {
    console.log('[Waterfall Component] 第一张图片数据:', images.value[0]);
  }

  const cols = COLUMNS_COUNT
  const columnsArr = Array.from({ length: cols }, () => [])
  const columnHeights = new Array(cols).fill(0)
  images.value.forEach((img) => {
    let minIndex = 0
    for (let i = 1; i < cols; i++) {
      if (columnHeights[i] < columnHeights[minIndex]) minIndex = i
    }
    columnsArr[minIndex].push(img)
    columnHeights[minIndex] += img.height
  })
  const lastNonEmpty = columnsArr.reduce((lastIdx, col, idx) => (col.length > 0 ? idx : lastIdx), -1)
  activeColumns.value = lastNonEmpty + 1
  return columnsArr
})

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
          scrub: 1,               // 完全跟手，消除回弹延迟
          pin: true,
          anticipatePin: false,      // 避免快速切换时的抖动
          pinSpacing: true,
          fastScrollEnd: true,       // 快速滚动后立即到达最终位置
          invalidateOnRefresh: true,
          id: 'waterfall-gallery'
        }
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
  console.log('[Waterfall Component] 组件挂载，初始 externalImages 条数:', props.externalImages.length);
  if (props.externalImages && props.externalImages.length > 0) {
    images.value = props.externalImages
  }

  // 延迟初始化，确保上方内容完全渲染后再设置滚动触发，避免位置偏移
  setTimeout(() => {
    initOrRefreshScrollTrigger()
    ScrollTrigger.refresh()  // 再次全局刷新，消除可能的位置偏移
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
.waterfall-gallery {
  position: relative;
  width: 100%;
  height: 90vh;
  overflow: hidden;
  border-radius: 20px;
}

.gallery-track {
  display: flex;
  height: 100%;
  will-change: transform;
  transition: none; /* 防止 CSS 过渡干扰 GSAP */
}

.gallery-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 4px;
  flex-shrink: 0;
}

.skeleton-block {
  width: 100%;
  background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  border-radius: 8px;
  animation: shimmer 1.8s infinite ease-in-out;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.gallery-column img {
  display: block;
  width: 100%;
  object-fit: cover;
  border-radius: 8px;
  background-color: #e0e0e0;
  transition: transform 0.3s ease;
}

.gallery-column img:hover {
  transform: scale(1.02);
}
</style>