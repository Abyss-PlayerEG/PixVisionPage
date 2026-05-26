<script setup>
import { ref } from 'vue'
import { showAvatarCropper } from '@/utils/avatarCropper.js'
import AvatarCropper from '@/components/AvatarCropper.vue'
import { showSuccess, showError, showInfo } from '@/utils/notification.js'

// ── JS 调用方式（推荐） ──
const croppingResult = ref(null)
const lastFileInfo = ref(null)
const lastDataUrl = ref('')

const openCropperJS = async () => {
  const result = await showAvatarCropper({})
  if (result.canceled) {
    showInfo('已取消裁剪')
    return
  }
  croppingResult.value = result.blob
  lastFileInfo.value = {
    name: result.file?.name || 'unknown',
    size: formatSize(result.blob?.size || 0),
    type: result.blob?.type || 'image/png',
  }
  lastDataUrl.value = result.dataUrl || ''
  showSuccess('裁剪完成！')
}

const openCropperCustomSize = async () => {
  const result = await showAvatarCropper({
    outputSize: 512,
    previewSize: 260,
  })
  if (!result.canceled && result.blob) {
    croppingResult.value = result.blob
    lastFileInfo.value = {
      name: result.file?.name || 'unknown',
      size: formatSize(result.blob.size),
      type: result.blob.type,
    }
    lastDataUrl.value = result.dataUrl || ''
    showSuccess('512px 头像裁剪完成！')
  }
}

// ── 组件方式 ──
const componentShow = ref(false)
const componentResult = ref(null)
const componentDataUrl = ref('')

const onComponentConfirm = (data) => {
  componentResult.value = data.blob
  componentDataUrl.value = data.dataUrl
  componentShow.value = false
  showSuccess('组件方式裁剪完成！')
}

const onComponentCancel = () => {
  componentShow.value = false
}

// ── 模拟上传 ──
const simulateUpload = async () => {
  if (!croppingResult.value) { showError('请先裁剪头像'); return }
  showInfo('模拟上传中...')
  // 实际项目中替换为真实 API 调用：
  // const formData = new FormData()
  // formData.append('file', croppingResult.value, 'avatar.png')
  // const res = await fetch(AVATAR_UPLOAD_API, { method: 'POST', headers: { ... }, body: formData })
  await new Promise(r => setTimeout(r, 800))
  showSuccess('上传成功！（模拟）')
}

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// ── 新标签页打开裁剪结果（不触发下载，不保存到本地） ──
const openInNewTab = () => {
  if (!croppingResult.value) return
  const url = URL.createObjectURL(croppingResult.value)
  console.log('[AvatarCropper Demo] 新标签页 Blob URL:', url)
  window.open(url, '_blank')
}
</script>

<template>
  <div class="cropper-demo">
    <h1>头像裁剪组件演示</h1>

    <!-- JS 调用方式 -->
    <section class="demo-section">
      <h2>使用 JS 工具函数（推荐）</h2>
      <p class="demo-desc">直接 await 调用，返回裁剪结果 Blob，方便对接后端上传接口。</p>
      <div class="button-group">
        <button @click="openCropperJS" class="btn btn-primary">打开裁剪（默认 1024px 输出）</button>
        <button @click="openCropperCustomSize" class="btn btn-primary">打开裁剪（512px 输出）</button>
      </div>
      <div class="code-block">
        <pre><code>import { showAvatarCropper } from '@/utils/avatarCropper'

      const result = await showAvatarCropper()

if (!result.canceled) {
  // result.blob   → 裁剪后的图片 Blob（可直接上传）
  // result.file   → 用户选择的原始文件
  // result.dataUrl → base64 预览 URL

  const formData = new FormData()
  formData.append('file', result.blob, 'avatar.png')
  await fetch('/api/user/avatar/upload', { method: 'POST', body: formData })
}</code></pre>
      </div>
    </section>

    <!-- 组件方式 -->
    <section class="demo-section">
      <h2>使用组件方式</h2>
      <p class="demo-desc">通过 v-model 控制显示，适合需要完全控制弹窗状态的场景。</p>
      <div class="button-group">
        <button @click="componentShow = true" class="btn btn-secondary">打开裁剪组件</button>
      </div>
      <div v-if="componentDataUrl" class="result-preview" style="margin-top: 16px;">
        <img :src="componentDataUrl" alt="裁剪结果" class="preview-img" />
        <p class="preview-label">组件方式裁剪结果</p>
      </div>
      <div class="code-block" style="margin-top: 16px;">
        <pre><code>&lt;AvatarCropper
  v-model:show="showDialog"
  :output-size="1024"
  :preview-size="300"
  @confirm="onConfirm"
  @cancel="onCancel"
