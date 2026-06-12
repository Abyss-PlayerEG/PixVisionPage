<template>
  <div class="cl-container">
    <!-- 头部操作栏 -->
    <div class="cl-header">
      <h3 class="cl-title">- Messages -</h3>
      <div class="cl-actions">
        <button class="cl-action-btn" @click="$emit('markAllRead')" :disabled="!hasPrivateUnread">
          全部已读
        </button>
      </div>
    </div>

    <!-- 会话列表 -->
    <div class="cl-list" ref="listRef" @scroll="handleScroll">
      <!-- PixBot 系统通知会话（固定在顶部） -->
      <div
        class="cl-item pixbot-item"
        :class="{ active: activeUserId === 'pixbot' }"
        @click="$emit('selectPixBot')"
      >
        <div class="cl-item-avatar pixbot-avatar">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#00A947" stroke-width="1.5">
            <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20z"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
            <line x1="9" y1="9" x2="9.01" y2="9" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="15" y1="9" x2="15.01" y2="9" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <span v-if="systemUnread > 0" class="cl-item-dot"></span>
        </div>
        <div class="cl-item-content">
          <div class="cl-item-top">
            <span class="cl-item-name pixbot-name">PixBot</span>
            <span v-if="systemUnread > 0" class="cl-item-badge">
              {{ systemUnread > 99 ? '99+' : systemUnread }}
            </span>
          </div>
          <div class="cl-item-bottom">
            <span class="cl-item-preview">系统通知、审核结果等</span>
          </div>
        </div>
      </div>

      <!-- 分隔线 -->
      <div class="cl-divider"></div>

      <!-- 加载状态 -->
      <div v-if="loading && conversations.length === 0" class="cl-loading">
        <div class="cl-loading-spinner"></div>
        <span>加载中...</span>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!loading && conversations.length === 0" class="cl-empty">
        <svg class="cl-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span>暂无私信</span>
      </div>

      <!-- 会话项列表 -->
      <div
        v-for="conv in conversations"
        :key="conv.other_user_id"
        class="cl-item"
        :class="{ active: activeUserId === conv.other_user_id, unread: conv.unread_count > 0 }"
        @click="$emit('select', conv)"
      >
        <div class="cl-item-avatar" @click.stop="goToProfile(conv)">
          <img :src="getAvatarUrl(conv.other_avatar_url)" :alt="conv.other_nickname" />
          <span v-if="conv.unread_count > 0" class="cl-item-dot"></span>
        </div>
        <div class="cl-item-content">
          <div class="cl-item-top">
            <span class="cl-item-name">{{ conv.other_nickname || '未知用户' }}</span>
            <span class="cl-item-time">{{ formatTime(conv.last_message_time) }}</span>
          </div>
          <div class="cl-item-bottom">
            <span class="cl-item-preview">{{ conv.last_message || '暂无消息' }}</span>
            <span v-if="conv.unread_count > 0" class="cl-item-badge">
              {{ conv.unread_count > 99 ? '99+' : conv.unread_count }}
            </span>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div v-if="loading && conversations.length > 0" class="cl-load-more">
        加载中...
      </div>
      <div v-else-if="finished && conversations.length > 0" class="cl-no-more">
        没有更多了
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAvatarUrl } from '@/config/api'

const router = useRouter()

const props = defineProps({
  conversations: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  finished: { type: Boolean, default: false },
  activeUserId: { type: [Number, String], default: null },
  hasPrivateUnread: { type: Boolean, default: false },
  systemUnread: { type: Number, default: 0 },
})

const emit = defineEmits(['select', 'selectPixBot', 'loadMore', 'markAllRead'])

const listRef = ref(null)

/**
 * 跳转到用户个人主页
 */
const goToProfile = (conv) => {
  if (conv.other_username) {
    router.push(`/profile/${conv.other_username}`)
  }
}

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
  return `${month}-${day}`
}
</script>

<style scoped>
.cl-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}

.cl-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.cl-title {
  font-family: sul-gbo4, sans-serif;
  font-size: 18px;
  color: #ffffff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cl-action-btn {
  background: rgba(0, 169, 71, 0.1);
  border: 1px solid rgba(0, 169, 71, 0.2);
  color: #00A947;
  font-size: 12px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.25s ease;
  font-family: '微软雅黑', sans-serif;
}

.cl-action-btn:hover:not(:disabled) {
  background: rgba(0, 169, 71, 0.2);
  border-color: rgba(0, 169, 71, 0.4);
}

.cl-action-btn:disabled {
  color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.06);
  cursor: not-allowed;
}

.cl-list {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.cl-list::-webkit-scrollbar {
  display: none;
}

/* 加载和空状态 */
.cl-loading,
.cl-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 16px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 13px;
  gap: 12px;
}

.cl-loading-spinner {
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

.cl-empty-icon {
  width: 40px;
  height: 40px;
  opacity: 0.3;
}

/* 会话项 */
.cl-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  gap: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  border-left: 3px solid transparent;
  margin: 0 8px;
  border-radius: 10px;
}

.cl-item:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateX(2px);
}

.cl-item.active {
  background: rgba(0, 169, 71, 0.15);
  border-left-color: #00A947;
}

.cl-item.unread .cl-item-name {
  color: #ffffff;
  font-weight: 600;
}

.cl-item.unread .cl-item-preview {
  color: rgba(255, 255, 255, 0.7);
}

.cl-item-avatar {
  position: relative;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  cursor: pointer;
}

.cl-item-avatar img {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  object-fit: cover;
  background: #2a2a2a;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: border-color 0.25s ease;
}

.cl-item:hover .cl-item-avatar img {
  border-color: rgba(255, 255, 255, 0.2);
}

.cl-item.active .cl-item-avatar img {
  border-color: #00A947;
}

.cl-item-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 12px;
  height: 12px;
  background: #e64d3c;
  border: 2px solid rgba(0, 0, 0, 0.85);
  border-radius: 50%;
}

.cl-item-content {
  flex: 1;
  min-width: 0;
}

.cl-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.cl-item-name {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cl-item-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  margin-left: 8px;
}

.cl-item-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cl-item-preview {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.cl-item-badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #e64d3c;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  line-height: 18px;
  text-align: center;
  border-radius: 999px;
  flex-shrink: 0;
  margin-left: 8px;
}

/* 底部提示 */
.cl-load-more,
.cl-no-more {
  text-align: center;
  padding: 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
}

/* PixBot 特殊样式 */
.pixbot-item {
  margin: 8px 8px 0;
  background: rgba(0, 169, 71, 0.05);
  border: 1px solid rgba(0, 169, 71, 0.1);
}

.pixbot-item:hover {
  background: rgba(0, 169, 71, 0.1);
  border-color: rgba(0, 169, 71, 0.2);
}

.pixbot-item.active {
  background: rgba(0, 169, 71, 0.15);
  border-color: rgba(0, 169, 71, 0.3);
}

.pixbot-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 169, 71, 0.1);
  border-radius: 10px;
  border: 2px solid rgba(0, 169, 71, 0.2);
}

.pixbot-name {
  color: #00A947;
  font-weight: 600;
}

/* 分隔线 */
.cl-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 8px 16px;
}
</style>
