<template>
  <div>
    <div class="ad-table-header">
      <h3 class="ad-table-title">用户管理<span class="ad-table-count">（共 {{ userTotal }} 人）</span></h3>
      <div class="ad-search-box">
        <input
          :value="userKeyword"
          class="ad-search-input"
          placeholder="搜索用户名或邮箱..."
          @input="$emit('update:userKeyword', $event.target.value)"
          @keyup.enter="$emit('search')"
        />
        <button class="ad-search-btn" @click="$emit('search')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </button>
      </div>
    </div>

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
              <span class="ad-badge" :class="(user.banned || user.status === 0) ? 'ad-badge--banned' : 'ad-badge--active'">
                {{ (user.banned || user.status === 0) ? '已封禁' : '正常' }}
              </span>
            </td>
            <td>{{ formatTime(user.create_time) }}</td>
            <td>
              <div class="ad-actions">
                <button
                  class="ad-action-btn"
                  :class="(user.banned || user.status === 0) ? 'ad-action-btn--warn' : ''"
                  @click="$emit('banUser', user)"
                >
                  {{ (user.banned || user.status === 0) ? '解封' : '封禁' }}
                </button>
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
      <span v-else-if="userList.length > 0" class="ad-empty" style="padding: 12px 0;">— 已加载全部 —</span>
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
})
defineEmits(['update:userKeyword', 'search', 'loadMore', 'banUser', 'deleteUser'])
</script>
