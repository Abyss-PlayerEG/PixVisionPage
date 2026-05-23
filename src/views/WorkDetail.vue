<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getWorkImageUrl, getAvatarUrl } from '@/config/api'
import { fetchWorkDetail, fetchCommentList, addComment, deleteComment } from '@/api/workApi'
import { getCurrentUser } from '@/api/profileApi'
import { showSuccess, showError } from '@/utils/notification'

const route = useRoute()
const router = useRouter()
const workId = computed(() => route.params.id)

const loading = ref(true)
const commentSubmitting = ref(false)
const workDetail = ref(null)
const publisher = ref({ avatar: getAvatarUrl(''), displayName: '加载中...', username: '', bio: '', works: 0, followers: 0, following: 0 })
const comments = ref([])
const newComment = ref('')
const currentUser = ref(getCurrentUser())

// 回复状态
const replyingTo = ref(null)
const replyText = ref('')
const replySubmitting = ref(false)

const workTitle = computed(() => workDetail.value?.work_title || route.query.title || '未命名作品')
const workImgUrl = computed(() => {
  if (workDetail.value) return getWorkImageUrl(workDetail.value.img_url || '')
  if (route.query.img) return route.query.img
  if (route.query.filePath) return getWorkImageUrl(route.query.filePath)
  return ''
})
const workMeta = computed(() => {
  if (!workDetail.value) return {}
  return { likeCount: workDetail.value.like_count || 0, starCount: workDetail.value.star_count || 0, viewCount: workDetail.value.view_count || 0, createTime: workDetail.value.create_time || '' }
})

const handleBack = () => {
  if (window.history.length > 1) router.back()
  else router.push({ name: 'home' })
}

const handleSubmitComment = async () => {
  const text = newComment.value.trim()
  if (!text || commentSubmitting.value) return
  const id = Number(workId.value)
  if (!id) return
  commentSubmitting.value = true
  const result = await addComment({ workId: id, commentFloor: 1, commentText: text })
  if (result.success) { newComment.value = ''; await loadComments(); showSuccess('评论发表成功') }
  else { showError(result.message || '评论发表失败') }
  commentSubmitting.value = false
}

const startReply = (comment, parentId) => {
  replyingTo.value = {
    commentId: comment.comment_id,
    parentId: parentId !== undefined ? parentId : comment.comment_id,
    nickname: comment.nickname || '匿名用户',
  }
  replyText.value = ''
}

const cancelReply = () => {
  replyingTo.value = null
  replyText.value = ''
}

const handleSubmitReply = async () => {
  const text = replyText.value.trim()
  if (!text || replySubmitting.value || !replyingTo.value) return
  const id = Number(workId.value)
  if (!id) return
  replySubmitting.value = true
  const result = await addComment({
    workId: id,
    commentFloor: 2,
    commentText: text,
    parentCommentId: replyingTo.value.parentId,
  })
  if (result.success) {
    replyText.value = ''
    replyingTo.value = null
    await loadComments()
    showSuccess('回复发表成功')
  } else {
    showError(result.message || '回复失败')
  }
  replySubmitting.value = false
}

const handleDeleteComment = async (commentId) => {
  if (!confirm('确定要删除这条评论吗？')) return
  const result = await deleteComment(commentId)
  if (result.success) {
    await loadComments()
    showSuccess('评论已删除')
  } else {
    showError(result.message || '删除失败')
  }
}

