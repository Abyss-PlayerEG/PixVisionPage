<template>
  <div class="search-page" ref="pageRef">
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
      
      <!-- 加载状态 -->
      <div v-if="seriesLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
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
      <div class="user-list">
        <div 
          v-for="user in userList" 
          :key="user.user_id"
          class="user-card"
        >
          <div class="user-avatar" @click="goToProfile(user.user_id)">
            <img 
              :src="getAvatarUrl(user.avatar_url)" 
              :alt="user.nickname"
              @error="handleAvatarError($event)"
            />
          </div>
          <div class="user-info" @click="goToProfile(user.user_id)">
            <div class="user-name">{{ user.nickname || '未设置昵称' }}</div>
            <div class="user-desc">{{ user.user_description || '这个人很懒，什么都没留下' }}</div>
          </div>
          <div class="user-stats">
            <div class="stat-item">
              <div class="stat-num">{{ user.work_count || 0 }}</div>
              <div class="stat-label">作品</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">{{ user.fan_count || 0 }}</div>
              <div class="stat-label">粉丝</div>
            </div>
          </div>
          <div class="user-actions">
            <button 
              class="follow-btn"
              :class="{ followed: user.is_followed }"
              @click.stop="toggleFollow(user)"
            >
              {{ user.is_followed ? '已关注' : '关注' }}
            </button>
            <button class="profile-btn" @click.stop="goToProfile(user.user_id)">
              查看空间
            </button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="userLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAvatarUrl, getWorkImageUrl } from '@/config/api'
import { useSearch } from '@/composables/useSearch'
import VerticalWaterfall from '@/components/VerticalWaterfall.vue'
import gsap from 'gsap'

const router = useRouter()
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
  toggleFollow,
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

// 作品点击跳转
const handleWorkClick = (work) => {
  if (work?.id) {
    router.push(`/work/${work.id}`)
  }
}

// 合集点击处理
const handleSeriesClick = (series) => {
  console.log('点击合集:', series)
  // TODO: 可以跳转到合集详情页或显示合集内作品
}

// GSAP动画
let ctx = null

onMounted(() => {
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
})

onUnmounted(() => {
  // 清理动画
  if (ctx) ctx.revert()
})
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background: #000000;
  color: #ffffff;
  padding-top: 80px; /* 为导航栏留出空间 */
}

/* SearchHero区域 */
.search-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 5% 40px;
  background: linear-gradient(180deg, rgba(0, 169, 71, 0.1) 0%, transparent 100%);
}

.hero-title {
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 700;
  font-size: 48px;
  color: #ffffff;
  margin: 0 0 24px 0;
  text-align: center;
}

.search-box {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 640px;
  height: 56px;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.search-box:focus-within {
  border-color: #00A947;
  box-shadow: 0 0 0 2px rgba(0, 169, 71, 0.2);
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
  color: #ffffff;
  font-size: 16px;
  font-family: 'Noto Sans SC', sans-serif;
  padding-right: 16px;
}

.search-box input::placeholder {
  color: #666666;
}

.search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-right: 4px;
  border: none;
  background: #00A947;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.search-btn:hover {
  background: #00c957;
  transform: scale(1.05);
}

.hero-subtitle {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 16px;
  color: #aaaaaa;
  margin: 24px 0 0 0;
  text-align: center;
}

/* TabBar区域 */
.tab-bar {
  display: flex;
  align-items: center;
  height: 52px;
  background: #0d0d0d;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0 5%;
  position: sticky;
  top: 80px;
  z-index: 10;
}

.tab-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 24px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  gap: 8px;
}

.tab-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.tab-item.active {
  border-bottom: 2px solid #00A947;
}

.tab-item.active .tab-text {
  color: #00A947;
  font-weight: 600;
}

.tab-text {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 14px;
  color: #999999;
  transition: all 0.3s ease;
}

.tab-count {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 11px;
  color: #666666;
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.tab-item.active .tab-count {
  color: rgba(0, 169, 71, 0.8);
  background: rgba(0, 169, 71, 0.1);
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
  background: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.series-card:hover {
  background: #222222;
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

.series-cover {
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #0d0d0d;
}

.series-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.series-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555555;
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
  color: #ffffff;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.series-desc {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 13px;
  color: #999999;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 用户列表区域 */
.user-list {
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #1a1a1a;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-card:hover {
  background: #222222;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 20px;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-desc {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 13px;
  color: #999999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-stats {
  display: flex;
  gap: 32px;
  margin: 0 20px;
}

.stat-item {
  text-align: center;
}

.stat-num {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
}

.stat-label {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 12px;
  color: #777777;
  margin-top: 2px;
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.follow-btn {
  width: 80px;
  height: 32px;
  border-radius: 16px;
  border: none;
  background: #00A947;
  color: #ffffff;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.follow-btn:hover {
  background: #00c957;
  transform: scale(1.05);
}

.follow-btn.followed {
  background: #333333;
  color: #999999;
}

.follow-btn.followed:hover {
  background: #444444;
}

.profile-btn {
  width: 80px;
  height: 28px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: #cecece;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.profile-btn:hover {
  border-color: #00A947;
  color: #00A947;
  background: rgba(0, 169, 71, 0.1);
}

/* 加载状态 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 12px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #333333;
  border-top-color: #00A947;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state span {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 14px;
  color: #999999;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #555555;
  margin-bottom: 20px;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-state p {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 16px;
  color: #777777;
  margin: 0 0 8px 0;
}

.empty-hint {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 13px;
  color: #555555;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-hero {
    padding: 40px 24px 30px;
  }

  .hero-title {
    font-size: 32px;
    margin-bottom: 20px;
  }

  .search-box {
    max-width: 100%;
  }

  .hero-subtitle {
    font-size: 14px;
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

  .user-list {
    padding: 16px 0;
  }

  .user-card {
    padding: 16px;
  }

  .user-stats {
    display: none;
  }

  .user-actions {
    flex-direction: row;
  }

  .follow-btn {
    width: 70px;
    height: 30px;
    font-size: 12px;
  }

  .profile-btn {
    width: 70px;
    height: 26px;
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 28px;
  }

  .search-box {
    height: 48px;
  }

  .search-icon {
    width: 48px;
    height: 48px;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    margin-right: 12px;
  }

  .user-name {
    font-size: 14px;
  }

  .user-desc {
    font-size: 12px;
  }
}
</style>
