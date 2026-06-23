/**
 * 搜索页面 Composable
 * 管理搜索状态、分页、数据加载等逻辑
 */
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { searchWorks, searchSeries, searchUsers, transformWorksToWaterfallFormat } from '@/api/searchApi'
import { getAvatarUrl, FOLLOW_API } from '@/config/api'

export const useSearch = () => {
  const router = useRouter()

  // ============ 搜索状态 ============
  const searchQuery = ref('')
  const activeTab = ref('works') // 默认显示作品Tab
  const tabs = [
    { key: 'works', label: '作品' },
    { key: 'series', label: '合集' },
    { key: 'users', label: '用户' }
  ]

  // ============ 作品搜索状态 ============
  const workList = ref([])
  const workLoading = ref(false)
  const workPage = ref(1)
  const workPageSize = ref(20)
  const workHasMore = ref(true)
  const workTotal = ref(0)

  // ============ 合集搜索状态 ============
  const seriesList = ref([])
  const seriesLoading = ref(false)
  const seriesPage = ref(1)
  const seriesPageSize = ref(20)
  const seriesHasMore = ref(true)
  const seriesTotal = ref(0)

  // ============ 用户搜索状态 ============
  const userList = ref([])
  const userLoading = ref(false)
  const userPage = ref(1)
  const userPageSize = ref(20)
  const userHasMore = ref(true)
  const userTotal = ref(0)

  // ============ 计算属性 ============
  const currentLoading = computed(() => {
    switch (activeTab.value) {
      case 'works': return workLoading.value
      case 'series': return seriesLoading.value
      case 'users': return userLoading.value
      default: return false
    }
  })

  const currentList = computed(() => {
    switch (activeTab.value) {
      case 'works': return workList.value
      case 'series': return seriesList.value
      case 'users': return userList.value
      default: return []
    }
  })

  const currentHasMore = computed(() => {
    switch (activeTab.value) {
      case 'works': return workHasMore.value
      case 'series': return seriesHasMore.value
      case 'users': return userHasMore.value
      default: return false
    }
  })

  const currentTotal = computed(() => {
    switch (activeTab.value) {
      case 'works': return workTotal.value
      case 'series': return seriesTotal.value
      case 'users': return userTotal.value
      default: return 0
    }
  })

  const isEmpty = computed(() => {
    return !currentLoading.value && currentList.value.length === 0
  })

  // ============ 作品搜索方法 ============
  const loadWorks = async (reset = false) => {
    if (workLoading.value) return
    if (!reset && !workHasMore.value) return

    workLoading.value = true
    if (reset) {
      workPage.value = 1
      workList.value = []
      workHasMore.value = true
    }

    const result = await searchWorks({
      current: workPage.value,
      size: workPageSize.value,
      workTitle: searchQuery.value || undefined
    })

    if (result.success && result.data) {
      const newRecords = result.data.records || []
      const transformed = transformWorksToWaterfallFormat(newRecords)

      if (reset) {
        workList.value = transformed
      } else {
        workList.value = [...workList.value, ...transformed]
      }

      workTotal.value = result.data.total || 0
      if (workList.value.length < workTotal.value) {
        workPage.value++
        workHasMore.value = true
      } else {
        workHasMore.value = false
      }
    } else {
      workHasMore.value = false
    }

    workLoading.value = false
  }

  // ============ 合集搜索方法 ============
  const loadSeries = async (reset = false) => {
    if (seriesLoading.value) return
    if (!reset && !seriesHasMore.value) return

    seriesLoading.value = true
    if (reset) {
      seriesPage.value = 1
      seriesList.value = []
      seriesHasMore.value = true
    }

    const result = await searchSeries({
      current: seriesPage.value,
      size: seriesPageSize.value,
      keyword: searchQuery.value || undefined
    })

    if (result.success && result.data) {
      const newRecords = result.data.records || []

      if (reset) {
        seriesList.value = newRecords
      } else {
        seriesList.value = [...seriesList.value, ...newRecords]
      }

      seriesTotal.value = result.data.total || 0
      if (seriesList.value.length < seriesTotal.value) {
        seriesPage.value++
        seriesHasMore.value = true
      } else {
        seriesHasMore.value = false
      }
    } else {
      seriesHasMore.value = false
    }

    seriesLoading.value = false
  }

  // ============ 用户搜索方法 ============
  const loadUsers = async (reset = false) => {
    if (userLoading.value) return
    if (!reset && !userHasMore.value) return

    userLoading.value = true
    if (reset) {
      userPage.value = 1
      userList.value = []
      userHasMore.value = true
    }

    const result = await searchUsers({
      current: userPage.value,
      size: userPageSize.value,
      keyword: searchQuery.value || undefined
    })

    if (result.success && result.data) {
      const newRecords = result.data.records || []

      if (reset) {
        userList.value = newRecords
      } else {
        userList.value = [...userList.value, ...newRecords]
      }

      userTotal.value = result.data.total || 0
      if (userList.value.length < userTotal.value) {
        userPage.value++
        userHasMore.value = true
      } else {
        userHasMore.value = false
      }
    } else {
      userHasMore.value = false
    }

    userLoading.value = false
  }

  // ============ 搜索处理 ============
  const handleSearch = () => {
    switch (activeTab.value) {
      case 'works':
        loadWorks(true)
        break
      case 'series':
        loadSeries(true)
        break
      case 'users':
        loadUsers(true)
        break
    }
  }

  // ============ Tab切换 ============
  const switchTab = (tabKey) => {
    activeTab.value = tabKey
    // 如果该Tab还没有数据，则加载
    switch (tabKey) {
      case 'works':
        if (workList.value.length === 0 && !workLoading.value) {
          loadWorks(true)
        }
        break
      case 'series':
        if (seriesList.value.length === 0 && !seriesLoading.value) {
          loadSeries(true)
        }
        break
      case 'users':
        if (userList.value.length === 0 && !userLoading.value) {
          loadUsers(true)
        }
        break
    }
  }

  // ============ 加载更多 ============
  const loadMore = () => {
    if (currentLoading.value || !currentHasMore.value) return

    switch (activeTab.value) {
      case 'works':
        loadWorks(false)
        break
      case 'series':
        loadSeries(false)
        break
      case 'users':
        loadUsers(false)
        break
    }
  }

  // ============ 滚动加载 ============
  const handleScroll = () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight

    if (scrollTop + windowHeight >= documentHeight - 100) {
      loadMore()
    }
  }

  // ============ 用户相关操作 ============
  const goToProfile = (user) => {
    // 优先使用用户名，如果没有则使用用户ID
    const identifier = user.username || user.user_id
    router.push(`/profile/${identifier}`)
  }

  const toggleFollow = async (user) => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch(`${FOLLOW_API.TOGGLE}/${user.user_id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      const statusCode = result.code || result.recode
      if (statusCode === 200) {
        user.is_followed = !user.is_followed
        if (user.is_followed) {
          user.fan_count = (user.fan_count || 0) + 1
        } else {
          user.fan_count = Math.max(0, (user.fan_count || 0) - 1)
        }
      }
    } catch (error) {
      console.error('关注操作失败:', error)
    }
  }

  const handleAvatarError = (event) => {
    event.target.src = getAvatarUrl(null)
  }

  // ============ 生命周期 ============
  onMounted(() => {
    // 初始加载作品数据
    loadWorks(true)
    // 添加滚动监听
    window.addEventListener('scroll', handleScroll)
  })

  onUnmounted(() => {
    // 移除滚动监听
    window.removeEventListener('scroll', handleScroll)
  })

  // ============ 返回 ============
  return {
    // 搜索状态
    searchQuery,
    activeTab,
    tabs,
    handleSearch,
    switchTab,

    // 作品相关
    workList,
    workLoading,
    workTotal,

    // 合集相关
    seriesList,
    seriesLoading,
    seriesTotal,

    // 用户相关
    userList,
    userLoading,
    userTotal,
    goToProfile,
    toggleFollow,
    handleAvatarError,

    // 通用
    currentList,
    currentLoading,
    currentHasMore,
    currentTotal,
    isEmpty,
    loadMore
  }
}
