<template>
  <div class="ap-container">
    <!-- 侧边栏 -->
    <aside class="ap-sidebar">
      <div class="ap-sidebar-header">
        <h2 class="ap-sidebar-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
          管理后台
        </h2>
      </div>

      <nav class="ap-nav">
        <button v-for="tab in tabs" :key="tab.key" class="ap-nav-item" :class="{ active: activeTab === tab.key }" @click="switchTab(tab.key)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path :d="tab.icon"/></svg>
          <span>{{ tab.label }}</span>
        </button>
      </nav>

      <div class="ap-sidebar-footer">
        <button class="ap-back-btn" @click="$router.push('/profile/me')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          <span>返回个人主页</span>
        </button>
        <button class="ap-logout-btn" @click="handleLogout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          <span>退出登录</span>
        </button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="ap-main">
      <!-- ========== 用户管理 ========== -->
      <section v-if="activeTab === 'users'" class="ap-section">
        <div class="ap-topbar">
          <h1 class="ap-topbar-title">用户管理 <span class="ap-count">共 {{ userTotal }} 人</span></h1>
          <div class="ap-topbar-actions">
            <div class="ap-search">
              <input v-model="userKeyword" class="ap-search-input" placeholder="搜索昵称..." @keyup.enter="handleSearchUsers" />
              <button class="ap-search-btn" @click="handleSearchUsers">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </button>
            </div>
            <button class="ap-btn ap-btn-primary" @click="openCreateUserDialog">+ 创建用户</button>
          </div>
        </div>

        <div class="ap-filters">
          <div class="ap-filter-group">
            <label>角色</label>
            <select v-model="userRoleFilter" @change="handleSearchUsers">
              <option value="">全部</option>
              <option value="11">普通用户</option>
              <option value="22">创作者</option>
              <option value="55">审核员</option>
              <option value="77">系统管理员</option>
            </select>
          </div>
          <div class="ap-filter-group">
            <label>状态</label>
            <select v-model="userStatusFilter" @change="handleSearchUsers">
              <option value="">全部</option>
              <option value="10">正常</option>
              <option value="20">冻结</option>
              <option value="30">封禁</option>
            </select>
          </div>
          <div class="ap-filter-group">
            <label>排序</label>
            <select v-model="userOrderBy" @change="handleSearchUsers">
              <option value="newest">最新优先</option>
              <option value="oldest">最早优先</option>
            </select>
          </div>
        </div>

        <div class="ap-content">
          <div v-if="userLoading && userList.length === 0" class="ap-skeleton"><div v-for="n in 8" :key="n" class="ap-skeleton-row"></div></div>
          <div v-else-if="!userLoading && userList.length === 0" class="ap-empty">暂无用户数据</div>
          <div v-else class="ap-table-wrap">
            <table class="ap-table">
              <thead><tr><th>ID</th><th>头像</th><th>用户名</th><th>昵称</th><th>角色</th><th>状态</th><th>注册时间</th><th>操作</th></tr></thead>
              <tbody>
                <tr v-for="u in userList" :key="u.user_id">
                  <td class="ap-cell-id">#{{ u.user_id }}</td>
                  <td><img :src="getAvatarSrc(u.avatar_url)" class="ap-avatar" @error="(e) => e.target.style.display='none'" @mouseenter="(e) => showPreview(e, getAvatarSrc(u.avatar_url))" @mouseleave="hidePreview" /></td>
                  <td class="ap-cell-bold">{{ u.username }}</td>
                  <td>{{ u.nickname || '—' }}</td>
                  <td><span class="ap-badge" :class="roleBadge(u.user_role)">{{ roleLabel(u.user_role) }}</span></td>
                  <td><span class="ap-badge" :class="statusBadge(u.status)">{{ statusLabel(u.status) }}</span></td>
                  <td>{{ formatTime(u.create_time) }}</td>
                  <td>
                    <div class="ap-actions">
                      <button v-if="u.status !== 30" class="ap-btn ap-btn-sm ap-btn-freeze" @click="handleBanUser(u)">{{ u.status === 20 ? '解冻' : '冻结' }}</button>
                      <button class="ap-btn ap-btn-sm ap-btn-warn" @click="handleBanUser(u)">{{ u.status === 30 ? '解封' : '封禁' }}</button>
                      <button class="ap-btn ap-btn-sm" @click="handleResetPwd(u)">重置密码</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="userLoading && userList.length > 0" class="ap-loading">加载中...</div>
        </div>
      </section>

      <!-- ========== 作品管理 ========== -->
      <section v-if="activeTab === 'works'" class="ap-section">
        <div class="ap-topbar">
          <h1 class="ap-topbar-title">作品管理 <span class="ap-count">共 {{ workTotal }} 件</span></h1>
          <div class="ap-topbar-actions">
            <div class="ap-search">
              <input v-model="workKeyword" class="ap-search-input" placeholder="搜索作品标题..." @keyup.enter="handleSearchWorks" />
              <button class="ap-search-btn" @click="handleSearchWorks">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </button>
            </div>
          </div>
        </div>

        <div class="ap-filters">
          <div class="ap-filter-group">
            <label>审核状态</label>
            <select v-model="workApprovalFilter" @change="handleSearchWorks">
              <option value="">全部</option>
              <option value="10">已通过</option>
              <option value="20">待审核</option>
              <option value="30">未通过</option>
            </select>
          </div>
          <div class="ap-filter-group">
            <label>排序</label>
            <select v-model="workOrderBy" @change="handleSearchWorks">
              <option value="newest">最新优先</option>
              <option value="oldest">最早优先</option>
            </select>
          </div>
        </div>

        <div class="ap-content">
          <div v-if="workLoading && workList.length === 0" class="ap-skeleton"><div v-for="n in 8" :key="n" class="ap-skeleton-row"></div></div>
          <div v-else-if="!workLoading && workList.length === 0" class="ap-empty">暂无作品数据</div>
          <div v-else class="ap-table-wrap">
            <table class="ap-table">
              <thead><tr><th>ID</th><th>缩略图</th><th>标题</th><th>作者</th><th>审核状态</th><th>上传时间</th><th>操作</th></tr></thead>
              <tbody>
                <tr v-for="w in workList" :key="w.work_id">
                  <td class="ap-cell-id">#{{ w.work_id }}</td>
                  <td><img :src="getWorkImgSrc(w.img_url)" class="ap-thumb" @error="(e) => e.target.style.display='none'" @mouseenter="(e) => showPreview(e, getWorkImgSrc(w.img_url))" @mouseleave="hidePreview" @click="openFullscreen(getWorkImgSrc(w.img_url))" /></td>
                  <td class="ap-cell-bold">{{ w.work_title || '未命名' }}</td>
                  <td>{{ w.nickname || w.username || ('用户 #' + w.user_id) }}</td>
                  <td><span class="ap-badge" :class="approvalBadge(w.approval_status)">{{ approvalLabel(w.approval_status) }}</span></td>
                  <td>{{ formatTime(w.create_time) }}</td>
                  <td>
                    <div class="ap-actions">
                      <button class="ap-btn ap-btn-sm ap-btn-approve" @click="handleApproveWork(w, 10)">通过</button>
                      <button class="ap-btn ap-btn-sm ap-btn-danger" @click="handleApproveWork(w, 30)">不通过</button>
                      <button class="ap-btn ap-btn-sm ap-btn-warn" @click="handleDeleteWork(w)">删除</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="workLoading && workList.length > 0" class="ap-loading">加载中...</div>
        </div>
      </section>

      <!-- ========== 评论管理 ========== -->
      <section v-if="activeTab === 'comments'" class="ap-section">
        <div class="ap-topbar">
          <h1 class="ap-topbar-title">评论管理 <span class="ap-count">共 {{ commentTotal }} 条</span></h1>
          <div class="ap-topbar-actions">
            <div class="ap-search">
              <input v-model="commentKeyword" class="ap-search-input" placeholder="搜索评论内容..." @keyup.enter="handleSearchComments" />
              <button class="ap-search-btn" @click="handleSearchComments">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </button>
            </div>
          </div>
        </div>
        <div class="ap-filters">
          <div class="ap-filter-group">
            <label>审核状态</label>
            <select v-model="commentApprovalFilter" @change="handleSearchComments">
              <option value="">全部</option>
              <option value="10">已通过</option>
              <option value="20">待审核</option>
              <option value="30">未通过</option>
            </select>
          </div>
          <div class="ap-filter-group">
            <label>排序</label>
            <select v-model="commentOrderBy" @change="handleSearchComments">
              <option value="newest">最新优先</option>
              <option value="oldest">最早优先</option>
            </select>
          </div>
        </div>
        <div class="ap-content">
          <div v-if="commentLoading && commentList.length === 0" class="ap-skeleton"><div v-for="n in 6" :key="n" class="ap-skeleton-row"></div></div>
          <div v-else-if="!commentLoading && commentList.length === 0" class="ap-empty">暂无评论数据</div>
          <div v-else class="ap-table-wrap">
            <table class="ap-table">
              <thead><tr><th>ID</th><th>评论内容</th><th>评论者</th><th>审核状态</th><th>评论时间</th><th>操作</th></tr></thead>
              <tbody>
                <tr v-for="c in commentList" :key="c.comment_id">
                  <td class="ap-cell-id">#{{ c.comment_id }}</td>
                  <td class="ap-cell-text">{{ c.comment_text || '—' }}</td>
                  <td>{{ c.nickname || c.username || ('用户 #' + c.user_id) }}</td>
                  <td><span class="ap-badge" :class="approvalBadge(c.approval_status)">{{ approvalLabel(c.approval_status) }}</span></td>
                  <td>{{ formatTime(c.time) }}</td>
                  <td>
                    <div class="ap-actions">
                      <button class="ap-btn ap-btn-sm ap-btn-approve" @click="handleApproveComment(c, 10)">通过</button>
                      <button class="ap-btn ap-btn-sm ap-btn-danger" @click="handleApproveComment(c, 30)">不通过</button>
                      <button class="ap-btn ap-btn-sm ap-btn-warn" @click="handleDeleteComment(c)">删除</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="commentLoading && commentList.length > 0" class="ap-loading">加载中...</div>
        </div>
      </section>

      <!-- ========== 合集管理 ========== -->
      <section v-if="activeTab === 'series'" class="ap-section">
        <div class="ap-topbar">
          <h1 class="ap-topbar-title">合集管理 <span class="ap-count">共 {{ seriesTotal }} 个</span></h1>
          <div class="ap-topbar-actions">
            <div class="ap-search">
              <input v-model="seriesKeyword" class="ap-search-input" placeholder="搜索合集标题..." @keyup.enter="handleSearchSeries" />
              <button class="ap-search-btn" @click="handleSearchSeries">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </button>
            </div>
          </div>
        </div>
        <div class="ap-filters">
          <div class="ap-filter-group">
            <label>审核状态</label>
            <select v-model="seriesStatusFilter" @change="handleSearchSeries">
              <option value="">全部</option>
              <option value="10">正常</option>
              <option value="20">待审核</option>
              <option value="30">违规</option>
            </select>
          </div>
          <div class="ap-filter-group">
            <label>排序</label>
            <select v-model="seriesOrderBy" @change="handleSearchSeries">
              <option value="newest">最新优先</option>
              <option value="oldest">最早优先</option>
            </select>
          </div>
        </div>
        <div class="ap-content">
          <div v-if="seriesLoading && seriesList.length === 0" class="ap-skeleton"><div v-for="n in 6" :key="n" class="ap-skeleton-row"></div></div>
          <div v-else-if="!seriesLoading && seriesList.length === 0" class="ap-empty">暂无合集数据</div>
          <div v-else class="ap-table-wrap">
            <table class="ap-table">
              <thead><tr><th>ID</th><th>标题</th><th>描述</th><th>作者</th><th>审核状态</th><th>创建时间</th><th>操作</th></tr></thead>
              <tbody>
                <tr v-for="s in seriesList" :key="s.series_id">
                  <td class="ap-cell-id">#{{ s.series_id }}</td>
                  <td class="ap-cell-bold">{{ s.series_title || '未命名' }}</td>
                  <td class="ap-cell-text">{{ s.about_text || '—' }}</td>
                  <td>{{ s.nickname || s.username || '—' }}</td>
                  <td><span class="ap-badge" :class="approvalBadge(s.approval_status)">{{ approvalLabel(s.approval_status) }}</span></td>
                  <td>{{ formatTime(s.create_time) }}</td>
                  <td>
                    <div class="ap-actions">
                      <button class="ap-btn ap-btn-sm ap-btn-approve" @click="handleApproveSeries(s, 10)">通过</button>
                      <button class="ap-btn ap-btn-sm ap-btn-danger" @click="handleApproveSeries(s, 30)">不通过</button>
                      <button class="ap-btn ap-btn-sm ap-btn-warn" @click="handleDeleteSeries(s)">删除</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="seriesLoading && seriesList.length > 0" class="ap-loading">加载中...</div>
        </div>
      </section>

      <!-- ========== 审核记录 ========== -->
      <section v-if="activeTab === 'audits'" class="ap-section">
        <div class="ap-topbar">
          <h1 class="ap-topbar-title">AI 审核记录 <span class="ap-count">共 {{ auditTotal }} 条</span></h1>
          <div class="ap-topbar-actions">
            <div class="ap-search">
              <input v-model="auditKeyword" class="ap-search-input" placeholder="搜索审核原因..." @keyup.enter="loadAudits({ reset: true })" />
              <button class="ap-search-btn" @click="loadAudits({ reset: true })">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </button>
            </div>
          </div>
        </div>
        <div class="ap-filters">
          <div class="ap-filter-group">
            <label>内容类型</label>
            <select v-model="auditContentTypeFilter" @change="loadAudits({ reset: true })">
              <option value="">全部</option>
              <option value="100">作品</option>
              <option value="200">评论</option>
              <option value="300">合集</option>
              <option value="400">昵称</option>
            </select>
          </div>
          <div class="ap-filter-group">
            <label>审核状态</label>
            <select v-model="auditApprovalFilter" @change="loadAudits({ reset: true })">
              <option value="">全部</option>
              <option value="10">正常</option>
              <option value="20">待审核</option>
              <option value="30">违规</option>
            </select>
          </div>
        </div>
        <div class="ap-content">
          <div v-if="auditLoading && auditList.length === 0" class="ap-skeleton"><div v-for="n in 6" :key="n" class="ap-skeleton-row"></div></div>
          <div v-else-if="!auditLoading && auditList.length === 0" class="ap-empty">暂无审核记录</div>
          <div v-else class="ap-table-wrap">
            <table class="ap-table">
              <thead><tr><th>ID</th><th>内容类型</th><th>审核结果</th><th>审核原因</th><th>审核时间</th></tr></thead>
              <tbody>
                <tr v-for="a in auditList" :key="a.id || a.audit_id">
                  <td class="ap-cell-id">#{{ a.id || a.audit_id }}</td>
                  <td>{{ contentTypeLabel(a.content_type) }}</td>
                  <td><span class="ap-badge" :class="approvalBadge(a.approval_status)">{{ approvalLabel(a.approval_status) }}</span></td>
                  <td class="ap-cell-text">{{ a.reason || a.audit_reason || '—' }}</td>
                  <td>{{ formatTime(a.create_time || a.audit_time) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="auditLoading && auditList.length > 0" class="ap-loading">加载中...</div>
        </div>
      </section>

      <!-- ========== 变更审核 ========== -->
      <section v-if="activeTab === 'changes'" class="ap-section">
        <div class="ap-topbar">
          <h1 class="ap-topbar-title">变更审核 <span class="ap-count">共 {{ changeTotal }} 条</span></h1>
        </div>
        <div class="ap-filters">
          <div class="ap-filter-group">
            <label>变更类型</label>
            <select v-model="changeTypeFilter" @change="loadChanges({ reset: true })">
              <option value="">全部</option>
              <option value="100">昵称修改</option>
              <option value="200">权限申请</option>
              <option value="300">头像修改</option>
            </select>
          </div>
        </div>
        <div class="ap-content">
          <div v-if="changeLoading && changeList.length === 0" class="ap-skeleton"><div v-for="n in 6" :key="n" class="ap-skeleton-row"></div></div>
          <div v-else-if="!changeLoading && changeList.length === 0" class="ap-empty">暂无待审核变更</div>
          <div v-else class="ap-table-wrap">
            <table class="ap-table">
              <thead><tr><th>ID</th><th>用户</th><th>变更类型</th><th>变更内容</th><th>提交时间</th><th>操作</th></tr></thead>
              <tbody>
                <tr v-for="c in changeList" :key="c.lock_id">
                  <td class="ap-cell-id">#{{ c.lock_id }}</td>
                  <td>{{ c.username || '用户 #' + c.user_id }}</td>
                  <td><span class="ap-badge" :class="changeTypeBadge(c.type)">{{ changeTypeLabel(c.type) }}</span></td>
                  <td>{{ changeContent(c) }}</td>
                  <td>{{ formatTime(c.create_time) }}</td>
                  <td>
                    <div class="ap-actions">
                      <button class="ap-btn ap-btn-sm ap-btn-approve" @click="handleApproveChange(c.lock_id, true)">通过</button>
                      <button class="ap-btn ap-btn-sm ap-btn-danger" @click="handleApproveChange(c.lock_id, false)">拒绝</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="changeLoading && changeList.length > 0" class="ap-loading">加载中...</div>
        </div>
      </section>

      <!-- ========== 操作日志 ========== -->
      <section v-if="activeTab === 'logs'" class="ap-section">
        <div class="ap-topbar">
          <h1 class="ap-topbar-title">操作日志 <span class="ap-count">共 {{ logTotal }} 条</span></h1>
          <div class="ap-topbar-actions">
            <div class="ap-search">
              <input v-model="logKeyword" class="ap-search-input" placeholder="搜索操作事件..." @keyup.enter="loadLogs({ reset: true })" />
              <button class="ap-search-btn" @click="loadLogs({ reset: true })">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </button>
            </div>
          </div>
        </div>
        <div class="ap-content">
          <div v-if="logLoading && logList.length === 0" class="ap-skeleton"><div v-for="n in 6" :key="n" class="ap-skeleton-row"></div></div>
          <div v-else-if="!logLoading && logList.length === 0" class="ap-empty">暂无操作日志</div>
          <div v-else class="ap-table-wrap">
            <table class="ap-table">
              <thead><tr><th>ID</th><th>操作事件</th><th>操作人</th><th>时间</th></tr></thead>
              <tbody>
                <tr v-for="l in logList" :key="l.sys_log_id">
                  <td class="ap-cell-id">#{{ l.sys_log_id }}</td>
                  <td>{{ l.log_event || '—' }}</td>
                  <td>{{ l.username || '—' }}</td>
                  <td>{{ formatTime(l.log_datetime) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="logLoading && logList.length > 0" class="ap-loading">加载中...</div>
        </div>
      </section>
    </main>

    <!-- 创建用户弹窗 -->
    <div v-if="showCreateUserDialog" class="ap-overlay" @click.self="showCreateUserDialog = false">
      <div class="ap-dialog">
        <h3 class="ap-dialog-title">创建新用户</h3>
        <div class="ap-dialog-body">
          <div class="ap-form-group"><label>用户名</label><input v-model="createUserForm.username" placeholder="5-16位，字母/数字/下划线" maxlength="16" /><span v-if="createUserErrors.username" class="ap-form-error">{{ createUserErrors.username }}</span></div>
          <div class="ap-form-group"><label>密码</label><input v-model="createUserForm.password" type="password" placeholder="6-16位" maxlength="16" /><span v-if="createUserErrors.password" class="ap-form-error">{{ createUserErrors.password }}</span></div>
          <div class="ap-form-group"><label>确认密码</label><input v-model="createUserForm.confirmPassword" type="password" placeholder="再次输入密码" maxlength="16" /><span v-if="createUserErrors.confirmPassword" class="ap-form-error">{{ createUserErrors.confirmPassword }}</span></div>
          <div class="ap-form-group"><label>昵称</label><input v-model="createUserForm.nickname" placeholder="用户昵称" maxlength="24" /><span v-if="createUserErrors.nickname" class="ap-form-error">{{ createUserErrors.nickname }}</span></div>
          <div class="ap-form-group"><label>邮箱</label><input v-model="createUserForm.email" placeholder="user@example.com" /><span v-if="createUserErrors.email" class="ap-form-error">{{ createUserErrors.email }}</span></div>
        </div>
        <div class="ap-dialog-footer">
          <button class="ap-btn" @click="showCreateUserDialog = false">取消</button>
          <button class="ap-btn ap-btn-primary" @click="handleCreateUser">创建</button>
        </div>
      </div>
    </div>

    <!-- 图片悬浮预览 -->
    <div v-if="previewUrl" class="ap-preview" :style="previewStyle">
      <img :src="previewUrl" class="ap-preview-img" />
    </div>

    <!-- 全屏图片查看器 -->
    <div v-if="fullscreenUrl" class="ap-fullscreen" @click.self="closeFullscreen">
      <button class="ap-fullscreen-close" @click="closeFullscreen">&times;</button>
      <img :src="fullscreenUrl" class="ap-fullscreen-img" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAdmin } from '@/composables/useAdmin'
import { API_BASE_URL, AVATAR_API, WORK_IMAGE_API } from '@/config/api'

import '../assets/CSS/admin.css'

// 图片悬浮预览
const previewUrl = ref('')
const previewStyle = ref({})
const showPreview = (e, url) => {
  if (!url) return
  const rect = e.currentTarget.getBoundingClientRect()
  previewUrl.value = url
  previewStyle.value = {
    left: `${rect.left + rect.width / 2}px`,
    top: `${rect.top - 8}px`,
  }
}
const hidePreview = () => { previewUrl.value = '' }

// 全屏查看器
const fullscreenUrl = ref('')
const openFullscreen = (url) => { if (url) fullscreenUrl.value = url }
const closeFullscreen = () => { fullscreenUrl.value = '' }

const {
  activeTab,
  userList, userLoading, userKeyword, userTotal, userRoleFilter, userStatusFilter, userOrderBy,
  workList, workLoading, workKeyword, workTotal, workApprovalFilter, workOrderBy,
  commentList, commentLoading, commentKeyword, commentTotal, commentApprovalFilter, commentOrderBy,
  auditList, auditLoading, auditTotal, auditKeyword, auditContentTypeFilter, auditApprovalFilter,
  changeList, changeLoading, changeTotal, changeTypeFilter,
  logList, logLoading, logTotal, logKeyword,
  seriesList, seriesLoading, seriesKeyword, seriesTotal, seriesStatusFilter, seriesOrderBy,
  hasMore, formatTime,
  showCreateUserDialog, createUserForm, createUserErrors, openCreateUserDialog, handleCreateUser,
  loadUsers, handleSearchUsers, handleBanUser, handleResetPwd,
  loadWorks, handleSearchWorks, handleDeleteWork, handleApproveWork,
  loadComments, handleSearchComments, handleDeleteComment, handleApproveComment,
  loadAudits, loadChanges, handleApproveChange, loadLogs,
  loadSeries, handleSearchSeries, handleDeleteSeries, handleApproveSeries,
  switchTab, handleLogout,
} = useAdmin()

const tabs = [
  { key: 'users', label: '用户管理', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { key: 'works', label: '作品管理', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { key: 'comments', label: '评论管理', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9 8s9 3.582 9 8z' },
  { key: 'series', label: '合集管理', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { key: 'audits', label: '审核记录', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { key: 'changes', label: '变更审核', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { key: 'logs', label: '操作日志', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16M9 6V4h6v2' },
]

const roleMap = { 11: '普通用户', 22: '创作者', 55: '审核员', 66: '工单管理员', 77: '系统管理员' }
const roleLabel = (r) => roleMap[r] || `未知(${r})`
const roleBadge = (r) => r === 77 ? 'ap-badge-purple' : r === 55 || r === 66 ? 'ap-badge-blue' : r === 22 ? 'ap-badge-green' : ''

const statusMap = { 10: '正常', 20: '冻结', 30: '封禁' }
const statusLabel = (s) => statusMap[s] || `未知(${s})`
const statusBadge = (s) => s === 30 ? 'ap-badge-red' : s === 20 ? 'ap-badge-yellow' : 'ap-badge-green'

const approvalMap = { 10: '已通过', 20: '待审核', 30: '未通过' }
const approvalLabel = (s) => approvalMap[s] || '未知'
const approvalBadge = (s) => s === 10 ? 'ap-badge-green' : s === 20 ? 'ap-badge-yellow' : 'ap-badge-red'

const contentTypeMap = { 100: '作品', 200: '评论', 300: '合集', 400: '昵称' }
const contentTypeLabel = (t) => contentTypeMap[t] || `类型${t}`

const changeTypeMap = { 100: '昵称修改', 200: '权限申请', 300: '头像修改' }
const changeTypeLabel = (t) => changeTypeMap[t] || `类型${t}`
const changeTypeBadge = (t) => t === 200 ? 'ap-badge-yellow' : 'ap-badge-blue'

const changeContent = (item) => {
  if (item.type === 100) return `「${item.nickname || '—'}」`
  if (item.type === 200) return `申请 ${roleMap[item.user_role] || '角色'}（代码${item.user_role}）`
  if (item.type === 300) return item.avatar_url || '有头像待审'
  return '—'
}

const getAvatarSrc = (avatarPath) => {
  if (!avatarPath) return `${AVATAR_API}?filePath=default/1.png`
  return `${AVATAR_API}?filePath=${encodeURIComponent(avatarPath)}`
}

const getWorkImgSrc = (filePath) => {
  if (!filePath) return ''
  return `${WORK_IMAGE_API}?filePath=${encodeURIComponent(filePath)}`
}

onMounted(() => {
  switchTab('users')
})
</script>
