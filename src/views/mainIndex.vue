<script setup>
import { onMounted, onUnmounted, watch, ref } from 'vue'
import { useRouter } from 'vue-router'

import NavBar from '@/components/NavBar.vue'
import Waterfall from '@/components/Waterfall.vue'

import {
  useCopyAnimation,
  useArrowAnimation,
  useLinkCardAnimation,
  useNum3zAnimation,
  useNum4zAnimation,
  useSwiper,
} from '@/composables/mainIndex.js'
import { useWorkWaterfall } from '@/composables/useWorkWaterfall.js'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { showError } from '@/utils/notification'

const router = useRouter()

// --- Refs ---
const swiperContainer = ref(null)

// --- Composables ---
const { initCopyAnimation, cleanupCopyAnimation } = useCopyAnimation()
const { triggerArrowAnimation, cleanupArrowAnimation } = useArrowAnimation()
const { initLinkCardAnimation, cleanupLinkCardAnimation } = useLinkCardAnimation()
const { initNum3zAnimation, cleanupNum3zAnimation } = useNum3zAnimation()
const { initNum4zAnimation, cleanupNum4zAnimation } = useNum4zAnimation()
const { initSwiper, cleanupSwiper } = useSwiper(swiperContainer)
const { waterfallImages, isLoading, error, loadWorks } = useWorkWaterfall()

// --- Watchers ---
// API 异常 → 弹出通知提示
watch(error, (newError) => {
  if (newError) {
    showError(newError)
  }
})

// 图片加载完成后刷新所有 ScrollTrigger —— 图片高度变化会影响已有的 trigger 起止位置
watch(isLoading, (loading) => {
  if (!loading) {
    ScrollTrigger.refresh()
  }
})

// --- Handlers ---
// 瀑布流图片点击 → 携带作品信息跳转详情页
// 通过 query 传图，避免详情页二次请求（后续可切换为按 workId 拉取）
const handleImageClick = (imgData) => {
  if (!imgData.workId) return
  router.push({
    name: 'workDetail',
    params: { id: imgData.workId },
    query: {
      img: imgData.src,
      title: imgData.workTitle || '',
    },
  })
}

// --- Lifecycle ---
onMounted(() => {
  initCopyAnimation()
  initLinkCardAnimation()
  initSwiper()
  // 初始加载第一页作品数据
  loadWorks({ reset: true })

  // 延迟 500ms 初始化 num3z 动画 —— Waterfall 的 ScrollTrigger 在 ~300ms 后创建，
  // 需要等它完成后再注册新的 ScrollTrigger，避免多个 trigger 同时计算导致位置争夺
  setTimeout(() => {
    initNum3zAnimation()
  }, 500)
  // num4z 在 num3z 之后，延迟 600ms 确保前面的 ScrollTrigger 全部就绪
  setTimeout(() => {
    initNum4zAnimation()
  }, 600)
})

onUnmounted(() => {
  cleanupCopyAnimation()
  cleanupArrowAnimation()
  cleanupLinkCardAnimation()
  cleanupNum3zAnimation()
  cleanupNum4zAnimation()
  cleanupSwiper()
})
</script>

