<script setup>
import { onMounted, computed, ref, nextTick, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useProfile } from '@/composables/useProfile.js'
import { useProfileContent } from '@/composables/useProfileContent.js'
import { showSuccess, showError } from '@/utils/notification.js'
import { updateNickname } from '@/api/profileApi.js'
import { fetchWorkPage, fetchUserLikedWorks, fetchUserStarredWorks } from '@/api/workApi.js'
import { fetchUserHistory, deleteHistory, transformHistoryToWaterfallFormat } from '@/api/historyApi.js'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ContactEditor from '@/components/ContactEditor.vue'
import AccountManager from '@/components/AccountManager.vue'
import VerticalWaterfall from '@/components/VerticalWaterfall.vue'
import EmptyState from '@/components/EmptyState.vue'
import SeriesGrid from '@/components/SeriesGrid.vue'
import CreatorApplyDialog from '@/components/CreatorApplyDialog.vue'
import gsap from 'gsap'

// 空状态图标
const emptyIcons = {
  works: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
  favorites: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  likes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  history: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
}

// 使用 Composable 获取 Profile 页面的状态和方法
const {
  userInfo,
  isLoading,
  activeMenu,
  isMyProfile,
  contactList,
  fetchUserProfile,
  fetchContactList,
  copyUUID,
  switchMenu,
  goHome,
  handleLogout,
  showLogoutDialog,
  confirmLogout,
  cancelLogout,
  handleChangeAvatar
} = useProfile()

// 组件挂载时获取用户信息
onMounted(() => {
  fetchUserProfile()
})

// 判断是否显示作品相关区域（仅创作者 22 和系统管理员 77 可见）
const canShowWorks = computed(() => {
  const role = userInfo.value.userRole
  return role === 22 || role === 77
})

// 判断是否为管理员（审核员 55 / 系统管理员 77）
const canManage = computed(() => {
  const role = userInfo.value.userRole
  return role === 55 || role === 77
})

// UUID 截断显示：超过22位则隐藏后续字符，用 ... 表示
const displayUuid = computed(() => {
  const uuid = userInfo.value.uuid
  if (!uuid || uuid.length <= 22) return uuid
  return uuid.slice(0, 22) + '...'
})

// 11普通用户 / 55审核员：初始默认显示个人收藏
watch(() => userInfo.value.userRole, (role) => {
  if (role === 11 || role === 55) {
    activeMenu.value = 'favorites'
  }
})

const router = useRouter()

// 编辑模式切换
const isEditing = ref(false)
const isSaving = ref(false)
const editNickname = ref('')

const toggleEdit = async () => {
  if (!isEditing.value) {
    // 进入编辑模式
    editNickname.value = userInfo.value.nickname
    isEditing.value = true

    await nextTick()
    // GSAP 入场动效
    const overlay = document.querySelector('#itemCeb .avatar-overlay')
    const wrapper = document.querySelector('#itemCeb .avatar-wrapper')
    if (overlay) {
      gsap.fromTo(overlay,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.3, ease: 'power2.out' }
      )
    }
    if (wrapper) {
      gsap.to(wrapper, { borderColor: 'rgba(0,169,71,0.5)', duration: 0.3, ease: 'power2.out' })
    }
  } else {
    // 保存
    if (isSaving.value) return

    const newNickname = editNickname.value.trim()
    if (!newNickname) {
      showError('昵称不能为空')
      return
    }

    if (newNickname === userInfo.value.nickname) {
      exitEditMode()
      return
    }

    isSaving.value = true
    const result = await updateNickname(newNickname)
    isSaving.value = false

    if (result.success) {
      userInfo.value.nickname = newNickname
      showSuccess(result.message || '昵称修改成功')
      exitEditMode()
    } else {
      showError(result.message || '昵称修改失败')
    }
  }
}

const exitEditMode = async () => {
  const overlay = document.querySelector('#itemCeb .avatar-overlay')
  const wrapper = document.querySelector('#itemCeb .avatar-wrapper')

  if (overlay) {
    gsap.to(overlay, { autoAlpha: 0, duration: 0.25, ease: 'power2.in' })
  }
  if (wrapper) {
    gsap.to(wrapper, { borderColor: 'rgba(255,255,255,0.2)', duration: 0.3, ease: 'power2.out' })
  }

  await new Promise(r => setTimeout(r, 260))
  isEditing.value = false
}

const resetNickname = () => {
  editNickname.value = userInfo.value.nickname
}

// 数字格式化：超过1000显示x.xk，超过10000显示x.xw
const formatStatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  const n = Number(num)
  if (isNaN(n)) return '0'
  if (n >= 10000) {
    return (n / 10000).toFixed(1).replace(/\.0$/, '') + 'w'
  }
  if (n >= 1000) {
    return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  }
  return String(n)
}

// 创作中心入口
const goCreatorCenter = () => {
  router.push('/creatorT')
}

const showCreatorApplyDialog = ref(false)

const goApplyCreator = () => {
  showCreatorApplyDialog.value = true
}

const onCreatorApplySuccess = (message) => {
  showSuccess(message || '申请已提交，请等待管理员审核')
  showCreatorApplyDialog.value = false
}

const goAdminPanel = () => {
  router.push('/admin')
}

// 私信按钮：跳转到消息页面
const goToMessage = () => {
  const userId = userInfo.value.userId
  if (userId) {
    router.push({
      path: '/messages',
      query: { userId }
    })
  }
}

const showAccountManager = ref(false)

const goAccountManagement = () => {
  showAccountManager.value = true
}

// 联系方式编辑器
const showContactEditor = ref(false)

const openContactEditor = () => {
  showContactEditor.value = true
}

const onContactsSaved = () => {
  fetchContactList(userInfo.value.userId)
  showSuccess('联系方式已保存')
  showContactEditor.value = false
}

const handleContactClick = (item) => {
  if (item.user_data_name === 'Bilibili') {
    // Bilibili：跳转到 B 站主页
    const uid = item.user_data
    const url = `https://space.bilibili.com/${uid}`
    window.open(url, '_blank')
  } else {
    // 其他联系方式：复制到剪贴板
    const text = item.user_data
    navigator.clipboard.writeText(text).then(() => {
      showSuccess(`${item.user_data_name}已复制`, '复制成功')
    }).catch(err => {
      console.error('复制失败:', err)
      showError('复制失败，请手动复制', '错误')
    })
  }
}

