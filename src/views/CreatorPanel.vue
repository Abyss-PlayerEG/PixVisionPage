<template>
  <div class="cp-container">
    <!-- 侧边栏 -->
    <aside class="cp-sidebar">
      <div class="cp-sidebar-header">
        <h2 class="cp-sidebar-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 19l7-7 3 3-7 7-3-3z"/>
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
            <path d="M2 2l7.586 7.586"/>
            <circle cx="11" cy="11" r="2"/>
          </svg>
          创作中心
        </h2>
        <div class="cp-sidebar-user">
          <div class="cp-sidebar-avatar">
            <img :src="avatarUrl" alt="头像" class="cp-sidebar-avatar-img" />
          </div>
          <div class="cp-sidebar-user-info">
            <span class="cp-sidebar-greeting">{{ greetingText }}</span>
            <span class="cp-sidebar-nickname">{{ userInfo.nickname || '创作者' }}</span>
          </div>
        </div>
      </div>

      <nav class="cp-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="cp-nav-item"
          :class="{ active: activeTab === tab.id }"
          @click="switchTab(tab.id)"
        >
          <!-- 作品管理图标 -->
          <svg v-if="tab.icon === 'works'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          <!-- 合集管理图标 -->
          <svg v-else-if="tab.icon === 'series'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <!-- 上传作品图标 -->
          <svg v-else-if="tab.icon === 'upload'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span>{{ tab.label }}</span>
        </button>
      </nav>

      <div class="cp-sidebar-footer">
        <button class="cp-back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          <span>返回个人主页</span>
        </button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="cp-main">
      <!-- ========== 作品管理 ========== -->
      <template v-if="activeTab === 'works'">
        <div class="cp-topbar">
          <h1 class="cp-topbar-title">作品管理</h1>
          <div class="cp-topbar-actions">
            <Transition name="cp-batch">
              <div v-if="hasSelection" class="cp-batch-bar">
                <span class="cp-batch-count">已选 {{ selectedWorkIds.length }} 件作品</span>
                <button class="cp-btn cp-btn-primary cp-btn-sm" @click="openAddToSeriesDialog">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    <line x1="12" y1="11" x2="12" y2="17"/>
                    <line x1="9" y1="14" x2="15" y2="14"/>
                  </svg>
                  添加到合集
                </button>
                <button class="cp-btn cp-btn-danger cp-btn-sm" @click="handleBatchDeleteWorks">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  删除
                </button>
                <button class="cp-btn cp-btn-sm" @click="clearSelection">取消</button>
              </div>
            </Transition>
            <button class="cp-btn cp-btn-primary cp-btn-sm" @click="switchTab('upload')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              上传作品
            </button>
          </div>
        </div>

        <div class="cp-content">
          <!-- 筛选栏 -->
          <div class="cp-filter-bar">
            <div ref="filterTabsRef" class="cp-filter-tabs">
              <div class="cp-filter-indicator" :style="filterIndicatorStyle"></div>
              <button class="cp-filter-tab" :class="{ active: worksApprovalFilter === '' }" @click="setWorksApprovalFilter('')">全部</button>
              <button class="cp-filter-tab" :class="{ active: worksApprovalFilter === '10' }" @click="setWorksApprovalFilter('10')">已通过</button>
              <button class="cp-filter-tab" :class="{ active: worksApprovalFilter === '20' }" @click="setWorksApprovalFilter('20')">待审核</button>
              <button class="cp-filter-tab" :class="{ active: worksApprovalFilter === '30' }" @click="setWorksApprovalFilter('30')">未通过</button>
            </div>
            <div style="flex:1"></div>
            <!-- 搜索框 -->
            <div class="cp-search-wrapper" style="max-width:220px;">
              <input
                v-model="worksSearchTitle"
                class="cp-search-input"
                type="text"
                placeholder="搜索作品标题…"
                @keyup.enter="searchWorks"
              />
            </div>
            <button v-if="worksList.length > 0" class="cp-btn cp-btn-sm" @click="isAllSelected ? clearSelection() : toggleAllWorks()">
              {{ isAllSelected ? '取消全选' : '全选' }}
            </button>
          </div>

          <!-- 加载中 -->
          <div v-if="worksLoading && worksList.length === 0" class="cp-loading">
            <div class="cp-spinner"></div>
            <span>加载中...</span>
          </div>

          <!-- 空状态 -->
          <div v-else-if="worksList.length === 0" class="cp-empty">
            <svg class="cp-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <p class="cp-empty-title">还没有作品</p>
            <p class="cp-empty-desc">上传你的第一件作品吧</p>
            <button class="cp-btn cp-btn-primary" @click="switchTab('upload')">上传作品</button>
          </div>

          <!-- 作品网格 -->
          <div v-else class="cp-work-grid">
            <div
              v-for="work in worksList"
              :key="work.work_id"
              class="cp-work-card"
              :class="{ clickable: work.approval_status === 10 }"
              @click="work.approval_status === 10 && goToWorkDetail(work.work_id)"
            >
              <!-- 选择框 -->
              <div
                class="cp-work-checkbox"
                :class="{ checked: selectedWorkIds.includes(work.work_id) }"
                @click.stop="toggleWorkSelect(work.work_id)"
              >
                <svg v-if="selectedWorkIds.includes(work.work_id)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>

              <!-- 操作按钮 -->
              <div class="cp-work-actions">
                <button class="cp-work-action-btn" title="编辑作品" @click.stop="openEditWorkDialog(work)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button class="cp-work-action-btn danger" title="删除" @click.stop="confirmDeleteWork(work)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>

              <!-- 缩略图 -->
              <img
                v-if="work.thumbFullUrl"
                :src="work.thumbFullUrl"
                :alt="work.work_title"
                class="cp-work-thumb"
                loading="lazy"
              />
              <div v-else class="cp-work-thumb cp-work-thumb-placeholder">
                <!-- 待审核 -->
                <template v-if="work.approval_status === 20">
                  <svg class="cp-thumb-icon pending" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span class="cp-thumb-text pending">审核中</span>
                </template>
                <!-- 未过审 -->
                <template v-else-if="work.approval_status === 30">
                  <svg class="cp-thumb-icon rejected" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  <span class="cp-thumb-text rejected">审核未通过</span>
                </template>
                <!-- 其他/默认 -->
                <template v-else>
                  <svg class="cp-thumb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span class="cp-thumb-text">暂无预览</span>
                </template>
              </div>

              <!-- 信息区 -->
              <div class="cp-work-info">
                <p class="cp-work-title" :title="work.work_title">{{ work.work_title || '未命名作品' }}</p>
                <div class="cp-work-meta">
                  <span class="cp-work-time">{{ formatTime(work.create_time) }}</span>
                  <span class="cp-status-badge" :class="approvalStatusClass(work.approval_status)">
                    {{ approvalStatusLabel(work.approval_status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 加载更多 -->
          <div v-if="worksLoading && worksList.length > 0" class="cp-loading" style="padding-top:16px;">
            <div class="cp-spinner"></div>
            <span>加载更多...</span>
          </div>

          <!-- 滚动加载触发器 -->
          <div ref="worksScrollTrigger" style="height: 1px;"></div>
        </div>
      </template>

      <!-- ========== 合集管理 ========== -->
      <template v-if="activeTab === 'series'">
        <div class="cp-topbar">
          <h1 class="cp-topbar-title">合集管理</h1>
          <div class="cp-topbar-actions">
            <button class="cp-btn cp-btn-primary cp-btn-sm" @click="openAddSeriesDialog">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              新建合集
            </button>
          </div>
        </div>

        <div class="cp-content">
          <!-- 搜索栏 -->
          <div class="cp-filter-bar">
            <div class="cp-search-wrapper" style="max-width:320px;flex:1;">
              <input
                v-model="seriesKeyword"
                class="cp-search-input"
                type="text"
                placeholder="搜索合集名称…"
                @keyup.enter="searchSeries"
              />
            </div>
          </div>

          <!-- 加载中 -->
          <div v-if="seriesLoading && seriesList.length === 0" class="cp-loading">
            <div class="cp-spinner"></div>
            <span>加载中...</span>
          </div>

          <!-- 空状态 -->
          <div v-else-if="seriesList.length === 0" class="cp-empty">
            <svg class="cp-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            <p class="cp-empty-title">还没有合集</p>
            <p class="cp-empty-desc">创建合集来组织你的作品</p>
            <button class="cp-btn cp-btn-primary" @click="openAddSeriesDialog">新建合集</button>
          </div>

          <!-- 合集网格 -->
          <div v-else class="cp-series-grid">
            <div
              v-for="series in seriesList"
              :key="series.series_id"
              class="cp-series-card"
              @click="openSeriesDetail(series)"
            >
              <div class="cp-series-header">
                <h3 class="cp-series-title" :title="series.series_title">{{ series.series_title || '未命名合集' }}</h3>
                <div class="cp-series-actions">
                  <button class="cp-work-action-btn" title="编辑" @click.stop="openEditSeriesDialog(series)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button class="cp-work-action-btn danger" title="删除" @click.stop="confirmDeleteSeries(series)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
              <p v-if="series.about_text" class="cp-series-desc">{{ series.about_text }}</p>
              <p class="cp-series-meta">{{ formatTime(series.create_time) }}</p>
            </div>
          </div>
        </div>
      </template>

      <!-- ========== 上传作品 ========== -->
      <template v-if="activeTab === 'upload'">
        <div class="cp-topbar">
          <h1 class="cp-topbar-title">上传作品</h1>
        </div>

        <div class="cp-content">
          <div class="cp-upload-area">
            <!-- 上传区域 -->
            <div
              class="cp-upload-dropzone"
              :class="{ 'has-file': uploadForm.file, 'is-dragover': isUploadDragOver }"
              @click="triggerFileInput"
              @dragenter.prevent="onUploadDragEnter"
              @dragover.prevent="onUploadDragOver"
              @dragleave.prevent="onUploadDragLeave"
              @drop.prevent="onUploadDrop"
            >
              <template v-if="!uploadForm.file">
                <svg class="cp-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p class="cp-upload-text">点击或拖拽图片到此处上传</p>
                <p class="cp-upload-hint">支持 JPG / JPEG / PNG 格式，最大 32MB · 可拖拽上传</p>
              </template>
              <template v-else>
                <img :src="uploadForm.filePreview" class="cp-upload-preview" alt="预览" />
                <button class="cp-upload-remove-btn" @click.stop="removeUploadFile" title="移除图片">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </template>
              <input ref="fileInputRef" type="file" accept="image/jpeg,image/png" style="display:none;" @change="onFileSelect" />
            </div>

            <!-- 作品标题 -->
            <div class="cp-form-group">
              <label class="cp-form-label">作品标题 *</label>
              <input
                v-model="uploadForm.workTitle"
                class="cp-form-input"
                type="text"
                placeholder="请输入作品标题（最多16个中文字符）"
                maxlength="16"
              />
              <span class="cp-form-tip">{{ uploadForm.workTitle.length }}/16</span>
            </div>

            <!-- 所属合集 -->
            <div class="cp-form-group">
              <label class="cp-form-label">所属合集</label>
              <select v-model="uploadForm.seriesId" class="cp-form-select">
                <option :value="0">不加入任何合集</option>
                <option v-for="s in seriesList" :key="s.series_id" :value="s.series_id">{{ s.series_title }}</option>
              </select>
            </div>

            <!-- 原创/转载 -->
            <div class="cp-form-group">
              <label class="cp-form-label">作品类型 *</label>
              <div ref="uploadRadioGroupRef" class="cp-radio-group">
                <div class="cp-radio-indicator" :style="uploadRadioIndicatorStyle"></div>
                <button class="cp-radio-btn" :class="{ active: uploadForm.isOriginal === true }" @click="uploadForm.isOriginal = true">原创</button>
                <button class="cp-radio-btn" :class="{ active: uploadForm.isOriginal === false }" @click="uploadForm.isOriginal = false">转载</button>
              </div>
            </div>

            <!-- 转载链接 -->
            <Transition
              @before-enter="onOutUrlBeforeEnter"
              @enter="onOutUrlEnter"
              @leave="onOutUrlLeave"
            >
              <div v-if="!uploadForm.isOriginal" class="cp-form-group">
                <label class="cp-form-label">转载链接 *</label>
                <input
                  v-model="uploadForm.outUrl"
                  class="cp-form-input"
                  type="url"
                  placeholder="请输入原作链接"
                />
              </div>
            </Transition>

            <!-- 提交按钮 -->
            <div style="display:flex;gap:12px;padding-top:8px;">
              <button class="cp-btn cp-btn-primary" :disabled="uploadLoading" @click="handleUpload">
                <template v-if="uploadLoading">
                  <div class="cp-spinner" style="width:14px;height:14px;"></div>
                  上传中...
                </template>
                <template v-else>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  提交上传
                </template>
              </button>
              <button class="cp-btn" @click="resetUploadForm">重置</button>
            </div>
          </div>
        </div>
      </template>
    </main>

    <!-- ========== 弹窗：编辑作品 ========== -->
    <teleport to="body">
      <div v-if="showEditWorkDialog" ref="editWorkOverlayRef" class="cp-dialog-overlay" @click.self="closeEditWorkDialog">
        <div ref="editWorkDialogRef" class="cp-dialog cp-dialog-wide" @click.stop>
          <h3 class="cp-dialog-title">编辑作品</h3>
          <div class="cp-edit-layout">
            <!-- 左侧：图片预览/上传 -->
            <div class="cp-edit-left">
              <div 
                class="cp-edit-image-area"
                :class="{ 'is-dragover': isEditDragOver }"
                @dragenter.prevent="onEditDragEnter"
                @dragover.prevent="onEditDragOver"
                @dragleave.prevent="onEditDragLeave"
                @drop.prevent="onEditDrop"
              >
                <img 
                  v-if="editWorkForm.imagePreview" 
                  :src="editWorkForm.imagePreview" 
                  class="cp-edit-image-preview"
                  alt="作品预览"
                />
                <div v-else class="cp-edit-image-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:32px;height:32px;margin-bottom:12px;">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span>点击或拖拽图片到此处</span>
                </div>
                <input 
                  ref="editFileInput" 
                  type="file" 
                  accept="image/jpeg,image/png" 
                  style="display:none;" 
                  @change="onEditFileSelect"
                />
              </div>
              <div class="cp-edit-image-actions">
                <button class="cp-btn cp-btn-sm" @click="$refs.editFileInput.click()">更换图片</button>
                <button v-if="editWorkForm.file" class="cp-btn cp-btn-sm" @click="removeEditFile">撤销更换</button>
              </div>
              <span class="cp-form-tip" style="text-align:center;">支持 JPG/JPEG/PNG，最大 32MB · 可拖拽上传</span>
            </div>

            <!-- 右侧：表单 -->
            <div class="cp-edit-right">
              <!-- 作品标题 -->
              <div class="cp-form-group">
                <label class="cp-form-label">作品标题</label>
                <input
                  v-model="editWorkForm.workTitle"
                  class="cp-form-input"
                  type="text"
                  placeholder="请输入作品标题（最多16个中文字符）"
                  maxlength="16"
                />
                <span class="cp-form-tip">{{ editWorkForm.workTitle.length }}/16</span>
              </div>

              <!-- 所属合集 -->
              <div class="cp-form-group">
                <label class="cp-form-label">所属合集</label>
                <select v-model="editWorkForm.seriesId" class="cp-form-select">
                  <option :value="0">不加入任何合集</option>
                  <option v-for="s in seriesList" :key="s.series_id" :value="s.series_id">{{ s.series_title }}</option>
                </select>
              </div>

              <!-- 原创/转载 -->
              <div class="cp-form-group">
                <label class="cp-form-label">作品类型</label>
                <div ref="editRadioGroupRef" class="cp-radio-group">
                  <div class="cp-radio-indicator" :style="editRadioIndicatorStyle"></div>
                  <button class="cp-radio-btn" :class="{ active: editWorkForm.isOriginal === true }" @click="toggleEditOriginal(true)">原创</button>
                  <button class="cp-radio-btn" :class="{ active: editWorkForm.isOriginal === false }" @click="toggleEditOriginal(false)">转载</button>
                </div>
              </div>

              <!-- 转载链接 -->
              <Transition
                @before-enter="onOutUrlBeforeEnter"
                @enter="onOutUrlEnter"
                @leave="onOutUrlLeave"
              >
                <div v-if="!editWorkForm.isOriginal" class="cp-form-group">
                  <label class="cp-form-label">转载链接 *</label>
                  <input
                    v-model="editWorkForm.outUrl"
                    class="cp-form-input"
                    type="url"
                    placeholder="请输入原作链接"
                  />
                </div>
              </Transition>

              <p class="cp-edit-tip">修改后作品将重新进入审核队列</p>
            </div>
          </div>

          <div class="cp-dialog-footer">
            <button class="cp-btn" :disabled="editWorkSubmitting" @click="closeEditWorkDialog">取消</button>
            <button class="cp-btn cp-btn-primary" :disabled="editWorkSubmitting" @click="submitEditWork">
              <template v-if="editWorkSubmitting">保存中...</template>
              <template v-else>保存修改</template>
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- ========== 弹窗：新建/编辑合集 ========== -->
    <teleport to="body">
      <div v-if="showAddSeriesDialog || showEditSeriesDialog" ref="seriesOverlayRef" class="cp-dialog-overlay" @click.self="closeSeriesDialog">
        <div ref="seriesDialogRef" class="cp-dialog" @click.stop>
          <h3 class="cp-dialog-title">{{ showEditSeriesDialog ? '编辑合集' : '新建合集' }}</h3>
          <div style="display:flex;flex-direction:column;gap:16px;">
            <div class="cp-form-group">
              <label class="cp-form-label">合集名称 *</label>
              <input
                v-model="seriesForm.seriesTitle"
                class="cp-form-input"
                type="text"
                placeholder="请输入合集名称（最多16个中文字符）"
                maxlength="16"
              />
              <span class="cp-form-tip">{{ seriesForm.seriesTitle.length }}/16</span>
            </div>
            <div class="cp-form-group">
              <label class="cp-form-label">合集描述</label>
              <textarea
                v-model="seriesForm.aboutText"
                class="cp-form-textarea"
                placeholder="请输入合集描述（最多24个中文字符）"
                maxlength="24"
                rows="3"
              ></textarea>
              <span class="cp-form-tip">{{ seriesForm.aboutText.length }}/24</span>
            </div>
          </div>
          <div class="cp-dialog-footer">
            <button class="cp-btn" @click="closeSeriesDialog">取消</button>
            <button class="cp-btn cp-btn-primary" :disabled="!seriesForm.seriesTitle.trim()" @click="submitSeriesForm">
              {{ showEditSeriesDialog ? '保存修改' : '创建合集' }}
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- ========== 弹窗：合集详情 ========== -->
    <teleport to="body">
      <div v-if="showSeriesDetailDialog" ref="seriesDetailOverlayRef" class="cp-dialog-overlay" @click.self="closeSeriesDetailDialog">
        <div ref="seriesDetailDialogRef" class="cp-dialog cp-dialog-wide" @click.stop>
          <!-- 标题栏 - 固定不滚动 -->
          <div class="cp-dialog-header">
            <h3 class="cp-dialog-title">{{ seriesDetail?.series_title || '合集详情' }}</h3>
            <button class="cp-dialog-close" @click="closeSeriesDetailDialog">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <!-- 内容区域 - 可滚动 -->
          <div class="cp-dialog-body">
            <template v-if="seriesDetail">
              <!-- 合集描述 -->
              <div v-if="seriesDetail.about_text" class="cp-series-detail-desc">
                {{ seriesDetail.about_text }}
              </div>
              
              <!-- 编辑合集信息 -->
              <div class="cp-series-detail-edit">
                <div class="cp-form-group">
                  <label class="cp-form-label">合集名称</label>
                  <input
                    v-model="seriesDetailForm.seriesTitle"
                    class="cp-form-input"
                    type="text"
                    placeholder="请输入合集名称"
                    maxlength="16"
                  />
                </div>
                <div class="cp-form-group">
                  <label class="cp-form-label">合集描述</label>
                  <textarea
                    v-model="seriesDetailForm.aboutText"
                    class="cp-form-textarea"
                    placeholder="请输入合集描述"
                    maxlength="24"
                    rows="2"
                  ></textarea>
                </div>
                <button class="cp-btn cp-btn-primary cp-btn-sm" @click="submitSeriesDetailEdit">保存修改</button>
              </div>
              
              <!-- 作品列表 -->
              <div class="cp-series-detail-works">
                <h4 class="cp-series-detail-works-title">合集作品 ({{ seriesDetailWorks.length }})</h4>
                
                <!-- 作品列表加载中 -->
                <div v-if="seriesDetailLoading" class="cp-series-detail-loading">
                  <div class="cp-spinner-sm"></div>
                  <span>加载作品中...</span>
                </div>
                
                <!-- 作品列表为空 -->
                <div v-else-if="seriesDetailWorks.length === 0" class="cp-empty-mini">
                  <p>暂无作品</p>
                </div>
                
                <!-- 作品列表 -->
                <div v-else class="cp-series-detail-grid">
                  <div
                    v-for="work in seriesDetailWorks"
                    :key="work.work_id"
                    class="cp-series-detail-work"
                  >
                    <img
                      v-if="work.thumbFullUrl"
                      :src="work.thumbFullUrl"
                      :alt="work.work_title"
                      class="cp-series-detail-thumb"
                    />
                    <div v-else class="cp-series-detail-thumb-placeholder">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                    <div class="cp-series-detail-work-info">
                      <p class="cp-series-detail-work-title">{{ work.work_title || '未命名' }}</p>
                      <button class="cp-btn cp-btn-danger cp-btn-sm" @click="removeWorkFromSeries(work.work_id)">移除</button>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </teleport>

    <!-- ========== 弹窗：批量添加到合集 ========== -->
    <teleport to="body">
      <div v-if="showAddToSeriesDialog" ref="addToSeriesOverlayRef" class="cp-dialog-overlay" @click.self="closeAddToSeriesDialog">
        <div ref="addToSeriesDialogRef" class="cp-dialog" @click.stop>
          <h3 class="cp-dialog-title">添加到合集</h3>
          <div style="display:flex;flex-direction:column;gap:16px;">
            <p style="font-size:14px;color:#aaa;margin:0;">将选中的 {{ selectedWorkIds.length }} 件作品添加到：</p>
            <div class="cp-form-group">
              <label class="cp-form-label">选择合集 *</label>
              <select v-model="addToSeriesTargetId" class="cp-form-select">
                <option :value="null" disabled>请选择目标合集</option>
                <option v-for="s in seriesList" :key="s.series_id" :value="s.series_id">{{ s.series_title }}</option>
              </select>
            </div>
            <p v-if="seriesList.length === 0" style="font-size:13px;color:#7e7e7e;margin:0;">暂无合集，请先创建合集</p>
          </div>
          <div class="cp-dialog-footer">
            <button class="cp-btn" @click="closeAddToSeriesDialog">取消</button>
            <button class="cp-btn cp-btn-primary" :disabled="!addToSeriesTargetId" @click="submitAddToSeries">确认添加</button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- ========== 弹窗：删除确认（使用统一组件） ========== -->
    <ConfirmDialog
      v-model:show="showDeleteDialog"
      :title="deleteDialogTitle"
      :message="deleteDialogMessage"
      type="danger"
      yes-text="确认删除"
      no-text="取消"
      @confirm="executeDelete"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { useCreatorPanel } from '@/composables/useCreatorPanel'
import { showError } from '@/utils/notification'
import { getAvatarUrl } from '@/config/api'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import '@/assets/CSS/creatorPanel.css'

const {
  // 导航
  activeTab, tabs, switchTab,
  // 用户
  userInfo, userStats,
  // 作品管理
  worksList, worksLoading, worksTotal, worksApprovalFilter, worksSearchTitle,
  selectedWorkIds, isAllSelected, hasSelection,
  loadWorks, searchWorks, setWorksApprovalFilter, handleDeleteWork, handleBatchDeleteWorks, handleBatchAddToSeries, handleUpdateWork,
  toggleWorkSelect, toggleAllWorks, clearSelection,
  // 合集管理
  seriesList, seriesLoading, seriesTotal, seriesKeyword,
  loadSeries, searchSeries, handleAddSeries, handleUpdateSeries, handleDeleteSeries,
  // 合集详情
  seriesDetail, seriesDetailLoading, seriesDetailWorks,
  loadSeriesDetail, handleRemoveWorkFromSeries,
  // 上传
  uploadForm, uploadLoading, resetUploadForm, setUploadFile, removeUploadFile, handleUpload,
  // 统计
  stats,
  // 工具
  approvalStatusLabel, approvalStatusClass, formatTime,
  // 路由
  goBack,
} = useCreatorPanel()

const router = useRouter()

// 跳转到作品详情页
const goToWorkDetail = (workId) => {
  router.push(`/work/${workId}`)
}

// ==================== 滑动指示器工具函数 ====================
const updateIndicator = (containerRef, activeSelector, styleRef) => {
  nextTick(() => {
    if (!containerRef) return
    const activeBtn = containerRef.querySelector(activeSelector)
    if (activeBtn) {
      const containerRect = containerRef.getBoundingClientRect()
      const btnRect = activeBtn.getBoundingClientRect()
      styleRef.value = {
        left: `${btnRect.left - containerRect.left}px`,
        width: `${btnRect.width}px`
      }
    }
  })
}

// ==================== 筛选标签滑动指示器 ====================
const filterTabsRef = ref(null)
const filterIndicatorStyle = ref({ left: '4px', width: '0px' })

const updateFilterIndicator = () => {
  updateIndicator(filterTabsRef.value, '.cp-filter-tab.active', filterIndicatorStyle)
}

// 监听筛选条件变化，更新指示器位置
watch(() => worksApprovalFilter.value, updateFilterIndicator, { immediate: true })

// ==================== 单选按钮滑动指示器 ====================
const uploadRadioGroupRef = ref(null)
const uploadRadioIndicatorStyle = ref({ left: '4px', width: '0px' })

const editRadioGroupRef = ref(null)
const editRadioIndicatorStyle = ref({ left: '4px', width: '0px' })

const updateUploadRadioIndicator = () => {
  updateIndicator(uploadRadioGroupRef.value, '.cp-radio-btn.active', uploadRadioIndicatorStyle)
}

const updateEditRadioIndicator = () => {
  updateIndicator(editRadioGroupRef.value, '.cp-radio-btn.active', editRadioIndicatorStyle)
}

// 监听上传表单 isOriginal 变化
watch(() => uploadForm.isOriginal, () => {
  // 上传表单中的 radio group 可能不存在（tab 未切换到上传），需要检查
  if (uploadRadioGroupRef.value) {
    updateUploadRadioIndicator()
  }
})

// 窗口大小变化时更新所有指示器
const handleResize = () => {
  updateFilterIndicator()
  updateUploadRadioIndicator()
  updateEditRadioIndicator()
}

// 头像 URL（兼容 Profile 处理过的完整 URL 和登录时的原始 avatar_url）
const avatarUrl = computed(() => {
  const info = userInfo.value
  if (info.avatar) return info.avatar
  if (info.avatar_url) return getAvatarUrl(info.avatar_url)
  return getAvatarUrl(null)
})

// 问候语
const greetingText = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  if (hour < 22) return '晚上好'
  return '夜深了'
})

// ==================== 文件上传 ====================
const fileInputRef = ref(null)

const triggerFileInput = () => {
  if (uploadForm.file) return
  fileInputRef.value?.click()
}

const onFileSelect = (e) => {
  const file = e.target.files?.[0]
  if (file) setUploadFile(file)
  // 清空 input 以允许重复选择同一文件
  e.target.value = ''
}

// ── 拖拽上传 ──
const isUploadDragOver = ref(false)
const uploadDragCounter = ref(0)  // 处理嵌套元素触发的多次 enter/leave

const onUploadDragEnter = (e) => {
  e.preventDefault()
  uploadDragCounter.value++
  if (uploadDragCounter.value === 1) isUploadDragOver.value = true
}
const onUploadDragOver = (e) => { e.preventDefault() }
const onUploadDragLeave = (e) => {
  e.preventDefault()
  uploadDragCounter.value--
  if (uploadDragCounter.value <= 0) {
    uploadDragCounter.value = 0
    isUploadDragOver.value = false
  }
}
const onUploadDrop = (e) => {
  e.preventDefault()
  isUploadDragOver.value = false
  uploadDragCounter.value = 0
  const file = e.dataTransfer?.files?.[0]
  if (file) setUploadFile(file)
}

// 自动加载合集列表（供上传时选择）
watch(activeTab, (tab) => {
  if (tab === 'upload') {
    if (seriesList.value.length === 0) {
      loadSeries({ reset: true })
    }
    // 切换到上传 tab 时更新 radio 指示器位置
    nextTick(() => {
      updateUploadRadioIndicator()
    })
  }
})

// ==================== 编辑作品 ====================
const showEditWorkDialog = ref(false)
const editWorkTarget = ref(null)
const editWorkSubmitting = ref(false)
const editWorkForm = reactive({
  workTitle: '',
  seriesId: 0,
  isOriginal: true,
  outUrl: '',
  file: null,
  imagePreview: '',
})

// 监听编辑表单 isOriginal 变化
watch(() => editWorkForm.isOriginal, () => {
  // 编辑弹窗中的 radio group 可能不存在，需要检查
  if (editRadioGroupRef.value) {
    updateEditRadioIndicator()
  }
})

// GSAP 动画 refs
const editWorkOverlayRef = ref(null)
const editWorkDialogRef = ref(null)

const editFileInput = ref(null)

const openEditWorkDialog = (work) => {
  editWorkTarget.value = work
  editWorkForm.workTitle = work.work_title || ''
  editWorkForm.seriesId = work.series_id || 0
  editWorkForm.isOriginal = work.is_original !== false
  editWorkForm.outUrl = work.out_url || ''
  editWorkForm.file = null
  editWorkForm.imagePreview = work.thumbFullUrl || ''
  showEditWorkDialog.value = true
  // 打开时自动加载合集列表
  if (seriesList.value.length === 0) {
    loadSeries({ reset: true })
  }
  // GSAP 入场动画
  nextTick(() => {
    // 更新编辑弹窗中的 radio 指示器位置
    updateEditRadioIndicator()
    if (editWorkOverlayRef.value && editWorkDialogRef.value) {
      gsap.set(editWorkOverlayRef.value, { autoAlpha: 0 })
      gsap.set(editWorkDialogRef.value, { scale: 0.9, autoAlpha: 0 })
      gsap.timeline()
        .to(editWorkOverlayRef.value, { autoAlpha: 1, duration: 0.25, ease: 'power2.out' }, 0)
        .to(editWorkDialogRef.value, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'back.out(1.4)' }, 0.04)
    }
  })
}