<template>
  <NavBar />

  <section id="num1z">
    <div class="n1_showzone">
      <!-- 视频背景 -->
      <video
        src="../assets/Video/灰质海滩.mp4"
        autoplay
        muted
        loop
        playsinline
        disablePictureInPicture
        controlslist="nodownload nofullscreen noremoteplayback"
      ></video>

      <!-- 文案展示 -->
      <div class="n1_showCopy1"></div>
      <div class="n1_showCopy2"></div>

      <div class="n1_btn" @mouseenter="triggerArrowAnimation">
        <div class="n1_btn_arrow">
          <svg
            t="1778551186497"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="1800"
            width="20"
            height="20"
          >
            <path
              d="M292.571429 209.334857a65.828571 65.828571 0 0 1 14.482285-41.472 55.881143 55.881143 0 0 1 82.870857-5.997714l321.462858 302.665143 5.485714 5.924571a66.194286 66.194286 0 0 1-5.485714 89.014857L389.851429 862.061714a51.492571 51.492571 0 0 1-17.334858 11.337143 60.489143 60.489143 0 0 1-21.284571 4.315429C318.829714 877.714286 292.571429 849.481143 292.571429 814.592V209.334857z"
              p-id="1801"
              fill="#e6e6e6"
            ></path>
          </svg>
        </div>
        <p>我们为什么要制作&nbsp;</p>
        <p>pixel - vision</p>
      </div>

      <!-- 跳转卡片 -->
      <div class="n1_linkcard">
        <div class="link-card-item">
          <svg
            class="card-icon"
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
          >
            <path
              d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"
              fill="currentColor"
            />
            <path
              d="M512 256c-141.4 0-256 114.6-256 256s114.6 256 256 256 256-114.6 256-256-114.6-256-256-256zm0 448c-106 0-192-86-192-192s86-192 192-192 192 86 192 192-86 192-192 192z"
              fill="currentColor"
            />
          </svg>
          <span class="card-title">订阅</span>
          <p class="card-desc">支持我们，优享特权</p>
        </div>
        <div class="link-card-item">
          <svg
            class="card-icon"
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
          >
            <path
              d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"
              fill="currentColor"
            />
            <path
              d="M704 384L512 576 320 384l-64 64 256 256 256-256z"
              fill="currentColor"
            />
          </svg>
          <span class="card-title">俯瞰像素视觉</span>
          <p class="card-desc">站在巨人的肩膀上，追求视觉的质感</p>
        </div>
        <div class="link-card-item">
          <svg
            class="card-icon"
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
          >
            <path
              d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"
              fill="currentColor"
            />
            <path
              d="M512 256c-141.4 0-256 114.6-256 256s114.6 256 256 256 256-114.6 256-256-114.6-256-256-256zm-128 256c0 70.7 57.3 128 128 128s128-57.3 128-128-57.3-128-128-128-128 57.3-128 128z"
              fill="currentColor"
            />
          </svg>
          <span class="card-title">加入我们</span>
          <p class="card-desc">加入我们，成为美的缔造者</p>
        </div>
      </div>
    </div>
  </section>

  <section id="num2z">
    <div class="water_fall">
      <!-- pinOffsetTop=70 对应 NavBar 高度，pin 开始时画廊顶部刚好贴着导航栏下沿 -->
      <Waterfall
        :external-images="waterfallImages"
        :pin-offset-top="70"
        @image-click="handleImageClick"
      />
      <div v-if="isLoading" class="loading-tip">加载中...</div>
    </div>
  </section>

  <section id="num2z_2">
    <div class="view-more-btn">
      <span>查看更多</span>
      <svg
        class="arrow-icon"
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
      >
        <path
          d="M512 896l-64-64 256-256H128v-96h576L448 224l64-64 384 384z"
          fill="currentColor"
        />
      </svg>
    </div>
  </section>

  <section id="num3z">
    <hr>
    <p>Wait a moment. Would you like to know more?</p>

    <h1>Every collection tells a story .</h1>
    <div>
      <span>视觉的归档,&nbsp;&nbsp;&nbsp;</span>
      <span>从灵感碎片到册集的沉淀,&nbsp;&nbsp;&nbsp;</span>
      <span>Curated works 。</span>
    </div>

    <div class="n3_showIMG">
      <div class="swiper-container" ref="swiperContainer">
        <div class="swiper-wrapper">
          <div v-for="index in 9" :key="index" class="swiper-slide">
            <div class="slide-card">
              <div class="placeholder-card"></div>
              <div class="slide-caption">
                <h3 class="caption-title">精选合集 {{ index }}</h3>
                <p class="caption-desc">探索摄影机的无限魅力，感受每一帧画面的生命力与艺术价值</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="num4z">
    <h1>Let every scattered fragment of creativity dwell in eternity .</h1>
    <div class="n4_font">
      <span>留住每一份灵动创意, 让细碎灵感恒久留存</span>
    </div>
    <div class="n4_GridLayout">
      <div
        v-for="item in 8"
        :key="item"
        class="grid-card"
        :class="'grid-card--' + item"
      >
        <div class="grid-card__skeleton"></div>
      </div>
    </div>
  </section>
</template>

<style>
@import url(../assets/CSS/mainIndex.css);
</style>
