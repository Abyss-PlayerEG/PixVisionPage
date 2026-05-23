<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getWorkImageUrl, getAvatarUrl } from '@/config/api'
import { fetchWorkDetail, fetchCommentList, addComment, deleteComment, toggleLike, toggleStar, fetchLikeStatus, fetchStarStatus } from '@/api/workApi'
import { getCurrentUser } from '@/api/profileApi'
import { showSuccess, showError } from '@/utils/notification'
import { showConfirm } from '@/utils/confirmDialog'

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
const now = ref(Date.now())
let timeTimer = null

// 点赞/收藏状态
const liked = ref(false)
const starred = ref(false)
const likeCount = ref(0)
const starCount = ref(0)
const likePending = ref(false)
const starPending = ref(false)

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
  return { likeCount: likeCount.value, starCount: starCount.value, viewCount: workDetail.value.view_count || 0, createTime: workDetail.value.create_time || '' }
})

const handleBack = () => {
  if (window.history.length > 1) router.back()
  else router.push({ name: 'home' })
}

const goLogin = () => {
  router.push({ name: 'login', query: { redirect: route.fullPath } })
}

const goToProfile = (userId, username) => {
  if (currentUser.value && currentUser.value.user_id === userId) {
    router.push({ name: 'profileMe' })
  } else {
    router.push({ name: 'profileVisitor', params: { identifier: username || userId } })
  }
}

const handleSubmitComment = async () => {
  const text = newComment.value.trim()
  if (!text || commentSubmitting.value) return
  const id = Number(workId.value)
  if (!id) return
  commentSubmitting.value = true
  const result = await addComment({ workId: id, commentFloor: 1, commentText: text })
  if (result.success) { newComment.value = ''; await loadComments(); showSuccess(result.message || '评论发表成功') }
  else { showError(result.message || '评论发表失败') }
  commentSubmitting.value = false
}

const startReply = (comment, parentId, userId) => {
  replyingTo.value = {
    commentId: comment.comment_id,
    parentId: parentId !== undefined ? parentId : comment.comment_id,
    nickname: comment.nickname || '匿名用户',
    userId: userId,
  }
  replyText.value = ''
}

const cancelReply = () => {
  replyingTo.value = null
  replyText.value = ''
}

const handleToggleLike = async () => {
  const id = Number(workId.value)
  if (!id || likePending.value) return
  if (!currentUser.value) { goLogin(); return }
  likePending.value = true
  const result = await toggleLike(id)
  if (result.success && result.data !== undefined) {
    liked.value = result.data
    likeCount.value += result.data ? 1 : -1
  }
  likePending.value = false
}

const handleToggleStar = async () => {
  const id = Number(workId.value)
  if (!id || starPending.value) return
  if (!currentUser.value) { goLogin(); return }
  starPending.value = true
  const result = await toggleStar(id)
  if (result.success && result.data !== undefined) {
    starred.value = result.data
    starCount.value += result.data ? 1 : -1
  }
  starPending.value = false
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
    repliedUserId: replyingTo.value.userId || undefined,
  })
  if (result.success) {
    replyText.value = ''
    replyingTo.value = null
    await loadComments()
    showSuccess(result.message || '回复发表成功')
  } else {
    showError(result.message || '回复失败')
  }
  replySubmitting.value = false
}

const handleDeleteComment = async (commentId) => {
  const ok = await showConfirm({ title: '删除评论', message: '确定要删除这条评论吗？', yesText: '删除', noText: '取消', type: 'danger' })
  if (!ok) return
  const result = await deleteComment(commentId)
  if (result.success) {
    await loadComments()
    showSuccess(result.message || '评论已删除')
  } else {
    showError(result.message || '删除失败')
  }
}

const highlightComment = (commentId) => {
  const el = document.querySelector(`[data-comment-id="${commentId}"]`)
  if (!el) return
  // 清除上一次高亮的定时器，防止旧定时器截断新动画
  if (el._ht) { clearTimeout(el._ht); el._ht = null }
  el.classList.remove('wd-comment-highlight')
  // 强制重排使浏览器"忘记"动画状态，确保重新添加时动画从头播放
  void el.offsetWidth
  el.classList.add('wd-comment-highlight')
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  el._ht = setTimeout(() => {
    el.classList.remove('wd-comment-highlight')
    el._ht = null
  }, 1500)
}

const loadComments = async () => {
  const id = Number(workId.value)
  if (!id) return
  const result = await fetchCommentList(id, 'newest')
  if (result.success) comments.value = result.data
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  void now.value // 建立响应式依赖，定时器更新 now 时模板自动重算
  try {
    const date = new Date(timeStr)
    const diff = Date.now() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString('zh-CN')
  } catch { return timeStr }
}

