<template>
  <div>
    <div class="ad-table-header">
      <h3 class="ad-table-title">评论管理<span class="ad-table-count">（共 {{ commentTotal }} 条）</span></h3>
      <div class="ad-search-box">
        <input
          :value="commentKeyword"
          class="ad-search-input"
          placeholder="搜索评论内容..."
          @input="$emit('update:commentKeyword', $event.target.value)"
          @keyup.enter="$emit('search')"
        />
        <button class="ad-search-btn" @click="$emit('search')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </button>
      </div>
    </div>

    <div v-if="commentLoading && commentList.length === 0" class="ad-table-skeleton">
      <div v-for="n in 8" :key="n" class="ad-table-skeleton-row"></div>
    </div>
    <div v-else-if="!commentLoading && commentList.length === 0" class="ad-empty">暂无评论数据</div>
    <div v-else class="ad-table-wrap">
      <table class="ad-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>评论内容</th>
            <th>评论者</th>
            <th>关联作品</th>
            <th>时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="comment in commentList" :key="comment.comment_id">
            <td class="ad-cell-id">#{{ comment.comment_id }}</td>
            <td class="ad-cell-text">{{ comment.comment_text || comment.content || '—' }}</td>
            <td>{{ comment.nickname || comment.username || '匿名' }}</td>
            <td class="ad-cell-title">{{ comment.work_title || `作品 #${comment.work_id}` }}</td>
            <td>{{ formatTime(comment.create_time) }}</td>
            <td>
              <div class="ad-actions">
                <button class="ad-action-btn ad-action-btn--danger" @click="$emit('deleteComment', comment)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="ad-load-more">
      <div v-if="commentLoading" class="ad-loading-spinner">
        <svg class="ad-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32" stroke-linecap="round"><animate attributeName="stroke-dashoffset" values="32;0" dur="0.8s" repeatCount="indefinite"/></circle></svg>
        加载中...
      </div>
      <button v-else-if="hasMore" class="ad-load-more-btn" @click="$emit('loadMore')">加载更多</button>
      <span v-else-if="commentList.length > 0" class="ad-empty" style="padding: 12px 0;">— 已加载全部 —</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  commentList: { type: Array, required: true },
  commentLoading: { type: Boolean, required: true },
  commentKeyword: { type: String, default: '' },
  commentTotal: { type: Number, default: 0 },
  hasMore: { type: Boolean, default: false },
  formatTime: { type: Function, required: true },
})
defineEmits(['update:commentKeyword', 'search', 'loadMore', 'deleteComment'])
</script>
