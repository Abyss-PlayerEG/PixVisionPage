---
trigger: always_on
description: "前后端联调开发规范，涵盖API调用、数据管理、错误处理及代码组织标准"
---

# 前后端联调规范 (Frontend-Backend Integration Standards)

## 1. API 配置管理 (API Configuration)

### ✅ 必须遵守

**统一配置文件**
- 所有 API 地址必须在 `src/config/api.js` 中集中管理
- **禁止**在组件或 composable 中硬编码 API URL
- 使用常量导出，便于维护和切换环境

```javascript
// src/config/api.js - 正确示例
export const API_BASE_URL = 'http://172.18.8.66:9090';

export const AUTH_API = {
  LOGIN: `${API_BASE_URL}/api/user/auth/login`,
  REGISTER: `${API_BASE_URL}/api/user/auth/register`,
};

export const MAIL_API = {
  SEND_REGISTER_CODE: `${API_BASE_URL}/api/mail/send-register-code`,
};
```

```javascript
// ❌ 错误示例 - 禁止在组件中硬编码
const response = await fetch('http://172.18.8.66:9090/api/user/auth/login', {...});
```

### 📋 配置结构规范

```javascript
// 基础 URL
export const API_BASE_URL = 'http://172.18.8.66:9090';

// 按模块分类的 API
export const AUTH_API = { ... };      // 认证相关
export const MAIL_API = { ... };      // 邮件相关
export const PASSWORD_API = { ... };  // 密码管理
export const USER_API = { ... };      // 用户信息

// 工具函数
export const getAvatarUrl = (path) => { ... };
```

---

## 2. 代码分层架构 (Code Layering)

### ✅ 三层架构原则

**第一层：API 层 (`src/api/*.js`)**
- 职责：纯粹的 HTTP 请求和数据转换
- 特点：无 Vue 依赖、纯函数、可独立测试
- 包含：fetch 调用、URL 构建、响应解析、Token 管理

**第二层：Composable 层 (`src/composables/*.js`)**
- 职责：业务逻辑、表单验证、状态管理
- 特点：调用 API 层、管理 UI 状态、处理用户交互
- 包含：验证规则、按钮状态、倒计时、动画控制

**第三层：视图层 (`src/views/*.vue`)**
- 职责：UI 渲染、事件绑定
- 特点：只负责展示和触发 Composable 方法
- 包含：模板、样式、简单的事件处理

### 📁 文件组织结构

```
src/
├── config/
│   └── api.js                    # API 配置中心
├── api/
│   └── loginViewApi.js           # 登录相关 API 调用
├── composables/
│   └── loginView.js              # 登录页面业务逻辑
└── views/
    └── loginView.vue             # 登录页面 UI
```

### 🔧 职责分离示例

```javascript
// ✅ 正确：API 层 - src/api/loginViewApi.js
export const handleLogin = async (loginData) => {
  const formData = new URLSearchParams();
  formData.append('usernameOrEmail', loginData.usernameOrEmail);
  
  const response = await fetch(AUTH_API.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  });
  
  const result = await response.json();
  
  // 保存 Token
  if (result.data.token) {
    localStorage.setItem('token', result.data.token);
  }
  
  return { success: result.code === 200, data: result.data };
};

// ✅ 正确：Composable 层 - src/composables/loginView.js
const handleLogin = async () => {
  if (!validateAll()) return;  // 表单验证
  
  const result = await apiHandleLogin(loginForm);  // 调用 API 层
  
  if (result.success) {
    router.push('/');  // UI 跳转
  } else {
    alert(result.message);  // 用户提示
  }
};

// ✅ 正确：视图层 - src/views/loginView.vue
<button @click="handleLogin">登录</button>
```

---

## 3. HTTP 请求规范 (HTTP Request Standards)

### ✅ 必须使用 Fetch API

**禁止使用 axios 或其他 HTTP 库**，统一使用浏览器原生 fetch：

```javascript
// ✅ 正确示例
const response = await fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: formData,
});

const result = await response.json();
```

### 📋 请求格式规范

**表单提交（大多数场景）**
```javascript
const formData = new URLSearchParams();
formData.append('username', data.username);
formData.append('password', data.password);

const response = await fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: formData,
});
```

