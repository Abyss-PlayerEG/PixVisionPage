# Composables 模块说明

本目录包含 Vue 3 Composition API 的组合式函数（Composables），用于封装可复用的业务逻辑和状态管理。

## 📁 目录结构

```
src/composables/
├── [模块名]/                    # 功能模块目录（子模块）
│   ├── use[Feature1].js        # 功能模块1
│   ├── use[Feature2].js        # 功能模块2
│   └── use[Feature3].js        # 功能模块3
├── [模块名].js                  # 模块主入口（整合所有子模块）
└── mainIndex.js                 # 主页功能模块
```

---

## 🎯 设计理念

### 模块化架构

采用**按功能拆分**的模块化设计，将大型 Composable 拆分为多个职责单一的小模块：

- **高内聚低耦合**：每个模块专注于一个功能领域
- **易于维护**：修改某个功能只需关注对应模块
- **便于测试**：可以独立测试每个模块
- **按需导入**：未来可以支持 tree-shaking 优化打包体积

### 三层架构原则

遵循项目的三层架构规范：

1. **API 层** (`src/api/`) - 纯 HTTP 请求和数据转换
2. **Composable 层** (`src/composables/`) - 业务逻辑、状态管理、UI 交互
3. **视图层** (`src/views/`) - UI 渲染和事件绑定

---

## 📦 模块详解

> 💡 **提示**：以下是各模块的详细说明，新模块请参考此格式编写文档。

### 模块文档模板

当你创建新模块时，请按照以下模板编写文档：

#### [模块名称] - [简短描述]

**位置**: `src/composables/[模块路径]`

**职责**: [一句话说明模块的主要职责]

**依赖**: [列出依赖的其他模块，如无则写"无"]

**主要功能**:
- [功能点1]
- [功能点2]
- [功能点3]

**导出的内容**:
```javascript
{
  // 状态
  state1,
  state2,
  
  // 方法
  method1,
  method2,
}
```

**使用示例**:
```javascript
import { use[ModuleName] } from '@/composables/[modulePath]';

const { method1, state1 } = use[ModuleName]();
```

**技术要点**:
- [技术点1]
- [技术点2]

---

### 现有模块文档

#### loginView - 登录页面模块

##### 主入口：loginView.js

**位置**: `src/composables/loginView.js`

**职责**: 整合登录页面的所有功能模块，提供统一的接口给视图层使用。

**使用方式**:
```javascript
import { useLoginView } from '@/composables/loginView';

const {
  // 动画相关
  showLoginPanel,
  showRegisterPanel,
  hideFormPanel,
  
  // 表单数据
  loginForm,
  regForm,
  forgotPasswordForm,
  
  // 验证相关
  validateField,
  validateRegField,
  validateForgotPasswordField,
  
  // 验证码相关
  sendLoginCode,
  sendRegisterCode,
  sendForgotPasswordCode,
  
  // 业务逻辑
  handleLogin,
  handleRegister,
  handleForgotPasswordSubmit,
} = useLoginView();
```

---

##### 子模块

###### useLoginAnimations.js - 动画管理模块

**位置**: `src/composables/loginView/useLoginAnimations.js`

**职责**: 管理所有 GSAP 动画的初始化、播放和控制。

**主要功能**:
- 登录面板显示/隐藏动画
- 注册面板显示动画
- 忘记密码面板切换动画
- DOM 元素引用管理

**导出的内容**:
```javascript
{
  // DOM 引用
  bgimg, lfzTitle, title1, title2, loginFormZone,
  
  // 状态
  activePanel, isLoginPanelOpen,
  
  // 动画控制函数
  showPasswordPanel,      // 忘记密码01显示/隐藏
  showPasswordPanel2,     // 忘记密码02步骤切换
  showLoginPanel,         // 显示登录面板
  showRegisterPanel,      // 显示注册面板
  hideFormPanel,          // 隐藏表单面板
}
```

**技术要点**:
- 使用 `onMounted` 初始化 GSAP 时间轴
- 所有时间轴设置为 `paused: true`，手动控制播放
- 动画完成后自动清理状态

---

###### useFormValidation.js - 表单验证模块

**位置**: `src/composables/loginView/useFormValidation.js`

**职责**: 管理所有表单的验证规则、验证逻辑和字段状态。

