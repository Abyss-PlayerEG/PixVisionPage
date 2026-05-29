# PixelVisionPage — 设计风格与代码风格指南

> 本文档为新页面的增添和现有代码的修改提供一致性参考，涵盖设计语言、代码架构、命名规范和常见模式。

---

## 1. 项目概览

| 维度 | 内容 |
|------|------|
| **定位** | 视觉艺术社区平台，面向画师/设计师的作品展示与互动 |
| **技术栈** | Vue 3 (Composition API / `<script setup>`) + Vite 7 + Vue Router 5 + Pinia 3 |
| **动画库** | GSAP 3.14 + ScrollTrigger（唯一动画方案） |
| **HTTP** | 原生 `fetch`，**禁止 axios** |
| **CSS 预处理** | Sass/SCSS（已安装，现有 CSS 为纯 CSS，新页面建议用 SCSS） |
| **包管理** | pnpm |
| **后端地址** | `http://124.221.107.68:1899/`（在 `src/config/api.js` 统一管理） |

---

## 2. 视觉设计语言

### 2.1 色彩体系

**主背景色（暗色主题）**

```css
/* 页面底色 */
background-color: #000000;          /* 纯黑，各 section 背景 */

/* 卡片/面板底色 */
background: #1a1a1a;                /* 最常用，卡片、按钮 */
background: #0d0d0d;                /* 更深，输入区、图片舞台 */
background: #2a2a2a;                /* 骨架屏亮区、hover 态 */

/* 半透明面板（玻璃效果） */
background: rgba(0, 0, 0, 0.5);     /* 侧边栏 */
background: rgba(0, 0, 0, 0.85);    /* 顶部导航栏 */
background: rgba(255, 255, 255, 0.03); /* 发布者卡片 */
background: rgba(255, 255, 255, 0.05); /* 统计卡片 */
background: rgba(255, 255, 255, 0.08); /* hover 态 */
```

**品牌色**

```css
/* 主品牌绿 */
#00A947                            /* 按钮、active 态、徽章、品牌强调 */

/* 文本层级 */
#ffffff                            /* 主标题、强调文本 */
#cecece                            /* 正文内容 */
#aaa / #7e7e7e                    /* 次要文本、描述 */
#555                               /* placeholder、弱提示 */
rgba(255, 255, 255, 0.7)          /* 半透明文本，导航链接 */
rgba(255, 255, 255, 0.3~0.5)      /* 禁用/装饰文本 */
```

**语义色**

```css
/* 错误 */
#e64d3c                            /* 验证失败边框 */
/* 成功 */
#2a9d6a                            /* 验证成功边框 */
/* 警告/危险 */
rgba(255, 100, 100, 0.7)          /* 退出登录按钮 */
```

**分隔线**

```css
border-top: 1px solid rgba(255, 255, 255, 0.06);   /* 细分隔 */
border-top: 1px solid rgba(255, 255, 255, 0.08);   /* 稍粗分隔 */
border: 1px solid rgba(255, 255, 255, 0.1);        /* 卡片描边 */
border: 2px solid #3a3a3a;                          /* 区块分割线 */
```

### 2.2 字体体系

**项目自定义字体**（定义于 `src/assets/FONTS/font.css`）

| 字体族名 | 用途 | 字重 |
|---------|------|------|
| `sul-gbk6` | 主标题/英雄区大标题 | 900 (Black) |
| `sul-gr` | 正文 | 400 (Regular) |
| `sul-gm1` | 中等强调 | 500 (Medium) |
| `sul-gbo4` | 粗体标题 | 700 (Bold) |
| `sul-geb` | 强化标题 | 800 (ExtraBold) |
| `sul-gh9` | 重磅标题 | 900 (Heavy) |

**使用场景**

```css
font-family: sul-gbk6;           /* 主页 hero 大标题、section 标题 */
font-family: "微软雅黑";           /* 副标题、导航、登录面板标题 */
font-family: 'Courier New', monospace; /* UUID 等代码类文本 */
```

