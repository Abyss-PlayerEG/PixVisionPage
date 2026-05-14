<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'

const router = useRouter()
const countdown = ref(3)
let countdownTimer = null

// 自动返回首页
const goHome = () => {
  router.push('/')
}

// 启动倒计时
const startCountdown = () => {
  countdownTimer = setInterval(() => {
    countdown.value--
    
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      goHome()
    }
  }, 1000)
}

onMounted(() => {
  // 检测用户是否偏好减少动画
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  
  if (prefersReducedMotion) {
    // 简化动画：直接显示所有内容
    gsap.set('.not-found-content', { opacity: 1 })
    gsap.set('.error-code', { opacity: 1, y: 0, scale: 1 })
    gsap.set('.error-title', { opacity: 1, y: 0 })
    gsap.set('.error-subtitle', { opacity: 1, y: 0 })
    gsap.set('.back-button', { opacity: 1, y: 0, scale: 1 })
    gsap.set('.bg-decoration', { opacity: 0.4 })
    return
  }

  // 创建入场动画时间线
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

  // 1. 背景装饰淡入
  tl.from('.bg-decoration', {
    opacity: 0,
    duration: 0.8,
    stagger: 0.2
  })

  // 2. 404数字从下方滑入
  tl.from('.error-code', {
    y: 50,
    opacity: 0,
    scale: 0.8,
    duration: 0.6,
    ease: 'back.out(1.7)'
  }, '-=0.3')

  // 3. 标题文字淡入
  tl.from('.error-title', {
    y: 30,
    opacity: 0,
    duration: 0.5
  }, '-=0.2')

  // 4. 副标题淡入
  tl.from('.error-subtitle', {
    y: 20,
    opacity: 0,
    duration: 0.5
  }, '-=0.2')

  // 5. 提示文字淡入
  tl.from('.countdown-text', {
    y: 20,
    opacity: 0,
    duration: 0.5,
    ease: 'back.out(1.7)'
  }, '-=0.2')

  // 所有动画完成后启动倒计时
  tl.call(() => {
    startCountdown()
  })

  // 背景装饰持续浮动动画
  gsap.to('.bg-decoration', {
    y: 'random(-20, 20)',
    duration: 'random(3, 5)',
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
    stagger: {
      each: 0.5,
      from: 'random'
    }
  })
})

onUnmounted(() => {
  // 清理倒计时定时器
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  
  // 清理所有GSAP动画
  gsap.killTweensOf('*')
  
  // 清理ScrollTrigger实例（如果有）
  if (window.__scrollTriggers) {
    window.__scrollTriggers.forEach(trigger => trigger.kill())
    window.__scrollTriggers = []
  }
})
</script>

<template>
  <div class="not-found">
    <!-- 背景装饰圆形 -->
    <div class="bg-decoration round-1"></div>
    <div class="bg-decoration round-2"></div>
    <div class="bg-decoration round-3"></div>

    <!-- 主要内容 -->
    <div class="not-found-content">
      <!-- 404数字 -->
      <div class="error-code">404</div>
      
      <!-- 错误标题 -->
      <h1 class="error-title">页面未找到</h1>
      
      <!-- 错误描述 -->
      <p class="error-subtitle">您访问的页面不存在或已被移除</p>
      
      <!-- 倒计时提示 -->
      <p class="countdown-text">
        <span class="countdown-number">{{ countdown }}</span>
        <span>秒后自动返回首页</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  width: 100%;
  height: 100vh;
  background-color: #1a1a1a;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 背景装饰圆形 */
.bg-decoration {
  position: absolute;
  border-radius: 50%;
  background: #000000;
  filter: blur(100px);
  opacity: 0.4;
  will-change: transform;
}

.round-1 {
  width: 400px;
  height: 400px;
  top: -100px;
  left: -100px;
}

.round-2 {
  width: 300px;
  height: 300px;
  right: -50px;
  bottom: -50px;
}

.round-3 {
  width: 250px;
  height: 250px;
  top: 50%;
  right: 20%;
}

/* 主要内容容器 */
.not-found-content {
  text-align: center;
  z-index: 1;
  padding: 32px;
  max-width: 600px;
}

/* 404数字 */
.error-code {
  font-size: clamp(80px, 20vw, 180px);
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
  margin-bottom: 24px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  letter-spacing: 8px;
  will-change: transform, opacity;
}

/* 错误标题 */
.error-title {
  font-size: clamp(24px, 5vw, 32px);
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 16px 0;
  letter-spacing: 2px;
  will-change: transform, opacity;
}

/* 错误描述 */
.error-subtitle {
  font-size: clamp(14px, 3vw, 16px);
  color: #9e9e9e;
  margin: 0 0 40px 0;
  line-height: 1.6;
  will-change: transform, opacity;
}

/* 倒计时提示 */
.countdown-text {
  font-size: clamp(14px, 3vw, 16px);
  color: #656565;
  margin: 0;
  line-height: 1.6;
  will-change: transform, opacity;
}

.countdown-number {
  display: inline-block;
  font-size: clamp(18px, 4vw, 24px);
  font-weight: 600;
  color: #ffffff;
  margin-right: 4px;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .not-found-content {
    padding: 24px;
  }
  
  .round-1 {
    width: 300px;
    height: 300px;
  }
  
  .round-2 {
    width: 200px;
    height: 200px;
  }
  
  .round-3 {
    width: 180px;
    height: 180px;
  }
}

@media (max-width: 480px) {
  .not-found-content {
    padding: 16px;
  }
  
  .error-code {
    letter-spacing: 4px;
  }
  
  .back-button {
    padding: 12px 24px;
    font-size: 14px;
  }
}
</style>
