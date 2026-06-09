<template>
  <div>
    <!-- 标题栏 + 创建用户按钮 -->
    <div class="ad-table-header">
      <h3 class="ad-table-title">用户管理<span class="ad-table-count">（共 {{ userTotal }} 人）</span></h3>
      <div style="display:flex;align-items:center;gap:12px;">
        <div class="ad-search-box">
          <input
            :value="userKeyword"
            class="ad-search-input"
            placeholder="搜索昵称..."
            @input="$emit('update:userKeyword', $event.target.value)"
            @keyup.enter="$emit('search')"
          />
          <button class="ad-search-btn" @click="$emit('search')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </button>
        </div>
        <button class="ad-create-btn" @click="$emit('createUser')">+ 创建用户</button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="ad-filter-bar">
      <div class="ad-filter-group">
        <label class="ad-filter-label">角色</label>
        <select class="ad-form-select ad-filter-select" :value="userRoleFilter" @change="$emit('update:userRoleFilter', $event.target.value); $emit('search')">
          <option value="">全部</option>
          <option value="11">普通用户</option>
          <option value="22">创作者</option>
          <option value="55">审核员</option>
          <option value="66">工单管理员</option>
          <option value="77">系统管理员</option>
        </select>
      </div>
      <div class="ad-filter-group">
        <label class="ad-filter-label">状态</label>
        <select class="ad-form-select ad-filter-select" :value="userStatusFilter" @change="$emit('update:userStatusFilter', $event.target.value); $emit('search')">
          <option value="">全部</option>
          <option value="10">正常</option>
          <option value="20">冻结</option>
          <option value="30">封禁</option>
        </select>
      </div>
      <div class="ad-filter-group">
        <label class="ad-filter-label">排序</label>
        <select class="ad-form-select ad-filter-select" :value="userOrderBy" @change="$emit('update:userOrderBy', $event.target.value); $emit('search')">
          <option value="newest">最新优先</option>
          <option value="oldest">最早优先</option>
        </select>
      </div>
    </div>

    <!-- Loading / Empty / Table -->
    <div v-if="userLoading && userList.length === 0" class="ad-table-skeleton">
      <div v-for="n in 8" :key="n" class="ad-table-skeleton-row"></div>
    </div>
    <div v-else-if="!userLoading && userList.length === 0" class="ad-empty">暂无用户数据</div>
    <div v-else class="ad-table-wrap">
      <table class="ad-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>昵称</th>
            <th>邮箱</th>
            <th>角色</th>
            <th>状态</th>
            <th>注册时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in userList" :key="user.user_id">
            <td class="ad-cell-id">#{{ user.user_id }}</td>
            <td class="ad-cell-title">{{ user.username }}</td>
            <td>{{ user.nickname || '—' }}</td>
            <td class="ad-cell-text">{{ user.email || '—' }}</td>
            <td>
              <span class="ad-badge" :class="roleBadgeClass(user.user_role)">
                {{ roleLabel(user.user_role) }}
              </span>
            </td>
            <td>
              <span class="ad-badge" :class="statusBadgeClass(user.status)">
                {{ statusLabel(user.status) }}
              </span>
            </td>
            <td>{{ formatTime(user.create_time) }}</td>
            <td>
              <div class="ad-actions">
                <button
                  v-if="user.status !== 30"
                  class="ad-action-btn ad-action-btn--freeze"
                  @click="$emit('freezeUser', user)"
                >
                  {{ user.status === 20 ? '解冻' : '冻结' }}
                </button>
                <button
                  class="ad-action-btn ad-action-btn--warn"
                  @click="$emit('banUser', user)"
                >
                  {{ user.status === 30 ? '解封' : '封禁' }}
                </button>
                <button class="ad-action-btn" @click="$emit('resetPwd', user)">重置密码</button>
                <button class="ad-action-btn ad-action-btn--danger" @click="$emit('deleteUser', user)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="ad-load-more">
      <div v-if="userLoading" class="ad-loading-spinner">
        <svg class="ad-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32" stroke-linecap="round"><animate attributeName="stroke-dashoffset" values="32;0" dur="0.8s" repeatCount="indefinite"/></circle></svg>
        加载中...
      </div>
      <button v-else-if="hasMore" class="ad-load-more-btn" @click="$emit('loadMore')">加载更多</button>
      <span v-else-if="userList.length > 0" class="ad-empty" style="padding:12px 0;">— 已加载全部 —</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  userList: { type: Array, required: true },
  userLoading: { type: Boolean, required: true },
  userKeyword: { type: String, default: '' },
  userTotal: { type: Number, default: 0 },
  hasMore: { type: Boolean, default: false },
  formatTime: { type: Function, required: true },
  userRoleFilter: { type: String, default: '' },
  userStatusFilter: { type: String, default: '' },
  userOrderBy: { type: String, default: 'newest' },
})
defineEmits(['update:userKeyword', 'update:userRoleFilter', 'update:userStatusFilter', 'update:userOrderBy', 'search', 'loadMore', 'banUser', 'freezeUser', 'deleteUser', 'createUser', 'resetPwd'])

// 角色映射
const roleMap = { 11: '普通用户', 22: '创作者', 55: '审核员', 66: '工单管理员', 77: '系统管理员' }
const roleLabel = (r) => roleMap[r] || `未知(${r})`
const roleBadgeClass = (r) => {
  if (r === 77) return 'ad-badge--role-super'
  if (r === 55 || r === 66) return 'ad-badge--role-staff'
  if (r === 22) return 'ad-badge--role-creator'
  return 'ad-badge--role-user'
}

// 状态映射
const statusMap = { 10: '正常', 20: '冻结', 30: '封禁' }
const statusLabel = (s) => statusMap[s] || `未知(${s})`
const statusBadgeClass = (s) => {
  if (s === 30) return 'ad-badge--banned'
  if (s === 20) return 'ad-badge--frozen'
  return 'ad-badge--active'
}
</script>
