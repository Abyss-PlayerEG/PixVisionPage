/**
 * Profile 页面业务逻辑 Composable
 * 封装用户信息获取、UUID 复制等业务逻辑
 */

import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showSuccess, showError, showWarning } from '@/utils/notification.js'
import { getUserProfile, getUserInfoByUsernameOrUuid } from '@/api/profileApi.js'
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
    fullUuid: '' // 保存完整 UUID 用于复制
  })

  // 加载状态
  const isLoading = ref(true)

  // 当前选中的菜单项
  const activeMenu = ref('works') // works: 个人作品, favorites: 个人收藏

  // 判断是否是自己的主页（根据路由参数判断）
  const isMyProfile = ref(true)

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
      
      userInfo.value = {
        avatar: getAvatarUrl(data.avatar_url), // 使用头像接口拼接完整 URL
        nickname: data.nickname || '未设置昵称',
        username: '@' + (data.username || 'unknown'),
        uuid: fullUuid, // 直接保存完整 UUID，由 CSS 自动截断
        fullUuid: fullUuid // 保存完整 UUID
      }
      
      console.log('✅ 我的用户信息已加载:', userInfo.value)
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
      
      // 映射后端字段到前端展示字段
      userInfo.value = {
        avatar: getAvatarUrl(data.avatar_url),
        nickname: data.nickname || '未设置昵称',
        username: '@' + (data.username || 'unknown'),
        uuid: null // 查看他人时不显示 UUID
      }
      
      console.log('✅ 其他用户信息已加载（username）:', userInfo.value)
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
      
      // 映射后端字段到前端展示字段
      userInfo.value = {
        avatar: getAvatarUrl(data.avatar_url),
        nickname: data.nickname || '未设置昵称',
        username: '@' + (data.username || 'unknown'),
        uuid: null // 查看他人时不显示 UUID
      }
      
      console.log('✅ 其他用户信息已加载（uuid）:', userInfo.value)
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

  return {
    // 状态
    userInfo,
    isLoading,
    activeMenu,
    isMyProfile,
    
    // 方法
    fetchUserProfile,
    copyUUID,
    switchMenu,
    goHome
  }
}