**主要功能**:
- 登录表单验证（用户名/邮箱、密码、验证码）
- 注册表单验证（昵称、用户名、密码、确认密码、邮箱、验证码）
- 忘记密码表单验证（用户名/邮箱、新密码、确认密码、验证码）
- 实时验证状态管理（idle/success/error）

**导出的内容**:
```javascript
{
  // 表单数据（reactive）
  loginForm, regForm, forgotPasswordForm,
  
  // 字段状态（reactive）
  fieldStates, regFieldStates, forgotPasswordFieldStates,
  
  // 登录验证
  validateField, validateAll, setFieldError, clearFieldState,
  
  // 注册验证
  validateRegField, validateRegAll, setRegFieldError, clearRegFieldState,
  
  // 忘记密码验证
  validateForgotPasswordField, validateForgotPasswordAll,
  setForgotPasswordFieldError, clearForgotPasswordFieldState,
}
```

**验证规则示例**:
```javascript
// 用户名/邮箱验证
{
  validator: (v) => /^[a-zA-Z0-9_]{5,16}$/.test(v) || 
                   /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(v),
  message: "用户名或邮箱不正确"
}

// 密码验证
{
  validator: (v) => /^[a-zA-Z0-9_.]{6,16}$/.test(v),
  message: "6-16位，只允许字母、数字、\"_\"、\".\""
}
```

---

###### useVerificationCode.js - 验证码与倒计时模块

**位置**: `src/composables/loginView/useVerificationCode.js`

**职责**: 管理所有场景的验证码发送和倒计时逻辑。

**依赖**: 需要传入 `validationModule` 参数以访问表单数据和验证函数

**主要功能**:
- 注册验证码发送 + 60秒倒计时
- 登录验证码发送 + 60秒倒计时
- 忘记密码验证码发送 + 60秒倒计时
- 统一的错误处理和按钮状态管理

**导出的内容**:
```javascript
{
  // 按钮状态（reactive）
  vCodeButtonState,              // 注册验证码按钮
  loginVCodeButtonState,         // 登录验证码按钮
  forgotPasswordVCodeButtonState,// 忘记密码验证码按钮
  
  // 验证码发送
  sendRegisterCode,
  sendLoginCode,
  sendForgotPasswordCode,
  handleGetVerificationCode,     // 统一入口
  
  // 倒计时管理
  startCountdown, clearCountdown,
  startLoginCountdown, clearLoginCountdown,
  startForgotPasswordCountdown, clearForgotPasswordCountdown,
}
```

**按钮状态结构**:
```javascript
{
  text: "获取验证码",  // 或 "60s"、"发送中"
  disabled: false,
  countdown: 0,        // 仅注册和忘记密码有
}
```

**使用示例**:
```javascript
// 视图层调用
<button @click="sendLoginCode" :disabled="loginVCodeButtonState.disabled">
  {{ loginVCodeButtonState.text }}
</button>
```

---

###### useLoginBusiness.js - 核心业务逻辑模块

**位置**: `src/composables/loginView/useLoginBusiness.js`

**职责**: 处理登录、注册、忘记密码的核心业务流程。

**主要功能**:
- 登录流程：验证 → API调用 → 成功倒计时 → 跳转
- 注册流程：验证 → API调用 → 清空表单 → 填充登录信息 → 倒计时 → 切换面板
- 忘记密码流程：验证 → API调用 → 清空表单 → 倒计时 → 返回登录
- 通用成功倒计时函数

**导出的内容**:
```javascript
{
  // 按钮状态（reactive）
  loginButtonState,
  registerButtonState,
  forgotPasswordSubmitButtonState,
  
  // 业务逻辑函数
  handleLogin,
  handleRegister,
  handleForgotPasswordSubmit,
  handleForgotPasswordFinalSubmit,
  handleSuccessCountdown,  // 通用倒计时工具
}
```

**成功倒计时示例**:
```javascript
handleSuccessCountdown({
  buttonState: loginButtonState,
  successMessage: '登录成功，${seconds}秒后跳转',
  duration: 3,
  onComplete: () => {
    router.push('/');
  },
  setTimer: (timer) => { loginSuccessCountdownTimer = timer; },
  clearTimer: () => { loginSuccessCountdownTimer = null; }
});
```

---

#### mainIndex - 主页模块

**位置**: `src/composables/mainIndex.js`

**职责**: 主页相关的业务逻辑和状态管理。

*(待补充详细文档)*

---

## 🔧 开发指南

### 添加新功能模块

