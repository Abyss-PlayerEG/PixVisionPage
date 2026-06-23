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
        <section id="num2z" ref="num2zRef">
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

            <!-- 新建合集按钮（合集模式最左边，#0a0a0a 圆角药丸） -->
            <button v-if="activeTab === 'collections'" class="n2_createSeriesPill" @click="openAddSeriesDialog">
                <svg class="n2_createSeriesIcon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                    <path d="M413.866667 832a53.333333 53.333333 0 0 1-75.52 0l-92.373334-92.373333-209.066666 208.853333a31.146667 31.146667 0 0 1-16.426667 8.32 64 64 0 0 0 42.666667 17.066667H746.666667a128 128 0 0 0 128-128v-170.666667l-152.106667-152.533333z"/>
                    <path d="M865.92 50.773333H288a32 32 0 0 0 0 64h577.92A95.146667 95.146667 0 0 1 960 210.773333v544a32 32 0 0 0 64 0V210.773333a159.146667 159.146667 0 0 0-158.08-160z"/>
                    <path d="M746.666667 205.226667H128a128 128 0 0 0-128 128v561.28l208.213333-208.426667a53.76 53.76 0 0 1 75.52 0l92.373334 92.586667L684.8 469.333333a53.333333 53.333333 0 0 1 75.306667 0L874.666667 584.533333V333.226667a128 128 0 0 0-128-128zM315.306667 458.24a85.333333 85.333333 0 1 1-97.92-97.92 85.333333 85.333333 0 0 1 97.92 97.92z"/>
                </svg>
                <span>新建合集</span>
            </button>

            <!-- 左栏：合集排序面板（暖黄点，复用作品状态结构） -->
            <div class="n2_Lceb n2_Lceb--series" v-if="activeTab === 'collections'">
                <div class="status-header">
                    <span class="status-dot status-dot--warm"></span>
                    <span class="status-title">合集排序方式</span>
                </div>
                <span class="status-divider"></span>
                <div class="status-options" ref="seriesSortOptionsRef">
                    <div class="status-slider status-slider--warm" ref="seriesSortSliderRef"></div>
                    <button
                        class="status-option"
                        :class="{ active: seriesSortOrder === 'asc' }"
                        @click="onSeriesSortClick('asc')"
                    >最早创建</button>
                    <button
                        class="status-option"
                        :class="{ active: seriesSortOrder === 'desc' }"
                        @click="onSeriesSortClick('desc')"
                    >最近创建</button>
                </div>
            </div>

            <!-- 左栏：上传类型面板（上传模式） -->
            <div class="n2_Lceb n2_Lceb--upload" v-if="activeTab === 'upload'">
                <div class="status-header">
                    <span class="status-dot status-dot--upload"></span>
                    <span class="status-title">作品类型</span>
                </div>
                <span class="status-divider"></span>
                <div class="status-options" ref="uploadRadioGroupRef">
                    <div class="status-slider status-slider--upload" :style="uploadRadioIndicatorStyle"></div>
                    <button
                        class="status-option n3_uploadRadioBtn"
                        :class="{ active: uploadForm.isOriginal === true }"
                        @click="toggleUploadOriginal(true)"
                    >原创</button>
                    <button
                        class="status-option n3_uploadRadioBtn"
                        :class="{ active: uploadForm.isOriginal === false }"
                        @click="toggleUploadOriginal(false)"
                    >转载</button>
                </div>
            </div>

            <!-- 转载链接药丸 — 独立于作品类型条，右→左入场动画 -->
            <Transition
                name="uploadLink"
                @enter="onUploadLinkEnter"
                @leave="onUploadLinkLeave"
            >
                <div v-if="uploadForm.isOriginal === false" class="n2_uploadLinkPill" ref="uploadLinkPillRef">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                    <input
                        v-model="uploadForm.outUrl"
                        type="text"
                        placeholder="请输入转载链接"
                        class="n2_uploadLinkInput"
                    />
                </div>
            </Transition>

            <!-- 右栏：上传操作按钮（上传模式） -->
            <div class="n2_uploadActions" v-if="activeTab === 'upload'">
                <button class="n2_uploadPillBtn n2_uploadPillBtn--cancel" @click="cancelUpload">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    <span>取消上传</span>
                </button>
                <button class="n2_uploadPillBtn n2_uploadPillBtn--submit" :disabled="uploadLoading" @click="submitUpload">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>{{ uploadLoading ? '上传中...' : '提交上传' }}</span>
                </button>
            </div>

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

            <!-- 右栏：搜索栏 — 作品 -->
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

            <!-- 右栏：搜索栏 — 合集 -->
            <div class="n2_Rceb" v-if="activeTab === 'collections'">
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                    class="search-input"
                    type="text"
                    v-model="seriesKeyword"
                    placeholder="搜索合集…"
                    @keyup.enter="searchCollections"
                />
                <button
                    class="search-clear"
                    v-if="seriesKeyword"
                    @click="clearCollectionSearch"
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
                        @click="work.approval_status === 10 && goToWorkDetail(work.work_id, work.user_id)"
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
                <div v-if="worksLoading && worksList.length > 0" class="n3_state" style="padding-top: 30px;">
                    <div class="n3_spinner"></div>
                    <span>加载更多...</span>
                </div>

                <!-- 滚动加载触发器 -->
                <div ref="worksScrollTrigger" style="height: 1px;"></div>
            </template>

            <!-- ══════ 合集管理 ══════ -->
            <template v-if="activeTab === 'collections'">
                <!-- 加载中 -->
                <div v-if="seriesLoading && seriesList.length === 0" class="n3_state">
                    <div class="n3_spinner"></div>
                    <span>加载合集中...</span>
                </div>

                <!-- 空状态 -->
                <div v-else-if="seriesList.length === 0 && !seriesLoading" class="n3_state">
                    <svg class="n3_emptyIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                    <p class="n3_emptyTitle">还没有合集</p>
                    <p class="n3_emptyDesc">切换到「上传作品」开始创作</p>
                </div>

                <!-- 合集卡片列表 -->
                <div v-else class="n3_seriesList">
                    <div
                        v-for="(series, idx) in sortedSeriesList"
                        :key="series.series_id"
                        class="n3_seriesCard"
                        :class="{ 'n3_seriesCard--editing': editingSeriesId === series.series_id }"
                        @mouseenter="onSeriesCardEnter"
                        @mouseleave="onSeriesCardLeave"
                        @click="handleViewSeries(series)"
                    >
                        <!-- ═══ 左侧标题区（flex:1 自动撑满） ═══ -->
                        <div class="n3_seriesLeft">
                            <span class="n3_seriesGalleryTitle">Galleries {{ String(idx + 1).padStart(2, '0') }}</span>
                            <h3 class="n3_seriesName">{{ series.series_title || '未命名合集' }}</h3>
                            <span class="n3_seriesDate">{{ formatTime(series.create_time) }}</span>
                        </div>

                        <!-- ═══ 中间图片展示区 ═══ -->
                        <div class="n3_seriesMiddle">
                            <!-- 有合集封面图时展示图片 -->
                            <img
                                v-if="series.cover_img"
                                :src="series.cover_img"
                                class="n3_seriesCoverImg"
                                alt="合集封面"
                            />
                            <!-- 无合集图片时使用图片占位块 -->
                            <div v-else class="n3_seriesPlaceholderGrid">
                                <!-- 第 1 列：完整图片，填满高度 -->
                                <div class="n3_phCol">
                                    <div
                                        class="n3_phBlock n3_phBlock--upper"
                                        :style="{ backgroundImage: series.thumbnails?.[0] ? `url(${series.thumbnails[0]})` : '' }"
                                    ></div>
                                </div>
                                <!-- 第 2 列：上 60% / 下 30%（gap 10%，下块毛玻璃） -->
                                <div class="n3_phCol n3_phCol--2">
                                    <div
                                        class="n3_phBlock n3_phBlock--upper"
                                        :style="{ backgroundImage: series.thumbnails?.[1] ? `url(${series.thumbnails[1]})` : '' }"
                                    ></div>
                                    <div
                                        class="n3_phBlock n3_phBlock--lower n3_phBlock--frosted"
                                        :style="{ backgroundImage: series.thumbnails?.[1] ? `url(${series.thumbnails[1]})` : '' }"
                                    ></div>
                                </div>
                                <!-- 第 3 列：上 40% / 下 50%（gap 10%，上块毛玻璃） -->
                                <div class="n3_phCol n3_phCol--3">
                                    <div
                                        class="n3_phBlock n3_phBlock--upper n3_phBlock--frosted"
                                        :style="{ backgroundImage: series.thumbnails?.[2] ? `url(${series.thumbnails[2]})` : '' }"
                                    ></div>
                                    <div
                                        class="n3_phBlock n3_phBlock--lower"
                                        :style="{ backgroundImage: series.thumbnails?.[2] ? `url(${series.thumbnails[2]})` : '' }"
                                    ></div>
                                </div>
                                <!-- 第 4 列：上 30% / 下 60%（gap 10%，上块毛玻璃） -->
                                <div class="n3_phCol n3_phCol--4">
                                    <div
                                        class="n3_phBlock n3_phBlock--upper n3_phBlock--frosted"
                                        :style="{ backgroundImage: series.thumbnails?.[3] ? `url(${series.thumbnails[3]})` : '' }"
                                    ></div>
                                    <div
                                        class="n3_phBlock n3_phBlock--lower"
                                        :style="{ backgroundImage: series.thumbnails?.[3] ? `url(${series.thumbnails[3]})` : '' }"
                                    ></div>
                                </div>
                                <!-- 第 5 列：完整图片，填满高度 -->
                                <div class="n3_phCol">
                                    <div
                                        class="n3_phBlock n3_phBlock--upper"
                                        :style="{ backgroundImage: series.thumbnails?.[4] ? `url(${series.thumbnails[4]})` : '' }"
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <!-- ═══ 右侧 40% 内容编辑区 ═══ -->
                        <div class="n3_seriesRight">
                            <!-- 可切换视图区域 -->
                            <div class="n3_seriesViewArea">
                                <!-- 编辑界面区 -->
                                <template v-if="editingSeriesId === series.series_id">
                                    <div class="n3_seriesEditForm">
                                        <input
                                            v-model="seriesEditForm.seriesTitle"
                                            class="n3_seriesEditInput"
                                            type="text"
                                            maxlength="16"
                                            placeholder="合集名称"
                                        />
                                        <input
                                            v-model="seriesEditForm.aboutText"
                                            class="n3_seriesEditInput"
                                            type="text"
                                            maxlength="24"
                                            placeholder="合集描述"
                                        />
                                    </div>
                                    <!-- 编辑状态操作栏（复用 num2z 批量操作栏风格） -->
                                    <div class="n3_seriesEditBar">
                                        <span class="n3_seriesEditBar-label">正在编辑</span>
                                        <span class="n3_seriesEditBar-divider"></span>
                                        <button class="n3_seriesEditBar-btn n3_seriesEditBar-btn--save" @click.stop="saveSeriesEdit(series)">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <polyline points="20 6 9 17 4 12"/>
                                            </svg>
                                            <span>确定修改</span>
                                        </button>
                                        <button class="n3_seriesEditBar-btn n3_seriesEditBar-btn--cancel" @click.stop="cancelSeriesEdit">
                                            <span>取消</span>
                                        </button>
                                        <button class="n3_seriesEditBar-btn n3_seriesEditBar-btn--removeWorks" :class="{ 'has-pending': pendingRemoveWorkIds.length }" @click.stop="openRemoveWorksDialog(series)">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <circle cx="12" cy="12" r="10"/>
                                                <line x1="15" y1="9" x2="9" y2="15"/>
                                                <line x1="9" y1="9" x2="15" y2="15"/>
                                            </svg>
                                            <span>从合集移除作品</span>
                                            <span v-if="pendingRemoveWorkIds.length" class="n3_seriesEditBar-badge">{{ pendingRemoveWorkIds.length }}</span>
                                        </button>
                                    </div>
                                </template>

                                <!-- 图片预览区（默认） -->
                                <template v-else>
                                    <div class="n3_seriesPreview" :class="{ 'n3_seriesPreview--hasContent': series.thumbnails && series.thumbnails.some(url => url && url.trim()) }">
                                        <div class="n3_seriesPreviewStack">
                                            <div class="n3_seriesPreviewCard n3_seriesPreviewCard--1"></div>
                                            <div class="n3_seriesPreviewCard n3_seriesPreviewCard--2"></div>
                                            <div class="n3_seriesPreviewCard n3_seriesPreviewCard--3"></div>
                                        </div>
                                        <button class="n3_seriesViewBtn" title="查看合集" @click.stop="handleViewSeries(series)">
                                            <svg viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M8 5v14l11-7z"/>
                                            </svg>
                                        </button>
                                    </div>
                                </template>
                            </div>

                            <!-- 操作按钮（带文字标签） -->
                            <div class="n3_seriesActions">
                                <button
                                    class="n3_seriesActionBtn"
                                    @click.stop="openSeriesEdit(series)"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                    <span>编辑合集</span>
                                </button>
                                <button
                                    class="n3_seriesActionBtn n3_seriesActionBtn--danger"
                                    @click.stop="confirmDeleteSeries(series)"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                    <span>删除合集</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 加载更多 -->
                <div v-if="seriesLoading && seriesList.length > 0" class="n3_state" style="padding-top: 30px;">
                    <div class="n3_spinner"></div>
                    <span>加载更多...</span>
                </div>
            </template>

            <!-- ══════ 上传作品 ══════ -->
            <template v-if="activeTab === 'upload'">
                <div class="n3_uploadLayout">
                    <!-- ═══ 左侧 60%：图片预览区（GalleryViewer 风格） ═══ -->
                    <div
                        class="n3_uploadPreview"
                        @click="uploadFileInputRef?.click()"
                        @dragover="onUploadDragOver"
                        @drop="onUploadDrop"
                        :class="{ 'n3_uploadPreview--hasImage': uploadForm.filePreview }"
                    >
                        <template v-if="uploadForm.filePreview">
                            <div class="n3_uploadPreviewBg" :style="{ backgroundImage: `url(${uploadForm.filePreview})` }">
                                <div class="n3_uploadPreviewBg--blur"></div>
                            </div>
                            <div class="n3_uploadPreviewCard">
                                <img :src="uploadForm.filePreview" class="n3_uploadPreviewImg" alt="预览" draggable="false" />
                            </div>
                            <button class="n3_uploadPreviewRemove" @click.stop="onUploadRemoveFile" aria-label="移除图片">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </template>
                        <div v-else class="n3_uploadPreviewEmpty">
                            <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="var(--text-muted)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                            </svg>
                            <span class="n3_uploadPreviewEmptyText">点击或拖拽图片至此区域可进行预览</span>
                        </div>
                    </div>

                    <!-- ═══ 右侧 40%：上传表单（上下两块独立区域，space-between） ═══ -->
                    <div class="n3_uploadForm">
                        <!-- ═══ 上板块：作品基础信息 ═══ -->
                        <div class="n3_uploadBlock n3_uploadBlock--top">
                            <h4 class="n3_uploadBlockTitle">作品基础信息</h4>

                            <!-- 作品标题 -->
                            <div class="n3_uploadFormGroup">
                                <label class="n3_uploadFormLabel">作品标题</label>
                                <div class="n3_uploadTitleWrap">
                                    <input
                                        v-model="uploadForm.workTitle"
                                        class="n3_uploadTitleInput"
                                        type="text"
                                        maxlength="16"
                                        placeholder="请输入作品标题"
                                    />
                                    <span class="n3_uploadTitleCount">{{ uploadForm.workTitle.length }}/16</span>
                                </div>
                            </div>

                            <!-- 添加到合集 -->
                            <button class="n3_uploadSeriesBtn" @click="openUploadSeriesDialog">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                                    <line x1="12" y1="11" x2="12" y2="17"/>
                                    <line x1="9" y1="14" x2="15" y2="14"/>
                                </svg>
                                <span>{{ uploadForm.seriesId && uploadForm.seriesId !== 0 ? '已选择合集' : '添加到合集' }}</span>
                            </button>
                        </div>

                        <!-- ═══ 中部：已选文件数据信息（仅当有文件时出现） ═══ -->
                        <div v-if="uploadForm.file" class="n3_uploadFileMeta">
                            <div class="n3_uploadFileMetaRow">
                                <span class="n3_uploadFileMetaLabel">文件名称</span>
                                <span class="n3_uploadFileMetaValue" :title="uploadForm.file.name">{{ uploadFileNameDisplay }}</span>
                            </div>
                            <div class="n3_uploadFileMetaRow">
                                <span class="n3_uploadFileMetaLabel">图片尺寸</span>
                                <span class="n3_uploadFileMetaValue">{{ uploadImageDimensions.width }} × {{ uploadImageDimensions.height }}</span>
                            </div>
                            <div class="n3_uploadFileMetaRow">
                                <span class="n3_uploadFileMetaLabel">文件大小</span>
                                <span class="n3_uploadFileMetaValue">{{ (uploadForm.file.size / 1024 / 1024).toFixed(2) }} MB</span>
                            </div>
                        </div>

                        <!-- ═══ 下板块：作品上传须知 ═══ -->
                        <div class="n3_uploadBlock n3_uploadBlock--bottom">
                            <h4 class="n3_uploadBlockTitle">作品上传须知</h4>

                            <!-- 上传按钮（白色底色 + 2px 黑色实线边框） -->
                            <button class="n3_uploadSelectBtn" @click="uploadFileInputRef?.click()">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="17 8 12 3 7 8"/>
                                    <line x1="12" y1="3" x2="12" y2="15"/>
                                </svg>
                                <span>选择图片上传</span>
                            </button>

                            <!-- 提示信息 -->
                            <div class="n3_uploadInfoBox">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="16" x2="12" y2="12"/>
                                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                                </svg>
                                <span>支持 JPG、JPEG、PNG 格式，单个文件最大 32MB</span>
                            </div>
                        </div>

                        <input
                            ref="uploadFileInputRef"
                            type="file"
                            accept="image/jpeg,image/png"
                            style="display:none"
                            @change="onUploadFileSelect"
                        />
                    </div>
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
                        <div style="display:flex;gap:10px;justify-content:center;">
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

    <!-- ═══════════════════════════════════════════════════
       弹窗：新建合集
       ═══════════════════════════════════════════════════ -->
    <teleport to="body">
        <div v-if="showAddSeriesDialog" class="n3_dialogOverlay" ref="seriesOverlayRef" @click.self="closeSeriesDialog">
            <div class="n3_dialog" ref="seriesDialogRef" @click.stop>
                <h3 class="n3_dialogTitle">新建合集</h3>
                <div class="n3_formGroup">
                    <label class="n3_formLabel">合集名称</label>
                    <input
                        v-model="seriesForm.seriesTitle"
                        class="n3_formInput"
                        type="text"
                        maxlength="16"
                        placeholder="请输入合集名称"
                    />
                    <span class="n3_formTip">{{ seriesForm.seriesTitle.length }}/16</span>
                </div>
                <div class="n3_formGroup" style="margin-top: 20px;">
                    <label class="n3_formLabel">合集描述</label>
                    <input
                        v-model="seriesForm.aboutText"
                        class="n3_formInput"
                        type="text"
                        maxlength="24"
                        placeholder="请输入合集描述（选填）"
                    />
                    <span class="n3_formTip">{{ seriesForm.aboutText.length }}/24</span>
                </div>
                <div class="n3_dialogFooter">
                    <button class="n3_btn" @click="closeSeriesDialog">取消</button>
                    <button class="n3_btn n3_btnPrimary" @click="submitSeriesForm">创建合集</button>
                </div>
            </div>
        </div>
    </teleport>

    <!-- ═══════════════════════════════════════════════════
       弹窗：批量添加到合集
       ═══════════════════════════════════════════════════ -->
    <teleport to="body">
        <div v-if="showAddToSeriesDialog" class="n3_dialogOverlay" ref="addToSeriesOverlayRef" @click.self="closeAddToSeriesDialog">
            <div class="n3_dialog" ref="addToSeriesDialogRef" @click.stop>
                <h3 class="n3_dialogTitle">添加到合集</h3>
                <p class="n3_addToSeriesDesc">将已选的 {{ selectedWorkIds.length }} 件作品批量加入目标合集</p>
                <div class="n3_seriesSelectList">
                    <button
                        v-for="s in seriesList"
                        :key="s.series_id"
                        class="n3_seriesSelectItem"
                        :class="{ active: addToSeriesTargetId === s.series_id }"
                        @click="addToSeriesTargetId = s.series_id"
                    >
                        <span class="n3_seriesSelectName">{{ s.series_title || '未命名合集' }}</span>
                        <svg v-if="addToSeriesTargetId === s.series_id" class="n3_seriesSelectCheck" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </button>
                    <div v-if="seriesList.length === 0" class="n3_seriesSelectEmpty">
                        <span>暂无可用的合集，请先创建合集</span>
                    </div>
                </div>
                <div class="n3_dialogFooter">
                    <template v-if="seriesList.length === 0">
                        <button class="n3_btn" @click="closeAddToSeriesDialog">取消</button>
                        <button class="n3_btn n3_btnWarm" @click="goCreateSeries">前往创建</button>
                    </template>
                    <template v-else>
                        <button class="n3_btn" @click="closeAddToSeriesDialog">取消</button>
                        <button class="n3_btn n3_btnPrimary" :disabled="!addToSeriesTargetId" @click="handleAddToSeries">确认添加</button>
                    </template>
                </div>
            </div>
        </div>
    </teleport>

    <!-- ═══════════════════════════════════════════════════
       弹窗：从合集移除作品
       ═══════════════════════════════════════════════════ -->
    <teleport to="body">
        <div v-if="showRemoveWorksDialog" class="n3_dialogOverlay" @click.self="closeRemoveWorksDialog">
            <div class="n3_dialog n3_dialogWide" @click.stop>
                <h3 class="n3_dialogTitle">从合集移除作品</h3>
                <p class="n3_addToSeriesDesc">「{{ removeWorksTarget?.series_title || '未命名合集' }}」共 {{ seriesDetailWorks.length }} 件作品</p>

                <!-- 加载中 -->
                <div v-if="seriesDetailLoading" class="n3_state" style="padding: 40px 0;">
                    <div class="n3_spinner"></div>
                    <span>加载中...</span>
                </div>

                <!-- 作品为空 -->
                <div v-else-if="seriesDetailWorks.length === 0" class="n3_state" style="padding: 40px 0;">
                    <span style="color: #555;">该合集暂无作品</span>
                </div>

                <!-- 作品可滚动列表 -->
                <div v-else class="n3_removeWorksList">
                    <button
                        v-for="work in seriesDetailWorks"
                        :key="work.work_id"
                        class="n3_removeWorksItem"
                        :class="{ selected: removeWorksSelectedIds.includes(work.work_id) }"
                        @click="toggleRemoveWorkSelect(work.work_id)"
                    >
                        <img
                            v-if="work.thumbFullUrl"
                            :src="work.thumbFullUrl"
                            class="n3_removeWorksThumb"
                            :alt="work.work_title"
                        />
                        <div v-else class="n3_removeWorksThumbPlaceholder">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                            </svg>
                        </div>
                        <span class="n3_removeWorksTitle">{{ work.work_title || '未命名' }}</span>
                        <div class="n3_removeWorksCheck">
                            <svg v-if="removeWorksSelectedIds.includes(work.work_id)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        </div>
                    </button>
                </div>

                <div class="n3_dialogFooter">
                    <button class="n3_btn" @click="closeRemoveWorksDialog">返回</button>
                    <button
                        v-if="pendingRemoveWorkIds.length"
                        class="n3_btn n3_btnWarm"
                        @click="resetRemoveWorksSelection"
                    >重置</button>
                    <button
                        class="n3_btn n3_btnDanger"
                        :disabled="!removeWorksSelectedIds.length"
                        @click="confirmRemoveWorks"
                    >移除所选（{{ removeWorksSelectedIds.length }}）</button>
                </div>
            </div>
        </div>
    </teleport>

    <!-- ═══════════════════════════════════════════════════
       弹窗：上传作品 — 添加到合集
       ═══════════════════════════════════════════════════ -->
    <teleport to="body">
        <div v-if="showUploadSeriesDialog" class="n3_dialogOverlay" @click.self="closeUploadSeriesDialog">
            <div class="n3_dialog" @click.stop>
                <h3 class="n3_dialogTitle">添加到合集</h3>
                <p class="n3_addToSeriesDesc">将作品加入目标合集（可在上传后修改）</p>
                <div class="n3_seriesSelectList">
                    <button
                        v-for="s in seriesList"
                        :key="s.series_id"
                        class="n3_seriesSelectItem"
                        :class="{ active: uploadSeriesTargetId === s.series_id }"
                        @click="uploadSeriesTargetId = uploadSeriesTargetId === s.series_id ? 0 : s.series_id"
                    >
                        <span class="n3_seriesSelectName">{{ s.series_title || '未命名合集' }}</span>
                        <svg v-if="uploadSeriesTargetId === s.series_id" class="n3_seriesSelectCheck" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </button>
                    <div v-if="seriesList.length === 0" class="n3_seriesSelectEmpty">
                        <span>暂无可用的合集，请先在「我的合集」中创建</span>
                    </div>
                </div>
                <div class="n3_dialogFooter">
                    <button class="n3_btn" @click="closeUploadSeriesDialog">取消</button>
                    <button class="n3_btn n3_btnPrimary" @click="confirmUploadSeries">确认</button>
                </div>
            </div>
        </div>
    </teleport>

    <!-- ═══════════════════════════════════════════════════
       弹窗：合集为空提示
       ═══════════════════════════════════════════════════ -->
    <ConfirmDialog
        v-model:show="showEmptySeriesDialog"
        title="合集为空"
        message="该合集是空的，是否添加图片？"
        type="info"
        yes-text="是"
        no-text="否"
        @confirm="handleGoToWorksFromEmptySeries"
        @cancel="showEmptySeriesDialog = false"
    />
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import gsap from 'gsap'
import { useCreatorPanel } from '@/composables/useCreatorPanel'
import { useUploadForm } from '@/composables/creatorPanel/useUploadForm'
import { getUserProfile } from '@/api/profileApi.js'
import { batchRemoveWorksFromSeries } from '@/api/creatorApi'
import { getAvatarUrl } from '@/config/api.js'
import { showError, showSuccess } from '@/utils/notification'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const router = useRouter()
const route = useRoute()

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
    seriesList, seriesLoading, seriesKeyword,
    loadSeries, searchSeries, handleUpdateSeries, handleDeleteSeries,
    loadSeriesDetail, seriesDetailWorks, seriesDetailLoading,
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
    editRadioIndicator, uploadRadioIndicator,
    // 上传
    uploadForm, uploadLoading, resetUploadForm, setUploadFile, removeUploadFile, handleUpload,
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
    openAddSeriesDialog,
    showAddSeriesDialog,
    showAddToSeriesDialog,
    addToSeriesTargetId,
    seriesForm,
    submitSeriesForm,
    submitAddToSeries,
    closeSeriesDialog,
    closeAddToSeriesDialog,
    seriesOverlayRef,
    seriesDialogRef,
    addToSeriesOverlayRef,
    addToSeriesDialogRef,
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
    confirmDeleteSeries,
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
const num2zRef = ref(null)
const seriesSortOptionsRef = ref(null)
const seriesSortSliderRef = ref(null)
// ═══════════════════════════════════════════════════
// 状态
// ═══════════════════════════════════════════════════
const isToggled = ref(false)
const isCollapsed = ref(false)
const activeTab = ref('works')