// ── 内容区：四组瀑布流数据源 ──
const worksContent = useProfileContent((params) =>
  fetchWorkPage({ ...params, userId: userInfo.value.userId })
)
const likesContent = useProfileContent((params) =>
  fetchUserLikedWorks({ ...params, userId: userInfo.value.userId })
)
const starsContent = useProfileContent((params) =>
  fetchUserStarredWorks({ ...params, userId: userInfo.value.userId })
)
const historyContent = useProfileContent(
  (params) => fetchUserHistory(params),
  transformHistoryToWaterfallFormat
)

// 艺术作品筛选条件
const workSearchTitle = ref('')

// 历史记录编辑模式
const isHistoryEditing = ref(false)
const selectedWorkIds = ref([])
const showDeleteDialog = ref(false)
const deleteCount = ref(0)
const showClearDialog = ref(false)

// 切换历史记录编辑模式
const toggleHistoryEdit = () => {
  isHistoryEditing.value = !isHistoryEditing.value
  if (!isHistoryEditing.value) {
    selectedWorkIds.value = []
  }
}

// 选择/取消选择历史记录
const toggleHistorySelection = (workId) => {
  // 验证 workId 是否有效
  if (workId == null || workId === undefined) {
    console.warn('[选择历史记录] 无效的 workId:', workId)
    return
  }
  
  const index = selectedWorkIds.value.indexOf(workId)
  if (index === -1) {
    // 使用展开运算符创建新数组，确保 Vue 响应式更新
    selectedWorkIds.value = [...selectedWorkIds.value, workId]
  } else {
    // 使用 filter 创建新数组，确保 Vue 响应式更新
    selectedWorkIds.value = selectedWorkIds.value.filter(id => id !== workId)
  }
  console.log('[选择历史记录] 当前选中的 workIds:', selectedWorkIds.value)
}

// 删除选中的历史记录
const deleteSelectedHistory = async () => {
  if (selectedWorkIds.value.length === 0) {
    showError('请先选择要删除的历史记录')
    return
  }
  
  // 过滤掉无效的 workId
  const validWorkIds = selectedWorkIds.value.filter(id => id != null && id !== undefined)
  console.log('[删除历史记录] 选中的 workIds:', validWorkIds)
  
  if (validWorkIds.length === 0) {
    showError('未找到有效的作品ID')
    return
  }
  
  // 显示确认弹窗
  deleteCount.value = validWorkIds.length
  showDeleteDialog.value = true
}

// 确认删除历史记录
const confirmDeleteHistory = async () => {
  const validWorkIds = selectedWorkIds.value.filter(id => id != null && id !== undefined)
  
  const result = await deleteHistory({ workIds: validWorkIds })
  if (result.success) {
    showSuccess(result.message || '历史记录删除成功')
    // 从列表中移除已删除的记录
    historyContent.images.value = historyContent.images.value.filter(
      img => !validWorkIds.includes(img.workId)
    )
    selectedWorkIds.value = []
    isHistoryEditing.value = false
  } else {
    showError(result.message || '删除历史记录失败')
  }
}

// 清空所有历史记录
const clearAllHistory = async () => {
  showClearDialog.value = true
}

// 确认清空所有历史记录
const confirmClearAllHistory = async () => {
  const result = await deleteHistory({ clearAll: true })
  if (result.success) {
    showSuccess(result.message || '历史记录已清空')
    historyContent.images.value = []
    selectedWorkIds.value = []
    isHistoryEditing.value = false
  } else {
    showError(result.message || '清空历史记录失败')
  }
}
const workIsOriginal = ref(null) // null=全部, true=原创, false=转载

// 收藏筛选
const favOrderBy = ref('newest') // newest / oldest
const toggleFavOrder = () => {
  favOrderBy.value = favOrderBy.value === 'newest' ? 'oldest' : 'newest'
  applyFavFilter()
}
// 点赞筛选
const likeOrderBy = ref('newest')
const toggleLikeOrder = () => {
  likeOrderBy.value = likeOrderBy.value === 'newest' ? 'oldest' : 'newest'
  applyLikeFilter()
}

// 合集筛选
const seriesKeyword = ref('')
const seriesOrderBy = ref('newest')
const toggleSeriesOrder = () => {
  seriesOrderBy.value = seriesOrderBy.value === 'newest' ? 'oldest' : 'newest'
}

const DIAL_OPTIONS = [
  { value: null, label: '全部' },
  { value: false, label: '转载' },
  { value: true, label: '原创' },
]

const dialActiveIndex = computed(() => {
  if (workIsOriginal.value === null) return 0
  if (workIsOriginal.value === false) return 1
  return 2
})

const dialCenterVal = computed(() => {
  if (dialHovered.value >= 0) return DIAL_OPTIONS[dialHovered.value].value
  return workIsOriginal.value
})

const dialLabel = computed(() => {
  if (workIsOriginal.value === true) return '原创'
  if (workIsOriginal.value === false) return '转载'
  return '全部'
})

// ── 圆盘选择器 ──
const dialExpanded = ref(false)
const dialHovered = ref(-1)
const dialRef = ref(null)
const dialOverlayStyle = ref({})

const getDialAngle = (e) => {
  const dx = e.clientX - dialOverlayStyle.value.cx
  const dy = e.clientY - dialOverlayStyle.value.cy
  // atan2 返回数学角（0°=右, CCW），+90 转为 CSS conic 角（0°=顶, CW）
  return (Math.atan2(dy, dx) * 180 / Math.PI + 90 + 360) % 360
}

const onDialStart = (e) => {
  const rect = dialRef.value.getBoundingClientRect()
  dialOverlayStyle.value = {
    left: `${rect.left + rect.width / 2}px`,
    top: `${rect.top + rect.height / 2}px`,
    cx: rect.left + rect.width / 2,
    cy: rect.top + rect.height / 2,
  }
  dialExpanded.value = true
  dialHovered.value = Math.min(2, getDialAngle(e) / 120 | 0)

  nextTick(() => {
    const pie = document.querySelector('.dial-pie')
    if (pie) {
      gsap.fromTo(pie,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' }
      )
    }
  })
}

const onDialMove = (e) => {
  if (!dialExpanded.value) return
  dialHovered.value = Math.min(2, Math.max(0, getDialAngle(e) / 120 | 0))
}

