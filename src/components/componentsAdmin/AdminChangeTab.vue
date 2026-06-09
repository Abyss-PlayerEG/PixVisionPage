<template>
  <div>
    <div class="ad-table-header">
      <h3 class="ad-table-title">用户数据变更审核<span class="ad-table-count">（共 {{ total }} 条待审核）</span></h3>
    </div>

    <!-- 筛选栏 -->
    <div class="ad-filter-bar">
      <div class="ad-filter-group">
        <label class="ad-filter-label">变更类型</label>
        <select class="ad-form-select ad-filter-select" :value="typeFilter" @change="$emit('update:typeFilter', $event.target.value); $emit('search')">
          <option value="">全部</option>
          <option value="100">昵称修改</option>
          <option value="200">权限申请</option>
          <option value="300">头像修改</option>
        </select>
      </div>
    </div>

    <div v-if="loading && list.length === 0" class="ad-table-skeleton">
      <div v-for="n in 6" :key="n" class="ad-table-skeleton-row"></div>
    </div>
    <div v-else-if="!loading && list.length === 0" class="ad-empty">暂无待审核变更</div>
    <div v-else class="ad-table-wrap">
      <table class="ad-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户</th>
            <th>变更类型</th>
            <th>变更内容</th>
            <th>提交时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.lock_id">
            <td class="ad-cell-id">#{{ item.lock_id }}</td>
            <td class="ad-cell-title">{{ item.username || '用户 #' + item.user_id }}</td>
            <td>
              <span class="ad-badge" :class="changeTypeClass(item.type)">
                {{ changeTypeLabel(item.type) }}
              </span>
            </td>
            <td>{{ changeContent(item) }}</td>
            <td>{{ formatTime(item.create_time) }}</td>
            <td>
              <div class="ad-actions">
                <button class="ad-action-btn ad-action-btn--approve" @click="$emit('approveChange', item.lock_id, true)">通过</button>
                <button class="ad-action-btn ad-action-btn--danger" @click="$emit('approveChange', item.lock_id, false)">拒绝</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="ad-load-more">
      <div v-if="loading" class="ad-loading-spinner">
        <svg class="ad-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32" stroke-linecap="round"><animate attributeName="stroke-dashoffset" values="32;0" dur="0.8s" repeatCount="indefinite"/></circle></svg>
        加载中...
      </div>
      <button v-else-if="hasMore" class="ad-load-more-btn" @click="$emit('loadMore')">加载更多</button>
      <span v-else-if="list.length > 0" class="ad-empty" style="padding:12px 0;">— 已加载全部 —</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  list: { type: Array, required: true },
  loading: { type: Boolean, required: true },
  total: { type: Number, default: 0 },
  hasMore: { type: Boolean, default: false },
  formatTime: { type: Function, required: true },
  typeFilter: { type: String, default: '' },
})
defineEmits(['update:typeFilter', 'search', 'loadMore', 'approveChange'])

const changeTypeMap = { 100: '昵称修改', 200: '权限申请', 300: '头像修改' }
const changeTypeLabel = (t) => changeTypeMap[t] || `类型${t}`
const changeTypeClass = (t) => {
  if (t === 200) return 'ad-badge--pending'
  if (t === 100 || t === 300) return 'ad-badge--role-staff'
  return ''
}

const roleMap = { 11: '普通用户', 22: '创作者', 55: '审核员', 66: '工单管理员', 77: '系统管理员' }
const changeContent = (item) => {
  if (item.type === 100) return `「${item.nickname || '—'}」`
  if (item.type === 200) return `申请 ${roleMap[item.user_role] || '角色'}（代码${item.user_role}）`
  if (item.type === 300) return item.avatar_url || '有头像待审'
  return '—'
}
</script>
