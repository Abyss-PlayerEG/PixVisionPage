<script setup>
import { onMounted, onUnmounted, watch, ref } from 'vue'
import { useRouter } from 'vue-router'

import NavBar from '@/components/NavBar.vue'
import Waterfall from '@/components/Waterfall.vue'

import {
  useCopyAnimation,
  useArrowAnimation,
  useN1ImageEffect,
  useLinkCardAnimation,
  useNum3zAnimation,
  useNum4zAnimation,
  useNum5zAnimation,
  useN5ShowzoneAnimation,
  useN5ProgAnimation,
  useNum6zAnimation,
  useNum7zAnimation,
  useSwiper,
} from '@/composables/mainIndex.js'
import { useWorkWaterfall } from '@/composables/useWorkWaterfall.js'
import { useSeriesData } from '@/composables/useSeriesData.js'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { showError } from '@/utils/notification'

const router = useRouter()

// --- Refs ---
const swiperContainer = ref(null)

// --- Composables ---
const { initCopyAnimation, cleanupCopyAnimation } = useCopyAnimation()
const { triggerArrowAnimation, cleanupArrowAnimation } = useArrowAnimation()
const { initN1ImageEffect, cleanupN1ImageEffect } = useN1ImageEffect()
const { initLinkCardAnimation, cleanupLinkCardAnimation } = useLinkCardAnimation()
const { initNum3zAnimation, cleanupNum3zAnimation } = useNum3zAnimation()
const { initNum4zAnimation, cleanupNum4zAnimation } = useNum4zAnimation()
const { initNum5zAnimation, cleanupNum5zAnimation, mockNum5z } = useNum5zAnimation()
const { initN5ShowzoneAnimation, cleanupN5ShowzoneAnimation } = useN5ShowzoneAnimation()
const { initN5ProgAnimation, cleanupN5ProgAnimation } = useN5ProgAnimation()
const { initNum6zAnimation, cleanupNum6zAnimation, n6Copy1Words, n6Copy2Words } = useNum6zAnimation()
const expandedFAQs = ref(new Set())
const { initNum7zAnimation, cleanupNum7zAnimation, mockNum7zQA, mockNum7zFAQ, n7Copy1Words, n7Copy2Words, toggleFAQ } = useNum7zAnimation(expandedFAQs)
const { initSwiper, cleanupSwiper } = useSwiper(swiperContainer)
const { waterfallImages, isLoading, error, loadWorks } = useWorkWaterfall()
const { seriesList, isLoading: seriesLoading, error: seriesError, loadSeries } = useSeriesData()

// --- Watchers ---
// API 异常 → 弹出通知提示
watch(error, (newError) => {
  if (newError) {
    showError(newError)
  }
})

