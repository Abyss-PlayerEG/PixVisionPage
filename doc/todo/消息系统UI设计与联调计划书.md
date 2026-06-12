# 消息系统 UI 设计与联调计划书

## 一、项目概述

### 1.1 功能目标
在首页 NavBar 的 `n3_cont` 区域添加消息通知图标，并创建消息界面，实现左右结构的消息中心：
- 左侧：消息列表（会话列表 + 系统通知）
- 右侧：聊天框（当前仅支持文本聊天）

### 1.2 技术约束
- 严格遵循项目三层架构（API → Composable → View）
- 使用原生 `fetch`（禁止 axios）
- UI 风格统一（暗色主题 + 玻璃形态效果）
- 使用 GSAP 实现动画效果

---

## 二、UI 设计方案

### 2.1 NavBar 消息图标设计

**位置**：搜索框与登录按钮/头像之间

**视觉规格**：
```css
/* 消息图标容器 */
width: 36px;
height: 36px;
border-radius: 50%;
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.3);
background: transparent;
cursor: pointer;
transition: all 0.3s ease;

/* Hover 态 */
border: 1px solid rgba(255, 255, 255, 0.6);
background: rgba(255, 255, 255, 0.1);

/* 未读消息徽章 */
width: 18px;
height: 18px;
border-radius: 50%;
background: #e64d3c; /* 语义色-错误 */
font-size: 10px;
color: #fff;
position: absolute;
top: -4px;
right: -4px;
```

**交互行为**：
- 未登录：隐藏消息图标
- 已登录无未读：显示普通信封图标
- 已登录有未读：显示信封图标 + 红色数字徽章
- 点击：跳转到 `/message` 路由

### 2.2 消息页面布局设计

**整体结构**：
```
┌─────────────────────────────────────────────────────────┐
│                      NavBar (固定)                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌────────────────────────────────┐  │
│  │              │  │                                │  │
│  │   会话列表    │  │         聊天区域               │  │
│  │   (左侧)     │  │         (右侧)                 │  │
│  │              │  │                                │  │
│  │  width: 320px│  │         flex: 1                │  │
│  │              │  │                                │  │
│  │  ┌────────┐ │  │  ┌──────────────────────────┐ │  │
│  │  │ 会话1  │ │  │  │ 对方昵称                 │ │  │
│  │  ├────────┤ │  │  ├──────────────────────────┤ │  │
│  │  │ 会话2  │ │  │  │                          │ │  │
│  │  ├────────┤ │  │  │     消息气泡区域          │ │  │
│  │  │ 会话3  │ │  │  │                          │ │  │
│  │  └────────┘ │  │  ├──────────────────────────┤ │  │
│  │              │  │  │ [输入框]        [发送]   │ │  │
│  │              │  │  └──────────────────────────┘ │  │
│  └──────────────┘  └────────────────────────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**尺寸规格**：
```css
/* 页面容器 */
min-height: calc(100vh - 50px); /* 减去 NavBar 高度 */
padding: 24px 5%;
margin-top: 50px;
background: #000000;

/* 左侧会话列表 */
width: 320px;
min-height: 600px;
max-height: calc(100vh - 100px);
background: #1a1a1a;
border-radius: 16px;
border: 1px solid rgba(255, 255, 255, 0.06);
overflow-y: auto;

/* 右侧聊天区域 */
flex: 1;
min-height: 600px;
max-height: calc(100vh - 100px);
background: #1a1a1a;
border-radius: 16px;
border: 1px solid rgba(255, 255, 255, 0.06);
display: flex;
flex-direction: column;
```

### 2.3 会话列表项设计

```css
/* 会话项 */
padding: 16px;
display: flex;
align-items: center;
gap: 12px;
cursor: pointer;
transition: all 0.25s ease;
border-bottom: 1px solid rgba(255, 255, 255, 0.06);

/* Hover 态 */
background: rgba(255, 255, 255, 0.03);

/* 选中态 */
background: rgba(0, 169, 71, 0.1);
border-left: 3px solid #00A947;

/* 头像 */
width: 44px;
height: 44px;
border-radius: 50%;
object-fit: cover;

/* 昵称 */
font-size: 15px;
font-weight: 500;
color: #ffffff;
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;