// ═══════════════════════════════════════════════════
// 合集排序
// ═══════════════════════════════════════════════════
const seriesSortOrder = ref('desc')  // 'asc' = 最早创建, 'desc' = 最近创建

const sortedSeriesList = computed(() => {
    const list = [...seriesList.value]
    if (seriesSortOrder.value === 'asc') {
        list.sort((a, b) => new Date(a.create_time) - new Date(b.create_time))
    } else {
        list.sort((a, b) => new Date(b.create_time) - new Date(a.create_time))
    }
    return list
})

// ═══════════════════════════════════════════════════
// 合集编辑状态
// ═══════════════════════════════════════════════════
const editingSeriesId = ref(null)
const seriesEditForm = reactive({
    seriesTitle: '',
    aboutText: '',
})

// ═══════════════════════════════════════════════════
// 从合集移除作品 — 弹窗状态
// ═══════════════════════════════════════════════════
const showRemoveWorksDialog = ref(false)
const removeWorksTarget = ref(null)         // 当前操作的合集
const removeWorksSelectedIds = ref([])      // 弹窗中选中的作品 ID
const pendingRemoveWorkIds = ref([])        // 暂存待移除的作品 ID（保存时真正执行）

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
let num2zTweens = []

// 作品卡片入场动画
const hasPlayedWorkEntrance = ref(false)
let workEntranceTween = null

