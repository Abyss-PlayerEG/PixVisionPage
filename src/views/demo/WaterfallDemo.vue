<script setup>
import { ref, onMounted, computed } from 'vue'
import Waterfall from '@/components/Waterfall.vue'
import { useWorkWaterfall } from '@/composables/useWorkWaterfall'

// 使用瀑布流 Composable
const { 
  waterfallImages, 
  isLoading, 
  error, 
  hasMore, 
  loadWorks, 
  loadMore 
} = useWorkWaterfall()

// 筛选条件状态
const filters = ref({
  workTitle: '',
  userId: undefined,
  seriesId: undefined,
  isOriginal: undefined, // 'true', 'false', or undefined
  current: 1,
  size: 50
})

// 刷新/搜索
const handleRefresh = () => {
  const params = {
    reset: true,
    size: filters.value.size, // 传入用户设置的每页数量
    filters: {
      workTitle: filters.value.workTitle || undefined,
      userId: filters.value.userId ? Number(filters.value.userId) : undefined,
      seriesId: filters.value.seriesId ? Number(filters.value.seriesId) : undefined,
      isOriginal: filters.value.isOriginal === '' ? undefined : (filters.value.isOriginal === 'true')
    }
  }
  loadWorks(params)
}

// 加载更多
const handleLoadMore = () => {
  loadMore()
}

onMounted(() => {
  handleRefresh()
})
</script>

<template>
  <div class="demo-container">
    <header class="demo-header">
      <h1>瀑布流组件联调演示</h1>
      
      <!-- 状态栏 -->
      <div class="status-bar">
        <span>当前数据量: <strong>{{ waterfallImages.length }}</strong></span>
        <span v-if="isLoading" class="loading-indicator">加载中...</span>
        <span v-else-if="error" class="error-text">{{ error }}</span>
        <span v-else-if="!hasMore && waterfallImages.length > 0" class="end-text">已加载全部数据</span>
      </div>

      <!-- 筛选控制面板 -->
      <div class="controls">
        <div class="control-group">
          <label>作品标题:</label>
          <input v-model="filters.workTitle" placeholder="模糊查询" />
        </div>
        <div class="control-group">
          <label>用户 ID:</label>
          <input type="number" v-model.number="filters.userId" placeholder="精确查询" />
        </div>
        <div class="control-group">
          <label>系列 ID:</label>
          <input type="number" v-model.number="filters.seriesId" placeholder="精确查询" />
        </div>
        <div class="control-group">
          <label>是否原创:</label>
          <select v-model="filters.isOriginal">
            <option value="">全部</option>
            <option value="true">是 (原创)</option>
            <option value="false">否 (转载)</option>
          </select>
        </div>
        <div class="control-group">
          <label>每页数量:</label>
          <input type="number" v-model.number="filters.size" min="1" max="500" style="width: 80px;" />
        </div>
        <button @click="handleRefresh" :disabled="isLoading" class="btn-primary">
          {{ isLoading ? '请求中...' : '搜索 / 刷新' }}
        </button>
        <button @click="handleLoadMore" :disabled="isLoading || !hasMore" class="btn-secondary">
          加载更多
        </button>
      </div>
    </header>

    <main class="demo-content">
      <Waterfall 
        :external-images="waterfallImages" 
        :pin-offset-top="0"
      />
    </main>
  </div>
</template>

<style scoped>
.demo-container {
  min-height: 100vh;
  background-color: #0f0f0f;
  color: #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.demo-header {
  padding: 20px;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
  position: sticky;
  top: 0;
  z-index: 100;
}

.demo-header h1 {
  margin: 0 0 16px 0;
  font-size: 1.5rem;
  color: #fff;
}

.status-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 0.9rem;
  color: #888;
}

.status-bar strong {
  color: #4a9eff;
}

.loading-indicator {
  color: #f39c12;
}

.error-text {
  color: #e74c3c;
}

.end-text {
  color: #2ecc71;
}

.controls {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

input {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #444;
  background: #2a2a2a;
  color: #fff;
  outline: none;
}

select {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #444;
  background: #2a2a2a;
  color: #fff;
  outline: none;
}

input:focus {
  border-color: #4a9eff;
}

button {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-toggle {
  background: #333;
  color: #fff;
}

.btn-toggle:hover {
  background: #444;
}

.btn-primary {
  background: #4a9eff;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #3b8bff;
}

.btn-secondary {
  background: #2ecc71;
  color: #fff;
}

.btn-secondary:hover:not(:disabled) {
  background: #27ae60;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status-text {
  font-size: 0.9rem;
  color: #888;
}

.error-banner {
  margin-top: 12px;
  padding: 10px;
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid #e74c3c;
  border-radius: 6px;
  color: #e74c3c;
}

.demo-content {
  padding: 20px;
}
</style>