/* 最后消息 */
font-size: 13px;
color: #7e7e7e;
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;

/* 时间 */
font-size: 11px;
color: #555;

/* 未读徽章 */
width: 20px;
height: 20px;
border-radius: 50%;
background: #e64d3c;
font-size: 11px;
color: #fff;
display: flex;
align-items: center;
justify-content: center;
```

### 2.4 聊天气泡设计

```css
/* 消息气泡容器 */
padding: 20px;
flex: 1;
overflow-y: auto;
display: flex;
flex-direction: column;
gap: 16px;

/* 对方消息（左侧） */
align-self: flex-start;
max-width: 70%;
background: #2a2a2a;
border-radius: 16px 16px 16px 4px;
padding: 12px 16px;
color: #ffffff;
font-size: 14px;
line-height: 1.6;

/* 我的消息（右侧） */
align-self: flex-end;
max-width: 70%;
background: #00A947;
border-radius: 16px 16px 4px 16px;
padding: 12px 16px;
color: #ffffff;
font-size: 14px;
line-height: 1.6;

/* 时间戳 */
font-size: 11px;
color: #555;
align-self: center;
margin: 8px 0;
```

### 2.5 输入框设计

```css
/* 输入区域容器 */
padding: 16px 20px;
border-top: 1px solid rgba(255, 255, 255, 0.06);
display: flex;
gap: 12px;
align-items: flex-end;

/* 输入框 */
flex: 1;
min-height: 40px;
max-height: 120px;
padding: 10px 16px;
background: #0d0d0d;
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 12px;
color: #ffffff;
font-size: 14px;
resize: none;
outline: none;
transition: border-color 0.3s ease;

/* Focus 态 */
border-color: #00A947;

/* 发送按钮 */
width: 40px;
height: 40px;
border-radius: 50%;
background: #00A947;
border: none;
cursor: pointer;
display: flex;
align-items: center;
justify-content: center;
transition: all 0.3s ease;

/* Hover 态 */
background: #00c956;
transform: scale(1.05);

/* Disabled 态 */
background: #2a2a2a;
cursor: not-allowed;
```

---

## 三、功能模块设计

### 3.1 模块划分

| 模块 | 文件路径 | 职责 |
|------|----------|------|
| API 配置 | `src/config/api.js` | 添加消息相关 API 地址 |
| 消息 API | `src/api/messageApi.js` | 消息相关 HTTP 请求 |
| 消息 Composable | `src/composables/useMessage.js` | 消息状态管理、WebSocket 连接 |
| NavBar 消息图标 | `src/components/NavBar.vue` | 添加消息图标组件 |
| 消息页面 | `src/views/Message.vue` | 消息中心页面 |
| 消息 CSS | `src/assets/CSS/message.css` | 消息页面样式 |
| 路由配置 | `src/router/index.js` | 添加消息路由 |

### 3.2 API 接口清单

根据 `frontend-integration-guide.md`，需要对接以下接口：

| 接口 | 方法 | 路径 | 用途 |
|------|------|------|------|
| 获取未读数 | GET | `/api/message/unread-count` | NavBar 徽章显示 |
| 会话列表 | GET | `/api/message/conversations/{current}/{size}` | 左侧会话列表 |
| 聊天记录 | GET | `/api/message/chat/{otherUserId}/{current}/{size}` | 右侧消息记录 |
| 发送私信 | POST | `/api/message/send` | 发送文本消息 |
| 标记已读 | POST | `/api/message/read/conversation/{otherUserId}` | 打开会话时标记 |
| 系统通知 | GET | `/api/message/system/{current}/{size}` | 通知列表 |
| WebSocket | - | `ws://.../api/ws/notification?token=xxx` | 实时消息推送 |

### 3.3 数据流设计

