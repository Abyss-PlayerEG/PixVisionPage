# 右下角弹窗组件 (Notification Toast)

## 概述

这是一个基于 Vue 3 和 GSAP 动画的右下角通知弹窗组件，符合项目的设计规范和视觉风格。

## 特性

- 右下角固定位置显示
- 支持 4 种类型：info、success、warning、error
- GSAP 流畅动画效果
- 自动关闭功能（可配置时长）
- 支持手动关闭
- 响应式设计，适配移动端
- 两种使用方式：组件方式和工具函数方式

## 文件结构

```
src/
├── components/
│   └── NotificationToast.vue      # 弹窗组件
├── utils/
│   └── notification.js            # 工具函数
└── views/
    └── ToastDemo.vue              # 演示页面
```

## 使用方式

### 方式一：直接使用组件（适合在模板中使用）

```vue
<script setup>
import { ref } from 'vue'
import NotificationToast from '@/components/NotificationToast.vue'

const showToast = ref(false)

const showMessage = () => {
  showToast.value = true
}
</script>

<template>
  <button @click="showMessage">显示提示</button>
  
  <NotificationToast
    v-model:show="showToast"
    title="提示"
    message="这是一条消息"
    type="info"
    :duration="3000"
  />
</template>
```

### 方式二：使用工具函数（推荐，更简洁）

```vue
<script setup>
import { showSuccess, showError, showInfo, showWarning } from '@/utils/notification'

// 显示成功提示
const handleSuccess = () => {
  showSuccess('操作已成功完成！')
}

// 显示错误提示
const handleError = () => {
  showError('操作失败，请检查网络连接')
}

// 显示信息提示
const handleInfo = () => {
  showInfo('这是一条信息提示', '系统通知')
}

// 显示警告提示
const handleWarning = () => {
  showWarning('请注意，这是一个警告信息')
}

// 自定义标题和时长
const handleCustom = () => {
  showInfo('自定义消息内容', '我的标题', 5000) // 显示5秒
}
</script>

<template>
  <button @click="handleSuccess">成功提示</button>
  <button @click="handleError">错误提示</button>
  <button @click="handleInfo">信息提示</button>
  <button @click="handleWarning">警告提示</button>
  <button @click="handleCustom">自定义提示</button>
</template>
```

## API 文档

### 组件 Props

| 参数 | 说明 | 类型 | 默认值 | 必填 |
|------|------|------|--------|------|
| show | 是否显示弹窗 | Boolean | false | 是 |
| title | 标题 | String | '通知' | 否 |
| message | 消息内容 | String | - | 是 |
| type | 类型 | String | 'info' | 否 |
| duration | 显示时长（毫秒），0 表示不自动关闭 | Number | 3000 | 否 |

### 组件 Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| close | 关闭弹窗时触发 | - |

### 工具函数

#### showToast(options)

通用显示方法

**参数：**
- `options.message` (String, 必填) - 消息内容
- `options.title` (String, 可选) - 标题
- `options.type` (String, 可选) - 类型：'info' | 'success' | 'warning' | 'error'
- `options.duration` (Number, 可选) - 显示时长（毫秒），默认 3000

**返回：**
- 包含 `close()` 方法的对象，可用于手动关闭弹窗

**示例：**
```javascript
import { showToast } from '@/utils/notification'

const toast = showToast({
  message: '这是一条消息',
  title: '提示',
  type: 'info',
  duration: 3000
})

// 手动关闭
toast.close()
```

#### showInfo(message, title, duration)

快捷显示信息提示

**参数：**
- `message` (String) - 消息内容
- `title` (String, 可选) - 标题，默认 '提示'
- `duration` (Number, 可选) - 显示时长，默认 3000

#### showSuccess(message, title, duration)

快捷显示成功提示

#### showWarning(message, title, duration)

快捷显示警告提示

#### showError(message, title, duration)

快捷显示错误提示

#### closeToast()

关闭当前显示的弹窗

## 类型说明

| 类型 | 图标颜色 | 默认标题 | 适用场景 |
|------|---------|---------|---------|
| info | 蓝色 (#4a9eff) | 提示 | 一般信息提示 |
| success | 绿色 (#2ecc71) | 成功 | 操作成功反馈 |
| warning | 橙色 (#f39c12) | 警告 | 警告或注意事项 |
| error | 红色 (#e74c3c) | 错误 | 错误或失败提示 |

## 实际应用场景

### 1. 登录成功后显示提示

```javascript
import { showSuccess } from '@/utils/notification'

const handleLogin = async () => {
  const result = await apiHandleLogin(loginForm)
  
  if (result.success) {
    showSuccess('登录成功，正在跳转...')
    setTimeout(() => {
      router.push('/')
    }, 1500)
  } else {
    showError(result.message || '登录失败')
  }
}
```

### 2. 表单验证失败提示

```javascript
import { showWarning } from '@/utils/notification'

const handleSubmit = () => {
  if (!validateAll()) {
    showWarning('请填写所有必填字段')
    return
  }
  
  // 提交逻辑
}
```

### 3. 网络请求错误处理

```javascript
import { showError } from '@/utils/notification'

const fetchData = async () => {
  try {
    const response = await fetch(API_URL)
    const data = await response.json()
    // 处理数据
  } catch (error) {
    showError('网络请求失败，请检查网络连接')
  }
}
```

### 4. 操作确认提示

```javascript
import { showSuccess } from '@/utils/notification'

const handleDelete = async (id) => {
  const confirmed = confirm('确定要删除吗？')
  if (!confirmed) return
  
  const result = await apiDelete(id)
  
  if (result.success) {
    showSuccess('删除成功')
    // 刷新列表
  } else {
    showError('删除失败')
  }
}
```

## 样式定制

如果需要修改弹窗样式，可以编辑 `NotificationToast.vue` 中的 `<style>` 部分。

主要样式类：
- `.notification-toast` - 弹窗容器
- `.toast-content` - 内容区域
- `.toast-icon` - 图标
- `.toast-title` - 标题
- `.toast-message` - 消息文本
- `.toast-close` - 关闭按钮

## 注意事项

1. **同时只显示一个弹窗**：新的弹窗会自动关闭之前的弹窗
2. **自动清理**：弹窗关闭后会自动清理 DOM 元素，避免内存泄漏
3. **GSAP 动画**：使用了 GSAP 进行动画，确保已安装 gsap 依赖
4. **Teleport**：组件使用 Teleport 挂载到 body，不受父组件样式影响
5. **响应式**：在移动端会自动调整位置和宽度

## 演示页面

访问 `/toast-demo` 查看完整的演示和代码示例：

```bash
npm run dev
# 然后访问 http://localhost:5173/toast-demo
```

## 技术实现

- **Vue 3 Composition API**：使用 setup 语法糖
- **GSAP 动画**：流畅的进入和退出动画
- **Teleport**：将弹窗渲染到 body，避免层级问题
- **动态创建实例**：工具函数方式通过 createApp 动态创建 Vue 实例
- **响应式设计**：适配桌面端和移动端

## 更新日志

### v1.0.0 (2026-05-13)
- 初始版本发布
- 支持 4 种类型提示
- GSAP 动画效果
- 两种使用方式
- 响应式设计