// 系列数据加载异常 → 弹出通知提示
watch(seriesError, (newError) => {
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
// 合集卡片点击 → 跳转 Gallery 预览
const handleSeriesClick = (series) => {
  if (series?.series_id) {
    router.push({ path: '/gallery', query: { seriesId: series.series_id, title: series.series_title || '' } })
  }
}

// 瀑布流图片点击 → 携带作品信息跳转详情页
// 传递 imgUrl（全尺寸图）用于详情页展示，src（缩略图）用于快速预览
const handleImageClick = (imgData) => {
  if (!imgData.workId) return
  router.push({
    name: 'workDetail',
    params: { id: imgData.workId },
    query: {
      img: imgData.imgUrl || imgData.src,
      title: imgData.workTitle || '',
    },
  })
}

// --- Lifecycle ---
onMounted(() => {
  initN1ImageEffect()
  initCopyAnimation()
  initLinkCardAnimation()
  initSwiper()
  // 初始加载第一页作品数据
  loadWorks({ reset: true })
  
  // 加载系列数据（用于n3_showIMG合集部分）
  // 这里使用一个示例用户ID，实际应该从用户状态或路由参数获取
  loadSeries({ userId: 1, size: 9, reset: true })

  // 延迟 500ms 初始化 num3z 动画 —— Waterfall 的 ScrollTrigger 在 ~300ms 后创建，
  // 需要等它完成后再注册新的 ScrollTrigger，避免多个 trigger 同时计算导致位置争夺
  setTimeout(() => {
    initNum3zAnimation()
  }, 500)
  // num4z 在 num3z 之后，延迟 600ms 确保前面的 ScrollTrigger 全部就绪
  setTimeout(() => {
    initNum4zAnimation()
  }, 600)
  setTimeout(() => {
    initNum5zAnimation()
    initN5ShowzoneAnimation()
    initN5ProgAnimation()
  }, 700)
  setTimeout(() => {
    initNum6zAnimation()
  }, 800)
  setTimeout(() => {
    initNum7zAnimation()
  }, 900)
})

onUnmounted(() => {
  cleanupCopyAnimation()
  cleanupN1ImageEffect()
  cleanupArrowAnimation()
  cleanupLinkCardAnimation()
  cleanupNum3zAnimation()
  cleanupNum4zAnimation()
  cleanupNum5zAnimation()
  cleanupN5ShowzoneAnimation()
  cleanupN5ProgAnimation()
  cleanupNum6zAnimation()
  cleanupNum7zAnimation()
  cleanupSwiper()
})

</script>

<template>
  <NavBar />

  <section id="num1z">
    <div class="n1_showzone">
      <!-- 视频背景 -->
      <!-- <video
        src="../assets/Video/灰质海滩.mp4"
        autoplay
        muted
        loop
        playsinline
        disablePictureInPicture
        controlslist="nodownload nofullscreen noremoteplayback"
      ></video> -->

      <!-- 图片背景：林间雾野 -->
      <div class="n1_bg_wrap"><img class="n1_bg" src="../assets/IMG/林间雾野.jpg" alt="" /></div>

      <!-- 底部抠图层叠 -->
      <div class="n1_bg_bottom_wrap"><img class="n1_bg_bottom" src="../assets/IMG/林间雾野bottom.png" alt="" /></div>

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
    <div class="view-more-btn" @click="router.push('/search')">
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
          <!-- 加载状态 -->
          <div v-if="seriesLoading" class="swiper-slide">
            <div class="slide-card">
              <div class="placeholder-card"></div>
              <div class="slide-caption">
                <h3 class="caption-title">加载中...</h3>
                <p class="caption-desc">正在获取合集数据</p>
              </div>
            </div>
          </div>
          
          <!-- 系列数据 -->
          <div v-else-if="seriesList.length > 0" v-for="series in seriesList" :key="series.series_id" class="swiper-slide" @click="handleSeriesClick(series)">
            <div class="slide-card">
              <div class="placeholder-card">
                <img v-if="series.coverUrl" :src="series.coverUrl" :alt="series.series_title" />
              </div>
              <div class="slide-caption">
                <h3 class="caption-title">{{ series.series_title }}</h3>
                <p class="caption-desc">{{ series.about_text || '探索这个合集的精彩内容' }}</p>
              </div>
            </div>
          </div>
          
          <!-- 无数据状态 -->
          <div v-else class="swiper-slide">
            <div class="slide-card">
              <div class="placeholder-card"></div>
              <div class="slide-caption">
                <h3 class="caption-title">暂无合集</h3>
                <p class="caption-desc">还没有创建任何合集</p>
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

  <section id="num5z">
    <div class="num5z">
      <div class="n5_showzone">
        <div class="n5_item">
          <svg t="1779516670205" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11696" width="50" height="50"><path d="M956.15 68.81c-21-21-50.04-31.96-79.67-30.09l-393.84 24.9c-5.67 0.36-10.63 3.06-14.03 7.09-0.45 0.38-0.9 0.77-1.32 1.2L72.64 466.54c-46.79 46.79-46.79 122.92 0 169.71l315.92 315.92c46.79 46.79 122.92 46.79 169.71 0l397.28-397.28c0.45-0.45 0.87-0.92 1.28-1.42 0.14-0.17 0.27-0.36 0.41-0.53 0.25-0.32 0.49-0.64 0.72-0.98 0.15-0.22 0.29-0.45 0.43-0.67 0.19-0.31 0.38-0.62 0.55-0.93 0.13-0.24 0.26-0.49 0.38-0.74 0.16-0.31 0.3-0.63 0.44-0.95 0.11-0.26 0.22-0.51 0.31-0.78 0.12-0.32 0.24-0.65 0.34-0.98 0.09-0.27 0.17-0.54 0.25-0.81 0.09-0.33 0.17-0.66 0.24-0.99 0.06-0.29 0.13-0.58 0.18-0.87 0.06-0.32 0.1-0.64 0.14-0.96 0.04-0.31 0.08-0.62 0.1-0.93 0.01-0.11 0.03-0.21 0.04-0.32l24.87-393.53c1.88-29.65-9.08-58.69-30.08-79.69z m-203.54 203.4c48.82 48.82 48.82 127.96 0 176.78-48.82 48.82-127.96 48.82-176.78 0s-48.82-127.96 0-176.78 127.96-48.82 176.78 0z" fill="#1a1a1a" p-id="11697"></path></svg>
          <div>Design Concept</div>
        </div>

        <h3>Draw on your valuable advice, </h3>
        <h3>craft our exclusive creativity.</h3>
        <h1>您的建议, 我们的创意</h1>
      </div>

      <!-- 进度条小组件 -->
      <div class="n5_prog" v-for="item in mockNum5z" :key="item.id" :style="{ top: item.top, left: item.left }">
        <div class="n5p">
          <div class="n5p_cirItem">
            <svg t="1779530013933" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7158" width="20" height="20"><path d="M598.6304 273.8176c10.24-27.8528-4.096-59.1872-33.3824-64.4096a307.2 307.2 0 1 0 249.6512 251.4944c-4.9152-29.2864-36.1472-43.9296-64.1024-33.8944-28.0576 9.9328-41.7792 40.8576-39.6288 70.4512a199.68 199.68 0 1 1-183.296-184.5248c29.696 2.3552 60.6208-11.264 70.7584-39.1168z" p-id="7159" fill="#1a1a1a"></path></svg>
          </div>
          <p>{{item.text}}</p><span>&nbsp;...</span>
        </div>

        <div class="n5p_prog">
          <div class="n5p_progItem" :style="{ backgroundColor: item.color }"></div>
        </div>
      </div>

    </div>
  </section>

  <section id="num6z">
    <div class="num6z">
      <div class="n6_copy">
        <template v-for="(word, i) in n6Copy1Words" :key="'a'+i">
          <!-- The: 绿色药丸 + 笑脸 SVG 左 + 文字右 -->
          <span v-if="i === 0" class="n6_badge n6_badge--smile">
            <svg class="n6_badge-icon" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
            <span class="n6_badge-text">{{ word }}</span>
          </span>
          <!-- Pixel: 渐变上色文字 -->
          <span v-else-if="i === 1" class="n6_word-wrapper">
            <span class="n6_pill"></span>
            <span class="n6_word n6_word--gradient">{{ word }}</span>
          </span>
          <!-- 普通词 -->
          <span v-else class="n6_word-wrapper">
            <span class="n6_pill"></span>
            <span class="n6_word">{{ word }}</span>
          </span>
        </template>
      </div>

      <div class="n6_copy">
        <template v-for="(word, i) in n6Copy2Words" :key="'b'+i">
          <!-- oneself: 绿色药丸 + 文字 -->
          <span v-if="word === 'oneself'" class="n6_badge n6_badge--text">
            <span class="n6_badge-text">{{ word }}</span>
          </span>
          <!-- vision: 渐变上色文字 -->
          <span v-else-if="word === 'vision'" class="n6_word-wrapper">
            <span class="n6_pill"></span>
            <span class="n6_word n6_word--gradient">{{ word }}</span>
          </span>
          <!-- 普通词 -->
          <span v-else class="n6_word-wrapper">
            <span class="n6_pill"></span>
            <span class="n6_word">{{ word }}</span>
          </span>
        </template>
      </div>
    </div>
  </section>

  <section id="num7z">
    <div class="n7_showCopy">
      <h1><span>Hey, stop daydreaming!</span><span>Come join us.</span></h1>
      <h2>别让等待成为遗憾,加入我们</h2>
      <div class="n7_icon">
        <div>
          <svg t="1779760846284" class="icon" viewBox="0 0 1040 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="15855" width="40" height="40"><path d="M995.155045 597.676311C949.782671 304.637232 860.250542 20.487613 562.470485 20.487613 16.832364 20.425192 0 900.704906 0 900.704906l201.912639 0c0 0 146.614196 101.053534 245.172909 101.053534 98.553597 0 72.127737-101.053534 72.127737-101.053534l100.922551 0c0 0-7.234775 101.053534 72.059176 101.053534 115.38596 0 230.708476-84.157725 245.172909-101.053534 14.462387-16.832364 86.590124 0 86.590124 0S1025.044796 790.9502 995.155045 597.676311L995.155045 597.676311zM621.541859 754.727207c-248.694105 0-273.972838-145.338133-273.972838-324.658218S470.251154 105.347327 621.541859 105.347327c176.570461 0 273.972838 145.400554 273.972838 324.720639S882.843096 754.727207 621.541859 754.727207L621.541859 754.727207zM621.541859 754.727207" fill="#1a1a1a" p-id="15856"></path><path d="M447.849958 354.680998c0 39.83117 32.295544 72.127737 72.127737 72.127737s72.127737-32.295544 72.127737-72.127737-32.295544-72.126714-72.127737-72.126714S447.849958 314.849828 447.849958 354.680998L447.849958 354.680998 447.849958 354.680998zM447.849958 354.680998" fill="#1a1a1a" p-id="15857"></path><path d="M620.962667 636.075877c0 19.936051 19.370163 36.097126 43.263339 36.097126 23.895223 0 43.264363-16.161075 43.264363-36.097126 0-19.930935-19.370163-36.09201-43.264363-36.09201C640.33283 599.98489 620.962667 616.144942 620.962667 636.075877L620.962667 636.075877zM620.962667 636.075877" fill="#1a1a1a" p-id="15858"></path><path d="M707.491393 354.680998c0 39.83117 29.05064 72.127737 64.891939 72.127737 35.837206 0 64.892963-32.295544 64.892963-72.127737s-29.055756-72.126714-64.892963-72.126714C736.542033 282.555308 707.491393 314.849828 707.491393 354.680998L707.491393 354.680998zM707.491393 354.680998" fill="#1a1a1a" p-id="15859"></path></svg>
          <p>Gather</p>
        </div>
        
        <div>
          <svg t="1779761671115" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1140" width="40" height="40"><path d="M712.1 333.19c-28.35-23.4-62.57-59.39-89.66-129.07-5.05-13-17.42-23.23-40.65-17.42-13.82 3.45-48.39 40.65-69.68 79.36-37.75 66.18-51.95 142.65-57.19 196.06-2.66 27.13-40.03 31.88-49.66 6.37-13.12-34.74-9.9-70.72-11.39-102.44-1.33-28.26-35.06-42.42-55.94-23.33-58.03 53.04-94.08 129.73-92.9 214.81 2.17 156.94 132.47 283.54 289.41 281.42 155.86-2.11 281.57-129.11 281.57-285.47 0-88.69-40.44-167.94-103.9-220.31z m-58.49 350.12s-19.25 79.57-121.11 67.41c0 0-111.91-3.87-129.15-122.42-2.44-16.82 16.03-28.81 30.32-19.63 13.99 8.98 31.2 18.46 48.9 24.38 13.19 4.41 27.17-4.14 29.62-17.83 5.31-29.67 18.26-82.26 47.91-127.15 8.98-13.6 29.66-10.96 35.19 4.37 7.85 21.77 21.1 50.58 42.57 77.87 0 0 35.77 43.26 15.74 112.99z" fill="#1a1a1a" p-id="1141"></path></svg>
          <p>Now</p>
        </div>
      </div>

      <!-- 文案&加入按钮区域 -->
      <div class="n7_showCont">

        <div class="n7_showContBtnZone">
          <div class="n7item_btn">
            参与像素创作者计划
          </div>
          <div class="n7item_self">
            <svg t="1779763553331" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6835" width="30" height="30"><path d="M927.135135 553.513514a415.135135 415.135135 0 0 0-830.27027 0 429.24973 429.24973 0 0 0 3.321081 50.231351A442.368 442.368 0 1 1 954.534054 442.810811a443.447351 443.447351 0 0 1-30.72 160.823351A427.284757 427.284757 0 0 0 927.135135 553.513514zM179.891892 553.513514a332.108108 332.108108 0 1 1 332.108108 332.108108A332.108108 332.108108 0 0 1 179.891892 553.513514z m456.648649 166.054054a41.513514 41.513514 0 0 0 0-83.027027 700.499027 700.499027 0 0 1-124.817298 27.675675 691.449081 691.449081 0 0 1-124.263784-27.675675 41.513514 41.513514 0 0 0 0 83.027027 294.054054 294.054054 0 0 0 249.081082 0z m-170.205406 246.313513A413.004108 413.004108 0 0 0 512 968.648649a422.054054 422.054054 0 0 0 45.941622-2.767568 524.011243 524.011243 0 0 0 358.123243-187.253622 412.810378 412.810378 0 0 1 38.745946 174.024649 403.400649 403.400649 0 0 1-7.472433 71.209514H76.661622A403.400649 403.400649 0 0 1 69.189189 952.652108a412.810378 412.810378 0 0 1 38.745946-174.024649A523.928216 523.928216 0 0 0 466.335135 965.881081z" p-id="6836" fill="#1a1a1a"></path></svg>
          </div>
        </div>

        <div class="n7item_cont">
          <p>
            <span v-for="(word, i) in n7Copy1Words" :key="'c'+i" class="n7_word-wrapper">
              <span class="n7_pill"></span>
              <span class="n7_word">{{ word }}</span>
            </span>
          </p>
          <p>
            <span v-for="(word, i) in n7Copy2Words" :key="'d'+i" class="n7_word-wrapper">
              <span class="n7_pill"></span>
              <span class="n7_word">{{ word }}</span>
            </span>
          </p>
        </div>
      </div>
    </div>

    <div class="n7QA">
      <!-- QA宣告 -->
      <div class="QAshowCopy">
        <h1>You ask, we answer.</h1>
        <h2>由你提问,我们知无不尽</h2>
      </div>

      <!-- QA正常对话区域 -->
      <div class="QAcont" v-for="qa in mockNum7zQA" :key="qa.id">
        <div class="n7q"><span class="n7q_text">{{ qa.question }}</span></div>
        <div class="n7a_row">
          <div class="n7a">{{ qa.answer }}</div>
          <div class="n7a_avatar">
            <svg t="1779783912162" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1130" width="32" height="32"><path d="M788.68 797.63c-26.58 0-53.16-10.12-73.4-30.35l-16.21-16.21c-26.05-26.05-68.43-26.05-94.47 0l-16.21 16.21c-40.47 40.47-106.33 40.47-146.8 0l-16.21-16.21c-26.05-26.05-68.43-26.05-94.47 0l-16.21 16.21c-40.47 40.47-106.33 40.47-146.8 0-7.22-7.22-7.22-18.94 0-26.16s18.94-7.22 26.16 0c12.62 12.62 29.39 19.57 47.24 19.57s34.62-6.95 47.24-19.57l16.21-16.21c40.47-40.47 106.33-40.47 146.8 0l16.21 16.21c26.05 26.05 68.43 26.05 94.47 0l16.21-16.21c40.47-40.47 106.32-40.47 146.8 0l16.21 16.21c12.62 12.62 29.39 19.57 47.24 19.57s34.62-6.95 47.24-19.57c7.22-7.22 18.94-7.22 26.16 0s7.22 18.94 0 26.16c-20.24 20.24-46.82 30.35-73.4 30.35z" p-id="1131" fill="#FDF9F0"></path><path d="M303.19 691.76c-3.14 0-6.32-0.8-9.23-2.48-8.85-5.11-11.88-16.42-6.78-25.27l150.84-261.4c14-24.25 34.51-43.8 59.31-56.54 24.13-12.4 51.15-17.82 78.14-15.66 3.44 0.27 6.59-1.33 8.24-4.19l33.96-58.81c-13.06-10.06-16.99-28.53-8.53-43.18l16.76-29.02c4.57-7.92 11.95-13.58 20.78-15.95 8.83-2.37 18.06-1.15 25.97 3.42l90.17 52.06c7.92 4.57 13.58 11.95 15.95 20.78s1.15 18.06-3.42 25.97l-16.75 29.02c-8.46 14.66-26.43 20.48-41.66 14.2l-33.96 58.81c-1.65 2.85-1.46 6.39 0.5 9.23a145.478 145.478 0 0 1 25.5 75.5c1.37 27.85-5.31 55.38-19.31 79.63L622.55 664.7c-5.09 8.86-16.4 11.92-25.26 6.82-8.86-5.09-11.91-16.4-6.82-25.26l67.14-116.85c10.45-18.11 15.43-38.62 14.42-59.35a108.62 108.62 0 0 0-19.02-56.33c-9.98-14.49-10.79-33.61-2.07-48.71L694 290.44a18.48 18.48 0 0 1 11.23-8.62c4.74-1.27 9.79-0.6 14.04 1.85l9.08 5.24 13.58-23.53-85.37-49.29-13.58 23.53 9.07 5.24a18.48 18.48 0 0 1 8.62 11.23c1.27 4.74 0.61 9.79-1.85 14.04l-43.06 74.58c-8.72 15.11-25.69 23.97-43.22 22.57-20.13-1.6-40.28 2.44-58.29 11.69-18.46 9.49-33.74 24.05-44.17 42.12L319.24 682.48c-3.43 5.94-9.65 9.26-16.04 9.26z" p-id="1132" fill="#FDF9F0"></path></svg>
          </div>
        </div>
        <div class="n7a_row" v-if="qa.answer2">
          <div class="n7a2">{{ qa.answer2 }}</div>
          <div class="n7a_avatar">
            <svg t="1779783912162" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1130" width="32" height="32"><path d="M788.68 797.63c-26.58 0-53.16-10.12-73.4-30.35l-16.21-16.21c-26.05-26.05-68.43-26.05-94.47 0l-16.21 16.21c-40.47 40.47-106.33 40.47-146.8 0l-16.21-16.21c-26.05-26.05-68.43-26.05-94.47 0l-16.21 16.21c-40.47 40.47-106.33 40.47-146.8 0-7.22-7.22-7.22-18.94 0-26.16s18.94-7.22 26.16 0c12.62 12.62 29.39 19.57 47.24 19.57s34.62-6.95 47.24-19.57l16.21-16.21c40.47-40.47 106.33-40.47 146.8 0l16.21 16.21c26.05 26.05 68.43 26.05 94.47 0l16.21-16.21c40.47-40.47 106.32-40.47 146.8 0l16.21 16.21c12.62 12.62 29.39 19.57 47.24 19.57s34.62-6.95 47.24-19.57c7.22-7.22 18.94-7.22 26.16 0s7.22 18.94 0 26.16c-20.24 20.24-46.82 30.35-73.4 30.35z" p-id="1131" fill="#FDF9F0"></path><path d="M303.19 691.76c-3.14 0-6.32-0.8-9.23-2.48-8.85-5.11-11.88-16.42-6.78-25.27l150.84-261.4c14-24.25 34.51-43.8 59.31-56.54 24.13-12.4 51.15-17.82 78.14-15.66 3.44 0.27 6.59-1.33 8.24-4.19l33.96-58.81c-13.06-10.06-16.99-28.53-8.53-43.18l16.76-29.02c4.57-7.92 11.95-13.58 20.78-15.95 8.83-2.37 18.06-1.15 25.97 3.42l90.17 52.06c7.92 4.57 13.58 11.95 15.95 20.78s1.15 18.06-3.42 25.97l-16.75 29.02c-8.46 14.66-26.43 20.48-41.66 14.2l-33.96 58.81c-1.65 2.85-1.46 6.39 0.5 9.23a145.478 145.478 0 0 1 25.5 75.5c1.37 27.85-5.31 55.38-19.31 79.63L622.55 664.7c-5.09 8.86-16.4 11.92-25.26 6.82-8.86-5.09-11.91-16.4-6.82-25.26l67.14-116.85c10.45-18.11 15.43-38.62 14.42-59.35a108.62 108.62 0 0 0-19.02-56.33c-9.98-14.49-10.79-33.61-2.07-48.71L694 290.44a18.48 18.48 0 0 1 11.23-8.62c4.74-1.27 9.79-0.6 14.04 1.85l9.08 5.24 13.58-23.53-85.37-49.29-13.58 23.53 9.07 5.24a18.48 18.48 0 0 1 8.62 11.23c1.27 4.74 0.61 9.79-1.85 14.04l-43.06 74.58c-8.72 15.11-25.69 23.97-43.22 22.57-20.13-1.6-40.28 2.44-58.29 11.69-18.46 9.49-33.74 24.05-44.17 42.12L319.24 682.48c-3.43 5.94-9.65 9.26-16.04 9.26z" p-id="1132" fill="#FDF9F0"></path></svg>
          </div>
        </div>
      </div>

      <!-- AlsoAsked折叠对话区域 -->
      <div class="n7QA_also">
        <div class="n7Also_header">
          <span class="n7Also_en">Also asked</span>
        </div>
        <div class="QAcont" v-for="faq in mockNum7zFAQ" :key="'faq'+faq.id">
          <div class="n7q" :class="{ n7q_outline: !expandedFAQs.has(faq.id) }" @click="toggleFAQ(faq.id)">
            <span class="n7q_text">{{ faq.question }}</span>
          </div>
          <template v-if="expandedFAQs.has(faq.id)">
            <div class="n7FAQ_a_wrap" :data-faq-a="faq.id">
              <div class="n7a_row">
                <div class="n7a">{{ faq.answer }}</div>
                <div class="n7a_avatar">
                  <svg t="1779783912162" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1130" width="32" height="32"><path d="M788.68 797.63c-26.58 0-53.16-10.12-73.4-30.35l-16.21-16.21c-26.05-26.05-68.43-26.05-94.47 0l-16.21 16.21c-40.47 40.47-106.33 40.47-146.8 0l-16.21-16.21c-26.05-26.05-68.43-26.05-94.47 0l-16.21 16.21c-40.47 40.47-106.33 40.47-146.8 0-7.22-7.22-7.22-18.94 0-26.16s18.94-7.22 26.16 0c12.62 12.62 29.39 19.57 47.24 19.57s34.62-6.95 47.24-19.57l16.21-16.21c40.47-40.47 106.33-40.47 146.8 0l16.21 16.21c26.05 26.05 68.43 26.05 94.47 0l16.21-16.21c40.47-40.47 106.32-40.47 146.8 0l16.21 16.21c12.62 12.62 29.39 19.57 47.24 19.57s34.62-6.95 47.24-19.57c7.22-7.22 18.94-7.22 26.16 0s7.22 18.94 0 26.16c-20.24 20.24-46.82 30.35-73.4 30.35z" p-id="1131" fill="#FDF9F0"></path><path d="M303.19 691.76c-3.14 0-6.32-0.8-9.23-2.48-8.85-5.11-11.88-16.42-6.78-25.27l150.84-261.4c14-24.25 34.51-43.8 59.31-56.54 24.13-12.4 51.15-17.82 78.14-15.66 3.44 0.27 6.59-1.33 8.24-4.19l33.96-58.81c-13.06-10.06-16.99-28.53-8.53-43.18l16.76-29.02c4.57-7.92 11.95-13.58 20.78-15.95 8.83-2.37 18.06-1.15 25.97 3.42l90.17 52.06c7.92 4.57 13.58 11.95 15.95 20.78s1.15 18.06-3.42 25.97l-16.75 29.02c-8.46 14.66-26.43 20.48-41.66 14.2l-33.96 58.81c-1.65 2.85-1.46 6.39 0.5 9.23a145.478 145.478 0 0 1 25.5 75.5c1.37 27.85-5.31 55.38-19.31 79.63L622.55 664.7c-5.09 8.86-16.4 11.92-25.26 6.82-8.86-5.09-11.91-16.4-6.82-25.26l67.14-116.85c10.45-18.11 15.43-38.62 14.42-59.35a108.62 108.62 0 0 0-19.02-56.33c-9.98-14.49-10.79-33.61-2.07-48.71L694 290.44a18.48 18.48 0 0 1 11.23-8.62c4.74-1.27 9.79-0.6 14.04 1.85l9.08 5.24 13.58-23.53-85.37-49.29-13.58 23.53 9.07 5.24a18.48 18.48 0 0 1 8.62 11.23c1.27 4.74 0.61 9.79-1.85 14.04l-43.06 74.58c-8.72 15.11-25.69 23.97-43.22 22.57-20.13-1.6-40.28 2.44-58.29 11.69-18.46 9.49-33.74 24.05-44.17 42.12L319.24 682.48c-3.43 5.94-9.65 9.26-16.04 9.26z" p-id="1132" fill="#FDF9F0"></path></svg>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>

  <section id="num8z">
    <div class="n8z1">
      <div class="n8_copy">
        <h1>Pixel - Vision「像素视觉」- Explore Visual Wonders</h1>
      </div>
      <div class="n8_cont">
        <div class="n8_showImgs">
          <div>
            <img src="../assets/IMG/end1.jpg" alt="">
          </div>
          <div>
            <img src="../assets/IMG/end2.jpg" alt="">
          </div>
        </div>

        <div class="n8_showCont">
          <div class="n8_fontBox">
            <p>01</p>
            <div>浏览各类图片</div>
          </div>
          <div class="n8_fontBox">
            <p>02</p>
            <div>定制浏览体验</div>
          </div>
          <div class="n8_fontBox">
            <p>03</p>
            <div>发现图片故事</div>
          </div>

          <div class="n8_btn">Find Out More</div>
        </div>
      </div>
    </div>

    <div class="n8z2"></div>
  </section>
  
</template>

<style scoped>
@import url(../assets/CSS/mainIndex.css);
</style>
