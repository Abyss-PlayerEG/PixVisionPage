<template>
    <section id="Main">

        <section id="num1z" ref="num1zRef">
            <div class="n1_Main" ref="n1MainRef" @mouseenter="onN1MainEnter" @mouseleave="onN1MainLeave">
                <!-- 标题 -->
                <div class="n1_titleCeb" ref="titleCebRef">
                    <H1>
                        <span class="line-third"></span>
                        Pixel-Vision
                        <div>像素视觉</div>
                    </H1>

                    <H2 ref="h2Ref">
                        像素创作者中心
                        <div></div>
                    </H2>
                </div>

                <!-- 收起状态下可见的选项卡（标题与数据栏之间） -->
                <div class="n1_collapsedTabs" ref="collapsedTabsRef">
                    <button class="tab-item" :class="{ active: activeTab === 'works' }" @click="switchTab('works')">
                        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="7" height="7" rx="1"/>
                            <rect x="14" y="3" width="7" height="7" rx="1"/>
                            <rect x="3" y="14" width="7" height="7" rx="1"/>
                            <rect x="14" y="14" width="7" height="7" rx="1"/>
                        </svg>
                        <span>我的作品</span>
                    </button>
                    <button class="tab-item" :class="{ active: activeTab === 'collections' }" @click="switchTab('collections')">
                        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                        </svg>
                        <span>我的合集</span>
                    </button>
                    <button class="tab-item" :class="{ active: activeTab === 'upload' }" @click="switchTab('upload')">
                        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <span>上传作品</span>
                    </button>
                </div>

                <!-- 内容选项 -->
                <div class="n1_optionCeb" ref="optionCebRef">
                    <!-- 顶部：按钮 + 数据栏 -->
                    <div class="option-top">
                        <div class="option-buttons" ref="optionButtonsRef">
                            <!-- 返回首页药丸按钮 -->
                            <button class="pill-btn home-btn" @click="goHome">
                                <svg class="pill-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                    <polyline points="9 22 9 12 15 12 15 22"/>
                                </svg>
                                <span>返回首页</span>
                            </button>

                            <!-- 切换药丸按钮 -->
                            <button
                                class="pill-btn toggle-btn"
                                :class="{ toggled: isToggled }"
                                ref="toggleBtnRef"
                                @click="togglePanel"
                                :aria-label="isToggled ? '已切换至退出模式' : '已切换至欢迎模式'"
                            >
                                <span class="toggle-label label-welcome" :class="{ show: !isToggled }">欢迎您</span>
                                <span class="toggle-circle" ref="circleRef" :class="{ 'has-avatar': avatarUrl }" :style="avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : {}"></span>
                                <span class="toggle-label label-logout" :class="{ show: isToggled }" @click.stop="goToProfile">回到个人中心</span>
                            </button>
                        </div>

                        <!-- 数据栏 -->
                        <div class="data-bar" ref="dataBarRef">
                            <div class="data-item">
                                <span class="data-value">{{ formatStatNumber(userInfo.workCount) }}</span>
                                <span class="data-label">作品</span>
                            </div>
                            <span class="data-divider"></span>
                            <div class="data-item">
                                <span class="data-value">{{ formatStatNumber(userInfo.totalViews) }}</span>
                                <span class="data-label">浏览</span>
                            </div>
                            <span class="data-divider"></span>
                            <div class="data-item">
                                <span class="data-value">{{ formatStatNumber(userInfo.totalLikes) }}</span>
                                <span class="data-label">点赞</span>
                            </div>
                            <span class="data-divider"></span>
                            <div class="data-item">
                                <span class="data-value">{{ formatStatNumber(userInfo.totalStars) }}</span>
                                <span class="data-label">收藏</span>
                            </div>
                        </div>
                    </div>

                    <!-- 预留：中部内容 -->
                    <div class="option-middle">
                        <!-- 后续填充 -->
                    </div>

                    <!-- 底部：选项卡 -->
                    <div class="option-bottom" ref="optionBottomRef">
                        <button class="tab-item" :class="{ active: activeTab === 'works' }" @click="switchTab('works')">
                            <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="3" width="7" height="7" rx="1"/>
                                <rect x="14" y="3" width="7" height="7" rx="1"/>
                                <rect x="3" y="14" width="7" height="7" rx="1"/>
                                <rect x="14" y="14" width="7" height="7" rx="1"/>
                            </svg>
                            <span>我的作品</span>
                        </button>
                        <button class="tab-item" :class="{ active: activeTab === 'collections' }" @click="switchTab('collections')">
                            <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                            </svg>
                            <span>我的合集</span>
                        </button>
                        <button class="tab-item" :class="{ active: activeTab === 'upload' }" @click="switchTab('upload')">
                            <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="17 8 12 3 7 8"/>
                                <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            <span>上传作品</span>
                        </button>
                    </div>
                </div>

                <!-- 收起 / 展开按钮 -->
                <button
                    class="collapse-toggle-btn"
                    ref="collapseBtnRef"
                    @click="toggleCollapse"
                    :aria-label="isCollapsed ? '展开仪表盘' : '收起仪表盘'"
                >
                    <svg class="collapse-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="18 15 12 9 6 15"/>
                    </svg>
                    <span class="collapse-btn-text">{{ isCollapsed ? '展开仪表盘' : '收起仪表盘' }}</span>
                </button>
            </div>
        </section>

        <!-- ═══════════════════════════════════════════════════
           num2z — 批量操作栏（左） + 状态筛选栏（右） + 搜索栏（右）
           ═══════════════════════════════════════════════════ -->
        <section id="num2z">
            <!-- 批量操作栏：选中作品时出现在最左边，黑色圆角长条胶囊 -->
            <Transition name="n2-batch">
                <div v-if="activeTab === 'works' && hasSelection" class="n2_batchPill" ref="batchPillRef">
                    <div class="batch-highlight" ref="batchHighlightRef"></div>
                    <span class="batch-count">已选 {{ selectedWorkIds.length }} 件</span>
                    <span class="batch-divider"></span>
                    <button class="batch-segment" @click="openAddToSeriesDialog">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                            <line x1="12" y1="11" x2="12" y2="17"/>
                            <line x1="9" y1="14" x2="15" y2="14"/>
                        </svg>
                        添加到合集
                    </button>
                    <button class="batch-segment danger" @click="confirmBatchDeleteWorks">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        删除
                    </button>
                    <button class="batch-segment" @click="clearSelectionAnimated">取消</button>
                </div>
            </Transition>

            <!-- 左栏：作品状态分类面板（原有样式不动） -->
            <div class="n2_Lceb" v-if="activeTab === 'works'">
                <div class="status-header">
                    <span class="status-dot"></span>
                    <span class="status-title">作品状态</span>
                </div>
                <span class="status-divider"></span>
                <div class="status-options" ref="statusOptionsRef">
                    <div class="status-slider" ref="statusSliderRef"></div>
                    <button
                        class="status-option"
                        :class="{ active: worksApprovalFilter === '' }"
                        @click="onStatusFilterClick('')"
                    >全部</button>
                    <button
                        class="status-option"
                        :class="{ active: worksApprovalFilter === '10' }"
                        @click="onStatusFilterClick('10')"
                    >已通过</button>
                    <button
                        class="status-option"
                        :class="{ active: worksApprovalFilter === '20' }"
                        @click="onStatusFilterClick('20')"
                    >待审核</button>
                    <button
                        class="status-option"
                        :class="{ active: worksApprovalFilter === '30' }"
                        @click="onStatusFilterClick('30')"
                    >未通过</button>
                </div>
            </div>

            <!-- 右栏：搜索栏 -->
            <div class="n2_Rceb" v-if="activeTab === 'works'">
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                    class="search-input"
                    type="text"
                    v-model="worksSearchTitle"
                    placeholder="搜索作品…"
                    @keyup.enter="searchWorks"
                />
                <button
                    class="search-clear"
                    v-if="worksSearchTitle"
                    @click="clearSearch"
                    aria-label="清除搜索"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        </section>

        <!-- ═══════════════════════════════════════════════════
           num3z — 内容区
           ═══════════════════════════════════════════════════ -->
        <section id="num3z">
            <!-- ══════ 作品管理 ══════ -->
            <template v-if="activeTab === 'works'">
                <!-- 加载中 -->
                <div v-if="worksLoading && worksList.length === 0" class="n3_state">
                    <div class="n3_spinner"></div>
                    <span>加载作品中...</span>
                </div>

                <!-- 空状态 -->
                <div v-else-if="worksList.length === 0 && !worksLoading" class="n3_state">
                    <svg class="n3_emptyIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <p class="n3_emptyTitle">还没有作品</p>
                    <p class="n3_emptyDesc">切换到「上传作品」开始创作</p>
                </div>

                <!-- 作品网格 -->
                <div v-else class="n3_workGrid">
                    <div
                        v-for="work in worksList"
                        :key="work.work_id"
                        class="n3_workCard"
                        :class="{
                            clickable: work.approval_status === 10,
                            selected: selectedWorkIds.includes(work.work_id)
                        }"
                        :data-work-id="work.work_id"
                        @click="work.approval_status === 10 && goToWorkDetail(work.work_id)"
                    >
                        <!-- 选择框 -->
                        <div
                            class="n3_checkbox"
                            :class="{ checked: selectedWorkIds.includes(work.work_id) }"
                            @click.stop="toggleWorkSelectAnimated(work.work_id)"
                        >
                            <svg v-if="selectedWorkIds.includes(work.work_id)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        </div>

                        <!-- 操作按钮 -->
                        <div class="n3_actions">
                            <button class="n3_actionBtn" title="编辑作品" @click.stop="openEditWorkDialog(work)">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </button>
                            <button class="n3_actionBtn danger" title="删除" @click.stop="confirmDeleteWork(work)">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                            </button>
                        </div>

                        <!-- 缩略图（full-bleed 背景层） -->
                        <img
                            v-if="work.thumbFullUrl"
                            :src="work.thumbFullUrl"
                            :alt="work.work_title"
                            class="n3_thumb"
                            loading="lazy"
                        />
                        <!-- 无图片时的占位背景（审核中/未通过/默认） -->
                        <div v-else class="n3_thumbPlaceholder">
                            <template v-if="work.approval_status === 20">
                                <svg class="n3_thumbIcon pending" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                                <span class="n3_thumbText pending">审核中</span>
                            </template>
                            <template v-else-if="work.approval_status === 30">
                                <svg class="n3_thumbIcon rejected" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="15" y1="9" x2="9" y2="15"/>
                                    <line x1="9" y1="9" x2="15" y2="15"/>
                                </svg>
                                <span class="n3_thumbText rejected">审核未通过</span>
                            </template>
                            <template v-else>
                                <svg class="n3_thumbIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                    <polyline points="21 15 16 10 5 21"/>
                                </svg>
                                <span class="n3_thumbText">暂无预览</span>
                            </template>
                        </div>

                        <!-- 毛玻璃信息区 -->
                        <div class="n3_cardInfo">
                            <p class="n3_workTitle" :title="work.work_title">{{ work.work_title || '未命名作品' }}</p>
                            <div class="n3_workMeta">
                                <span class="n3_workTime">{{ formatTime(work.create_time) }}</span>
                                <span class="n3_status">
                                    <span class="n3_statusDot" :class="approvalStatusClass(work.approval_status)"></span>
                                    <span class="n3_statusLabel">{{ approvalStatusLabel(work.approval_status) }}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 加载更多 -->
                <div v-if="worksLoading && worksList.length > 0" class="n3_state" style="padding-top: 24px;">
                    <div class="n3_spinner"></div>
                    <span>加载更多...</span>
                </div>

                <!-- 滚动加载触发器 -->
                <div ref="worksScrollTrigger" style="height: 1px;"></div>
            </template>

            <!-- ══════ 合集管理（占位） ══════ -->
            <template v-if="activeTab === 'collections'">
                <div class="n3_placeholder">
                    <svg class="n3_placeholderIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                    <p class="n3_placeholderTitle">合集管理</p>
                    <p class="n3_placeholderDesc">此功能正在建设中，敬请期待</p>
                </div>
            </template>

            <!-- ══════ 上传作品（占位） ══════ -->
            <template v-if="activeTab === 'upload'">
                <div class="n3_placeholder">
                    <svg class="n3_placeholderIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <p class="n3_placeholderTitle">上传作品</p>
                    <p class="n3_placeholderDesc">此功能正在建设中，敬请期待</p>
                </div>
            </template>
        </section>

    </section>

    <!-- ═══════════════════════════════════════════════════
       弹窗：编辑作品
       ═══════════════════════════════════════════════════ -->
    <teleport to="body">
        <div v-if="showEditWorkDialog" class="n3_dialogOverlay" @click.self="closeEditWorkDialog">
            <div class="n3_dialog n3_dialogWide" @click.stop>
                <h3 class="n3_dialogTitle">编辑作品</h3>
                <div class="n3_editLayout">
                    <!-- 左侧：图片预览 -->
                    <div class="n3_editLeft">
                        <div class="n3_editImageArea" @click="$refs.editFileInput?.click()">
                            <img
                                v-if="editWorkForm.imagePreview"
                                :src="editWorkForm.imagePreview"
                                class="n3_editImage"
                                alt="作品预览"
                            />
                            <div v-else class="n3_editImageEmpty">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="17 8 12 3 7 8"/>
                                    <line x1="12" y1="3" x2="12" y2="15"/>
                                </svg>
                                <span>点击更换图片</span>
                            </div>
                            <input ref="editFileInput" type="file" accept="image/jpeg,image/png" style="display:none;" @change="onEditFileSelect" />
                        </div>
                        <div style="display:flex;gap:8px;justify-content:center;">
                            <button class="n3_btn n3_btnSm" @click="$refs.editFileInput?.click()">更换图片</button>
                            <button v-if="editWorkForm.file" class="n3_btn n3_btnSm" @click="removeEditFile">撤销更换</button>
                        </div>
                    </div>
                    <!-- 右侧：表单 -->
                    <div class="n3_editRight">
                        <div class="n3_formGroup">
                            <label class="n3_formLabel">作品标题</label>
                            <input v-model="editWorkForm.workTitle" class="n3_formInput" type="text" maxlength="16" placeholder="请输入作品标题" />
                            <span class="n3_formTip">{{ editWorkForm.workTitle.length }}/16</span>
                        </div>
                        <div class="n3_formGroup">
                            <label class="n3_formLabel">所属合集</label>
                            <select v-model="editWorkForm.seriesId" class="n3_formSelect">
                                <option :value="0">不加入任何合集</option>
                                <option v-for="s in seriesList" :key="s.series_id" :value="s.series_id">{{ s.series_title }}</option>
                            </select>
                        </div>
                        <div class="n3_formGroup">
                            <label class="n3_formLabel">作品类型</label>
                            <div class="n3_radioGroup" ref="editRadioGroupRef">
                                <div class="n3_radioHighlight" :style="editRadioIndicatorStyle"></div>
                                <button class="n3_radioBtn" :class="{ active: editWorkForm.isOriginal === true }" @click="toggleEditOriginal(true)">原创</button>
                                <button class="n3_radioBtn" :class="{ active: editWorkForm.isOriginal === false }" @click="toggleEditOriginal(false)">转载</button>
                            </div>
                        </div>
                        <p class="n3_editTip">修改后作品将重新进入审核队列</p>
                    </div>
                </div>
                <div class="n3_dialogFooter">
                    <button class="n3_btn" @click="closeEditWorkDialog">取消</button>
                    <button class="n3_btn n3_btnPrimary" :disabled="editWorkSubmitting" @click="submitEditWork">
                        {{ editWorkSubmitting ? '保存中...' : '保存修改' }}
                    </button>
                </div>
            </div>
        </div>
    </teleport>

    <!-- ═══════════════════════════════════════════════════
       弹窗：删除确认
       ═══════════════════════════════════════════════════ -->
    <ConfirmDialog
        v-model:show="showDeleteDialog"
        :title="deleteDialogTitle"
        :message="deleteDialogMessage"
        type="danger"
        :yes-text="deleteDialogYesText"
        :no-text="deleteDialogNoText"
        @confirm="executeDelete"
        @cancel="showDeleteDialog = false"
    />
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { useCreatorPanel } from '@/composables/useCreatorPanel'
import { getUserProfile } from '@/api/profileApi.js'
import { getAvatarUrl } from '@/config/api.js'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const router = useRouter()

