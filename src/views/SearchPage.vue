<template>
  <div class="search-page" ref="pageRef">
    <!-- 顶部导航栏 -->
    <TopNavBar back-text="返回" home-text="首页" />

    <!-- SearchHero区域 -->
    <div class="search-hero">
      <h1 class="hero-title">探索视觉灵感</h1>
      <div class="search-box">
        <div class="search-icon">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="10" cy="10" r="7" stroke="#999" stroke-width="2"/>
            <line x1="15" y1="15" x2="20" y2="20" stroke="#999" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="搜索作品、系列、创作者..."
          @keyup.enter="handleSearch"
        />
        <button class="search-btn" @click="handleSearch">
          <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
            <circle cx="10" cy="10" r="7" stroke="#fff" stroke-width="2"/>
            <line x1="15" y1="15" x2="20" y2="20" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <p class="hero-subtitle">发现来自创作者的精彩作品、系列和灵感</p>
    </div>

    <!-- TabBar区域 -->
    <div class="tab-bar">
      <div 
        v-for="tab in tabs" 
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="switchTab(tab.key)"
      >
        <span class="tab-text">{{ tab.label }}</span>
        <span v-if="getTabCount(tab.key) > 0" class="tab-count">{{ getTabCount(tab.key) }}</span>
      </div>
      <div class="tab-spacer"></div>
    </div>

    <!-- 作品瀑布流区域 -->
    <div class="search-content" v-if="activeTab === 'works'">
      <VerticalWaterfall
        :images="workList"
        :has-more="workHasMore"
        :is-loading="workLoading"
        @image-click="handleWorkClick"
      />
      
      <!-- 空状态 -->
      <div v-if="!workLoading && workList.length === 0 && searchQuery" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
        </div>
        <p>未找到相关作品</p>
        <span class="empty-hint">尝试其他关键词搜索</span>
      </div>
    </div>

    <!-- 合集列表区域 -->
    <div class="search-content" v-else-if="activeTab === 'series'">
      <div class="series-list">
        <div 
          v-for="series in seriesList" 
          :key="series.series_id"
          class="series-card"
          @click="handleSeriesClick(series)"
        >
          <div class="series-cover">
            <img 
              v-if="series.thumb_url" 
              :src="getWorkImageUrl(series.thumb_url)" 
              :alt="series.series_title"
              loading="lazy"
            />
            <div v-else class="series-cover-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
          </div>
          <div class="series-info">
            <div class="series-title">{{ series.series_title || '未命名合集' }}</div>
            <div class="series-desc" v-if="series.about_text">{{ series.about_text }}</div>
          </div>
        </div>
      </div>
      
      <!-- 加载状态 - 骨架屏 -->
      <div v-if="seriesLoading" class="series-skeleton-grid">
        <div v-for="i in 4" :key="i" class="series-skeleton-card">
          <div class="series-skeleton-cover"></div>
          <div class="series-skeleton-info">
            <div class="series-skeleton-title"></div>
            <div class="series-skeleton-desc"></div>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="!seriesLoading && seriesList.length === 0 && searchQuery" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <p>未找到相关合集</p>
        <span class="empty-hint">尝试其他关键词搜索</span>
      </div>
    </div>

    <!-- 用户列表区域 -->
    <div class="search-content" v-else-if="activeTab === 'users'">
      <div class="user-grid">
        <div 
          v-for="user in userList" 
          :key="user.user_id"
          class="user-card"
        >
          <!-- 头像（右上） -->
          <div class="user-avatar" @click="goToProfile(user)">
            <img 
              :src="getAvatarUrl(user.avatar_url)" 
              :alt="user.nickname"
              @error="handleAvatarError($event)"
            />
          </div>
          
          <!-- 昵称+用户名（左上） -->
          <div class="user-info" @click="goToProfile(user)">
            <div class="user-name">{{ user.nickname || '未设置昵称' }}</div>
            <div class="user-username">@{{ user.username || user.email?.split('@')[0] || 'unknown' }}</div>
          </div>
          
          <!-- 统计数据（下面） -->
          <div class="user-stats">
            <div class="stat-item">
              <div class="stat-num">{{ formatCount(user.work_count) }}</div>
              <div class="stat-label">作品</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">{{ formatCount(user.total_likes) }}</div>
              <div class="stat-label">获赞</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">{{ formatCount(user.total_views) }}</div>
              <div class="stat-label">查看</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 - 骨架屏 -->
      <div v-if="userLoading" class="skeleton-grid">
        <div v-for="i in 6" :key="i" class="skeleton-card">
          <div class="skeleton-header">
            <div class="skeleton-info">
              <div class="skeleton-name"></div>
              <div class="skeleton-username"></div>
            </div>
            <div class="skeleton-avatar"></div>
          </div>
          <div class="skeleton-stats">
            <div class="skeleton-stat"></div>
            <div class="skeleton-stat"></div>
            <div class="skeleton-stat"></div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!userLoading && userList.length === 0 && searchQuery" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <p>未找到相关用户</p>
        <span class="empty-hint">尝试其他关键词搜索</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getAvatarUrl, getWorkImageUrl } from '@/config/api'
