<template>
  <div class="ad-container">
    <AdminTopbar @logout="handleLogout" />

    <div class="ad-body">
      <AdminSidebar :active-tab="activeTab" :nav-items="navItems" @switch-tab="switchTab" />

      <main class="ad-content">
        <!-- 用户管理 -->
        <AdminUserTab
          v-if="activeTab === 'users'"
          :user-list="userList" :user-loading="userLoading" :user-keyword="userKeyword"
          :user-total="userTotal" :has-more="hasMore('users')" :format-time="formatTime"
          :user-role-filter="userRoleFilter" :user-status-filter="userStatusFilter" :user-order-by="userOrderBy"
          @update:user-keyword="(v) => userKeyword = v"
          @update:user-role-filter="(v) => userRoleFilter = v"
          @update:user-status-filter="(v) => userStatusFilter = v"
          @update:user-order-by="(v) => userOrderBy = v"
          @search="handleSearchUsers" @load-more="loadUsers({ reset: false })"
          @ban-user="handleBanUser" @freeze-user="handleFreezeUser" @delete-user="handleDeleteUser"
          @create-user="openCreateUserDialog" @reset-pwd="handleResetPwd"
        />

        <!-- 作品管理 -->
        <AdminWorkTab
          v-if="activeTab === 'works'"
          :work-list="workList" :work-loading="workLoading" :work-keyword="workKeyword"
          :work-total="workTotal" :has-more="hasMore('works')" :format-time="formatTime"
          :work-approval-filter="workApprovalFilter" :work-order-by="workOrderBy"
          @update:work-keyword="(v) => workKeyword = v"
          @update:work-approval-filter="(v) => workApprovalFilter = v"
          @update:work-order-by="(v) => workOrderBy = v"
          @search="handleSearchWorks" @load-more="loadWorks({ reset: false })"
          @delete-work="handleDeleteWork" @approve-work="handleApproveWork"
          @edit-work-title="openEditTitleDialog"
        />

        <!-- 评论管理 -->
        <AdminCommentTab
          v-if="activeTab === 'comments'"
          :comment-list="commentList" :comment-loading="commentLoading" :comment-keyword="commentKeyword"
          :comment-total="commentTotal" :has-more="hasMore('comments')" :format-time="formatTime"
          :comment-approval-filter="commentApprovalFilter" :comment-order-by="commentOrderBy"
          @update:comment-keyword="(v) => commentKeyword = v"
          @update:comment-approval-filter="(v) => commentApprovalFilter = v"
          @update:comment-order-by="(v) => commentOrderBy = v"
          @search="handleSearchComments" @load-more="loadComments({ reset: false })"
          @delete-comment="handleDeleteComment" @approve-comment="handleApproveComment"
        />

        <!-- AI 审核记录 -->
        <AdminAuditTab
          v-if="activeTab === 'audits'"
          :list="auditList" :loading="auditLoading" :total="auditTotal"
          :has-more="hasMore('audits')" :format-time="formatTime"
          :keyword="auditKeyword" :content-type-filter="auditContentTypeFilter"
          :approval-filter="auditApprovalFilter" :order-by="auditOrderBy"
          @update:keyword="(v) => auditKeyword = v"
          @update:content-type-filter="(v) => auditContentTypeFilter = v"
          @update:approval-filter="(v) => auditApprovalFilter = v"
          @update:order-by="(v) => auditOrderBy = v"
          @search="loadAudits({ reset: true })" @load-more="loadAudits({ reset: false })"
        />

        <!-- 用户数据变更审核 -->
        <AdminChangeTab
          v-if="activeTab === 'changes'"
          :list="changeList" :loading="changeLoading" :total="changeTotal"
          :has-more="hasMore('changes')" :format-time="formatTime"
          :type-filter="changeTypeFilter"
          @update:type-filter="(v) => changeTypeFilter = v"
          @search="loadChanges({ reset: true })" @load-more="loadChanges({ reset: false })" @approve-change="handleApproveChange"
        />

        <!-- 操作日志 -->
        <AdminLogTab
          v-if="activeTab === 'logs'"
          :list="logList" :loading="logLoading" :total="logTotal"
          :has-more="hasMore('logs')" :format-time="formatTime"
          :keyword="logKeyword" :order-by="logOrderBy"
          @update:keyword="(v) => logKeyword = v"
          @update:order-by="(v) => logOrderBy = v"
          @search="loadLogs({ reset: true })" @load-more="loadLogs({ reset: false })"
        />
      </main>
    </div>

    <!-- 创建用户弹窗 -->
    <div v-if="showCreateUserDialog" class="ad-overlay" @click.self="showCreateUserDialog = false">
      <div class="ad-dialog">
        <h3 class="ad-dialog-title">创建新用户</h3>
        <div class="ad-dialog-body">
          <div class="ad-form-group">
            <label class="ad-form-label">用户名</label>
            <input v-model="createUserForm.username" class="ad-form-input" placeholder="5-16位，字母/数字/下划线" maxlength="16" />
            <div v-if="createUserErrors.username" class="ad-form-error">{{ createUserErrors.username }}</div>
          </div>
          <div class="ad-form-group">
            <label class="ad-form-label">密码</label>
            <input v-model="createUserForm.password" class="ad-form-input" type="password" placeholder="6-16位" maxlength="16" />
            <div v-if="createUserErrors.password" class="ad-form-error">{{ createUserErrors.password }}</div>
          </div>
          <div class="ad-form-group">
            <label class="ad-form-label">确认密码</label>
            <input v-model="createUserForm.confirmPassword" class="ad-form-input" type="password" placeholder="再次输入密码" maxlength="16" />
            <div v-if="createUserErrors.confirmPassword" class="ad-form-error">{{ createUserErrors.confirmPassword }}</div>
          </div>
          <div class="ad-form-group">
            <label class="ad-form-label">昵称</label>
            <input v-model="createUserForm.nickname" class="ad-form-input" placeholder="用户昵称" maxlength="24" />
            <div v-if="createUserErrors.nickname" class="ad-form-error">{{ createUserErrors.nickname }}</div>
          </div>
          <div class="ad-form-group">
            <label class="ad-form-label">邮箱</label>
            <input v-model="createUserForm.email" class="ad-form-input" placeholder="user@example.com" />
            <div v-if="createUserErrors.email" class="ad-form-error">{{ createUserErrors.email }}</div>
          </div>
        </div>
        <div class="ad-dialog-footer">
          <button class="ad-dialog-btn" @click="showCreateUserDialog = false">取消</button>
          <button class="ad-dialog-btn ad-dialog-btn--primary" @click="handleCreateUser">创建</button>
        </div>
      </div>
    </div>

    <!-- 修改作品标题弹窗 -->
    <div v-if="showEditTitleDialog" class="ad-overlay" @click.self="showEditTitleDialog = false">
      <div class="ad-dialog">
        <h3 class="ad-dialog-title">修改作品标题</h3>
        <div class="ad-dialog-body">
          <div class="ad-form-group">
            <label class="ad-form-label">原标题：{{ editTitleForm.oldTitle }}</label>
            <input v-model="editTitleForm.newTitle" class="ad-form-input" placeholder="输入新标题（最多16字符）" maxlength="16" />
          </div>
        </div>
        <div class="ad-dialog-footer">
          <button class="ad-dialog-btn" @click="showEditTitleDialog = false">取消</button>
          <button class="ad-dialog-btn ad-dialog-btn--primary" @click="handleEditWorkTitle">确认修改</button>
        </div>
      </div>
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
import AdminAuditTab from '@/components/componentsAdmin/AdminAuditTab.vue'
import AdminChangeTab from '@/components/componentsAdmin/AdminChangeTab.vue'
import AdminLogTab from '@/components/componentsAdmin/AdminLogTab.vue'
import '../assets/CSS/admin.css'