**JSON 提交（特殊场景）**
```javascript
const response = await fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});
```

**GET 请求带参数**
```javascript
const queryString = Object.keys(params)
  .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  .join('&');

const response = await fetch(`${API_URL}?${queryString}`, {
  method: 'POST',  // 注意：验证码接口使用 POST
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 🔒 URL 编码规范

**所有用户输入的参数必须进行 URL 编码**
```javascript
// ✅ 正确
params.append('username', encodeURIComponent(userInput));

// 或使用 URLSearchParams 自动编码
const params = new URLSearchParams();
params.append('username', userInput);  // 自动编码
```

---

## 4. 后端响应处理 (Response Handling)

### 📋 响应格式兼容

**后端可能返回 `code` 或 `recode` 字段，必须兼容处理**

```javascript
// ✅ 正确：兼容两种字段名
const statusCode = result.code || result.recode;

if (statusCode === 200) {
  // 成功处理
} else {
  // 失败处理
}
```

### 🔄 标准化返回格式

**API 层函数必须返回统一的格式**

```javascript
// ✅ 正确：标准化返回
export const handleLogin = async (data) => {
  try {
    const response = await fetch(...);
    const result = await response.json();
    
    if (result.code === 200) {
      return { 
        success: true, 
        data: result.data,
        message: result.message 
      };
    } else {
      return { 
        success: false, 
        message: result.message || '操作失败' 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      message: '网络错误，请稍后重试' 
    };
  }
};
```

### 📊 调试日志规范

**保留关键日志，方便联调排查**

```javascript
// ✅ 正确：关键节点添加日志
console.log('发送登录请求数据:', {
  usernameOrEmail: data.usernameOrEmail,
  password: '(已加密)',  // 不打印明文密码
});

console.log('登录接口响应:', JSON.stringify(result, null, 2));

if (result.code === 200) {
  console.log('✅ 登录成功');
} else {
  console.error('❌ 登录失败:', result.message);
}
```

---

## 5. 客户端数据存储 (Client-Side Storage)

### 🔑 Token 管理

**登录成功后必须保存 Token 和用户信息**

```javascript
// ✅ 正确：保存 Token 和用户信息
if (result.code === 200 && result.data) {
  // 保存 Token
  if (result.data.token) {
    localStorage.setItem('token', result.data.token);
  }
  
  // 保存用户信息（排除 token 字段）
  const userInfo = { ...result.data };
  delete userInfo.token;
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
}
```

### ⚠️ 注意事项

1. **Token 和用户信息分开存储**
   - `localStorage.setItem('token', token)`
   - `localStorage.setItem('userInfo', JSON.stringify(userInfo))`

2. **用户信息需要序列化**
   ```javascript
   localStorage.setItem('userInfo', JSON.stringify(userInfo));
   
   // 读取时解析
   const userInfo = JSON.parse(localStorage.getItem('userInfo'));
   ```

3. **退出登录时清除所有数据**
   ```javascript
   export const logout = () => {
     localStorage.removeItem('token');
     localStorage.removeItem('userInfo');
   };
   ```

4. **后端数据结构可能变化**
   - 用户信息可能在 `result.data` 中
   - 也可能在 `result.data.user` 中
   - **必须根据实际响应调整解析逻辑**

---

## 6. 表单验证规范 (Form Validation)

### ✅ 前后端验证一致性

**前端验证规则必须与后端保持一致**

```javascript
// ✅ 正确：与后端正则保持一致
const FIELD_RULES = {
  username: [
    { validator: (v) => !!v, message: "用户名不能为空" },
    { validator: (v) => /^[a-zA-Z0-9_]{5,16}$/.test(v), message: "5-16位, 只允许字母、数字和\"_\"" },
  ],
  password: [
    { validator: (v) => !!v, message: "密码不能为空" },
    { validator: (v) => /^[a-zA-Z0-9_.]{6,16}$/.test(v), message: "6-16位，只允许字母、数字、\"_\"、\".\"" },
  ],
  email: [
    { validator: (v) => !!v, message: "邮箱不能为空" },
    { validator: (v) => /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(v), message: "邮箱格式不正确" },
  ],
};
```

### 🔍 实时验证策略

**失焦时验证，提交前全量验证**

```javascript
// 失焦验证单个字段
<input @blur="validateField('username')" />

// 提交前验证所有字段
const handleSubmit = async () => {
  if (!validateAll()) {
    return;  // 验证失败，阻止提交
  }
  
  // 执行提交逻辑
};
```

### 📋 验证状态管理

**使用响应式对象管理验证状态**

```javascript
const fieldStates = reactive({
  username: { status: "idle", message: "" },
  password: { status: "idle", message: "" },
});

// 验证通过
fieldStates.username.status = "success";
fieldStates.username.message = "";

// 验证失败
fieldStates.username.status = "error";
fieldStates.username.message = "用户名格式不正确";
```

---

## 7. 验证码发送规范 (Verification Code)

### 🎯 通用封装模式

**三种验证码（注册、登录、忘记密码）使用统一的发送逻辑**

```javascript
// ✅ 正确：通用验证码发送函数
const sendVerificationCode = async (options) => {
  const { validateFn, fieldName, buttonState, needCountdown, countdownFn } = options;
  
  // 1. 验证字段
  if (validateFn && fieldName) {
    const isValid = validateFn(fieldName);
    if (!isValid) return;
  }
  
  // 2. 设置按钮状态
  buttonState.disabled = true;
  buttonState.text = "发送中";
  
  // 3. 发送请求
  const result = await apiSendCode(options.params);
  
  // 4. 处理结果
  if (result.success) {
    if (needCountdown && countdownFn) {
      countdownFn();  // 启动倒计时
    }
  } else {
    buttonState.disabled = false;
    buttonState.text = "获取验证码";
    alert(result.message);
  }
};
```

### ⏱️ 倒计时管理

**每个验证码按钮独立的倒计时状态**

```javascript
// 按钮状态
const vCodeButtonState = reactive({
  text: "获取验证码",
  disabled: false,
  countdown: 0,
});

// 倒计时函数
const startCountdown = () => {
  vCodeButtonState.countdown = 60;
  vCodeButtonState.text = "60s";
  
  countdownTimer = setInterval(() => {
    vCodeButtonState.countdown--;
    
    if (vCodeButtonState.countdown > 0) {
      vCodeButtonState.text = `${vCodeButtonState.countdown}s`;
    } else {
      clearInterval(countdownTimer);
      vCodeButtonState.disabled = false;
      vCodeButtonState.text = "获取验证码";
    }
  }, 1000);
};

// 清除倒计时
const clearCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  vCodeButtonState.disabled = false;
  vCodeButtonState.text = "获取验证码";
};
```

### 🚫 避免重复弹窗

**发送验证码成功后不要弹窗，保持"发送中"状态直到倒计时开始**

```javascript
// ✅ 正确：不显示成功提示
if (result.success) {
  countdownFn();  // 直接启动倒计时，不弹窗
}

