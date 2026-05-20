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
  // 1. 基础高度随机池
  const baseHeights = [260, 310, 360, 410, 460]
  const CONTAINER_HEIGHT = window.innerHeight * 0.9
  const gap = 8

  const columnsArr = []
  let currentColHeight = 0
  let usedHeightsInCol = new Set() // 追踪当前列已使用的高度档位

  // 初始化第一列
  columnsArr.push([])

  images.value.forEach((img, index) => {
    const currentCol = columnsArr[columnsArr.length - 1]
    
    // 计算当前列加入间距后的预估高度
    const projectedHeight = currentColHeight + (currentColHeight > 0 ? gap : 0)
    const remainingSpace = CONTAINER_HEIGHT - projectedHeight

    let currentHeight

    // 3.2 列尾自适应逻辑：当剩余空间小于 350px 时触发
    if (remainingSpace < 350) {
      // 直接将当前图片高度设为剩余空间大小（最小保底 160px）
      currentHeight = Math.max(remainingSpace, 160)
      
      const imgWithHeight = { ...img, height: currentHeight }
      currentCol.push(imgWithHeight)
      
      // 当前列已满，开启新的一列供下一张图片使用
      columnsArr.push([])
      currentColHeight = 0
      usedHeightsInCol.clear() // 重置已用高度记录
    } else {
      // 3.1 基础高度随机池：从 5 个档位中随机选取（排除本列已出现的）
      const availableHeights = baseHeights.filter(h => !usedHeightsInCol.has(h))
      
      // 如果所有档位都用过了，则重置集合允许重复
      if (availableHeights.length === 0) {
        usedHeightsInCol.clear()
      }
      
      // 从可用档位中随机选取
      const pool = availableHeights.length > 0 ? availableHeights : baseHeights
      currentHeight = pool[Math.floor(Math.random() * pool.length)]
      usedHeightsInCol.add(currentHeight)
      
      // 二次检查：如果随机高度导致溢出，也执行自适应并换列
      if (projectedHeight + currentHeight > CONTAINER_HEIGHT) {
        currentHeight = Math.max(remainingSpace, 160)
        const imgWithHeight = { ...img, height: currentHeight }
        currentCol.push(imgWithHeight)
        
        // 开启新列
        columnsArr.push([])
        currentColHeight = 0
        usedHeightsInCol.clear()
      } else {
        // 正常放入当前列
        const imgWithHeight = { ...img, height: currentHeight }
        currentCol.push(imgWithHeight)
        currentColHeight = projectedHeight + currentHeight
      }
    }
  })

  // 移除最后一个可能为空的列
  if (columnsArr.length > 1 && columnsArr[columnsArr.length - 1].length === 0) {
    columnsArr.pop()
  }

  activeColumns.value = columnsArr.length
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