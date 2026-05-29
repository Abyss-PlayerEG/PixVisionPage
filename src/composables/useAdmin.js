/**
 * 管理员后台业务逻辑 Composable
 * 封装用户/作品/评论管理、分页、搜索等所有管理端逻辑
 */

import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  fetchUserList,
  toggleUserBan,
  deleteUser,
  fetchWorkList,
  deleteWork,
  fetchCommentList,
  deleteComment
} from '@/api/adminApi'
import { showSuccess, showError } from '@/utils/notification'
import { showConfirm } from '@/utils/confirmDialog'

export const useAdmin = () => {
  const router = useRouter()

  // ── Tab 切换 ──
  const activeTab = ref('users')   // 'users' | 'works' | 'comments'

  // ── 用户管理 ──
  const userList = ref([])
  const userLoading = ref(false)
  const userCurrent = ref(1)
  const userTotal = ref(0)
  const userKeyword = ref('')
  const userPageSize = 20

  // ── 作品管理 ──
  const workList = ref([])
  const workLoading = ref(false)
  const workCurrent = ref(1)
  const workTotal = ref(0)
  const workKeyword = ref('')
  const workPageSize = 20

  // ── 评论管理 ──
  const commentList = ref([])
  const commentLoading = ref(false)
  const commentCurrent = ref(1)
  const commentTotal = ref(0)
  const commentKeyword = ref('')
  const commentPageSize = 20

  // ── 通用分页 ──
  const hasMore = (type) => {
    const map = { users: () => userList.value.length < userTotal.value, works: () => workList.value.length < workTotal.value, comments: () => commentList.value.length < commentTotal.value }
    return map[type] ? map[type]() : false
  }

  // ── 工具函数 ──
  const formatTime = (timeStr) => {
    if (!timeStr) return '—'
    try {
      const date = new Date(timeStr)
      const pad = (n) => String(n).padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
    } catch { return timeStr }
  }

  // ── 用户管理 ──
  const loadUsers = async ({ reset = false } = {}) => {
    if (userLoading.value) return
    if (reset) { userCurrent.value = 1; userList.value = [] }
    userLoading.value = true
    const result = await fetchUserList({ current: userCurrent.value, size: userPageSize, keyword: userKeyword.value })
    if (result.success && result.data) {
      const { records, total } = result.data
      userList.value = reset ? (records || []) : [...userList.value, ...(records || [])]
      userTotal.value = total || 0
      if (userList.value.length < userTotal.value) userCurrent.value++
    }
    userLoading.value = false
  }

  const handleSearchUsers = () => { loadUsers({ reset: true }) }

  const handleBanUser = async (user) => {
    const isBan = !(user.banned || user.status === 0)
    const action = isBan ? '封禁' : '解封'
    const ok = await showConfirm({ title: `${action}用户`, message: `确定要${action}用户「${user.nickname || user.username}」吗？`, yesText: action, noText: '取消', type: isBan ? 'danger' : 'info' })
    if (!ok) return
    const result = await toggleUserBan(user.user_id, isBan)
    if (result.success) {
      user.banned = isBan
      user.status = isBan ? 0 : 1
      showSuccess(result.message || `${action}成功`)
    } else {
      showError(result.message || `${action}失败`)
    }
  }

  const handleDeleteUser = async (user) => {
    const ok = await showConfirm({ title: '删除用户', message: `确定要删除用户「${user.nickname || user.username}」吗？此操作不可撤销。`, yesText: '删除', noText: '取消', type: 'danger' })
    if (!ok) return
    const result = await deleteUser(user.user_id)
    if (result.success) {
      userList.value = userList.value.filter(u => u.user_id !== user.user_id)
      userTotal.value = Math.max(0, userTotal.value - 1)
      showSuccess(result.message || '删除成功')
    } else {
      showError(result.message || '删除失败')
    }
  }

  // ── 作品管理 ──
  const loadWorks = async ({ reset = false } = {}) => {
    if (workLoading.value) return
    if (reset) { workCurrent.value = 1; workList.value = [] }
    workLoading.value = true
    const result = await fetchWorkList({ current: workCurrent.value, size: workPageSize, keyword: workKeyword.value })
    if (result.success && result.data) {
      const { records, total } = result.data
      workList.value = reset ? (records || []) : [...workList.value, ...(records || [])]
      workTotal.value = total || 0
      if (workList.value.length < workTotal.value) workCurrent.value++
    }
    workLoading.value = false
  }

  const handleSearchWorks = () => { loadWorks({ reset: true }) }

  const handleDeleteWork = async (work) => {
    const ok = await showConfirm({ title: '删除作品', message: `确定要删除作品「${work.work_title || '未命名'}」吗？此操作不可撤销。`, yesText: '删除', noText: '取消', type: 'danger' })
    if (!ok) return
    const result = await deleteWork(work.work_id)
    if (result.success) {
      workList.value = workList.value.filter(w => w.work_id !== work.work_id)
      workTotal.value = Math.max(0, workTotal.value - 1)
      showSuccess(result.message || '删除成功')
    } else {
      showError(result.message || '删除失败')
    }
  }

  // ── 评论管理 ──
  const loadComments = async ({ reset = false } = {}) => {
    if (commentLoading.value) return
    if (reset) { commentCurrent.value = 1; commentList.value = [] }
    commentLoading.value = true
    const result = await fetchCommentList({ current: commentCurrent.value, size: commentPageSize, keyword: commentKeyword.value })
    if (result.success && result.data) {
      const { records, total } = result.data
      commentList.value = reset ? (records || []) : [...commentList.value, ...(records || [])]
      commentTotal.value = total || 0
      if (commentList.value.length < commentTotal.value) commentCurrent.value++
    }
    commentLoading.value = false
  }

  const handleSearchComments = () => { loadComments({ reset: true }) }

  const handleDeleteComment = async (comment) => {
    const ok = await showConfirm({ title: '删除评论', message: `确定要删除该评论吗？`, yesText: '删除', noText: '取消', type: 'danger' })
    if (!ok) return
    const result = await deleteComment(comment.comment_id)
    if (result.success) {
      commentList.value = commentList.value.filter(c => c.comment_id !== comment.comment_id)
      commentTotal.value = Math.max(0, commentTotal.value - 1)
      showSuccess(result.message || '删除成功')
    } else {
      showError(result.message || '删除失败')
    }
  }

  // ── 切换 Tab ──
  const switchTab = (tab) => {
    activeTab.value = tab
    if (tab === 'users' && userList.value.length === 0) loadUsers({ reset: true })
    else if (tab === 'works' && workList.value.length === 0) loadWorks({ reset: true })
    else if (tab === 'comments' && commentList.value.length === 0) loadComments({ reset: true })
  }

  // ── 退出 ──
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    router.push('/login')
  }

  return {
    activeTab,
    userList, userLoading, userKeyword, userTotal, userPageSize,
    workList, workLoading, workKeyword, workTotal, workPageSize,
    commentList, commentLoading, commentKeyword, commentTotal, commentPageSize,
    hasMore, formatTime,
    loadUsers, handleSearchUsers, handleBanUser, handleDeleteUser,
    loadWorks, handleSearchWorks, handleDeleteWork,
    loadComments, handleSearchComments, handleDeleteComment,
    switchTab, handleLogout,
  }
}