```
┌─────────────────────────────────────────────────────────────┐
│                        数据流向                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │  NavBar     │    │  Message    │    │  WebSocket  │    │
│  │  (图标)     │    │  (页面)     │    │  (实时)     │    │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    │
│         │                  │                  │              │
│         ▼                  ▼                  ▼              │
│  ┌─────────────────────────────────────────────────────┐  │
│  │               useMessage.js (Composable)              │  │
│  │  - unreadCount: ref({ total, private, system })      │  │
│  │  - conversations: ref([])                             │  │
│  │  - currentChat: ref([])                               │  │
│  │  - wsConnected: ref(false)                            │  │
│  └──────────────────────────┬──────────────────────────┘  │
│                             │                                │
│                             ▼                                │
│  ┌─────────────────────────────────────────────────────┐  │
│  │               messageApi.js (API 层)                  │  │
│  │  - fetchUnreadCount()                                 │  │
│  │  - fetchConversations(page, size)                     │  │
│  │  - fetchChatHistory(userId, page, size)               │  │
│  │  - sendMessage(toUserId, content)                     │  │
│  │  - markConversationRead(userId)                       │  │
│  └──────────────────────────┬──────────────────────────┘  │
│                             │                                │
│                             ▼                                │
│  ┌─────────────────────────────────────────────────────┐  │
│  │               后端 API 服务器                         │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 四、开发计划

### 4.1 Phase 1：基础架构搭建

| 任务 | 文件 | 预计时间 | 依赖 |
|------|------|----------|------|
| 1.1 添加 API 配置 | `src/config/api.js` | 10min | 无 |
| 1.2 创建消息 API 模块 | `src/api/messageApi.js` | 30min | 1.1 |
| 1.3 创建消息 Composable | `src/composables/useMessage.js` | 60min | 1.2 |
| 1.4 添加路由配置 | `src/router/index.js` | 10min | 无 |

### 4.2 Phase 2：NavBar 消息图标

| 任务 | 文件 | 预计时间 | 依赖 |
|------|------|----------|------|
| 2.1 添加消息图标 UI | `src/components/NavBar.vue` | 30min | 1.3 |
| 2.2 集成未读数显示 | `src/components/NavBar.vue` | 20min | 2.1 |
| 2.3 添加点击跳转 | `src/components/NavBar.vue` | 10min | 2.1 |
| 2.4 图标动画效果 | `src/components/NavBar.vue` | 20min | 2.1 |

### 4.3 Phase 3：消息页面开发

| 任务 | 文件 | 预计时间 | 依赖 |
|------|------|----------|------|
| 3.1 创建页面骨架 | `src/views/Message.vue` | 30min | 1.4 |
| 3.2 实现会话列表 | `src/views/Message.vue` | 40min | 1.3 |
| 3.3 实现聊天区域 | `src/views/Message.vue` | 60min | 1.3 |
| 3.4 实现消息发送 | `src/views/Message.vue` | 30min | 3.3 |
| 3.5 页面样式开发 | `src/assets/CSS/message.css` | 60min | 3.1-3.4 |

### 4.4 Phase 4：WebSocket 集成

| 任务 | 文件 | 预计时间 | 依赖 |
|------|------|----------|------|
| 4.1 WebSocket 连接管理 | `src/composables/useMessage.js` | 40min | 1.3 |
| 4.2 心跳机制 | `src/composables/useMessage.js` | 20min | 4.1 |
| 4.3 断线重连 | `src/composables/useMessage.js` | 30min | 4.1 |
| 4.4 实时消息接收 | `src/composables/useMessage.js` | 30min | 4.1 |
| 4.5 未读数实时更新 | `src/components/NavBar.vue` | 20min | 4.4 |

### 4.5 Phase 5：联调与优化

| 任务 | 描述 | 预计时间 | 依赖 |
|------|------|----------|------|
| 5.1 接口联调 | 与后端对接所有接口 | 60min | Phase 1-4 |
| 5.2 边界处理 | 空状态、加载状态、错误处理 | 40min | 5.1 |
| 5.3 动画优化 | GSAP 入场动画、过渡效果 | 40min | 5.1 |
| 5.4 响应式适配 | 移动端布局适配 | 30min | 5.1 |
| 5.5 性能优化 | 虚拟滚动、防抖节流 | 30min | 5.1 |

---

## 五、详细实现方案

### 5.1 API 配置添加

```javascript
// src/config/api.js 新增内容

