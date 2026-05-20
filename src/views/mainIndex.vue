<script setup>
import { onMounted, onUnmounted, watch, ref } from 'vue'
import { useRouter } from "vue-router"

//组件引用
import NavBar from "@/components/NavBar.vue";
import Waterfall from "@/components/Waterfall.vue";

// 引入 composable
import { useCopyAnimation, useArrowAnimation, useLinkCardAnimation, useNum3zAnimation } from "@/composables/mainIndex.js"
import { useWorkWaterfall } from "@/composables/useWorkWaterfall.js"

// 引入通知组件
import { showError } from '@/utils/notification'

//依赖申明
const router = useRouter()

// Swiper 相关引用
const swiperContainer = ref(null)
const swiperWrapper = ref(null)

// 初始化文案动画
const { initCopyAnimation, cleanupCopyAnimation } = useCopyAnimation()

// 初始化箭头动画
const { triggerArrowAnimation, cleanupArrowAnimation } = useArrowAnimation()

// 初始化链接卡片滚动动画
const { initLinkCardAnimation, cleanupLinkCardAnimation } = useLinkCardAnimation()

// 初始化 num3z 区域动画
const { initNum3zAnimation, cleanupNum3zAnimation } = useNum3zAnimation()

// 初始化作品瀑布流
const { waterfallImages, isLoading, error, loadWorks } = useWorkWaterfall()

// 监听错误信息，显示弹窗
watch(error, (newError) => {
  if (newError) {
    showError(newError)
  }
})

// Swiper 初始化函数
const initSwiper = () => {
  if (!swiperContainer.value || !swiperWrapper.value) return
  
  const container = swiperContainer.value
  const wrapper = swiperWrapper.value
  
  let isDragging = false
  let startX = 0
  let scrollLeft = 0
  let velocity = 0
  let lastX = 0
  let lastTime = Date.now()
  let animationFrameId = null
  
  // 鼠标按下
  const handleMouseDown = (e) => {
    isDragging = true
    startX = e.pageX - container.offsetLeft
    scrollLeft = container.scrollLeft
    lastX = e.pageX
    lastTime = Date.now()
    velocity = 0
    
    // 停止惯性滚动
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
    
    container.style.cursor = 'grabbing'
    container.style.userSelect = 'none'
  }
  
  // 鼠标移动
  const handleMouseMove = (e) => {
    if (!isDragging) return
    
    e.preventDefault()
    const x = e.pageX - container.offsetLeft
    const walk = (x - startX) * 1.5 // 滚动倍率
    container.scrollLeft = scrollLeft - walk
    
    // 计算速度
    const currentTime = Date.now()
    const timeDiff = currentTime - lastTime
    if (timeDiff > 0) {
      velocity = (e.pageX - lastX) / timeDiff * 15
    }
    lastX = e.pageX
    lastTime = currentTime
  }
  
  // 鼠标释放
  const handleMouseUp = () => {
    if (!isDragging) return
    isDragging = false
    container.style.cursor = 'grab'
    container.style.userSelect = ''
    
    // 惯性滚动
    if (Math.abs(velocity) > 0.5) {
      inertiaScroll()
    }
  }
  
  // 鼠标离开
  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp()
    }
  }
  
  // 惯性滚动动画
  const inertiaScroll = () => {
    if (Math.abs(velocity) < 0.5) {
      velocity = 0
      return
    }
    
    container.scrollLeft -= velocity
    velocity *= 0.95 // 摩擦力系数
    
    animationFrameId = requestAnimationFrame(inertiaScroll)
  }
  
  // 触摸事件支持（移动端）
  const handleTouchStart = (e) => {
    isDragging = true
    startX = e.touches[0].pageX - container.offsetLeft
    scrollLeft = container.scrollLeft
    lastX = e.touches[0].pageX
    lastTime = Date.now()
    velocity = 0
    
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
  }
  
  const handleTouchMove = (e) => {
    if (!isDragging) return
    
    const x = e.touches[0].pageX - container.offsetLeft
    const walk = (x - startX) * 1.5
    container.scrollLeft = scrollLeft - walk
    
    const currentTime = Date.now()
    const timeDiff = currentTime - lastTime
    if (timeDiff > 0) {
      velocity = (e.touches[0].pageX - lastX) / timeDiff * 15
    }
    lastX = e.touches[0].pageX
    lastTime = currentTime
  }
  
  const handleTouchEnd = () => {
    isDragging = false
    if (Math.abs(velocity) > 0.5) {
      inertiaScroll()
    }
  }
  
  // 绑定事件
  container.addEventListener('mousedown', handleMouseDown)
  container.addEventListener('mousemove', handleMouseMove)
  container.addEventListener('mouseup', handleMouseUp)
  container.addEventListener('mouseleave', handleMouseLeave)
  container.addEventListener('touchstart', handleTouchStart, { passive: true })
  container.addEventListener('touchmove', handleTouchMove, { passive: false })
  container.addEventListener('touchend', handleTouchEnd)
  
  // 初始样式
  container.style.cursor = 'grab'
  
  // 保存清理函数
  window.__swiperCleanup = () => {
    container.removeEventListener('mousedown', handleMouseDown)
    container.removeEventListener('mousemove', handleMouseMove)
    container.removeEventListener('mouseup', handleMouseUp)
    container.removeEventListener('mouseleave', handleMouseLeave)
    container.removeEventListener('touchstart', handleTouchStart)
    container.removeEventListener('touchmove', handleTouchMove)
    container.removeEventListener('touchend', handleTouchEnd)
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
  }
}