onMounted(async () => {
  timeTimer = setInterval(() => { now.value = Date.now() }, 30000)
  const id = Number(workId.value)
  if (!id) { loading.value = false; return }
  const [detailResult, commentResult] = await Promise.all([fetchWorkDetail(id), fetchCommentList(id, 'newest')])
  if (detailResult.success) {
    workDetail.value = detailResult.data
    likeCount.value = detailResult.data.like_count || 0
    starCount.value = detailResult.data.star_count || 0
    publisher.value = { avatar: getAvatarUrl(''), displayName: '创作者 #' + detailResult.data.user_id, username: 'user_' + detailResult.data.user_id, bio: '暂无简介', works: 0, followers: 0, following: 0 }
  }
  if (commentResult.success) comments.value = commentResult.data
  // 初始化点赞/收藏状态（需登录）
  if (currentUser.value) {
    const [likeStatus, starStatus] = await Promise.all([fetchLikeStatus(id), fetchStarStatus(id)])
    if (likeStatus.success) liked.value = likeStatus.data
    if (starStatus.success) starred.value = starStatus.data
  }
  loading.value = false
})

onUnmounted(() => {
  if (timeTimer) { clearInterval(timeTimer); timeTimer = null }
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

        <div class="wd-work-info">
          <h1 class="wd-work-title">{{ workTitle }}</h1>
          <div class="wd-work-meta">
            <span v-if="workMeta.createTime">发布于 {{ formatTime(workMeta.createTime) }}</span>
            <span class="wd-meta-stat">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {{ workMeta.viewCount }}
            </span>
          </div>
        </div>

        <div class="wd-image-stage">
          <div v-if="loading" class="wd-loading">加载中...</div>
          <img v-else-if="workImgUrl" :src="workImgUrl" :alt="workTitle" />
          <div v-else class="wd-comments-empty">暂无作品图片</div>
        </div>

        <!-- 点赞收藏操作栏 -->
        <div class="wd-action-bar">
          <button class="wd-action-btn" :class="{ 'wd-action-btn--active': liked }" @click="handleToggleLike" :disabled="likePending">
            <svg viewBox="0 0 1024 1024" width="22" height="22"><path d="M885.9 533.7c16.8-22.2 26.1-49.4 26.1-77.7 0-44.9-25.1-87.4-65.5-111.1a67.67 67.67 0 0 0-34.3-9.3H572.4l6-122.9c1.4-29.7-9.1-57.9-29.5-79.4-20.5-21.5-48.1-33.4-77.9-33.4-52 0-98 35-111.8 85.1l-85.9 311h-0.3v428h472.3c9.2 0 18.2-1.8 26.5-5.4 47.6-20.3 78.3-66.8 78.3-118.4 0-12.6-1.8-25-5.4-37 16.8-22.2 26.1-49.4 26.1-77.7 0-12.6-1.8-25-5.4-37 16.8-22.2 26.1-49.4 26.1-77.7-0.2-12.6-2-25.1-5.6-37.1zM112 528v364c0 17.7 14.3 32 32 32h65V496h-65c-17.7 0-32 14.3-32 32z" fill="currentColor"/></svg>
            <span>{{ likeCount }}</span>
          </button>
          <button class="wd-action-btn" :class="{ 'wd-action-btn--active': starred }" @click="handleToggleStar" :disabled="starPending">
            <svg viewBox="0 0 1024 1024" width="22" height="22"><path d="M565.273 34.627L677.369 272.17c8.706 18.32 25.411 31.051 44.823 33.996l250.776 38.081c48.698 7.411 68.225 70.046 32.934 105.98L824.407 635.164c-13.998 14.23-20.352 34.815-17.059 54.935l42.82 261.127c8.346 50.696-42.643 89.452-86.226 65.519L539.634 893.474c-17.286-9.526-37.992-9.526-55.278 0l-224.314 123.27c-43.583 23.934-94.572-14.822-86.22-65.518L216.638 690.1c3.32-20.12-3.089-40.705-17.087-54.935L18.11 450.227c-35.285-35.934-15.818-98.574 32.934-105.98l250.75-38.081c19.35-2.94 36.082-15.675 44.756-33.996L458.673 34.627c21.825-46.168 84.836-46.168 106.6 0z" fill="currentColor"/></svg>
            <span>{{ starCount }}</span>
          </button>
        </div>

        <section class="wd-comments">
          <div class="wd-comments-header">
            <h2>评论</h2>
            <span class="wd-comments-count">{{ comments.length }} 条评论</span>
          </div>
          <div v-if="currentUser" class="wd-comment-input">
            <div class="wd-comment-avatar">
              <img :src="getAvatarUrl(currentUser.avatar_url || '')" alt="avatar" />
            </div>
            <div class="wd-comment-field">
              <textarea v-model="newComment" placeholder="写下你的想法..." maxlength="125"></textarea>
              <button class="wd-comment-submit" :disabled="commentSubmitting || !newComment.trim()" @click="handleSubmitComment">
                {{ commentSubmitting ? '发布中...' : '发布' }}
              </button>
            </div>
          </div>
          <div v-else class="wd-login-prompt">
            <p>登录后即可发表评论</p>
            <button class="wd-login-btn" @click="goLogin">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              登录 / 注册
            </button>
          </div>

          <div v-if="comments.length > 0" class="wd-comment-list">
            <div v-for="comment in comments" :key="comment.comment_id" class="wd-comment-item" :data-comment-id="comment.comment_id">
              <div class="wd-comment-avatar">
                <img :src="comment.avatarUrl || getAvatarUrl('')" alt="avatar" />
              </div>
              <div class="wd-comment-body">
                <p class="wd-comment-author"><span class="wd-author-link" @click.stop="goToProfile(comment.user_id, comment.username)">{{ comment.nickname || '匿名用户' }}</span></p>
                <p class="wd-comment-text">{{ comment.comment_text }}</p>
                <div class="wd-comment-actions">
                  <span class="wd-comment-time">{{ formatTime(comment.time) }}</span>
                  <button class="wd-comment-reply-btn" @click="startReply(comment)">回复</button>
                  <button v-if="currentUser && currentUser.user_id === comment.user_id" class="wd-comment-delete-btn" @click="handleDeleteComment(comment.comment_id)" title="删除">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
                <div v-if="comment.children && comment.children.length" class="wd-comment-replies">
                  <div v-for="reply in comment.children" :key="reply.comment_id" class="wd-comment-item wd-comment-reply" :data-comment-id="reply.comment_id">
                    <div class="wd-comment-avatar">
                      <img :src="reply.avatarUrl || getAvatarUrl('')" alt="avatar" />
                    </div>
                    <div class="wd-comment-body">
                      <p class="wd-comment-author"><span class="wd-author-link" @click.stop="goToProfile(reply.user_id, reply.username)">{{ reply.nickname || '匿名用户' }}</span></p>
                      <p class="wd-comment-text">
                        <span v-if="reply.replied_nickname && reply.parent_comment_id !== reply.in_comment_id" class="wd-reply-mention" @click.stop="highlightComment(reply.parent_comment_id)">@{{ reply.replied_nickname }}</span>
                        {{ reply.comment_text }}
                      </p>
                      <div class="wd-comment-actions">
                        <span class="wd-comment-time">{{ formatTime(reply.time) }}</span>
                        <button class="wd-comment-reply-btn" @click="startReply(reply, reply.comment_id, reply.replied_user_id)">回复</button>
                        <button v-if="currentUser && currentUser.user_id === reply.user_id" class="wd-comment-delete-btn" @click="handleDeleteComment(reply.comment_id)" title="删除">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </div>
                      <div v-if="replyingTo && replyingTo.commentId === reply.comment_id" class="wd-reply-input">
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
.wd-comment-reply { background: transparent; padding: 8px 10px; }
.wd-comment-reply:hover { background: transparent; }
.wd-comment-submit:disabled { opacity: 0.5; cursor: not-allowed; }

/* wd-work-meta 图标统计 */
.wd-meta-stat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #7e7e7e;
}

/* 点赞收藏操作栏 */
.wd-action-bar {
  display: flex;
  gap: 24px;
  padding: 20px 14px;
  border-radius: 10px;
}
.wd-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: none;
  background: transparent;
  color: #7e7e7e;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s, transform 0.15s;
}
.wd-action-btn:hover { color: #cecece; }
.wd-action-btn:active { transform: scale(0.95); }
.wd-action-btn:disabled { cursor: wait; }
.wd-action-btn--active { color: #4a9eff; }
.wd-action-btn--active:hover { color: #66c0ff; }

/* 未登录提示 */
.wd-login-prompt {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px 14px;
  margin-bottom: 24px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.wd-login-prompt p {
  font-size: 14px;
  color: #7e7e7e;
  margin: 0;
}
.wd-login-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 8px;
  border: none;
  background: #00A947;
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.wd-login-btn:hover { background: #00ce5a; }
.wd-login-btn:active { transform: scale(0.97); }

.wd-comment-reply-btn {
  padding: 0;
  border: none;
  background: transparent;
  color: #7e7e7e;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s;
}
.wd-comment-reply-btn:hover { color: #ffffff; }

.wd-comment-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.wd-comment-delete-btn {
  padding: 2px;
  border: none;
  background: transparent;
  color: #7e7e7e;
  cursor: pointer;
  transition: color 0.2s;
}
.wd-comment-delete-btn:hover { color: #ff5c5c; }
.wd-comment-delete-btn svg { width: 14px; height: 14px; display: block; }

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

.wd-reply-mention {
  color: #4a9eff;
  margin-right: 4px;
  cursor: pointer;
  transition: color 0.2s;
}
.wd-reply-mention:hover { color: #66c0ff; }

.wd-author-link {
  cursor: pointer;
  transition: color 0.2s, opacity 0.2s;
}
.wd-author-link:hover {
  color: #4a9eff;
  opacity: 0.85;
}

@keyframes wd-highlight-flash {
  0%, 100% { background-color: transparent; }
  50% { background-color: rgba(255, 243, 205, 0.15); }
}
.wd-comment-highlight {
  animation: wd-highlight-flash 0.9s ease-in-out;
  /* 覆盖 .wd-comment-item 的 transition: background，防止干扰动画 */
  transition: none !important;
}
</style>
