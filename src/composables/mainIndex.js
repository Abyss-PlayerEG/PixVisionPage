import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// 文案库 - 方便后续增删改
const copyLibrary = [
  {
    title: "探索无限可能",
    subtitle: "用创意点亮每一个像素的瞬间"
  },
  {
    title: "视觉的艺术",
    subtitle: "让每一帧都成为永恒的记忆"
  },
  {
    title: "创新无止境",
    subtitle: "在数字世界中发现新的维度"
  },
  {
    title: "灵感的力量",
    subtitle: "捕捉那些稍纵即逝的美好"
  },
  {
    title: "设计的温度",
    subtitle: "用心感受每一次创作的喜悦"
  }
]

/* ===========================
 * 文案逐字循环动画
 * 字符从底部滑入 → 停顿展示 → 向上滑出 → 切换到下一条文案
 * displayDuration = max(4s, 字数×0.15s) —— 4秒保底，长文案自动延长
 * 循环间隔 1s，防止动画衔接过于急促
 * =========================== */
export const useCopyAnimation = () => {
  let currentIndex = 0
  let animationTimeline = null
  let isAnimating = false
  let nextTimer = null

  const animateText = (containerSelector, text) => {
    const container = document.querySelector(containerSelector)
    if (!container) return []

    container.innerHTML = ''

    const chars = text.split('')
    chars.forEach((char) => {
      const span = document.createElement('span')
      span.textContent = char === ' ' ? ' ' : char
      span.style.display = 'inline-block'
      span.style.opacity = '0'
      span.style.transform = 'translateY(100%)'
      container.appendChild(span)
    })

    return Array.from(container.querySelectorAll('span'))
  }

  const playCopyAnimation = () => {
    if (isAnimating) return
    isAnimating = true

    const currentCopy = copyLibrary[currentIndex]

    const titleChars = animateText('.n1_showCopy1', currentCopy.title)
    const subtitleChars = animateText('.n1_showCopy2', currentCopy.subtitle)

    if (titleChars.length === 0 && subtitleChars.length === 0) {
      isAnimating = false
      return
    }

    animationTimeline = gsap.timeline({
      onComplete: () => {
        currentIndex = (currentIndex + 1) % copyLibrary.length
        isAnimating = false
        nextTimer = setTimeout(() => {
          playCopyAnimation()
        }, 1000)
      }
    })

    if (titleChars.length > 0) {
      animationTimeline.to(titleChars, {
        y: '0%',
        opacity: 1,
        duration: 0.6,
        stagger: 0.05,
        ease: "power2.out"
      })
    }

    if (subtitleChars.length > 0) {
      animationTimeline.to(subtitleChars, {
        y: '0%',
        opacity: 1,
        duration: 0.6,
        stagger: 0.05,
        ease: "power2.out"
      }, "-=0.3")
    }

    const totalLength = currentCopy.title.length + currentCopy.subtitle.length
    const displayDuration = Math.max(4, totalLength * 0.15)
    animationTimeline.to({}, { duration: displayDuration })

    if (titleChars.length > 0) {
      animationTimeline.to(titleChars, {
        y: '-100%',
        opacity: 0,
        duration: 0.5,
        stagger: 0.03,
        ease: "power2.in"
      })
    }

    if (subtitleChars.length > 0) {
      animationTimeline.to(subtitleChars, {
        y: '-100%',
        opacity: 0,
        duration: 0.5,
        stagger: 0.03,
        ease: "power2.in"
      }, "-=0.25")
    }
  }

  const initCopyAnimation = () => {
    setTimeout(() => {
      playCopyAnimation()
    }, 500)
  }

  const cleanupCopyAnimation = () => {
    if (animationTimeline) {
      animationTimeline.kill()
      animationTimeline = null
    }
    if (nextTimer) {
      clearTimeout(nextTimer)
      nextTimer = null
    }
    isAnimating = false
  }

  return {
    initCopyAnimation,
    cleanupCopyAnimation
  }
}