const closeEditWorkDialog = () => {
  if (editWorkOverlayRef.value && editWorkDialogRef.value) {
    const tl = gsap.timeline({
      onComplete: () => {
        showEditWorkDialog.value = false
        editWorkSubmitting.value = false
      }
    })
    tl.to(editWorkDialogRef.value, { scale: 0.95, autoAlpha: 0, duration: 0.2, ease: 'power2.in' }, 0)
      .to(editWorkOverlayRef.value, { autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, 0)
  } else {
    showEditWorkDialog.value = false
  }
}

// ── 编辑弹窗文件选择 ──
const onEditFileSelect = (e) => {
  const file = e.target.files?.[0]
  if (file) setEditFile(file)
  e.target.value = ''
}

const setEditFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    showError('仅支持 JPG/JPEG/PNG 格式')
    return
  }
  if (file.size > 32 * 1024 * 1024) {
    showError('图片大小不能超过 32MB')
    return
  }
  editWorkForm.file = file
  editWorkForm.imagePreview = URL.createObjectURL(file)
}

const removeEditFile = () => {
  if (editWorkForm.imagePreview && editWorkForm.file) {
    URL.revokeObjectURL(editWorkForm.imagePreview)
  }
  editWorkForm.file = null
  editWorkForm.imagePreview = editWorkTarget.value?.thumbFullUrl || ''
}