const loadComments = async () => {
  const id = Number(workId.value)
  if (!id) return
  const result = await fetchCommentList(id, 'newest')
  if (result.success) comments.value = result.data
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  try {
    const date = new Date(timeStr)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes} 分钟前`
    if (hours < 24) return `${hours} 小时前`
    if (days < 30) return `${days} 天前`
    return date.toLocaleDateString('zh-CN')
  } catch { return timeStr }
}

onMounted(async () => {
  const id = Number(workId.value)
  if (!id) { loading.value = false; return }
  const [detailResult, commentResult] = await Promise.all([fetchWorkDetail(id), fetchCommentList(id, 'newest')])
  if (detailResult.success) {
    workDetail.value = detailResult.data
    publisher.value = { avatar: getAvatarUrl(''), displayName: '创作者 #' + detailResult.data.user_id, username: 'user_' + detailResult.data.user_id, bio: '暂无简介', works: 0, followers: 0, following: 0 }
  }
  if (commentResult.success) comments.value = commentResult.data
  loading.value = false
})
</script>

<template>
  <div class="work-detail">
    <div class="wd-topbar">
      <button class="wd-back-btn" @click="handleBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        返回
      </button>
    </div>

    <div class="wd-container">
      <main class="wd-main">
        <div class="wd-image-stage">
          <div v-if="loading" class="wd-loading">加载中...</div>
          <img v-else-if="workImgUrl" :src="workImgUrl" :alt="workTitle" />
          <div v-else class="wd-comments-empty">暂无作品图片</div>
        </div>

        <div class="wd-work-info">
          <h1 class="wd-work-title">{{ workTitle }}</h1>
          <div class="wd-work-meta">
            <span>{{ workMeta.likeCount }} 赞</span>
            <span>{{ workMeta.starCount }} 收藏</span>
            <span>{{ workMeta.viewCount }} 浏览</span>
            <span v-if="workMeta.createTime">发布于 {{ formatTime(workMeta.createTime) }}</span>
          </div>
        </div>

        <!-- 手机端发布者卡片 -->
        <div class="wd-mobile-publisher">
          <div class="publisher-card">
            <div class="publisher-header">
              <div class="publisher-avatar">
                <img :src="publisher.avatar" alt="publisher avatar" />
              </div>
              <div>
                <p class="publisher-name">{{ publisher.displayName }}</p>
                <p class="publisher-username">@{{ publisher.username }}</p>
              </div>
            </div>
            <div class="publisher-stats">
              <div class="publisher-stat"><div class="publisher-stat-value">{{ publisher.works }}</div><div class="publisher-stat-label">作品</div></div>
              <div class="publisher-stat"><div class="publisher-stat-value">{{ publisher.followers.toLocaleString() }}</div><div class="publisher-stat-label">粉丝</div></div>
              <div class="publisher-stat"><div class="publisher-stat-value">{{ publisher.following }}</div><div class="publisher-stat-label">关注</div></div>
            </div>
            <button class="publisher-follow">关注</button>
            <p class="publisher-bio">{{ publisher.bio }}</p>
            <div class="publisher-contact">
              <div class="publisher-contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
                联系邮箱
              </div>
              <div class="publisher-contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                所在地
              </div>
            </div>
          </div>
        </div>

        <section class="wd-comments">
          <div class="wd-comments-header">
            <h2>评论</h2>
            <span class="wd-comments-count">{{ comments.length }} 条评论</span>
          </div>
          <div class="wd-comment-input">
            <div class="wd-comment-avatar">
              <img :src="currentUser ? getAvatarUrl(currentUser.avatar_url || '') : getAvatarUrl('')" alt="avatar" />
            </div>
            <div class="wd-comment-field">
              <textarea v-model="newComment" placeholder="写下你的想法..." maxlength="125"></textarea>
              <button class="wd-comment-submit" :disabled="commentSubmitting || !newComment.trim()" @click="handleSubmitComment">
                {{ commentSubmitting ? '发布中...' : '发布' }}
              </button>
            </div>
          </div>

          <div v-if="comments.length > 0" class="wd-comment-list">
            <div v-for="comment in comments" :key="comment.comment_id" class="wd-comment-item">
              <div class="wd-comment-avatar">
                <img :src="comment.avatarUrl || getAvatarUrl('')" alt="avatar" />
              </div>
              <div class="wd-comment-body">
                <p class="wd-comment-author">{{ comment.nickname || '匿名用户' }}</p>
                <p class="wd-comment-text">{{ comment.comment_text }}</p>
                <span class="wd-comment-time">{{ formatTime(comment.time) }}</span>
                <button class="wd-comment-reply-btn" @click="startReply(comment)">回复</button>
                <button v-if="currentUser && currentUser.user_id === comment.user_id" class="wd-comment-delete-btn" @click="handleDeleteComment(comment.comment_id)" title="删除">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
                <div v-if="comment.children && comment.children.length" class="wd-comment-replies">
                  <div v-for="reply in comment.children" :key="reply.comment_id" class="wd-comment-item wd-comment-reply">
                    <div class="wd-comment-avatar">
                      <img :src="reply.avatarUrl || getAvatarUrl('')" alt="avatar" />
                    </div>
                    <div class="wd-comment-body">
                      <p class="wd-comment-author">{{ reply.nickname || '匿名用户' }}</p>
                      <p class="wd-comment-text">{{ reply.comment_text }}</p>
                      <span class="wd-comment-time">{{ formatTime(reply.time) }}</span>
                      <button class="wd-comment-reply-btn" @click="startReply(reply, comment.comment_id)">回复</button>
                      <button v-if="currentUser && currentUser.user_id === reply.user_id" class="wd-comment-delete-btn" @click="handleDeleteComment(reply.comment_id)" title="删除">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div v-if="replyingTo && replyingTo.commentId === comment.comment_id" class="wd-reply-input">
                  <div class="wd-comment-avatar">
                    <img :src="currentUser ? getAvatarUrl(currentUser.avatar_url || '') : getAvatarUrl('')" alt="avatar" />
                  </div>
                  <div class="wd-comment-field">
                    <p class="wd-reply-to">回复 @{{ replyingTo.nickname }}</p>
                    <textarea v-model="replyText" placeholder="写下你的回复..." maxlength="125"></textarea>
                    <div class="wd-reply-actions">
                      <button class="wd-reply-cancel" @click="cancelReply">取消</button>
                      <button class="wd-comment-submit" :disabled="replySubmitting || !replyText.trim()" @click="handleSubmitReply">
                        {{ replySubmitting ? '发布中...' : '回复' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="!loading" class="wd-comments-empty">暂无评论，来抢沙发吧</div>
        </section>
      </main>

      <aside class="wd-sidebar">
        <div class="publisher-card">
          <div class="publisher-header">
            <div class="publisher-avatar">
              <img :src="publisher.avatar" alt="publisher avatar" />
            </div>
            <div>
              <p class="publisher-name">{{ publisher.displayName }}</p>
              <p class="publisher-username">@{{ publisher.username }}</p>
            </div>
          </div>
          <div class="publisher-stats">
            <div class="publisher-stat"><div class="publisher-stat-value">{{ publisher.works }}</div><div class="publisher-stat-label">作品</div></div>
            <div class="publisher-stat"><div class="publisher-stat-value">{{ publisher.followers.toLocaleString() }}</div><div class="publisher-stat-label">粉丝</div></div>
            <div class="publisher-stat"><div class="publisher-stat-value">{{ publisher.following }}</div><div class="publisher-stat-label">关注</div></div>
          </div>
          <button class="publisher-follow">关注</button>
          <p class="publisher-bio">{{ publisher.bio }}</p>
          <div class="publisher-contact">
            <div class="publisher-contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
              联系邮箱
            </div>
            <div class="publisher-contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              所在地
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style>
@import url(../assets/CSS/workDetail.css);

.wd-loading { display: flex; align-items: center; justify-content: center; min-height: 300px; color: #7e7e7e; font-size: 14px; }
.wd-comment-replies { margin-top: 12px; padding-left: 12px; border-left: 1px solid rgba(255, 255, 255, 0.06); }
.wd-comment-reply { background: transparent; padding: 8px 0; }
.wd-comment-reply:hover { background: transparent; }
.wd-comment-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.wd-comment-reply-btn {
  margin-top: 4px;
  padding: 0;
  border: none;
  background: transparent;
  color: #7e7e7e;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s;
}
.wd-comment-reply-btn:hover { color: #ffffff; }

.wd-comment-delete-btn {
  margin-top: 4px;
  margin-left: 4px;
  padding: 2px;
  border: none;
  background: transparent;
  color: #7e7e7e;
  cursor: pointer;
  transition: color 0.2s;
}
.wd-comment-delete-btn:hover { color: #ff5c5c; }
.wd-comment-delete-btn svg { width: 14px; height: 14px; }

.wd-reply-input {
  margin-top: 12px;
  display: flex;
  gap: 12px;
}
.wd-reply-to {
  font-size: 12px;
  color: #7e7e7e;
  margin: 0 0 4px;
}
.wd-reply-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.wd-reply-cancel {
  padding: 7px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: #cecece;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.wd-reply-cancel:hover { background: rgba(255, 255, 255, 0.05); }
</style>
