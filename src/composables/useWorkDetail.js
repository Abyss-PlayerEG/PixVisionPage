/**
 * WorkDetail 页面业务逻辑 Composable
 * 封装作品详情、评论、点赞/收藏、发布者信息、作品导航等所有联调相关的业务逻辑
 */

import { ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getWorkImageUrl, getAvatarUrl } from '@/config/api'
import { fetchWorkDetail, fetchWorkPage, fetchCommentList, addComment, deleteComment, toggleLike, toggleStar, fetchLikeStatus, fetchStarStatus, fetchPublisherInfo, getLastWorkId, fetchRandomWork, fetchUserLikedWorks, fetchUserStarredWorks } from '@/api/workApi'
import { fetchUserHistory } from '@/api/historyApi'
import { getCurrentUser } from '@/api/profileApi'
import { showSuccess, showError, showInfo } from '@/utils/notification'
import { showConfirm } from '@/utils/confirmDialog'

export const useWorkDetail = () => {
  const route = useRoute()
  const router = useRouter()
  const workId = computed(() => route.params.id)

  // ========== 基础状态 ==========
  const loading = ref(true)
  const initialLoading = ref(true)
  const commentSubmitting = ref(false)
  const workDetail = ref(null)
  const publisher = ref({ avatar: getAvatarUrl(''), displayName: '加载中...', username: '', bio: '', works: 0, totalViews: 0, totalLikes: 0, totalStars: 0, contactItems: [] })
  const comments = ref([])
  const newComment = ref('')
  const currentUser = ref(getCurrentUser())
  const now = ref(Date.now())
  let timeTimer = null

  // ========== 点赞/收藏状态 ==========
  const liked = ref(false)
  const starred = ref(false)
  const likeCount = ref(0)
  const starCount = ref(0)
  const likePending = ref(false)
  const starPending = ref(false)
  const downloadPending = ref(false)

  // ========== 作品导航状态 ==========
  const navLoading = ref(false)
  const randomLoading = ref(false)
  const lastWorkId = ref(0)
  const navPrefetched = ref(null)

  // 用户范围：从 route query 读取，限制作品导航只在该用户的作品内
  const scopeUserId = computed(() => {
    const q = route.query.userId
    return q ? Number(q) : null
  })

  // 导航来源：区分个人作品/点赞/收藏/浏览历史，决定使用哪个 API 构建导航列表
  const scopeSource = computed(() => route.query.source || null)

  /**
   * 用户范围内所有作品 ID 列表（按 ID 降序 = 最新在前）
   * 仅在 scopeUserId 存在时加载，用于 O(1) 无限轮播
   */
  const scopedWorkIds = ref([])

  const loadScopedWorkIds = async () => {
    const uid = scopeUserId.value
    const source = scopeSource.value

    // 无 userId 且非 history 来源 → 无范围限制，使用全局模式
    if (!uid && source !== 'history') { scopedWorkIds.value = []; return }

    try {
      let result
      if (source === 'likes') {
        result = await fetchUserLikedWorks({ userId: uid, current: 1, size: 500 })
      } else if (source === 'favorites') {
        result = await fetchUserStarredWorks({ userId: uid, current: 1, size: 500 })
      } else if (source === 'history') {
        result = await fetchUserHistory({ current: 1, size: 500 })
      } else {
        // source === 'works' 或无 source → 用户发布的作品（保持向后兼容）
        result = await fetchWorkPage({ userId: uid, current: 1, size: 500 })
      }
      if (result.success && result.data?.records) {
        scopedWorkIds.value = result.data.records
          .map(r => r.work_id)
          .sort((a, b) => b - a) // 降序：最新在前
      } else {
        scopedWorkIds.value = []
      }
    } catch {
      scopedWorkIds.value = []
    }
  }

  /**
   * 在用户范围内查找上/下一个作品 ID（数组导航，O(1)，支持无限轮播）
   * @param {'prev'|'next'} dir — prev=上一张(更新的), next=下一张(更旧的)
   */
  const findScopedWorkId = (currentId, dir) => {
    const ids = scopedWorkIds.value
    if (!ids.length) return null
    const idx = ids.indexOf(Number(currentId))
    if (idx === -1) return null
    if (dir === 'prev') {
      // 上一张：往列表前面走（更新的，ID 更大）
      const newIdx = idx <= 0 ? ids.length - 1 : idx - 1
      return { id: ids[newIdx] }
    } else {
      // 下一张：往列表后面走（更旧的，ID 更小）
      const newIdx = idx >= ids.length - 1 ? 0 : idx + 1
      return { id: ids[newIdx] }
    }
  }

  /**
   * 全局模式：逐 ID 查找有效作品
   * @param {number} startId — 起始 ID
   * @param {'next'|'prev'} direction — 'next'=更大ID(更新), 'prev'=更小ID(更旧)
   */
  const findValidWorkId = async (startId, direction) => {
    const maxAttempts = 50
    let candidate = direction === 'next' ? startId + 1 : startId - 1
    for (let i = 0; i < maxAttempts; i++) {
      if (candidate <= 0) return null
      if (direction === 'next' && lastWorkId.value > 0 && candidate > lastWorkId.value) return null
      const result = await fetchWorkDetail(candidate)
      if (result.success && result.data) {
        return { id: candidate, detail: result.data }
      }
      candidate += direction === 'next' ? 1 : -1
    }
    return null
  }

  /**
   * 上一张 → 往列表前面（更新的作品）
   */
  const goToPrevWork = async () => {
    if (navLoading.value) return
    const current = Number(workId.value)
    if (!current) return
    navLoading.value = true
    try {
      let found
      // 有 scopeUserId 或来源为 history 时使用范围导航
      if (scopeUserId.value || scopeSource.value === 'history') {
        // 用户范围/来源模式：数组导航（即时、无限轮播）
        found = findScopedWorkId(current, 'prev')
        if (found) {
          // 预取详情供 loadWorkData 使用
          const detailResult = await fetchWorkDetail(found.id)
          if (detailResult.success) found.detail = detailResult.data
          else found = null
        }
      } else {
        // 全局模式：逐 ID 查找
        found = await findValidWorkId(current, 'next')
      }
      if (found) {
        navPrefetched.value = found
        window.scrollTo({ top: 0, behavior: 'smooth' })
        const query = {}
        if (scopeUserId.value) query.userId = scopeUserId.value
        if (scopeSource.value) query.source = scopeSource.value
        router.replace({ name: 'workDetail', params: { id: found.id }, query })
      } else {
        showInfo(scopeUserId.value || scopeSource.value === 'history' ? '未找到更多作品' : '已经是第一个作品了')
      }
    } finally {
      navLoading.value = false
    }
  }

  /**
   * 下一张 → 往列表后面（更旧的作品）
   */
  const goToNextWork = async () => {
    if (navLoading.value) return
    const current = Number(workId.value)
    if (!current) return
    navLoading.value = true
    try {
      let found
      // 有 scopeUserId 或来源为 history 时使用范围导航
      if (scopeUserId.value || scopeSource.value === 'history') {
        found = findScopedWorkId(current, 'next')
        if (found) {
          const detailResult = await fetchWorkDetail(found.id)
          if (detailResult.success) found.detail = detailResult.data
          else found = null
        }
      } else {
        found = await findValidWorkId(current, 'prev')
      }
      if (found) {
        navPrefetched.value = found
        window.scrollTo({ top: 0, behavior: 'smooth' })
        const query = {}
        if (scopeUserId.value) query.userId = scopeUserId.value
        if (scopeSource.value) query.source = scopeSource.value
        router.replace({ name: 'workDetail', params: { id: found.id }, query })
      } else {
        showInfo(scopeUserId.value || scopeSource.value === 'history' ? '未找到更多作品' : '已经是最后一个作品了')
      }
    } finally {
      navLoading.value = false
    }
  }

const goToRandomWork = async () => {
  if (randomLoading.value) return
  randomLoading.value = true
  const randomResult = await fetchRandomWork()
  if (!randomResult.success || !randomResult.data) {
    randomLoading.value = false
    showError(randomResult.message || '获取随机作品失败')
    return
  }
  // 预取作品详情，确保 loadWorkData 能直接使用缓存（与 goToNextWork/goToPrevWork 模式一致）
  const detailResult = await fetchWorkDetail(randomResult.data)
  randomLoading.value = false
  if (detailResult.success && detailResult.data) {
    navPrefetched.value = { id: randomResult.data, detail: detailResult.data }
    window.scrollTo({ top: 0, behavior: 'smooth' })
    const query = {}
    if (scopeUserId.value) query.userId = scopeUserId.value
    if (scopeSource.value) query.source = scopeSource.value
    router.replace({ name: 'workDetail', params: { id: randomResult.data }, query })
  } else {
    showError(detailResult.message || '获取作品详情失败')
  }
}

  // ========== 回复状态 ==========
  const replyingTo = ref(null)
  const replyText = ref('')
  const replySubmitting = ref(false)

  // ========== 视图计算属性 ==========
  const workTitle = computed(() => workDetail.value?.work_title || route.query.title || '未命名作品')
  const workImgUrl = computed(() => {
    if (workDetail.value) return getWorkImageUrl(workDetail.value.img_url || '')
    if (route.query.img) return route.query.img
    if (route.query.filePath) return getWorkImageUrl(route.query.filePath)
    return ''
  })
  const workMeta = computed(() => {
    if (!workDetail.value) return {}
    return { likeCount: likeCount.value, starCount: starCount.value, viewCount: workDetail.value.view_count || 0, createTime: workDetail.value.create_time || '' }
  })

  // ========== 页面导航 ==========
  const handleBack = () => {
    if (window.history.length > 1) router.back()
    else router.push({ name: 'home' })
  }

  const goLogin = () => {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
  }

  const goToProfile = (userId, username) => {
    if (currentUser.value && currentUser.value.user_id === userId) {
      router.push({ name: 'profileMe' })
    } else {
      router.push({ name: 'profileVisitor', params: { identifier: username || userId } })
    }
  }

  // ========== 联系方式 ==========
  const handleContactClick = (item) => {
    if (item.name === 'Bilibili') {
      const uid = item.content
      const url = `https://space.bilibili.com/${uid}`
      window.open(url, '_blank')
    } else {
      navigator.clipboard.writeText(item.content).then(() => {
        showSuccess(`${item.name}已复制`, '复制成功')
      }).catch(err => {
        console.error('复制失败:', err)
        showError('复制失败，请手动复制', '错误')
      })
    }
  }

  // ========== 评论操作 ==========
  const handleSubmitComment = async () => {
    const text = newComment.value.trim()
    if (!text || commentSubmitting.value) return
    const id = Number(workId.value)
    if (!id) return
    commentSubmitting.value = true
    const result = await addComment({ workId: id, commentFloor: 1, commentText: text })
    if (result.success) { newComment.value = ''; await loadComments(); showSuccess(result.message || '评论发表成功') }
    else { showError(result.message || '评论发表失败') }
    commentSubmitting.value = false
  }

  const startReply = (comment, parentId, userId) => {
    if (!currentUser.value) { showInfo('请先登录'); return }
    replyingTo.value = {
      commentId: comment.comment_id,
      parentId: parentId !== undefined ? parentId : comment.comment_id,
      nickname: comment.nickname || '匿名用户',
      userId: userId,
    }
    replyText.value = ''
  }

  const cancelReply = () => {
    replyingTo.value = null
    replyText.value = ''
  }

  const handleSubmitReply = async () => {
    const text = replyText.value.trim()
    if (!text || replySubmitting.value || !replyingTo.value) return
    const id = Number(workId.value)
    if (!id) return
    replySubmitting.value = true
    const result = await addComment({
      workId: id,
      commentFloor: 2,
      commentText: text,
      parentCommentId: replyingTo.value.parentId,
      repliedUserId: replyingTo.value.userId || undefined,
    })
    if (result.success) {
      replyText.value = ''
      replyingTo.value = null
      await loadComments()
      showSuccess(result.message || '回复发表成功')
    } else {
      showError(result.message || '回复失败')
    }
    replySubmitting.value = false
  }

  const handleDeleteComment = async (commentId) => {
    const ok = await showConfirm({ title: '删除评论', message: '确定要删除这条评论吗？', yesText: '删除', noText: '取消', type: 'danger' })
    if (!ok) return
    const result = await deleteComment(commentId)
    if (result.success) {
      await loadComments()
      showSuccess(result.message || '评论已删除')
    } else {
      showError(result.message || '删除失败')
    }
  }

  const highlightComment = (commentId) => {
    const el = document.querySelector(`[data-comment-id="${commentId}"]`)
    if (!el) return
    if (el._ht) { clearTimeout(el._ht); el._ht = null }
    el.classList.remove('wd-comment-highlight')
    void el.offsetWidth
    el.classList.add('wd-comment-highlight')
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el._ht = setTimeout(() => {
      el.classList.remove('wd-comment-highlight')
      el._ht = null
    }, 1500)
  }

  const loadComments = async () => {
    const id = Number(workId.value)
    if (!id) return
    const result = await fetchCommentList(id, 'newest')
    if (result.success) comments.value = result.data
  }

  // ========== 时间格式化 ==========
  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    void now.value
    try {
      const date = new Date(timeStr)
      const diff = Date.now() - date.getTime()
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)
      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`
      if (hours < 24) return `${hours}小时前`
      if (days < 7) return `${days}天前`
      return date.toLocaleDateString('zh-CN')
    } catch { return timeStr }
  }

  // 评论区专用时间格式
  const formatCommentTime = (timeStr) => {
    if (!timeStr) return ''
    try {
      // 兼容时间戳（秒/毫秒）和日期字符串
      let ts = timeStr
      if (typeof ts === 'number' && ts < 1e12) ts *= 1000  // 秒 → 毫秒
      const date = new Date(ts)
      if (isNaN(date.getTime())) return ''

      const now = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      const hm = `${pad(date.getHours())}:${pad(date.getMinutes())}`

      // 同一天 → "今天 HH:MM"
      if (date.toDateString() === now.toDateString()) return `今天 ${hm}`

      // 昨天 → "昨天 HH:MM"
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      if (date.toDateString() === yesterday.toDateString()) return `昨天 ${hm}`

      // 计算相差天数
      const diff = now.getTime() - date.getTime()
      const days = Math.floor(diff / 86400000)

      // 3-6 天前 → "X天前"
      if (days < 7) return `${days}天前`

      // ≥7 天 → "X月X日"
      return `${date.getMonth() + 1}月${date.getDate()}日`
    } catch { return '' }
  }

  // 判断评论是否为当前用户所发
  const isOwnComment = (comment) => {
    if (!currentUser.value || !comment) return false
    return comment.user_id === currentUser.value.user_id
  }

  // ========== 核心数据加载 ==========
  /** 加载作品核心数据（作品详情、评论、点赞/收藏状态、发布者信息） */
  const loadWorkData = async () => {
    const id = Number(workId.value)
    if (!id) { loading.value = false; initialLoading.value = false; return }
    if (initialLoading.value) loading.value = true
    replyingTo.value = null
    replyText.value = ''
    let detailResult
    if (navPrefetched.value && navPrefetched.value.id === id) {
      detailResult = { success: true, data: navPrefetched.value.detail }
      navPrefetched.value = null
    } else {
      detailResult = await fetchWorkDetail(id)
    }
    // 作品不存在时跳转到 404
    if (!detailResult.success || !detailResult.data) {
      loading.value = false
      initialLoading.value = false
      router.push({ name: 'notFound' })
      return
    }
    const [commentResult] = await Promise.all([fetchCommentList(id, 'newest')])
    if (detailResult.success) {
      workDetail.value = detailResult.data
      likeCount.value = detailResult.data.like_count || 0
      starCount.value = detailResult.data.star_count || 0
    } else {
      workDetail.value = null
      likeCount.value = 0
      starCount.value = 0
    }
    if (commentResult.success) comments.value = commentResult.data
    else comments.value = []
    if (currentUser.value) {
      const [likeStatus, starStatus] = await Promise.all([fetchLikeStatus(id), fetchStarStatus(id)])
      if (likeStatus.success) liked.value = likeStatus.data
      else liked.value = false
      if (starStatus.success) starred.value = starStatus.data
      else starred.value = false
    } else {
      liked.value = false
      starred.value = false
    }
    if (detailResult.success && detailResult.data.user_id) {
      const pubResult = await fetchPublisherInfo(detailResult.data.user_id)
      publisher.value = pubResult.data
    } else {
      publisher.value = { avatar: getAvatarUrl(''), displayName: '', username: '', bio: '', works: 0, totalViews: 0, totalLikes: 0, totalStars: 0, contactItems: [] }
    }
    loading.value = false
    initialLoading.value = false
  }

  // ========== 点赞/收藏 ==========
  const handleToggleLike = async () => {
    const id = Number(workId.value)
    if (!id || likePending.value) return
    if (!currentUser.value) { showInfo('请先登录'); return }
    likePending.value = true
    const result = await toggleLike(id)
    if (result.success && result.data !== undefined) {
      liked.value = result.data
      likeCount.value += result.data ? 1 : -1
    }
    likePending.value = false
  }

  const handleToggleStar = async () => {
    const id = Number(workId.value)
    if (!id || starPending.value) return
    if (!currentUser.value) { showInfo('请先登录'); return }
    starPending.value = true
    const result = await toggleStar(id)
    if (result.success && result.data !== undefined) {
      starred.value = result.data
      starCount.value += result.data ? 1 : -1
    }
    starPending.value = false
  }

  // ========== 下载 ==========
  const handleDownload = async () => {
    const url = workImgUrl.value
    if (!url || downloadPending.value) return
    const ok = await showConfirm({ title: '下载作品', message: '确定要下载该作品图片吗？', yesText: '下载', noText: '取消', type: 'info' })
    if (!ok) return
    downloadPending.value = true
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('网络错误')
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = workTitle.value + '.png'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
      showSuccess('下载成功')
    } catch {
      showError('网络错误，请稍后重试')
    }
    downloadPending.value = false
  }

  // ========== 生命周期 ==========
  onMounted(async () => {
    timeTimer = setInterval(() => { now.value = Date.now() }, 30000)
    const lastIdResult = await getLastWorkId()
    if (lastIdResult.success) lastWorkId.value = lastIdResult.data
    await loadScopedWorkIds()
    await loadWorkData()
  })

  watch(() => route.params.id, () => {
    loadWorkData()
  })

  onUnmounted(() => {
    if (timeTimer) { clearInterval(timeTimer); timeTimer = null }
  })

  return {
    // 基础状态
    loading,
    initialLoading,
    commentSubmitting,
    workDetail,
    publisher,
    comments,
    newComment,
    currentUser,
    // 点赞/收藏
    liked,
    starred,
    likeCount,
    starCount,
    likePending,
    starPending,
    downloadPending,
    // 导航
    navLoading,
    randomLoading,
    // 回复
    replyingTo,
    replyText,
    replySubmitting,
    // 计算属性
    workTitle,
    workImgUrl,
    workMeta,
    // 方法
    handleBack,
    goLogin,
    goToProfile,
    handleContactClick,
    handleSubmitComment,
    startReply,
    cancelReply,
    handleSubmitReply,
    handleDeleteComment,
    loadComments,
    highlightComment,
    formatTime,
    formatCommentTime,
    isOwnComment,
    handleToggleLike,
    handleToggleStar,
    handleDownload,
    goToPrevWork,
    goToNextWork,
    goToRandomWork,
  }
}