// ── 编辑弹窗拖拽上传 ──
const isEditDragOver = ref(false)
const editDragCounter = ref(0)

const onEditDragEnter = (e) => {
  e.preventDefault()
  editDragCounter.value++
  if (editDragCounter.value === 1) isEditDragOver.value = true
}
const onEditDragOver = (e) => { e.preventDefault() }
const onEditDragLeave = (e) => {
  e.preventDefault()
  editDragCounter.value--
  if (editDragCounter.value <= 0) {
    editDragCounter.value = 0
    isEditDragOver.value = false
  }
}
const onEditDrop = (e) => {
  e.preventDefault()
  isEditDragOver.value = false
  editDragCounter.value = 0
  const file = e.dataTransfer?.files?.[0]
  if (file) setEditFile(file)
}

// ── 转载链接动画钩子 ──
const onOutUrlBeforeEnter = (el) => {
  gsap.set(el, { opacity: 0, height: 0, overflow: 'hidden' })
}

const onOutUrlEnter = (el, done) => {
  gsap.to(el, {
    opacity: 1,
    height: 'auto',
    duration: 0.3,
    ease: 'power2.out',
    onComplete: () => {
      el.style.overflow = ''
      done()
    }
  })
}

const onOutUrlLeave = (el, done) => {
  gsap.to(el, {
    opacity: 0,
    height: 0,
    duration: 0.25,
    ease: 'power2.in',
    onComplete: done
  })
}

