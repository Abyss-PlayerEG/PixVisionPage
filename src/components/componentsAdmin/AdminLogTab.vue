<template>
  <div>
    <div class="ad-table-header">
      <h3 class="ad-table-title">操作日志<span class="ad-table-count">（共 {{ total }} 条）</span></h3>
      <div class="ad-search-box">
        <input :value="keyword" class="ad-search-input" placeholder="搜索操作事件..." @input="$emit('update:keyword', $event.target.value)" @keyup.enter="$emit('search')" />
        <button class="ad-search-btn" @click="$emit('search')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="ad-filter-bar">
      <div class="ad-filter-group">
        <label class="ad-filter-label">排序</label>
        <select class="ad-form-select ad-filter-select" :value="orderBy" @change="$emit('update:orderBy', $event.target.value); $emit('search')">
          <option value="newest">最新优先</option>
          <option value="oldest">最早优先</option>
        </select>
      </div>
    </div>

    <div v-if="loading && list.length === 0" class="ad-table-skeleton">
      <div v-for="n in 8" :key="n" class="ad-table-skeleton-row"></div>
    </div>
    <div v-else-if="!loading && list.length === 0" class="ad-empty">暂无操作日志</div>
    <div v-else class="ad-table-wrap">
      <table class="ad-table">
        <thead>
          <tr>
            <th>日志ID</th>
            <th>操作者</th>
            <th>操作事件</th>
            <th>操作时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.sys_log_id">
            <td class="ad-cell-id">#{{ item.sys_log_id }}</td>
            <td class="ad-cell-title">{{ item.username || '用户 #' + item.user_id }}</td>
            <td>{{ item.log_event || '—' }}</td>
            <td>{{ formatTime(item.log_datetime) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="ad-load-more">
      <div v-if="loading" class="ad-loading-spinner">
        <svg class="ad-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32" stroke-linecap="round"><animate attributeName="stroke-dashoffset" values="32;0" dur="0.8s" repeatCount="indefinite"/></circle></svg>
        加载中...
      </div>
      <div v-else-if="hasMore" ref="sentinelRef" class="ad-sentinel"></div>
      <span v-else-if="list.length > 0" class="ad-empty" style="padding:12px 0;">— 已加载全部 —</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'

const props = defineProps({
  list: { type: Array, required: true },
  loading: { type: Boolean, required: true },
  total: { type: Number, default: 0 },
  hasMore: { type: Boolean, default: false },
  formatTime: { type: Function, required: true },
  keyword: { type: String, default: '' },
  orderBy: { type: String, default: 'newest' },
})
defineEmits(['update:keyword', 'update:orderBy', 'search', 'loadMore'])

const { sentinelRef } = useInfiniteScroll(
  () => emit('loadMore'),
  computed(() => props.hasMore),
  computed(() => props.loading)
)
</script>
