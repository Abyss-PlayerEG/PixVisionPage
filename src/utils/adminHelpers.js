/**
 * 管理端公共工具函数
 * 抽取各组件中重复的映射函数
 */

// ── 角色映射 ──
export const roleMap = { 11: '普通用户', 22: '创作者', 55: '审核员', 66: '工单管理员', 77: '系统管理员' }
export const roleLabel = (r) => roleMap[r] || `未知(${r})`
export const roleBadgeClass = (r) => {
  if (r === 77) return 'ad-badge--role-super'
  if (r === 55 || r === 66) return 'ad-badge--role-staff'
  if (r === 22) return 'ad-badge--role-creator'
  return 'ad-badge--role-user'
}

// ── 状态映射 ──
export const statusMap = { 10: '正常', 20: '冻结', 30: '封禁' }
export const statusLabel = (s) => statusMap[s] || `未知(${s})`
export const statusBadgeClass = (s) => {
  if (s === 30) return 'ad-badge--banned'
  if (s === 20) return 'ad-badge--frozen'
  return 'ad-badge--active'
}

// ── 审核状态映射 ──
export const approvalMap = { 10: '正常', 20: '待审核', 30: '违规' }
export const approvalLabel = (s) => approvalMap[s] || '未知'
export const approvalBadgeClass = (s) => {
  if (s === 10) return 'ad-badge--active'
  if (s === 20) return 'ad-badge--pending'
  if (s === 30) return 'ad-badge--banned'
  return ''
}

// ── 内容类型映射 ──
export const contentTypeMap = { 100: '作品', 200: '评论', 300: '合集', 400: '昵称' }
export const contentTypeLabel = (t) => contentTypeMap[t] || `类型${t}`

// ── 变更类型映射 ──
export const changeTypeMap = { 100: '昵称修改', 200: '权限申请', 300: '头像修改' }
export const changeTypeLabel = (t) => changeTypeMap[t] || `类型${t}`
export const changeTypeClass = (t) => {
  if (t === 200) return 'ad-badge--pending'
  if (t === 100 || t === 300) return 'ad-badge--role-staff'
  return ''
}

/**
 * 格式化时间字符串
 * @param {string} timeStr - 时间字符串
 * @returns {string} 格式化后的时间
 */
export const formatTime = (timeStr) => {
  if (!timeStr) return '—'
  try {
    const date = new Date(timeStr)
    const pad = (n) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
  } catch { return timeStr }
}

// ── 图片缓存 ──
const avatarCache = new Map()

/**
 * 通过 fetch 加载需要认证的图片，返回 blob URL
 * @param {string} url - 图片接口地址
 * @returns {Promise<string>} blob URL
 */
export const fetchAuthImage = async (url) => {
  // 检查缓存
  if (avatarCache.has(url)) {
    return avatarCache.get(url)
  }
  
  try {
    const token = localStorage.getItem('token')
    if (!token) return ''
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) return ''
    
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    
    // 缓存结果
    avatarCache.set(url, blobUrl)
    
    return blobUrl
  } catch {
    return ''
  }
}