1. **在对应目录下创建新文件**
   ```javascript
   // src/composables/[模块名]/useNewFeature.js
   export const useNewFeature = () => {
     // 你的逻辑
     return {
       // 导出的内容
     };
   };
   ```

2. **在主入口文件中导入并整合**
   ```javascript
   // src/composables/[模块名].js
   import { useNewFeature } from './[模块名]/useNewFeature';
   
   export const use[ModuleName] = () => {
     const newFeature = useNewFeature();
     
     return {
       ...newFeature,
       // ...其他模块
     };
   };
   ```

3. **在视图层使用**
   ```vue
   <script setup>
   import { use[ModuleName] } from '@/composables/[模块名]';
   
   const { newFeatureFunction } = use[ModuleName]();
   </script>
   ```

### 模块间通信

模块之间通过**参数传递**进行通信，避免循环依赖：

```javascript
// 模块A接收模块B作为参数
export const useModuleA = (moduleB) => {
  // 使用 moduleB.method()
  // 使用 moduleB.state
};

// 主入口文件中的初始化顺序
const moduleB = useModuleB();  // 先初始化被依赖的模块
const moduleA = useModuleA(moduleB);  // 再初始化依赖其他模块的
```

### 动态导入 API

为避免循环依赖，在业务模块中使用动态导入：

```javascript
const handleAction = async () => {
  const { apiFunction } = await import('../../api/[apiModule]');
  const result = await apiFunction(params);
  // ...
};
```

---

## 📝 命名规范

### 文件命名
- 使用 `use` 前缀 + 功能名称（PascalCase）
- 示例：`useLoginAnimations.js`、`useFormValidation.js`

### 函数命名
- 动词开头，清晰表达功能
- 示例：`showLoginPanel`、`validateField`、`handleLogin`

### 状态命名
- 响应式状态使用 `ref` 或 `reactive`
- 按钮状态统一以 `State` 结尾
- 示例：`loginButtonState`、`isLoginPanelOpen`

---

## ⚠️ 注意事项

### 1. 避免循环依赖
- ❌ 不要在模块 A 中直接导入模块 B，同时模块 B 也导入模块 A
- ✅ 通过主入口文件整合，或通过参数传递依赖

### 2. 定时器清理
- 所有 `setInterval` 必须在适当时机清除
- 在组件卸载时清理定时器（可在主入口添加 `onUnmounted`）

### 3. 响应式状态
- 使用 `reactive` 管理对象状态
- 使用 `ref` 管理基本类型或 DOM 引用
- 导出时保持响应性，不要解构破坏响应式

### 4. GSAP 动画
- 所有时间轴在 `onMounted` 中初始化
- 设置 `paused: true`，手动控制播放
- 动画完成后注意清理状态

### 5. 错误处理
- API 调用必须包含 try-catch
- 用户友好的错误提示（alert 或自定义弹窗）
- 控制台打印详细错误信息便于调试

---

## 🚀 最佳实践

### 1. 单一职责原则
每个模块只负责一个功能领域，例如：
- `useLoginAnimations` 只管动画
- `useFormValidation` 只管验证
- `useVerificationCode` 只管验证码

### 2. 代码复用
相似逻辑封装为通用函数：
- `handleSuccessCountdown` - 通用倒计时
- `sendVerificationCode` - 通用验证码发送
- 提取通用验证规则到 `COMMON_RULES`

### 3. 注释规范
- 禁止使用 emoji 注释
- 使用清晰的中文注释说明功能
- JSDoc 格式标注函数参数和返回值

### 4. 日志输出
- 成功操作：`console.log('[SUCCESS] xxx')`
- 错误操作：`console.error('[ERROR] xxx')`
- 调试信息：`console.log('xxx')`

---

## 📚 相关文档

- [Vue 3 Composition API](https://cn.vuejs.org/guide/extras/composition-api-faq.html)
- [GSAP 官方文档](https://gsap.com/docs/v3/)
- [项目联调规范](../../.lingma/rules/IntegrationRule.md)

---

## 🔄 更新日志

### 2026-04-29
- ✅ 完成 loginView 模块化重构
- ✅ 拆分为 4 个子模块
- ✅ 主入口文件整合所有模块
- ✅ 消除 1200+ 行单文件代码
- ✅ 提取通用验证规则，减少代码重复
- ✅ 创建通用 README 模板，方便后续模块扩展

---

**维护者**: 前端开发团队  
**最后更新**: 2026-04-29