import { useSearch } from '@/composables/useSearch'
import VerticalWaterfall from '@/components/VerticalWaterfall.vue'
import TopNavBar from '@/components/TopNavBar.vue'
import gsap from 'gsap'

const router = useRouter()
const route = useRoute()
const pageRef = ref(null)

// 使用搜索 Composable
const {
  searchQuery,
  activeTab,
  tabs,
  handleSearch,
  switchTab,

  // 作品相关
  workList,
  workLoading,
  workTotal,
  workHasMore,

  // 合集相关
  seriesList,
  seriesLoading,
  seriesTotal,
  seriesHasMore,

  // 用户相关
  userList,
  userLoading,
  userTotal,
  goToProfile,
  handleAvatarError
} = useSearch()

// 获取Tab数量显示
const getTabCount = (tabKey) => {
  switch (tabKey) {
    case 'works': return workTotal.value
    case 'series': return seriesTotal.value
    case 'users': return userTotal.value
    default: return 0
  }
}

// 格式化数字显示
const formatCount = (count) => {
  if (!count || count === 0) return '0'
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count.toString()
}

// 作品点击跳转
const handleWorkClick = (work) => {
  if (work?.id) {
    router.push(`/work/${work.id}`)
  }
}

// 合集点击 → 跳转 Gallery 预览
const handleSeriesClick = (series) => {
  if (series?.series_id) {
    router.push({ path: '/gallery', query: { seriesId: series.series_id, title: series.series_title || '' } })
  }
}

// GSAP动画
let ctx = null
let pageshowHandler = null

onMounted(() => {
  // 检查 URL query 参数，自动执行搜索
  const queryKeyword = route.query.q
  if (queryKeyword) {
    searchQuery.value = queryKeyword
    // 延迟执行搜索，确保组件已完全挂载
    setTimeout(() => {
      handleSearch()
    }, 100)
  }

  // 初始化动画
  ctx = gsap.context(() => {
    // Hero区域动画
    gsap.from('.hero-title', {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      clearProps: 'all'
    })
    
    gsap.from('.search-box', {
      y: 20,
      opacity: 0,
      duration: 0.6,
      delay: 0.2,
      ease: 'power2.out',
      clearProps: 'all'
    })
    
    gsap.from('.hero-subtitle', {
      y: 20,
      opacity: 0,
      duration: 0.6,
      delay: 0.4,
      ease: 'power2.out',
      clearProps: 'all'
    })

    // TabBar动画
    gsap.from('.tab-bar', {
      y: 20,
      opacity: 0,
      duration: 0.6,
      delay: 0.6,
      ease: 'power2.out',
      clearProps: 'all'
    })
  }, pageRef.value)

  // 修复浏览器返回时 BFCache 导致的布局问题
  // 强制浏览器重新计算布局
  requestAnimationFrame(() => {
    const userGrid = pageRef.value?.querySelector('.user-grid')
    if (userGrid) {
      // 通过触发重排来强制浏览器重新计算布局
      userGrid.style.display = 'none'
      void userGrid.offsetHeight // 强制同步重排
      userGrid.style.display = ''
    }
  })

  // 监听 pageshow 事件，处理 BFCache 恢复的情况
  pageshowHandler = (event) => {
    if (event.persisted) {
      // 页面从 BFCache 恢复，强制刷新布局
      requestAnimationFrame(() => {
        const userGrid = pageRef.value?.querySelector('.user-grid')
        if (userGrid) {
          userGrid.style.display = 'none'
          void userGrid.offsetHeight
          userGrid.style.display = ''
        }
      })
    }
  }
  window.addEventListener('pageshow', pageshowHandler)
})