// ── 切换原创/转载 ──
const toggleEditOriginal = (value) => {
  if (editWorkForm.isOriginal === value) return
  editWorkForm.isOriginal = value
}

const submitEditWork = async () => {
  if (!editWorkTarget.value) return
  
  // 参数校验
  const newTitle = editWorkForm.workTitle.trim()
  if (!newTitle) {
    showError('请输入作品标题')
    return
  }
  if (newTitle.length > 16) {
    showError('作品标题最多16个中文字符')
    return
  }
  if (!editWorkForm.isOriginal && !editWorkForm.outUrl.trim()) {
    showError('转载作品必须填写外部链接')
    return
  }

  editWorkSubmitting.value = true
  await handleUpdateWork({
    workId: editWorkTarget.value.work_id,
    workTitle: newTitle,
    file: editWorkForm.file,
    seriesId: editWorkForm.seriesId,
    isOriginal: editWorkForm.isOriginal,
    outUrl: editWorkForm.isOriginal ? undefined : editWorkForm.outUrl.trim(),
  })
  editWorkSubmitting.value = false
  closeEditWorkDialog()
}

// ==================== 合集弹窗 ====================
const showAddSeriesDialog = ref(false)
const showEditSeriesDialog = ref(false)
const editSeriesTarget = ref(null)
const seriesForm = reactive({ seriesTitle: '', aboutText: '' })

