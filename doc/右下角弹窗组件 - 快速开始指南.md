# 右下角弹窗组件 - 快速开始指南

## 概述

已成功为你的项目创建了一个专业的右下角通知弹窗组件，符合项目的设计规范和视觉风格。

## 已创建的文件

1. **NotificationToast.vue** - 弹窗组件 (`src/components/NotificationToast.vue`)
2. **notification.js** - 工具函数 (`src/utils/notification.js`)
3. **ToastDemo.vue** - 演示页面 (`src/views/ToastDemo.vue`)
4. **NOTIFICATION_README.md** - 详细文档 (`src/components/NOTIFICATION_README.md`)

## 快速使用

### 方式一：工具函数（推荐）

```javascript
import { showSuccess, showError } from '@/utils/notification'

// 显示成功提示
showSuccess('操作成功！')

// 显示错误提示
showError('操作失败，请重试')

// 自定义标题和时长
showInfo('消息内容', '我的标题', 5000)
```

### 方式二：直接使用组件

```vue
<script setup>
import { ref } from 'vue'
import NotificationToast from '@/components/NotificationToast.vue'

const showToast = ref(false)
</script>

<template>
  <button @click="showToast = true">显示提示</button>
  
  <NotificationToast
    v-model:show="showToast"
    title="提示"
    message="这是一条消息"
    type="info"
    :duration="3000"
  />
</template>
```

## 在登录页面中的集成

已在 `loginView.vue` 中集成了弹窗组件，自动替换了所有的 `alert()` 调用：

```javascript
// 原有的 alert 会自动转换为漂亮的弹窗
alert('登录失败')  // 自动转换为 showError
alert('注册成功')  // 自动转换为 showSuccess
```

## 四种类型

| 类型 | 用途 | 示例 |
|------|------|------|
| info | 一般信息提示 | `showInfo('请填写完整信息')` |
| success | 操作成功反馈 | `showSuccess('保存成功')` |
| warning | 警告或注意事项 | `showWarning('数据即将过期')` |
| error | 错误或失败提示 | `showError('网络连接失败')` |

## 查看演示

运行项目后访问：
```
http://localhost:5173/toast-demo
```

演示页面展示了所有功能和用法示例。

## 特性

- GSAP 流畅动画
- 自动关闭（可配置时长）
- 支持手动关闭
- 响应式设计
- 同时只显示一个弹窗
- 自动清理 DOM

## 常用场景示例

### 1. 表单提交
```javascript
const handleSubmit = async () => {
  if (!validateForm()) {
    showWarning('请填写所有必填字段')
    return
  }
  
  const result = await submitForm()
  
  if (result.success) {
    showSuccess('提交成功')
  } else {
    showError(result.message || '提交失败')
  }
}
```

### 2. 网络请求
```javascript
const fetchData = async () => {
  try {
    const data = await api.getData()
    showSuccess('数据加载成功')
  } catch (error) {
    showError('网络请求失败')
  }
}
```

### 3. 删除确认
```javascript
const handleDelete = async (id) => {
  if (!confirm('确定要删除吗？')) return
  
  const result = await api.delete(id)
  
  if (result.success) {
    showSuccess('删除成功')
  } else {
    showError('删除失败')
  }
}
```

## 技术细节

- **Vue 3 Composition API**
- **GSAP 动画库**（项目已有依赖）
- **Teleport** 挂载到 body
- **动态创建实例**（工具函数方式）

## 样式定制

如需修改样式，编辑 `NotificationToast.vue` 的 `<style>` 部分。

主要类名：
- `.notification-toast` - 容器
- `.toast-content` - 内容区
- `.toast-icon` - 图标
- `.toast-title` - 标题
- `.toast-message` - 消息

## 下一步

1. 在其他页面中使用弹窗组件
2. 根据需要调整样式和动画
3. 查看详细文档：`src/components/NOTIFICATION_README.md`

---

如有问题，请参考完整文档或查看演示页面。