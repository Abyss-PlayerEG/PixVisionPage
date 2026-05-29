<template>
  <div class="ad-container">
    <AdminTopbar @logout="handleLogout" />

    <div class="ad-body">
      <AdminSidebar
        :active-tab="activeTab"
        :nav-items="navItems"
        @switch-tab="switchTab"
      />

      <main class="ad-content">
        <AdminUserTab
          v-if="activeTab === 'users'"
          :user-list="userList"
          :user-loading="userLoading"
          :user-keyword="userKeyword"
          :user-total="userTotal"
          :has-more="hasMore('users')"
          :format-time="formatTime"
          @update:user-keyword="(v) => userKeyword = v"
          @search="handleSearchUsers"
          @load-more="loadUsers({ reset: false })"
          @ban-user="handleBanUser"
          @delete-user="handleDeleteUser"
        />

        <AdminWorkTab
          v-if="activeTab === 'works'"
          :work-list="workList"
          :work-loading="workLoading"
          :work-keyword="workKeyword"
          :work-total="workTotal"
          :has-more="hasMore('works')"
          :format-time="formatTime"
          @update:work-keyword="(v) => workKeyword = v"
          @search="handleSearchWorks"
          @load-more="loadWorks({ reset: false })"
          @delete-work="handleDeleteWork"
        />

        <AdminCommentTab
          v-if="activeTab === 'comments'"
          :comment-list="commentList"
          :comment-loading="commentLoading"
          :comment-keyword="commentKeyword"
          :comment-total="commentTotal"
          :has-more="hasMore('comments')"
          :format-time="formatTime"
          @update:comment-keyword="(v) => commentKeyword = v"
          @search="handleSearchComments"
          @load-more="loadComments({ reset: false })"
          @delete-comment="handleDeleteComment"
        />
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAdmin } from '@/composables/useAdmin'
import AdminTopbar from '@/components/componentsAdmin/AdminTopbar.vue'
import AdminSidebar from '@/components/componentsAdmin/AdminSidebar.vue'
import AdminUserTab from '@/components/componentsAdmin/AdminUserTab.vue'
import AdminWorkTab from '@/components/componentsAdmin/AdminWorkTab.vue'
import AdminCommentTab from '@/components/componentsAdmin/AdminCommentTab.vue'
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