// GSAP 动画 refs
const seriesOverlayRef = ref(null)
const seriesDialogRef = ref(null)

const openAddSeriesDialog = () => {
  showAddSeriesDialog.value = true
  // GSAP 入场动画
  nextTick(() => {
    if (seriesOverlayRef.value && seriesDialogRef.value) {
      gsap.set(seriesOverlayRef.value, { autoAlpha: 0 })
      gsap.set(seriesDialogRef.value, { scale: 0.9, autoAlpha: 0 })
      gsap.timeline()
        .to(seriesOverlayRef.value, { autoAlpha: 1, duration: 0.25, ease: 'power2.out' }, 0)
        .to(seriesDialogRef.value, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'back.out(1.4)' }, 0.04)
    }
  })
}

const openEditSeriesDialog = (series) => {
  editSeriesTarget.value = series
  seriesForm.seriesTitle = series.series_title || ''
  seriesForm.aboutText = series.about_text || ''
  showEditSeriesDialog.value = true
  // GSAP 入场动画
  nextTick(() => {
    if (seriesOverlayRef.value && seriesDialogRef.value) {
      gsap.set(seriesOverlayRef.value, { autoAlpha: 0 })
      gsap.set(seriesDialogRef.value, { scale: 0.9, autoAlpha: 0 })
      gsap.timeline()
        .to(seriesOverlayRef.value, { autoAlpha: 1, duration: 0.25, ease: 'power2.out' }, 0)
        .to(seriesDialogRef.value, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'back.out(1.4)' }, 0.04)
    }
  })
}

