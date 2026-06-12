<template>
  <div class="sn-container">
    <!-- 头部操作栏 -->
    <div class="sn-header">
      <h3 class="sn-title">系统通知</h3>
      <div class="sn-actions">
        <!-- 筛选下拉 -->
        <select class="sn-filter" v-model="filterProject" @change="$emit('filter', filterProject)">
          <option value="">全部类型</option>
          <option value="work_audit">作品审核</option>
          <option value="like">点赞</option>
          <option value="star">收藏</option>
          <option value="comment">评论</option>
        </select>
      </div>
    </div>

    <!-- 通知列表 -->
    <div class="sn-list" ref="listRef" @scroll="handleScroll">
      <!-- 加载状态 -->
      <div v-if="loading && messages.length === 0" class="sn-loading">
        <div class="sn-loading-spinner"></div>
        <span>加载中...</span>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!loading && messages.length === 0" class="sn-empty">
        <svg class="sn-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span>暂无通知</span>
      </div>

      <!-- 通知项 -->
      <div
        v-for="msg in messages"
        :key="msg.message_id"
        class="sn-item"
        :class="{ unread: !msg.is_read }"
      >
        <div class="sn-item-header">
          <span class="sn-item-project">{{ getProjectLabel(msg.project) }}</span>
          <span class="sn-item-time">{{ formatTime(msg.create_time) }}</span>
        </div>
        <div class="sn-item-content">{{ msg.message }}</div>
      </div>

      <!-- 加载更多 -->
      <div v-if="loading && messages.length > 0" class="sn-load-more">
        加载中...
      </div>
      <div v-else-if="finished && messages.length > 0" class="sn-no-more">
        没有更多了
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  messages: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  finished: { type: Boolean, default: false },
})

const emit = defineEmits(['loadMore', 'filter'])

const listRef = ref(null)
const filterProject = ref('')

/**
 * 滚动到底部时加载更多
 */
const handleScroll = () => {
  const el = listRef.value
  if (!el || props.loading || props.finished) return

  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
    emit('loadMore')
  }
}

/**
 * 获取消息主题标签
 */
const getProjectLabel = (project) => {
  const labels = {
    work_audit: '作品审核',
    like: '点赞',
    star: '收藏',
    comment: '评论',
    system: '系统',
  }
  return labels[project] || project || '通知'
}

/**
 * 格式化时间
 */
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  if (date.getFullYear() === now.getFullYear()) {
    return `${month}-${day} ${hours}:${minutes}`
  }

  return `${date.getFullYear()}-${month}-${day}`
}
</script>

<style scoped>
.sn-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0d0d0d;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}

.sn-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.sn-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.sn-filter {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  padding: 4px 8px;
  cursor: pointer;
  outline: none;
}

.sn-filter:focus {
  border-color: #00A947;
}

.sn-filter option {
  background: #1a1a1a;
  color: #ffffff;
}

.sn-list {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.sn-list::-webkit-scrollbar {
  display: none;
}

/* 加载和空状态 */
.sn-loading,
.sn-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 16px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 13px;
  gap: 12px;
}

.sn-loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: #00A947;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.sn-empty-icon {
  width: 40px;
  height: 40px;
  opacity: 0.3;
}

/* 通知项 */
.sn-item {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  border-left: 3px solid transparent;
  transition: all 0.2s;
}

.sn-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.sn-item.unread {
  border-left-color: #00A947;
  background: rgba(0, 169, 71, 0.03);
}

.sn-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.sn-item-project {
  display: inline-block;
  font-size: 11px;
  color: #00A947;
  background: rgba(0, 169, 71, 0.1);
  padding: 2px 8px;
  border-radius: 3px;
  font-weight: 500;
}

.sn-item-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
}

.sn-item-content {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

/* 底部提示 */
.sn-load-more,
.sn-no-more {
  text-align: center;
  padding: 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
}
</style>
