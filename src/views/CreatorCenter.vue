<template>
    <section id="Main">

        <section id="num1z" ref="num1zRef">
            <div class="n1_Main" ref="n1MainRef" @mouseenter="onN1MainEnter" @mouseleave="onN1MainLeave">
                <!-- 标题 -->
                <div class="n1_titleCeb" ref="titleCebRef">
                    <H1>
                        <span class="line-third"></span>
                        Pixel-Vision
                        <div>像素视觉</div>
                    </H1>

                    <H2 ref="h2Ref">
                        像素创作者中心
                        <div></div>
                    </H2>
                </div>

                <!-- 收起状态下可见的选项卡（标题与数据栏之间） -->
                <div class="n1_collapsedTabs" ref="collapsedTabsRef">
                    <button class="tab-item" :class="{ active: activeTab === 'works' }" @click="switchTab('works')">
                        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="7" height="7" rx="1"/>
                            <rect x="14" y="3" width="7" height="7" rx="1"/>
                            <rect x="3" y="14" width="7" height="7" rx="1"/>
                            <rect x="14" y="14" width="7" height="7" rx="1"/>
                        </svg>
                        <span>我的作品</span>
                    </button>
                    <button class="tab-item" :class="{ active: activeTab === 'collections' }" @click="switchTab('collections')">
                        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                        </svg>
                        <span>我的合集</span>
                    </button>
                    <button class="tab-item" :class="{ active: activeTab === 'upload' }" @click="switchTab('upload')">
                        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <span>上传作品</span>
                    </button>
                </div>

                <!-- 内容选项 -->
                <div class="n1_optionCeb" ref="optionCebRef">
                    <!-- 顶部：按钮 + 数据栏 -->
                    <div class="option-top">
                        <div class="option-buttons" ref="optionButtonsRef">
                            <!-- 返回首页药丸按钮 -->
                            <button class="pill-btn home-btn" @click="goHome">
                                <svg class="pill-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                    <polyline points="9 22 9 12 15 12 15 22"/>
                                </svg>
                                <span>返回首页</span>
                            </button>

                            <!-- 切换药丸按钮 -->
                            <button
                                class="pill-btn toggle-btn"
                                :class="{ toggled: isToggled }"
                                ref="toggleBtnRef"
                                @click="togglePanel"
                                :aria-label="isToggled ? '已切换至退出模式' : '已切换至欢迎模式'"
                            >
                                <span class="toggle-label label-welcome" :class="{ show: !isToggled }">欢迎您</span>
                                <span class="toggle-circle" ref="circleRef" :class="{ 'has-avatar': avatarUrl }" :style="avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : {}"></span>
                                <span class="toggle-label label-logout" :class="{ show: isToggled }" @click.stop="goToProfile">回到个人中心</span>
                            </button>
                        </div>

                        <!-- 数据栏 -->
                        <div class="data-bar" ref="dataBarRef">
                            <div class="data-item">
                                <span class="data-value">{{ formatStatNumber(userInfo.workCount) }}</span>
                                <span class="data-label">作品</span>
                            </div>
                            <span class="data-divider"></span>
                            <div class="data-item">
                                <span class="data-value">{{ formatStatNumber(userInfo.totalViews) }}</span>
                                <span class="data-label">浏览</span>
                            </div>
                            <span class="data-divider"></span>
                            <div class="data-item">
                                <span class="data-value">{{ formatStatNumber(userInfo.totalLikes) }}</span>
                                <span class="data-label">点赞</span>
                            </div>
                            <span class="data-divider"></span>
                            <div class="data-item">
                                <span class="data-value">{{ formatStatNumber(userInfo.totalStars) }}</span>
                                <span class="data-label">收藏</span>
                            </div>
                        </div>
                    </div>

                    <!-- 预留：中部内容 -->
                    <div class="option-middle">
                        <!-- 后续填充 -->
                    </div>

                    <!-- 底部：选项卡 -->
                    <div class="option-bottom" ref="optionBottomRef">
                        <button class="tab-item" :class="{ active: activeTab === 'works' }" @click="switchTab('works')">
                            <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="3" width="7" height="7" rx="1"/>
                                <rect x="14" y="3" width="7" height="7" rx="1"/>
                                <rect x="3" y="14" width="7" height="7" rx="1"/>
                                <rect x="14" y="14" width="7" height="7" rx="1"/>
                            </svg>
                            <span>我的作品</span>
                        </button>
                        <button class="tab-item" :class="{ active: activeTab === 'collections' }" @click="switchTab('collections')">
                            <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                            </svg>
                            <span>我的合集</span>
                        </button>
                        <button class="tab-item" :class="{ active: activeTab === 'upload' }" @click="switchTab('upload')">
                            <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="17 8 12 3 7 8"/>
                                <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            <span>上传作品</span>
                        </button>
                    </div>
                </div>

                <!-- 收起 / 展开按钮 -->
                <button
                    class="collapse-toggle-btn"
                    ref="collapseBtnRef"
                    @click="toggleCollapse"
                    :aria-label="isCollapsed ? '展开仪表盘' : '收起仪表盘'"
                >
                    <svg class="collapse-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="18 15 12 9 6 15"/>
                    </svg>
                    <span class="collapse-btn-text">{{ isCollapsed ? '展开仪表盘' : '收起仪表盘' }}</span>
                </button>
            </div>
        </section>

    </section>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { getUserProfile } from '@/api/profileApi.js'