// ❌ 错误：多余的弹窗
if (result.success) {
  alert("验证码已发送");  // 会打断用户体验
  countdownFn();
}
```

---

## 8. 按钮状态管理 (Button State Management)

### ✅ 使用响应式状态

**禁止直接操作 DOM，使用 Vue 响应式状态**

```javascript
// ✅ 正确：响应式状态
const registerButtonState = reactive({
  text: "注册",
  disabled: false,
});

// 在模板中绑定
<button :disabled="registerButtonState.disabled">
  {{ registerButtonState.text }}
</button>

// 更新状态
registerButtonState.disabled = true;
registerButtonState.text = "注册中...";
```

```javascript
// ❌ 错误：直接操作 DOM
const button = document.querySelector('.register-btn');
button.disabled = true;
button.textContent = "注册中...";
```

### 📋 常见按钮状态模式

**1. 普通按钮**
```javascript
const buttonState = reactive({
  text: "提交",
  disabled: false,
});
```

**2. 倒计时按钮**
```javascript
const vCodeButtonState = reactive({
  text: "获取验证码",
  disabled: false,
  countdown: 0,
});
```

**3. 进度提示按钮**
```javascript
const submitButtonState = reactive({
  text: "确定",
  disabled: false,
});

// 显示进度
let seconds = 3;
submitButtonState.text = `成功，${seconds}秒后跳转`;
submitButtonState.disabled = true;
```

---

## 9. 错误处理规范 (Error Handling)

### ✅ 三层错误处理

**1. API 层：捕获网络错误**
```javascript
export const handleLogin = async (data) => {
  try {
    const response = await fetch(...);
    const result = await response.json();
    
    if (result.code === 200) {
      return { success: true, data: result.data };
    } else {
      return { success: false, message: result.message };
    }
  } catch (error) {
    console.error('网络请求失败:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};
```

**2. Composable 层：处理业务错误**
```javascript
const handleLogin = async () => {
  if (!validateAll()) return;
  
  const result = await apiHandleLogin(loginForm);
  
  if (result.success) {
    router.push('/');
  } else {
    alert(result.message || '登录失败');  // 用户友好的提示
  }
};
```

**3. 视图层：显示错误信息**
```vue
<div class="input-area" :class="fieldStates.username.status">
  <input v-model="loginForm.username" />
  <span class="error-msg">{{ fieldStates.username.message }}</span>
</div>
```

### 📊 错误类型分类

| 错误类型 | 处理方式 | 示例 |
|---------|---------|------|
| 网络错误 | 提示"网络错误，请稍后重试" | fetch 抛出异常 |
| 业务错误 | 显示后端返回的错误信息 | 用户名已存在 |
| 验证错误 | 显示字段级别的验证提示 | 密码格式不正确 |

---

## 10. 注册成功后自动填充 (Auto-fill After Registration)

### ✅ 实现流程

**注册成功后自动切换到登录面板并填充用户名和密码**

```javascript
const handleRegister = async () => {
  if (!validateRegAll()) return;
  
  const result = await apiHandleRegister(regForm);
  
  if (result.success) {
    // 1. 保存注册的用户名和密码
    const registeredUsername = result.registeredUsername;
    const registeredPassword = result.registeredPassword;
    
    // 2. 清空注册表单
    for (const key in regForm) {
      regForm[key] = '';
    }
    
    // 3. ✅ 先填充登录表单
    loginForm.usernameOrEmail = registeredUsername;
    loginForm.password = registeredPassword;
    
    // 4. 显示倒计时
    let seconds = 3;
    registerButtonState.text = `注册成功，${seconds}秒后返回登录页面`;
    registerButtonState.disabled = true;
    
    // 5. 倒计时结束后切换面板
    registerCountdownTimer = setInterval(() => {
      seconds--;
      if (seconds <= 0) {
        clearInterval(registerCountdownTimer);
        
        hideFormPanel();  // 关闭注册面板
        
        setTimeout(() => {
          showLoginPanel();  // 打开登录面板（数据已预填充）
        }, 600);
      }
    }, 1000);
  }
};
```

### 🎯 关键点

1. **先填充数据，再切换面板**
   - 在关闭注册面板前就填充登录表单
   - 确保切换后数据已经准备好

2. **等待动画完成**
   - 使用 `setTimeout` 等待 `hideFormPanel` 动画完成
   - 通常 600ms 足够

3. **检查面板状态**
   ```javascript
   if (!isLoginPanelOpen.value) {
     showLoginPanel();
   }
   ```

---

## 11. 调试技巧 (Debugging Tips)

### 🔍 控制台日志

**关键节点添加日志**

```javascript
// 1. 请求前
console.log('发送请求数据:', {
  username: data.username,
  password: '(已加密)',
});

// 2. 响应后
console.log('接口响应:', JSON.stringify(result, null, 2));

// 3. 成功后
console.log('✅ 操作成功');
console.log('Token 已保存:', token);
console.log('用户信息已保存:', userInfo);

// 4. 失败后
console.error('❌ 操作失败:', result.message);
console.error('网络请求失败:', error);
```

### 💾 localStorage 检查

**在浏览器控制台检查存储的数据**

```javascript
// 查看 Token
localStorage.getItem('token')

// 查看用户信息
JSON.parse(localStorage.getItem('userInfo'))

// 清除所有数据
localStorage.clear()
```

### 🌐 网络请求监控

**使用浏览器 DevTools Network 面板**

1. 打开 DevTools → Network 标签
2. 筛选 XHR/Fetch 请求
3. 查看请求详情：
   - Request Payload（请求参数）
   - Response（响应数据）
   - Status Code（状态码）
   - Timing（耗时）

---

## 12. 注意事项 (Important Notes)

### ⚠️ 常见陷阱

1. **Token 保存位置**
   - ✅ 保存在客户端 localStorage
   - ❌ 不要保存在 sessionStorage（刷新会丢失）

2. **用户信息结构**
   - 后端可能直接在 `result.data` 返回用户信息
   - 也可能嵌套在 `result.data.user` 中
   - **必须根据实际响应调整解析逻辑**

3. **验证码大小写**
   - 发送前统一转为大写：`vCode.toUpperCase()`
   - 后端通常不区分大小写，但前端要统一

4. **URL 编码**
   - 所有用户输入的参数必须编码
   - 使用 `encodeURIComponent()` 或 `URLSearchParams`

5. **响应字段兼容**
   - 同时检查 `result.code` 和 `result.recode`
   - 不同接口可能使用不同的字段名

6. **倒计时清理**
   - 组件卸载时必须清除定时器
   - 避免内存泄漏

7. **按钮状态恢复**
   - 请求失败后要恢复按钮状态
   - 避免按钮一直处于禁用状态

8. **表单清空时机**
   - 注册成功后清空注册表单
   - 但要保留用户名和密码用于自动填充登录

9. **动画时序**
   - 面板切换时要等待动画完成
   - 使用 `setTimeout` 或 `onComplete` 回调

10. **错误提示友好性**
    - 给用户清晰的错误提示
    - 避免技术术语，使用用户能理解的语言

---

## 13. 最佳实践总结 (Best Practices)

### ✅ 核心原则

1. **职责分离**：API 层、Composable 层、视图层各司其职
2. **统一管理**：API 地址集中在配置文件
3. **标准化返回**：所有 API 函数返回 `{ success, data, message }`
4. **响应式状态**：使用 Vue reactive/ref 管理状态
5. **完整日志**：关键节点添加调试日志
6. **容错处理**：兼容后端可能的字段变化
7. **用户友好**：清晰的错误提示和加载状态
8. **代码复用**：通用逻辑封装成函数

### 📋 代码审查清单

在提交联调代码前，检查：

- [ ] API 地址是否在配置文件中定义？
- [ ] 是否使用了 fetch 而非 axios？
- [ ] 是否正确处理了 `code` 和 `recode`？
- [ ] Token 和用户信息是否正确保存？
- [ ] 是否有完整的错误处理？
- [ ] 按钮状态是否使用响应式？
- [ ] 倒计时是否正确清理？
- [ ] 是否有必要的调试日志？
- [ ] 表单验证是否与后端一致？
- [ ] 用户输入是否进行了 URL 编码？

---

## 14. 快速参考 (Quick Reference)

### 📝 API 调用模板

```javascript
export const apiFunction = async (data) => {
  try {
    const formData = new URLSearchParams();
    formData.append('field', data.field);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });
    
    const result = await response.json();
    
    if (result.code === 200 || result.recode === 200) {
      return { success: true, data: result.data };
    } else {
      return { success: false, message: result.message };
    }
  } catch (error) {
    console.error('请求失败:', error);
    return { success: false, message: '网络错误，请稍后重试' };
  }
};
```

### 📝 Composable 调用模板

```javascript
const handleSubmit = async () => {
  if (!validateAll()) return;
  
  const result = await apiFunction(formData);
  
  if (result.success) {
    // 成功处理
    router.push('/');
  } else {
    // 失败处理
    alert(result.message);
  }
};
```

### 📝 按钮状态模板

```javascript
const buttonState = reactive({
  text: "提交",
  disabled: false,
});

// 使用中
buttonState.disabled = true;
buttonState.text = "处理中...";

// 恢复
buttonState.disabled = false;
buttonState.text = "提交";
```

### 📝 倒计时模板

```javascript
let timer = null;

const startCountdown = () => {
  buttonState.disabled = true;
  buttonState.text = "60s";
  
  timer = setInterval(() => {
    seconds--;
    if (seconds > 0) {
      buttonState.text = `${seconds}s`;
    } else {
      clearInterval(timer);
      buttonState.disabled = false;
      buttonState.text = "获取验证码";
    }
  }, 1000);
};

const clearCountdown = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};
```
