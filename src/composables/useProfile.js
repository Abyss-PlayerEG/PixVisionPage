/**
 * Profile 页面业务逻辑 Composable
 * 封装用户信息获取、UUID 复制等业务逻辑
 */

import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccess, showError, showWarning } from '@/utils/notification.js'
import { getUserProfile } from '@/api/profileApi.js'
import { getAvatarUrl } from '@/config/api.js'

/**
 * Profile 页面业务逻辑
 * @returns {Object} Profile 页面的状态和方法
 */
export const useProfile = () => {
  const router = useRouter()

  // 用户信息
  const userInfo = ref({
    avatar: '',
    nickname: '',
    username: '',
    uuid: ''
  })

  // 加载状态
  const isLoading = ref(true)

  // 当前选中的菜单项
  const activeMenu = ref('works') // works: 个人作品, favorites: 个人收藏

  // 判断是否是自己的主页（后续可根据路由参数判断）
  const isMyProfile = ref(true)

  /**
   * 获取用户信息
   */
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

  /**
   * 复制 UUID 到剪贴板
   */
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