// 消息相关接口
export const MESSAGE_API = {
  UNREAD_COUNT: `${API_BASE_URL}/api/message/unread-count`,
  CONVERSATIONS: (current, size) => `${API_BASE_URL}/api/message/conversations/${current}/${size}`,
  CHAT_HISTORY: (userId, current, size) => `${API_BASE_URL}/api/message/chat/${userId}/${current}/${size}`,
  SEND: `${API_BASE_URL}/api/message/send`,
  MARK_READ: (userId) => `${API_BASE_URL}/api/message/read/conversation/${userId}`,
  MARK_ALL_READ: `${API_BASE_URL}/api/message/read-all`,
  DELETE: (messageId) => `${API_BASE_URL}/api/message/delete/${messageId}`,
  BATCH_DELETE: `${API_BASE_URL}/api/message/batch-delete`,
  SYSTEM_MESSAGES: (current, size) => `${API_BASE_URL}/api/message/system/${current}/${size}`,
};

// WebSocket 地址
export const WS_NOTIFICATION_URL = (token) => `ws://${API_BASE_URL.replace('http://', '')}/api/ws/notification?token=${token}`;
```

### 5.2 消息 API 模块设计

```javascript
// src/api/messageApi.js
import { MESSAGE_API } from '../config/api'

/**
 * 获取未读消息数量
 */
export const fetchUnreadCount = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(MESSAGE_API.UNREAD_COUNT, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    const result = await response.json()
    console.log('未读消息数响应:', JSON.stringify(result, null, 2))

    const statusCode = result.code || result.recode
    if (statusCode === 200 && result.data) {
      console.log('✅ 获取未读消息数成功')
      return { success: true, data: result.data }
    } else {
      console.error('❌ 获取未读消息数失败:', result.message)
      return { success: false, message: result.message || '获取失败' }
    }
  } catch (error) {
    console.error('网络请求失败:', error)
    return { success: false, message: '网络错误，请稍后重试' }
  }
}

/**
 * 获取会话列表
 */
export const fetchConversations = async (current = 1, size = 20) => {
  // 类似实现...
}

/**
 * 获取聊天记录
 */
export const fetchChatHistory = async (userId, current = 1, size = 50) => {
  // 类似实现...
}

/**
 * 发送私信
 */
export const sendMessage = async (toUserId, content) => {
  try {
    const token = localStorage.getItem('token')
    const formData = new URLSearchParams({
      toUserId: toUserId,
      content: content
    })

    const response = await fetch(MESSAGE_API.SEND, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    })
    // 类似处理...
  } catch (error) {
    // 错误处理...
  }
}

/**
 * 标记会话已读
 */
export const markConversationRead = async (userId) => {
  // 类似实现...
}
```

### 5.3 消息 Composable 设计

```javascript
// src/composables/useMessage.js
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  fetchUnreadCount, 
  fetchConversations, 
  fetchChatHistory, 
  sendMessage as apiSendMessage,
  markConversationRead 
} from '@/api/messageApi'
import { WS_NOTIFICATION_URL } from '@/config/api'