// 合集卡片入场动画
const hasPlayedSeriesEntrance = ref(false)
let seriesEntranceTween = null

// 上传板块入场动画
const hasPlayedUploadEntrance = ref(false)
let uploadEntranceTl = null

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const animateWorkCardsEntrance = () => {
    if (hasPlayedWorkEntrance.value || prefersReducedMotion) return

    nextTick(() => {
        const cards = document.querySelectorAll('#num3z .n3_workCard')
        if (!cards.length) return

        hasPlayedWorkEntrance.value = true

        if (workEntranceTween) workEntranceTween.kill()

        workEntranceTween = gsap.from(cards, {
            y: 10,
            opacity: 0,
            duration: 0.4,
            stagger: 0.06,
            ease: 'power2.out',
            onComplete: () => { workEntranceTween = null },
        })
    })
}

// ═══════════════════════════════════════════════════
// 合集卡片入场动画 — 逐张轻微上浮
// ═══════════════════════════════════════════════════
const animateSeriesCardsEntrance = () => {
    if (hasPlayedSeriesEntrance.value || prefersReducedMotion) return

    nextTick(() => {
        const cards = document.querySelectorAll('#num3z .n3_seriesCard')
        if (!cards.length) return

        hasPlayedSeriesEntrance.value = true

        if (seriesEntranceTween) seriesEntranceTween.kill()

        seriesEntranceTween = gsap.from(cards, {
            y: 16,
            opacity: 0,
            duration: 0.4,
            stagger: 0.08,
            ease: 'power2.out',
            onComplete: () => { seriesEntranceTween = null },
        })
    })
}

