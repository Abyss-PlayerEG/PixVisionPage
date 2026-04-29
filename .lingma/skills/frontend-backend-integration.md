# 前后端联调规范

## 概述

本 Skill 用于指导 Vue 3 项目与后端 API 的联调工作，包括接口调用、数据管理、错误处理等最佳实践。

## 技术栈

- **前端**: Vue 3 + Composition API + Vue Router
- **HTTP 请求**: 原生 Fetch API（不使用 axios）
- **状态管理**: localStorage + reactive/ref
- **样式**: SCSS + CSS

## 核心原则

### 1. API 配置集中管理

所有后端接口地址必须统一管理在配置文件中，禁止硬编码。

**配置文件位置**: `src/config/api.js`

```javascript
// API 基础配置
export const API_BASE_URL = 'http://localhost:9090';

// 接口分类管理
export const AUTH_API = {
  LOGIN: `${API_BASE_URL}/api/user/auth/login`,
  REGISTER: `${API_BASE_URL}/api/user/auth/register`,
};

export const MAIL_API = {
  SEND_REGISTER_CODE: `${API_BASE_URL}/api/mail/send-register-code`,
  SEND_LOGIN_CODE: `${API_BASE_URL}/api/mail/send-login-code`,
  SEND_FORGET_PASSWORD_CODE: `${API_BASE_URL}/api/mail/send-forget-password-code`,
};

export const PASSWORD_API = {
  FORGOT: `${API_BASE_URL}/api/user/password/forgot`,
};

// 工具函数
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) {
    return `${API_BASE_URL}/api/image/avatar/get?filePath=default/16.png`;
  }
  return `${API_BASE_URL}/api/image/avatar/get?filePath=${encodeURIComponent(avatarPath)}`;
};
```

**使用方式**:
```javascript
import { AUTH_API, MAIL_API, getAvatarUrl } from '../config/api';

// 调用接口
fetch(AUTH_API.LOGIN, { ... });

// 获取头像
const avatarUrl = getAvatarUrl(userInfo.avatar_url);
```

### 2. 统一使用 Fetch API

**禁止使用 axios**，所有网络请求使用原生 fetch。

#### GET 请求（URL 参数）

