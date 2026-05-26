/**
 * Profile 页面业务逻辑 Composable
 * 封装用户信息获取、UUID 复制等业务逻辑
 */

import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showSuccess, showError, showWarning } from '@/utils/notification.js'
import { showAvatarCropper } from '@/utils/avatarCropper.js'
import { getUserProfile, getUserInfoByUsernameOrUuid, logoutApi, uploadAvatar } from '@/api/profileApi.js'
import { getUserDataList } from '@/api/userDataApi.js'
import { getAvatarUrl } from '@/config/api.js'

/**
 * Profile 页面业务逻辑
 * @returns {Object} Profile 页面的状态和方法
 */
export const useProfile = () => {
  const router = useRouter()
  const route = useRoute()

  // 用户信息
  const userInfo = ref({
    avatar: '',
    nickname: '',
    username: '',
    uuid: '',
    fullUuid: '', // 保存完整 UUID 用于复制
    userId: null, // 用户 ID，用于查询拓展数据
    userRole: 0, // 用户角色：11普通用户 22创作者 55审核员 66工单管理员 77系统管理员
    workCount: 0, // 作品数量
    totalLikes: 0, // 总点赞数
    totalStars: 0, // 总收藏数
    totalViews: 0 // 总浏览数
  })

  // 加载状态
  const isLoading = ref(true)

  // 当前选中的菜单项
  const activeMenu = ref('works') // works: 个人作品, favorites: 个人收藏

  // 判断是否是自己的主页（根据路由参数判断）
  const isMyProfile = ref(true)

  // 用户拓展数据（联系方式）
  const contactList = ref([])

  /**
   * 获取用户信息（根据路由参数自动判断是查看自己还是他人）
   */
  const fetchUserProfile = async () => {
    isLoading.value = true
    
    try {
      const identifier = route.params.identifier
      
      if (!identifier) {
        // 没有 identifier，查看自己的主页
        isMyProfile.value = true
        await fetchMyProfile()
      } else {
        // 有 identifier，判断是 username 还是 uuid
        const isUuid = /^[0-9a-fA-F]{8}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{12}$/.test(identifier)
        
        isMyProfile.value = false
        
        if (isUuid) {
          // 通过 uuid 查询
          await fetchOtherUserByUuid(identifier)
        } else {
          // 通过 username 查询
          await fetchOtherUserByUsername(identifier)
        }
      }
    } catch (error) {
      console.error('加载用户信息异常:', error)
      showError('加载用户信息失败')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取当前登录用户的信息
   */
  const fetchMyProfile = async () => {
    const result = await getUserProfile()
    
    if (result.success && result.data) {
      const data = result.data
      
      // 映射后端字段到前端展示字段
      const fullUuid = data.string_user_uuid || data.user_uuid || '无 UUID'
      const userId = data.user_id || null
      
      userInfo.value = {
        avatar: getAvatarUrl(data.avatar_url), // 使用头像接口拼接完整 URL
        nickname: data.nickname || '未设置昵称',
        username: '@' + (data.username || 'unknown'),
        uuid: fullUuid, // 直接保存完整 UUID，由 CSS 自动截断
        fullUuid: fullUuid, // 保存完整 UUID
        userId: userId, // 保存用户 ID
        userRole: data.user_role || 0,
        workCount: data.work_count || 0,
        totalLikes: data.total_likes || 0,
        totalStars: data.total_stars || 0,
        totalViews: data.total_views || 0
      }
      
      console.log('✅ 我的用户信息已加载:', userInfo.value)
      
      // 获取联系方式
      if (userId) {
        await fetchContactList(userId)
      }
    } else {
      console.error('获取用户信息失败:', result.message)
      showError(result.message || '获取用户信息失败')
    }
  }



  /**
   * 通过 username 获取其他用户信息
   */
  const fetchOtherUserByUsername = async (username) => {
    const result = await getUserInfoByUsernameOrUuid({ username })
    
    if (result.success && result.data) {
      const data = result.data
      const userId = data.user_id || null
      
      // 映射后端字段到前端展示字段
      userInfo.value = {
        avatar: getAvatarUrl(data.avatar_url),
        nickname: data.nickname || '未设置昵称',
        username: '@' + (data.username || 'unknown'),
        uuid: null, // 查看他人时不显示 UUID
        fullUuid: '',
        userId: userId, // 保存用户 ID
        userRole: data.user_role || 0,
        workCount: data.work_count || 0,
        totalLikes: data.total_likes || 0,
        totalStars: data.total_stars || 0,
        totalViews: data.total_views || 0
      }
      
      console.log('✅ 其他用户信息已加载（username）:', userInfo.value)
      
      // 获取联系方式
      if (userId) {
        await fetchContactList(userId)
      }
    } else {
      console.error('获取其他用户信息失败:', result.message)
      showError(result.message || '用户不存在')
    }
  }

  /**
   * 通过 uuid 获取其他用户信息
   */
  const fetchOtherUserByUuid = async (uuid) => {
    const result = await getUserInfoByUsernameOrUuid({ uuid })
    
    if (result.success && result.data) {
      const data = result.data
      const userId = data.user_id || null
      
      // 映射后端字段到前端展示字段
      userInfo.value = {
        avatar: getAvatarUrl(data.avatar_url),
        nickname: data.nickname || '未设置昵称',
        username: '@' + (data.username || 'unknown'),
        uuid: null, // 查看他人时不显示 UUID
        fullUuid: '',
        userId: userId, // 保存用户 ID
        userRole: data.user_role || 0,
        workCount: data.work_count || 0,
        totalLikes: data.total_likes || 0,
        totalStars: data.total_stars || 0,
        totalViews: data.total_views || 0
      }
      
      console.log('✅ 其他用户信息已加载（uuid）:', userInfo.value)
      
      // 获取联系方式
      if (userId) {
        await fetchContactList(userId)
      }
    } else {
      console.error('获取其他用户信息失败:', result.message)
      showError(result.message || '用户不存在')
    }
  }

  /**
   * 复制 UUID 到剪贴板（复制完整 UUID）
   */
  const copyUUID = async () => {
    const uuidToCopy = userInfo.value.fullUuid || userInfo.value.uuid
    
    if (!uuidToCopy || uuidToCopy === '无 UUID') {
      showWarning('UUID 不存在', '提示')
      return
    }
    
    try {
      await navigator.clipboard.writeText(uuidToCopy)
      showSuccess('UUID 已复制到剪贴板', '复制成功')
    } catch (error) {
      console.error('复制失败:', error)
      // 降级方案：使用传统方法
      const textArea = document.createElement('textarea')
      textArea.value = uuidToCopy
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      showSuccess('UUID 已复制到剪贴板', '复制成功')
    }
  }

  /**
   * 获取用户联系方式列表
   * @param {number} userId - 用户 ID
   */
  const fetchContactList = async (userId) => {
    try {
      const result = await getUserDataList(userId)
      
      if (result.success) {
        contactList.value = result.data || []
        console.log('✅ 联系方式已加载:', contactList.value.length, '条')
      } else {
        console.warn('⚠️ 获取联系方式失败:', result.message)
        contactList.value = []
      }
    } catch (error) {
      console.error('获取联系方式异常:', error)
      contactList.value = []
    }
  }

  /**
   * 切换菜单
   * @param {string} menu - 菜单项 ('works' | 'favorites')
   */
  const switchMenu = (menu) => {
    activeMenu.value = menu
  }

  /**
   * 返回首页
   */
  const goHome = () => {
    router.push('/')
  }

  // 退出登录弹窗状态
  const showLogoutDialog = ref(false)

  /**
   * 显示退出登录确认弹窗
   */
  const handleLogout = () => {
    showLogoutDialog.value = true
  }

  /**
   * 确认退出登录 — 调接口 + 跳转首页
   */
  const confirmLogout = async () => {
    showLogoutDialog.value = false
    await logoutApi()
    router.push('/')
  }

  /**
   * 取消退出登录
   */
  const cancelLogout = () => {
    showLogoutDialog.value = false
  }

  // ── 头像上传 ──
  const isUploadingAvatar = ref(false)

  /**
   * 更换头像：打开裁剪弹窗 → 裁剪确认 → 上传后端
   */
  const handleChangeAvatar = async () => {
    if (isUploadingAvatar.value) return

    // 1. 打开裁剪弹窗
    const result = await showAvatarCropper({
      outputSize: 1000,
      previewSize: 450,
    })

    if (result.canceled || !result.blob) return

    // 2. 上传
    isUploadingAvatar.value = true
    const uploadResult = await uploadAvatar(result.blob)
    isUploadingAvatar.value = false

    if (uploadResult.success) {
      // 3. 本地更新头像（加时间戳防浏览器缓存）
      const newAvatarUrl = uploadResult.data?.avatar_url
      if (newAvatarUrl) {
        userInfo.value.avatar = getAvatarUrl(newAvatarUrl) + '?t=' + Date.now()
      }
      showSuccess(uploadResult.message || '头像更新成功')
    } else {
      showError(uploadResult.message || '头像上传失败')
    }
  }

  return {
    // 状态
    userInfo,
    isLoading,
    activeMenu,
    isMyProfile,
    contactList,
    
    // 方法
    fetchUserProfile,
    copyUUID,
    switchMenu,
    goHome,
    handleLogout,
    showLogoutDialog,
    confirmLogout,
    cancelLogout,
    isUploadingAvatar,
    handleChangeAvatar
  }
}