const {
  activeTab,
  userList, userLoading, userKeyword, userTotal, userRoleFilter, userStatusFilter, userOrderBy,
  workList, workLoading, workKeyword, workTotal, workApprovalFilter, workOrderBy,
  commentList, commentLoading, commentKeyword, commentTotal, commentApprovalFilter, commentOrderBy,
  auditList, auditLoading, auditTotal, auditKeyword, auditContentTypeFilter, auditApprovalFilter, auditOrderBy,
  changeList, changeLoading, changeTotal, changeTypeFilter,
  logList, logLoading, logTotal, logKeyword, logOrderBy,
  hasMore, formatTime,
  showCreateUserDialog, createUserForm, createUserErrors, openCreateUserDialog, handleCreateUser,
  showEditTitleDialog, editTitleForm, openEditTitleDialog, handleEditWorkTitle,
  loadUsers, handleSearchUsers, handleBanUser, handleFreezeUser, handleDeleteUser, handleResetPwd,
  loadWorks, handleSearchWorks, handleDeleteWork, handleApproveWork,
  loadComments, handleSearchComments, handleDeleteComment, handleApproveComment,
  loadAudits, loadChanges, handleApproveChange, loadLogs,
  switchTab, handleLogout,
} = useAdmin()

const navItems = [
  { key: 'users', label: '用户管理', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { key: 'works', label: '作品管理', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { key: 'comments', label: '评论管理', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9 8s9 3.582 9 8z' },
  { key: 'audits', label: '审核记录', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { key: 'changes', label: '变更审核', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { key: 'logs', label: '操作日志', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16M9 6V4h6v2' },
]

onMounted(() => {
  switchTab('users')
})
</script>
