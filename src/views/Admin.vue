<template>
  <div class="ad-container">
    <!-- ── 顶部栏 ── -->
    <header class="ad-topbar">
      <div class="ad-logo" @click="$router.push('/')">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#00A947" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <h1 class="ad-logo-title">PixelVision</h1>
        <span class="ad-logo-sub">管理后台</span>
      </div>
      <div class="ad-topbar-actions">
        <button class="ad-back-btn" @click="$router.push('/profile/me')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          返回个人主页
        </button>
        <button class="ad-logout-btn" @click="handleLogout">退出登录</button>
      </div>
    </header>

    <!-- ── 主体 ── -->
    <div class="ad-body">
      <!-- 侧边栏 -->
      <nav class="ad-sidebar">
        <button
          v-for="item in navItems"
          :key="item.key"
          class="ad-nav-item"
          :class="{ active: activeTab === item.key }"
          @click="switchTab(item.key)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path :d="item.icon"/>
          </svg>
          {{ item.label }}
        </button>
      </nav>

      <!-- 内容区 -->
      <main class="ad-content">
        <!-- ═══ 用户管理 ═══ -->
        <template v-if="activeTab === 'users'">
          <div class="ad-table-header">
            <h3 class="ad-table-title">用户管理<span class="ad-table-count">（共 {{ userTotal }} 人）</span></h3>
            <div class="ad-search-box">
              <input
                v-model="userKeyword"
                class="ad-search-input"
                placeholder="搜索用户名或邮箱..."
                @keyup.enter="handleSearchUsers"
              />
              <button class="ad-search-btn" @click="handleSearchUsers">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </button>
            </div>
          </div>

          <!-- 表格骨架屏 -->
          <div v-if="userLoading && userList.length === 0" class="ad-table-skeleton">
            <div v-for="n in 8" :key="n" class="ad-table-skeleton-row"></div>
          </div>
          <!-- 空状态 -->
          <div v-else-if="!userLoading && userList.length === 0" class="ad-empty">暂无用户数据</div>
          <!-- 真实表格 -->
          <div v-else class="ad-table-wrap">
            <table class="ad-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>用户名</th>
                  <th>昵称</th>
                  <th>邮箱</th>
                  <th>状态</th>
                  <th>注册时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in userList" :key="user.user_id">
                  <td class="ad-cell-id">#{{ user.user_id }}</td>
                  <td class="ad-cell-title">{{ user.username }}</td>
                  <td>{{ user.nickname || '—' }}</td>
                  <td class="ad-cell-text">{{ user.email || '—' }}</td>
                  <td>
                    <span class="ad-badge" :class="(user.banned || user.status === 0) ? 'ad-badge--banned' : 'ad-badge--active'">
                      {{ (user.banned || user.status === 0) ? '已封禁' : '正常' }}
                    </span>
                  </td>
                  <td>{{ formatTime(user.create_time) }}</td>
                  <td>
                    <div class="ad-actions">
                      <button
                        class="ad-action-btn"
                        :class="(user.banned || user.status === 0) ? 'ad-action-btn--warn' : ''"
                        @click="handleBanUser(user)"
                      >
                        {{ (user.banned || user.status === 0) ? '解封' : '封禁' }}
                      </button>
                      <button class="ad-action-btn ad-action-btn--danger" @click="handleDeleteUser(user)">删除</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- 加载更多 -->
          <div class="ad-load-more">
            <div v-if="userLoading" class="ad-loading-spinner">
              <svg class="ad-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32" stroke-linecap="round"><animate attributeName="stroke-dashoffset" values="32;0" dur="0.8s" repeatCount="indefinite"/></circle></svg>
              加载中...
            </div>
            <button
              v-else-if="hasMore('users')"
              class="ad-load-more-btn"
              @click="loadUsers({ reset: false })"
            >
              加载更多
            </button>
            <span v-else-if="userList.length > 0" class="ad-empty" style="padding: 12px 0;">— 已加载全部 —</span>
          </div>
        </template>

        <!-- ═══ 作品管理 ═══ -->
        <template v-if="activeTab === 'works'">
          <div class="ad-table-header">
            <h3 class="ad-table-title">作品管理<span class="ad-table-count">（共 {{ workTotal }} 件）</span></h3>
            <div class="ad-search-box">
              <input
                v-model="workKeyword"
                class="ad-search-input"
                placeholder="搜索作品标题..."
                @keyup.enter="handleSearchWorks"
              />
              <button class="ad-search-btn" @click="handleSearchWorks">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </button>
            </div>
          </div>

          <div v-if="workLoading && workList.length === 0" class="ad-table-skeleton">
            <div v-for="n in 8" :key="n" class="ad-table-skeleton-row"></div>
          </div>
          <div v-else-if="!workLoading && workList.length === 0" class="ad-empty">暂无作品数据</div>
          <div v-else class="ad-table-wrap">
            <table class="ad-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>作品标题</th>
                  <th>作者</th>
                  <th>点赞</th>
                  <th>收藏</th>
                  <th>浏览</th>
                  <th>发布时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="work in workList" :key="work.work_id">
                  <td class="ad-cell-id">#{{ work.work_id }}</td>
                  <td class="ad-cell-title">{{ work.work_title || '未命名作品' }}</td>
                  <td>{{ work.author_nickname || work.author_username || '—' }}</td>
                  <td>{{ (work.like_count || 0).toLocaleString() }}</td>
                  <td>{{ (work.star_count || 0).toLocaleString() }}</td>
                  <td>{{ (work.view_count || 0).toLocaleString() }}</td>
                  <td>{{ formatTime(work.create_time) }}</td>
                  <td>
                    <div class="ad-actions">
                      <button class="ad-action-btn" @click="$router.push(`/work/${work.work_id}`)">查看</button>
                      <button class="ad-action-btn ad-action-btn--danger" @click="handleDeleteWork(work)">删除</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ad-load-more">
            <div v-if="workLoading" class="ad-loading-spinner">
              <svg class="ad-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32" stroke-linecap="round"><animate attributeName="stroke-dashoffset" values="32;0" dur="0.8s" repeatCount="indefinite"/></circle></svg>
              加载中...
            </div>
            <button v-else-if="hasMore('works')" class="ad-load-more-btn" @click="loadWorks({ reset: false })">加载更多</button>
            <span v-else-if="workList.length > 0" class="ad-empty" style="padding: 12px 0;">— 已加载全部 —</span>
          </div>
        </template>

        <!-- ═══ 评论管理 ═══ -->
        <template v-if="activeTab === 'comments'">
          <div class="ad-table-header">
            <h3 class="ad-table-title">评论管理<span class="ad-table-count">（共 {{ commentTotal }} 条）</span></h3>
            <div class="ad-search-box">
              <input
                v-model="commentKeyword"
                class="ad-search-input"
                placeholder="搜索评论内容..."
                @keyup.enter="handleSearchComments"
              />
              <button class="ad-search-btn" @click="handleSearchComments">
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
                      <button class="ad-action-btn ad-action-btn--danger" @click="handleDeleteComment(comment)">删除</button>
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
            <button v-else-if="hasMore('comments')" class="ad-load-more-btn" @click="loadComments({ reset: false })">加载更多</button>
            <span v-else-if="commentList.length > 0" class="ad-empty" style="padding: 12px 0;">— 已加载全部 —</span>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAdmin } from '@/composables/useAdmin'
import '../assets/CSS/admin.css'

const {
  activeTab,
  userList, userLoading, userKeyword, userTotal,
  workList, workLoading, workKeyword, workTotal,
  commentList, commentLoading, commentKeyword, commentTotal,
  hasMore, formatTime,
  loadUsers, handleSearchUsers, handleBanUser, handleDeleteUser,
  loadWorks, handleSearchWorks, handleDeleteWork,
  loadComments, handleSearchComments, handleDeleteComment,
  switchTab, handleLogout,
} = useAdmin()

const navItems = [
  { key: 'users', label: '用户管理', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { key: 'works', label: '作品管理', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { key: 'comments', label: '评论管理', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9 8s9 3.582 9 8z' },
]

onMounted(() => {
  switchTab('users')
})
</script>
