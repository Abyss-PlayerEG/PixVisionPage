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
  autoLoadEnabled,
  loadWorks, 
  loadMore,
  toggleAutoLoad 
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

// 控制面板展开状态
const isPanelExpanded = ref(true)

// 自动加载监听器
let scrollTriggerObserver = null
let hasTriggeredLoad = false // 防止重复触发

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

// 切换自动加载
const handleToggleAutoLoad = (enabled) => {
  toggleAutoLoad(enabled)
  hasTriggeredLoad = false // 重置触发标志
  if (enabled) {
    setupAutoLoadObserver()
  } else {
    removeAutoLoadObserver()
  }
}

// 设置自动加载监听
const setupAutoLoadObserver = () => {
  if (scrollTriggerObserver) return
  
  import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
    scrollTriggerObserver = ScrollTrigger.create({
      trigger: "#num2z",
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        // 只有当进度超过 80% 且尚未触发过加载时
        if (self.progress > 0.8 && !hasTriggeredLoad && hasMore.value && !isLoading.value && autoLoadEnabled.value) {
          hasTriggeredLoad = true // 立即上锁
          loadMore().finally(() => {
            // 等待一小段时间或数据渲染完成后解锁，允许下一次触发
            setTimeout(() => {
              hasTriggeredLoad = false
            }, 500)
          })
        }
      }
    })
  })
}

// 移除监听
const removeAutoLoadObserver = () => {
  if (scrollTriggerObserver) {
    scrollTriggerObserver.kill()
    scrollTriggerObserver = null
  }
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
    <header class="demo-header" :class="{ 'collapsed': !isPanelExpanded }">
      <div class="header-top">
        <h1>瀑布流组件联调演示</h1>
        <button class="collapse-btn" @click="isPanelExpanded = !isPanelExpanded" :title="isPanelExpanded ? '收起' : '展开'">
          <svg v-if="isPanelExpanded" viewBox="0 0 1024 1024" width="16" height="16">
            <path d="M768 384L512 640 256 384" fill="none" stroke="currentColor" stroke-width="64"/>
          </svg>
          <svg v-else viewBox="0 0 1024 1024" width="16" height="16">
            <path d="M256 640l256-256 256 256" fill="none" stroke="currentColor" stroke-width="64"/>
          </svg>
        </button>
      </div>
      
      <!-- 状态栏 -->
      <div class="status-bar">
        <span>当前数据量: <strong>{{ waterfallImages.length }}</strong></span>
        <span v-if="isLoading" class="loading-indicator">加载中...</span>
        <span v-else-if="error" class="error-text">{{ error }}</span>
        <span v-else-if="!hasMore && waterfallImages.length > 0" class="end-text">已加载全部数据</span>
      </div>

      <!-- 筛选控制面板 -->
      <transition name="panel-slide">
        <div v-if="isPanelExpanded" class="controls">
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
            <div class="control-group">
              <label>自动加载:</label>
              <label class="switch">
                <input type="checkbox" :checked="autoLoadEnabled" @change="handleToggleAutoLoad($event.target.checked)">
                <span class="slider round"></span>
              </label>
            </div>
            <button @click="handleLoadMore" :disabled="isLoading || !hasMore || autoLoadEnabled" class="btn-secondary">
              {{ isLoading ? '加载中...' : '手动加载' }}
            </button>
        </div>
      </transition>
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
  transition: all 0.3s ease;
}

.demo-header.collapsed {
  padding: 10px 20px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.collapse-btn {
  background: transparent;
  border: 1px solid #444;
  color: #888;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s;
}

.collapse-btn:hover {
  background: #333;
  color: #fff;
  border-color: #666;
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

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  max-height: 0;
}

.panel-slide-enter-to,
.panel-slide-leave-from {
  opacity: 1;
  max-height: 200px;
}

/* Toggle Switch 样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #444;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #4a9eff;
}

input:focus + .slider {
  box-shadow: 0 0 1px #4a9eff;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.slider.round {
  border-radius: 20px;
}

.slider.round:before {
  border-radius: 50%;
}

.demo-content {
  padding: 20px;
}
</style>