const onDialEnd = () => {
  if (!dialExpanded.value) return
  const idx = dialHovered.value
  if (idx >= 0) {
    workIsOriginal.value = DIAL_OPTIONS[idx].value
    applyWorkFilter()
  }
  dialHovered.value = -1

  const pie = document.querySelector('.dial-pie')
  if (pie) {
    gsap.to(pie, {
      scale: 0,
      opacity: 0,
      duration: 0.2,
      ease: 'back.in(2)',
      onComplete: () => {
        dialExpanded.value = false
      }
    })
  } else {
    dialExpanded.value = false
  }
}

const applyWorkFilter = () => {
  const extra = { userId: userInfo.value.userId }
  if (workSearchTitle.value.trim()) {
    extra.workTitle = workSearchTitle.value.trim()
  }
  if (workIsOriginal.value !== null) {
    extra.isOriginal = workIsOriginal.value
  }
  worksContent.refresh(extra, 20)
}

const applyFavFilter = () => {
  starsContent.refresh({ userId: userInfo.value.userId, orderBy: favOrderBy.value }, 20)
}

const applyLikeFilter = () => {
  likesContent.refresh({ userId: userInfo.value.userId, orderBy: likeOrderBy.value }, 20)
}

// ── 筛选栏智能显隐 ──
const filterBarHidden = ref(false)
const hideTimer = ref(null)
let lastPanelScrollTop = 0
const HIDE_SCROLL_THRESHOLD = 60
const HOT_ZONE_HEIGHT = 60

const onPanelScroll = (e) => {
  const st = e.target.scrollTop
  if (st <= 5) {
    // 滚回顶部：始终显示
    filterBarHidden.value = false
  } else if (st > lastPanelScrollTop && st > HIDE_SCROLL_THRESHOLD) {
    // 向下滚动超过阈值：收起
    filterBarHidden.value = true
  }
  lastPanelScrollTop = st
}

const onPanelMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  const mouseY = e.clientY - rect.top
  if (mouseY <= HOT_ZONE_HEIGHT) {
    // 鼠标进入热区：展开
    filterBarHidden.value = false
  }
}

const onPanelMouseLeave = () => {
  // 鼠标离开面板后延迟检查——如果已滚离顶部，恢复隐藏
  clearTimeout(hideTimer.value)
  hideTimer.value = setTimeout(() => {
    const panel = document.querySelector('.profile-content-panel')
    if (panel && panel.scrollTop > HIDE_SCROLL_THRESHOLD) {
      filterBarHidden.value = true
    }
  }, 800)
}

// 作品点击 → 跳转详情
// 携带 source 参数告知 WorkDetail 导航上下文，确保上下页在正确的列表中轮播
const handleWorkClick = (img) => {
  if (!img.workId) return
  const uid = userInfo.value?.userId
  const query = {
    img: encodeURIComponent(img.imgUrl || img.src),
    title: encodeURIComponent(img.workTitle || ''),
  }
  if (uid) query.userId = uid
  // 根据当前活跃菜单传递导航来源，使 WorkDetail 使用对应的 API 构建导航列表
  const menu = activeMenu.value
  if (menu === 'likes') query.source = 'likes'
  else if (menu === 'favorites') query.source = 'favorites'
  else if (menu === 'history') query.source = 'history'
  else if (menu === 'works') query.source = 'works'
  router.push({ name: 'workDetail', params: { id: img.workId }, query })
}

// 合集点击 → 跳转 Gallery 预览
const handleSeriesClick = (series) => {
  if (series?.seriesId) {
    router.push({ path: '/gallery', query: { seriesId: series.seriesId, title: series.title || '' } })
  }
}

