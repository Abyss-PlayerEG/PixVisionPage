<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showSuccess, showError, showWarning } from '@/utils/notification.js'
import { getUserProfile } from '@/api/loginViewApi.js'
import { getAvatarUrl } from '@/config/api.js'

const router = useRouter()
const route = useRoute()

// 用户信息
const userInfo = ref({
  avatar: '',
  nickname: '',
  username: '',
  uuid: ''
})

// 加载状态
const isLoading = ref(true)

// 判断是否是自己的主页
const isMyProfile = ref(true) // 暂时默认为 true，后续根据路由参数判断

// 获取用户信息
const fetchUserProfile = async () => {
  isLoading.value = true
  
  try {
    const result = await getUserProfile()
    
    if (result.success && result.data) {
      const data = result.data
      
      // 映射后端字段到前端展示字段
      userInfo.value = {
        avatar: getAvatarUrl(data.avatar_url), // 使用头像接口拼接完整 URL
        nickname: data.nickname || '未设置昵称',
        username: '@' + (data.username || 'unknown'),
        uuid: data.string_user_uuid || data.user_uuid || '无 UUID'
      }
      
      console.log('用户信息已加载:', userInfo.value)
    } else {
      console.error('获取用户信息失败:', result.message)
      showError(result.message || '获取用户信息失败')
    }
  } catch (error) {
    console.error('加载用户信息异常:', error)
    showError('加载用户信息失败')
  } finally {
    isLoading.value = false
  }
}

// 复制 UUID 到剪贴板
const copyUUID = async () => {
  if (!userInfo.value.uuid || userInfo.value.uuid === '无 UUID') {
    showWarning('UUID 不存在', '提示')
    return
  }
  
  try {
    await navigator.clipboard.writeText(userInfo.value.uuid)
    showSuccess('UUID 已复制到剪贴板', '复制成功')
  } catch (error) {
    console.error('复制失败:', error)
    // 降级方案：使用传统方法
    const textArea = document.createElement('textarea')
    textArea.value = userInfo.value.uuid
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    showSuccess('UUID 已复制到剪贴板', '复制成功')
  }
}

// 切换菜单
const switchMenu = (menu) => {
  activeMenu.value = menu
}

// 返回首页
const goHome = () => {
  router.push('/')
}

// 当前选中的菜单项
const activeMenu = ref('works') // works: 个人作品, favorites: 个人收藏

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
      
      <!-- 下半部分 -->
      <div class="uuid-wrapper" @click="copyUUID" title="点击复制 UUID">
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