// ═══════════════════════════════════════════════════
// 创作者面板逻辑（复用 useCreatorPanel 数据层）
// ═══════════════════════════════════════════════════
const {
    // 作品管理
    worksList, worksLoading, worksTotal, worksApprovalFilter, worksSearchTitle,
    selectedWorkIds, isAllSelected, hasSelection,
    loadWorks, searchWorks, setWorksApprovalFilter, handleDeleteWork, handleUpdateWork,
    toggleWorkSelect, toggleAllWorks, clearSelection,
    // 合集
    seriesList, loadSeries,
    // 合集弹窗
    seriesDialogs,
    // 工具
    approvalStatusLabel, approvalStatusClass, formatTime,
    // 编辑弹窗
    editWorkDialog,
    // 删除确认
    deleteConfirm,
    // 滚动加载
    scrollLoad,
    // 指示器
    editRadioIndicator,
} = useCreatorPanel({ activeSelector: '.n3_radioBtn.active' })

// 编辑器弹窗模块析构
const {
    show: showEditWorkDialog,
    submitting: editWorkSubmitting,
    form: editWorkForm,
    open: openEditWorkDialog,
    close: closeEditWorkDialog,
    onFileSelect: onEditFileSelect,
    removeFile: removeEditFile,
    toggleOriginal: toggleEditOriginal,
    submit: submitEditWork,
} = editWorkDialog