/* ===========================
 * 箭头弹跳切换动画
 * 三段式：右移 15px（0.25s）→ 瞬移到左侧 -15px → 滑回原位 0px（0.25s）
 * 瞬移制造"无限循环"错觉，视觉上箭头不断从左往右推
 * =========================== */
export const useArrowAnimation = (selector = '.n1_btn svg') => {
  let arrowTimer = null
  let isAnimating = false

  const triggerArrowAnimation = () => {
    if (isAnimating) return
    isAnimating = true

    const arrow = document.querySelector(selector)
    if (!arrow) {
      isAnimating = false
      return
    }

    if (arrowTimer) {
      clearTimeout(arrowTimer)
    }

    gsap.to(arrow, {
      x: 15,
      duration: 0.25,
      ease: "power2.inOut",
      onComplete: () => {
        gsap.set(arrow, { x: -15 })

        arrowTimer = setTimeout(() => {
          gsap.to(arrow, {
            x: 0,
            duration: 0.25,
            ease: "power2.inOut",
            onComplete: () => {
              isAnimating = false
            }
          })
        }, 100)
      }
    })
  }

  const cleanupArrowAnimation = () => {
    if (arrowTimer) {
      clearTimeout(arrowTimer)
      arrowTimer = null
    }
    isAnimating = false
  }

  return {
    triggerArrowAnimation,
    cleanupArrowAnimation
  }
}

/* ===========================
 * 链接卡片 ScrollTrigger 入场
 * 当 #num1z 滚动到 120vh 位置（hero 即将结束）时，三张卡片依次从右侧滑入
 * delay: index * 0.15 —— 每张卡片错开 0.15s，形成跟随入场节奏
 * x: 200 —— 从右侧 200px 外滑入，配合 power2.out 缓出产生弹性感
 * =========================== */
export const useLinkCardAnimation = () => {
  let scrollTriggers = []

  const initLinkCardAnimation = () => {
    const cards = document.querySelectorAll('.n1_linkcard .link-card-item')

    if (cards.length === 0) return

    cards.forEach((card, index) => {
      const animation = gsap.fromTo(card,
        {
          opacity: 0,
          x: 200
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: index * 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#num1z',
            // 滚动到 120vh 时触发 —— hero 区域的 200vh 过了大半，卡片自然入场
            start: '120vh top',
            once: true,
            toggleActions: 'play none none none'
          }
        }
      )

      if (animation.scrollTrigger) {
        scrollTriggers.push(animation.scrollTrigger)
      }
    })
  }

  const cleanupLinkCardAnimation = () => {
    scrollTriggers.forEach(trigger => {
      if (trigger) {
        trigger.kill()
      }
    })
    scrollTriggers = []
  }

  return {
    initLinkCardAnimation,
    cleanupLinkCardAnimation
  }
}

/* ===========================
 * Num3z 区域 ScrollTrigger 入场
 * 触发点 'top 40%' —— 区块顶部进入视口 40% 位置时触发，确保用户看到的是动画过程而非已完成的静态结果
 * 依次出场：h1(0s) → span 描述(0.2s 后, 逐条 0.15s) → Swiper 卡片(0.4s 后, 逐张 0.1s)
 * =========================== */
