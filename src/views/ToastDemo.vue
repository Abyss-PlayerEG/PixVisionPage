<script setup>
import { showInfo, showSuccess, showWarning, showError } from '@/utils/notification'

// 工具函数方式 - 各种类型提示
const showToolInfo = () => {
  showInfo('这是一条信息提示', '系统通知')
}

const showToolSuccess = () => {
  showSuccess('操作已成功完成！', '成功')
}

const showToolWarning = () => {
  showWarning('请注意，这是一个警告信息', '警告')
}

const showToolError = () => {
  showError('操作失败，请检查网络连接', '错误')
}

// 自定义时长
const showLongToast = () => {
  showSuccess('这条消息会显示5秒钟', '长时间提示', 5000)
}
</script>

<template>
  <div class="toast-demo">
    <h1>右下角弹窗组件演示</h1>
    
    <section class="demo-section">
      <h2>使用工具函数（推荐）</h2>
      <div class="button-group">
        <button @click="showToolInfo" class="btn btn-info">
          信息提示
        </button>
        <button @click="showToolSuccess" class="btn btn-success">
          成功提示
        </button>
        <button @click="showToolWarning" class="btn btn-warning">
          警告提示
        </button>
        <button @click="showToolError" class="btn btn-error">
          错误提示
        </button>
      </div>
    </section>
    
    <section class="demo-section">
      <h2>高级用法</h2>
      <div class="button-group">
        <button @click="showLongToast" class="btn btn-success">
          自定义时长（5秒）
        </button>
      </div>
    </section>
    
    <section class="demo-section">
      <h2>代码示例</h2>
      <div class="code-block">
        <pre><code>// 在脚本中使用工具函数
import { showSuccess, showError } from '@/utils/notification'

// 显示成功提示
showSuccess('操作成功！')

// 显示错误提示
showError('操作失败，请重试')

// 自定义标题和时长
showInfo('自定义消息', '我的标题', 5000)</code></pre>
      </div>
    </section>
  </div>
</template>

<style scoped>
.toast-demo {
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
  color: #ffffff;
}

h1 {
  font-size: 32px;
  margin-bottom: 40px;
  text-align: center;
  color: #ffffff;
}

h2 {
  font-size: 24px;
  margin: 30px 0 20px;
  color: #e0e0e0;
  border-bottom: 2px solid #333;
  padding-bottom: 10px;
}

.demo-section {
  margin-bottom: 40px;
  background-color: #1a1a1a;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #333;
}

.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #ffffff;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.btn:active {
  transform: translateY(0);
}

.btn-info {
  background-color: #4a9eff;
}

.btn-info:hover {
  background-color: #3a8eef;
}

.btn-success {
  background-color: #2ecc71;
}

.btn-success:hover {
  background-color: #27ae60;
}

.btn-warning {
  background-color: #f39c12;
}

.btn-warning:hover {
  background-color: #e67e22;
}

.btn-error {
  background-color: #e74c3c;
}

.btn-error:hover {
  background-color: #c0392b;
}

.code-block {
  background-color: #0c0c0c;
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
  border: 1px solid #333;
}

.code-block pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #cccccc;
}

@media (max-width: 768px) {
  .toast-demo {
    padding: 20px;
  }
  
  h1 {
    font-size: 24px;
  }
  
  h2 {
    font-size: 20px;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>