// 合集弹窗模块析构
const {
    openAddToSeriesDialog,
} = seriesDialogs

// 删除确认模块析构
const {
    show: showDeleteDialog,
    title: deleteDialogTitle,
    message: deleteDialogMessage,
    noText: deleteDialogNoText,
    yesText: deleteDialogYesText,
    confirmDeleteWork,
    confirmBatchDeleteWorks,
    execute: executeDelete,
} = deleteConfirm

// 滚动加载模块
const {
    triggerRef: worksScrollTrigger,
    init: initScrollObserver,
} = scrollLoad

// 编辑弹窗 radio 指示器
const editRadioGroupRef = editRadioIndicator.containerRef
const editRadioIndicatorStyle = editRadioIndicator.indicatorStyle
const updateEditRadioIndicator = () => editRadioIndicator.update('.n3_radioBtn.active')

// 监听编辑表单原创/转载切换
watch(() => editWorkForm.isOriginal, () => {
    nextTick(() => updateEditRadioIndicator())
})

// ═══════════════════════════════════════════════════
// Refs
// ═══════════════════════════════════════════════════
const num1zRef = ref(null)
const n1MainRef = ref(null)
const titleCebRef = ref(null)
const h2Ref = ref(null)
const collapsedTabsRef = ref(null)
const optionCebRef = ref(null)
const optionButtonsRef = ref(null)
const optionBottomRef = ref(null)
const dataBarRef = ref(null)
const toggleBtnRef = ref(null)
const circleRef = ref(null)
const collapseBtnRef = ref(null)
// ═══════════════════════════════════════════════════
// 状态
// ═══════════════════════════════════════════════════
const isToggled = ref(false)
const isCollapsed = ref(false)
const activeTab = ref('works')

