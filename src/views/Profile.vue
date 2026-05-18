<script setup>
import { onMounted } from 'vue'
import { useProfile } from '@/composables/useProfile.js'

// 使用 Composable 获取 Profile 页面的状态和方法
const {
  userInfo,
  isLoading,
  activeMenu,
  isMyProfile,
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
        <span class="uuid-text">{{ userInfo.uuid }}</span>
        <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
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
