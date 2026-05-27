<script setup>
import { ref } from 'vue'
import SeriesGrid from '@/components/SeriesGrid.vue'

const userId = ref(1)
const keyword = ref('')

const handleSeriesClick = (series) => {
  console.log('[Demo] 合集点击:', series)
}
</script>

<template>
  <div class="demo-page">
    <h1>SeriesGrid 合集网格组件演示</h1>
    <p class="demo-desc">
      基于 CSS Grid 的 Bento 风格合集网格，8 列宽屏栅格布局，每张卡片随机横跨 3-6 列。支持标题/描述叠加显示、骨架屏加载、IntersectionObserver 无感分页。
    </p>

    <!-- 控制面板 -->
    <section class="control-panel">
      <h2>控制面板</h2>
      <div class="control-row">
        <label class="control-label">用户 ID</label>
        <input
          v-model.number="userId"
          class="control-input"
          type="number"
          placeholder="输入用户 ID"
          min="1"
        />
        <label class="control-label">关键词</label>
        <input
          v-model="keyword"
          class="control-input"
          type="text"
          placeholder="搜索合集标题/描述"
        />
      </div>
    </section>

    <!-- 网格预览 -->
    <section class="preview-section">
      <h2>网格预览</h2>
      <SeriesGrid
        :key="userId"
        :user-id="userId"
        :keyword="keyword"
        @series-click="handleSeriesClick"
      />
    </section>
  </div>
</template>

<style scoped>
.demo-page {
  max-width: 1400px;
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
  line-height: 1.6;
}

h2 {
  font-size: 16px;
  margin: 0 0 12px;
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
  gap: 12px;
  flex-wrap: wrap;
}

.control-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  min-width: 60px;
  flex-shrink: 0;
}

.control-input {
  width: 140px;
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

.control-input:focus {
  border-color: rgba(0, 169, 71, 0.5);
}

/* ── 预览区域 ── */
.preview-section {
  background: #111;
  border-radius: 12px;
  padding: 20px;
  min-height: 400px;
}
</style>