// ═══════════════════════════════════════════════════
// 头像
// ═══════════════════════════════════════════════════
const avatarUrl = ref(getAvatarFromCache())

function getAvatarFromCache() {
    try {
        const cached = localStorage.getItem('userInfo')
        if (cached) {
            const parsed = JSON.parse(cached)
            if (parsed.avatar_url) return getAvatarUrl(parsed.avatar_url)
        }
    } catch { /* ignore */ }
    return ''
}

const userInfo = reactive({
    workCount: 0,
    totalViews: 0,
    totalLikes: 0,
    totalStars: 0,
})

// ═══════════════════════════════════════════════════
// GSAP 上下文
// ═══════════════════════════════════════════════════
let ctx = null
let collapseTl = null

// 原始尺寸缓存
let _origNum1zHeight = null
let _origH2Height = null
let _origBottomHeight = null
let _origButtonsWidth = null
let _origCollapsedTabsWidth = null

// ═══════════════════════════════════════════════════
// 数字格式化
// ═══════════════════════════════════════════════════
const formatStatNumber = (num) => {
    if (num === null || num === undefined) return '0'
    const n = Number(num)
    if (isNaN(n)) return '0'
    if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, '') + 'w'
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
    return String(n)
}

// 清除搜索
const clearSearch = () => {
    worksSearchTitle.value = ''
    searchWorks()
}