// ═══════════════════════════════════════════════════
// 上传板块入场动画 — 预览区缩放浮现 + 表单逐块滑入
// ═══════════════════════════════════════════════════
const animateUploadEntrance = () => {
    if (hasPlayedUploadEntrance.value || prefersReducedMotion) return

    nextTick(() => {
        const preview = document.querySelector('#num3z .n3_uploadPreview')
        const topBlock = document.querySelector('#num3z .n3_uploadBlock--top')
        const fileMeta = document.querySelector('#num3z .n3_uploadFileMeta')
        const bottomBlock = document.querySelector('#num3z .n3_uploadBlock--bottom')

        if (!preview && !topBlock && !bottomBlock) return

        hasPlayedUploadEntrance.value = true

        if (uploadEntranceTl) uploadEntranceTl.kill()

        const tl = gsap.timeline({
            defaults: { duration: 0.4, ease: 'power2.out' },
            onComplete: () => { uploadEntranceTl = null },
        })
        uploadEntranceTl = tl

        // 左侧预览区：轻微缩放淡入，像画布浮现
        if (preview) {
            tl.from(preview, { scale: 0.97, opacity: 0, duration: 0.45, ease: 'expo.out' }, 0)
        }

        // 右侧上板块：从右滑入
        if (topBlock) {
            tl.from(topBlock, { x: 20, opacity: 0, duration: 0.35 }, 0.08)
        }

        // 中部文件信息（若有）：从右滑入
        if (fileMeta) {
            tl.from(fileMeta, { x: 20, opacity: 0, duration: 0.35 }, 0.16)
        }

        // 右侧下板块：从右滑入
        if (bottomBlock) {
            tl.from(bottomBlock, { x: 20, opacity: 0, duration: 0.35 }, 0.24)
        }
    })
}

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
// 合集搜索 / 编辑
// ═══════════════════════════════════════════════════
const searchCollections = () => {
    searchSeries()
}