const closeSeriesDialog = () => {
  if (seriesOverlayRef.value && seriesDialogRef.value) {
    const tl = gsap.timeline({
      onComplete: () => {
        showAddSeriesDialog.value = false
        showEditSeriesDialog.value = false
        editSeriesTarget.value = null
        seriesForm.seriesTitle = ''
        seriesForm.aboutText = ''
      }
    })
    tl.to(seriesDialogRef.value, { scale: 0.95, autoAlpha: 0, duration: 0.2, ease: 'power2.in' }, 0)
      .to(seriesOverlayRef.value, { autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, 0)
  } else {
    showAddSeriesDialog.value = false
    showEditSeriesDialog.value = false
    editSeriesTarget.value = null
    seriesForm.seriesTitle = ''
    seriesForm.aboutText = ''
  }
}

const submitSeriesForm = async () => {
  const title = seriesForm.seriesTitle.trim()
  if (!title) return

  if (showEditSeriesDialog.value && editSeriesTarget.value) {
    await handleUpdateSeries({
      seriesId: editSeriesTarget.value.series_id,
      seriesTitle: title,
      aboutText: seriesForm.aboutText.trim() || undefined,
    })
  } else {
    await handleAddSeries({
      seriesTitle: title,
      aboutText: seriesForm.aboutText.trim() || undefined,
    })
  }
  closeSeriesDialog()
}

// ==================== 合集详情弹窗 ====================
const showSeriesDetailDialog = ref(false)
const seriesDetailForm = reactive({ seriesTitle: '', aboutText: '' })
const seriesDetailOverlayRef = ref(null)
const seriesDetailDialogRef = ref(null)

const openSeriesDetail = async (series) => {
  // 1. 先保存数据（弹窗还没显示）
  seriesDetail.value = {
    series_id: series.series_id,
    series_title: series.series_title,
    about_text: series.about_text,
  }
  seriesDetailForm.seriesTitle = series.series_title || ''
  seriesDetailForm.aboutText = series.about_text || ''
  seriesDetailWorks.value = []  // 清空旧作品列表

  // 2. 显示弹窗
  showSeriesDetailDialog.value = true

  // 3. 等待 DOM 渲染
  await nextTick()

  // 4. 设置初始状态并执行入场动画
  if (seriesDetailOverlayRef.value && seriesDetailDialogRef.value) {
    gsap.set(seriesDetailOverlayRef.value, { autoAlpha: 0 })
    gsap.set(seriesDetailDialogRef.value, { scale: 0.9, autoAlpha: 0 })
    gsap.timeline()
      .to(seriesDetailOverlayRef.value, { autoAlpha: 1, duration: 0.25, ease: 'power2.out' }, 0)
      .to(seriesDetailDialogRef.value, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'back.out(1.4)' }, 0.04)
  }

  // 5. 加载作品列表（异步进行，不阻塞弹窗显示）
  loadSeriesDetail(series.series_id)
}