export const useNum3zAnimation = () => {
  let scrollTriggers = []

  const initNum3zAnimation = () => {
    const h1 = document.querySelector('#num3z h1')
    const descSpans = document.querySelectorAll('#num3z > div > span')
    const swiperSlides = document.querySelectorAll('.swiper-slide')

    if (!h1 || !descSpans || descSpans.length === 0 || !swiperSlides || swiperSlides.length === 0) {
      return
    }

    const h1Anim = gsap.fromTo(h1,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0,
        duration: 0.8, ease: 'power2.out',
        scrollTrigger: {
          trigger: '#num3z',
          start: 'top 40%',
          once: true,
          toggleActions: 'play none none none'
        }
      }
    )

    const descAnim = gsap.fromTo(descSpans,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0,
        duration: 0.8, stagger: 0.15, delay: 0.2, ease: 'power2.out',
        scrollTrigger: {
          trigger: '#num3z',
          start: 'top 40%',
          once: true,
          toggleActions: 'play none none none'
        }
      }
    )

    const slidesAnim = gsap.fromTo(swiperSlides,
      { opacity: 0, y: 60 },
      {
        opacity: 1, y: 0,
        duration: 0.8, stagger: 0.1, delay: 0.4, ease: 'power2.out',
        scrollTrigger: {
          trigger: '#num3z',
          start: 'top 40%',
          once: true,
          toggleActions: 'play none none none'
        }
      }
    )

    if (h1Anim.scrollTrigger) scrollTriggers.push(h1Anim.scrollTrigger)
    if (descAnim.scrollTrigger) scrollTriggers.push(descAnim.scrollTrigger)
    if (slidesAnim.scrollTrigger) scrollTriggers.push(slidesAnim.scrollTrigger)
  }

  const cleanupNum3zAnimation = () => {
    scrollTriggers.forEach(trigger => {
      if (trigger) {
        trigger.kill()
      }
    })
    scrollTriggers = []
  }

  return {
    initNum3zAnimation,
    cleanupNum3zAnimation
  }
}

/* ===========================
 * Swiper 拖拽轮播 (惯性 + 触摸)
 * walk = 鼠标位移 × 1.5 —— 增大滚动倍率，拖拽手感更快
 * velocity = 鼠标速度 × 15 —— 将 px/ms 转换为每帧位移量级
 * friction = 0.95 —— 每帧衰减 5%，惯性约持续 1.5-2 秒自然停止
 * =========================== */
export const useSwiper = (containerRef) => {
  let isDragging = false
  let startX = 0
  let scrollLeft = 0
  let velocity = 0
  let lastX = 0
  let lastTime = Date.now()
  let animationFrameId = null

  // --- 鼠标事件 ---
  const handleMouseDown = (e) => {
    const container = containerRef.value
    if (!container) return
    isDragging = true
    startX = e.pageX - container.offsetLeft
    scrollLeft = container.scrollLeft
    lastX = e.pageX
    lastTime = Date.now()
    velocity = 0

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }

    container.style.cursor = 'grabbing'
    container.style.userSelect = 'none'
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    const container = containerRef.value
    if (!container) return

    e.preventDefault()
    const x = e.pageX - container.offsetLeft
    const walk = (x - startX) * 1.5
    container.scrollLeft = scrollLeft - walk

    const currentTime = Date.now()
    const timeDiff = currentTime - lastTime
    if (timeDiff > 0) {
      velocity = (e.pageX - lastX) / timeDiff * 15
    }
    lastX = e.pageX
    lastTime = currentTime
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    isDragging = false
    const container = containerRef.value
    if (container) {
      container.style.cursor = 'grab'
      container.style.userSelect = ''
    }

    if (Math.abs(velocity) > 0.5) {
      inertiaScroll()
    }
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp()
    }
  }

  // --- 触摸事件 ---
  const handleTouchStart = (e) => {
    const container = containerRef.value
    if (!container) return
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
    const container = containerRef.value
    if (!container) return

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

  // --- 惯性滚动 ---
  const inertiaScroll = () => {
    if (Math.abs(velocity) < 0.5) {
      velocity = 0
      return
    }

    const container = containerRef.value
    if (container) {
      container.scrollLeft -= velocity
    }
    velocity *= 0.95

    animationFrameId = requestAnimationFrame(inertiaScroll)
  }

  // --- 生命周期 ---
  const initSwiper = () => {
    const container = containerRef.value
    if (!container) return

    container.addEventListener('mousedown', handleMouseDown)
    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseup', handleMouseUp)
    container.addEventListener('mouseleave', handleMouseLeave)
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)

    container.style.cursor = 'grab'
  }

  const cleanupSwiper = () => {
    const container = containerRef.value
    if (container) {
      container.removeEventListener('mousedown', handleMouseDown)
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseup', handleMouseUp)
      container.removeEventListener('mouseleave', handleMouseLeave)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
    isDragging = false
    velocity = 0
  }

  return {
    initSwiper,
    cleanupSwiper
  }
}
