<script setup>
import { ref, onMounted } from 'vue'
import VerticalWaterfall from '@/components/VerticalWaterfall.vue'
import { useWorkWaterfall } from '@/composables/useWorkWaterfall'
import { showSuccess, showError } from '@/utils/notification'

const {
  waterfallImages,
  isLoading,
  hasMore,
  loadWorks,
  loadMore,
  refresh,
} = useWorkWaterfall()

// ── 控制面板参数 ──
const filterUserId = ref('')
const filterTitle = ref('')
const pageSize = ref(20)

// ── 加载模式 ──
const loadMode = ref('auto') // 'auto' | 'manual'

const handleLoadMore = () => {
  loadMore({ size: pageSize.value })
}

const handleImageClick = (img) => {
  console.log('[Demo] 图片点击:', img)
  showSuccess(`点击了作品: ${img.workTitle || img.alt || '未命名'}`)
}

// ── 手动加载 ──
const doManualLoad = () => {
  loadMore({ size: pageSize.value })
}

// ── 应用筛选（重置并重新加载） ──
const applyFilter = () => {
  const filters = {}
  if (filterUserId.value.trim()) {
    filters.userId = Number(filterUserId.value.trim())
  }
  if (filterTitle.value.trim()) {
    filters.workTitle = filterTitle.value.trim()
  }
  refresh(filters, pageSize.value)
}

// ── 切换加载模式 ──
const setLoadMode = (mode) => {
  loadMode.value = mode
  // 重置数据
  waterfallImages.value = []
  hasMore.value = true
  // 根据模式加载
  if (mode === 'auto') {
    loadWorks({ reset: true, size: pageSize.value })
  }
}

// ── 初始化 ──
onMounted(() => {
  loadWorks({ reset: true, size: pageSize.value })
})
</script>

<template>
  <div class="demo-page">
    <h1>竖向瀑布流组件演示</h1>
    <p class="demo-desc">
      基于 IntersectionObserver 的无感分页竖向瀑布流，支持最短列优先布局、骨架屏加载、响应式列数。
    </p>

    <!-- 悬浮数据计数器 -->
    <div class="floating-counter" v-if="waterfallImages.length > 0">
      <span class="fc-count">{{ waterfallImages.length }}</span>
      <span class="fc-label">条已加载</span>
    </div>

    <!-- 代码示例 -->
    <section class="code-section">
      <h2>代码示例</h2>
      <div class="code-block">
        <pre><code>// 1. 引入组件和 composable
import VerticalWaterfall from '@/components/VerticalWaterfall.vue'
import { useWorkWaterfall } from '@/composables/useWorkWaterfall'

const {
  waterfallImages,
  isLoading,
  hasMore,
  loadMore,
  refresh,
} = useWorkWaterfall()

// 2. 初始加载
onMounted(() => {
  loadWorks({ reset: true, size: 20 })
})

// 3. 模板中使用
&lt;VerticalWaterfall
  :images="waterfallImages"
  :has-more="hasMore"
  :is-loading="isLoading"
  :gap="8"
  @load-more="loadMore"
  @image-click="handleImageClick"
/&gt;

// 4. 筛选刷新
const applyFilter = () => {
  refresh({ userId: 1, workTitle: '风景' })
}</code></pre>
      </div>
    </section>

    <!-- Props / Events 文档 -->
    <section class="doc-section">
      <h2>Props</h2>
      <table class="doc-table">
        <thead>
          <tr>
            <th>名称</th>
            <th>类型</th>
            <th>默认值</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>images</code></td>
            <td>Array</td>
            <td><code>[]</code></td>
            <td>图片数据数组，每项含 src / workId / alt / height</td>
          </tr>
          <tr>
            <td><code>hasMore</code></td>
            <td>Boolean</td>
            <td><code>true</code></td>
            <td>是否还有更多分页数据</td>
          </tr>
          <tr>
            <td><code>isLoading</code></td>
            <td>Boolean</td>
            <td><code>false</code></td>
            <td>是否正在加载中</td>
          </tr>
          <tr>
            <td><code>gap</code></td>
            <td>Number</td>
            <td><code>8</code></td>
            <td>列间距（px）</td>
          </tr>
        </tbody>
      </table>

      <h2>Events</h2>
      <table class="doc-table">
        <thead>
          <tr>
            <th>事件名</th>
            <th>参数</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>load-more</code></td>
            <td>—</td>
            <td>哨兵进入视口（提前 300px）时触发，调用加载更多</td>
          </tr>
          <tr>
            <td><code>image-click</code></td>
            <td><code>img: Object</code></td>
            <td>点击图片时触发，传递完整图片对象</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- 控制面板 -->
    <section class="control-panel">
      <h2>控制面板</h2>

      <div class="control-row">
        <label class="control-label">加载模式</label>
        <div class="mode-group">
          <button
              class="mode-btn"
              :class="{ active: loadMode === 'auto' }"
              @click="setLoadMode('auto')"
          >
            无感分页
          </button>
          <button
              class="mode-btn"
              :class="{ active: loadMode === 'manual' }"
              @click="setLoadMode('manual')"
          >
            手动加载
          </button>
        </div>
      </div>

      <div class="control-row">
        <label class="control-label">筛选条件</label>
        <div class="filter-group">
          <input
              v-model="filterUserId"
              class="filter-input"
              type="number"
              placeholder="用户ID"
          />
          <input
              v-model="filterTitle"
              class="filter-input"
              type="text"
              placeholder="作品标题关键词"
          />
          <input
              v-model.number="pageSize"
              class="filter-input filter-input--sm"
              type="number"
              placeholder="每页数量"
              min="1"
              max="50"
          />
          <button class="filter-btn" @click="applyFilter">应用筛选</button>
        </div>
      </div>

      <div v-if="loadMode === 'manual'" class="control-row">
        <label class="control-label">操作</label>
        <button
            class="filter-btn"
            :disabled="isLoading || !hasMore"
            @click="doManualLoad"
        >
          {{ isLoading ? '加载中...' : '加载更多' }}
        </button>
        <span class="status-text" v-if="!hasMore && waterfallImages.length > 0">
          已加载全部 {{ waterfallImages.length }} 条
        </span>
      </div>

      <div class="control-row">
        <label class="control-label">状态</label>
        <span class="status-badge" :class="{ loading: isLoading }">
          {{ isLoading ? '加载中' : '就绪' }}
        </span>
        <span class="status-text">
          已加载 {{ waterfallImages.length }} 条，{{ hasMore ? '还有更多' : '已全部加载' }}
        </span>
      </div>
    </section>

    <!-- 瀑布流渲染区域 -->
    <section class="waterfall-section">
      <h2>瀑布流预览</h2>
      <VerticalWaterfall
        :images="waterfallImages"
        :has-more="hasMore"
        :is-loading="isLoading"
        :gap="8"
        @load-more="handleLoadMore"
        @image-click="handleImageClick"
      />
    </section>
  </div>
