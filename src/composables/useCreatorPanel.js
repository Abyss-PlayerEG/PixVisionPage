/**
 * 创作者面板 Composable
 * 管理创作者面板的所有状态和业务逻辑
 *
 * @module useCreatorPanel
 */

import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  fetchMyWorks,
  uploadWork,
  updateWork,
  deleteWorks,
  addSeries,
  updateSeries,
  deleteSeries,
  fetchSeriesDetail,
  fetchSeriesThumbnails,
  batchAddWorksToSeries,
  batchRemoveWorksFromSeries,
} from '../api/creatorApi'
import { fetchUserSeries } from '../api/workApi'
import { showSuccess, showError, showInfo } from '../utils/notification'
import { API_BASE_URL } from '../config/api'
import { useDialogAnimation } from './creatorPanel/useDialogAnimation'
import { useFileUpload } from './creatorPanel/useFileUpload'
import { useIndicatorSlider } from './creatorPanel/useIndicatorSlider'
import { useEditWorkDialog } from './creatorPanel/useEditWorkDialog'
import { useSeriesDialogs } from './creatorPanel/useSeriesDialogs'
import { useDeleteConfirm } from './creatorPanel/useDeleteConfirm'
import { useScrollLoad } from './creatorPanel/useScrollLoad'

export const useCreatorPanel = (options = {}) => {
  const { activeSelector = '.cp-radio-btn.active' } = options
  const router = useRouter()

  // ==================== 侧边栏导航 ====================
  const activeTab = ref('works')
  const tabs = [
    { id: 'works', label: '作品管理', icon: 'works' },
    { id: 'series', label: '合集管理', icon: 'series' },
    { id: 'upload', label: '上传作品', icon: 'upload' },
  ]

  const switchTab = (tabId) => {
    activeTab.value = tabId
    // 切换标签时自动加载数据
    if (tabId === 'works' && worksList.value.length === 0) loadWorks({ reset: true })
    if (tabId === 'series' && seriesList.value.length === 0) loadSeries({ reset: true })
  }

  // ==================== 用户信息 ====================
  const userInfo = computed(() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo') || '{}')
    } catch { return {} }
  })

  // 用户统计数据
  const userStats = ref({
    workCount: 0,
    totalLikes: 0,
    totalStars: 0,
    totalViews: 0
  })

  /** 加载用户统计数据 */
  const loadUserStats = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const response = await fetch(`${API_BASE_URL}/api/user/profile/me`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const result = await response.json()
      const statusCode = result.code || result.recode
      
      if (statusCode === 200 && result.data) {
        const data = result.data
        userStats.value = {
          workCount: data.work_count || 0,
          totalLikes: data.total_likes || 0,
          totalStars: data.total_stars || 0,
          totalViews: data.total_views || 0
        }
      }
    } catch (error) {
      console.error('获取用户统计失败:', error)
    }
  }

  // ==================== 作品管理 ====================
  const worksList = ref([])
  const worksLoading = ref(false)
  const worksTotal = ref(0)
  const worksCurrent = ref(1)
  const worksPageSize = 20
  const worksApprovalFilter = ref('')  // '' = 全部, 10/20/30 = 状态
  const worksSearchTitle = ref('')

  // 选中的作品
  const selectedWorkIds = ref([])

  const toggleWorkSelect = (workId) => {
    const idx = selectedWorkIds.value.indexOf(workId)
    if (idx === -1) selectedWorkIds.value.push(workId)
    else selectedWorkIds.value.splice(idx, 1)
  }

  const toggleAllWorks = () => {
    if (selectedWorkIds.value.length === worksList.value.length) {
      selectedWorkIds.value = []
    } else {
      selectedWorkIds.value = worksList.value.map(w => w.work_id)
    }
  }

  const clearSelection = () => {
    selectedWorkIds.value = []
  }

  const isAllSelected = computed(() =>
    worksList.value.length > 0 && selectedWorkIds.value.length === worksList.value.length
  )

  const hasSelection = computed(() => selectedWorkIds.value.length > 0)

  /** 加载作品列表 */
  const loadWorks = async ({ reset = false } = {}) => {
    if (worksLoading.value) return
    if (reset) { worksCurrent.value = 1; worksList.value = [] }
    worksLoading.value = true

    const result = await fetchMyWorks({
      current: worksCurrent.value,
      size: worksPageSize,
      approvalStatus: worksApprovalFilter.value !== '' ? Number(worksApprovalFilter.value) : undefined,
      keyword: worksSearchTitle.value || undefined,
    })

    if (result.success && result.data) {
      const { records, total } = result.data
      const newRecords = records || []
      worksList.value = reset ? newRecords : [...worksList.value, ...newRecords]
      worksTotal.value = total || 0
      if (newRecords.length > 0 && worksList.value.length < worksTotal.value) {
        worksCurrent.value++
      }
    }
    worksLoading.value = false
  }

  /** 搜索作品 */
  const searchWorks = () => {
    loadWorks({ reset: true })
  }

  /** 切换审核状态筛选 */
  const setWorksApprovalFilter = (status) => {
    worksApprovalFilter.value = status
    loadWorks({ reset: true })
  }

  /** 删除单个作品 */
  const handleDeleteWork = async (workId) => {
    const result = await deleteWorks([workId])
    if (result.success) {
      showSuccess('作品已删除')
      worksList.value = worksList.value.filter(w => w.work_id !== workId)
      worksTotal.value--
      selectedWorkIds.value = selectedWorkIds.value.filter(id => id !== workId)
    } else {
      showError(result.message || '删除失败')
    }
    return result
  }

  /** 批量删除选中作品 */
  const handleBatchDeleteWorks = async () => {
    if (!hasSelection.value) return
    const ids = [...selectedWorkIds.value]
    const result = await deleteWorks(ids)
    if (result.success) {
      showSuccess(`已删除 ${ids.length} 件作品`)
      worksList.value = worksList.value.filter(w => !ids.includes(w.work_id))
      worksTotal.value -= ids.length
      selectedWorkIds.value = []
    } else {
      showError(result.message || '批量删除失败')
    }
    return result
  }

  /** 批量添加选中作品到合集 */
  const handleBatchAddToSeries = async (seriesId) => {
    if (!hasSelection.value || !seriesId) return
    const ids = [...selectedWorkIds.value]
    const result = await batchAddWorksToSeries(ids, seriesId)
    if (result.success) {
      showSuccess(`已将 ${ids.length} 件作品添加到合集`)
      selectedWorkIds.value = []
      // 刷新作品列表以更新 series_id
      loadWorks({ reset: true })
      // 同步刷新合集列表以更新缩略图
      loadSeries({ reset: true })
    } else {
      showError(result.message || '批量添加失败')
    }
    return result
  }

  /** 修改作品信息 */
  const handleUpdateWork = async ({ workId, workTitle, file, seriesId, isOriginal, outUrl }) => {
    const result = await updateWork({ workId, workTitle, file, seriesId, isOriginal, outUrl })
    if (result.success) {
      showSuccess(result.message || '作品修改成功，需重新审核')
      // 修改后自动重置为待审核，并更新本地数据
      const work = worksList.value.find(w => w.work_id === workId)
      if (work) {
        if (workTitle !== undefined) work.work_title = workTitle
        if (seriesId !== undefined) work.series_id = seriesId === 0 ? null : seriesId
        if (isOriginal !== undefined) work.is_original = isOriginal
        if (outUrl !== undefined) work.out_url = outUrl
        work.approval_status = 20
      }
    } else {
      showError(result.message || '修改失败')
    }
    return result
  }

  // ==================== 合集管理 ====================
  const seriesList = ref([])
  const seriesLoading = ref(false)
  const seriesTotal = ref(0)
  const seriesCurrent = ref(1)
  const seriesPageSize = 20
  const seriesKeyword = ref('')

  /** 加载合集列表 */
  const loadSeries = async ({ reset = false } = {}) => {
    if (seriesLoading.value) return
    if (reset) { seriesCurrent.value = 1; seriesList.value = [] }
    seriesLoading.value = true

    const userId = userInfo.value.user_id
    if (!userId) { seriesLoading.value = false; return }

    const result = await fetchUserSeries({
      userId,
      current: seriesCurrent.value,
      size: seriesPageSize,
      keyword: seriesKeyword.value || undefined,
    })

    if (result.success && result.data) {
      const { records, total } = result.data
      const newRecords = records || []
      // 为每条合集初始化 5 个空缩略图位
      newRecords.forEach(series => {
        if (!series.thumbnails) series.thumbnails = ['', '', '', '', '']
      })
      seriesList.value = reset ? newRecords : [...seriesList.value, ...newRecords]
      seriesTotal.value = total || 0
      if (newRecords.length > 0 && seriesList.value.length < seriesTotal.value) {
        seriesCurrent.value++
      }
      // 异步获取每组合集的前 5 张作品缩略图
      newRecords.forEach(series => {
        fetchSeriesThumbnails(series.series_id).then(res => {
          if (res.success) {
            series.thumbnails = res.data
          }
        })
      })
    }
    seriesLoading.value = false
  }

  /** 搜索合集 */
  const searchSeries = () => {
    loadSeries({ reset: true })
  }

  /** 新增合集 */
  const handleAddSeries = async ({ seriesTitle, aboutText }) => {
    const result = await addSeries({ seriesTitle, aboutText })
    if (result.success) {
      showSuccess(result.message || '合集创建成功')
      loadSeries({ reset: true })
    } else {
      showError(result.message || '创建失败')
    }
    return result
  }

  /** 更新合集 */
  const handleUpdateSeries = async ({ seriesId, seriesTitle, aboutText }) => {
    const result = await updateSeries({ seriesId, seriesTitle, aboutText })
    if (result.success) {
      showSuccess(result.message || '合集更新成功')
      // 更新本地数据
      const series = seriesList.value.find(s => s.series_id === seriesId)
      if (series) {
        if (seriesTitle !== undefined) series.series_title = seriesTitle
        if (aboutText !== undefined) series.about_text = aboutText
      }
    } else {
      showError(result.message || '更新失败')
    }
    return result
  }

  /** 删除合集 */
  const handleDeleteSeries = async (seriesId, removeWorks = false) => {
    const result = await deleteSeries(seriesId, removeWorks)
    if (result.success) {
      showSuccess('合集已删除')
      seriesList.value = seriesList.value.filter(s => s.series_id !== seriesId)
      seriesTotal.value--
    } else {
      showError(result.message || '删除失败')
    }
    return result
  }

  // ==================== 合集详情 ====================
  const seriesDetail = ref(null)
  const seriesDetailLoading = ref(false)
  const seriesDetailWorks = ref([])

  /** 加载合集详情 */
  const loadSeriesDetail = async (seriesId) => {
    seriesDetailLoading.value = true
    seriesDetailWorks.value = []

    const result = await fetchSeriesDetail(seriesId)
    if (result.success && result.data) {
      seriesDetailWorks.value = result.data.records || []
    } else {
      showError(result.message || '获取合集详情失败')
    }
    seriesDetailLoading.value = false
    return result
  }

  /** 从合集移除作品 */
  const handleRemoveWorkFromSeries = async (workId, seriesId) => {
    const result = await batchRemoveWorksFromSeries([workId], seriesId)
    if (result.success) {
      showSuccess('已从合集移除')
      seriesDetailWorks.value = seriesDetailWorks.value.filter(w => w.work_id !== workId)
    } else {
      showError(result.message || '移除失败')
    }
    return result
  }

  // ==================== 上传作品 ====================
  const uploadForm = reactive({
    file: null,
    filePreview: null,
    workTitle: '',
    seriesId: 0,
    isOriginal: true,
    outUrl: '',
  })
  const uploadLoading = ref(false)

  const resetUploadForm = () => {
    uploadForm.file = null
    uploadForm.filePreview = null
    uploadForm.workTitle = ''
    uploadForm.seriesId = 0
    uploadForm.isOriginal = true
    uploadForm.outUrl = ''
  }

  const setUploadFile = (file) => {
    if (!file) return
    // 验证格式
    const allowedTypes = ['image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      showError('仅支持 JPG/JPEG/PNG 格式')
      return false
    }
    // 验证大小（32MB）
    if (file.size > 32 * 1024 * 1024) {
      showError('文件大小不能超过 32MB')
      return false
    }
    uploadForm.file = file
    // 生成预览
    const reader = new FileReader()
    reader.onload = (e) => { uploadForm.filePreview = e.target.result }
    reader.readAsDataURL(file)
    return true
  }

  const removeUploadFile = () => {
    uploadForm.file = null
    uploadForm.filePreview = null
  }

  const handleUpload = async () => {
    // 参数校验
    if (!uploadForm.file) {
      showError('请选择作品图片')
      return { success: false }
    }
    if (!uploadForm.workTitle.trim()) {
      showError('请输入作品标题')
      return { success: false }
    }
    if (uploadForm.workTitle.trim().length > 16) {
      showError('作品标题最多16个中文字符')
      return { success: false }
    }
    if (!uploadForm.isOriginal && !uploadForm.outUrl.trim()) {
      showError('转载作品必须填写外部链接')
      return { success: false }
    }

    uploadLoading.value = true
    const result = await uploadWork({
      file: uploadForm.file,
      workTitle: uploadForm.workTitle.trim(),
      seriesId: uploadForm.seriesId || 0,
      isOriginal: uploadForm.isOriginal,
      outUrl: uploadForm.isOriginal ? undefined : uploadForm.outUrl.trim(),
    })
    uploadLoading.value = false

    if (result.success) {
      showSuccess(result.message || '作品上传成功，等待审核')
      resetUploadForm()
      // 刷新作品列表
      loadWorks({ reset: true })
    } else {
      showError(result.message || '上传失败')
    }
    return result
  }

  // ==================== 统计数据 ====================
  const stats = computed(() => {
    const total = worksList.value.length
    const approved = worksList.value.filter(w => w.approval_status === 10).length
    const pending = worksList.value.filter(w => w.approval_status === 20).length
    const rejected = worksList.value.filter(w => w.approval_status === 30).length
    return { total, approved, pending, rejected }
  })

  // ==================== 工具函数 ====================
  const approvalStatusLabel = (status) => {
    const map = { 10: '已通过', 20: '待审核', 30: '未通过' }
    return map[status] || '未知'
  }

  const approvalStatusClass = (status) => {
    const map = { 10: 'status-approved', 20: 'status-pending', 30: 'status-rejected' }
    return map[status] || ''
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const d = new Date(timeStr)
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  // ==================== 子模块实例 ====================
  
  // 上传文件管理
  const uploadFile = useFileUpload({
    onFileSet: (file) => {
      uploadForm.file = file
    }
  })

  // 筛选标签指示器
  const filterIndicator = useIndicatorSlider()

  // 上传表单单选指示器
  const uploadRadioIndicator = useIndicatorSlider()

  // 编辑表单单选指示器
  const editRadioIndicator = useIndicatorSlider()

  // 编辑作品弹窗
  const editWorkDialog = useEditWorkDialog({
    seriesList,
    loadSeries,
    handleUpdateWork,
    updateEditRadioIndicator: () => editRadioIndicator.update(activeSelector),
    radioIndicator: editRadioIndicator
  })

  // 合集弹窗
  const seriesDialogs = useSeriesDialogs({
    handleAddSeries,
    handleUpdateSeries,
    handleRemoveWorkFromSeries,
    handleBatchAddToSeries,
    loadSeries,
    seriesList,
    selectedWorkIds,
    loadSeriesDetail
  })

  // 删除确认
  const deleteConfirm = useDeleteConfirm(handleDeleteWork, handleDeleteSeries, handleBatchDeleteWorks)

  // 滚动加载
  const scrollLoad = useScrollLoad({
    loadMore: loadWorks,
    hasMore: () => worksList.value.length < worksTotal.value,
    isLoading: () => worksLoading.value
  })

  // ==================== 初始化 ====================
  onMounted(() => {
    loadWorks({ reset: true })
    loadUserStats()
  })

  return {
    // 导航
    activeTab, tabs, switchTab,

    // 用户
    userInfo, userStats,

    // 作品管理
    worksList, worksLoading, worksTotal, worksApprovalFilter, worksSearchTitle,
    selectedWorkIds, isAllSelected, hasSelection,
    loadWorks, searchWorks, setWorksApprovalFilter, handleDeleteWork, handleBatchDeleteWorks, handleBatchAddToSeries, handleUpdateWork,
    toggleWorkSelect, toggleAllWorks, clearSelection,

    // 合集管理
    seriesList, seriesLoading, seriesTotal, seriesKeyword,
    loadSeries, searchSeries, handleAddSeries, handleUpdateSeries, handleDeleteSeries,
    // 合集详情
    loadSeriesDetail, handleRemoveWorkFromSeries,

    // 上传
    uploadForm, uploadLoading, resetUploadForm, setUploadFile, removeUploadFile, handleUpload,

    // 统计
    stats,

    // 工具
    approvalStatusLabel, approvalStatusClass, formatTime,

    // 路由
    goBack: () => router.push('/profile/me'),

    // UI 交互子模块
    uploadFile,
    filterIndicator,
    uploadRadioIndicator,
    editRadioIndicator,

    // 弹窗子模块
    editWorkDialog,
    seriesDialogs,
    deleteConfirm,
    scrollLoad,
  }
}
