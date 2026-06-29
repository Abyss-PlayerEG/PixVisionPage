/**
 * PixelArchive 页面 Composable
 * num1z — 顶部导航栏
 * num2z — 内容区域（作品瀑布流 / 合集网格 / 用户长条卡片）
 */
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  searchWorks,
  searchSeries,
  searchUsers,
  fetchUserDetail,
  transformWorksToWaterfallFormat,
} from '@/api/searchApi'
import { getAvatarUrl, getWorkImageUrl } from '@/config/api'

export const usePixelArchive = (initialQuery = '') => {
  const router = useRouter()

  // ═══════════════════════════════════════════════════════════════
  // num1z — 搜索 & Tab
  // ═══════════════════════════════════════════════════════════════

  const searchQuery = ref(initialQuery)
  const activeTab = ref('works')
  const tabs = [
    { key: 'works', label: '作品' },
    { key: 'series', label: '合集' },
    { key: 'users', label: '用户' },
  ]

  const pageRef = ref(null)
  const topBarRef = ref(null)
  const contentRef = ref(null)

  // ── 图片预加载：后台加载图片到浏览器缓存，避免滚动时实时解码卡顿 ──
  const preloadQueue = new Set()
  const preloadImage = (url) => {
    if (!url || preloadQueue.has(url)) return
    preloadQueue.add(url)
    const img = new Image()
    img.src = url
  }
  const preloadBatch = (urls) => urls.forEach(preloadImage)

  // ═══════════════════════════════════════════════════════════════
  // num2z — 作品瀑布流
  // ═══════════════════════════════════════════════════════════════

  const workList = ref([])
  const workLoading = ref(false)
  const workPage = ref(1)
  const workPageSize = 30
  const workHasMore = ref(true)
  const workTotal = ref(0)

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
      size: workPageSize,
      workTitle: searchQuery.value || undefined,
    })

    if (result.success && result.data) {
      const transformed = transformWorksToWaterfallFormat(
        result.data.records || []
      )
      if (reset) {
        workList.value = transformed
      } else {
        workList.value = [...workList.value, ...transformed]
      }
      // 后台预加载图片到缓存，滚动时不再实时解码
      preloadBatch(transformed.map((w) => w.src))
      workTotal.value = result.data.total || 0
      workHasMore.value = workList.value.length < workTotal.value
      if (workHasMore.value) workPage.value++
    } else {
      workHasMore.value = false
    }
    workLoading.value = false
  }

  // ═══════════════════════════════════════════════════════════════
  // num2z — 合集网格
  // ═══════════════════════════════════════════════════════════════

  const seriesList = ref([])
  const seriesLoading = ref(false)
  const seriesPage = ref(1)
  const seriesPageSize = 30
  const seriesHasMore = ref(true)

  /** 批量补全合集记录的创作者信息（nickname + avatar_url） */
  const enrichCreatorInfo = async (records) => {
    const uniqueUserIds = [...new Set(records.map(s => s.user_id).filter(Boolean))]
    const userCache = {}
    await Promise.all(uniqueUserIds.map(async (uid) => {
      const detail = await fetchUserDetail(uid)
      if (detail) {
        userCache[uid] = {
          nickname: detail.nickname || null,
          avatar_url: detail.avatar_url || null,
        }
      }
    }))
    return records.map(s => {
      const info = userCache[s.user_id] || {}
      return { ...s, nickname: info.nickname, avatar_url: info.avatar_url }
    })
  }

  /** 为每个合集生成随机高度 (400–800px)，写入 localStorage 避免刷新变动 */
  const SERIES_HEIGHT_KEY = 'pa_series_h'
  const withRandomHeight = (records) => {
    let cache = {}
    try { cache = JSON.parse(localStorage.getItem(SERIES_HEIGHT_KEY) || '{}') } catch {}
    let dirty = false
    // 过滤掉没有封面图的合集
    const filtered = records.filter((s) => !!s.thumb_url)
    const enriched = filtered.map((s) => {
      const id = s.series_id
      if (!cache[id]) { cache[id] = Math.floor(Math.random() * 401) + 400; dirty = true }
      return {
        ...s,
        randHeight: cache[id],
        coverUrl: getWorkImageUrl(s.thumb_url),
      }
    })
    if (dirty) localStorage.setItem(SERIES_HEIGHT_KEY, JSON.stringify(cache))
    return enriched
  }

  const loadSeries = async (reset = false) => {
    if (seriesLoading.value) return
    if (!reset && !seriesHasMore.value) return

    seriesLoading.value = true
    if (reset) {
      seriesPage.value = 1
      seriesList.value = []
      seriesHasMore.value = true
    }

    // 不传 userId，查询所有用户的合集
    const result = await searchSeries({
      current: seriesPage.value,
      size: seriesPageSize,
      keyword: searchQuery.value || undefined,
    })

    if (result.success && result.data) {
      let enriched = withRandomHeight(result.data.records || [])
      enriched = await enrichCreatorInfo(enriched)
      if (reset) {
        seriesList.value = enriched
      } else {
        seriesList.value = [...seriesList.value, ...enriched]
      }
      const total = result.data.total || 0
      seriesHasMore.value = seriesList.value.length < total
      if (seriesHasMore.value) seriesPage.value++
    } else {
      seriesHasMore.value = false
    }
    seriesLoading.value = false
  }

  // ═══════════════════════════════════════════════════════════════
  // num2z — 用户长条卡片
  // ═══════════════════════════════════════════════════════════════

  const userList = ref([])
  const userLoading = ref(false)
  const userPage = ref(1)
  const userPageSize = 20
  const userHasMore = ref(true)
  const userTotal = ref(0)

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
      size: userPageSize,
      keyword: searchQuery.value || undefined,
    })

    if (result.success && result.data) {
      const records = result.data.records || []
      if (reset) {
        userList.value = records
      } else {
        userList.value = [...userList.value, ...records]
      }
      userTotal.value = result.data.total || 0
      userHasMore.value = userList.value.length < userTotal.value
      if (userHasMore.value) userPage.value++
    } else {
      userHasMore.value = false
    }
    userLoading.value = false
  }

  // ═══════════════════════════════════════════════════════════════
  // 通用
  // ═══════════════════════════════════════════════════════════════

  const currentLoading = computed(() => {
    switch (activeTab.value) {
      case 'works': return workLoading.value
      case 'series': return seriesLoading.value
      case 'users': return userLoading.value
      default: return false
    }
  })

  const switchTab = (tabKey) => {
    if (activeTab.value === tabKey) return
    activeTab.value = tabKey
    const loaders = { works: loadWorks, series: loadSeries, users: loadUsers }
    const loader = loaders[tabKey]
    if (loader) loader(true)
  }

  const handleSearch = () => {
    const loaders = { works: loadWorks, series: loadSeries, users: loadUsers }
    const loader = loaders[activeTab.value]
    if (loader) loader(true)
  }

  const loadMore = () => {
    const loaders = { works: loadWorks, series: loadSeries, users: loadUsers }
    const loader = loaders[activeTab.value]
    if (loader) loader(false)
  }

  const goBack = () => {
    if (window.history.length > 1) router.back()
    else router.push('/')
  }

  // ── 工具 ──
  const formatCount = (count) => {
    if (!count || count === 0) return '0'
    if (count >= 10000) return (count / 10000).toFixed(1) + 'w'
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k'
    return String(count)
  }

  const handleAvatarError = (e) => { e.target.src = getAvatarUrl(null) }

  const handleWorkClick = (work) => {
    if (work?.id) router.push(`/work/${work.id}`)
  }

  const handleSeriesClick = (series) => {
    if (series?.series_id) {
      router.push({ path: '/gallery', query: { seriesId: series.series_id, title: series.series_title || '' } })
    }
  }

  const goToProfile = (user) => {
    router.push(`/profile/${user.username || user.user_id}`)
  }

  // ── 初始化加载 ──
  loadWorks(true)

  return {
    // num1z
    pageRef, topBarRef, contentRef,
    searchQuery, activeTab, tabs,
    switchTab, handleSearch, goBack,

    // num2z — works
    workList, workLoading, workHasMore, workTotal, loadWorks, loadMore,
    // num2z — series
    seriesList, seriesLoading, seriesHasMore, loadSeries,
    // num2z — users
    userList, userLoading, userHasMore, userTotal, loadUsers,

    // shared
    currentLoading,
    formatCount, handleAvatarError, handleWorkClick, handleSeriesClick, goToProfile, getAvatarUrl, getWorkImageUrl,
  }
}
