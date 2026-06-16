<template>
    <section id="Main">

        <section id="num1z">
            <div class="n1_Main">
                <!-- 标题 -->
                <div class="n1_titleCeb">
                    <H1>
                        <span class="line-third"></span>
                        Pixel-Vision
                        <div>像素视觉</div>
                    </H1>

                    <H2>
                        像素创作者中心
                        <div></div>
                    </H2>
                </div>

                <!-- 内容选项 -->
                <div class="n1_optionCeb" ref="optionCebRef">
                    <!-- 顶部：按钮 + 数据栏 -->
                    <div class="option-top">
                        <div class="option-buttons">
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
                                ref="toggleBtnRef"
                                @click="togglePanel"
                                :aria-label="isToggled ? '已切换至退出模式' : '已切换至欢迎模式'"
                            >
                                <span class="toggle-label label-welcome" :class="{ show: !isToggled }">欢迎您</span>
                                <span class="toggle-circle" ref="circleRef"></span>
                                <span class="toggle-label label-logout" :class="{ show: isToggled }" @click.stop="goToProfile">回到个人中心</span>
                            </button>
                        </div>

                        <!-- 数据栏 -->
                        <div class="data-bar">
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
                    <div class="option-bottom">
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
            </div>
        </section>

    </section>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { getUserProfile } from '@/api/profileApi.js'

const router = useRouter()

// ── Refs ──
const optionCebRef = ref(null)
const toggleBtnRef = ref(null)
const circleRef = ref(null)

// ── 状态 ──
const isToggled = ref(false) // false = 圆圈在右（初始），true = 圆圈在左
const activeTab = ref('works') // 当前激活的底部选项卡

const userInfo = reactive({
    workCount: 0,
    totalViews: 0,
    totalLikes: 0,
    totalStars: 0,
})

// ── GSAP 上下文 ──
let ctx = null

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
    }
}

// ── 生命周期 ──
onMounted(async () => {
    await fetchUserStats()

    // 初始化 GSAP 上下文并设置圆圈初始位置（右侧）
    ctx = gsap.context(() => {
        const distance = getTravelDistance()
        gsap.set(circleRef.value, { x: distance })
    }, optionCebRef.value)
})

onUnmounted(() => {
    if (ctx) ctx.revert()
})
</script>

<style scoped>
@import url(../assets/CSS/CreatorCenter.css);
</style>