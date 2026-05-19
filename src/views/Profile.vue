<script setup>
import { onMounted } from 'vue'
import { useProfile } from '@/composables/useProfile.js'

// 使用 Composable 获取 Profile 页面的状态和方法
const {
  userInfo,
  isLoading,
  activeMenu,
  isMyProfile,
  contactList,
  fetchUserProfile,
  copyUUID,
  switchMenu,
  goHome
} = useProfile()

// 组件挂载时获取用户信息
onMounted(() => {
  fetchUserProfile()
})
</script>

<template>
  <section id="itemCeb">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-state">
      <p>加载中...</p>
    </div>
    
    <!-- 用户信息卡片 -->
    <div v-else class="user-card">
      <!-- 上半部分 -->
      <div class="card-header">
        <div class="avatar-wrapper">
          <img :src="userInfo.avatar" :alt="userInfo.nickname" class="avatar" />
        </div>
        
        <div class="user-info">
          <h3 class="nickname">{{ userInfo.nickname }}</h3>
          <p class="username">{{ userInfo.username }}</p>
        </div>
      </div>
      
      <!-- 下半部分：仅在自己的主页显示 UUID -->
      <div v-if="isMyProfile" class="uuid-wrapper" @click="copyUUID" title="点击复制 UUID">
        <span class="uuid-label">UUID:</span>
        <span class="uuid-text">{{ userInfo.uuid }}</span>
        <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </div>
      
      <!-- 统计数据区域（2×2 网格） -->
      <div class="stats-grid">
        <div class="stat-item" title="作品">
          <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <div class="stat-value">{{ userInfo.workCount }}</div>
        </div>
        <div class="stat-item" title="点赞">
          <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <div class="stat-value">{{ userInfo.totalLikes }}</div>
        </div>
        <div class="stat-item" title="收藏">
          <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <div class="stat-value">{{ userInfo.totalStars }}</div>
        </div>
        <div class="stat-item" title="浏览">
          <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <div class="stat-value">{{ userInfo.totalViews }}</div>
        </div>
      </div>
      
      <!-- 联系方式区域 -->
      <div v-if="contactList.length > 0" class="contact-section">
        <div 
          v-for="(item, index) in contactList" 
          :key="index" 
          class="contact-item"
        >
          <!-- 根据类型显示对应图标 -->
          <svg v-if="item.user_data_name === '电话'" class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <svg v-else-if="item.user_data_name === '邮箱'" class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <svg v-else-if="item.user_data_name === 'QQ'" class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <svg v-else-if="item.user_data_name === '微信'" class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
          <svg v-else-if="item.user_data_name === 'Bilibili'" class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            <path d="M7 10h2v4H7zM15 10h2v4h-2z"></path>
          </svg>
          <svg v-else class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          
          <span class="contact-name">{{ item.user_data_name }}</span>
          <span class="contact-value">{{ item.user_data }}</span>
        </div>
      </div>
    </div>

    <!-- 菜单选项 -->
    <div class="menu-list">
      <div 
        class="menu-item" 
        :class="{ active: activeMenu === 'works' }"
        @click="switchMenu('works')"
      >
        <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        <span class="menu-text">个人作品</span>
      </div>
      
      <div 
        class="menu-item" 
        :class="{ active: activeMenu === 'favorites' }"
        @click="switchMenu('favorites')"
      >
        <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <span class="menu-text">个人收藏</span>
      </div>
    </div>

    <!-- 底部：返回首页按钮 -->
    <div class="sidebar-footer">
      <button class="home-btn" @click="goHome">
        <svg class="home-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span class="home-text">返回首页</span>
      </button>
    </div>
  </section>

  <section id="contShow">
    <!-- todo 内容展示区域（后续根据 activeMenu 动态渲染） -->
    <div v-if="activeMenu === 'works'" class="content-placeholder">
      <p>个人作品区域</p>
    </div>
    <div v-else-if="activeMenu === 'favorites'" class="content-placeholder">
      <p>个人收藏区域</p>
    </div>
  </section>
</template>

<style scoped>
@import "@/assets/CSS/Profile.css";
</style>
