<template>
  <div>
    <!-- 头像预览浮层 -->
    <Teleport to="body">
      <div v-if="previewUrl" class="ad-avatar-float-preview" :style="previewStyle">
        <AuthImage :url="getAdminAvatarUrl(previewUrl)" :alt="'头像预览'" class-name="ad-avatar-preview-img" />
      </div>
    </Teleport>

    <!-- 标题栏 + 创建用户按钮 -->
    <div class="ad-table-header">
      <h3 class="ad-table-title">用户管理<span class="ad-table-count">（共 {{ userTotal }} 人）</span></h3>
      <div style="display:flex;align-items:center;gap:12px;">
        <!-- 批量操作按钮 -->
        <div v-if="selectedIds.size > 0" class="ad-batch-actions">
          <span class="ad-batch-count">已选 {{ selectedIds.size }} 项</span>
          <button class="ad-action-btn ad-action-btn--warn" @click="$emit('batchBan')">批量封禁</button>
          <button class="ad-action-btn ad-action-btn--danger" @click="$emit('batchDelete')">批量删除</button>
        </div>
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
            <th class="ad-col-checkbox">
              <input type="checkbox" :checked="isAllSelected" @change="$emit('toggleAll')" />
            </th>
            <th>ID</th>
            <th>头像</th>
            <th>用户名</th>
            <th>昵称</th>
            <th>角色</th>
            <th>状态</th>
            <th>注册时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in userList" :key="user.user_id" :class="{ 'ad-row-selected': selectedIds.has(user.user_id) }">
            <td class="ad-col-checkbox">
              <input type="checkbox" :checked="selectedIds.has(user.user_id)" @change="$emit('toggleSelect', user.user_id)" />
            </td>
            <td class="ad-cell-id">#{{ user.user_id }}</td>
            <td>
              <div
                class="ad-avatar-hover-wrapper"
                @mouseenter="(e) => showPreview(e, user.avatar_url)"
                @mouseleave="hidePreview"
              >
                <AuthImage :url="getAdminAvatarUrl(user.avatar_url)" :alt="user.nickname" class-name="ad-avatar-thumb" />
              </div>
            </td>
            <td class="ad-cell-title">{{ user.username }}</td>
            <td>{{ user.nickname || '—' }}</td>
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
                <button v-if="isSuperAdmin" class="ad-action-btn ad-action-btn--danger" @click="$emit('deleteUser', user)">删除</button>
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
      <div v-else-if="hasMore" ref="sentinelRef" class="ad-sentinel"></div>
      <span v-else-if="userList.length > 0" class="ad-empty" style="padding:12px 0;">— 已加载全部 —</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { roleLabel, roleBadgeClass, statusLabel, statusBadgeClass } from '@/utils/adminHelpers'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { getAdminAvatarUrl } from '@/config/api'
import AuthImage from '@/components/AuthImage.vue'

const props = defineProps({
  userList: { type: Array, required: true },
  userLoading: { type: Boolean, required: true },
  userKeyword: { type: String, default: '' },
  userTotal: { type: Number, default: 0 },
  hasMore: { type: Boolean, default: false },
  formatTime: { type: Function, required: true },
  userRoleFilter: { type: String, default: '' },
  userStatusFilter: { type: String, default: '' },
  userOrderBy: { type: String, default: 'newest' },
  selectedIds: { type: Set, default: () => new Set() },
  adminRole: { type: Number, default: 0 },
})
const emit = defineEmits(['update:userKeyword', 'update:userRoleFilter', 'update:userStatusFilter', 'update:userOrderBy', 'search', 'loadMore', 'banUser', 'freezeUser', 'deleteUser', 'createUser', 'resetPwd', 'toggleSelect', 'toggleAll', 'batchDelete', 'batchBan'])

const isAllSelected = computed(() => props.userList.length > 0 && props.selectedIds.size === props.userList.length)
const isSuperAdmin = computed(() => props.adminRole === 77)

const { sentinelRef } = useInfiniteScroll(
  () => emit('loadMore'),
  computed(() => props.hasMore),
  computed(() => props.userLoading)
)

// 头像预览
const previewUrl = ref('')
const previewStyle = ref({})

const showPreview = (e, url) => {
  const rect = e.currentTarget.getBoundingClientRect()
  previewUrl.value = url
  previewStyle.value = {
    left: `${rect.left + rect.width / 2}px`,
    top: `${rect.top - 8}px`,
  }
}

const hidePreview = () => {
  previewUrl.value = ''
}
</script>

<style>
.ad-avatar-hover-wrapper {
  cursor: pointer;
  display: inline-block;
}
</style>