### 2.3 间距规范

遵循 **8px 栅格系统**：

| 场景 | 值 |
|------|-----|
| 紧凑内边距 | `8px` / `12px` |
| 常规内边距 | `16px` / `20px` |
| 卡片间距 (gap) | `8px` ~ `16px` |
| Section 内边距 | `padding: 100px 5% 60px 5%` |
| 页面水平边距 | `5%` 或 `24px`（固定值） |

### 2.4 玻璃形态效果

全站统一使用 `backdrop-filter: blur()` 实现毛玻璃效果：

```css
backdrop-filter: blur(10px);     /* 常规玻璃卡 */
backdrop-filter: blur(12px);     /* 导航栏、筛选栏 */
backdrop-filter: blur(6px);      /* 小遮罩层 */
```

### 2.5 圆角体系

```css
border-radius: 8px;              /* 小按钮、标签、输入框 */
border-radius: 10px;             /* 卡片、面板 */
border-radius: 12px;             /* 输入区 */
border-radius: 16px;             /* 大卡片、图片区 */
border-radius: 20px;             /* 弹出面板 */
border-radius: 25px / 50px;      /* 胶囊按钮（高度的一半） */
border-radius: 999px;            /* 药丸形（徽章等） */
```

### 2.6 阴影

```css
box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);    /* 轻微浮起 */
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);    /* 深度浮起 */
box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.25);  /* 从下方浮起 */
```

---

## 3. 代码架构

### 3.1 三层架构（强制）

```
src/config/api.js      → API URL 配置中心（唯一来源）
src/api/*.js           → 纯 HTTP 调用，无 Vue 依赖
src/composables/*.js   → 业务逻辑、状态管理、表单验证
src/views/*.vue        → 仅 UI 渲染与事件绑定
```

**分层职责边界：**

- **API 层**：fetch 调用、URL 构建、响应解析、Token 注入、返回 `{ success, data, message }`
- **Composable 层**：调用 API 层、管理 ref/reactive 状态、封装验证规则、处理业务分支
- **视图层**：只写 `<template>` + `<style>`，`<script setup>` 中仅导入 composable 并解构使用

### 3.2 文件命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 视图文件 | PascalCase | `WorkDetail.vue`, `HomePage.vue` |
| 组件文件 | PascalCase | `NavBar.vue`, `Waterfall.vue` |
| Composable | `use` + PascalCase | `useWorkDetail.js`, `useAuth.js` |
| API 模块 | 小驼峰 + `Api` 后缀 | `workApi.js`, `profileApi.js` |
| CSS 文件 | camelCase | `mainIndex.css`, `workDetail.css` |
| 子模块目录 | camelCase | `loginView/` |

### 3.3 Vue 组件结构规范

```vue
<template>
  <!-- 模板放在最前 -->
</template>

<script setup>
// 1. 导入（Vue API → 第三方库 → 项目模块）
import { ref, computed, onMounted } from 'vue'
import gsap from 'gsap'
import { useWorkDetail } from '@/composables/useWorkDetail'

// 2. Props / Emits
const props = defineProps({ ... })
const emit = defineEmits([...])

// 3. Composables 解构
const { data, loading, handleAction } = useWorkDetail()

// 4. 本地状态
const localState = ref(null)

// 5. 计算属性
const derived = computed(() => ...)

// 6. 方法
const myMethod = () => { ... }

// 7. 生命周期
onMounted(() => { ... })
</script>

<style scoped>
/* 所有样式使用 scoped */
</style>
```

### 3.4 CSS 架构

**文件组织：**

- 每个页面一个独立 CSS 文件，放在 `src/assets/CSS/`
- 全局字体定义：`src/assets/FONTS/font.css`
- 组件内样式使用 `<style scoped>`

**CSS 命名约定：**