onMounted(() => {
  // 启动文案动画
  initCopyAnimation()
  
  // 启动链接卡片滚动动画
  initLinkCardAnimation()
  
  // 初始化 Swiper
  initSwiper()
  
  // 加载瀑布流数据 (简单调用，像 Toast 一样方便)
  loadWorks({ reset: true })
  
  // 延迟初始化 num3z 动画，等待 Waterfall 组件稳定后再创建 ScrollTrigger
  setTimeout(() => {
    initNum3zAnimation()
  }, 500)
  
  // 监听窗口大小变化，触发页面刷新
  window.addEventListener('resize', () => {
    window.location.reload()
  })
})

onUnmounted(() => {
  // 清理动画和定时器
  cleanupCopyAnimation()
  cleanupArrowAnimation()
  cleanupLinkCardAnimation()
  cleanupNum3zAnimation()
  
  // 清理 Swiper
  if (window.__swiperCleanup) {
    window.__swiperCleanup()
    delete window.__swiperCleanup
  }
})
</script>

<template>
    <NavBar/>
    
    <section id="num1z">
        <div class="n1_showzone">
            <!-- 01.视频背景 -->
            <video src="../assets/Video/灰质海滩.mp4"
            autoplay
            muted
            loop
            playsinline
            disablePictureInPicture
            controlslist="nodownload nofullscreen noremoteplayback"></video>
    
            <!-- 02.文案展示 -->
            <div class="n1_showCopy1"></div>
            <div class="n1_showCopy2"></div>
            <div class="n1_btn" @mouseenter="triggerArrowAnimation">
                <div class="n1_btn_arrow">
                    <svg t="1778551186497" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1800" width="20" height="20"><path d="M292.571429 209.334857a65.828571 65.828571 0 0 1 14.482285-41.472 55.881143 55.881143 0 0 1 82.870857-5.997714l321.462858 302.665143 5.485714 5.924571a66.194286 66.194286 0 0 1-5.485714 89.014857L389.851429 862.061714a51.492571 51.492571 0 0 1-17.334858 11.337143 60.489143 60.489143 0 0 1-21.284571 4.315429C318.829714 877.714286 292.571429 849.481143 292.571429 814.592V209.334857z" p-id="1801" fill="#e6e6e6"></path></svg>
                </div>
                <p>我们为什么要制作&nbsp;</p>
                <p>pixel - vision</p>
            </div>

            <!-- 03.介绍文案 -->
            <div class="n1_linkcont">
                <!-- <p>简约自成格调</p>
                <p>极致, 不止于此</p>
                <p>方寸之间, 尽显质感</p>
                <p>不止步于够用, 总追求出众</p>
                <p>重新定义流畅, 重塑视觉质感</p> -->
            </div>
            <!-- 04.跳转卡片 -->
            <div class="n1_linkcard">
                <div class="link-card-item">
                    <svg class="card-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                        <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" fill="currentColor"/>
                        <path d="M512 256c-141.4 0-256 114.6-256 256s114.6 256 256 256 256-114.6 256-256-114.6-256-256-256zm0 448c-106 0-192-86-192-192s86-192 192-192 192 86 192 192-86 192-192 192z" fill="currentColor"/>
                    </svg>
                    <span class="card-title">订阅</span>
                    <p class="card-desc">支持我们，优享特权</p>
                </div>
                <div class="link-card-item">
                    <svg class="card-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                        <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" fill="currentColor"/>
                        <path d="M704 384L512 576 320 384l-64 64 256 256 256-256z" fill="currentColor"/>
                    </svg>
                    <span class="card-title">俯瞰像素视觉</span>
                    <p class="card-desc">站在巨人的肩膀上，追求视觉的质感</p>
                </div>
                <div class="link-card-item">
                    <svg class="card-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                        <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" fill="currentColor"/>
                        <path d="M512 256c-141.4 0-256 114.6-256 256s114.6 256 256 256 256-114.6 256-256-114.6-256-256-256zm-128 256c0 70.7 57.3 128 128 128s128-57.3 128-128-57.3-128-128-128-128 57.3-128 128z" fill="currentColor"/>
                    </svg>
                    <span class="card-title">加入我们</span>
                    <p class="card-desc">加入我们，成为美的缔造者</p>
                </div>
            </div>
        </div>
    </section>

    <section id="num2z">
        <div class="water_fall">
            <!-- 距离顶部还有 ?px 时就固定并开始水平滚动 -->
            <Waterfall 
              :external-images="waterfallImages" 
              :pin-offset-top="70"
            />
            