// 监听 userId + activeMenu，首次激活时自动加载
watch(
  [() => userInfo.value.userId, activeMenu],
  ([uid, menu]) => {
    if (!uid) return
    if (menu === 'works' && worksContent.images.value.length === 0) {
      worksContent.loadFirst(20, { userId: uid })
    } else if (menu === 'likes' && likesContent.images.value.length === 0) {
      likesContent.loadFirst(20, { userId: uid })
    } else if (menu === 'favorites' && starsContent.images.value.length === 0) {
      starsContent.loadFirst(20, { userId: uid })
    } else if (menu === 'history' && historyContent.images.value.length === 0) {
      historyContent.loadFirst(20)
    }
  },
  { immediate: true }
)
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
        <div class="avatar-wrapper" :class="{ 'is-editing': isEditing }">
          <img :src="userInfo.avatar" :alt="userInfo.nickname" class="avatar" />
          <!-- 更换头像遮罩：编辑模式入场时由 GSAP 控制显隐 -->
          <div v-show="isMyProfile && isEditing" class="avatar-overlay" @click="handleChangeAvatar">
            <svg class="avatar-camera-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </div>
        </div>
        
        <div class="user-info">
          <h3 v-if="!isEditing" class="nickname">{{ userInfo.nickname }}</h3>
          <div v-else class="nickname-input-wrapper">
            <input
              v-model="editNickname"
              class="nickname-input"
              type="text"
              :placeholder="userInfo.nickname"
              maxlength="20"
              :disabled="isSaving"
            />
            <button
              v-if="editNickname !== userInfo.nickname"
              class="nickname-reset-btn"
              title="恢复原始昵称"
              @click="resetNickname"
              :disabled="isSaving"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
              </svg>
            </button>
          </div>
          <p class="username">{{ userInfo.username }}</p>
        </div>

        <!-- 编辑入口：仅 /profile/me 可见 -->
        <button v-if="isMyProfile" class="edit-profile-btn" :class="{ 'is-saving': isSaving }" title="编辑资料" @click="toggleEdit" :disabled="isSaving">
          <!-- 编辑图标 -->
          <svg v-if="!isEditing" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          <!-- 加载动画 -->
          <svg v-else-if="isSaving" class="save-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32" stroke-linecap="round">
              <animate attributeName="stroke-dashoffset" values="32;0" dur="0.8s" repeatCount="indefinite" />
            </circle>
          </svg>
          <!-- 存档图标 -->
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
        </button>

        <!-- 私信按钮：仅访客视角可见 -->
        <button v-if="!isMyProfile" class="message-btn" title="私信" @click="goToMessage">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      </div>
      
      <!-- 下半部分：仅在自己的主页显示 UUID -->
      <div v-if="isMyProfile" class="uuid-wrapper" @click="copyUUID" title="点击复制 UUID">
        <span class="uuid-label">UUID:</span>
        <span class="uuid-text">{{ displayUuid }}</span>
        <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </div>
      
      <!-- 统计数据区域（2×2 网格） -->
      <div v-if="canShowWorks" class="stats-grid">
        <div class="stat-item" title="作品">
          <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <div class="stat-value">{{ formatStatNumber(userInfo.workCount) }}</div>
        </div>
        <div class="stat-item" title="浏览">
          <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <div class="stat-value">{{ formatStatNumber(userInfo.totalViews) }}</div>
        </div>
        <div class="stat-item" title="点赞">
          <svg class="stat-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M98.72 511.552l-32-0.256 32 0.256zM96 868.128l32 0.256-32-0.256z m723.008 13.344l-31.008-7.936-0.128 0.48-0.096 0.512 31.232 6.944z m108.832-425.152l31.04 7.936 0.096-0.48 0.128-0.512-31.264-6.944z m-283.456-134.112l31.424 6.176-31.424-6.176z m30.688-155.264l-31.392-6.208 31.392 6.208z m-121.312-41.472l27.232 16.8 0.224-0.32 0.192-0.32-27.648-16.16zM130.72 511.808a27.424 27.424 0 0 1 27.424-27.232v-64a91.424 91.424 0 0 0-91.424 90.72l64 0.512zM128 868.352l2.72-356.544-64-0.512L64 867.872l64 0.48z m27.424 27.648A27.424 27.424 0 0 1 128 868.384l-64-0.512A91.424 91.424 0 0 0 155.424 960v-64zM352 896H155.424v64H352v-64zM158.144 484.576H352v-64H158.144v64zM761.024 896H352v64h408.992v-64z m26.752-21.472a27.424 27.424 0 0 1-26.784 21.472v64c42.88 0 79.968-29.76 89.28-71.584l-62.496-13.888z m109.088-426.144l-108.864 425.152 62.016 15.872 108.832-425.152-61.984-15.872zM869.856 416c17.536 0 30.56 16.256 26.752 33.376l62.496 13.888A91.424 91.424 0 0 0 869.824 352v64zM704 416h165.856v-64H704v64z m-90.976-100c-5.728 28.896 3.136 55.296 22.08 73.76 18.112 17.696 43.392 26.24 68.896 26.24v-64c-11.936 0-20.096-4-24.224-8-3.328-3.264-5.536-7.776-3.968-15.616l-62.784-12.384z m30.656-155.264l-30.656 155.264 62.784 12.384 30.656-155.232-62.784-12.416zM616.8 128c17.28 0 30.24 15.776 26.88 32.736l62.784 12.416A91.424 91.424 0 0 0 616.768 64v64z m-11.712 0h11.68V64h-11.68v64z m-23.68 13.6a27.456 27.456 0 0 1 23.68-13.6V64c-32.512 0-62.592 17.28-78.976 45.344l55.296 32.256zM379.2 469.376l201.76-327.104-54.464-33.6-201.76 327.104 54.464 33.6zM384 928V452.576h-64V928h64z" fill="currentColor"/></svg>
          <div class="stat-value">{{ formatStatNumber(userInfo.totalLikes) }}</div>
        </div>
        <div class="stat-item" title="收藏">
          <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <div class="stat-value">{{ formatStatNumber(userInfo.totalStars) }}</div>
        </div>
      </div>
      
      <!-- 联系方式区域 -->
      <div v-if="contactList.length > 0 || (isMyProfile && isEditing)" class="contact-section" :class="{ 'is-editing': isEditing }">
        <div 
          v-for="(item, index) in contactList" 
          :key="index" 
          class="contact-item"
          @click="isEditing ? openContactEditor() : handleContactClick(item)"
          :title="isEditing ? '编辑' + item.user_data_name : (item.user_data_name === 'Bilibili' ? '点击跳转B站主页' : '点击复制' + item.user_data_name)"
        >
          <!-- 根据类型显示对应图标 -->
          <svg v-if="item.user_data_name === '电话'" class="contact-icon contact-platform-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <svg v-else-if="item.user_data_name === '邮箱'" class="contact-icon contact-platform-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <svg v-else-if="item.user_data_name === 'QQ'" class="contact-icon contact-platform-icon qq-icon" viewBox="0 0 1024 1024" fill="currentColor">
            <path d="M512 188.384c194.752 0 204.64 173.984 215.36 208.256 0 0 15.36 17.12 19.008 43.232 2.368 16.864-7.232 36-7.232 36s62.24 83.872 62.24 149.76c0 41.12-12.128 62.368-26.24 62.368-14.272 0-35.008-43.52-35.008-43.52s-32.512 69.408-48.768 79.392c-16.224 9.888 58.624 20.768 58.624 53.12 0 32.512-59.488 46.88-108.096 46.88-48.768 0-126.272-25.248-126.272-25.248l-28-0.864s-21.6 30.624-110.88 30.624c-89.248 0-128-24.256-128-53.12 0-38.88 56.896-44.16 56.896-44.16s-36.256-10.112-66.88-95.84c0 0-21.248 46.24-51.264 46.24 0 0-12.608-7.52-12.608-49.6 0-87.168 62.624-129.664 89.6-155.776 0 0-4.48-11.392-2.112-25.504 2.624-15.744 12-25.248 12-25.248s-3.52-18.88 9.632-34.112c2.624-42.4 33.28-202.88 228-202.88m0-64c-204.736 0-277.376 146.88-290.24 245.376-6.144 12-9.632 24.352-11.008 36a112.64 112.64 0 0 0-12.768 44.256c-35.488 32.608-87.104 88.224-87.104 181.856 0 64.992 23.872 92.768 44 104.64l15.008 8.96H189.12c-2.88 9.152-4.384 19.04-4.384 29.76 0 27.52 13.888 117.28 192 117.28 65.28 0 106.016-14.144 131.008-29.248 26.24 7.872 87.616 24.64 134.016 24.64 104.64 0 172.256-43.52 172.256-110.912 0-12-2.4-22.624-6.272-32.128 30.88-13.984 57.504-50.112 57.504-119.232 0-60.64-33.504-124.256-56.256-160.512 1.76-10.368 2.368-21.984 0.768-33.984a154.56 154.56 0 0 0-23.136-61.632l-0.736-3.744C752.384 205.504 660.128 124.384 512 124.384z"></path>
          </svg>
          <svg v-else-if="item.user_data_name === '微信'" class="contact-icon contact-platform-icon wechat-icon" viewBox="0 0 1024 1024" fill="currentColor">
            <path d="M767.818667 409.173333C867.338667 444.266667 938.666667 539.136 938.666667 650.666667c0 42.709333-10.496 83.978667-30.261334 120.842666-1.792 3.338667-4.992 8.928-9.696 16.96l14.613334 53.557334c6.506667 23.893333-15.402667 45.813333-39.296 39.296l-53.642667-14.634667-6.229333 3.669333A254.933333 254.933333 0 0 1 682.666667 906.666667c-77.994667 0-147.84-34.88-194.805334-89.888a352.608 352.608 0 0 1-56.64 4.554666c-63.338667 0-124.266667-16.853333-177.472-48.298666-1.834667-1.088-6.410667-3.733333-13.632-7.893334l-80.544 21.653334c-23.914667 6.432-45.76-15.573333-39.146666-39.434667l21.792-78.752a961.205333 961.205333 0 0 1-15.904-27.317333A336.384 336.384 0 0 1 85.333333 480c0-188.618667 154.965333-341.333333 345.888-341.333333 159.914667 0 297.984 108.010667 335.818667 259.296 0.949333 3.765333 1.173333 7.552 0.778667 11.2z m-68.106667-13.952C662.88 282.037333 555.178667 202.666667 431.221333 202.666667 275.434667 202.666667 149.333333 326.933333 149.333333 480c0 46.272 11.498667 90.837333 33.194667 130.698667 2.88 5.290667 10.176 17.706667 21.621333 36.746666a32 32 0 0 1 3.413334 25.013334l-10.517334 37.994666 39.232-10.549333a32 32 0 0 1 24.234667 3.146667c14.272 8.192 22.773333 13.098667 25.802667 14.890666A283.882667 283.882667 0 0 0 431.221333 757.333333c6.154667 0 12.288-0.192 18.389334-0.576A255.061333 255.061333 0 0 1 426.666667 650.666667c0-141.386667 114.613333-256 256-256 5.728 0 11.413333 0.192 17.045333 0.554666z m133.706667 397.056a32 32 0 0 1 3.338666-24.725333 996.672 996.672 0 0 0 15.242667-26.293333A190.997333 190.997333 0 0 0 874.666667 650.666667c0-106.037333-85.962667-192-192-192s-192 85.962667-192 192 85.962667 192 192 192a190.933333 190.933333 0 0 0 98.570666-27.2c2.208-1.322667 8.288-4.874667 18.517334-10.837334a32 32 0 0 1 24.522666-3.210666l12.565334 3.424-3.424-12.565334zM330.666667 426.666667a42.666667 42.666667 0 1 1 0-85.333334 42.666667 42.666667 0 0 1 0 85.333334z m192 0a42.666667 42.666667 0 1 1 0-85.333334 42.666667 42.666667 0 0 1 0 85.333334z m85.333333 202.666666a32 32 0 1 1 0-64 32 32 0 0 1 0 64z m149.333333 0a32 32 0 1 1 0-64 32 32 0 0 1 0 64z"></path>
          </svg>
          <svg v-else-if="item.user_data_name === 'Bilibili'" class="contact-icon contact-platform-icon bilibili-icon" viewBox="0 0 1024 1024" fill="currentColor">
            <path d="M777.514667 131.669333a53.333333 53.333333 0 0 1 0 75.434667L728.746667 255.829333h49.92A160 160 0 0 1 938.666667 415.872v320a160 160 0 0 1-160 160H245.333333A160 160 0 0 1 85.333333 735.872v-320a160 160 0 0 1 160-160h49.749334L246.4 207.146667a53.333333 53.333333 0 1 1 75.392-75.434667l113.152 113.152c3.370667 3.370667 6.186667 7.04 8.448 10.965333h137.088c2.261333-3.925333 5.12-7.68 8.490667-11.008l113.109333-113.152a53.333333 53.333333 0 0 1 75.434667 0z m1.152 231.253334H245.333333a53.333333 53.333333 0 0 0-53.205333 49.365333l-0.128 4.010667v320c0 28.117333 21.76 51.157333 49.365333 53.162666l3.968 0.170667h533.333334a53.333333 53.333333 0 0 0 53.205333-49.365333l0.128-3.968v-320c0-29.44-23.893333-53.333333-53.333333-53.333334z m-426.666667 106.666666c29.44 0 53.333333 23.893333 53.333333 53.333334v53.333333a53.333333 53.333333 0 1 1-106.666666 0v-53.333333c0-29.44 23.893333-53.333333 53.333333-53.333334z m320 0c29.44 0 53.333333 23.893333 53.333333 53.333334v53.333333a53.333333 53.333333 0 1 1-106.666666 0v-53.333333c0-29.44 23.893333-53.333333 53.333333-53.333334z"></path>
          </svg>
          <svg v-else class="contact-icon contact-platform-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>

          <!-- 编辑模式 hover 时显示编辑图标 -->
          <svg v-if="isEditing" class="contact-icon contact-edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </div>

        <!-- 编辑模式下：添加联系方式（+号，最多5个） -->
        <div
          v-if="isMyProfile && isEditing && contactList.length < 5"
          class="contact-item contact-add-btn"
          @click.stop="openContactEditor()"
          title="添加联系方式"
        >
          <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </div>
      </div>

      <!-- 联系方式编辑器弹窗 -->
      <ContactEditor
        v-model:show="showContactEditor"
        :contacts="contactList"
        @saved="onContactsSaved"
      />

      <!-- 账号管理弹窗 -->
      <AccountManager
        v-model:show="showAccountManager"
      />
    </div>

    <!-- 菜单选项 -->
    <div class="menu-list">
      <div 
        v-if="canShowWorks"
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
        <span class="menu-text">{{ isMyProfile ? '艺术作品' : 'TA的作品' }}</span>
      </div>
      
      <div
        v-if="canShowWorks"
        class="menu-item"
        :class="{ active: activeMenu === 'collections' }"
        @click="switchMenu('collections')"
      >
        <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="menu-text">{{ isMyProfile ? '作品合集' : 'TA的合集' }}</span>
      </div>

      <div
        class="menu-item"
        :class="{ active: activeMenu === 'favorites' }"
        @click="switchMenu('favorites')"
      >
        <svg class="menu-icon" viewBox="0 0 1024 1024" fill="currentColor"><path d="M781.186088 616.031873q17.338645 80.573705 30.59761 145.848606 6.119522 27.537849 11.219124 55.075697t9.689243 49.976096 7.649402 38.247012 4.079681 19.888446q3.059761 20.398406-9.179283 27.027888t-27.537849 6.629482q-5.099602 0-14.788845-3.569721t-14.788845-5.609562l-266.199203-155.027888q-72.414343 42.836653-131.569721 76.494024-25.498008 14.278884-50.486056 28.557769t-45.386454 26.517928-35.187251 20.398406-19.888446 10.199203q-10.199203 5.099602-20.908367 3.569721t-19.378486-7.649402-12.749004-14.788845-2.039841-17.848606q1.01992-4.079681 5.099602-19.888446t9.179283-37.737052 11.729084-48.446215 13.768924-54.055777q15.298805-63.23506 34.677291-142.788845-60.175299-52.015936-108.111554-92.812749-20.398406-17.338645-40.286853-34.167331t-35.697211-30.59761-26.007968-22.438247-11.219124-9.689243q-12.239044-11.219124-20.908367-24.988048t-6.629482-28.047809 11.219124-22.438247 20.398406-10.199203l315.155378-28.557769 117.290837-273.338645q6.119522-16.318725 17.338645-28.047809t30.59761-11.729084q10.199203 0 17.848606 4.589641t12.749004 10.709163 8.669323 12.239044 5.609562 10.199203l114.231076 273.338645 315.155378 29.577689q20.398406 5.099602 28.557769 12.239044t8.159363 22.438247q0 14.278884-8.669323 24.988048t-21.928287 26.007968z"/></svg>
        <span class="menu-text">{{ isMyProfile ? '个人收藏' : 'TA的收藏' }}</span>
      </div>


      <div 
        class="menu-item" 
        :class="{ active: activeMenu === 'likes' }"
        @click="switchMenu('likes')"
      >
        <svg class="menu-icon" viewBox="0 0 1024 1024" fill="currentColor"><path d="M885.9 533.7c16.8-22.2 26.1-49.4 26.1-77.7 0-44.9-25.1-87.4-65.5-111.1a67.67 67.67 0 0 0-34.3-9.3H572.4l6-122.9c1.4-29.7-9.1-57.9-29.5-79.4-20.5-21.5-48.1-33.4-77.9-33.4-52 0-98 35-111.8 85.1l-85.9 311h-0.3v428h472.3c9.2 0 18.2-1.8 26.5-5.4 47.6-20.3 78.3-66.8 78.3-118.4 0-12.6-1.8-25-5.4-37 16.8-22.2 26.1-49.4 26.1-77.7-0.2-12.6-2-25.1-5.6-37.1zM112 528v364c0 17.7 14.3 32 32 32h65V496h-65c-17.7 0-32 14.3-32 32z"/></svg>
        <span class="menu-text">{{ isMyProfile ? '个人点赞' : 'TA的点赞' }}</span>
      </div>

      <div
        v-if="isMyProfile"
        class="menu-item"
        :class="{ active: activeMenu === 'history' }"
        @click="switchMenu('history')"
      >
        <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span class="menu-text">浏览历史</span>
      </div>
    </div>

    <!-- 创作中心入口：仅 /profile/me 可见 -->
    <div v-if="isMyProfile" class="creator-center-section">
      <button
        v-if="canShowWorks"
        class="creator-center-btn"
        @click="goCreatorCenter"
      >
        <svg class="creator-center-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <span>创作中心</span>
      </button>
      <button
        v-else-if="!canManage"
        class="creator-center-btn creator-apply-btn"
        @click="goApplyCreator"
      >
        <svg class="creator-center-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="8.5" cy="7" r="4"/>
          <line x1="20" y1="8" x2="20" y2="14"/>
          <line x1="23" y1="11" x2="17" y2="11"/>
        </svg>
        <span>成为创作者</span>
      </button>
      <button
        v-if="canManage"
        class="creator-center-btn admin-panel-btn"
        @click="goAdminPanel"
      >
        <svg class="creator-center-icon" viewBox="0 0 1033 1024" fill="currentColor"><path d="M463.539095 0C324.477366 0 210.699588 113.777778 210.699588 252.839506s113.777778 252.839506 252.839507 252.839506 252.839506-113.777778 252.839506-252.839506-113.777778-252.839506-252.839506-252.839506z m0 421.399177c-92.707819 0-168.559671-75.851852-168.559671-168.559671s75.851852-168.559671 168.559671-168.559671 168.559671 75.851852 168.55967 168.559671-75.851852 168.559671-168.55967 168.559671z"/><path d="M467.753086 421.399177c-4.213992 0-4.213992 0 0 0C206.485597 421.399177 0 627.884774 0 884.938272v12.641975h84.279835V884.938272c0-210.699588 168.559671-379.259259 379.25926-379.25926l4.213991-84.279835zM977.646091 754.304527v-16.855967-16.855967l12.641975-12.641976c21.069959-21.069959 25.283951-50.567901 12.641975-80.065843l-37.925926-63.209877c-16.855967-25.283951-46.353909-37.925926-71.63786-29.497942l-16.855967 4.213992c-8.427984-4.213992-16.855967-12.641975-29.497942-16.855968l-4.213992-8.427983c-8.427984-29.497942-33.711934-50.567901-63.209877-50.567901h-71.63786c-29.497942 0-54.781893 21.069959-63.209876 50.567901l-4.213992 16.855967c-8.427984 4.213992-21.069959 8.427984-29.497942 16.855967l-16.855967-4.213992c-29.497942-8.427984-58.995885 4.213992-71.637861 29.497943l-29.497942 58.995884c-16.855967 25.283951-8.427984 58.995885 12.641975 80.065844l12.641976 12.641975v33.711935l-12.641976 12.641975c-21.069959 21.069959-25.283951 50.567901-12.641975 80.065843l37.925926 63.209877c16.855967 25.283951 46.353909 37.925926 71.63786 29.497942l16.855967-4.213991c8.427984 4.213992 16.855967 12.641975 29.497943 16.855967l4.213991 16.855967c8.427984 29.497942 33.711934 50.567901 63.209877 50.567901h71.63786c29.497942 0 54.781893-21.069959 63.209876-50.567901l4.213992-16.855967c8.427984-4.213992 21.069959-8.427984 29.497943-16.855967l16.855967 4.213991c29.497942 8.427984 58.995885-4.213992 71.63786-29.497942l37.925926-63.209877c16.855967-25.283951 8.427984-58.995885-12.641976-80.065843l-21.069958-16.855967z m-84.279836-42.139918c0 8.427984 4.213992 16.855967 4.213992 25.283951s0 16.855967-4.213992 25.28395l-4.213992 21.069959 33.711935 29.497943-21.069959 33.711934-42.139918-12.641976-16.855967 16.855967c-12.641975 12.641975-29.497942 21.069959-46.35391 25.283951l-21.069958 8.427984-8.427984 42.139917h-37.925926l-12.641975-42.139917-21.069959-8.427984c-16.855967-4.213992-29.497942-12.641975-46.353909-25.283951l-16.855968-16.855967-42.139917 12.641976-21.069959-33.711934 33.711934-29.497943-4.213992-21.069959c0-8.427984-4.213992-16.855967-4.213991-25.28395s0-16.855967 4.213991-25.283951l4.213992-21.069959-33.711934-29.497942 21.069959-33.711934 42.139917 12.641975 16.855968-16.855967c12.641975-12.641975 29.497942-21.069959 46.353909-25.283951l21.069959-8.427983 8.427983-42.139918h37.925926l8.427984 42.139918 21.069959 8.427983c16.855967 4.213992 29.497942 12.641975 46.353909 25.283951l16.855967 16.855967 42.139918-12.641975 21.069959 33.711934-33.711934 29.497942 8.427983 21.069959z"/><path d="M84.279835 897.580247c0 25.283951-16.855967 42.139918-42.139917 42.139918s-42.139918-16.855967-42.139918-42.139918 16.855967-42.139918 42.139918-42.139918 42.139918 21.069959 42.139917 42.139918z"/><path d="M745.876543 632.098765c-58.995885 0-105.349794 46.353909-105.349794 105.349795s46.353909 105.349794 105.349794 105.349794 105.349794-46.353909 105.349794-105.349794-46.353909-105.349794-105.349794-105.349795z m0 126.419754c-12.641975 0-21.069959-8.427984-21.069959-21.069959s8.427984-21.069959 21.069959-21.069959 21.069959 8.427984 21.069959 21.069959-8.427984 21.069959-21.069959 21.069959z"/></svg>
        <span>管理员面板</span>
      </button>
      <button
        class="creator-center-btn account-management-btn"
        @click="goAccountManagement"
      >
        <svg class="creator-center-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
        <span>账号管理</span>
      </button>
    </div>

    <!-- 底部：返回个人中心 + 退出登录按钮 -->
    <div class="sidebar-footer">
      <button class="home-btn" @click="goHome">
        <svg class="home-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span class="home-text">返回首页</span>
      </button>
      <button v-if="isMyProfile" class="logout-btn" @click="handleLogout">
        <svg class="logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        <span class="logout-text">退出登录</span>
      </button>
    </div>
  </section>

  <section id="contShow">
    <!-- 艺术作品 -->
    <div v-if="activeMenu === 'works'" class="profile-content-panel" @scroll="onPanelScroll" @mousemove="onPanelMouseMove" @mouseleave="onPanelMouseLeave">
      <!-- 筛选栏 -->
      <div class="profile-filter-bar" :class="{ 'filter-hidden': filterBarHidden }">
        <div class="profile-filter-input-wrapper">
          <input
            v-model="workSearchTitle"
            class="profile-filter-input"
            type="text"
            placeholder="搜索作品标题…"
            @keyup.enter="applyWorkFilter"
          />
          <button class="profile-filter-search-btn" @click="applyWorkFilter" title="搜索">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
        <div class="profile-filter-dial" ref="dialRef" @mousedown.prevent="onDialStart" :title="dialLabel">
          <!-- 全部：网格图标 -->
          <svg v-if="workIsOriginal === null" class="dial-trigger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
          </svg>
          <!-- 转载：分享图标 -->
          <svg v-else-if="workIsOriginal === false" class="dial-trigger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          <!-- 原创：笔图标 -->
          <svg v-else class="dial-trigger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
          <span class="dial-trigger-label">{{ dialLabel }}</span>
        </div>
      </div>
      <!-- 圆盘展开层 -->
      <teleport to="body">
        <div
          v-if="dialExpanded"
          class="dial-overlay"
          @mousemove="onDialMove"
          @mouseup="onDialEnd"
        >
          <div class="dial-pie" :style="dialOverlayStyle">
            <div
              v-for="(opt, i) in DIAL_OPTIONS"
              :key="opt.label"
              class="dial-segment"
              :class="{ hovered: dialHovered === i, active: dialActiveIndex === i }"
              :style="{ transform: `rotate(${i * 120 + 60}deg)` }"
            >
              <span
                class="dial-segment-label"
                :style="{ transform: `rotate(${-(i * 120 + 60)}deg)` }"
              >{{ opt.label }}</span>
            </div>
            <!-- 中心圆 -->
            <div class="dial-center">
              <svg v-if="dialCenterVal === null" class="dial-center-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
              </svg>
              <svg v-else-if="dialCenterVal === false" class="dial-center-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              <svg v-else class="dial-center-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </div>
          </div>
        </div>
      </teleport>
      <EmptyState
        v-if="!worksContent.isLoading.value && worksContent.images.value.length === 0 && !worksContent.hasMore.value"
        :icon="emptyIcons.works"
        :title="isMyProfile ? '还没有作品' : 'TA还没有作品'"
        :description="isMyProfile ? '快去创作你的第一件作品吧' : '这里还是空的'"
        :action-text="isMyProfile ? '去首页看看' : ''"
        @action="router.push('/')"
      />
      <VerticalWaterfall
        v-else
        :images="worksContent.images.value"
        :has-more="worksContent.hasMore.value"
        :is-loading="worksContent.isLoading.value"
        :gap="8"
        @load-more="worksContent.loadMore({ size: 20 })"
        @image-click="handleWorkClick"
      />
    </div>

    <!-- 作品合集 -->
    <div v-else-if="activeMenu === 'collections'" class="profile-content-panel" @scroll="onPanelScroll" @mousemove="onPanelMouseMove" @mouseleave="onPanelMouseLeave">
      <div class="profile-filter-bar" :class="{ 'filter-hidden': filterBarHidden }">
        <div class="profile-filter-input-wrapper">
          <input
            v-model="seriesKeyword"
            class="profile-filter-input"
            type="text"
            placeholder="搜索合集…"
          />
          <button class="profile-filter-search-btn" title="搜索">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
        <div class="profile-sort-toggle">
          <button
            class="profile-sort-btn"
            :class="{ active: seriesOrderBy === 'newest' }"
            @click="seriesOrderBy !== 'newest' && toggleSeriesOrder()"
          >最新</button>
          <button
            class="profile-sort-btn"
            :class="{ active: seriesOrderBy === 'oldest' }"
            @click="seriesOrderBy !== 'oldest' && toggleSeriesOrder()"
          >最早</button>
        </div>
      </div>
      <SeriesGrid
        :key="userInfo.userId"
        :user-id="userInfo.userId"
        :keyword="seriesKeyword"
        :order-by="seriesOrderBy"
        :is-my-profile="isMyProfile"
        @series-click="handleSeriesClick"
      />
    </div>

    <!-- 个人收藏 -->
    <div v-else-if="activeMenu === 'favorites'" class="profile-content-panel" @scroll="onPanelScroll" @mousemove="onPanelMouseMove" @mouseleave="onPanelMouseLeave">
      <div class="profile-sort-bar" :class="{ 'filter-hidden': filterBarHidden }">
        <button
          class="sort-option"
          :class="{ active: favOrderBy === 'newest' }"
          @click="favOrderBy !== 'newest' && toggleFavOrder()"
        >最新</button>
        <button
          class="sort-option"
          :class="{ active: favOrderBy === 'oldest' }"
          @click="favOrderBy !== 'oldest' && toggleFavOrder()"
        >最早</button>
      </div>
      <EmptyState
        v-if="!starsContent.isLoading.value && starsContent.images.value.length === 0 && !starsContent.hasMore.value"
        :icon="emptyIcons.favorites"
        :title="isMyProfile ? '收藏夹是空的' : 'TA的收藏夹是空的'"
        :description="isMyProfile ? '发现喜欢的作品，点击星标收藏' : '这里还是空的'"
        :action-text="isMyProfile ? '去首页看看' : ''"
        @action="router.push('/')"
      />
      <VerticalWaterfall
        v-else
        :images="starsContent.images.value"
        :has-more="starsContent.hasMore.value"
        :is-loading="starsContent.isLoading.value"
        :gap="8"
        @load-more="starsContent.loadMore({ size: 20 })"
        @image-click="handleWorkClick"
      />
    </div>

    <!-- 个人点赞 -->
    <div v-else-if="activeMenu === 'likes'" class="profile-content-panel" @scroll="onPanelScroll" @mousemove="onPanelMouseMove" @mouseleave="onPanelMouseLeave">
      <div class="profile-sort-bar" :class="{ 'filter-hidden': filterBarHidden }">
        <button
          class="sort-option"
          :class="{ active: likeOrderBy === 'newest' }"
          @click="likeOrderBy !== 'newest' && toggleLikeOrder()"
        >最新</button>
        <button
          class="sort-option"
          :class="{ active: likeOrderBy === 'oldest' }"
          @click="likeOrderBy !== 'oldest' && toggleLikeOrder()"
        >最早</button>
      </div>
      <EmptyState
        v-if="!likesContent.isLoading.value && likesContent.images.value.length === 0 && !likesContent.hasMore.value"
        :icon="emptyIcons.likes"
        :title="isMyProfile ? '还没有点赞内容' : 'TA还没有点赞内容'"
        :description="isMyProfile ? '给喜欢的作品点个赞吧' : '这里还是空的'"
        :action-text="isMyProfile ? '去首页看看' : ''"
        @action="router.push('/')"
      />
      <VerticalWaterfall
        v-else
        :images="likesContent.images.value"
        :has-more="likesContent.hasMore.value"
        :is-loading="likesContent.isLoading.value"
        :gap="8"
        @load-more="likesContent.loadMore({ size: 20 })"
        @image-click="handleWorkClick"
      />
    </div>

    <!-- 浏览历史 -->
    <div v-else-if="activeMenu === 'history'" class="profile-content-panel" @scroll="onPanelScroll" @mousemove="onPanelMouseMove" @mouseleave="onPanelMouseLeave">
      <!-- 历史记录操作栏 -->
      <div class="history-actions">
        <button 
          class="history-edit-btn"
          :class="{ active: isHistoryEditing }"
          @click="toggleHistoryEdit"
        >
          <svg class="history-edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          <span>{{ isHistoryEditing ? '完成' : '编辑' }}</span>
        </button>
        <button 
          v-if="isHistoryEditing && selectedWorkIds.length > 0"
          class="history-delete-btn"
          @click="deleteSelectedHistory"
        >
          <svg class="history-delete-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
          <span>删除</span>
        </button>
        <button 
          v-else-if="isHistoryEditing"
          class="history-clear-btn"
          @click="clearAllHistory"
        >
          <svg class="history-clear-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
          <span>清空</span>
        </button>
      </div>
      <EmptyState
        v-if="!historyContent.isLoading.value && historyContent.images.value.length === 0 && !historyContent.hasMore.value"
        :icon="emptyIcons.history"
        title="浏览历史是空的"
        description="浏览作品后会自动记录在这里"
        action-text="去首页看看"
        @action="router.push('/')"
      />
      <div v-else>
        <VerticalWaterfall
          :images="historyContent.images.value"
          :has-more="historyContent.hasMore.value"
          :is-loading="historyContent.isLoading.value"
          :gap="8"
          :is-editing="isHistoryEditing"
          :selected-ids="selectedWorkIds"
          @load-more="historyContent.loadMore({ size: 20 })"
          @image-click="handleWorkClick"
          @select="toggleHistorySelection($event.workId)"
        />
      </div>
    </div>
  </section>

  <!-- 退出登录确认弹窗 -->
  <ConfirmDialog
    v-model:show="showLogoutDialog"
    title="退出登录"
    message="确定要退出登录吗？"
    type="warning"
    yes-text="退出"
    no-text="取消"
    @confirm="confirmLogout"
    @cancel="cancelLogout"
  />
  
  <!-- 删除历史记录确认弹窗 -->
  <ConfirmDialog
    v-model:show="showDeleteDialog"
    title="删除历史记录"
    :message="`确定要删除选中的 ${deleteCount} 条历史记录吗？`"
    type="danger"
    yes-text="删除"
    no-text="取消"
    @confirm="confirmDeleteHistory"
    @cancel="showDeleteDialog = false"
  />
  
  <!-- 清空历史记录确认弹窗 -->
  <ConfirmDialog
    v-model:show="showClearDialog"
    title="清空历史记录"
    message="确定要清空所有历史记录吗？此操作不可恢复。"
    type="danger"
    yes-text="清空"
    no-text="取消"
    @confirm="confirmClearAllHistory"
    @cancel="showClearDialog = false"
  />
  
  <!-- 成为创作者申请弹窗 -->
  <CreatorApplyDialog
    v-model:show="showCreatorApplyDialog"
    @success="onCreatorApplySuccess"
    @cancel="showCreatorApplyDialog = false"
  />
</template>

<style scoped>
@import "@/assets/CSS/Profile.css";
</style>