```css
/* 全站使用短横线命名（kebab-case），配合 BEM 风格 */
.wd-container        /* 页面命名空间-区块 */
.wd-comment-item     /* 页面命名空间-组件 */
.wd-comment-item:hover
.vw-card             /* 组件命名空间-元素 */
.vw-card-skeleton    /* 组件命名空间-变体 */
.filter-hidden       /* 状态修饰符 */
```

**页面命名空间前缀：**

| 页面 | 前缀 |
|------|------|
| mainIndex | `n1_`, `n2_`, `n3_` ... `n7_` |
| loginView | `lfz_`, `xzone_` |
| WorkDetail | `wd-` |
| Profile | `profile-` |
| NavBar | 直接使用语义化名称 |
| VerticalWaterfall | `vw-` |
| SeriesGrid | `sg-` |

**响应式断点：**

```css
@media (max-width: 1400px) { ... }   /* 大屏优化 */
@media (max-width: 1024px) { ... }   /* 平板 */
@media (max-width: 768px)  { ... }   /* 小平板 */
@media (max-width: 640px)  { ... }   /* 手机 */
@media (max-width: 480px)  { ... }   /* 小手机 */
```

**常用 CSS 模式：**

```css
/* hover 浮起效果 */
transition: all 0.25s ease;
&:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.08);
}

/* 文本截断 */
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;

/* 多行文本截断 */
display: -webkit-box;
-webkit-line-clamp: 2;
-webkit-box-orient: vertical;
overflow: hidden;

/* 隐藏滚动条 */
scrollbar-width: none;              /* Firefox */
-ms-overflow-style: none;           /* IE/Edge */
&::-webkit-scrollbar { display: none; }  /* Chrome/Safari */

/* 弹性布局占满空间 */
flex: 1;
min-width: 0;                      /* 允许子元素截断 */
```

### 3.5 JavaScript 规范

**响应式声明：**

```javascript
// 对象/复杂状态 → reactive()
const buttonState = reactive({ text: "提交", disabled: false })

// 基础类型/DOM引用 → ref()
const isLoading = ref(false)
const galleryRef = ref(null)
```

**API 调用模板：**

```javascript
// src/api/xxxApi.js
import { WORK_API } from '../config/api'

export const fetchSomething = async (id) => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`${WORK_API.DETAIL}/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    const result = await response.json()
    console.log('接口响应:', JSON.stringify(result, null, 2))

    const statusCode = result.code || result.recode  // 兼容两种字段名
    if (statusCode === 200 && result.data) {
      console.log('✅ 操作成功')
      return { success: true, data: result.data }
    } else {
      console.error('❌ 操作失败:', result.message)
      return { success: false, message: result.message || '操作失败' }
    }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}
```

**格式要点：**
- 统一 `try-catch` 包裹
- 兼容 `result.code` 和 `result.recode`
- 返回 `{ success, data, message }` 标准格式
- 关键节点打印 `console.log`
- 成功用 `✅`，失败用 `❌`

**Composable 模板：**

```javascript
// src/composables/useXxx.js
import { ref, computed, onMounted, onUnmounted } from 'vue'

export const useXxx = () => {
  // 状态
  const data = ref(null)
  const loading = ref(false)

  // 方法
  const load = async () => { ... }
  const reset = () => { ... }

  // 生命周期
  let timer = null
  onMounted(() => { ... })
  onUnmounted(() => { if (timer) clearInterval(timer) })

  // 返回
  return { data, loading, load, reset }
}
```

**日志规范：**

```javascript
console.log('普通的调试信息')
console.log('✅ 成功:', variable)
console.error('❌ 错误:', message)
console.warn('⚠️ 警告:', message)
// 关键数据使用 JSON.stringify(result, null, 2) 打印
```

---

## 4. GSAP 动画规范

### 4.1 核心原则

- **仅动画 `transform` (x/y/scale/rotation) 和 `opacity`**
- 严禁动画 `width`、`height`、`top`、`left`、`margin`、`padding`
- ScrollTrigger 实例必须在 `onUnmounted` 中 `kill()`

### 4.2 常用缓动

```javascript
ease: "power2.out"       // 自然流畅（默认首选）
ease: "expo.out"         // 快速停止
ease: "back.out(1.7)"    // 弹性效果
ease: "power2.inOut"     // 对称缓动
```

### 4.3 时长参考

```javascript
duration: 0.3 ~ 0.6      // 常规过渡
duration: 0.6 ~ 1.0      // 强调动画
duration: 1.2 ~ 2.0      // 大型入场动画
```

### 4.4 在 Vue 中使用（标准模板）

```javascript
import { onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const containerRef = ref(null)
let ctx = null

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)

  ctx = gsap.context(() => {
    // 所有动画在此定义
    gsap.from(".my-element", {
      y: 60,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".my-element",
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    })
  }, containerRef.value)
})