<!--            加载状态提示-->
            <div v-if="isLoading" class="loading-tip">加载中...</div>
        </div>
    </section>
    <section id="num2z_2">
        <div class="view-more-btn">
            <span>查看更多</span>
            <svg class="arrow-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                <path d="M512 896l-64-64 256-256H128v-96h576L448 224l64-64 384 384z" fill="currentColor"/>
            </svg>
        </div>
    </section>

    <section id="num3z">
        <h1>Feel the breath of the wilderness .</h1>
        <div>
            <span>旷野的生机,&nbsp;&nbsp;&nbsp;</span>
            <span>来自野性的呼唤,&nbsp;&nbsp;&nbsp;</span>
            <span>We are all in nature。</span>
        </div>

        <div class="n3_showIMG">
            <!-- Swiper 轮播图容器 -->
            <div class="swiper-container" ref="swiperContainer">
                <div class="swiper-wrapper" ref="swiperWrapper">
                    <!-- 9个占位圆角矩形 + 介绍文案 -->
                    <div v-for="index in 9" :key="index" class="swiper-slide">
                        <div class="slide-card">
                            <div class="placeholder-card"></div>
                            <div class="slide-caption">
                                <h3 class="caption-title">自然之美 {{ index }}</h3>
                                <p class="caption-desc">探索大自然的无限魅力，感受每一帧画面的生命力与艺术价值</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="num4z">

    </section>

</template>

<style>
@import url(../assets/CSS/mainIndex.css);
</style>