const closeSeriesDetailDialog = () => {
  if (seriesDetailOverlayRef.value && seriesDetailDialogRef.value) {
    const tl = gsap.timeline({
      onComplete: () => {
        showSeriesDetailDialog.value = false
      }
    })
    tl.to(seriesDetailDialogRef.value, { scale: 0.95, autoAlpha: 0, duration: 0.2, ease: 'power2.in' }, 0)
      .to(seriesDetailOverlayRef.value, { autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, 0)
  } else {
    showSeriesDetailDialog.value = false
  }
}

const submitSeriesDetailEdit = async () => {
  if (!seriesDetail.value) return
  const title = seriesDetailForm.seriesTitle.trim()
  if (!title) {
    showError('请输入合集名称')
    return
  }
  await handleUpdateSeries({
    seriesId: seriesDetail.value.series_id,
    seriesTitle: title,
    aboutText: seriesDetailForm.aboutText.trim() || undefined,
  })
}

const removeWorkFromSeries = async (workId) => {
  if (!seriesDetail.value) return
  await handleRemoveWorkFromSeries(workId, seriesDetail.value.series_id)
}

// ==================== 删除确认 ====================
const showDeleteDialog = ref(false)
const deleteDialogTitle = ref('')
const deleteDialogMessage = ref('')
let deleteCallback = null

const confirmDeleteWork = (work) => {
  deleteDialogTitle.value = '删除作品'
  deleteDialogMessage.value = `确定要删除作品「${work.work_title || '未命名'}」吗？此操作不可撤销。`
  deleteCallback = () => handleDeleteWork(work.work_id)
  showDeleteDialog.value = true
}

const confirmDeleteSeries = (series) => {
  deleteDialogTitle.value = '删除合集'
  deleteDialogMessage.value = `确定要删除合集「${series.series_title || '未命名'}」吗？合集内的作品不会被删除。`
  deleteCallback = () => handleDeleteSeries(series.series_id, false)
  showDeleteDialog.value = true
}

const executeDelete = async () => {
  if (deleteCallback) await deleteCallback()
  showDeleteDialog.value = false
  deleteCallback = null
}

// ==================== 批量添加到合集弹窗 ====================
const showAddToSeriesDialog = ref(false)
const addToSeriesTargetId = ref(null)
const addToSeriesOverlayRef = ref(null)
const addToSeriesDialogRef = ref(null)

const openAddToSeriesDialog = () => {
  addToSeriesTargetId.value = null
  showAddToSeriesDialog.value = true
  // 打开时自动加载合集列表
  if (seriesList.value.length === 0) {
    loadSeries({ reset: true })
  }
  // GSAP 入场动画
  nextTick(() => {
    if (addToSeriesOverlayRef.value && addToSeriesDialogRef.value) {
      gsap.set(addToSeriesOverlayRef.value, { autoAlpha: 0 })
      gsap.set(addToSeriesDialogRef.value, { scale: 0.9, autoAlpha: 0 })
      gsap.timeline()
        .to(addToSeriesOverlayRef.value, { autoAlpha: 1, duration: 0.25, ease: 'power2.out' }, 0)
        .to(addToSeriesDialogRef.value, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'back.out(1.4)' }, 0.04)
    }
  })
}