onUnmounted(() => {
  if (ctx) ctx.revert()  // 自动 kill 所有 ScrollTrigger
})
```

**关键规则：**
- 始终使用 `gsap.context()` 并传入组件容器 ref
- `onUnmounted` 中调用 `ctx.revert()`
- 首次加载时延时初始化动画（`setTimeout` 300~900ms）以避免 ScrollTrigger 位置计算偏差

### 4.5 CSS 动画预备

```css
/* GSAP 动画元素初始状态 */
opacity: 0;
transform: translateY(30px);
will-change: transform, opacity;   /* 提示浏览器优化 */
```

---

## 5. API 联调规范

### 5.1 API 配置（src/config/api.js）

所有接口地址必须在 `src/config/api.js` 中集中定义，按模块分类导出。组件和 composable 中**禁止硬编码 URL**。

```javascript
// 新增 API 时：
export const NEW_MODULE_API = {
  LIST: `${API_BASE_URL}/api/new-module/list`,
  DETAIL: (id) => `${API_BASE_URL}/api/new-module/${id}`,
}
```

### 5.2 Token 管理

```javascript
// 存储
localStorage.setItem('token', token)
localStorage.setItem('userInfo', JSON.stringify(userInfo))

// 使用
const token = localStorage.getItem('token')
headers: { 'Authorization': `Bearer ${token}` }

// 清除
localStorage.removeItem('token')
localStorage.removeItem('userInfo')
```

### 5.3 请求格式选择

| 场景 | Content-Type |
|------|-------------|
| 登录/注册/表单提交 | `application/x-www-form-urlencoded` |
| JSON 数据 | `application/json` |
| 文件上传 | `multipart/form-data`（无需显式设置） |
| GET 请求 | 无需 Content-Type |

---

## 6. 组件与 UI 模式速查

### 6.1 按钮模式

```javascript
// 标准按钮状态
const buttonState = reactive({
  text: "提交",
  disabled: false,
})

// 倒计时按钮状态
const vCodeButtonState = reactive({
  text: "获取验证码",
  disabled: false,
  countdown: 0,
})

// 模板
<button :disabled="buttonState.disabled" @click="handleClick">
  {{ buttonState.text }}
