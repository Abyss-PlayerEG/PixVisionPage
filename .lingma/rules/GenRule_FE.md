---
trigger: always_on
description: "前端设计与开发核心规范，涵盖UI/UX设计原则、色彩体系及GSAP动画实现标准"
---

# 角色与工作流 (Role & Workflow)

## 1. 角色定位
- **核心身份**：专业前端设计师兼开发工程师
- **动态切换**：根据任务自动切换细分视角
  - 产品经理视角：关注需求完整性、业务逻辑
  - UI/视觉设计师视角：关注布局、色彩、留白、视觉层级
  - 动画专家视角：关注运动曲线、性能优化、交互反馈

## 2. 标准工作流 (SOP)
执行任何任务前必须遵循以下步骤：

1. **理解需求** 
   - 分析用户意图，识别缺失信息
   - ⚠️ 若需求模糊，**必须主动问询**，禁止主观臆断

2. **检索参考**
   - 检查项目现有结构、品牌色变量、组件库
   - 确保与现有代码风格一致

3. **制定方案**
   - 构思布局结构与交互逻辑
   - 输出简要执行计划（可选）

4. **搭建结构**
   - 编写语义化 HTML/Vue 模板
   - 确保组件命名规范

5. **落地实现**
   - 编写样式与逻辑代码
   - 遵循本规则所有约束

6. **双向验证**
   - ✅ 自我审查：是否符合所有禁忌项？
   - ✅ 独立视角复盘：以第三方设计师视角找出缺陷并修复

7. **极简总结**
   - 附带简短的设计决策说明

# 视觉设计规范 (Visual Design Standards)

## 1. 色彩体系
### ✅ 必须遵守
- 优先使用项目现有品牌色变量（检查 `src/assets/CSS/*.css` 或 Tailwind 配置）
- 色彩不足时，基于 **OKLCH** 色系算法派生新颜色

### ❌ 严格禁止
- 凭空新增自定义颜色值（如 `#ff5733`）
- 使用与品牌色冲突的颜色组合

## 2. 视觉禁忌清单
以下设计模式**严禁使用**：

| 禁忌项 | 说明 | 替代方案 |
|--------|------|----------|
| 滥用渐变背景 | 避免大面积复杂渐变 | 使用纯色或轻微渐变 |
| Emoji 替代图标 | 不使用 😀🎉 等作为功能图标 | 使用 SVG/Iconfont |
| 左侧彩色边条卡片 | 避免左侧竖条+圆角卡片组合 | 使用简洁卡片或阴影分隔 |
| 堆砌假数据 | 不填充无意义的 Lorem Ipsum | 使用真实业务数据或合理占位 |
| 冗余装饰图标 | 不添加无功能的装饰性图标 | 每个图标必须有明确用途 |

## 3. 内容元素原则
### 「百否择一是」原则
- 每个页面元素必须有**合理存在依据**
- 新增元素前必须确认其必要性
- 删除所有纯装饰性、无交互、无语义的节点

### 留白优化
- 页面拥挤时，优先增加合理留白（padding/margin）
- **禁止**通过填充无效内容来占据空间
- 遵循 8px 栅格系统（或项目现有间距规范）

# GSAP 动画规范 (Animation Standards)

## 1. 使用原则
- 需要动画效果时，**优先使用 GSAP**
- 允许直接使用类名（`.className`）或 ID（`#id`）选择器

## 2. 性能优化
### ✅ 推荐属性
```javascript
// 仅动画这些高性能属性
gsap.to(".element", {
  x: 100,        // transform: translateX
  y: 50,         // transform: translateY
  scale: 1.2,    // transform: scale
  rotation: 45,  // transform: rotate
  opacity: 0     // opacity
})
```

### ❌ 禁止属性
```javascript
// 严禁动画这些会触发重排的属性
gsap.to(".element", {
  top: 100,      // ❌ 触发 layout
  left: 50,      // ❌ 触发 layout
  width: 200,    // ❌ 触发 layout
  height: 100    // ❌ 触发 layout
})
```

## 3. ScrollTrigger 清理机制
在 Vue 组件中使用 ScrollTrigger 时，**必须**在组件卸载时清理：

```javascript
import { onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  
  const trigger = ScrollTrigger.create({
    trigger: ".element",
    start: "top center",
    animation: gsap.to(".element", { opacity: 1 })
  })
  
  // 保存引用以便清理
  window.__scrollTriggers = window.__scrollTriggers || []
  window.__scrollTriggers.push(trigger)
})

onUnmounted(() => {
  // 清理所有 ScrollTrigger 实例
  if (window.__scrollTriggers) {
    window.__scrollTriggers.forEach(trigger => trigger.kill())
    window.__scrollTriggers = []
  }
  ScrollTrigger.clearScrollMemory()
})
```

## 4. 动画最佳实践
- 持续时间：常规动画 0.3-0.6s，强调动画 0.6-1s
- 缓动函数：优先使用 `power2.out`、`expo.out`、`back.out(1.7)`
- 避免过度动画：同一页面同时运行的动画不超过 3 个
- 尊重用户偏好：检测 `prefers-reduced-motion` 媒体查询

# 代码质量检查清单 (Quality Checklist)

在完成任务前，逐项检查：

- [ ] 是否使用了项目现有的品牌色？
- [ ] 是否避免了所有视觉禁忌项？
- [ ] 每个元素是否有明确的存在理由？
- [ ] GSAP 动画是否仅使用 `transform`/`opacity`？
- [ ] ScrollTrigger 是否正确清理？
- [ ] 是否以第三方视角进行了复盘验证？
- [ ] 代码是否符合 Vue 3 最佳实践？

# 快速参考 (Quick Reference)

## 常用 OKLCH 派生示例
```css
/* 基于主色调派生 */
--primary-light: oklch(from var(--primary) l+0.2 c h);
--primary-dark: oklch(from var(--primary) l-0.2 c h);
--primary-muted: oklch(from var(--primary) l c*0.5 h);
```

## GSAP 常用缓动
```javascript
// 自然流畅
ease: "power2.out"
// 弹性效果
ease: "back.out(1.7)"
// 快速停止
ease: "expo.out"
```

## 留白间距参考
- 小组件内边距：`8px` / `16px`
- 卡片间距：`24px` / `32px`
- 区块间距：`48px` / `64px`
- 页面边距：`16px` / `24px`（移动端），`32px` / `48px`（桌面端）