// ═══════════════════════════════════════════════════
// 状态筛选器 — 滑块聚焦动画
// ═══════════════════════════════════════════════════
const statusOptionsRef = ref(null)
const statusSliderRef = ref(null)

const updateStatusIndicator = () => {
    if (!statusOptionsRef.value || !statusSliderRef.value) return
    const activeBtn = statusOptionsRef.value.querySelector('.status-option.active')
    if (!activeBtn) {
        gsap.to(statusSliderRef.value, { opacity: 0, duration: 0.2 })
        return
    }
    const containerRect = statusOptionsRef.value.getBoundingClientRect()
    const btnRect = activeBtn.getBoundingClientRect()
    const left = btnRect.left - containerRect.left
    const width = btnRect.width

    gsap.to(statusSliderRef.value, {
        left,
        width,
        opacity: 1,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: true,
    })
}

const onStatusFilterClick = (value) => {
    setWorksApprovalFilter(value)
    nextTick(() => updateStatusIndicator())
}

// ═══════════════════════════════════════════════════
// 作品选中 / 取消 — 带动画
// ═══════════════════════════════════════════════════
const toggleWorkSelectAnimated = (workId) => {
    // CSS transition 处理全部动画：浮起、图片缩放、毛玻璃长高
    // 无需 GSAP，避免 transform 属性冲突
    toggleWorkSelect(workId)
}