const clearCollectionSearch = () => {
    seriesKeyword.value = ''
    searchSeries()
}

const openSeriesEdit = (series) => {
    // 再次点击同一合集 → 视为取消，收起编辑态
    if (editingSeriesId.value === series.series_id) {
        cancelSeriesEdit()
        return
    }

    editingSeriesId.value = series.series_id
    seriesEditForm.seriesTitle = series.series_title || ''
    seriesEditForm.aboutText = series.about_text || ''

    // 编辑态下占位块保持可见，若未显示则触发入场动画
    nextTick(() => {
        const card = document.querySelector('.n3_seriesCard--editing')
        if (!card) return
        card._phMouseOver = true
        // 清除防抖定时器
        if (card._phEnterTimeout) { clearTimeout(card._phEnterTimeout); card._phEnterTimeout = null }
        if (card._phLeaveTimeout) { clearTimeout(card._phLeaveTimeout); card._phLeaveTimeout = null }
        // 尚不可见 → 入场
        if (card._phState === 'hidden' || !card._phState) {
            playPhEnter(card)
        }
    })
}

const cancelSeriesEdit = () => {
    const card = document.querySelector('.n3_seriesCard--editing')
    editingSeriesId.value = null
    seriesEditForm.seriesTitle = ''
    seriesEditForm.aboutText = ''
    pendingRemoveWorkIds.value = []  // 清除暂存的移除操作

    if (card) {
        card._phMouseOver = false
        if (card._phEnterTimeout) { clearTimeout(card._phEnterTimeout); card._phEnterTimeout = null }
        if (card._phLeaveTimeout) { clearTimeout(card._phLeaveTimeout); card._phLeaveTimeout = null }
        playPhLeave(card)
    }
}

