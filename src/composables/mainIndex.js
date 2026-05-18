import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

console.log("js 加载")

//滚到顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

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

/**
 * 文案动画 Composable
 * @returns {Object} 包含初始化方法和清理方法
 */
export const useCopyAnimation = () => {
  let currentIndex = 0
  let animationTimeline = null
  let isAnimating = false
  let nextTimer = null

  // 将文本拆分为单个字符并创建动画元素
  const animateText = (containerSelector, text) => {
    const container = document.querySelector(containerSelector)
    if (!container) return []
    
    // 清空容器
    container.innerHTML = ''
    
    // 为每个字符创建 span 元素
    const chars = text.split('')
    chars.forEach((char) => {
      const span = document.createElement('span')
      span.textContent = char === ' ' ? '\u00A0' : char // 处理空格
      span.style.display = 'inline-block'
      span.style.opacity = '0'
      span.style.transform = 'translateY(100%)' // 从容器底部外开始
      container.appendChild(span)
    })
    
    // 返回所有字符元素
    return Array.from(container.querySelectorAll('span'))
  }

  // 执行文案动画
  const playCopyAnimation = () => {
    if (isAnimating) return
    isAnimating = true
    
    const currentCopy = copyLibrary[currentIndex]
    
    // 创建字符元素
    const titleChars = animateText('.n1_showCopy1', currentCopy.title)
    const subtitleChars = animateText('.n1_showCopy2', currentCopy.subtitle)
    
    // 如果没有字符，直接跳过
    if (titleChars.length === 0 && subtitleChars.length === 0) {
      isAnimating = false
      return
    }
    
    // 创建 GSAP 时间轴
    animationTimeline = gsap.timeline({
      onComplete: () => {
        // 动画完成后，切换到下一个文案
        currentIndex = (currentIndex + 1) % copyLibrary.length
        isAnimating = false
        // 延迟 1 秒后播放下一个
        nextTimer = setTimeout(() => {
          playCopyAnimation()
        }, 1000)
      }
    })
    
    // 标题字符滑入动画（从底部外滑入到正常位置）
    if (titleChars.length > 0) {
      animationTimeline.to(titleChars, {
        y: '0%',
        opacity: 1,
        duration: 0.6,
        stagger: 0.05,
        ease: "power2.out"
      })
    }
    
    // 副标题字符滑入动画（延迟开始）
    if (subtitleChars.length > 0) {
      animationTimeline.to(subtitleChars, {
        y: '0%',
        opacity: 1,
        duration: 0.6,
        stagger: 0.05,
        ease: "power2.out"
      }, "-=0.3")
    }
    
    // 暂停显示（根据文案长度动态调整）
    const totalLength = currentCopy.title.length + currentCopy.subtitle.length
    const displayDuration = Math.max(4, totalLength * 0.15) // 最少4秒，每字符0.15秒
    animationTimeline.to({}, { duration: displayDuration })
    
    // 标题字符滑出动画（向上滑出到容器外）
    if (titleChars.length > 0) {
      animationTimeline.to(titleChars, {
        y: '-100%',
        opacity: 0,
        duration: 0.5,
        stagger: 0.03,
        ease: "power2.in"
      })
    }
    
    // 副标题字符滑出动画
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

  // 初始化动画
  const initCopyAnimation = () => {
    // 延迟 500ms 后开始第一个动画
    setTimeout(() => {
      playCopyAnimation()
    }, 500)
  }

  // 清理动画
  const cleanupCopyAnimation = () => {
    // 清理动画时间轴
    if (animationTimeline) {
      animationTimeline.kill()
      animationTimeline = null
    }
    // 清理定时器
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

/**
 * 箭头切换动画 Composable
 * @param {String} selector - SVG 箭头的选择器
 * @returns {Object} 包含触发方法和清理方法
 */
export const useArrowAnimation = (selector = '.n1_btn svg') => {
  let arrowTimer = null
  let isAnimating = false

  // 触发箭头切换动画
  const triggerArrowAnimation = () => {
    if (isAnimating) return
    isAnimating = true

    const arrow = document.querySelector(selector)
    if (!arrow) {
      isAnimating = false
      return
    }

    // 清除之前的定时器，防止重复触发
    if (arrowTimer) {
      clearTimeout(arrowTimer)
    }

    // 第一阶段：向右移动
    gsap.to(arrow, {
      x: 15,
      duration: 0.25,
      ease: "power2.inOut",
      onComplete: () => {
        // 第二阶段：瞬间跳到左侧
        gsap.set(arrow, { x: -15 })

        // 第三阶段：回到原位 0px（0.25s）
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

  // 清理动画
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

/**
 * 链接卡片滚动入场动画 Composable
 * @returns {Object} 包含初始化方法和清理方法
 */
export const useLinkCardAnimation = () => {
  let scrollTriggers = []

  // 初始化滚动触发动画
  const initLinkCardAnimation = () => {
    // 注册 ScrollTrigger 插件
    gsap.registerPlugin(ScrollTrigger)

    const cards = document.querySelectorAll('.n1_linkcard .link-card-item')
    
    if (cards.length === 0) return

    // 为每个卡片创建从右侧 200px 入场的动画
    cards.forEach((card, index) => {
      // 使用 fromTo 明确定义起始和结束状态
      const animation = gsap.fromTo(card, 
        {
          opacity: 0,
          x: 200
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: index * 0.15, // 每个卡片延迟 0.15s
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#num1z', // 以 num1z 容器为触发基准
            start: '150vh top', // 当滚动到 150vh 位置时触发
            once: true, // 一次性动画
            toggleActions: 'play none none none' // 只播放一次
          }
        }
      )

      // 保存 ScrollTrigger 实例以便清理
      if (animation.scrollTrigger) {
        scrollTriggers.push(animation.scrollTrigger)
      }
    })
  }

  // 清理动画
  const cleanupLinkCardAnimation = () => {
    // 清理所有 ScrollTrigger 实例
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