// ═══════════════════════════════════════════════════
// 批量取消 — 从左往右依次延迟取消（GSAP stagger）
// ═══════════════════════════════════════════════════
const clearSelectionAnimated = () => {
    const ids = [...selectedWorkIds.value]
    if (!ids.length) return

    // 按 DOM 左位置排序
    const cards = ids
        .map(id => {
            const el = document.querySelector(`.n3_workCard[data-work-id="${id}"]`)
            return el ? { id, el, left: el.getBoundingClientRect().left } : null
        })
        .filter(Boolean)
        .sort((a, b) => a.left - b.left)

    if (!cards.length) { clearSelection(); return }

    // 为每张卡片设 CSS transition-delay，实现从左到右 stagger
    cards.forEach(({ el }, i) => {
        const d = `${i * 0.1}s`
        el.style.transitionDelay = d
        const thumb = el.querySelector('.n3_thumb')
        const info = el.querySelector('.n3_cardInfo')
        if (thumb) thumb.style.transitionDelay = d
        if (info) info.style.transitionDelay = d
    })

    // 立即清除数据 → CSS transition 以各自 delay 依次触发
    selectedWorkIds.value = []

    // 动画结束后清除内联 delay
    const total = (cards.length - 1) * 0.1 + 0.5
    setTimeout(() => {
        cards.forEach(({ el }) => {
            el.style.transitionDelay = ''
            const thumb = el.querySelector('.n3_thumb')
            const info = el.querySelector('.n3_cardInfo')
            if (thumb) thumb.style.transitionDelay = ''
            if (info) info.style.transitionDelay = ''
        })
    }, total * 1000 + 100)
}

