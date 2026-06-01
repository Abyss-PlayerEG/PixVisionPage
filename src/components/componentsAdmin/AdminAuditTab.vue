<template>
  <div>
    <div class="ad-table-header">
      <h3 class="ad-table-title">AI 审核记录<span class="ad-table-count">（共 {{ total }} 条）</span></h3>
      <div class="ad-search-box">
        <input :value="keyword" class="ad-search-input" placeholder="搜索审核原因..." @input="$emit('update:keyword', $event.target.value)" @keyup.enter="$emit('search')" />
        <button class="ad-search-btn" @click="$emit('search')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="ad-filter-bar">
      <div class="ad-filter-group">
        <label class="ad-filter-label">内容类型</label>
        <select class="ad-form-select ad-filter-select" :value="contentTypeFilter" @change="$emit('update:contentTypeFilter', $event.target.value); $emit('search')">
          <option value="">全部</option>
          <option value="100">作品</option>
          <option value="200">评论</option>
          <option value="300">合集</option>
          <option value="400">昵称</option>
        </select>
      </div>
      <div class="ad-filter-group">
        <label class="ad-filter-label">审核状态</label>
        <select class="ad-form-select ad-filter-select" :value="approvalFilter" @change="$emit('update:approvalFilter', $event.target.value); $emit('search')">
          <option value="">全部</option>
          <option value="10">正常</option>
          <option value="20">待审核</option>
          <option value="30">违规</option>
        </select>
      </div>
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
    <div v-else-if="!loading && list.length === 0" class="ad-empty">暂无审核记录</div>
    <div v-else class="ad-table-wrap">
      <table class="ad-table">
        <thead>
          <tr>
            <th>记录ID</th>
            <th>内容类型</th>
            <th>内容ID</th>
            <th>审核结果</th>
            <th>审核依据</th>
            <th>命中敏感词</th>
            <th>审核时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.record_id">
            <td class="ad-cell-id">#{{ item.record_id }}</td>
            <td>{{ contentTypeLabel(item.content_type) }}</td>
            <td>{{ item.content_id }}</td>
            <td>
              <span class="ad-badge" :class="approvalBadgeClass(item.approval_status)">
                {{ approvalLabel(item.approval_status) }}
              </span>
            </td>
            <td class="ad-cell-wrap">{{ item.audit_reason || '—' }}</td>
            <td class="ad-cell-wrap">
                          <template v-if="parseInsultWords(item.insult_words).length === 0">—</template>
                          <template v-else>
                            <div
                              v-if="!expandedRows.has(item.record_id)"
                              class="ad-insult-collapsed"
                              @click="toggleExpand(item.record_id)"
                            >
                              <span class="ad-insult-tag">{{ parseInsultWords(item.insult_words)[0] }}</span>
                              <span v-if="parseInsultWords(item.insult_words).length > 1" class="ad-insult-more">+{{ parseInsultWords(item.insult_words).length - 1 }}</span>
                            </div>
                            <div v-else class="ad-insult-expanded" @click="toggleExpand(item.record_id)">
                              <span v-for="(word, idx) in parseInsultWords(item.insult_words)" :key="idx" class="ad-insult-tag">{{ word }}</span>
                            </div>
                          </template>
                        </td>
            <td>{{ formatTime(item.create_time) }}</td>
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
import { reactive } from 'vue'

defineProps({
  list: { type: Array, required: true },
  loading: { type: Boolean, required: true },
  total: { type: Number, default: 0 },
  hasMore: { type: Boolean, default: false },
  formatTime: { type: Function, required: true },
  keyword: { type: String, default: '' },
  contentTypeFilter: { type: String, default: '' },
  approvalFilter: { type: String, default: '' },
  orderBy: { type: String, default: 'newest' },
})
defineEmits(['update:keyword', 'update:contentTypeFilter', 'update:approvalFilter', 'update:orderBy', 'search', 'loadMore'])

// 敏感词展开/折叠
const expandedRows = reactive(new Set())
const toggleExpand = (id) => {
  if (expandedRows.has(id)) {
    expandedRows.delete(id)
  } else {
    expandedRows.add(id)
  }
}

// 解析 insult_words JSON 数组字符串
const parseInsultWords = (raw) => {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const contentTypeMap = { 100: '作品', 200: '评论', 300: '合集', 400: '昵称' }
const contentTypeLabel = (t) => contentTypeMap[t] || `类型${t}`

const approvalMap = { 10: '正常', 20: '待审核', 30: '违规' }
const approvalLabel = (s) => approvalMap[s] || '未知'
const approvalBadgeClass = (s) => {
  if (s === 10) return 'ad-badge--active'
  if (s === 20) return 'ad-badge--pending'
  if (s === 30) return 'ad-badge--banned'
  return ''
}
</script>