onUnmounted(() => {
  // 清理动画
  if (ctx) ctx.revert()
  // 清理 pageshow 事件监听
  if (pageshowHandler) {
    window.removeEventListener('pageshow', pageshowHandler)
  }
})
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  padding-top: 80px;
}

/* SearchHero区域 */
.search-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 5% 48px;
  background: linear-gradient(180deg, rgba(0, 169, 71, 0.08) 0%, transparent 100%);
}

.hero-title {
  font-family: sul-gbk6;
  font-weight: 900;
  font-size: 48px;
  color: var(--text-primary);
  margin: 0 0 32px 0;
  text-align: center;
  letter-spacing: 2px;
}

.search-box {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 640px;
  height: 56px;
  background: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.35s ease;
  backdrop-filter: blur(12px);
}

.search-box:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 169, 71, 0.15), 0 8px 32px rgba(0, 0, 0, 0.2);
  background: var(--bg-tertiary);
}

.search-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 16px;
  font-family: 'Noto Sans SC', sans-serif;
  padding-right: 16px;
}

.search-box input::placeholder {
  color: var(--text-muted);
}

.search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-right: 4px;
  border: none;
  background: var(--color-primary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.search-btn:hover {
  background: #00c957;
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 169, 71, 0.3);
}

.search-btn:active {
  transform: scale(0.98);
}

.hero-subtitle {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 15px;
  color: var(--text-tertiary);
  margin: 24px 0 0 0;
  text-align: center;
  letter-spacing: 0.5px;
}

/* TabBar区域 */
.tab-bar {
  display: flex;
  align-items: center;
  height: 52px;
  background: rgba(13, 13, 13, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0 5%;
  position: sticky;
  top: 64px;
  z-index: 100;
  transition: all 0.3s ease;
}

.tab-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 24px;
  cursor: pointer;
  position: relative;
  transition: all 0.25s ease;
  gap: 8px;
}

.tab-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: var(--color-primary);
  transition: width 0.3s ease;
  border-radius: 1px;
}

.tab-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.tab-item:hover::after {
  width: 60%;
}

.tab-item.active::after {
  width: 100%;
}

.tab-item.active .tab-text {
  color: var(--color-primary);
  font-weight: 600;
}

.tab-text {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 14px;
  color: var(--text-tertiary);
  transition: all 0.25s ease;
  letter-spacing: 0.3px;
}

.tab-item:hover .tab-text {
  color: var(--text-secondary);
}

.tab-count {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 11px;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.06);
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
  transition: all 0.25s ease;
}

.tab-item.active .tab-count {
  color: rgba(0, 169, 71, 0.9);
  background: rgba(0, 169, 71, 0.12);
}

.tab-spacer {
  flex: 1;
}

/* 搜索内容区域 */
.search-content {
  min-height: calc(100vh - 200px);
  padding: 0 5%;
}