```javascript
const sendVerificationCode = async (email, username) => {
  try {
    const params = new URLSearchParams({
      email: email,
      username: username,
    });
    
    const response = await fetch(`${MAIL_API.SEND_REGISTER_CODE}?${params}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
};
```

#### POST 请求（表单数据）

```javascript
const handleLogin = async (formData) => {
  try {
    const params = new URLSearchParams();
    params.append('usernameOrEmail', formData.usernameOrEmail);
    params.append('password', formData.password);
    params.append('vCode', formData.vCode.toUpperCase());
    
    const response = await fetch(AUTH_API.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
};
```

### 3. 后端响应处理规范

#### 状态码字段兼容

后端可能返回 `code` 或 `recode` 字段，需要兼容处理：

```javascript
const result = await response.json();

// 兼容 code 和 recode 字段
const statusCode = result.code || result.recode;

if (statusCode === 200) {
  // 成功处理
  console.log('✅ 操作成功');
} else {
  // 失败处理
  console.error('❌ 操作失败:', result.message);
  alert(result.message || '操作失败');
}
```

#### 数据结构适配

**登录接口示例** - 用户信息直接在 `result.data` 中：

```javascript
if (statusCode === 200 && result.data) {
  // 保存 Token
  if (result.data.token) {
    localStorage.setItem('token', result.data.token);
  }
  
  // 保存用户信息（排除 token 字段）
  const userInfo = { ...result.data };
  delete userInfo.token;
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
  
  // 跳转页面
  router.push('/home');
}
```

### 4. 客户端数据存储

#### Token 管理

```javascript
// 保存
localStorage.setItem('token', token);

// 获取
const token = localStorage.getItem('token');

// 清除
localStorage.removeItem('token');
```

#### 用户信息管理

```javascript
// 保存（JSON 字符串）
localStorage.setItem('userInfo', JSON.stringify(userInfo));

// 获取并解析
const userInfoStr = localStorage.getItem('userInfo');
if (userInfoStr) {
  const userInfo = JSON.parse(userInfoStr);
  // 使用用户信息
}

// 清除
localStorage.removeItem('userInfo');
```

### 5. 验证码发送通用封装

创建通用的验证码发送函数，避免代码重复：

```javascript
// 通用验证码发送函数
const sendVerificationCode = async (options) => {
  const {
    validateFn,           // 验证函数
    fieldName,            // 要验证的字段名
    apiUrl,               // API 地址
    params,               // 请求参数对象
    buttonState,          // 按钮状态对象
    needCountdown = false,// 是否需要倒计时
    countdownFn = null,   // 倒计时函数
    showSuccessAlert = true, // 是否显示成功提示
  } = options;

  // 验证字段
  if (validateFn && fieldName) {
    const isValid = validateFn(fieldName);
    if (!isValid) return;
  }

  try {
    // 设置按钮状态
    buttonState.disabled = true;
    buttonState.text = "发送中";

    // 构建 URL 参数
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    // 发送请求
    const response = await fetch(`${apiUrl}?${queryString}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await response.json();
    const statusCode = result.code || result.recode;

    if (statusCode === 200 || result.data === true) {
      console.log("✅ 验证码发送成功");
      
      if (needCountdown && countdownFn) {
        countdownFn(); // 开始倒计时
      } else if (showSuccessAlert) {
        alert("验证码已发送");
        buttonState.disabled = false;
        buttonState.text = "获取验证码";
      }
    } else {
      buttonState.disabled = false;
      buttonState.text = "获取验证码";
      alert(result.message || "验证码发送失败");
    }
  } catch (error) {
    buttonState.disabled = false;
    buttonState.text = "获取验证码";
    alert("网络错误，请稍后重试");
  }
};

// 使用示例
const sendLoginCode = async () => {
  await sendVerificationCode({
    validateFn: validateField,
    fieldName: 'usernameOrEmail',
    apiUrl: MAIL_API.SEND_LOGIN_CODE,
    params: { usernameOrEmail: loginForm.usernameOrEmail },
    buttonState: loginVCodeButtonState,
    needCountdown: true,
    countdownFn: startLoginCountdown,
    showSuccessAlert: false, // 登录验证码不显示成功提示
  });
};
```

### 6. 按钮状态管理

使用 reactive 管理按钮状态，避免 DOM 操作：

```javascript
// 定义按钮状态
const loginVCodeButtonState = reactive({
  text: "获取验证码",
  disabled: false,
  countdown: 0,
});

// 模板中使用
<button 
  @click="sendLoginCode" 
  :disabled="loginVCodeButtonState.disabled"
>
  {{ loginVCodeButtonState.text }}
</button>

// 更新状态
loginVCodeButtonState.disabled = true;
loginVCodeButtonState.text = "60s";
```

### 7. 倒计时功能实现

```javascript
let countdownTimer = null;

const startCountdown = () => {
  buttonState.countdown = 60;
  buttonState.text = "60s";
  buttonState.disabled = true;

  countdownTimer = setInterval(() => {
    buttonState.countdown--;
    
    if (buttonState.countdown > 0) {
      buttonState.text = `${buttonState.countdown}s`;
    } else {
      // 倒计时结束
      clearInterval(countdownTimer);
      countdownTimer = null;
      buttonState.disabled = false;
      buttonState.text = "获取验证码";
    }
  }, 1000);
};

// 清除倒计时
const clearCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  buttonState.disabled = false;
  buttonState.text = "获取验证码";
  buttonState.countdown = 0;
};
```

### 8. 表单验证规范

#### 验证规则定义

```javascript
const FIELD_RULES = {
  usernameOrEmail: [
    { validator: (v) => !!v, message: "用户名/邮箱不能为空" },
    {
      validator: (v) => 
        /^[a-zA-Z0-9_]{5,16}$/.test(v) || 
        /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(v),
      message: "用户名或邮箱格式不正确"
    },
  ],
  password: [
    { validator: (v) => !!v, message: "密码不能为空" },
    { 
      validator: (v) => /^[a-zA-Z0-9_.]{6,16}$/.test(v), 
      message: "6-16位，只允许字母、数字、_、." 
    },
  ],
};
```

**注意**: 前后端正则表达式必须保持一致！

#### 字段验证函数

```javascript
const validateField = (fieldName) => {
  const value = loginForm[fieldName];
  const rules = FIELD_RULES[fieldName] || [];

  for (const rule of rules) {
    if (!rule.validator(value)) {
      fieldStates[fieldName].status = "error";
      fieldStates[fieldName].message = rule.message;
      return false;
    }
  }

  fieldStates[fieldName].status = "success";
  fieldStates[fieldName].message = "";
  return true;
};
```

#### 模板绑定

```vue
<div class="input-area" :class="fieldStates.usernameOrEmail.status">
  <input 
    type="text" 
    v-model="loginForm.usernameOrEmail" 
    @blur="validateField('usernameOrEmail')"
    placeholder="请输入用户名或邮箱"
  >
  <span class="error-msg">{{ fieldStates.usernameOrEmail.message }}</span>
</div>
```

### 9. 注册成功后自动填充登录

```javascript
if (statusCode === 200) {
  // 保存注册的用户名和密码
  const registeredUsername = regForm.username;
  const registeredPassword = regForm.password;

  // 清空注册表单
  for (const key in regForm) {
    regForm[key] = '';
  }

  // 倒计时后切换到登录面板
  let seconds = 3;
  registerButtonState.text = `注册成功，${seconds}秒后返回登录页面`;
  
  registerCountdownTimer = setInterval(() => {
    seconds--;
    if (seconds > 0) {
      registerButtonState.text = `注册成功，${seconds}秒后返回登录页面`;
    } else {
      clearInterval(registerCountdownTimer);
      hideFormPanel();
      
      // 等待动画完成后显示登录面板并填充
      setTimeout(() => {
        showLoginPanel();
        loginForm.usernameOrEmail = registeredUsername;
        loginForm.password = registeredPassword;
      }, 600);
    }
  }, 1000);
}
```

### 10. 头像显示

```javascript
// 获取头像 URL
const avatarUrl = getAvatarUrl(userInfo.avatar_url);

// 模板中使用
<img 
  :src="avatarUrl" 
  :alt="username + '的头像'"
  class="avatar"
  @error="handleAvatarError"
/>

// 错误处理
const handleAvatarError = (e) => {
  e.target.src = getAvatarUrl(null); // 使用默认头像
};
```

## 常见接口联调清单

### 用户认证接口

| 接口 | 方法 | Content-Type | 说明 |
|------|------|--------------|------|
| `/api/user/auth/register` | POST | application/x-www-form-urlencoded | 用户注册 |
| `/api/user/auth/login` | POST | application/x-www-form-urlencoded | 用户登录 |
| `/api/user/password/forgot` | POST | application/x-www-form-urlencoded | 忘记密码 |

### 邮件验证码接口

| 接口 | 方法 | Content-Type | 参数 |
|------|------|--------------|------|
| `/api/mail/send-register-code` | POST | application/json | email, username |
| `/api/mail/send-login-code` | POST | application/json | usernameOrEmail |
| `/api/mail/send-forget-password-code` | POST | application/json | usernameOrEmail |

### 资源接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/image/avatar/get?filePath=xxx` | GET | 获取头像 |

## 调试技巧

### 1. 控制台日志

```javascript
// 打印请求数据
console.log('发送请求数据:', params);

// 打印完整响应
console.log('接口响应:', JSON.stringify(result, null, 2));

// 打印关键信息
console.log('✅ 操作成功');
console.warn('⚠️ 缺少某个字段');
console.error('❌ 操作失败:', result.message);
```

### 2. localStorage 检查

浏览器控制台输入：
```javascript
// 查看所有存储的键
Object.keys(localStorage)

// 查看特定值
localStorage.getItem('token')
localStorage.getItem('userInfo')

// 解析用户信息
JSON.parse(localStorage.getItem('userInfo'))
```

### 3. 网络请求监控

- 打开浏览器开发者工具（F12）
- 切换到 Network 标签
- 筛选 Fetch/XHR 请求
- 查看请求头、参数、响应

## 注意事项

1. **禁止硬编码 URL** - 所有接口地址必须从配置文件导入
2. **禁止使用 axios** - 统一使用 fetch API
3. **前后端正则一致** - 验证规则必须与后端保持一致
4. **状态码兼容** - 同时处理 `code` 和 `recode` 字段
5. **URL 编码** - 使用 `encodeURIComponent` 处理参数
6. **验证码大写** - 提交时将验证码转为大写 `.toUpperCase()`
7. **错误提示友好** - 给用户清晰的错误提示
8. **按钮防重复点击** - 使用 disabled 状态防止重复提交
9. **清理定时器** - 组件销毁或操作完成时清除定时器
10. **数据安全** - Token 和用户信息妥善存储在 localStorage

## 最佳实践总结

1. ✅ 配置集中管理
2. ✅ 代码封装复用
3. ✅ 响应式状态管理
4. ✅ 完善的错误处理
5. ✅ 友好的用户反馈
6. ✅ 详细的调试日志
7. ✅ 统一的代码风格
8. ✅ 清晰的注释说明

---

**最后更新**: 2026-04-29
**适用项目**: PixVisionPage