// ═══════════════════════════════════════════════════
// 导航 / 切换
// ═══════════════════════════════════════════════════
const goHome = () => {
    router.push({ name: 'home' })
}

const goToProfile = () => {
    router.push({ name: 'profileMe' })
}

const switchTab = (tab) => {
    activeTab.value = tab
    if (tab === 'works' && worksList.value.length === 0) loadWorks({ reset: true })
}

const goToWorkDetail = (workId) => {
    router.push(`/work/${workId}`)
}

// ═══════════════════════════════════════════════════
// 切换面板
// ═══════════════════════════════════════════════════
const togglePanel = () => {
    isToggled.value = !isToggled.value

    nextTick(() => {
        const distance = getTravelDistance()
        const targetX = isToggled.value ? 0 : distance

        gsap.to(circleRef.value, {
            x: targetX,
            duration: 0.4,
            ease: 'power2.out',
            overwrite: true,
        })
    })
}

const getTravelDistance = () => {
    if (!toggleBtnRef.value || !circleRef.value) return 0
    const btnWidth = toggleBtnRef.value.offsetWidth
    const circleWidth = circleRef.value.offsetWidth
    const padding = 4
    return btnWidth - circleWidth - padding * 2
}

// ═══════════════════════════════════════════════════
// 收起 / 展开仪表盘
// ═══════════════════════════════════════════════════
const toggleCollapse = () => {
    if (collapseTl) collapseTl.kill()

    isCollapsed.value = !isCollapsed.value
    const collapsing = isCollapsed.value

    if (collapsing && _origNum1zHeight === null) {
        _origNum1zHeight = num1zRef.value.offsetHeight
    }

    const tl = gsap.timeline({
        defaults: { duration: 0.4, ease: 'power2.inOut' },
        onComplete: () => { collapseTl = null },
    })
    collapseTl = tl

    if (collapsing) {
        _origH2Height = h2Ref.value.offsetHeight
        _origBottomHeight = optionBottomRef.value.offsetHeight
        _origButtonsWidth = optionButtonsRef.value.offsetWidth

        collapsedTabsRef.value.style.width = 'auto'
        _origCollapsedTabsWidth = collapsedTabsRef.value.offsetWidth
        collapsedTabsRef.value.style.width = '0'

        tl.to(h2Ref.value, { top: 0, height: 0, opacity: 0, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, duration: 0.35 }, 0)
        tl.to(optionBottomRef.value, { height: 0, minHeight: 0, opacity: 0, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, duration: 0.35 }, 0.05)
        tl.to(optionButtonsRef.value, { width: 0, opacity: 0, marginLeft: 0, marginRight: 0, paddingLeft: 0, paddingRight: 0, gap: 0, overflow: 'hidden', duration: 0.35 }, 0.1)
        tl.to(num1zRef.value, { height: 130, duration: 0.4 }, 0)
        tl.to(collapsedTabsRef.value, { width: _origCollapsedTabsWidth, opacity: 1, pointerEvents: 'auto', overflow: 'visible', duration: 0.3 }, 0.2)
        tl.to('.collapse-icon', { rotation: 180, duration: 0.35 }, 0)
    } else {
        tl.to(num1zRef.value, { height: _origNum1zHeight, duration: 0.4 }, 0)
        tl.to(h2Ref.value, { top: 60, height: _origH2Height, opacity: 1, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, duration: 0.35 }, 0.05)
        tl.to(optionBottomRef.value, { height: _origBottomHeight, minHeight: 40, opacity: 1, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, duration: 0.35 }, 0.1)
        tl.to(optionButtonsRef.value, { width: _origButtonsWidth, opacity: 1, marginLeft: 0, marginRight: 0, paddingLeft: 0, paddingRight: 0, gap: 12, overflow: 'hidden', duration: 0.35 }, 0.15)
        tl.to(collapsedTabsRef.value, { width: 0, opacity: 0, pointerEvents: 'none', overflow: 'hidden', duration: 0.25 }, 0)
        tl.to('.collapse-icon', { rotation: 0, duration: 0.35 }, 0)
    }

    if (!collapsing) {
        tl.eventCallback('onComplete', () => {
            gsap.set([h2Ref.value, optionBottomRef.value, optionButtonsRef.value, collapsedTabsRef.value], { clearProps: 'all' })
            collapseTl = null
        })
    } else {
        tl.eventCallback('onComplete', () => {
            gsap.set(optionButtonsRef.value, { width: 0, opacity: 0, marginLeft: 0, marginRight: 0, paddingLeft: 0, paddingRight: 0, gap: 0, overflow: 'hidden' })
            collapseTl = null
        })
    }
}

