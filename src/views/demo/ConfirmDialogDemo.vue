<script setup>
import { ref } from 'vue'
import { showConfirm } from '@/utils/confirmDialog.js'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { showSuccess, showError, showInfo } from '@/utils/notification.js'

// ========== 工具函数方式（推荐） ==========
const confirmDelete = async () => {
  const confirmed = await showConfirm({
    title: '删除确认',
    message: '确定要删除这个项目吗？此操作不可撤销。',
    yesText: '删除',
    noText: '取消',
  })
  if (confirmed) showSuccess('已删除')
}

const confirmPublish = async () => {
  const confirmed = await showConfirm({ message: '确定要发布这个作品吗？' })
  if (confirmed) showSuccess('发布成功！')
  else showInfo('已取消发布')
}

const confirmLogout = async () => {
  const confirmed = await showConfirm({
    title: '退出登录',
    message: '确定要退出当前账号吗？',
    yesText: '退出',
    noText: '留在此页',
  })
  if (confirmed) showSuccess('已退出登录')
}

const confirmCustom = async () => {
  const confirmed = await showConfirm({
    title: '覆盖保存',
    message: '当前文件已有历史版本，覆盖后旧版本将无法恢复。是否继续？',
    yesText: '覆盖',
    noText: '保留',
  })
  if (confirmed) showSuccess('已覆盖保存')
  else showError('已取消覆盖')
}

// ========== 组件方式 ==========
const componentShow = ref(false)
const componentMode = ref('simple')

const openComponentDialog = (mode) => {
  componentMode.value = mode
  componentShow.value = true
}

const onComponentConfirm = () => {
  showSuccess('用户点击了"是"')
  componentShow.value = false
}

const onComponentCancel = () => {
  showInfo('用户点击了"否"')
  componentShow.value = false
}
</script>

<template>
  <div class="confirm-demo">
    <h1>居中选择弹窗组件演示</h1>

    <section class="demo-section">
      <h2>使用工具函数（推荐）</h2>
      <p class="demo-desc">直接 await 调用，返回 true/false，无需管理组件状态。</p>
      <div class="button-group">
        <button @click="confirmDelete" class="btn btn-error">
          删除确认
        </button>
        <button @click="confirmPublish" class="btn btn-success">
          发布确认
        </button>
        <button @click="confirmLogout" class="btn btn-warning">
          退出登录
        </button>
        <button @click="confirmCustom" class="btn btn-info">
          覆盖保存
        </button>
      </div>
      <div class="code-block">
        <pre><code>import { showConfirm } from '@/utils/confirmDialog'

// async/await 风格
const confirmed = await showConfirm({
  title: '删除确认',
  message: '确定要删除吗？',
  yesText: '删除'
})

if (confirmed) {
  // 执行删除逻辑
}</code></pre>
      </div>
    </section>

    <section class="demo-section">
      <h2>使用组件方式</h2>
      <p class="demo-desc">通过 v-model 控制显示/隐藏，适合复杂的模板内使用场景。</p>
      <div class="button-group">
        <button @click="openComponentDialog('simple')" class="btn btn-info">
          基础确认
        </button>
        <button @click="openComponentDialog('delete')" class="btn btn-error">
          危险操作
        </button>
      </div>

      <ConfirmDialog
        v-if="componentShow"
        :show="componentShow"
        :title="componentMode === 'delete' ? '永久删除' : '操作确认'"
        :message="componentMode === 'delete' ? '此操作会将数据永久删除且无法恢复。' : '你确定要继续执行此操作吗？'"
        :yes-text="componentMode === 'delete' ? '确认删除' : '是'"
        :no-text="componentMode === 'delete' ? '保留数据' : '否'"
        @update:show="componentShow = $event"
        @confirm="onComponentConfirm"
        @cancel="onComponentCancel"
      />

      <div class="code-block" style="margin-top: 20px;">
        <pre><code>&lt;ConfirmDialog
  v-model:show="showDialog"
  title="操作确认"
  message="你确定要继续吗？"
  yes-text="是"
  no-text="否"
  @confirm="onConfirm"
  @cancel="onCancel"
/&gt;</code></pre>
      </div>
    </section>

    <section class="demo-section">
      <h2>Props 参数</h2>
      <table class="demo-table">
        <thead>
          <tr>
            <th>参数</th>
            <th>类型</th>
            <th>默认值</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>title</td>
            <td>String</td>
            <td>'确认'</td>
            <td>居中显示的标题</td>
          </tr>
          <tr>
            <td>message</td>
            <td>String</td>
            <td>-</td>
            <td>消息内容（必填）</td>
          </tr>
          <tr>
            <td>show</td>
            <td>Boolean</td>
            <td>false</td>
            <td>v-model 控制显示</td>
          </tr>
          <tr>
            <td>yesText</td>
            <td>String</td>
            <td>'是'</td>
            <td>确认按钮文字</td>
          </tr>
          <tr>
            <td>noText</td>
            <td>String</td>
            <td>'否'</td>
            <td>取消按钮文字</td>
          </tr>
        </tbody>
      </table>

      <h2 style="margin-top: 28px;">Events 事件</h2>
      <table class="demo-table">
        <thead>
          <tr>
            <th>事件名</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>confirm</td><td>点击"是"时触发</td></tr>
          <tr><td>cancel</td><td>点击"否"或遮罩时触发</td></tr>
          <tr><td>close</td><td>弹窗关闭时触发</td></tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
.confirm-demo {
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
  font-size: 22px;
  margin: 0 0 12px;
  color: #e0e0e0;
}

.demo-desc {
  font-size: 13px;
  color: #7e7e7e;
  margin: 0 0 16px;
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
  margin-bottom: 20px;
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

.btn:active { transform: translateY(0); }

.btn-info    { background-color: #4a9eff; }
.btn-info:hover    { background-color: #3a8eef; }
.btn-success { background-color: #2ecc71; }
.btn-success:hover { background-color: #27ae60; }
.btn-warning { background-color: #f39c12; }
.btn-warning:hover { background-color: #e67e22; }
.btn-error   { background-color: #e74c3c; }
.btn-error:hover   { background-color: #c0392b; }

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

.demo-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.demo-table th {
  text-align: left;
  padding: 10px 12px;
  color: #7e7e7e;
  font-weight: 500;
  border-bottom: 1px solid #333;
}

.demo-table td {
  padding: 10px 12px;
  color: #cecece;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.demo-table tr:last-child td { border-bottom: none; }

@media (max-width: 768px) {
  .confirm-demo {
    padding: 20px;
  }
  h1 { font-size: 24px; }
  h2 { font-size: 18px; }
  .button-group { flex-direction: column; }
  .btn { width: 100%; }
}
</style>