const saveSeriesEdit = async (series) => {
    const newTitle = seriesEditForm.seriesTitle.trim()
    const newAbout = seriesEditForm.aboutText.trim()
    const hasMetadataChange =
        newTitle !== (series.series_title || '') ||
        newAbout !== (series.about_text || '')
    const hasPendingRemovals = pendingRemoveWorkIds.value.length > 0

    // 无任何修改 → 提示并终止
    if (!hasMetadataChange && !hasPendingRemovals) {
        showError('操作失败，暂未进行修改操作')
        return
    }
    if (hasMetadataChange && !newTitle) {
        showError('合集名称不能为空')
        return
    }

    let updateOk = true
    if (hasMetadataChange) {
        const result = await handleUpdateSeries({
            seriesId: series.series_id,
            seriesTitle: newTitle,
            aboutText: newAbout,
        })
        updateOk = result.success
    }

    if (!updateOk) return

    // 执行暂存的移除操作（批量一次提交）
    let removedCount = 0
    if (hasPendingRemovals) {
        const ids = [...pendingRemoveWorkIds.value]
        pendingRemoveWorkIds.value = []
        const res = await batchRemoveWorksFromSeries(ids, series.series_id)
        if (res.success) removedCount = ids.length
    }

    // 成功提示
    if (removedCount > 0) {
        showSuccess(`操作成功，已将 ${removedCount} 份作品移出合集`)
    }

    const card = document.querySelector('.n3_seriesCard--editing')
    editingSeriesId.value = null
    seriesEditForm.seriesTitle = ''
    seriesEditForm.aboutText = ''

    // 同步刷新合集和作品列表，保持 series_id 一致
    loadSeries({ reset: true })
    loadWorks({ reset: true })

    if (card) {
        card._phMouseOver = false
        if (card._phEnterTimeout) { clearTimeout(card._phEnterTimeout); card._phEnterTimeout = null }
        if (card._phLeaveTimeout) { clearTimeout(card._phLeaveTimeout); card._phLeaveTimeout = null }
        playPhLeave(card)
    }
}

// ═══════════════════════════════════════════════════
// 从合集移除作品 — 弹窗逻辑
// ═══════════════════════════════════════════════════
const openRemoveWorksDialog = async (series) => {
    removeWorksTarget.value = series
    // 预选已暂存待移除的作品（用户可增删）
    removeWorksSelectedIds.value = [...pendingRemoveWorkIds.value]
    showRemoveWorksDialog.value = true
    // 加载合集内作品列表
    await loadSeriesDetail(series.series_id)
}

const closeRemoveWorksDialog = () => {
    showRemoveWorksDialog.value = false
    removeWorksTarget.value = null
    removeWorksSelectedIds.value = []
}

const toggleRemoveWorkSelect = (workId) => {
    const idx = removeWorksSelectedIds.value.indexOf(workId)
    if (idx === -1) {
        removeWorksSelectedIds.value.push(workId)
    } else {
        removeWorksSelectedIds.value.splice(idx, 1)
    }
}

const confirmRemoveWorks = () => {
    if (!removeWorksSelectedIds.value.length || !removeWorksTarget.value) return
    // 暂存待移除的作品 ID，点击「确定修改」时真正执行
    pendingRemoveWorkIds.value = [...removeWorksSelectedIds.value]
    closeRemoveWorksDialog()
}

const resetRemoveWorksSelection = () => {
    pendingRemoveWorkIds.value = []
    removeWorksSelectedIds.value = []
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
// 合集排序 — 滑块聚焦动画
// ═══════════════════════════════════════════════════
const updateSeriesSortIndicator = () => {
    if (!seriesSortOptionsRef.value || !seriesSortSliderRef.value) return
    const activeBtn = seriesSortOptionsRef.value.querySelector('.status-option.active')
    if (!activeBtn) {
        gsap.to(seriesSortSliderRef.value, { opacity: 0, duration: 0.2 })
        return
    }
    const containerRect = seriesSortOptionsRef.value.getBoundingClientRect()
    const btnRect = activeBtn.getBoundingClientRect()
    const left = btnRect.left - containerRect.left
    const width = btnRect.width

    gsap.to(seriesSortSliderRef.value, {
        left,
        width,
        opacity: 1,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: true,
    })
}

const onSeriesSortClick = (order) => {
    seriesSortOrder.value = order
    nextTick(() => updateSeriesSortIndicator())
}

// ═══════════════════════════════════════════════════
// 批量添加到合集 — 委托 composable（内部自动过滤重复作品）
// ═══════════════════════════════════════════════════
const handleAddToSeries = () => {
    if (!addToSeriesTargetId.value) return
    submitAddToSeries()
}

// ═══════════════════════════════════════════════════
// 无合集时 → 前往创建
// ═══════════════════════════════════════════════════
const goCreateSeries = () => {
    closeAddToSeriesDialog()
    switchTab('collections')
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
    if (tab === 'collections' && seriesList.value.length === 0) loadSeries({ reset: true })
    if (tab === 'upload') {
        nextTick(() => updateUploadRadioIndicator())
    }
}

const goToWorkDetail = (workId, userId) => {
    router.push(`/work/${workId}${userId ? `?userId=${userId}` : ''}`)
}

// ═══════════════════════════════════════════════════
// 合集查看 — 跳转 Gallery / 空合集提示
// ═══════════════════════════════════════════════════
const showEmptySeriesDialog = ref(false)
const emptySeriesTarget = ref(null)

const handleViewSeries = (series) => {
    // 检查合集中是否有图片（thumbnails 中至少有一个非空 URL）
    const hasImages = series.thumbnails && series.thumbnails.some(url => url && url.trim())

    if (hasImages) {
        // 合集有图片 → 跳转 Gallery 预览（Gallery 根据 seriesId 自动加载所有作品）
        router.push({
            name: 'gallery',
            query: {
                seriesId: series.series_id,
                title: series.series_title || '未命名合集',
            },
        })
    } else {
        // 合集为空 → 弹窗提示
        emptySeriesTarget.value = series
        showEmptySeriesDialog.value = true
    }
}

const handleGoToWorksFromEmptySeries = () => {
    showEmptySeriesDialog.value = false
    emptySeriesTarget.value = null
    switchTab('works')
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
        tl.to(num1zRef.value, { height: 163, duration: 0.4 }, 0)
        tl.to(collapsedTabsRef.value, { width: _origCollapsedTabsWidth, opacity: 1, pointerEvents: 'auto', overflow: 'visible', duration: 0.3 }, 0.2)
        tl.to('.collapse-icon', { rotation: 180, duration: 0.35 }, 0)
    } else {
        tl.to(num1zRef.value, { height: _origNum1zHeight, duration: 0.4 }, 0)
        tl.to(h2Ref.value, { top: 75, height: _origH2Height, opacity: 1, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, duration: 0.35 }, 0.05)
        tl.to(optionBottomRef.value, { height: _origBottomHeight, minHeight: 50, opacity: 1, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, duration: 0.35 }, 0.1)
        tl.to(optionButtonsRef.value, { width: _origButtonsWidth, opacity: 1, marginLeft: 0, marginRight: 0, paddingLeft: 0, paddingRight: 0, gap: 15, overflow: 'hidden', duration: 0.35 }, 0.15)
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
        y: 15,
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        overwrite: true,
    })
}

