import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// 文案库 - 方便后续增删改
const copyLibrary = [
  {
    title: "Explore infinite possibilities",
    subtitle: "用创意点亮每一个像素的瞬间"
  },
  {
    title: "The Art of Vision",
    subtitle: "让每一帧都成为永恒的记忆"
  },
  {
    title: "Innovation knows no bounds",
    subtitle: "在数字世界中发现新的维度"
  },
  {
    title: "The Power of Inspiration",
    subtitle: "捕捉那些稍纵即逝的美好"
  },
  {
    title: "Designed temperature",
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
        y: '-50%',
        opacity: 0,
        duration: 0.5,
        stagger: 0.03,
        ease: "power2.in"
      })
    }

    if (subtitleChars.length > 0) {
      animationTimeline.to(subtitleChars, {
        y: '-50%',
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
 * N1 背景图片 Ken Burns 缓动 + 鼠标斥力（双层视差）+ 滚动缩放
 * 滚动缩放：随 #num1z 滚动，wrapper 从 1→1.1 逐渐放大（scrub）
 * Ken Burns：背景 1→1.06，底部图层 1→1.08，叠加于滚动缩放之上
 * 斥力：背景 ±15px，底部图层 ±22px —— 前景位移更大，形成深度差
 * =========================== */
export const useN1ImageEffect = () => {
  let bgTween = null
  let bottomTween = null
  let bgQuickX = null
  let bgQuickY = null
  let bottomQuickX = null
  let bottomQuickY = null
  let bgImg = null
  let bottomImg = null
  let bgWrap = null
  let bottomWrap = null
  let scrollSt = null
  let raf = null
  let leaveTimer = null
  let isInside = false

  const resetAll = () => {
    bgQuickX(0)
    bgQuickY(0)
    bottomQuickX(0)
    bottomQuickY(0)
  }

  const onMove = (e) => {
    if (raf) return
    raf = requestAnimationFrame(() => {
      raf = null
      const section = document.querySelector('#num1z')
      if (!section) return
      const rect = section.getBoundingClientRect()
      const inBounds =
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom

      if (!inBounds) {
        if (isInside) {
          isInside = false
          clearTimeout(leaveTimer)
          leaveTimer = setTimeout(resetAll, 300)
        }
        return
      }
      isInside = true
      clearTimeout(leaveTimer)

      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const nx = (e.clientX - cx) / (rect.width / 2)
      const ny = (e.clientY - cy) / (rect.height / 2)
      bgQuickX(-nx * 15)
      bgQuickY(-ny * 15)
      bottomQuickX(-nx * 22)
      bottomQuickY(-ny * 22)
    })
  }

  const initN1ImageEffect = () => {
    bgImg = document.querySelector('.n1_bg')
    bottomImg = document.querySelector('.n1_bg_bottom')
    bgWrap = document.querySelector('.n1_bg_wrap')
    bottomWrap = document.querySelector('.n1_bg_bottom_wrap')
    if (!bgImg) return

    gsap.set([bgImg, bottomImg].filter(Boolean), { willChange: 'transform' })

    // Ken Burns 呼吸：在 scroll 缩放基础上叠加
    bgTween = gsap.to(bgImg, {
      scale: 1.06,
      duration: 10,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    })

    if (bottomImg) {
      bottomTween = gsap.to(bottomImg, {
        scale: 1.08,
        duration: 10,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
    }

    // 滚动缩放：wrapper 随 #num1z 滚动从 1→1.1
    if (bgWrap) {
      gsap.set(bgWrap, { transformOrigin: 'center center' })
      scrollSt = ScrollTrigger.create({
        trigger: '#num1z',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          const s = 1 + self.progress * 0.1
          gsap.set(bgWrap, { scale: s })
          if (bottomWrap) gsap.set(bottomWrap, { scale: s })
        },
      })
    }

    bgQuickX = gsap.quickTo(bgImg, 'x', { duration: 0.6, ease: 'power2.out' })
    bgQuickY = gsap.quickTo(bgImg, 'y', { duration: 0.6, ease: 'power2.out' })
    if (bottomImg) {
      bottomQuickX = gsap.quickTo(bottomImg, 'x', { duration: 0.5, ease: 'power2.out' })
      bottomQuickY = gsap.quickTo(bottomImg, 'y', { duration: 0.5, ease: 'power2.out' })
    }

    window.addEventListener('mousemove', onMove, { passive: true })
  }

  const cleanupN1ImageEffect = () => {
    if (bgTween) {
      bgTween.kill()
      bgTween = null
    }
    if (bottomTween) {
      bottomTween.kill()
      bottomTween = null
    }
    if (scrollSt) {
      scrollSt.kill()
      scrollSt = null
    }
    window.removeEventListener('mousemove', onMove)
    if (raf) {
      cancelAnimationFrame(raf)
      raf = null
    }
    if (leaveTimer) {
      clearTimeout(leaveTimer)
      leaveTimer = null
    }
  }

  return {
    initN1ImageEffect,
    cleanupN1ImageEffect,
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
 * Num4z 区域 ScrollTrigger 入场
 * 触发点 'top 60%' —— 比 num3z 更晚触发，网格区域作为整体出现
 * 依次出场：h1(0s) → n4_font span(0.2s 后) → GridLayout 整体(0.4s 后)
 * =========================== */
export const useNum4zAnimation = () => {
  let scrollTriggers = []

  const initNum4zAnimation = () => {
    const h1 = document.querySelector('#num4z h1')
    const fontSpan = document.querySelector('#num4z .n4_font span')
    const gridLayout = document.querySelector('#num4z .n4_GridLayout')

    if (!h1 || !fontSpan || !gridLayout) return

    const h1Anim = gsap.fromTo(h1,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0,
        duration: 0.8, ease: 'power2.out',
        scrollTrigger: {
          trigger: '#num4z',
          start: 'top 60%',
          once: true,
          toggleActions: 'play none none none'
        }
      }
    )

    const fontAnim = gsap.fromTo(fontSpan,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0,
        duration: 0.8, delay: 0.2, ease: 'power2.out',
        scrollTrigger: {
          trigger: '#num4z',
          start: 'top 60%',
          once: true,
          toggleActions: 'play none none none'
        }
      }
    )

    const gridAnim = gsap.fromTo(gridLayout,
      { opacity: 0, y: 60 },
      {
        opacity: 1, y: 0,
        duration: 0.8, delay: 0.4, ease: 'power2.out',
        scrollTrigger: {
          trigger: '#num4z',
          start: 'top 60%',
          once: true,
          toggleActions: 'play none none none'
        }
      }
    )

    if (h1Anim.scrollTrigger) scrollTriggers.push(h1Anim.scrollTrigger)
    if (fontAnim.scrollTrigger) scrollTriggers.push(fontAnim.scrollTrigger)
    if (gridAnim.scrollTrigger) scrollTriggers.push(gridAnim.scrollTrigger)
  }

  const cleanupNum4zAnimation = () => {
    scrollTriggers.forEach(trigger => {
      if (trigger) {
        trigger.kill()
      }
    })
    scrollTriggers = []
  }

  return {
    initNum4zAnimation,
    cleanupNum4zAnimation
  }
}

/* ===========================
 * Num5z 区域 ScrollTrigger 动画
 * 入场 scrub：随滚动将 .num5z 从 scale(0.9) 缩放到 scale(1)，顶部圆角 40→10px
 * 离场 toggle：#num5z 底部到达视口 top 60% 时播放，底部圆角变为 10 10 40 40 + scale→0.9
 * =========================== */
export const useNum5zAnimation = () => {
  let st = null
  let closingSt = null
  let closingTween = null

  const initNum5zAnimation = () => {
    const el = document.querySelector('.num5z')
    if (!el) return

    // 入场 scrub 动画
    st = ScrollTrigger.create({
      trigger: el,
      start: 'top 95%',
      end: 'top 15%',
      scrub: true,
      onUpdate: (self) => {
        if (closingTween?.isActive()) return
        const r = 40 - self.progress * 30
        gsap.set(el, {
          scale: 0.9 + self.progress * 0.1,
          borderRadius: `${r}px ${r}px 0 0`,
        })
      },
    })

    // 离场 toggle 动画：底部到达 bottom 时播放
    closingSt = ScrollTrigger.create({
      trigger: '#num5z',
      start: 'bottom bottom',
      onEnter: () => {
        closingTween?.kill()
        closingTween = gsap.to(el, {
          scale: 0.9,
          borderRadius: '10px 10px 40px 40px',
          duration: 0.5,
          ease: 'power2.out',
        })
      },
      onLeaveBack: () => {
        closingTween?.kill()
        closingTween = gsap.to(el, {
          scale: 1,
          borderRadius: '10px 10px 0 0',
          duration: 0.5,
          ease: 'power2.out',
        })
      },
    })
  }

  const cleanupNum5zAnimation = () => {
    if (st) {
      st.kill()
      st = null
    }
    if (closingSt) {
      closingSt.kill()
      closingSt = null
    }
    if (closingTween) {
      closingTween.kill()
      closingTween = null
    }
  }

  return {
    initNum5zAnimation,
    cleanupNum5zAnimation,
  }
}

/* ===========================
 * Num5z Showzone ScrollTrigger 入场
 * 触发点 '#num5z top 60%' —— 滚动到此阈值触发，回滚时收回
 * 依次出场：n5_item(0s) → h3(0.15s) → h3(0.3s) → h1(0.45s)
 * toggleActions: "play none none reverse" —— 触发式，双向响应
 * =========================== */
export const useN5ShowzoneAnimation = () => {
  let scrollTriggers = []

  const initN5ShowzoneAnimation = () => {
    const item = document.querySelector('#num5z .n5_item')
    const h3s = document.querySelectorAll('#num5z .n5_showzone h3')
    const h1 = document.querySelector('#num5z .n5_showzone h1')

    if (!item || !h3s.length || !h1) return

    const itemAnim = gsap.fromTo(item,
      { opacity: 0, y: 200 },
      {
        opacity: 1, y: 0,
        duration: 0.8, ease: 'power2.out',
        scrollTrigger: {
          trigger: '#num5z',
          start: 'top 60%',
          toggleActions: 'restart none none reverse',
        },
      },
    )

    const h3Anims = []
    h3s.forEach((h3, i) => {
      const anim = gsap.fromTo(h3,
        { opacity: 0, y: 200 },
        {
          opacity: 1, y: 0,
          duration: 0.8, delay: 0.15 + i * 0.15, ease: 'power2.out',
          scrollTrigger: {
            trigger: '#num5z',
            start: 'top 60%',
            toggleActions: 'restart none none reverse',
          },
        },
      )
      h3Anims.push(anim)
    })

    const h1Anim = gsap.fromTo(h1,
      { opacity: 0, y: 200 },
      {
        opacity: 1, y: 0,
        duration: 0.8, delay: 0.45, ease: 'power2.out',
        scrollTrigger: {
          trigger: '#num5z',
          start: 'top 60%',
          toggleActions: 'restart none none reverse',
        },
      },
    )

    if (itemAnim.scrollTrigger) scrollTriggers.push(itemAnim.scrollTrigger)
    h3Anims.forEach((anim) => {
      if (anim.scrollTrigger) scrollTriggers.push(anim.scrollTrigger)
    })
    if (h1Anim.scrollTrigger) scrollTriggers.push(h1Anim.scrollTrigger)
  }

  const cleanupN5ShowzoneAnimation = () => {
    scrollTriggers.forEach((trigger) => {
      if (trigger) trigger.kill()
    })
    scrollTriggers = []
  }

  return {
    initN5ShowzoneAnimation,
    cleanupN5ShowzoneAnimation,
  }
}

/* ===========================
 * Num5z Progress 动画 —— 主 ScrollTrigger scrub 驱动
 * 每个 .n5_prog 独立切片进度，后一个在前一个 50% 时开始
 * 动画内容：
 *   入场：y 200→0 / scale 0.8→1 / opacity 0→1（触发式，抵达切片起点时播放，离开时收回）
 *   .n5p_cirItem svg —— 顺时针自转 360°（scrub）
 *   .n5p_progItem   —— 宽度 10% → 98%（scrub，不填满）
 *   .n5p span i     —— 单个 "." 正弦跳动（scrub，逐点相位偏移）
 * =========================== */
export const useN5ProgAnimation = () => {
  let st = null
  /** @type {{ entered: boolean, swapped: boolean }[]} */
  const progStates = []
  const originalSvgs = []

  const DONE_SVG = '<svg t="1779533952942" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8097" width="20" height="20"><path d="M1024 512c0 282.773-229.227 512-512 512S0 794.773 0 512 229.227 0 512 0s512 229.227 512 512zM268.992 269.653a82.197 82.197 0 1 0 0 164.416 82.197 82.197 0 0 0 0-164.416z m486.016 0a82.197 82.197 0 1 0 0 164.416 82.197 82.197 0 0 0 0-164.416z m-22.101 360.32C712 725.504 614.293 820.523 512.49 820.523s-205.526-95.019-226.432-190.55c0 0-6.72-28.309-32.918-28.309-22.101 0-21.93 28.31-21.93 28.31 21.888 135.637 139.477 239.231 281.28 239.231 141.824 0 259.413-103.594 281.28-239.232 0 0 6.314-28.309-19.968-28.309-31.147 0-40.896 28.31-40.896 28.31z" p-id="8098" fill="#1a1a1a"></path></svg>'

  const initN5ProgAnimation = () => {
    const progs = document.querySelectorAll('#num5z .n5_prog')
    if (!progs.length) return

    // 初始隐藏 + 状态初始化 + 保存原始 SVG
    progs.forEach((prog) => {
      gsap.set(prog, { opacity: 0, y: 200, scale: 0.8 })
      progStates.push({ entered: false, swapped: false })
      const cirItem = prog.querySelector('.n5p_cirItem')
      originalSvgs.push(cirItem ? cirItem.innerHTML : '')
    })

    // 拆分每个 prog 的 span "..." 为独立 <i> 字符，收集引用
    const allDots = []
    progs.forEach((prog) => {
      const span = prog.querySelector('.n5p span')
      if (span) {
        span.innerHTML = span.textContent
          .split('')
          .map((c) => (c === '.' ? `<i>.</i>` : c))
          .join('')
        allDots.push([...span.querySelectorAll('i')])
      } else {
        allDots.push([])
      }
    })

    st = ScrollTrigger.create({
      trigger: '#num5z',
      start: 'top top',
      end: 'bottom 15%',
      scrub: true,
      onUpdate: (self) => {
        const total = progs.length
        const totalRange = 0.85
        const sliceWidth = (totalRange * 2) / (total + 1)
        const stagger = sliceWidth / 2

        progs.forEach((prog, i) => {
          const sliceStart = i * stagger
          const sliceEnd = sliceStart + sliceWidth
          const local = gsap.utils.clamp(0, 1,
            (self.progress - sliceStart) / (sliceEnd - sliceStart),
          )

          // 0. 入场 / 出场
          const state = progStates[i]
          if (local > 0 && !state.entered) {
            state.entered = true
            gsap.to(prog, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power2.out', overwrite: 'auto' })
          } else if (local <= 0 && state.entered) {
            state.entered = false
            gsap.to(prog, { opacity: 0, y: 200, scale: 0.8, duration: 0.35, ease: 'power2.in', overwrite: 'auto' })
          }

          // 1. SVG 顺时针自转 + 完成后替换为笑脸
          const cirItem = prog.querySelector('.n5p_cirItem')
          const svg = cirItem ? cirItem.querySelector('svg') : null
          if (svg) {
            gsap.set(svg, { rotation: local * 360 })
          }

          if (local >= 1 && !state.swapped) {
            state.swapped = true
            if (cirItem) {
              const curSvg = cirItem.querySelector('svg')
              if (curSvg) {
                gsap.to(curSvg, { opacity: 0, duration: 0.2, onComplete: () => {
                  cirItem.innerHTML = DONE_SVG
                  gsap.fromTo(cirItem.querySelector('svg'), { opacity: 0 }, { opacity: 1, duration: 0.2 })
                }})
              }
            }
          } else if (local < 1 && state.swapped) {
            state.swapped = false
            if (cirItem) {
              const curSvg = cirItem.querySelector('svg')
              if (curSvg) {
                gsap.to(curSvg, { opacity: 0, duration: 0.2, onComplete: () => {
                  cirItem.innerHTML = originalSvgs[i]
                  gsap.fromTo(cirItem.querySelector('svg'), { opacity: 0 }, { opacity: 1, duration: 0.2 })
                }})
              }
            }
          }

          // 2. 进度条宽度 10% → 98%
          const bar = prog.querySelector('.n5p_progItem')
          if (bar) {
            gsap.set(bar, { width: `${10 + local * 88}%` })
          }

          // 3. 逐点跳动
          const dots = allDots[i]
          dots.forEach((dot, j) => {
            const y = Math.sin(local * Math.PI) * Math.sin(local * Math.PI * 4 + j * Math.PI / 3) * 6
            gsap.set(dot, { y })
          })
        })
      },
    })
  }

  const cleanupN5ProgAnimation = () => {
    if (st) {
      st.kill()
      st = null
    }
    progStates.length = 0
    originalSvgs.length = 0
  }

  return {
    initN5ProgAnimation,
    cleanupN5ProgAnimation,
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

// ==================== num6z — 打字机药丸动画 ====================
/**
 * num6z 打字机效果 —— 两个独立 ScrollTrigger 分别驱动入场与退场。
 *
 * 入场（#num6z, top→bottom）：scrub 全段。
 *   1. 药丸 + 绿色徽章逐个出现
 *   2. 药丸消失 + 文字出现
 *   3. 渐变文字扫光
 *
 * 退场（#num7z, top bottom→top top）：入场完成、粘性解除、进入 #num7z 后触发。
 *   4. 药丸 z-index 提升，逐个重现遮挡文字
 *      徽章绿色褪为灰色药丸，内部文字/图标淡出
 *      渐变文字仅被遮盖，不反向扫光
 */
export const useNum6zAnimation = () => {
  let tlEntrance = null
  let tlExit = null

  const initNum6zAnimation = () => {
    const allPills = gsap.utils.toArray('.n6_pill, .n6_badge')
    const wordPills = gsap.utils.toArray('.n6_pill')
    const words = gsap.utils.toArray('.n6_word')
    const gradientWords = gsap.utils.toArray('.n6_word--gradient')

    if (allPills.length === 0 || words.length === 0) return

    // === 入场：#num6z 全段 scrub ===
    tlEntrance = gsap.timeline({
      scrollTrigger: {
        trigger: '#num6z',
        start: 'top 50%',
        end: 'bottom bottom',
        scrub: 0.6,
        id: 'num6z-entrance',
      },
    })

    // Phase 1: 词药丸 + 绿色徽章逐个出现
    tlEntrance.to(allPills, {
      opacity: 1,
      stagger: { each: 0.04, from: 'start' },
      duration: 0.3,
    })

    // Phase 2: 词药丸消失 + 文字出现（徽章不消失，已是最终态）
    tlEntrance.to(wordPills, {
      opacity: 0,
      stagger: { each: 0.04, from: 'start' },
      duration: 0.3,
    }, '<+=0.25')
    tlEntrance.to(words, {
      opacity: 1,
      stagger: { each: 0.04, from: 'start' },
      duration: 0.3,
    }, '<')

    // Phase 3: 渐变文字依次扫光
    if (gradientWords.length > 0) {
      tlEntrance.to(gradientWords[0], {
        backgroundPositionX: '0%',
        duration: 0.4,
      }, '>-=0.1')
      if (gradientWords.length > 1) {
        tlEntrance.to(gradientWords[1], {
          backgroundPositionX: '0%',
          duration: 0.4,
        }, '>')
      }
    }

    // === 退场：#num7z 进入视口时触发，入场已完成、粘性已解除 ===
    tlExit = gsap.timeline({
      scrollTrigger: {
        trigger: '#num7z',
        start: 'top 90%',
        end: 'top 80%',
        scrub: 0.6,
        id: 'num6z-exit',
      },
    })

    // Phase 4: 按 DOM 顺序逐位退场，药丸重现遮挡文字，徽章褪为灰色
    tlExit.set(wordPills, { zIndex: 2 })
    const exitSlots = gsap.utils.toArray('.n6_word-wrapper, .n6_badge')
    exitSlots.forEach((slot, i) => {
      const t = i * 0.04
      if (slot.classList.contains('n6_word-wrapper')) {
        const pill = slot.querySelector('.n6_pill')
        const word = slot.querySelector('.n6_word')
        tlExit.to(pill, { opacity: 1, duration: 0.3 }, t)
        tlExit.to(word, { opacity: 0, duration: 0.3 }, t)
      } else {
        tlExit.to(slot, { backgroundColor: '#0c0c0c', duration: 0.3 }, t)
        const text = slot.querySelector('.n6_badge-text')
        const icon = slot.querySelector('.n6_badge-icon')
        if (text) tlExit.to(text, { opacity: 0, duration: 0.2 }, t)
        if (icon) tlExit.to(icon, { opacity: 0, duration: 0.2 }, t)
      }
    })
  }

  const cleanupNum6zAnimation = () => {
    if (tlEntrance) { tlEntrance.kill(); tlEntrance = null }
    if (tlExit) { tlExit.kill(); tlExit = null }
  }

  return { initNum6zAnimation, cleanupNum6zAnimation }
}