export const useMessage = () => {
  // 状态
  const unreadCount = ref({ total: 0, private: 0, system: 0 })
  const conversations = ref([])
  const currentChat = ref([])
  const selectedUserId = ref(null)
  const loading = ref(false)
  const sending = ref(false)
  const wsConnected = ref(false)
  
  // WebSocket 实例
  let ws = null
  let heartbeatTimer = null
  let reconnectTimer = null
  let reconnectAttempts = 0
  const maxReconnectAttempts = 5

  // 计算属性
  const hasUnread = computed(() => unreadCount.value.total > 0)
  const selectedConversation = computed(() => 
    conversations.value.find(c => c.other_user_id === selectedUserId.value)
  )

  // 获取未读消息数
  const loadUnreadCount = async () => {
    const result = await fetchUnreadCount()
    if (result.success) {
      unreadCount.value = result.data
    }
  }

  // 获取会话列表
  const loadConversations = async (page = 1, size = 20) => {
    loading.value = true
    const result = await fetchConversations(page, size)
    loading.value = false
    
    if (result.success) {
      if (page === 1) {
        conversations.value = result.data.records || []
      } else {
        conversations.value.push(...(result.data.records || []))
      }
    }
  }

  // 选择会话
  const selectConversation = async (userId) => {
    selectedUserId.value = userId
    await loadChatHistory(userId)
    await markConversationRead(userId)
    // 更新未读数
    await loadUnreadCount()
  }

  // 加载聊天记录
  const loadChatHistory = async (userId, page = 1, size = 50) => {
    loading.value = true
    const result = await fetchChatHistory(userId, page, size)
    loading.value = false
    
    if (result.success) {
      if (page === 1) {
        currentChat.value = (result.data.records || []).reverse()
      } else {
        currentChat.value.unshift(...(result.data.records || []).reverse())
      }
    }
  }

  // 发送消息
  const sendMessage = async (content) => {
    if (!selectedUserId.value || !content.trim()) return false
    
    sending.value = true
    const result = await apiSendMessage(selectedUserId.value, content)
    sending.value = false
    
    if (result.success) {
      // 刷新聊天记录
      await loadChatHistory(selectedUserId.value)
      return true
    }
    return false
  }

  // WebSocket 连接
  const connectWebSocket = () => {
    const token = localStorage.getItem('token')
    if (!token) return

    const wsUrl = WS_NOTIFICATION_URL(token)
    ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('✅ WebSocket 连接成功')
      wsConnected.value = true
      reconnectAttempts = 0
      startHeartbeat()
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'PING') {
          // 回复心跳
          ws.send(JSON.stringify({ type: 'PONG' }))
          return
        }
        
        if (data.type === 'notification') {
          // 新消息通知
          console.log('收到新消息:', data.data)
          // 更新未读数
          loadUnreadCount()
          // 如果正在查看该会话，刷新聊天记录
          if (selectedUserId.value === data.data.from_user_id) {
            loadChatHistory(selectedUserId.value)
          }
          // 更新会话列表
          loadConversations()
        }
      } catch (e) {
        console.error('WebSocket 消息解析失败:', e)
      }
    }

    ws.onclose = () => {
      console.log('WebSocket 连接关闭')
      wsConnected.value = false
      stopHeartbeat()
      attemptReconnect()
    }

    ws.onerror = (error) => {
      console.error('WebSocket 错误:', error)
      wsConnected.value = false
    }
  }

  // 心跳机制
  const startHeartbeat = () => {
    stopHeartbeat()
    heartbeatTimer = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'PING' }))
      }
    }, 30000)
  }

  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  // 断线重连
  const attemptReconnect = () => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.log('达到最大重连次数，停止重连')
      return
    }

    reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)
    
    console.log(`${delay / 1000}秒后尝试第${reconnectAttempts}次重连`)
    
    reconnectTimer = setTimeout(() => {
      connectWebSocket()
    }, delay)
  }

  const disconnectWebSocket = () => {
    stopHeartbeat()
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (ws) {
      ws.close()
      ws = null
    }
    wsConnected.value = false
  }

  // 生命周期
  onMounted(() => {
    loadUnreadCount()
    loadConversations()
    connectWebSocket()
  })

  onUnmounted(() => {
    disconnectWebSocket()
  })

  return {
    // 状态
    unreadCount,
    conversations,
    currentChat,
    selectedUserId,
    loading,
    sending,
    wsConnected,
    
    // 计算属性
    hasUnread,
    selectedConversation,
    
    // 方法
    loadUnreadCount,
    loadConversations,
    selectConversation,
    loadChatHistory,
    sendMessage,
    connectWebSocket,
    disconnectWebSocket,
  }
}
```

### 5.4 NavBar 消息图标实现

```vue
<!-- src/components/NavBar.vue 添加内容 -->

<script setup>
// ... 现有代码 ...

// 导入消息 composable
import { useMessage } from '@/composables/useMessage'

// 在 composable 解构中添加
const { unreadCount, hasUnread } = useMessage()

// 跳转到消息页面
const goToMessage = () => {
  router.push('/message')
}
</script>

