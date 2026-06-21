import {ref, onMounted, onUnmounted, nextTick} from 'vue'
import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'

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
        animationTimeline.to({}, {duration: displayDuration})

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
                gsap.set(arrow, {x: -15})

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

        gsap.set([bgImg, bottomImg].filter(Boolean), {willChange: 'transform'})

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
            gsap.set(bgWrap, {transformOrigin: 'center center'})
            scrollSt = ScrollTrigger.create({
                trigger: '#num1z',
                start: 'top top',
                end: 'bottom top',
                scrub: true,
                onUpdate: (self) => {
                    const s = 1 + self.progress * 0.1
                    gsap.set(bgWrap, {scale: s})
                    if (bottomWrap) gsap.set(bottomWrap, {scale: s})
                },
            })
        }

        bgQuickX = gsap.quickTo(bgImg, 'x', {duration: 0.6, ease: 'power2.out'})
        bgQuickY = gsap.quickTo(bgImg, 'y', {duration: 0.6, ease: 'power2.out'})
        if (bottomImg) {
            bottomQuickX = gsap.quickTo(bottomImg, 'x', {duration: 0.5, ease: 'power2.out'})
            bottomQuickY = gsap.quickTo(bottomImg, 'y', {duration: 0.5, ease: 'power2.out'})
        }

        window.addEventListener('mousemove', onMove, {passive: true})
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
 * Num3z 区域 ScrollTrigger 入场（阈值触发，可收回）
 * 到达 'top 60%' 时播放入场，回滚时反向收回
 * gsap.set 设定初始隐藏态 + .to() 驱动，不受滚动速度影响
 * =========================== */
