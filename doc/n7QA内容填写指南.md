# n7QA 问答区内容填写指南

## 概述

`n7QA` 是首页（mainIndex）中的一个 Q&A 问答展示区域，包含两部分：
- **核心问答区**：直接展示的 Q&A 对话（2 条精选问答）
- **Also Asked 折叠区**：可展开/折叠的常见问题列表（多条 FAQ）

## 数据位置

所有数据在以下文件中定义：

```
src/composables/mainIndex.js
```

两个数据源：

| 数据变量 | 用途 | 当前位置 |
|----------|------|----------|
| `mockNum7zQA` | 核心问答区（直接展示） | 约第 1315 行 |
| `mockNum7zFAQ` | Also Asked 折叠区（可展开） | 约第 1320 行 |

页面模板在：

```
src/views/mainIndex.vue   → 第 438 行 <div class="n7QA">
```

样式在：

```
src/assets/CSS/mainIndex.css  → 第 1062 行 .n7QA
```

---

## 一、核心问答区 — mockNum7zQA

### 数据结构

```javascript
const mockNum7zQA = [
  {
    id: 1,                    // 唯一编号（数字）
    question: '这里是问题文本',   // 必填：问题内容
    answer: '这里是回答文本',     // 必填：回答内容
    answer2: '可选的第二段回答',  // 可选：第二段回答（不填则不渲染）
  },
  // ... 更多条目
]
```

### 当前示例

```javascript
const mockNum7zQA = [
  {
    id: 1,
    question: '我不太清楚什么是像素视觉?',
    answer: '像素视觉是由第三维度面向热爱拍摄、乐于分享的群体而打造的一个图像分享的公开平台。',
  },
  {
    id: 2,
    question: '什么是像素视觉?',
    answer: '像素视觉是由第三维度面向热爱拍摄、乐于分享的群体而打造的一个图像分享的公开平台。',
    answer2: '像素视觉是由第三维度面向热爱拍摄、乐于分享的群体而打造的一个图像分享的公开平台。',
  },
]
```

### 添加/修改方法

1. 在 `mockNum7zQA` 数组中添加或修改对象
2. 确保 `id` 唯一
3. 至少提供 `question` 和 `answer`
4. 如需多段回答，添加 `answer2` 字段

### 渲染效果

- **问题**：左侧黑色药丸气泡（`.n7q`），带滚动入场动画
- **回答**：右侧浅色气泡（`.n7a`），带 AI 头像（`.n7a_avatar`）
- **第二段回答**：在第一段回答下方，样式相同但间距更小（`.n7a2`）

---

## 二、Also Asked 折叠区 — mockNum7zFAQ

### 数据结构

```javascript
const mockNum7zFAQ = [
  {
    id: 1,                    // 唯一编号（数字）
    question: '问题文本',       // 必填：问题内容
    answer: '回答文本',         // 必填：回答内容（仅单段，不支持 answer2）
  },
  // ... 更多条目
]
```

### 当前示例

```javascript
const mockNum7zFAQ = [
  { id: 1, question: '如何上传我的摄影作品?', answer: '注册并登录您的像素视觉账号后，点击个人中心的上传按钮...' },
  { id: 2, question: '支持哪些图片格式?',       answer: '目前平台支持 JPG、JPEG、PNG、WEBP、HEIC 等主流图片格式...' },
  { id: 3, question: '如何删除已发布的作品?',   answer: '在作品详情页或个人作品管理列表中，点击作品右上角的菜单按钮...' },
]
```

### 添加/修改方法

1. 在 `mockNum7zFAQ` 数组中添加或修改对象
2. 确保 `id` 唯一（注意与 `mockNum7zQA` 无冲突要求）
3. 必须提供 `question` 和 `answer`

### 交互行为

- **默认状态**：所有 FAQ 处于折叠状态，问题显示为描边样式（`.n7q_outline`）
- **点击问题**：展开回答区域，带 GSAP 动画（气泡缩放 + 头像弹出）
- **再次点击**：折叠收回，动画反向播放
- **FAQ 问题入场**：全部折叠时，每个问题进入视口会自动播放药丸展开 + 文字滑入动画

### ⚠️ 注意事项

- FAQ 区目前仅支持单段回答（无 `answer2` 字段）
- 折叠/展开状态通过 `expandedFAQs`（一个 Set）管理
- 动画由 `useNum7zAnimation(expandedFAQs)` composable 驱动

---

## 三、动画说明

### 核心 Q&A 动画（自动触发）

每个 Q&A 条目独立绑定 ScrollTrigger，进入视口时播放：

| 元素 | 动画效果 |
|------|----------|
| `.n7q`（问题气泡） | 宽度从 100px 展开至自然宽度 + 文字从左侧滑入 |
| `.n7a`（回答气泡） | 从右下角缩放弹出（scale: 0.35 → 1） |
| `.n7a_avatar`（AI 头像） | 从无到有弹入（scale: 0 → 1，back.out 缓动） |
| `.n7a2`（第二段回答） | 与第一段回答独立触发，相同动画效果 |

### FAQ 折叠动画（点击触发）

点击问题展开/折叠，通过 `toggleFAQ(id)` 函数驱动。
动画使用 GSAP Timeline，在 `mainIndex.js` 第 1329-1360 行。

### 清理机制

页面离开时，所有 ScrollTrigger 和 GSAP Timeline 会在 `cleanupNum7zAnimation()` 中统一清理，无需手动处理。

---

## 四、样式速查

| CSS 类名 | 用途 |
|----------|------|
| `.n7QA` | 问答区整体容器 |
| `.QAshowCopy` | 顶部标题区（"You ask, we answer."） |
| `.QAcont` | 单条 Q&A 容器，宽度 50%，底部间距 60px |
| `.n7q` | 问题气泡：黑色圆角药丸，左对齐，最大宽度 80% |
| `.n7a_row` | 回答行容器：右对齐，flex 布局 |
| `.n7a` | 回答气泡：浅色圆角，右对齐 |
| `.n7a2` | 第二段回答：同上，但 margin-top: 5px |
| `.n7a_avatar` | AI 头像：36px 圆形，黑色背景 |
| `.n7QA_also` | Also Asked 区域容器 |
| `.n7Also_header` | Also Asked 标题区 |
| `.n7Also_en` | Also Asked 标题文字（"Also asked"） |
| `.n7q_outline` | FAQ 折叠态：透明背景 + 黑色描边 |
| `.n7FAQ_a_wrap` | FAQ 回答展开包裹容器 |

---

## 五、文案填写规范建议

1. **问题长度**：建议控制在 30 字以内，确保气泡不超出 80% 宽度
2. **回答长度**：建议控制在 100 字以内，保持视觉平衡
3. **FAQ 数量**：建议 3-8 条，过多会影响页面滚动体验
4. **语言风格**：保持友好的对话口吻，与 "You ask, we answer." 基调一致
