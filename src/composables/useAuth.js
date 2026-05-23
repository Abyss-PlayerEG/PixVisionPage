import { ref, computed } from 'vue'
import { getAvatarUrl } from '@/config/api'
import { getUserProfile } from '@/api/profileApi'

const isLoggedIn = ref(!!localStorage.getItem('token'))
const userInfo = ref(parseUserInfo())

function parseUserInfo() {
  try {
    const raw = localStorage.getItem('userInfo')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function useAuth() {
  const fetchProfile = async () => {
    if (!isLoggedIn.value) return
    const result = await getUserProfile()
    if (result.success) {
      userInfo.value = parseUserInfo()
    }
  }

  const checkAuth = () => {
    isLoggedIn.value = !!localStorage.getItem('token')
    userInfo.value = parseUserInfo()
    if (isLoggedIn.value) {
      fetchProfile()
    }
  }

  const userAvatar = computed(() => {
    // 兼容 avatar_url（后端标准字段）和 avatar（旧字段）
    const avatarPath = userInfo.value?.avatar_url || userInfo.value?.avatar || ''
    return getAvatarUrl(avatarPath)
  })

  const userNickname = computed(() => {
    return userInfo.value?.nickname || userInfo.value?.username || ''
  })

  return {
    isLoggedIn,
    userInfo,
    userAvatar,
    userNickname,
    checkAuth,
    fetchProfile,
  }
}