<template>
  <!-- ... 现有代码 ... -->
  
  <!-- 右侧个人选项 -->
  <section class="navTag n3_cont">
    <!-- 搜索框 -->
    <div class="search_wrapper" :class="{ 'is-focused': isSearchFocused }">
      <!-- ... 现有代码 ... -->
    </div>
    
    <!-- 消息图标（已登录时显示） -->
    <div v-if="isLoggedIn" class="message_icon" @click="goToMessage">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
      <!-- 未读消息徽章 -->
      <span v-if="hasUnread" class="message_badge">
        {{ unreadCount.total > 99 ? '99+' : unreadCount.total }}
      </span>
    </div>
    
    <!-- 登录按钮/头像 -->
    <div v-if="!isLoggedIn" class="login_btn" @click="$router.push('/login')">JoinUs</div>
    <div v-else class="avatar_pill" @click="$router.push('/profile/me')">
      <!-- ... 现有代码 ... -->
    </div>
  </section>
  
  <!-- ... 现有代码 ... -->
</template>

<style scoped>
/* ... 现有代码 ... */

/* 消息图标 */
.message_icon {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.message_icon:hover {
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.message_badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background: #e64d3c;
  font-size: 10px;
  font-weight: 600;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  box-shadow: 0 2px 8px rgba(230, 77, 60, 0.4);
}
</style>
```

---

## 六、测试方案

### 6.1 功能测试用例

| 测试项 | 测试步骤 | 预期结果 |
|--------|----------|----------|
| 未登录状态 | 1. 未登录访问首页 | 消息图标不显示 |
| 已登录无未读 | 1. 登录后无未读消息 | 显示消息图标，无徽章 |
| 已登录有未读 | 1. 有未读消息时 | 显示消息图标 + 红色数字徽章 |
| 点击跳转 | 1. 点击消息图标 | 跳转到 `/message` 页面 |
| 会话列表加载 | 1. 进入消息页面 | 正确显示会话列表 |
| 选择会话 | 1. 点击某个会话 | 右侧显示对应聊天记录 |
| 发送消息 | 1. 输入文本并发送 | 消息发送成功并显示 |
| 实时接收 | 1. 对方发送消息 | 实时显示新消息 |
| 未读数更新 | 1. 收到新消息 | NavBar 徽章数字更新 |
| 标记已读 | 1. 打开会话 | 该会话未读数清零 |

### 6.2 边界测试用例

| 测试项 | 测试步骤 | 预期结果 |
|--------|----------|----------|
| 空会话列表 | 1. 无任何会话 | 显示空状态提示 |
| 网络断开 | 1. 断开网络 | 显示连接状态，自动重连 |
| 消息过长 | 1. 输入超长文本 | 正常发送和显示 |
| 快速切换会话 | 1. 快速点击不同会话 | 正确显示对应消息 |

---

## 七、风险与应对

### 7.1 技术风险

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| WebSocket 连接不稳定 | 消息延迟或丢失 | 实现断线重连 + 心跳机制 |
| 大量消息导致性能问题 | 页面卡顿 | 实现虚拟滚动 + 分页加载 |
| 并发请求导致状态混乱 | 数据不一致 | 使用 loading 状态锁 |

### 7.2 时间风险

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| 后端接口未就绪 | 无法联调 | 使用 Mock 数据先行开发 |
| 设计方案变更 | 返工 | 提前确认设计方案 |

---

## 八、交付物清单

### 8.1 代码文件

- [ ] `src/config/api.js` - 添加消息 API 配置
- [ ] `src/api/messageApi.js` - 消息 API 模块
- [ ] `src/composables/useMessage.js` - 消息 Composable
- [ ] `src/views/Message.vue` - 消息页面
- [ ] `src/assets/CSS/message.css` - 消息页面样式
- [ ] `src/components/NavBar.vue` - 添加消息图标
- [ ] `src/router/index.js` - 添加消息路由

### 8.2 文档

- [ ] 消息系统 UI 设计与联调计划书（本文档）
- [ ] 接口对接文档（联调时补充）

---

## 九、附录

### 9.1 参考资源

- 消息系统前端联调文档：`doc/todo/frontend-integration-guide.md`
- 消息系统 Demo：`doc/todo/MessageSystemDemo.html`
- 项目设计规范：`AGENTS.md`

### 9.2 版本记录

| 版本 | 日期 | 作者 | 描述 |
|------|------|------|------|
| v1.0 | 2026-06-11 | - | 初始版本 |

---

**文档状态**：待审批  
**最后更新**：2026-06-11