const closeAddToSeriesDialog = () => {
  if (addToSeriesOverlayRef.value && addToSeriesDialogRef.value) {
    const tl = gsap.timeline({
      onComplete: () => {
        showAddToSeriesDialog.value = false
        addToSeriesTargetId.value = null
      }
    })
    tl.to(addToSeriesDialogRef.value, { scale: 0.95, autoAlpha: 0, duration: 0.2, ease: 'power2.in' }, 0)
      .to(addToSeriesOverlayRef.value, { autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, 0)
  } else {
    showAddToSeriesDialog.value = false
    addToSeriesTargetId.value = null
  }
}

const submitAddToSeries = async () => {
  if (!addToSeriesTargetId.value) {
    showError('请选择目标合集')
    return
  }
  await handleBatchAddToSeries(addToSeriesTargetId.value)
  closeAddToSeriesDialog()
}

// ==================== 滚动加载 ====================
const worksScrollTrigger = ref(null)
let scrollObserver = null

// 初始化 IntersectionObserver
const initScrollObserver = () => {
  // 先断开旧的
  if (scrollObserver) {
    scrollObserver.disconnect()
    scrollObserver = null
  }
  
  nextTick(() => {
    if (worksScrollTrigger.value) {
      scrollObserver = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && worksList.value.length < worksTotal.value && !worksLoading.value) {
            loadWorks()
          }
        },
        { rootMargin: '200px' }
      )
      scrollObserver.observe(worksScrollTrigger.value)
      console.log('🔄 滚动加载观察器已初始化')
    }
  })
}

// 监听 tab 切换，重新初始化观察器
watch(activeTab, (tab) => {
  if (tab === 'works') {
    initScrollObserver()
  }
})

onMounted(() => {
  // 初始加载时如果是作品tab，初始化观察器
  if (activeTab.value === 'works') {
    initScrollObserver()
  }
  // 初始化指示器位置
  updateFilterIndicator()
  updateUploadRadioIndicator()
  // 监听窗口大小变化，更新指示器位置
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (scrollObserver) {
    scrollObserver.disconnect()
    scrollObserver = null
  }
  // 移除窗口大小变化监听
  window.removeEventListener('resize', handleResize)
  // 清理 GSAP 动画
  if (editWorkOverlayRef.value) gsap.killTweensOf(editWorkOverlayRef.value)
  if (editWorkDialogRef.value) gsap.killTweensOf(editWorkDialogRef.value)
  if (seriesOverlayRef.value) gsap.killTweensOf(seriesOverlayRef.value)
  if (seriesDialogRef.value) gsap.killTweensOf(seriesDialogRef.value)
  if (seriesDetailOverlayRef.value) gsap.killTweensOf(seriesDetailOverlayRef.value)
  if (seriesDetailDialogRef.value) gsap.killTweensOf(seriesDetailDialogRef.value)
  if (addToSeriesOverlayRef.value) gsap.killTweensOf(addToSeriesOverlayRef.value)
  if (addToSeriesDialogRef.value) gsap.killTweensOf(addToSeriesDialogRef.value)
})
</script>
