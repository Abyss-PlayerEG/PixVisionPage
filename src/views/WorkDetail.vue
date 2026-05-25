<script setup>
import { getAvatarUrl } from '@/config/api'
import { useWorkDetail } from '@/composables/useWorkDetail'

const {
  // 基础状态
  loading, initialLoading, commentSubmitting,
  workDetail, publisher, comments,
  newComment, currentUser,
  // 点赞/收藏
  liked, starred, likeCount, starCount,
  likePending, starPending, downloadPending,
  // 导航
  navLoading,
  randomLoading,
  // 回复
  replyingTo, replyText, replySubmitting,
  // 计算属性
  workTitle, workImgUrl, workMeta,
  // 方法
  handleBack,
  goLogin,
  goToProfile,
  handleContactClick,
  handleSubmitComment,
  startReply, cancelReply,
  handleSubmitReply,
  handleDeleteComment,
  loadComments,
  highlightComment,
  formatTime,
  handleToggleLike,
  handleToggleStar,
  handleDownload,
  goToPrevWork,
  goToNextWork,
  goToRandomWork,
} = useWorkDetail()
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
          <div v-if="workImgUrl" class="wd-stage-blur" :style="{ backgroundImage: 'url(' + workImgUrl + ')' }"></div>
          <div v-if="loading" class="wd-loading">加载中...</div>
          <img v-else-if="workImgUrl" :src="workImgUrl" :alt="workTitle" />
          <div v-else class="wd-comments-empty">暂无作品图片</div>
        </div>

        <!-- 作品导航 -->
        <div class="wd-work-nav">
          <button class="wd-nav-btn" @click="goToPrevWork" :disabled="navLoading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            <span>上一个</span>
          </button>
          <button class="wd-nav-btn wd-nav-random" @click="goToRandomWork" :disabled="randomLoading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" ry="3"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="16" cy="16" r="1.5" fill="currentColor"/></svg>
            <span>随机</span>
          </button>
          <button class="wd-nav-btn" @click="goToNextWork" :disabled="navLoading">
            <span>下一个</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <!-- 点赞收藏操作栏 -->
        <div class="wd-action-bar">
          <button class="wd-action-btn" :class="{ 'wd-action-btn--active': liked }" @click="handleToggleLike" :disabled="likePending">
            <svg viewBox="0 0 1024 1024" width="22" height="22"><path d="M885.9 533.7c16.8-22.2 26.1-49.4 26.1-77.7 0-44.9-25.1-87.4-65.5-111.1a67.67 67.67 0 0 0-34.3-9.3H572.4l6-122.9c1.4-29.7-9.1-57.9-29.5-79.4-20.5-21.5-48.1-33.4-77.9-33.4-52 0-98 35-111.8 85.1l-85.9 311h-0.3v428h472.3c9.2 0 18.2-1.8 26.5-5.4 47.6-20.3 78.3-66.8 78.3-118.4 0-12.6-1.8-25-5.4-37 16.8-22.2 26.1-49.4 26.1-77.7-0.2-12.6-2-25.1-5.6-37.1zM112 528v364c0 17.7 14.3 32 32 32h65V496h-65c-17.7 0-32 14.3-32 32z" fill="currentColor"/></svg>
            <span>{{ likeCount }}</span>
          </button>
          <button class="wd-action-btn" :class="{ 'wd-action-btn--active': starred }" @click="handleToggleStar" :disabled="starPending">
            <svg viewBox="0 0 1024 1024" width="22" height="22"><path d="M565.273 34.627L677.369 272.17c8.706 18.32 25.411 31.051 44.823 33.996l250.776 38.081c48.698 7.411 68.225 70.046 32.934 105.98L824.407 635.164c-13.998 14.23-20.352 34.815-17.059 54.935l42.82 261.127c8.346 50.696-42.643 89.452-86.226 65.519L539.634 893.474c-17.286-9.526-37.992-9.526-55.278 0l-224.314 123.27c-43.583 23.934-94.572-14.822-86.22-65.518L216.638 690.1c3.32-20.12-3.089-40.705-17.087-54.935L18.11 450.227c-35.285-35.934-15.818-98.574 32.934-105.98l250.75-38.081c19.35-2.94 36.082-15.675 44.756-33.996L458.673 34.627c21.825-46.168 84.836-46.168 106.6 0z" fill="currentColor"/></svg>
            <span>{{ starCount }}</span>
          </button>
          <button class="wd-action-btn wd-download-btn" @click="handleDownload" :disabled="downloadPending">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
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
          <div class="publisher-header" @click="goToProfile(workDetail?.user_id, publisher.username)" style="cursor: pointer;">
            <div class="publisher-avatar">
              <img :src="publisher.avatar" alt="publisher avatar" />
            </div>
            <div>
              <p class="publisher-name">{{ publisher.displayName }}</p>
              <p class="publisher-username">@{{ publisher.username }}</p>
            </div>
          </div>
          <div class="publisher-stats">
            <div class="publisher-stat" title="作品">
              <svg class="publisher-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              <div class="publisher-stat-value">{{ publisher.works }}</div>
            </div>
            <div class="publisher-stat" title="浏览">
              <svg class="publisher-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <div class="publisher-stat-value">{{ publisher.totalViews }}</div>
            </div>
            <div class="publisher-stat" title="点赞">
              <svg class="publisher-stat-icon" viewBox="0 0 1024 1024" fill="currentColor"><path d="M98.72 511.552l-32-0.256 32 0.256zM96 868.128l32 0.256-32-0.256z m723.008 13.344l-31.008-7.936-0.128 0.48-0.096 0.512 31.232 6.944z m108.832-425.152l31.04 7.936 0.096-0.48 0.128-0.512-31.264-6.944z m-283.456-134.112l31.424 6.176-31.424-6.176z m30.688-155.264l-31.392-6.208 31.392 6.208z m-121.312-41.472l27.232 16.8 0.224-0.32 0.192-0.32-27.648-16.16zM130.72 511.808a27.424 27.424 0 0 1 27.424-27.232v-64a91.424 91.424 0 0 0-91.424 90.72l64 0.512zM128 868.352l2.72-356.544-64-0.512L64 867.872l64 0.48z m27.424 27.648A27.424 27.424 0 0 1 128 868.384l-64-0.512A91.424 91.424 0 0 0 155.424 960v-64zM352 896H155.424v64H352v-64zM158.144 484.576H352v-64H158.144v64zM761.024 896H352v64h408.992v-64z m26.752-21.472a27.424 27.424 0 0 1-26.784 21.472v64c42.88 0 79.968-29.76 89.28-71.584l-62.496-13.888z m109.088-426.144l-108.864 425.152 62.016 15.872 108.832-425.152-61.984-15.872zM869.856 416c17.536 0 30.56 16.256 26.752 33.376l62.496 13.888A91.424 91.424 0 0 0 869.824 352v64zM704 416h165.856v-64H704v64z m-90.976-100c-5.728 28.896 3.136 55.296 22.08 73.76 18.112 17.696 43.392 26.24 68.896 26.24v-64c-11.936 0-20.096-4-24.224-8-3.328-3.264-5.536-7.776-3.968-15.616l-62.784-12.384z m30.656-155.264l-30.656 155.264 62.784 12.384 30.656-155.232-62.784-12.416zM616.8 128c17.28 0 30.24 15.776 26.88 32.736l62.784 12.416A91.424 91.424 0 0 0 616.768 64v64z m-11.712 0h11.68V64h-11.68v64z m-23.68 13.6a27.456 27.456 0 0 1 23.68-13.6V64c-32.512 0-62.592 17.28-78.976 45.344l55.296 32.256zM379.2 469.376l201.76-327.104-54.464-33.6-201.76 327.104 54.464 33.6zM384 928V452.576h-64V928h64z"/></svg>
              <div class="publisher-stat-value">{{ publisher.totalLikes }}</div>
            </div>
            <div class="publisher-stat" title="收藏">
              <svg class="publisher-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <div class="publisher-stat-value">{{ publisher.totalStars }}</div>
            </div>
          </div>
          <p v-if="publisher.bio" class="publisher-bio">{{ publisher.bio }}</p>
          <div v-if="publisher.contactItems.length > 0" class="publisher-contact">
            <div v-for="item in publisher.contactItems" :key="item.name" class="publisher-contact-item" @click="handleContactClick(item)" :title="item.name === 'Bilibili' ? '点击跳转B站主页' : '点击复制' + item.name">
              <svg v-if="item.name === '电话'" class="publisher-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <svg v-else-if="item.name === '邮箱'" class="publisher-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <svg v-else-if="item.name === 'QQ'" class="publisher-contact-icon" viewBox="0 0 1024 1024" fill="currentColor"><path d="M512 188.384c194.752 0 204.64 173.984 215.36 208.256 0 0 15.36 17.12 19.008 43.232 2.368 16.864-7.232 36-7.232 36s62.24 83.872 62.24 149.76c0 41.12-12.128 62.368-26.24 62.368-14.272 0-35.008-43.52-35.008-43.52s-32.512 69.408-48.768 79.392c-16.224 9.888 58.624 20.768 58.624 53.12 0 32.512-59.488 46.88-108.096 46.88-48.768 0-126.272-25.248-126.272-25.248l-28-0.864s-21.6 30.624-110.88 30.624c-89.248 0-128-24.256-128-53.12 0-38.88 56.896-44.16 56.896-44.16s-36.256-10.112-66.88-95.84c0 0-21.248 46.24-51.264 46.24 0 0-12.608-7.52-12.608-49.6 0-87.168 62.624-129.664 89.6-155.776 0 0-4.48-11.392-2.112-25.504 2.624-15.744 12-25.248 12-25.248s-3.52-18.88 9.632-34.112c2.624-42.4 33.28-202.88 228-202.88m0-64c-204.736 0-277.376 146.88-290.24 245.376-6.144 12-9.632 24.352-11.008 36a112.64 112.64 0 0 0-12.768 44.256c-35.488 32.608-87.104 88.224-87.104 181.856 0 64.992 23.872 92.768 44 104.64l15.008 8.96H189.12c-2.88 9.152-4.384 19.04-4.384 29.76 0 27.52 13.888 117.28 192 117.28 65.28 0 106.016-14.144 131.008-29.248 26.24 7.872 87.616 24.64 134.016 24.64 104.64 0 172.256-43.52 172.256-110.912 0-12-2.4-22.624-6.272-32.128 30.88-13.984 57.504-50.112 57.504-119.232 0-60.64-33.504-124.256-56.256-160.512 1.76-10.368 2.368-21.984 0.768-33.984a154.56 154.56 0 0 0-23.136-61.632l-0.736-3.744C752.384 205.504 660.128 124.384 512 124.384z"/></svg>
              <svg v-else-if="item.name === '微信'" class="publisher-contact-icon" viewBox="0 0 1024 1024" fill="currentColor"><path d="M767.818667 409.173333C867.338667 444.266667 938.666667 539.136 938.666667 650.666667c0 42.709333-10.496 83.978667-30.261334 120.842666-1.792 3.338667-4.992 8.928-9.696 16.96l14.613334 53.557334c6.506667 23.893333-15.402667 45.813333-39.296 39.296l-53.642667-14.634667-6.229333 3.669333A254.933333 254.933333 0 0 1 682.666667 906.666667c-77.994667 0-147.84-34.88-194.805334-89.888a352.608 352.608 0 0 1-56.64 4.554666c-63.338667 0-124.266667-16.853333-177.472-48.298666-1.834667-1.088-6.410667-3.733333-13.632-7.893334l-80.544 21.653334c-23.914667 6.432-45.76-15.573333-39.146666-39.434667l21.792-78.752a961.205333 961.205333 0 0 1-15.904-27.317333A336.384 336.384 0 0 1 85.333333 480c0-188.618667 154.965333-341.333333 345.888-341.333333 159.914667 0 297.984 108.010667 335.818667 259.296 0.949333 3.765333 1.173333 7.552 0.778667 11.2z m-68.106667-13.952C662.88 282.037333 555.178667 202.666667 431.221333 202.666667 275.434667 202.666667 149.333333 326.933333 149.333333 480c0 46.272 11.498667 90.837333 33.194667 130.698667 2.88 5.290667 10.176 17.706667 21.621333 36.746666a32 32 0 0 1 3.413334 25.013334l-10.517334 37.994666 39.232-10.549333a32 32 0 0 1 24.234667 3.146667c14.272 8.192 22.773333 13.098667 25.802667 14.890666A283.882667 283.882667 0 0 0 431.221333 757.333333c6.154667 0 12.288-0.192 18.389334-0.576A255.061333 255.061333 0 0 1 426.666667 650.666667c0-141.386667 114.613333-256 256-256 5.728 0 11.413333 0.192 17.045333 0.554666z m133.706667 397.056a32 32 0 0 1 3.338666-24.725333 996.672 996.672 0 0 0 15.242667-26.293333A190.997333 190.997333 0 0 0 874.666667 650.666667c0-106.037333-85.962667-192-192-192s-192 85.962667-192 192 85.962667 192 192 192a190.933333 190.933333 0 0 0 98.570666-27.2c2.208-1.322667 8.288-4.874667 18.517334-10.837334a32 32 0 0 1 24.522666-3.210666l12.565334 3.424-3.424-12.565334zM330.666667 426.666667a42.666667 42.666667 0 1 1 0-85.333334 42.666667 42.666667 0 0 1 0 85.333334z m192 0a42.666667 42.666667 0 1 1 0-85.333334 42.666667 42.666667 0 0 1 0 85.333334z m85.333333 202.666666a32 32 0 1 1 0-64 32 32 0 0 1 0 64z m149.333333 0a32 32 0 1 1 0-64 32 32 0 0 1 0 64z"/></svg>
              <svg v-else-if="item.name === 'Bilibili'" class="publisher-contact-icon" viewBox="0 0 1024 1024" fill="currentColor"><path d="M777.514667 131.669333a53.333333 53.333333 0 0 1 0 75.434667L728.746667 255.829333h49.92A160 160 0 0 1 938.666667 415.872v320a160 160 0 0 1-160 160H245.333333A160 160 0 0 1 85.333333 735.872v-320a160 160 0 0 1 160-160h49.749334L246.4 207.146667a53.333333 53.333333 0 1 1 75.392-75.434667l113.152 113.152c3.370667 3.370667 6.186667 7.04 8.448 10.965333h137.088c2.261333-3.925333 5.12-7.68 8.490667-11.008l113.109333-113.152a53.333333 53.333333 0 0 1 75.434667 0z m1.152 231.253334H245.333333a53.333333 53.333333 0 0 0-53.205333 49.365333l-0.128 4.010667v320c0 28.117333 21.76 51.157333 49.365333 53.162666l3.968 0.170667h533.333334a53.333333 53.333333 0 0 0 53.205333-49.365333l0.128-3.968v-320c0-29.44-23.893333-53.333333-53.333333-53.333334z m-426.666667 106.666666c29.44 0 53.333333 23.893333 53.333333 53.333334v53.333333a53.333333 53.333333 0 1 1-106.666666 0v-53.333333c0-29.44 23.893333-53.333333 53.333333-53.333334z m320 0c29.44 0 53.333333 23.893333 53.333333 53.333334v53.333333a53.333333 53.333333 0 1 1-106.666666 0v-53.333333c0-29.44 23.893333-53.333333 53.333333-53.333334z"/></svg>
              <svg v-else class="publisher-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              <span>{{ item.content }}</span>
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

/* 下载按钮推到右侧 */
.wd-download-btn {
  margin-left: auto;
}

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