// ═══════════════════════════════════════════════════
// 鼠标进入/离开 n1_Main → 收起按钮入场/退场
// ═══════════════════════════════════════════════════
const onN1MainEnter = () => {
    if (!collapseBtnRef.value) return
    gsap.to(collapseBtnRef.value, {
        y: 0,
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: true,
    })
}

const onN1MainLeave = () => {
    if (!collapseBtnRef.value) return
    gsap.to(collapseBtnRef.value, {
        y: 12,
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        overwrite: true,
    })
}

// ═══════════════════════════════════════════════════
// 获取用户数据
// ═══════════════════════════════════════════════════
const fetchUserStats = async () => {
    const cached = localStorage.getItem('userInfo')
    if (cached) {
        try {
            const parsed = JSON.parse(cached)
            userInfo.workCount = parsed.workCount ?? 0
            userInfo.totalViews = parsed.totalViews ?? 0
            userInfo.totalLikes = parsed.totalLikes ?? 0
            userInfo.totalStars = parsed.totalStars ?? 0
        } catch { /* ignore parse error */ }
    }

    const result = await getUserProfile()
    if (result.success && result.data) {
        const d = result.data
        userInfo.workCount = d.workCount ?? 0
        userInfo.totalViews = d.totalViews ?? 0
        userInfo.totalLikes = d.totalLikes ?? 0
        userInfo.totalStars = d.totalStars ?? 0

        if (d.avatar_url) {
            avatarUrl.value = getAvatarUrl(d.avatar_url)
        }
    }
}

// 窗口大小变化 → 更新指示器
const handleResize = () => {
    updateStatusIndicator()
    updateEditRadioIndicator()
}

// ═══════════════════════════════════════════════════
// 生命周期
// ═══════════════════════════════════════════════════
onMounted(async () => {
    await fetchUserStats()

    // 初始化 GSAP 上下文
    ctx = gsap.context(() => {
        const distance = getTravelDistance()
        gsap.set(circleRef.value, { x: distance })
        gsap.set(collapseBtnRef.value, { y: 12, opacity: 0 })
    }, n1MainRef.value)

    // 初始化状态筛选滑块
    nextTick(() => updateStatusIndicator())

    // 初始化 scroll 加载观察器
    if (activeTab.value === 'works') {
        initScrollObserver()
    }

    // 加载合集列表（供编辑时选择）
    if (seriesList.value.length === 0) {
        loadSeries({ reset: true })
    }

    // 窗口大小变化监听
    window.addEventListener('resize', handleResize)
})

// 监听 tab 切换以初始化滚动观察器
watch(activeTab, (tab) => {
    if (tab === 'works') {
        initScrollObserver()
        nextTick(() => updateStatusIndicator())
    }
})

// 监听筛选条件变化 → 更新状态滑块位置
watch(() => worksApprovalFilter.value, () => {
    nextTick(() => updateStatusIndicator())
})

onUnmounted(() => {
    if (ctx) ctx.revert()
    if (collapseTl) collapseTl.kill()
    window.removeEventListener('resize', handleResize)
    editWorkDialog.cleanup()
})
</script>

<style scoped>
@import url(../assets/CSS/CreatorCenter.css);
</style>
