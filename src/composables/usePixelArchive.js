/**
 * PixelArchive 页面 Composable — num1z
 * 管理顶部导航栏：品牌药丸、返回、类型筛选、搜索
 * 后续阶段将补充数据加载、分页、卡片渲染等逻辑
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const usePixelArchive = () => {
  const router = useRouter()

  // ── 搜索状态 ──
  const searchQuery = ref('')

  // ── 类型筛选 Tab ──
  const activeTab = ref('works')
  const tabs = [
    { key: 'works', label: '作品' },
    { key: 'series', label: '合集' },
    { key: 'users', label: '用户' },
  ]

  // ── 引用（用于 GSAP 动画作用域） ──
  const pageRef = ref(null)
  const topBarRef = ref(null)

  // ── 切换 Tab ──
  const switchTab = (tabKey) => {
    if (activeTab.value === tabKey) return
    activeTab.value = tabKey
    // TODO num2z: 切换时加载对应数据
  }

  // ── 搜索（回车触发） ──
  const handleSearch = () => {
    const keyword = searchQuery.value.trim()
    if (!keyword) return
    // TODO num2z: 根据 activeTab + keyword 执行搜索
    console.log('[PixelArchive] 搜索:', keyword, 'Tab:', activeTab.value)
  }

  // ── 返回上一页 ──
  const goBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return {
    pageRef,
    topBarRef,
    searchQuery,
    activeTab,
    tabs,
    switchTab,
    handleSearch,
    goBack,
  }
}
