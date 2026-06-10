/**
 * 管理员后台业务逻辑 Composable
 * 封装所有管理端逻辑：用户/作品/评论管理、审核、日志
 */
import { ref, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  fetchUserList, updateUserStatus, deleteUser, createUser, resetUserPassword,
  fetchWorkList, deleteWork, updateWorkApproval, updateWorkTitle,
  fetchCommentList, deleteComment, updateCommentApproval,
  fetchAuditRecords, fetchPendingChanges, reviewDataChanges, fetchOperationLogs,
  fetchSeriesList, deleteSeries, updateSeriesApproval,
  updateUserRole, refreshPermissionCache
} from '@/api/adminApi'
import { showSuccess, showError } from '@/utils/notification'
import { showConfirm } from '@/utils/confirmDialog'
import { formatTime } from '@/utils/adminHelpers'

export const useAdmin = () => {
  const router = useRouter()

  const activeTab = ref('users')

  // ── 通用 ──
  const adminRole = ref(0)
  const initRole = () => {
    const ui = JSON.parse(localStorage.getItem('userInfo') || '{}')
    adminRole.value = ui.user_role || 0
  }
  const isSuperAdmin = () => adminRole.value === 77

  // ── 用户管理 ──
  const userList = ref([])
  const userLoading = ref(false)
  const userCurrent = ref(1)
  const userTotal = ref(0)
  const userKeyword = ref('')
  const userPageSize = 20
  const userRoleFilter = ref('')     // 角色筛选
  const userStatusFilter = ref('')   // 状态筛选
  const userOrderBy = ref('newest')  // 排序
  const showCreateUserDialog = ref(false)
  const createUserForm = reactive({ username: '', password: '', confirmPassword: '', nickname: '', email: '' })
  const createUserErrors = reactive({})
  const selectedUserIds = ref(new Set())  // 批量选择的用户 ID
  const showChangeRoleDialog = ref(false)
  const changeRoleForm = reactive({ userIds: [], newRole: 11 })
  const isRefreshingCache = ref(false)

  // ── 作品管理 ──
  const workList = ref([])
  const workLoading = ref(false)
  const workCurrent = ref(1)
  const workTotal = ref(0)
  const workKeyword = ref('')
  const workPageSize = 20
  const workOrderBy = ref('newest')          // 排序
  const workApprovalFilter = ref('')          // 审核状态筛选
  const showEditTitleDialog = ref(false)
  const editTitleForm = reactive({ workId: null, newTitle: '', oldTitle: '' })
  const selectedWorkIds = ref(new Set())  // 批量选择的作品 ID

  // ── 评论管理 ──
  const commentList = ref([])
  const commentLoading = ref(false)
  const commentCurrent = ref(1)
  const commentTotal = ref(0)
  const commentKeyword = ref('')
  const commentPageSize = 20
  const commentOrderBy = ref('newest')
  const commentApprovalFilter = ref('')
  const selectedCommentIds = ref(new Set())  // 批量选择的评论 ID

  // ── AI 审核记录 ──
  const auditList = ref([])
  const auditLoading = ref(false)
  const auditCurrent = ref(1)
  const auditTotal = ref(0)
  const auditPageSize = 20
  const auditKeyword = ref('')
  const auditContentTypeFilter = ref('')
  const auditApprovalFilter = ref('')
  const auditOrderBy = ref('newest')

  // ── 用户数据变更审核 ──
  const changeList = ref([])
  const changeLoading = ref(false)
  const changeCurrent = ref(1)
  const changeTotal = ref(0)
  const changePageSize = 20
  const changeTypeFilter = ref('')   // 变更类型 100/200/300

  // ── 操作日志 ──
  const logList = ref([])
  const logLoading = ref(false)
  const logCurrent = ref(1)
  const logTotal = ref(0)
  const logPageSize = 20
  const logKeyword = ref('')
  const logOrderBy = ref('newest')

  // ── 合集管理 ──
  const seriesList = ref([])
  const seriesLoading = ref(false)
  const seriesCurrent = ref(1)
  const seriesTotal = ref(0)
  const seriesKeyword = ref('')
  const seriesPageSize = 20
  const seriesOrderBy = ref('newest')
  const seriesStatusFilter = ref('')
  const seriesUserIdFilter = ref('')
  const selectedSeriesIds = ref(new Set())  // 批量选择的合集 ID

  // ── 通用分页 ──
  const hasMore = (type) => {
    const map = {
      users: () => userList.value.length < userTotal.value,
      works: () => workList.value.length < workTotal.value,
      comments: () => commentList.value.length < commentTotal.value,
      audits: () => auditList.value.length < auditTotal.value,
      changes: () => changeList.value.length < changeTotal.value,
      logs: () => logList.value.length < logTotal.value,
      series: () => seriesList.value.length < seriesTotal.value,
    }
    return map[type] ? map[type]() : false
  }

  // ───────── 用户管理 ─────────

  const loadUsers = async ({ reset = false } = {}) => {
    if (userLoading.value) return
    if (reset) { userCurrent.value = 1; userList.value = [] }
    userLoading.value = true
    const result = await fetchUserList({
      page: userCurrent.value,
      size: userPageSize,
      nickname: userKeyword.value,
      user_role: userRoleFilter.value || undefined,
      status: userStatusFilter.value !== '' ? Number(userStatusFilter.value) : undefined,
      orderBy: userOrderBy.value,
    })
    if (result.success && result.data) {
      const { records, total } = result.data
      const newRecords = records || []
      userList.value = reset ? newRecords : [...userList.value, ...newRecords]
      userTotal.value = total || 0
      // 只有当返回了数据时才增加页码
      if (newRecords.length > 0 && userList.value.length < userTotal.value) {
        userCurrent.value++
      }
    }
    userLoading.value = false
  }

  const handleSearchUsers = () => loadUsers({ reset: true })

  const handleBanUser = async (user) => {
    const currentStatus = user.status || 10
    const isPunish = currentStatus !== 30
    const newStatus = isPunish ? 30 : 10
    const action = isPunish ? '封禁' : '解封'
    const ok = await showConfirm({ title: `${action}用户`, message: `确定要${action}用户「${user.nickname || user.username}」吗？`, yesText: action, noText: '取消', type: isPunish ? 'danger' : 'info' })
    if (!ok) return
    const result = await updateUserStatus(user.user_id, newStatus)
    if (result.success) {
      user.status = newStatus
      showSuccess(result.message || `${action}成功`)
    } else {
      showError(result.message || `${action}失败`)
    }
  }

  const handleFreezeUser = async (user) => {
    const currentStatus = user.status || 10
    const isFrozen = currentStatus === 20
    const newStatus = isFrozen ? 10 : 20
    const action = isFrozen ? '解冻' : '冻结'
    const ok = await showConfirm({ title: `${action}用户`, message: `确定要${action}用户「${user.nickname || user.username}」吗？`, yesText: action, noText: '取消', type: 'info' })
    if (!ok) return
    const result = await updateUserStatus(user.user_id, newStatus)
    if (result.success) {
      user.status = newStatus
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

  // ── 用户批量选择 ──
  const toggleUserSelect = (userId) => {
    if (selectedUserIds.value.has(userId)) {
      selectedUserIds.value.delete(userId)
    } else {
      selectedUserIds.value.add(userId)
    }
  }
  const toggleAllUsers = () => {
    if (selectedUserIds.value.size === userList.value.length) {
      selectedUserIds.value.clear()
    } else {
      userList.value.forEach(u => selectedUserIds.value.add(u.user_id))
    }
  }
  const clearUserSelection = () => selectedUserIds.value.clear()

  // ── 用户批量操作 ──
  const handleBatchDeleteUsers = async () => {
    if (selectedUserIds.value.size === 0) return
    const ids = [...selectedUserIds.value]
    const ok = await showConfirm({ title: '批量删除用户', message: `确定要删除选中的 ${ids.length} 个用户吗？此操作不可撤销。`, yesText: '删除', noText: '取消', type: 'danger' })
    if (!ok) return
    const result = await deleteUser(ids)
    if (result.success) {
      userList.value = userList.value.filter(u => !selectedUserIds.value.has(u.user_id))
      userTotal.value = Math.max(0, userTotal.value - ids.length)
      selectedUserIds.value.clear()
      showSuccess(result.message || '批量删除成功')
    } else {
      showError(result.message || '批量删除失败')
    }
  }
  const handleBatchBanUsers = async () => {
    if (selectedUserIds.value.size === 0) return
    const ids = [...selectedUserIds.value]
    const ok = await showConfirm({ title: '批量封禁用户', message: `确定要封禁选中的 ${ids.length} 个用户吗？`, yesText: '封禁', noText: '取消', type: 'danger' })
    if (!ok) return
    const result = await updateUserStatus(ids, 30)
    if (result.success) {
      ids.forEach(id => {
        const user = userList.value.find(u => u.user_id === id)
        if (user) user.status = 30
      })
      selectedUserIds.value.clear()
      showSuccess(result.message || '批量封禁成功')
    } else {
      showError(result.message || '批量封禁失败')
    }
  }

  // ── 权限更改 ──
  const openChangeRoleDialog = (user) => {
    changeRoleForm.userIds = [user.user_id]
    changeRoleForm.newRole = user.user_role || 11
    showChangeRoleDialog.value = true
  }
  const handleChangeRole = async () => {
    if (changeRoleForm.userIds.length === 0) return
    const roleNames = { 11: '普通用户', 22: '创作者', 55: '审核员', 66: '工单管理员', 77: '系统管理员' }
    const ok = await showConfirm({
      title: '更改用户权限',
      message: `确定要将选中的 ${changeRoleForm.userIds.length} 个用户权限更改为「${roleNames[changeRoleForm.newRole]}」吗？更改后将在24小时内生效。`,
      yesText: '确定更改',
      noText: '取消',
      type: 'info'
    })
    if (!ok) return
    const result = await updateUserRole(changeRoleForm.userIds, changeRoleForm.newRole)
    if (result.success) {
      changeRoleForm.userIds.forEach(id => {
        const user = userList.value.find(u => u.user_id === id)
        if (user) user.user_role = changeRoleForm.newRole
      })
      showChangeRoleDialog.value = false
      showSuccess(result.message || '权限更改成功，24小时内生效')
    } else {
      showError(result.message || '权限更改失败')
    }
  }

  // ── 权限缓存刷新 ──
  const handleRefreshPermissionCache = async () => {
    const ok = await showConfirm({
      title: '刷新权限缓存',
      message: '确定要刷新所有用户的权限缓存吗？这将使所有用户在下次请求时重新加载权限信息。',
      yesText: '确定刷新',
      noText: '取消',
      type: 'info'
    })
    if (!ok) return
    isRefreshingCache.value = true
    const result = await refreshPermissionCache()
    isRefreshingCache.value = false
    if (result.success) {
      showSuccess(result.message || '权限缓存刷新成功')
    } else {
      showError(result.message || '权限缓存刷新失败')
    }
  }

  const handleResetPwd = async (user) => {
    const ok = await showConfirm({ title: '重置密码', message: `将重置「${user.nickname || user.username}」的密码，新密码将发送至其邮箱。`, yesText: '确定重置', noText: '取消', type: 'info' })
    if (!ok) return
    const result = await resetUserPassword(user.user_id)
    if (result.success) {
      showSuccess(result.message || '密码重置成功，新密码已发送至邮箱')
    } else {
      showError(result.message || '密码重置失败')
    }
  }

  const openCreateUserDialog = () => {
    Object.assign(createUserForm, { username: '', password: '', confirmPassword: '', nickname: '', email: '' })
    Object.assign(createUserErrors, {})
    showCreateUserDialog.value = true
  }

  const handleCreateUser = async () => {
    const e = {}
    if (!createUserForm.username) e.username = '请输入用户名'
    else if (!/^[a-zA-Z0-9_]{5,16}$/.test(createUserForm.username)) e.username = '5-16位，只允许字母、数字和下划线'
    if (!createUserForm.password) e.password = '请输入密码'
    else if (!/^[a-zA-Z0-9_.]{6,16}$/.test(createUserForm.password)) e.password = '6-16位，只允许字母、数字、_、.'
    if (createUserForm.password !== createUserForm.confirmPassword) e.confirmPassword = '两次密码不一致'
    if (!createUserForm.nickname) e.nickname = '请输入昵称'
    if (!createUserForm.email) e.email = '请输入邮箱'
    else if (!/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(createUserForm.email)) e.email = '邮箱格式不正确'
    if (Object.keys(e).length > 0) { Object.assign(createUserErrors, e); return }

    const result = await createUser({
      username: createUserForm.username,
      password: createUserForm.password,
      confirmPassword: createUserForm.confirmPassword,
      nickname: createUserForm.nickname,
      email: createUserForm.email,
    })
    if (result.success) {
      showSuccess('创建用户成功')
      showCreateUserDialog.value = false
      loadUsers({ reset: true })
    } else {
      showError(result.message || '创建失败')
    }
  }

  // ───────── 作品管理 ─────────

  const loadWorks = async ({ reset = false } = {}) => {
    if (workLoading.value) return
    if (reset) { workCurrent.value = 1; workList.value = [] }
    workLoading.value = true
    const result = await fetchWorkList({
      current: workCurrent.value,
      size: workPageSize,
      keyword: workKeyword.value,
      orderBy: workOrderBy.value,
      approvalStatus: workApprovalFilter.value !== '' ? Number(workApprovalFilter.value) : undefined,
    })
    if (result.success && result.data) {
      const { records, total } = result.data
      const newRecords = records || []
      workList.value = reset ? newRecords : [...workList.value, ...newRecords]
      workTotal.value = total || 0
      // 只有当返回了数据时才增加页码
      if (newRecords.length > 0 && workList.value.length < workTotal.value) {
        workCurrent.value++
      }
    }
    workLoading.value = false
  }

  const handleSearchWorks = () => loadWorks({ reset: true })

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

  const handleApproveWork = async (work, approvalStatus) => {
    const labels = { 10: '通过', 30: '不通过' }
    const ok = await showConfirm({ title: `作品审核`, message: `确定将作品「${work.work_title || '未命名'}」标记为「${labels[approvalStatus]}」吗？`, yesText: labels[approvalStatus], noText: '取消', type: approvalStatus === 30 ? 'danger' : 'info' })
    if (!ok) return
    const result = await updateWorkApproval(work.work_id, approvalStatus)
    if (result.success) {
      work.approval_status = approvalStatus
      showSuccess('审核操作成功')
    } else {
      showError(result.message || '审核操作失败')
    }
  }

  const openEditTitleDialog = (work) => {
    editTitleForm.workId = work.work_id
    editTitleForm.oldTitle = work.work_title || ''
    editTitleForm.newTitle = work.work_title || ''
    showEditTitleDialog.value = true
  }

  const handleEditWorkTitle = async () => {
    const title = editTitleForm.newTitle.trim()
    if (!title) { showError('标题不能为空'); return }
    if (title.length > 16) { showError('标题最多16个字符'); return }
    const result = await updateWorkTitle(editTitleForm.workId, title)
    if (result.success) {
      const work = workList.value.find(w => w.work_id === editTitleForm.workId)
      if (work) work.work_title = title
      showSuccess('标题已更新')
      showEditTitleDialog.value = false
    } else {
      showError(result.message || '更新失败')
    }
  }

  // ── 作品批量选择 ──
  const toggleWorkSelect = (workId) => {
    if (selectedWorkIds.value.has(workId)) {
      selectedWorkIds.value.delete(workId)
    } else {
      selectedWorkIds.value.add(workId)
    }
  }
  const toggleAllWorks = () => {
    if (selectedWorkIds.value.size === workList.value.length) {
      selectedWorkIds.value.clear()
    } else {
      workList.value.forEach(w => selectedWorkIds.value.add(w.work_id))
    }
  }

  // ── 作品批量操作 ──
  const handleBatchDeleteWorks = async () => {
    if (selectedWorkIds.value.size === 0) return
    const ids = [...selectedWorkIds.value]
    const ok = await showConfirm({ title: '批量删除作品', message: `确定要删除选中的 ${ids.length} 个作品吗？此操作不可撤销。`, yesText: '删除', noText: '取消', type: 'danger' })
    if (!ok) return
    const result = await deleteWork(ids)
    if (result.success) {
      workList.value = workList.value.filter(w => !selectedWorkIds.value.has(w.work_id))
      workTotal.value = Math.max(0, workTotal.value - ids.length)
      selectedWorkIds.value.clear()
      showSuccess(result.message || '批量删除成功')
    } else {
      showError(result.message || '批量删除失败')
    }
  }
  const handleBatchApproveWorks = async (status) => {
    if (selectedWorkIds.value.size === 0) return
    const ids = [...selectedWorkIds.value]
    const labels = { 10: '通过', 30: '不通过' }
    const ok = await showConfirm({ title: `批量${labels[status]}`, message: `确定要将选中的 ${ids.length} 个作品标记为「${labels[status]}」吗？`, yesText: labels[status], noText: '取消', type: status === 30 ? 'danger' : 'info' })
    if (!ok) return
    const result = await updateWorkApproval(ids, status)
    if (result.success) {
      ids.forEach(id => {
        const work = workList.value.find(w => w.work_id === id)
        if (work) work.approval_status = status
      })
      selectedWorkIds.value.clear()
      showSuccess(result.message || '批量审核成功')
    } else {
      showError(result.message || '批量审核失败')
    }
  }

  // ───────── 评论管理 ─────────

  const loadComments = async ({ reset = false } = {}) => {
    if (commentLoading.value) return
    if (reset) { commentCurrent.value = 1; commentList.value = [] }
    commentLoading.value = true
    const result = await fetchCommentList({
      current: commentCurrent.value,
      size: commentPageSize,
      keyword: commentKeyword.value,
      orderBy: commentOrderBy.value,
      approvalStatus: commentApprovalFilter.value !== '' ? Number(commentApprovalFilter.value) : undefined,
    })
    if (result.success && result.data) {
      const { records, total } = result.data
      const newRecords = records || []
      commentList.value = reset ? newRecords : [...commentList.value, ...newRecords]
      commentTotal.value = total || 0
      // 只有当返回了数据时才增加页码
      if (newRecords.length > 0 && commentList.value.length < commentTotal.value) {
        commentCurrent.value++
      }
    }
    commentLoading.value = false
  }

  const handleSearchComments = () => loadComments({ reset: true })

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

  const handleApproveComment = async (comment, approvalStatus) => {
    const labels = { 10: '通过', 30: '不通过' }
    const ok = await showConfirm({ title: `评论审核`, message: `确定将该评论标记为「${labels[approvalStatus]}」吗？`, yesText: labels[approvalStatus], noText: '取消', type: approvalStatus === 30 ? 'danger' : 'info' })
    if (!ok) return
    const result = await updateCommentApproval(comment.comment_id, approvalStatus)
    if (result.success) {
      comment.approval_status = approvalStatus
      showSuccess('审核操作成功')
    } else {
      showError(result.message || '审核操作失败')
    }
  }

  // ── 评论批量选择 ──
  const toggleCommentSelect = (commentId) => {
    if (selectedCommentIds.value.has(commentId)) {
      selectedCommentIds.value.delete(commentId)
    } else {
      selectedCommentIds.value.add(commentId)
    }
  }
  const toggleAllComments = () => {
    if (selectedCommentIds.value.size === commentList.value.length) {
      selectedCommentIds.value.clear()
    } else {
      commentList.value.forEach(c => selectedCommentIds.value.add(c.comment_id))
    }
  }

  // ── 评论批量操作 ──
  const handleBatchDeleteComments = async () => {
    if (selectedCommentIds.value.size === 0) return
    const ids = [...selectedCommentIds.value]
    const ok = await showConfirm({ title: '批量删除评论', message: `确定要删除选中的 ${ids.length} 条评论吗？`, yesText: '删除', noText: '取消', type: 'danger' })
    if (!ok) return
    const result = await deleteComment(ids)
    if (result.success) {
      commentList.value = commentList.value.filter(c => !selectedCommentIds.value.has(c.comment_id))
      commentTotal.value = Math.max(0, commentTotal.value - ids.length)
      selectedCommentIds.value.clear()
      showSuccess(result.message || '批量删除成功')
    } else {
      showError(result.message || '批量删除失败')
    }
  }
  const handleBatchApproveComments = async (status) => {
    if (selectedCommentIds.value.size === 0) return
    const ids = [...selectedCommentIds.value]
    const labels = { 10: '通过', 30: '不通过' }
    const ok = await showConfirm({ title: `批量${labels[status]}`, message: `确定要将选中的 ${ids.length} 条评论标记为「${labels[status]}」吗？`, yesText: labels[status], noText: '取消', type: status === 30 ? 'danger' : 'info' })
    if (!ok) return
    const result = await updateCommentApproval(ids, status)
    if (result.success) {
      ids.forEach(id => {
        const comment = commentList.value.find(c => c.comment_id === id)
        if (comment) comment.approval_status = status
      })
      selectedCommentIds.value.clear()
      showSuccess(result.message || '批量审核成功')
    } else {
      showError(result.message || '批量审核失败')
    }
  }

  // ───────── AI 审核记录 ─────────

  const loadAudits = async ({ reset = false } = {}) => {
    if (auditLoading.value) return
    if (reset) { auditCurrent.value = 1; auditList.value = [] }
    auditLoading.value = true
    const result = await fetchAuditRecords({
      current: auditCurrent.value,
      size: auditPageSize,
      keyword: auditKeyword.value,
      contentType: auditContentTypeFilter.value !== '' ? Number(auditContentTypeFilter.value) : undefined,
      approvalStatus: auditApprovalFilter.value !== '' ? Number(auditApprovalFilter.value) : undefined,
      orderBy: auditOrderBy.value,
    })
    if (result.success && result.data) {
      const { records, total } = result.data
      const newRecords = records || []
      auditList.value = reset ? newRecords : [...auditList.value, ...newRecords]
      auditTotal.value = total || 0
      // 只有当返回了数据时才增加页码
      if (newRecords.length > 0 && auditList.value.length < auditTotal.value) {
        auditCurrent.value++
      }
    }
    auditLoading.value = false
  }

  // ───────── 用户数据变更审核 ─────────

  const loadChanges = async ({ reset = false } = {}) => {
    if (changeLoading.value) return
    if (reset) { changeCurrent.value = 1; changeList.value = [] }
    changeLoading.value = true
    const result = await fetchPendingChanges({
      current: changeCurrent.value,
      size: changePageSize,
      type: changeTypeFilter.value !== '' ? Number(changeTypeFilter.value) : undefined,
    })
    if (result.success && result.data) {
      const { records, total } = result.data
      const newRecords = records || []
      changeList.value = reset ? newRecords : [...changeList.value, ...newRecords]
      changeTotal.value = total || 0
      // 只有当返回了数据时才增加页码
      if (newRecords.length > 0 && changeList.value.length < changeTotal.value) {
        changeCurrent.value++
      }
    }
    changeLoading.value = false
  }

  const handleApproveChange = async (lockId, approved) => {
    const action = approved ? '通过' : '拒绝'
    const ok = await showConfirm({ title: `审核变更`, message: `确定${action}该变更申请吗？`, yesText: action, noText: '取消', type: approved ? 'info' : 'danger' })
    if (!ok) return
    const result = await reviewDataChanges([lockId], approved)
    if (result.success) {
      changeList.value = changeList.value.filter(c => c.lock_id !== lockId)
      changeTotal.value = Math.max(0, changeTotal.value - 1)
      showSuccess(result.message || `${action}成功`)
    } else {
      showError(result.message || `${action}失败`)
    }
  }

  // ───────── 操作日志 ─────────

  const loadLogs = async ({ reset = false } = {}) => {
    if (logLoading.value) return
    if (reset) { logCurrent.value = 1; logList.value = [] }
    logLoading.value = true
    const result = await fetchOperationLogs({
      current: logCurrent.value,
      size: logPageSize,
      keyword: logKeyword.value,
      orderBy: logOrderBy.value,
    })
    if (result.success && result.data) {
      const { records, total } = result.data
      const newRecords = records || []
      logList.value = reset ? newRecords : [...logList.value, ...newRecords]
      logTotal.value = total || 0
      // 只有当返回了数据时才增加页码
      if (newRecords.length > 0 && logList.value.length < logTotal.value) {
        logCurrent.value++
      }
    }
    logLoading.value = false
  }

  // ───────── 合集管理 ─────────

  const loadSeries = async ({ reset = false } = {}) => {
    if (seriesLoading.value) return
    if (reset) { seriesCurrent.value = 1; seriesList.value = [] }
    seriesLoading.value = true
    const result = await fetchSeriesList({
      current: seriesCurrent.value,
      size: seriesPageSize,
      keyword: seriesKeyword.value,
      orderBy: seriesOrderBy.value,
      status: seriesStatusFilter.value !== '' ? Number(seriesStatusFilter.value) : undefined,
      userId: seriesUserIdFilter.value !== '' ? Number(seriesUserIdFilter.value) : undefined,
    })
    if (result.success && result.data) {
      const { records, total } = result.data
      const newRecords = records || []
      seriesList.value = reset ? newRecords : [...seriesList.value, ...newRecords]
      seriesTotal.value = total || 0
      // 只有当返回了数据时才增加页码
      if (newRecords.length > 0 && seriesList.value.length < seriesTotal.value) {
        seriesCurrent.value++
      }
    }
    seriesLoading.value = false
  }

  const handleSearchSeries = () => loadSeries({ reset: true })

  const handleDeleteSeries = async (series) => {
    const ok = await showConfirm({
      title: '删除合集',
      message: `确定要删除合集「${series.series_title || '未命名'}」吗？此操作不可撤销。`,
      yesText: '删除',
      noText: '取消',
      type: 'danger'
    })
    if (!ok) return
    const result = await deleteSeries(series.series_id)
    if (result.success) {
      seriesList.value = seriesList.value.filter(s => s.series_id !== series.series_id)
      seriesTotal.value = Math.max(0, seriesTotal.value - 1)
      showSuccess(result.message || '删除成功')
    } else {
      showError(result.message || '删除失败')
    }
  }

  const handleApproveSeries = async (series, approvalStatus) => {
    const labels = { 10: '通过', 30: '不通过' }
    const ok = await showConfirm({
      title: '合集审核',
      message: `确定将合集「${series.series_title || '未命名'}」标记为「${labels[approvalStatus]}」吗？`,
      yesText: labels[approvalStatus],
      noText: '取消',
      type: approvalStatus === 30 ? 'danger' : 'info'
    })
    if (!ok) return
    const result = await updateSeriesApproval(series.series_id, approvalStatus)
    if (result.success) {
      series.approval_status = approvalStatus
      showSuccess('审核操作成功')
    } else {
      showError(result.message || '审核操作失败')
    }
  }

  // ── 合集批量选择 ──
  const toggleSeriesSelect = (seriesId) => {
    if (selectedSeriesIds.value.has(seriesId)) {
      selectedSeriesIds.value.delete(seriesId)
    } else {
      selectedSeriesIds.value.add(seriesId)
    }
  }
  const toggleAllSeries = () => {
    if (selectedSeriesIds.value.size === seriesList.value.length) {
      selectedSeriesIds.value.clear()
    } else {
      seriesList.value.forEach(s => selectedSeriesIds.value.add(s.series_id))
    }
  }

  // ── 合集批量操作 ──
  const handleBatchDeleteSeries = async () => {
    if (selectedSeriesIds.value.size === 0) return
    const ids = [...selectedSeriesIds.value]
    const ok = await showConfirm({ title: '批量删除合集', message: `确定要删除选中的 ${ids.length} 个合集吗？`, yesText: '删除', noText: '取消', type: 'danger' })
    if (!ok) return
    const result = await deleteSeries(ids)
    if (result.success) {
      seriesList.value = seriesList.value.filter(s => !selectedSeriesIds.value.has(s.series_id))
      seriesTotal.value = Math.max(0, seriesTotal.value - ids.length)
      selectedSeriesIds.value.clear()
      showSuccess(result.message || '批量删除成功')
    } else {
      showError(result.message || '批量删除失败')
    }
  }
  const handleBatchApproveSeries = async (status) => {
    if (selectedSeriesIds.value.size === 0) return
    const ids = [...selectedSeriesIds.value]
    const labels = { 10: '通过', 30: '不通过' }
    const ok = await showConfirm({ title: `批量${labels[status]}`, message: `确定要将选中的 ${ids.length} 个合集标记为「${labels[status]}」吗？`, yesText: labels[status], noText: '取消', type: status === 30 ? 'danger' : 'info' })
    if (!ok) return
    const result = await updateSeriesApproval(ids, status)
    if (result.success) {
      ids.forEach(id => {
        const series = seriesList.value.find(s => s.series_id === id)
        if (series) series.approval_status = status
      })
      selectedSeriesIds.value.clear()
      showSuccess(result.message || '批量审核成功')
    } else {
      showError(result.message || '批量审核失败')
    }
  }

  // ───────── Tab 切换 ─────────

  const switchTab = (tab) => {
    activeTab.value = tab
    const loaders = {
      users: () => userList.value.length === 0 && loadUsers({ reset: true }),
      works: () => workList.value.length === 0 && loadWorks({ reset: true }),
      comments: () => commentList.value.length === 0 && loadComments({ reset: true }),
      audits: () => auditList.value.length === 0 && loadAudits({ reset: true }),
      changes: () => changeList.value.length === 0 && loadChanges({ reset: true }),
      logs: () => logList.value.length === 0 && loadLogs({ reset: true }),
      series: () => seriesList.value.length === 0 && loadSeries({ reset: true }),
    }
    loaders[tab]?.()
  }

  // ───────── 退出 ─────────

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    router.push('/login')
  }

  initRole()

  return {
    activeTab, adminRole, isSuperAdmin,
    userList, userLoading, userKeyword, userTotal, userRoleFilter, userStatusFilter, userOrderBy,
    selectedUserIds, toggleUserSelect, toggleAllUsers, clearUserSelection,
    handleBatchDeleteUsers, handleBatchBanUsers,
    workList, workLoading, workKeyword, workTotal, workOrderBy, workApprovalFilter,
    selectedWorkIds, toggleWorkSelect, toggleAllWorks,
    handleBatchDeleteWorks, handleBatchApproveWorks,
    commentList, commentLoading, commentKeyword, commentTotal, commentOrderBy, commentApprovalFilter,
    selectedCommentIds, toggleCommentSelect, toggleAllComments,
    handleBatchDeleteComments, handleBatchApproveComments,
    auditList, auditLoading, auditTotal, auditKeyword, auditContentTypeFilter, auditApprovalFilter, auditOrderBy,
    changeList, changeLoading, changeTotal, changeTypeFilter,
    logList, logLoading, logTotal, logKeyword, logOrderBy,
    seriesList, seriesLoading, seriesKeyword, seriesTotal, seriesOrderBy, seriesStatusFilter, seriesUserIdFilter,
    selectedSeriesIds, toggleSeriesSelect, toggleAllSeries,
    handleBatchDeleteSeries, handleBatchApproveSeries,
    hasMore, formatTime,
    showCreateUserDialog, createUserForm, createUserErrors, openCreateUserDialog, handleCreateUser,
    showEditTitleDialog, editTitleForm, openEditTitleDialog, handleEditWorkTitle,
    showChangeRoleDialog, changeRoleForm, openChangeRoleDialog, handleChangeRole,
    isRefreshingCache, handleRefreshPermissionCache,
    loadUsers, handleSearchUsers, handleBanUser, handleFreezeUser, handleDeleteUser, handleResetPwd,
    loadWorks, handleSearchWorks, handleDeleteWork, handleApproveWork,
    loadComments, handleSearchComments, handleDeleteComment, handleApproveComment,
    loadAudits, loadChanges, handleApproveChange, loadLogs,
    loadSeries, handleSearchSeries, handleDeleteSeries, handleApproveSeries,
    switchTab, handleLogout,
  }
}