/&gt;</code></pre>
      </div>
    </section>

    <!-- 裁剪结果 -->
    <section v-if="croppingResult" class="demo-section">
      <h2>裁剪结果</h2>
      <div class="result-preview">
        <img :src="lastDataUrl" alt="裁剪结果" class="preview-img" />
        <div class="result-info">
          <span>文件名：{{ lastFileInfo?.name }}</span>
          <span>大小：{{ lastFileInfo?.size }}</span>
          <span>格式：{{ lastFileInfo?.type }}</span>
        </div>
      </div>
      <div class="button-group" style="margin-top: 16px;">
        <button @click="openInNewTab" class="btn btn-secondary">在新标签页中查看</button>
        <button @click="simulateUpload" class="btn btn-success">模拟上传到后端</button>
      </div>
    </section>

    <!-- Props 参数 -->
    <section class="demo-section">
      <h2>Props / 参数</h2>
      <table class="demo-table">
        <thead>
          <tr><th>参数</th><th>类型</th><th>默认值</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td>outputSize</td><td>Number</td><td>1024</td><td>输出图片尺寸（px），1:1 正方形</td></tr>
          <tr><td>previewSize</td><td>Number</td><td>300</td><td>裁剪区预览尺寸（px）</td></tr>
          <tr><td>show</td><td>Boolean</td><td>false</td><td>v-model 控制显示</td></tr>
        </tbody>
      </table>

      <h2 style="margin-top: 24px;">返回值（JS 调用）</h2>
      <table class="demo-table" style="margin-top: 12px;">
        <thead>
          <tr><th>字段</th><th>类型</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td>blob</td><td>Blob | null</td><td>裁剪后的 PNG Blob，可直接上传</td></tr>
          <tr><td>file</td><td>File | null</td><td>用户选择的原始文件</td></tr>
          <tr><td>dataUrl</td><td>String | null</td><td>base64 Data URL，用于本地预览</td></tr>
          <tr><td>canceled</td><td>Boolean</td><td>是否取消操作</td></tr>
        </tbody>
      </table>

      <h2 style="margin-top: 24px;">Events 事件（组件方式）</h2>
      <table class="demo-table" style="margin-top: 12px;">
        <thead>
          <tr><th>事件名</th><th>参数</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td>confirm</td><td>{ blob, file, dataUrl, width, height }</td><td>点击确认裁剪时触发</td></tr>
          <tr><td>cancel</td><td>-</td><td>点击取消/返回时触发</td></tr>
          <tr><td>close</td><td>-</td><td>弹窗关闭后触发</td></tr>
        </tbody>
      </table>
    </section>

    <!-- 实际组件挂载（组件方式时需要） -->
    <AvatarCropper
      v-if="componentShow"
      :show="componentShow"
      :output-size="1024"
      :preview-size="300"
      @update:show="componentShow = $event"
      @confirm="onComponentConfirm"
      @cancel="onComponentCancel"
    />
  </div>
</template>

<style scoped>
.cropper-demo {
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
  color: #ffffff;
  min-height: 100vh;
  background: #0c0c0c;
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

.btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
.btn:active { transform: translateY(0); }

.btn-primary { background-color: #00A947; }
.btn-primary:hover { background-color: #008e3a; }
.btn-secondary { background-color: #4a9eff; }
.btn-secondary:hover { background-color: #3a8eef; }
.btn-success { background-color: #2ecc71; }
.btn-success:hover { background-color: #27ae60; }

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

.result-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.preview-img {
  width: 128px;
  height: 128px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #00A947;
}

.preview-label {
  font-size: 13px;
  color: #888;
  margin: 0;
}

.result-info {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #aaaaaa;
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
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.demo-table tr:last-child td { border-bottom: none; }

@media (max-width: 768px) {
  .cropper-demo { padding: 20px; }
  h1 { font-size: 24px; }
  h2 { font-size: 18px; }
  .button-group { flex-direction: column; }
  .btn { width: 100%; }
  .result-info { flex-wrap: wrap; gap: 8px; }
}
</style>