export const useNum3zAnimation = () => {
    let tl = null

    const initNum3zAnimation = () => {
        const h1 = document.querySelector('#num3z h1')
        const descSpans = document.querySelectorAll('#num3z > div > span')
        const swiperSlides = document.querySelectorAll('.swiper-slide')

        if (!h1 || !descSpans.length || !swiperSlides.length) return

        gsap.set(h1, {opacity: 0, y: 50})
        gsap.set(descSpans, {opacity: 0, y: 20})
        gsap.set(swiperSlides, {opacity: 0, y: 60})

        tl = gsap.timeline({
            scrollTrigger: {
                trigger: '#num3z',
                start: 'top 60%',
                toggleActions: 'play none none reverse',
            },
        })

        tl.to(h1,
            {opacity: 1, y: 0, duration: 0.5, ease: 'power2.out'},
            0,
        )

        tl.to(descSpans,
            {opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out'},
            '>+=0.1',
        )

        tl.to(swiperSlides,
            {opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out'},
            '<=0.2',
        )
    }

    const cleanupNum3zAnimation = () => {
        if (tl) {
            tl.kill();
            tl = null
        }
    }

    return {
        initNum3zAnimation,
        cleanupNum3zAnimation
    }
}

/* ===========================
 * Num4z 区域 ScrollTrigger 入场（阈值触发，可收回）
 * 到达 'top 60%' 时播放入场，回滚时反向收回
 * =========================== */
export const useNum4zAnimation = () => {
    let tl = null

    const initNum4zAnimation = () => {
        const h1 = document.querySelector('#num4z h1')
        const fontSpan = document.querySelector('#num4z .n4_font span')
        const gridLayout = document.querySelector('#num4z .n4_GridLayout')

        if (!h1 || !fontSpan || !gridLayout) return

        gsap.set(h1, {opacity: 0, y: 50})
        gsap.set(fontSpan, {opacity: 0, y: 20})
        gsap.set(gridLayout, {opacity: 0, y: 60, scale: 0.95})

        tl = gsap.timeline({
            scrollTrigger: {
                trigger: '#num4z',
                start: 'top 60%',
                toggleActions: 'play none none reverse',
            },
        })

        tl.to(h1,
            {opacity: 1, y: 0, duration: 0.5, ease: 'power2.out'},
            0,
        )

        tl.to(fontSpan,
            {opacity: 1, y: 0, duration: 0.4, ease: 'power2.out'},
            '<=0.2',
        )

        tl.to(gridLayout,
            {opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power2.out'},
            '<=0.2',
        )
    }

    const cleanupNum4zAnimation = () => {
        if (tl) {
            tl.kill();
            tl = null
        }
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

    const mockNum5z = [
        {id: 1, text: '丝滑优质的动画', top: '20%', left: '5%', color: '#fcd34d'},
        {id: 2, text: '灵动的交互体验', top: '30%', left: '2%', color: '#fbbf24'},
        {id: 3, text: '简约有质感的页面设计', top: '35%', left: '15%', color: '#f59e0b'},
        {id: 4, text: '以简驭繁, 少即是多', top: '40%', left: '60%', color: '#d97706'},
        {id: 5, text: '留白即意境, 克制即高级', top: '65%', left: '80%', color: '#fde68a'},
        {id: 6, text: '克制美学, 细节致胜', top: '75%', left: '70%', color: '#b45309'},
        // 以下为我另外一种配色方案，任何情况下均不要删除以下注释
        // { id: 1, text: '丝滑优质的动画', top: '10%', left: '5%', color: '#00A947' },
        // { id: 2, text: '灵动的交互体验', top: '25%', left: '15%', color: '#FDF9F0' },
        // { id: 3, text: '简约有质感的页面设计', top: '40%', left: '5%', color: '#FF6B6B' },
        // { id: 4, text: '以简驭繁, 少即是多', top: '55%', left: '15%', color: '#FFD93D' },
        // { id: 5, text: '留白即意境, 克制即高级', top: '70%', left: '5%', color: '#6BCB77' },
        // { id: 6, text: '克制美学, 细节致胜', top: '85%', left: '15%', color: '#4D96FF' },
    ]

    return {
        initNum5zAnimation,
        cleanupNum5zAnimation,
        mockNum5z,
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
            {opacity: 0, y: 200},
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
                {opacity: 0, y: 200},
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
            {opacity: 0, y: 200},
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

    const DONE_SVG = '<svg t="1782000896633" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2876" width="20" height="20"><path d="M512 953.81818174c244.02272695 0 441.81818174-197.79545479 441.81818174-441.81818174C953.81818174 267.97727305 756.02272695 70.18181826 512 70.18181826 267.97727305 70.18181826 70.18181826 267.97727305 70.18181826 512c0 244.02272695 197.79545479 441.81818174 441.81818174 441.81818174z m0-65.45454522a376.36363653 376.36363653 0 1 1 0-752.72727305 376.36363653 376.36363653 0 0 1 0 752.72727305z" p-id="2877"></path><path d="M296 671.50454521a305.46818174 305.46818174 0 0 0 432 0 32.72727305 32.72727305 0 1 0-46.30909131-46.26818173 240.01363652 240.01363652 0 0 1-339.38181738 0 32.72727305 32.72727305 0 1 0-46.30909131 46.26818173z" p-id="2878"></path><path d="M358.59090869 426.78636347m-51.13636348 0a51.13636347 51.13636347 0 1 0 102.27272784 0 51.13636347 51.13636347 0 1 0-102.27272784 0Z" p-id="2879"></path><path d="M665.40909131 426.78636347m-51.13636436 0a51.13636347 51.13636347 0 1 0 102.27272784 0 51.13636347 51.13636347 0 1 0-102.27272784 0Z" p-id="2880"></path></svg>'

    const initN5ProgAnimation = () => {
        const progs = document.querySelectorAll('#num5z .n5_prog')
        if (!progs.length) return

        // 初始隐藏 + 状态初始化 + 保存原始 SVG
        progs.forEach((prog) => {
            gsap.set(prog, {opacity: 0, y: 200, scale: 0.8})
            progStates.push({entered: false, swapped: false})
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
                        gsap.to(prog, {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            duration: 0.6,
                            ease: 'power2.out',
                            overwrite: 'auto'
                        })
                    } else if (local <= 0 && state.entered) {
                        state.entered = false
                        gsap.to(prog, {
                            opacity: 0,
                            y: 200,
                            scale: 0.8,
                            duration: 0.35,
                            ease: 'power2.in',
                            overwrite: 'auto'
                        })
                    }

                    // 1. SVG 顺时针自转 + 完成后替换为笑脸
                    const cirItem = prog.querySelector('.n5p_cirItem')
                    const svg = cirItem ? cirItem.querySelector('svg') : null
                    if (svg) {
                        gsap.set(svg, {rotation: local * 360})
                    }

                    if (local >= 1 && !state.swapped) {
                        state.swapped = true
                        if (cirItem) {
                            const curSvg = cirItem.querySelector('svg')
                            if (curSvg) {
                                gsap.to(curSvg, {
                                    opacity: 0, duration: 0.2, onComplete: () => {
                                        cirItem.innerHTML = DONE_SVG
                                        gsap.fromTo(cirItem.querySelector('svg'), {opacity: 0}, {
                                            opacity: 1,
                                            duration: 0.2
                                        })
                                    }
                                })
                            }
                        }
                    } else if (local < 1 && state.swapped) {
                        state.swapped = false
                        if (cirItem) {
                            const curSvg = cirItem.querySelector('svg')
                            if (curSvg) {
                                gsap.to(curSvg, {
                                    opacity: 0, duration: 0.2, onComplete: () => {
                                        cirItem.innerHTML = originalSvgs[i]
                                        gsap.fromTo(cirItem.querySelector('svg'), {opacity: 0}, {
                                            opacity: 1,
                                            duration: 0.2
                                        })
                                    }
                                })
                            }
                        }
                    }

                    // 2. 进度条宽度 10% → 98%
                    const bar = prog.querySelector('.n5p_progItem')
                    if (bar) {
                        gsap.set(bar, {width: `${10 + local * 88}%`})
                    }

                    // 3. 逐点跳动
                    const dots = allDots[i]
                    dots.forEach((dot, j) => {
                        const y = Math.sin(local * Math.PI) * Math.sin(local * Math.PI * 4 + j * Math.PI / 3) * 6
                        gsap.set(dot, {y})
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
        container.addEventListener('touchstart', handleTouchStart, {passive: true})
        container.addEventListener('touchmove', handleTouchMove, {passive: false})
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
            stagger: {each: 0.04, from: 'start'},
            duration: 0.3,
        })

        // Phase 2: 词药丸消失 + 文字出现（徽章不消失，已是最终态）
        tlEntrance.to(wordPills, {
            opacity: 0,
            stagger: {each: 0.04, from: 'start'},
            duration: 0.3,
        }, '<+=0.25')
        tlEntrance.to(words, {
            opacity: 1,
            stagger: {each: 0.04, from: 'start'},
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
        tlExit.set(wordPills, {zIndex: 2})
        const exitSlots = gsap.utils.toArray('.n6_word-wrapper, .n6_badge')
        exitSlots.forEach((slot, i) => {
            const t = i * 0.04
            if (slot.classList.contains('n6_word-wrapper')) {
                const pill = slot.querySelector('.n6_pill')
                const word = slot.querySelector('.n6_word')
                tlExit.to(pill, {opacity: 1, duration: 0.3}, t)
                tlExit.to(word, {opacity: 0, duration: 0.3}, t)
            } else {
                tlExit.to(slot, {backgroundColor: '#0c0c0c', duration: 0.3}, t)
                const text = slot.querySelector('.n6_badge-text')
                const icon = slot.querySelector('.n6_badge-icon')
                if (text) tlExit.to(text, {opacity: 0, duration: 0.2}, t)
                if (icon) tlExit.to(icon, {opacity: 0, duration: 0.2}, t)
            }
        })
    }

    const cleanupNum6zAnimation = () => {
        if (tlEntrance) {
            tlEntrance.kill();
            tlEntrance = null
        }
        if (tlExit) {
            tlExit.kill();
            tlExit = null
        }
    }

    const n6Copy1Words = 'The Pixel holds boundless romance waiting to be explored. Leave the trivial troubles behind, chase the wind and chase the sunset, wander between mountains and seas.'.split(' ')
    const n6Copy2Words = 'No need to confine oneself to narrow boundaries, let the vision roam freely. Every step you take carves unique marks on life. Embrace uncertainty bravely, believe that all encounters have meaning, and live out the most authentic and unrestrained self in fleeting years.'.split(' ')

    return {initNum6zAnimation, cleanupNum6zAnimation, n6Copy1Words, n6Copy2Words}
}

// ==================== num7z — scrub 滚动时间轴 ====================
/**
 * num7z 全段 scrub 动画，顺序呈现：
 *   1. h1 两个 span 从 20%/90% 外扩至 0%/97% 位置 + 淡入
 *   2. h2 淡入
 *   3. n7_icon 两个 div 从右侧 200px 归位 + 淡入
 * 各阶段在时间轴上顺次排布，滚动驱动进度。
 */
export const useNum7zAnimation = (expandedFAQs) => {
    let tl = null
    let tlPills = null
    let stQA = null
    let qaTls = []
    let faqTls = []

    const initNum7zAnimation = () => {
        const h1Spans = document.querySelectorAll('#num7z .n7_showCopy h1 span')
        const h2 = document.querySelector('#num7z .n7_showCopy h2')
        const iconDivs = document.querySelectorAll('#num7z .n7_showCopy .n7_icon > div')

        // 显式设置初始状态（避免 CSS transform 解析偏差）
        gsap.set(h1Spans[0], {left: '5%', xPercent: 0, opacity: 0})
        gsap.set(h1Spans[1], {left: '90%', xPercent: -100, opacity: 0})
        gsap.set(iconDivs, {x: 200, opacity: 0})
        gsap.set(h2, {y: -50})

        // === 标题区滚动时间轴 ===
        if (h1Spans.length && h2 && iconDivs.length) {
            tl = gsap.timeline({
                scrollTrigger: {
                    trigger: '#num7z',
                    start: 'top 50%',
                    end: 'top 5%',
                    scrub: 0.6,
                },
            })

            // Phase 1 — h1 分裂 (t=0 ~ 0.3)
            tl.to(h1Spans[0],
                {left: '0%', xPercent: 0, opacity: 1, duration: 0.3, ease: 'power2.out'},
                0,
            )
            tl.to(h1Spans[1],
                {left: '97%', xPercent: -100, opacity: 1, duration: 0.3, ease: 'power2.out'},
                0,
            )

            // Phase 2 — h2 从上方 20px 归位 + 淡入 (t=0.35 ~ 0.6)
            tl.to(h2,
                {opacity: 1, y: 0, duration: 0.25, ease: 'power2.out'},
                '>+=0.05',
            )

            // Phase 3 — n7_icon divs 归位 (t=0.65 ~ 1.0)
            tl.to(iconDivs,
                {x: 0, opacity: 1, duration: 0.3, stagger: 0.1, ease: 'power2.out'},
                '>+=0.05',
            )
        }

        // === QAshowCopy 背景色阈值触发 ===
        const qaShowCopy = document.querySelector('#num7z .QAshowCopy')
        if (qaShowCopy) {
            stQA = ScrollTrigger.create({
                trigger: '.QAshowCopy',
                start: 'top 70%',
                onEnter: () => gsap.to('#num7z', {backgroundColor: '#00a947', duration: 0.4}),
                onLeaveBack: () => gsap.to('#num7z', {backgroundColor: '#000', duration: 0.4}),
            })
        }

        // === QAcont 问答卡片入场动画（逐元素独立触发） ===
        const qaConts = gsap.utils.toArray('#num7z .QAcont')
        qaConts.forEach((cont) => {
            const n7q = cont.querySelector('.n7q')
            const n7qText = cont.querySelector('.n7q_text')
            const n7aRow = cont.querySelector('.n7a_row')
            const n7a = cont.querySelector('.n7a')
            const n7aAvatar = cont.querySelector('.n7a_row .n7a_avatar')
            const n7a2Row = cont.querySelectorAll('.n7a_row')[1]
            const n7a2 = cont.querySelector('.n7a2')
            const n7a2Avatar = n7a2Row ? n7a2Row.querySelector('.n7a_avatar') : null
            if (!n7q || !n7a) return

            // 捕获 n7q 自然宽度
            const qNatW = n7q.offsetWidth

            // 初始状态
            gsap.set(n7q, {width: 100, overflow: 'hidden', whiteSpace: 'nowrap'})
            gsap.set(n7qText, {x: -40, opacity: 0})
            gsap.set(n7a, {scale: 0.35, y: 15, opacity: 0.5, transformOrigin: '100% 100%'})
            gsap.set(n7aAvatar, {scale: 0, opacity: 0, transformOrigin: '50% 50%'})
            if (n7a2) {
                gsap.set(n7a2, {scale: 0.35, y: 15, opacity: 0.5, transformOrigin: '100% 100%'})
                if (n7a2Avatar) gsap.set(n7a2Avatar, {scale: 0, opacity: 0, transformOrigin: '50% 50%'})
            }

            // n7q — 独立触发：药丸展开 + 文字滑入
            const tlQ = gsap.timeline({
                scrollTrigger: {
                    trigger: n7q,
                    start: 'top bottom',
                    toggleActions: 'play none none reverse',
                },
            })
            tlQ.to(n7q, {width: qNatW, duration: 0.5, ease: 'power3.out'}, 0)
            tlQ.to(n7qText, {x: 0, opacity: 1, duration: 0.4, ease: 'power2.out'}, '>-0.35')
            qaTls.push(tlQ)

            // n7a — 独立触发：气泡展开 + 头像弹出
            const tlA = gsap.timeline({
                scrollTrigger: {
                    trigger: n7aRow,
                    start: 'top bottom',
                    toggleActions: 'play none none reverse',
                },
            })
            tlA.to(n7a, {scale: 1, y: 0, opacity: 1, duration: 0.45, ease: 'power3.out'}, 0)
            tlA.to(n7aAvatar, {scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.7)'}, '-=0.25')
            qaTls.push(tlA)

            // n7a2 — 独立触发
            if (n7a2) {
                const tlA2 = gsap.timeline({
                    scrollTrigger: {
                        trigger: n7a2Row,
                        start: 'top bottom',
                        toggleActions: 'play none none reverse',
                    },
                })
                tlA2.to(n7a2, {scale: 1, y: 0, opacity: 1, duration: 0.45, ease: 'power3.out'}, 0)
                if (n7a2Avatar) {
                    tlA2.to(n7a2Avatar, {scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.7)'}, '-=0.25')
                }
                qaTls.push(tlA2)
            }
        })

        // === FAQ n7q 入场动画（全部折叠时，每个问题进入视口播放药丸展开 + 文字滑入） ===
        const faqPills = gsap.utils.toArray('#num7z .n7QA_also .n7q')
        faqPills.forEach((pill) => {
            const text = pill.querySelector('.n7q_text')
            if (!text) return
            const natW = pill.offsetWidth
            gsap.set(pill, {width: 100, overflow: 'hidden', whiteSpace: 'nowrap'})
            gsap.set(text, {x: -40, opacity: 0})

            const tlFaq = gsap.timeline({
                paused: true,
                scrollTrigger: {
                    trigger: pill,
                    start: 'top bottom',
                    onEnter: () => {
                        if (expandedFAQs && expandedFAQs.value && expandedFAQs.value.size === 0) tlFaq.play()
                    },
                    onLeaveBack: () => {
                        if (expandedFAQs && expandedFAQs.value && expandedFAQs.value.size === 0) tlFaq.reverse()
                    },
                },
            })
            tlFaq.to(pill, {width: natW, duration: 0.5, ease: 'power3.out'}, 0)
            tlFaq.to(text, {x: 0, opacity: 1, duration: 0.4, ease: 'power2.out'}, '>-0.35')
            faqTls.push(tlFaq)
        })

        // === 文字药丸气泡独立滚动时间轴 ===
        const n7Pills = gsap.utils.toArray('#num7z .n7_pill')
        const n7Words = gsap.utils.toArray('#num7z .n7_word')
        if (n7Pills.length && n7Words.length) {
            tlPills = gsap.timeline({
                scrollTrigger: {
                    trigger: '#num7z',
                    start: 'top 5%',
                    end: 'top -30%',
                    scrub: 0.6,
                },
            })

            // Phase 4a — 药丸骨架逐个出现
            tlPills.to(n7Pills,
                {opacity: 1, stagger: {each: 0.04, from: 'start'}, duration: 0.3, ease: 'power2.out'},
                0,
            )
            // Phase 4b — 药丸消失 + 文字显现
            tlPills.to(n7Pills,
                {opacity: 0, stagger: {each: 0.04, from: 'start'}, duration: 0.3, ease: 'power2.out'},
                '<+=0.3',
            )
            tlPills.to(n7Words,
                {opacity: 1, stagger: {each: 0.04, from: 'start'}, duration: 0.3, ease: 'power2.out'},
                '<',
            )
        }
    }

    const cleanupNum7zAnimation = () => {
        if (tl) {
            tl.kill();
            tl = null
        }
        if (tlPills) {
            tlPills.kill();
            tlPills = null
        }
        if (stQA) {
            stQA.kill();
            stQA = null
        }
        qaTls.forEach(tl => tl.kill())
        qaTls = []
        faqTls.forEach(tl => tl.kill())
        faqTls = []
    }

    const mockNum7zQA = [
        {
            id: 1,
            question: '「像素视觉」是什么？',
            answer: 'Pixel Vision 一个面向摄影与数字艺术爱好者的公开分享系统平台，由「第三维度」团队打造。' +
                '在这里「上传作品」、「浏览创作」、「互动评论」，享受纯粹的视觉交流。',
        },
        {
            id:2,
            question:'「像素视觉」解决了什么问题',
            answer:'方便拍摄者可以在这里分享自己的图片;',
            answer2:'而一般用户则可以在页面中对自己喜欢的用户进行收藏、下载等'
        },
        {
            id: 3,
            question: '如何开始使用「像素视觉」？',
            answer: '用邮箱注册账号，设置用户名和密码，验证邮箱后即可登录。' +
                '注册时会系统分配头像和昵称，随时可在「个人中心」修改。',
            answer2: '当你注册成功后，可立马申请成为「创作者」。' +
                '成为「创作者」后，就能发布你的作品；分享你的喜好；展示你的日常。' +
                '上传作品时请确保内容真实、原创且无版权问题，提交后经审核通过即可公开展示。',
        },
    ]

    const mockNum7zFAQ = [
        {
            id: 1,
            question: '如何成为「创作者」？',
            answer: '注册 Pixel Vision 账号后，在个人中心即可申请成为创作者',
        },
        {
            id: 2,
            question: '如何上传作品？',
            answer: '首先确保自己的 Pixel Vision 账号为创作者账号。' +
                '接着登录后进入「创作中心」，点击「上传作品」。' +
                '选择图片（JPG/JPEG/PNG），填写相关信息。' +
                '提交后经审核通过即可公开展示。',
        },
        {
            id: 3,
            question: '支持哪些图片格式？',
            answer: '支持 JPG、JPEG、PNG 三种主流格式，单张最大 32MB。上传前建议确保清晰度，以获得更好的展示效果。',
        },
        {
            id: 4,
            question: '作品上传后能修改或删除吗？',
            answer: '可以。在作品详情页或个人作品管理中，可以修改作品相关信息，也可以随时删除作品。',
        },
        {
            id: 5,
            question: '忘记密码怎么办？',
            answer: '在登录页点击「忘记密码」，输入用户名或注册邮箱，系统会发送验证码，输入后即可重置密码。',
        },
        {
            id: 6,
            question: '能和其他用户互动吗？',
            answer: '当然！你可以「点赞」和「收藏」喜欢的作品，也可以对作品发布「评论」。在未来，我们还会继续加入更多互动功能。',
        },
        {
            id: 7,
            question: '「第三维度」团队有话想说？',
            answer: '愿每一帧热爱都被看见，愿每一个创作者都在这里找到归属。Pixel Vision 因你而鲜活。—— 「第三维度」团队',
        },
    ]


    const n7Copy1Words = "Don't let waiting turn into regret. Passion will never be let down. We sincerely invite you, a lover of visual creation, to embark on this journey of inspiration.".split(' ')
    const n7Copy2Words = "Don't let waiting become regret. Here, your creativity and art will shine to the fullest.".split(' ')

    const toggleFAQ = (id) => {
        if (expandedFAQs.value.has(id)) {
            const wrap = document.querySelector(`[data-faq-a="${id}"]`)
            if (!wrap) {
                expandedFAQs.value.delete(id);
                return
            }
            const row = wrap.querySelector('.n7a_row')
            const avatar = row?.querySelector('.n7a_avatar')
            const curH = wrap.offsetHeight
            gsap.set(wrap, {height: curH, overflow: 'hidden'})
            const tl = gsap.timeline({onComplete: () => expandedFAQs.value.delete(id)})
            if (avatar) tl.to(avatar, {scale: 0, opacity: 0, duration: 0.15, ease: 'power2.in'}, 0)
            tl.to(row, {scale: 0.35, y: 15, opacity: 0, duration: 0.25, ease: 'power2.in'}, 0)
            tl.to(wrap, {height: 0, duration: 0.3, ease: 'power2.in'}, '-=0.1')
        } else {
            expandedFAQs.value.add(id)
            nextTick(() => {
                const wrap = document.querySelector(`[data-faq-a="${id}"]`)
                if (!wrap) return
                const row = wrap.querySelector('.n7a_row')
                const avatar = row?.querySelector('.n7a_avatar')
                gsap.set(wrap, {height: 'auto', overflow: 'hidden'})
                const targetH = wrap.offsetHeight
                gsap.set(wrap, {height: 0})
                gsap.set(row, {scale: 0.35, y: 15, opacity: 0.5, transformOrigin: '100% 100%'})
                if (avatar) gsap.set(avatar, {scale: 0, opacity: 0})
                const tl = gsap.timeline()
                tl.to(wrap, {height: targetH, duration: 0.2, ease: 'power2.out'})
                tl.to(row, {scale: 1, y: 0, opacity: 1, duration: 0.4, ease: 'power3.out'}, '0')
                if (avatar) tl.to(avatar, {scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.7)'}, '-=0.25')
                tl.set(wrap, {height: 'auto', overflow: 'visible'})
            })
        }
    }

    return {initNum7zAnimation, cleanupNum7zAnimation, mockNum7zQA, mockNum7zFAQ, n7Copy1Words, n7Copy2Words, toggleFAQ}
}

