/**
 * WorkDetail 页面业务逻辑 Composable
 * 封装作品详情、评论、点赞/收藏、发布者信息、作品导航等所有联调相关的业务逻辑
 */

import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getWorkImageUrl, getAvatarUrl } from '@/config/api'
import { fetchWorkDetail, fetchCommentList, addComment, deleteComment, toggleLike, toggleStar, fetchLikeStatus, fetchStarStatus, fetchPublisherInfo, getLastWorkId } from '@/api/workApi'
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
  const lastWorkId = ref(0)
  const navPrefetched = ref(null)
  const findValidWorkId = async (startId, direction) => {
    const maxAttempts = 50
    let candidate = direction === 'next' ? startId + 1 : startId - 1
    for (let i = 0; i < maxAttempts; i++) {
      if (candidate <= 0) return null
      if (direction === 'next' && lastWorkId.value > 0 && candidate > lastWorkId.value) return null
      const result = await fetchWorkDetail(candidate)
      if (result.success) return { id: candidate, detail: result.data }
      candidate += direction === 'next' ? 1 : -1
    }
    return null
  }

  const goToPrevWork = async () => {
    if (navLoading.value) return
    const current = Number(workId.value)
    if (!current) return
    navLoading.value = true
    const found = await findValidWorkId(current, 'prev')
    navLoading.value = false
    if (found) {
      navPrefetched.value = found
      window.scrollTo({ top: 0, behavior: 'smooth' })
      router.push({ name: 'workDetail', params: { id: found.id } })
    } else {
      showInfo('已经是第一个作品了')
    }
  }

  const goToNextWork = async () => {
    if (navLoading.value) return
    const current = Number(workId.value)
    if (!current) return
    navLoading.value = true
    const found = await findValidWorkId(current, 'next')
    navLoading.value = false
    if (found) {
      navPrefetched.value = found
      window.scrollTo({ top: 0, behavior: 'smooth' })
      router.push({ name: 'workDetail', params: { id: found.id } })
    } else {
      showInfo('已经是最后一个作品了')
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
    handleToggleLike,
    handleToggleStar,
    handleDownload,
    goToPrevWork,
    goToNextWork,
  }
}