import { getAvatarUrl } from '@/config/api.js'

const router = useRouter()

// ── Refs ──
const num1zRef = ref(null)
const n1MainRef = ref(null)
const titleCebRef = ref(null)
const h2Ref = ref(null)
const collapsedTabsRef = ref(null)
const optionCebRef = ref(null)
const optionButtonsRef = ref(null)
const optionBottomRef = ref(null)
const dataBarRef = ref(null)
const toggleBtnRef = ref(null)
const circleRef = ref(null)
const collapseBtnRef = ref(null)

// ── 状态 ──
const isToggled = ref(false)    // false = 圆圈在右（初始），true = 圆圈在左
const isCollapsed = ref(false)  // false = 展开，true = 收起
const activeTab = ref('works')  // 当前激活的选项卡

// ── 头像 ──
const avatarUrl = ref(getAvatarFromCache())

function getAvatarFromCache() {
    try {
        const cached = localStorage.getItem('userInfo')
        if (cached) {
            const parsed = JSON.parse(cached)
            if (parsed.avatar_url) return getAvatarUrl(parsed.avatar_url)
        }
    } catch { /* ignore */ }
    return ''
}

const userInfo = reactive({
    workCount: 0,
    totalViews: 0,
    totalLikes: 0,
    totalStars: 0,
})

// ── GSAP 上下文 ──
let ctx = null
let collapseTl = null  // 收起/展开动画时间线

// ── 原始尺寸缓存（用于展开时恢复） ──
let _origNum1zHeight = null
let _origH2Height = null
let _origBottomHeight = null
let _origButtonsWidth = null
let _origCollapsedTabsWidth = null

// ── 数字格式化 ──
const formatStatNumber = (num) => {
    if (num === null || num === undefined) return '0'
    const n = Number(num)
    if (isNaN(n)) return '0'
    if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, '') + 'w'
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
    return String(n)
}

// ── 计算圆圈移动距离 ──
const getTravelDistance = () => {
    if (!toggleBtnRef.value || !circleRef.value) return 0
    const btnWidth = toggleBtnRef.value.offsetWidth
    const circleWidth = circleRef.value.offsetWidth
    const padding = 4
    return btnWidth - circleWidth - padding * 2
}

// ── 返回首页 ──
const goHome = () => {
    router.push({ name: 'home' })
}

// ── 回到个人中心 ──
const goToProfile = () => {
    router.push({ name: 'profileMe' })
}

// ── 切换底部选项卡 ──
const switchTab = (tab) => {
    activeTab.value = tab
}

// ── 切换面板 ──
const togglePanel = () => {
    isToggled.value = !isToggled.value

    nextTick(() => {
        const distance = getTravelDistance()
        const targetX = isToggled.value ? 0 : distance

        gsap.to(circleRef.value, {
            x: targetX,
            duration: 0.4,
            ease: 'power2.out',
            overwrite: true,
        })
    })
}