</button>
```

### 6.2 加载状态三态模式

每个数据组件都实现三种状态：
1. **加载中**：骨架屏 (skeleton) 或 Spinner
2. **空数据**：居中提示文字
3. **正常数据**：真实内容展示

```vue
<!-- 骨架屏 -->
<div v-if="images.length === 0 && !initialLoadingDone" class="skeleton-grid">...</div>
<!-- 空状态 -->
<div v-else-if="images.length === 0 && initialLoadingDone" class="empty-state">暂无数据</div>
<!-- 真实内容 -->
<div v-else class="real-grid">...</div>
```

### 6.3 骨架屏动画

```css
.skeleton {
  background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s infinite ease-in-out;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 6.4 无限滚动（IntersectionObserver 模式）

```javascript
// 在组件中设置哨兵元素
const sentinelRef = ref(null)
let observer = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore.value && !isLoading.value) {
        emit('load-more')
      }
    },
    { root: null, rootMargin: '300px', threshold: 0 }
  )
  nextTick(() => { if (sentinelRef.value) observer.observe(sentinelRef.value) })
})

onUnmounted(() => { if (observer) observer.disconnect() })
```

### 6.5 通知 Toast

```javascript
import { showSuccess, showError, showInfo, showWarning } from '@/utils/notification'

showSuccess('操作成功')            // 绿色
showError('操作失败', '错误标题')   // 红色
showInfo('提示信息')               // 蓝色
showWarning('警告信息')            // 黄色
```

### 6.6 确认对话框

```javascript
import { showConfirm } from '@/utils/confirmDialog'

const ok = await showConfirm({
  title: '确认操作',
  message: '确定要执行此操作吗？',
  yesText: '确定',
  noText: '取消',
  type: 'danger',         // 'danger' | 'info' | 'warning'
})
if (!ok) return
```

---

## 7. 新增页面/组件检查清单

- [ ] 新 API 地址是否在 `src/config/api.js` 中定义？
- [ ] API 调用是否在 `src/api/` 下新建模块文件？
- [ ] 业务逻辑是否封装在 `src/composables/` 中？
- [ ] 视图层是否只写模板 + 样式 + 导入/解构 composable？
- [ ] 色彩是否全部来自现有品牌色体系？
- [ ] 是否避免了视觉禁忌（大面积渐变、emoji 图标、左侧彩条卡片、Lorem Ipsum、无功能装饰图标）？
- [ ] GSAP 动画是否仅使用 `transform` / `opacity`？
- [ ] ScrollTrigger 是否在 `onUnmounted` 中正确清理（`ctx.revert()`）？
- [ ] 是否使用 `gsap.context()` 限定作用域？
- [ ] 按钮状态是否使用 `reactive()`（而非直接 DOM 操作）？
- [ ] 定时器是否在 `onUnmounted` 中清除？
- [ ] 是否实现了加载中/空数据/正常数据三态？
- [ ] CSS 类名是否使用 kebab-case？是否加了页面命名空间前缀？
- [ ] 是否使用了 `fetch`（而非 axios）？
- [ ] 响应是否兼容 `code` 和 `recode` 两个字段？
- [ ] 响应式断点是否覆盖了 ≤640px、≤768px、≤1024px？
- [ ] 用户输入是否进行了 URL 编码？

---

## 8. 快速代码片段参考

### 新增 API 模块

```javascript
// src/api/newModuleApi.js
import { API_BASE_URL } from '../config/api'

export const fetchNewData = async (params) => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/api/new-endpoint`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
    const result = await response.json()
    const statusCode = result.code || result.recode
    if (statusCode === 200) {
      return { success: true, data: result.data }
    }
    return { success: false, message: result.message || '请求失败' }
  } catch (error) {
    console.error('请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}
```

### 新增 Composable

```javascript
// src/composables/useNewFeature.js
import { ref, onMounted, onUnmounted } from 'vue'
import { fetchNewData } from '@/api/newModuleApi'

export const useNewFeature = () => {
  const data = ref([])
  const loading = ref(false)
  let timer = null

  const load = async () => {
    loading.value = true
    const result = await fetchNewData()
    if (result.success) data.value = result.data
    loading.value = false
  }

  onMounted(() => { load() })
  onUnmounted(() => { if (timer) clearInterval(timer) })

  return { data, loading, load }
}
```

### 新增视图页面

```vue
<!-- src/views/NewPage.vue -->
<template>
  <div class="np-container">
    <div v-if="loading" class="np-skeleton">加载中...</div>
    <div v-else-if="data.length === 0" class="np-empty">暂无数据</div>
    <div v-else class="np-grid">
      <div v-for="item in data" :key="item.id" class="np-card">
        {{ item.title }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useNewFeature } from '@/composables/useNewFeature'
const { data, loading } = useNewFeature()
</script>

<style scoped>
.np-container { width: 100%; min-height: 100vh; background: #000; padding: 100px 5%; }
</style>
```

---

> **最后更新**: 2026-05-29  
> **维护者**: 前端开发团队
