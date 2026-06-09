<template>
  <div>
    <div class="ad-table-header">
      <h3 class="ad-table-title">作品管理<span class="ad-table-count">（共 {{ workTotal }} 件）</span></h3>
      <div class="ad-search-box">
        <input
          :value="workKeyword"
          class="ad-search-input"
          placeholder="搜索作品标题..."
          @input="$emit('update:workKeyword', $event.target.value)"
          @keyup.enter="$emit('search')"
        />
        <button class="ad-search-btn" @click="$emit('search')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="ad-filter-bar">
      <div class="ad-filter-group">
        <label class="ad-filter-label">审核状态</label>
        <select class="ad-form-select ad-filter-select" :value="workApprovalFilter" @change="$emit('update:workApprovalFilter', $event.target.value); $emit('search')">
          <option value="">全部</option>
          <option value="10">正常</option>
          <option value="20">待审核</option>
          <option value="30">违规</option>
        </select>
      </div>
      <div class="ad-filter-group">
        <label class="ad-filter-label">排序</label>
        <select class="ad-form-select ad-filter-select" :value="workOrderBy" @change="$emit('update:workOrderBy', $event.target.value); $emit('search')">
          <option value="newest">最新优先</option>
          <option value="oldest">最早优先</option>
          <option value="mostLikes">最多点赞</option>
          <option value="mostStars">最多收藏</option>
          <option value="mostViews">最多浏览</option>
        </select>
      </div>
    </div>

    <div v-if="workLoading && workList.length === 0" class="ad-table-skeleton">
      <div v-for="n in 8" :key="n" class="ad-table-skeleton-row"></div>
    </div>
    <div v-else-if="!workLoading && workList.length === 0" class="ad-empty">暂无作品数据</div>
    <div v-else class="ad-table-wrap">
      <table class="ad-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>作品标题</th>
            <th>审核</th>
            <th>点赞</th>
            <th>收藏</th>
            <th>浏览</th>
            <th>发布时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="work in workList" :key="work.work_id">
            <td class="ad-cell-id">#{{ work.work_id }}</td>
            <td class="ad-cell-title">{{ work.work_title || '未命名作品' }}</td>
            <td>
              <span class="ad-badge" :class="approvalBadgeClass(work.approval_status)">
                {{ approvalLabel(work.approval_status) }}
              </span>
            </td>
            <td>{{ (work.like_count || 0).toLocaleString() }}</td>
            <td>{{ (work.star_count || 0).toLocaleString() }}</td>
            <td>{{ (work.view_count || 0).toLocaleString() }}</td>
            <td>{{ formatTime(work.create_time) }}</td>
            <td>
              <div class="ad-actions">
                <button class="ad-action-btn ad-action-btn--approve" @click="$emit('approveWork', work, 10)">通过</button>
                <button class="ad-action-btn ad-action-btn--warn" @click="$emit('approveWork', work, 30)">不通过</button>
                <button class="ad-action-btn" @click="$emit('editWorkTitle', work)">改标题</button>
                <button class="ad-action-btn" @click="$router.push(`/work/${work.work_id}`)">查看</button>
                <button class="ad-action-btn ad-action-btn--danger" @click="$emit('deleteWork', work)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="ad-load-more">
      <div v-if="workLoading" class="ad-loading-spinner">
        <svg class="ad-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32" stroke-linecap="round"><animate attributeName="stroke-dashoffset" values="32;0" dur="0.8s" repeatCount="indefinite"/></circle></svg>
        加载中...
      </div>
      <button v-else-if="hasMore" class="ad-load-more-btn" @click="$emit('loadMore')">加载更多</button>
      <span v-else-if="workList.length > 0" class="ad-empty" style="padding:12px 0;">— 已加载全部 —</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  workList: { type: Array, required: true },
  workLoading: { type: Boolean, required: true },
  workKeyword: { type: String, default: '' },
  workTotal: { type: Number, default: 0 },
  hasMore: { type: Boolean, default: false },
  formatTime: { type: Function, required: true },
  workApprovalFilter: { type: String, default: '' },
  workOrderBy: { type: String, default: 'newest' },
})
defineEmits(['update:workKeyword', 'update:workApprovalFilter', 'update:workOrderBy', 'search', 'loadMore', 'deleteWork', 'approveWork', 'editWorkTitle'])

const approvalMap = { 10: '正常', 20: '待审核', 30: '违规' }
const approvalLabel = (s) => approvalMap[s] || '未知'
const approvalBadgeClass = (s) => {
  if (s === 10) return 'ad-badge--active'
  if (s === 20) return 'ad-badge--pending'
  if (s === 30) return 'ad-badge--banned'
  return ''
}
</script>