// ═══════════════════════════════════════════════════
// 收起 / 展开仪表盘
// ═══════════════════════════════════════════════════
const toggleCollapse = () => {
    if (collapseTl) collapseTl.kill()

    isCollapsed.value = !isCollapsed.value
    const collapsing = isCollapsed.value

    // 首次收起时缓存 #num1z 原始高度
    if (collapsing && _origNum1zHeight === null) {
        _origNum1zHeight = num1zRef.value.offsetHeight
    }

    const tl = gsap.timeline({
        defaults: { duration: 0.4, ease: 'power2.inOut' },
        onComplete: () => { collapseTl = null },
    })
    collapseTl = tl

    if (collapsing) {
        // ── 收起前缓存原始尺寸（用于展开时用固定 px 值恢复，避免 'auto' 触发 layout 抖动） ──
        _origH2Height = h2Ref.value.offsetHeight
        _origBottomHeight = optionBottomRef.value.offsetHeight
        _origButtonsWidth = optionButtonsRef.value.offsetWidth

        // 测量收起状态下中部选项卡的自然宽度
        collapsedTabsRef.value.style.width = 'auto'
        _origCollapsedTabsWidth = collapsedTabsRef.value.offsetWidth
        collapsedTabsRef.value.style.width = '0'

        // ── 收起动画 ──
        // 1. 隐藏 H2（消除 top 偏移 + 高度 + 透明度）
        tl.to(h2Ref.value, { top: 0, height: 0, opacity: 0, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, duration: 0.35 }, 0)

        // 2. 隐藏底部选项卡
        tl.to(optionBottomRef.value, { height: 0, opacity: 0, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, duration: 0.35 }, 0.05)

        // 3. 隐藏两个返回按钮（不隐藏数据栏）
        tl.to(optionButtonsRef.value, { width: 0, opacity: 0, marginLeft: 0, marginRight: 0, paddingLeft: 0, paddingRight: 0, gap: 0, overflow: 'hidden', duration: 0.35 }, 0.1)

        // 4. 收起容器高度
        tl.to(num1zRef.value, { height: 130, duration: 0.4 }, 0)

        // 5. 显示收起状态下的中部选项卡
        tl.to(collapsedTabsRef.value, { width: _origCollapsedTabsWidth, opacity: 1, pointerEvents: 'auto', overflow: 'visible', duration: 0.3 }, 0.2)

        // 6. 旋转图标：向上箭头 → 向下箭头
        tl.to('.collapse-icon', { rotation: 180, duration: 0.35 }, 0)
    } else {
        // ── 展开动画（全部使用缓存的固定 px 值，避免 'auto' 触发每帧 layout） ──
        // 1. 恢复容器高度
        tl.to(num1zRef.value, { height: _origNum1zHeight, duration: 0.4 }, 0)

        // 2. 恢复 H2
        tl.to(h2Ref.value, { top: 60, height: _origH2Height, opacity: 1, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, duration: 0.35 }, 0.05)

        // 3. 恢复底部选项卡
        tl.to(optionBottomRef.value, { height: _origBottomHeight, opacity: 1, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, duration: 0.35 }, 0.1)

        // 4. 恢复两个返回按钮
        tl.to(optionButtonsRef.value, { width: _origButtonsWidth, opacity: 1, marginLeft: 0, marginRight: 0, paddingLeft: 0, paddingRight: 0, gap: 12, overflow: 'hidden', duration: 0.35 }, 0.15)

        // 5. 隐藏收起状态下的中部选项卡
        tl.to(collapsedTabsRef.value, { width: 0, opacity: 0, pointerEvents: 'none', overflow: 'hidden', duration: 0.25 }, 0)

        // 6. 恢复图标旋转
        tl.to('.collapse-icon', { rotation: 0, duration: 0.35 }, 0)
    }

    // 动画结束后清理内联样式，让 CSS 恢复控制
    if (!collapsing) {
        tl.eventCallback('onComplete', () => {
            gsap.set([h2Ref.value, optionBottomRef.value, optionButtonsRef.value, collapsedTabsRef.value], {
                clearProps: 'all'
            })
            collapseTl = null
        })
    } else {
        // 收起完成后的清理（保持收起状态，只清除不需要的内联样式）
        tl.eventCallback('onComplete', () => {
            // 清除 H2 和 bottom 的内联样式（它们已经被动画归零，但 height:0 需要保留）
            // 清除按钮组的内联样式，替换为最终的 display-like 状态
            gsap.set(optionButtonsRef.value, { width: 0, opacity: 0, marginLeft: 0, marginRight: 0, paddingLeft: 0, paddingRight: 0, gap: 0, overflow: 'hidden' })
            collapseTl = null
        })
    }
}

// ── 鼠标进入/离开 .n1_Main → 收起按钮入场/退场 ──
const onN1MainEnter = () => {
    if (!collapseBtnRef.value) return
    gsap.to(collapseBtnRef.value, {
        y: 0,
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: true,
    })
}

const onN1MainLeave = () => {
    if (!collapseBtnRef.value) return
    gsap.to(collapseBtnRef.value, {
        y: 12,
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        overwrite: true,
    })
}

// ── 获取用户数据 ──
const fetchUserStats = async () => {
    // 先从 localStorage 取缓存数据做快速展示
    const cached = localStorage.getItem('userInfo')
    if (cached) {
        try {
            const parsed = JSON.parse(cached)
            userInfo.workCount = parsed.workCount ?? 0
            userInfo.totalViews = parsed.totalViews ?? 0
            userInfo.totalLikes = parsed.totalLikes ?? 0
            userInfo.totalStars = parsed.totalStars ?? 0
        } catch { /* ignore parse error */ }
    }

    // 再从接口拉最新数据
    const result = await getUserProfile()
    if (result.success && result.data) {
        const d = result.data
        userInfo.workCount = d.workCount ?? 0
        userInfo.totalViews = d.totalViews ?? 0
        userInfo.totalLikes = d.totalLikes ?? 0
        userInfo.totalStars = d.totalStars ?? 0

        // 更新头像
        if (d.avatar_url) {
            avatarUrl.value = getAvatarUrl(d.avatar_url)
        }
    }
}

// ── 生命周期 ──
onMounted(async () => {
    await fetchUserStats()

    // 初始化 GSAP 上下文
    ctx = gsap.context(() => {
        // 设置圆圈初始位置（右侧）
        const distance = getTravelDistance()
        gsap.set(circleRef.value, { x: distance })

        // 收起按钮初始状态：隐藏在下
        gsap.set(collapseBtnRef.value, { y: 12, opacity: 0 })
    }, n1MainRef.value)
})

onUnmounted(() => {
    if (ctx) ctx.revert()
    if (collapseTl) collapseTl.kill()
})
</script>

<style scoped>
@import url(../assets/CSS/CreatorCenter.css);
</style>