/* 合集列表区域 */
.series-list {
  padding: 24px 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.series-card {
  background: var(--bg-secondary);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.35s ease;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.series-card:hover {
  background: var(--bg-tertiary);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 255, 255, 0.1);
}

.series-cover {
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: var(--bg-surface);
  position: relative;
}

.series-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.series-card:hover .series-cover img {
  transform: scale(1.05);
}

.series-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.series-cover-placeholder svg {
  width: 48px;
  height: 48px;
}

.series-info {
  padding: 16px;
}

.series-title {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.series-desc {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 13px;
  color: var(--text-tertiary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

/* 用户网格区域 */
.user-grid {
  padding: 24px 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  width: 100%;
}

.user-card {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  grid-template-areas:
    "info avatar"
    "stats stats";
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 16px;
  cursor: default;
  transition: all 0.35s ease;
  border: 1px solid rgba(255, 255, 255, 0.06);
  gap: 16px;
  /* 修复浏览器返回时 BFCache 导致的布局问题 */
  will-change: transform;
  box-sizing: border-box;
}

.user-card:hover {
  background: var(--bg-tertiary);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transform: translateY(-4px);
}

.user-avatar {
  grid-area: avatar;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  transition: border-color 0.3s ease;
}

.user-avatar:hover {
  border-color: var(--color-primary);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  grid-area: info;
  min-width: 0;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.user-name {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.25s ease;
}

.user-card:hover .user-name {
  color: var(--color-primary);
}

.user-username {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 13px;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-stats {
  grid-area: stats;
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
}

.stat-num {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 12px;
  color: var(--text-tertiary);
}

/* 加载状态 - 骨架屏 */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 24px 0;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.skeleton-card {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.skeleton-header {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  margin-bottom: 16px;
}

.skeleton-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.skeleton-name {
  height: 16px;
  width: 70%;
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, rgba(255, 255, 255, 0.08) 50%, var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-username {
  height: 14px;
  width: 50%;
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, rgba(255, 255, 255, 0.08) 50%, var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  animation-delay: 0.1s;
}

.skeleton-avatar {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, rgba(255, 255, 255, 0.08) 50%, var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  animation-delay: 0.2s;
}

.skeleton-stats {
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  gap: 16px;
}

.skeleton-stat {
  height: 14px;
  flex: 1;
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, rgba(255, 255, 255, 0.08) 50%, var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-stat:nth-child(2) {
  animation-delay: 0.15s;
}

.skeleton-stat:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 合集骨架屏 */
.series-skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 24px 0;
  animation: fadeIn 0.3s ease;
}

.series-skeleton-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.series-skeleton-cover {
  width: 100%;
  height: 160px;
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, rgba(255, 255, 255, 0.08) 50%, var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.series-skeleton-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.series-skeleton-title {
  height: 16px;
  width: 80%;
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, rgba(255, 255, 255, 0.08) 50%, var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.series-skeleton-desc {
  height: 14px;
  width: 60%;
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, rgba(255, 255, 255, 0.08) 50%, var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  animation-delay: 0.15s;
  border-radius: 4px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: var(--text-muted);
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-state p {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
}

.empty-hint {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 13px;
  color: var(--text-tertiary);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .search-hero {
    padding: 48px 5% 32px;
  }

  .hero-title {
    font-size: 36px;
  }

  .search-box {
    max-width: 480px;
  }

  .series-list {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }

  .series-skeleton-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }

  .user-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }

  .skeleton-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 768px) {
  .search-hero {
    padding: 32px 24px 24px;
  }

  .hero-title {
    font-size: 28px;
    margin-bottom: 16px;
  }

  .search-box {
    max-width: 100%;
    height: 48px;
  }

  .search-icon {
    width: 48px;
    height: 48px;
  }

  .search-btn {
    width: 40px;
    height: 40px;
  }

  .hero-subtitle {
    font-size: 13px;
    margin-top: 16px;
  }

  .tab-bar {
    padding: 0 24px;
  }

  .tab-item {
    padding: 0 16px;
  }

  .search-content {
    padding: 0 24px;
  }

  .series-list {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }

  .series-skeleton-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }

  .series-skeleton-cover {
    height: 120px;
  }

  .user-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .user-card {
    padding: 16px;
  }

  .skeleton-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .skeleton-card {
    padding: 16px;
  }

  .skeleton-avatar {
    width: 48px;
    height: 48px;
  }
}

@media (max-width: 480px) {
  .search-page {
    padding-top: 56px;
  }

  .search-hero {
    padding: 24px 16px 20px;
  }

  .hero-title {
    font-size: 24px;
  }

  .search-box {
    height: 44px;
  }

  .search-icon {
    width: 44px;
    height: 44px;
  }

  .tab-bar {
    top: 56px;
    height: 48px;
    padding: 0 16px;
  }

  .tab-item {
    padding: 0 12px;
  }

  .tab-text {
    font-size: 13px;
  }

  .search-content {
    padding: 0 16px;
  }

  .series-list {
    grid-template-columns: 1fr;
  }

  .series-skeleton-grid {
    grid-template-columns: 1fr;
  }

  .user-avatar {
    width: 48px;
    height: 48px;
  }

  .user-name {
    font-size: 14px;
  }

  .user-username {
    font-size: 12px;
  }

  .stat-num {
    font-size: 14px;
  }

  .stat-label {
    font-size: 11px;
  }
}
</style>
