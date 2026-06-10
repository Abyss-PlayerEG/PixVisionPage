<template>
  <div>
    <div class="ad-table-header">
      <h3 class="ad-table-title">合集管理<span class="ad-table-count">（共 {{ seriesTotal }} 个）</span></h3>
      <div style="display:flex;align-items:center;gap:12px;">
        <!-- 批量操作按钮 -->
        <div v-if="selectedIds.size > 0" class="ad-batch-actions">
          <span class="ad-batch-count">已选 {{ selectedIds.size }} 项</span>
          <button class="ad-action-btn ad-action-btn--approve" @click="$emit('batchApprove', 10)">批量通过</button>
          <button class="ad-action-btn ad-action-btn--warn" @click="$emit('batchApprove', 30)">批量不通过</button>
          <button v-if="isSuperAdmin" class="ad-action-btn ad-action-btn--danger" @click="$emit('batchDelete')">批量删除</button>
        </div>
        <div class="ad-search-box">
          <input
            :value="seriesKeyword"
            class="ad-search-input"
            placeholder="搜索合集标题..."
            @input="$emit('update:seriesKeyword', $event.target.value)"
            @keyup.enter="$emit('search')"
          />
          <button class="ad-search-btn" @click="$emit('search')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="ad-filter-bar">
      <div class="ad-filter-group">
        <label class="ad-filter-label">审核状态</label>
        <select class="ad-form-select ad-filter-select" :value="seriesStatusFilter" @change="$emit('update:seriesStatusFilter', $event.target.value); $emit('search')">
          <option value="">全部</option>
          <option value="10">正常</option>
          <option value="20">待审核</option>
          <option value="30">违规</option>
        </select>
      </div>
      <div class="ad-filter-group">
        <label class="ad-filter-label">排序</label>
        <select class="ad-form-select ad-filter-select" :value="seriesOrderBy" @change="$emit('update:seriesOrderBy', $event.target.value); $emit('search')">
          <option value="newest">最新优先</option>
          <option value="oldest">最早优先</option>
        </select>
      </div>
    </div>

    <div v-if="seriesLoading && seriesList.length === 0" class="ad-table-skeleton">
      <div v-for="n in 8" :key="n" class="ad-table-skeleton-row"></div>
    </div>
    <div v-else-if="!seriesLoading && seriesList.length === 0" class="ad-empty">暂无合集数据</div>
    <div v-else class="ad-table-wrap">
      <table class="ad-table">
        <thead>
          <tr>
            <th class="ad-col-checkbox">
              <input type="checkbox" :checked="isAllSelected" @change="$emit('toggleAll')" />
            </th>
            <th>ID</th>
            <th>合集标题</th>
            <th>描述</th>
            <th>作者</th>
            <th>审核</th>
            <th>作品数</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="series in seriesList" :key="series.series_id" :class="{ 'ad-row-selected': selectedIds.has(series.series_id) }">
            <td class="ad-col-checkbox">
              <input type="checkbox" :checked="selectedIds.has(series.series_id)" @change="$emit('toggleSelect', series.series_id)" />
            </td>
            <td class="ad-cell-id">#{{ series.series_id }}</td>
            <td class="ad-cell-title">{{ series.series_title || '未命名合集' }}</td>
            <td class="ad-cell-text">{{ series.about_text || '—' }}</td>
            <td>{{ series.username || '用户 #' + series.user_id }}</td>
            <td>
              <span class="ad-badge" :class="approvalBadgeClass(series.approval_status)">
                {{ approvalLabel(series.approval_status) }}
              </span>
            </td>
            <td>{{ series.work_count || 0 }}</td>
            <td>{{ formatTime(series.create_time) }}</td>
            <td>
              <div class="ad-actions">
                <button 
                  class="ad-action-btn ad-action-btn--approve" 
                  :disabled="series.approval_status === 10"
                  @click="$emit('approveSeries', series, 10)"
                >{{ series.approval_status === 10 ? '已通过' : '通过' }}</button>
                <button 
                  class="ad-action-btn ad-action-btn--warn" 
                  :disabled="series.approval_status === 30"
                  @click="$emit('approveSeries', series, 30)"
                >{{ series.approval_status === 30 ? '已违规' : '不通过' }}</button>
                <button v-if="isSuperAdmin" class="ad-action-btn ad-action-btn--danger" @click="$emit('deleteSeries', series)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="ad-load-more">
      <div v-if="seriesLoading" class="ad-loading-spinner">
        <svg class="ad-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32" stroke-linecap="round"><animate attributeName="stroke-dashoffset" values="32;0" dur="0.8s" repeatCount="indefinite"/></circle></svg>
        加载中...
      </div>
      <div v-else-if="hasMore" ref="sentinelRef" class="ad-sentinel"></div>
      <span v-else-if="seriesList.length > 0" class="ad-empty" style="padding:12px 0;">— 已加载全部 —</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { approvalLabel, approvalBadgeClass } from '@/utils/adminHelpers'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'

const props = defineProps({
  seriesList: { type: Array, required: true },
  seriesLoading: { type: Boolean, required: true },
  seriesKeyword: { type: String, default: '' },
  seriesTotal: { type: Number, default: 0 },
  hasMore: { type: Boolean, default: false },
  formatTime: { type: Function, required: true },
  seriesStatusFilter: { type: String, default: '' },
  seriesOrderBy: { type: String, default: 'newest' },
  adminRole: { type: Number, default: 0 },
  selectedIds: { type: Set, default: () => new Set() },
})
defineEmits(['update:seriesKeyword', 'update:seriesStatusFilter', 'update:seriesOrderBy', 'search', 'loadMore', 'deleteSeries', 'approveSeries', 'toggleSelect', 'toggleAll', 'batchDelete', 'batchApprove'])

const isSuperAdmin = computed(() => props.adminRole === 77)
const isAllSelected = computed(() => props.seriesList.length > 0 && props.selectedIds.size === props.seriesList.length)

const { sentinelRef } = useInfiniteScroll(
  () => emit('loadMore'),
  computed(() => props.hasMore),
  computed(() => props.seriesLoading)
)
</script>
