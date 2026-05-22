<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getWorkImageUrl, getAvatarUrl } from '@/config/api'

const route = useRoute()
const router = useRouter()

const workId = computed(() => route.params.id)
const workTitle = computed(() => route.query.title || '未命名作品')
const workImgUrl = computed(() => {
  if (route.query.img) return route.query.img
  if (route.query.filePath) return getWorkImageUrl(route.query.filePath)
  return ''
})

const publisher = ref({
  avatar: '',
  displayName: '创作者',
  username: 'user',
  bio: '像素视觉创作者，热衷于像素艺术与视觉表达。',
  works: 36,
  followers: 1280,
  following: 196,
})

const comments = ref([
  {
    id: 1,
    author: '视觉探索者',
    text: '色调层次处理得很细腻，冷暖过渡自然流畅。主元素的细节密度和背景的留白节奏把握得刚好。',
    time: '2 小时前',
  },
  {
    id: 2,
    author: 'PixelLover',
    text: '构图很大胆，视觉重心偏移到右侧的处理反而让画面更有张力。这个色阶方案能分享一下思路吗？',
    time: '5 小时前',
  },
  {
    id: 3,
    author: '灰阶旅人',
    text: '简洁但不简单，每个像素都有它的意义。这大概就是像素视觉一直追求的表达方式吧。',
    time: '1 天前',
  },
])

const newComment = ref('')

const handleBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'home' })
  }
}

const handleSubmitComment = () => {
  const text = newComment.value.trim()
  if (!text) return
  comments.value.unshift({
    id: Date.now(),
    author: '当前用户',
    text,
    time: '刚刚',
  })
  newComment.value = ''
}

onMounted(() => {
  if (publisher.value.avatar === '') {
    publisher.value.avatar = getAvatarUrl('')
  }
})
</script>

<template>
  <div class="work-detail">
    <!-- 顶部导航 -->
    <div class="wd-topbar">
      <button class="wd-back-btn" @click="handleBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        返回
      </button>
    </div>

    <div class="wd-container">
      <!-- 左侧主内容区 -->
      <main class="wd-main">
        <!-- 大图展示 -->
        <div class="wd-image-stage">
          <img
            v-if="workImgUrl"
            :src="workImgUrl"
            :alt="workTitle"
          />
          <div v-else class="wd-comments-empty">
            暂无作品图片
          </div>
        </div>

        <!-- 作品信息 -->
        <div class="wd-work-info">
          <h1 class="wd-work-title">{{ workTitle }}</h1>
          <div class="wd-work-meta">
            <span>作品 ID: {{ workId }}</span>
          </div>
        </div>

        <!-- 评论区 -->
        <section class="wd-comments">
          <div class="wd-comments-header">
            <h2>评论</h2>
            <span class="wd-comments-count">{{ comments.length }} 条评论</span>
          </div>

          <!-- 评论输入 -->
          <div class="wd-comment-input">
            <div class="wd-comment-avatar">
              <img :src="getAvatarUrl('')" alt="avatar" />
            </div>
            <div class="wd-comment-field">
              <textarea
                v-model="newComment"
                placeholder="写下你的想法..."
                maxlength="500"
              ></textarea>
              <button class="wd-comment-submit" @click="handleSubmitComment">
                发布
              </button>
            </div>
          </div>

          <!-- 评论列表 -->
          <div class="wd-comment-list">
            <div
              v-for="comment in comments"
              :key="comment.id"
              class="wd-comment-item"
            >
              <div class="wd-comment-avatar">
                <img :src="getAvatarUrl('')" alt="avatar" />
              </div>
              <div class="wd-comment-body">
                <p class="wd-comment-author">{{ comment.author }}</p>
                <p class="wd-comment-text">{{ comment.text }}</p>
                <span class="wd-comment-time">{{ comment.time }}</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- 右侧边栏 - 发布者信息 -->
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
            <div class="publisher-stat">
              <div class="publisher-stat-value">{{ publisher.works }}</div>
              <div class="publisher-stat-label">作品</div>
            </div>
            <div class="publisher-stat">
              <div class="publisher-stat-value">{{ publisher.followers.toLocaleString() }}</div>
              <div class="publisher-stat-label">粉丝</div>
            </div>
            <div class="publisher-stat">
              <div class="publisher-stat-value">{{ publisher.following }}</div>
              <div class="publisher-stat-label">关注</div>
            </div>
          </div>

          <button class="publisher-follow">关注</button>

          <p class="publisher-bio">{{ publisher.bio }}</p>

          <div class="publisher-contact">
            <div class="publisher-contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M22 7l-10 7L2 7"/>
              </svg>
              联系邮箱
            </div>
            <div class="publisher-contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
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
</style>