// ═══════════════════════════════════════════════════
// 合集卡片 hover → 中间占位块分上下两组依次入场（防抖 + 完整播放）
//
// 状态机：hidden → waiting → entering → visible → leaving → hidden
// 动画一旦开始必定完整播放，完成后根据 _phMouseOver 决定下一步
// ═══════════════════════════════════════════════════
const PH_ENTER_DELAY = 180   // 进入防抖延迟
const PH_LEAVE_DELAY = 0   // 动画完成后鼠标已离开 → 停留片刻再退场（调试为0，效果还行）

/** 播放入场动画（必定完整播放） */
const playPhEnter = (card) => {
    card._phState = 'entering'
    const upperBlocks = card.querySelectorAll('.n3_phBlock--upper')
    const lowerBlocks = card.querySelectorAll('.n3_phBlock--lower')

    const tl = gsap.timeline({
        defaults: { duration: 0.4, ease: 'back.out(1.7)', overwrite: true },
        onComplete: () => {
            card._phTimeline = null
            card._phState = 'visible'
            // 动画播完鼠标已离开 → 延迟后退场
            if (!card._phMouseOver) schedulePhLeave(card)
        },
    })
    tl.to(upperBlocks, { opacity: 1, scale: 1, stagger: 0.07 })
      .to(lowerBlocks, { opacity: 1, scale: 1, stagger: 0.07 }, '-=0.12')
    card._phTimeline = tl
}

/** 播放退场动画（必定完整播放） */
const playPhLeave = (card) => {
    card._phState = 'leaving'
    if (card._phTimeline) { card._phTimeline.kill(); card._phTimeline = null }

    const allBlocks = card.querySelectorAll('.n3_phBlock')
    const tl = gsap.timeline({
        defaults: { duration: 0.25, ease: 'power2.in', overwrite: true },
        onComplete: () => {
            card._phTimeline = null
            card._phState = 'hidden'
            // 退场播完鼠标又回来了 → 重新走入场流程
            if (card._phMouseOver) schedulePhEnter(card)
        },
    })
    tl.to(allBlocks, { opacity: 0, scale: 0 })
    card._phTimeline = tl
}

/** 延迟退场 */
const schedulePhLeave = (card) => {
    if (card._phLeaveTimeout) return
    card._phLeaveTimeout = setTimeout(() => {
        card._phLeaveTimeout = null
        playPhLeave(card)
    }, PH_LEAVE_DELAY)
}

/** 延迟入场 */
const schedulePhEnter = (card) => {
    if (card._phEnterTimeout) return
    card._phState = 'waiting'
    card._phEnterTimeout = setTimeout(() => {
        card._phEnterTimeout = null
        playPhEnter(card)
    }, PH_ENTER_DELAY)
}

const onSeriesCardEnter = (e) => {
    const card = e.currentTarget
    if (card.classList.contains('n3_seriesCard--editing')) return
    card._phMouseOver = true

    // 退场动画进行中 → 不打断，onComplete 检测到 _phMouseOver 会重新入场
    if (card._phState === 'leaving') return

    // 取消待执行的退场定时器
    if (card._phLeaveTimeout) { clearTimeout(card._phLeaveTimeout); card._phLeaveTimeout = null }

    // 已可见 / 正在入场 / 等待入场 → 不动
    if (card._phState === 'visible' || card._phState === 'entering' || card._phState === 'waiting') return

    // 状态为 hidden → 启动入场防抖
    schedulePhEnter(card)
}

const onSeriesCardLeave = (e) => {
    const card = e.currentTarget
    if (card.classList.contains('n3_seriesCard--editing')) return
    card._phMouseOver = false

    // 入场动画进行中 → 不打断，onComplete 检测到 !_phMouseOver 会触发退场
    if (card._phState === 'entering') return

    // 取消待执行的入场定时器
    if (card._phEnterTimeout) { clearTimeout(card._phEnterTimeout); card._phEnterTimeout = null; card._phState = 'hidden' }

    // 退场进行中 / 已隐藏 → 不动
    if (card._phState === 'leaving' || card._phState === 'hidden') return

    // 状态为 visible → 启动退场延迟
    schedulePhLeave(card)
}

// ═══════════════════════════════════════════════════
// 获取用户数据
// ═══════════════════════════════════════════════════
const fetchUserStats = async () => {
    const cached = localStorage.getItem('userInfo')
    if (cached) {
        try {
            const parsed = JSON.parse(cached)
            userInfo.workCount = parsed.work_count ?? parsed.workCount ?? 0
            userInfo.totalViews = parsed.total_views ?? parsed.totalViews ?? 0
            userInfo.totalLikes = parsed.total_likes ?? parsed.totalLikes ?? 0
            userInfo.totalStars = parsed.total_stars ?? parsed.totalStars ?? 0
        } catch { /* ignore parse error */ }
    }

    const result = await getUserProfile()
    if (result.success && result.data) {
        const d = result.data
        // 兼容下划线和驼峰两种命名
        userInfo.workCount = d.work_count ?? d.workCount ?? 0
        userInfo.totalViews = d.total_views ?? d.totalViews ?? 0
        userInfo.totalLikes = d.total_likes ?? d.totalLikes ?? 0
        userInfo.totalStars = d.total_stars ?? d.totalStars ?? 0

        if (d.avatar_url) {
            avatarUrl.value = getAvatarUrl(d.avatar_url)
        }
    }
}