</template>

<style scoped>
.demo-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 80px;
  color: #ffffff;
}

h1 {
  font-size: 28px;
  margin: 0 0 8px;
  text-align: center;
}

.demo-desc {
  text-align: center;
  color: rgba(255, 255, 255, 0.45);
  font-size: 14px;
  margin: 0 0 36px;
}

/* ── 悬浮数据计数器 ── */
.floating-counter {
  position: fixed;
  top: 20px;
  right: 24px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.fc-count {
  font-size: 24px;
  font-weight: 700;
  color: #00A947;
  line-height: 1;
}

.fc-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 0.5px;
}

h2 {
  font-size: 18px;
  margin: 0 0 14px;
  color: #e0e0e0;
}

/* ── 控制面板 ── */
.control-panel {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 28px;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.control-row:last-child {
  margin-bottom: 0;
}

.control-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  min-width: 70px;
  flex-shrink: 0;
}

.mode-group {
  display: flex;
  gap: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #333;
}

.mode-btn {
  padding: 7px 16px;
  border: none;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-btn:not(:last-child) {
  border-right: 1px solid #333;
}

.mode-btn.active {
  background: rgba(0, 169, 71, 0.15);
  color: #00A947;
}

.mode-btn:hover:not(.active) {
  background: rgba(255, 255, 255, 0.08);
}

.filter-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-input {
  width: 130px;
  height: 34px;
  padding: 0 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #ffffff;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

.filter-input:focus {
  border-color: rgba(0, 169, 71, 0.5);
}

.filter-input--sm {
  width: 80px;
}

.filter-btn {
  height: 34px;
  padding: 0 16px;
  border: none;
  border-radius: 6px;
  background: #00A947;
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  filter: brightness(0.9);
}

.filter-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  filter: none;
}

.status-badge {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 4px;
  background: rgba(0, 169, 71, 0.12);
  color: #00A947;
}

.status-badge.loading {
  background: rgba(74, 158, 255, 0.12);
  color: #4a9eff;
}

.status-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
}

/* ── 瀑布流区域 ── */
.waterfall-section {
  margin-bottom: 40px;
}

/* ── 代码示例 ── */
.code-section {
  margin-bottom: 40px;
}

.code-block {
  background: #0c0c0c;
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
  border: 1px solid #333;
}

.code-block pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.7;
  color: #cccccc;
}

/* ── 文档表格 ── */
.doc-section {
  margin-bottom: 40px;
}

.doc-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin-bottom: 24px;
}

.doc-table th,
.doc-table td {
  text-align: left;
  padding: 10px 14px;
  border-bottom: 1px solid #222;
}

.doc-table th {
  color: rgba(255, 255, 255, 0.4);
  font-weight: 500;
  font-size: 12px;
  text-transform: uppercase;
}

.doc-table td {
  color: rgba(255, 255, 255, 0.75);
}

.doc-table code {
  background: rgba(255, 255, 255, 0.06);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  color: #00A947;
}

/* ── 响应式 ── */
@media (max-width: 768px) {
  .demo-page {
    padding: 20px 12px 60px;
  }

  h1 {
    font-size: 22px;
  }

  .control-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .filter-input {
    width: 100%;
  }

  .filter-input--sm {
    width: 100%;
  }
}
</style>