// ═══════════════════════════════════════════════════
// 上传 — UI 交互逻辑（委托 useUploadForm composable）
// ═══════════════════════════════════════════════════
const {
    uploadRadioGroupRef, uploadRadioIndicatorStyle,
    updateUploadRadioIndicator, toggleUploadOriginal,
    uploadFileInputRef,
    onUploadFileSelect, onUploadDragOver, onUploadDrop, onUploadRemoveFile,
    uploadImageDimensions, uploadFileNameDisplay,
    submitUpload, cancelUpload,
    showUploadSeriesDialog, uploadSeriesTargetId,
    openUploadSeriesDialog, confirmUploadSeries, closeUploadSeriesDialog,
    uploadLinkPillRef, onUploadLinkEnter, onUploadLinkLeave,
} = useUploadForm({
    uploadForm, uploadLoading, uploadRadioIndicator,
    handleUpload, setUploadFile, removeUploadFile, resetUploadForm,
    fetchUserStats, switchTab, seriesList,
})

// 窗口大小变化 → 更新指示器
const handleResize = () => {
    updateStatusIndicator()
    updateSeriesSortIndicator()
    updateEditRadioIndicator()
}

// ═══════════════════════════════════════════════════
// num2z 入场动画 — 状态栏从左滑入 + 搜索栏从右滑入
// ═══════════════════════════════════════════════════
const animateNum2zEntrance = () => {
    // 先清除之前可能残留的动画
    num2zTweens.forEach(t => t.kill())
    num2zTweens = []

    if (!num2zRef.value) return

    const lCeb = num2zRef.value.querySelector('.n2_Lceb')
    const rCeb = num2zRef.value.querySelector('.n2_Rceb')
    const createPill = num2zRef.value.querySelector('.n2_createSeriesPill')

    if (createPill) {
        // 新建合集按钮从左侧滑入（set 初始态 + to 动画，配合 CSS visibility:hidden 防闪烁）
        gsap.set(createPill, { x: -20, autoAlpha: 0 })
        num2zTweens.push(gsap.to(createPill, {
            x: 0,
            autoAlpha: 1,
            duration: 0.4,
            ease: 'power2.out',
        }))
    }

    if (lCeb) {
        // 状态栏/排序栏整体从左滑入
        num2zTweens.push(gsap.from(lCeb, {
            x: -30,
            autoAlpha: 0,
            duration: 0.45,
            ease: 'power2.out',
        }))

        // 状态/排序选项按钮依次从下方淡入
        const options = lCeb.querySelectorAll('.status-option')
        if (options.length) {
            num2zTweens.push(gsap.from(options, {
                y: 10,
                autoAlpha: 0,
                duration: 0.3,
                stagger: 0.06,
                ease: 'power2.out',
                delay: 0.12,
            }))
        }
    }

    if (rCeb) {
        // 搜索栏从右滑入，略微延迟形成节奏感
        num2zTweens.push(gsap.from(rCeb, {
            x: 30,
            autoAlpha: 0,
            duration: 0.45,
            ease: 'power2.out',
            delay: 0.1,
        }))
    }
}

// ═══════════════════════════════════════════════════
// 生命周期
// ═══════════════════════════════════════════════════
onMounted(async () => {
    // 从 Gallery 返回等场景 → 恢复目标 tab
    const targetTab = route.query.tab
    if (targetTab && ['works', 'collections', 'upload'].includes(targetTab)) {
        activeTab.value = targetTab
    }

    await fetchUserStats()

    // 初始化 GSAP 上下文
    ctx = gsap.context(() => {
        const distance = getTravelDistance()
        gsap.set(circleRef.value, { x: distance })
        gsap.set(collapseBtnRef.value, { y: 15, opacity: 0 })
    }, n1MainRef.value)

    // 初始化状态筛选滑块
    nextTick(() => {
        updateStatusIndicator()
        updateSeriesSortIndicator()
    })

    // 初始加载时触发 num2z 入场动画
    if (activeTab.value === 'works') {
        nextTick(() => animateNum2zEntrance())
    }

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

// 监听 tab 切换：初始化滚动观察器 + num2z 入场 + 作品卡片入场
watch(activeTab, (tab) => {
    if (tab === 'works') {
        // 重置入场标记，确保切换回来后动画重新播放
        hasPlayedWorkEntrance.value = false
        initScrollObserver()
        nextTick(() => {
            updateStatusIndicator()
            animateNum2zEntrance()
        })
        // 已有作品且不在加载中（本次不会触发 loadWorks）→ 直接播放动画
        if (worksList.value.length > 0 && !worksLoading.value) {
            animateWorkCardsEntrance()
        }
    }
    if (tab === 'collections') {
        hasPlayedSeriesEntrance.value = false
        nextTick(() => {
            updateSeriesSortIndicator()
            animateNum2zEntrance()
        })
        // 已有合集且不在加载中 → 直接播放动画
        if (seriesList.value.length > 0 && !seriesLoading.value) {
            animateSeriesCardsEntrance()
        }
    }
    if (tab === 'upload') {
        hasPlayedUploadEntrance.value = false
        nextTick(() => {
            animateUploadEntrance()
        })
    }
})

// 状态筛选变化 → 重置入场标记 + 更新滑块（loadWorks 完成后 watcher 触发动画）
watch(() => worksApprovalFilter.value, () => {
    hasPlayedWorkEntrance.value = false
    nextTick(() => updateStatusIndicator())
})

// ═══════════════════════════════════════════════════
// 作品卡片入场动画 — 加载完成后从下方 10px 上浮
// ═══════════════════════════════════════════════════
watch([() => worksList.value.length, worksLoading], ([len, loading]) => {
    if (!loading && len > 0 && activeTab.value === 'works') {
        animateWorkCardsEntrance()
    }
})

// ═══════════════════════════════════════════════════
// 合集卡片入场动画 — 加载完成后触发
// ═══════════════════════════════════════════════════
watch([() => seriesList.value.length, seriesLoading], ([len, loading]) => {
    if (!loading && len > 0 && activeTab.value === 'collections') {
        animateSeriesCardsEntrance()
    }
})

onUnmounted(() => {
    if (ctx) ctx.revert()
    if (collapseTl) collapseTl.kill()
    if (workEntranceTween) workEntranceTween.kill()
    if (seriesEntranceTween) seriesEntranceTween.kill()
    if (uploadEntranceTl) uploadEntranceTl.kill()
    num2zTweens.forEach(t => t.kill())
    window.removeEventListener('resize', handleResize)
    editWorkDialog.cleanup()
})
</script>

<style scoped>
@import url(../assets/CSS/CreatorCenter.css);
</style>
