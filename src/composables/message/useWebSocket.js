/**
 * WebSocket 连接管理 Composable（单例模式）
 * 提供心跳机制、自动重连、消息分发
 * 所有组件共享同一个 WebSocket 连接
 */
import { ref, onUnmounted } from 'vue'
import { WS_URL } from '@/config/api'

// 模块级别共享状态（单例）
const status = ref('disconnected')
const lastMessage = ref(null)

let ws = null
let heartbeatTimer = null
let reconnectTimer = null
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 10
const HEARTBEAT_INTERVAL = 10000 // 10秒心跳
const RECONNECT_BASE_DELAY = 2000 // 重连基础延迟

// 消息回调集合
const messageCallbacks = new Set()

// 组件引用计数
let refCount = 0

export function useWebSocket() {
  refCount++
  
  /**
   * 注册消息回调
   * @param {Function} callback - 消息回调函数
   */
  const onMessage = (callback) => {
    messageCallbacks.add(callback)
    return () => messageCallbacks.delete(callback)
  }

  /**
   * 分发消息给所有注册的回调
   * @param {object} data - 解析后的消息数据
   */
  const dispatchMessage = (data) => {
    lastMessage.value = data
    messageCallbacks.forEach(cb => {
      try {
        cb(data)
      } catch (e) {
        console.error('❌ 消息回调执行错误:', e)
      }
    })
  }

  /**
   * 启动心跳
   */
  const startHeartbeat = () => {
    stopHeartbeat()
    heartbeatTimer = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('PING')
        console.log('💓 发送心跳 PING')
      }
    }, HEARTBEAT_INTERVAL)
  }

  /**
   * 停止心跳
   */
  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  /**
   * 计算重连延迟（指数退避）
   */
  const getReconnectDelay = () => {
    return Math.min(RECONNECT_BASE_DELAY * Math.pow(1.5, reconnectAttempts), 30000)
  }

  /**
   * 延迟重连
   */
  const scheduleReconnect = () => {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.warn('⚠️ 已达最大重连次数，停止重连')
      status.value = 'disconnected'
      return
    }

    const delay = getReconnectDelay()
    console.log(`🔄 ${delay / 1000}秒后尝试第 ${reconnectAttempts + 1} 次重连...`)
    status.value = 'connecting'

    reconnectTimer = setTimeout(() => {
      reconnectAttempts++
      connect()
    }, delay)
  }

  /**
   * 建立 WebSocket 连接
   */
  const connect = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      console.warn('⚠️ 无 Token，跳过 WebSocket 连接')
      status.value = 'disconnected'
      return
    }

    // 防止重复连接
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      console.log('ℹ️ WebSocket 已在连接中')
      return
    }

    const wsUrl = `${WS_URL}?token=${encodeURIComponent(token)}`
    console.log('🔌 正在连接 WebSocket...')

    try {
      status.value = 'connecting'
      ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('✅ WebSocket 连接成功')
        status.value = 'connected'
        reconnectAttempts = 0
        startHeartbeat()
      }

      ws.onmessage = (event) => {
        try {
          const rawData = event.data
          
          // 处理心跳响应（纯字符串格式）
          if (rawData === 'PING') {
            ws.send('PONG')
            console.log('💓 回复心跳 PONG')
            return
          }
          
          if (rawData === 'PONG') {
            console.log('💓 收到心跳响应 PONG')
            return
          }

          // 解析 JSON 消息
          const data = JSON.parse(rawData)
          console.log('📨 收到 WebSocket 消息:', data)
          dispatchMessage(data)
        } catch (e) {
          console.error('❌ 消息解析失败:', e)
        }
      }

      ws.onclose = (event) => {
        console.log('🔌 WebSocket 连接关闭:', event.code, event.reason)
        stopHeartbeat()
        ws = null

        // 非主动关闭则尝试重连
        if (status.value !== 'disconnected') {
          scheduleReconnect()
        }
      }

      ws.onerror = (error) => {
        console.error('❌ WebSocket 错误:', error)
      }
    } catch (error) {
      console.error('❌ WebSocket 连接失败:', error)
      scheduleReconnect()
    }
  }

  /**
   * 断开 WebSocket 连接
   */
  const disconnect = () => {
    console.log('🔌 主动断开 WebSocket')
    status.value = 'disconnected'
    reconnectAttempts = MAX_RECONNECT_ATTEMPTS // 阻止自动重连
    stopHeartbeat()

    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }

    if (ws) {
      ws.close()
      ws = null
    }
  }

  /**
   * 重置重连计数并重新连接
   */
  const reconnect = () => {
    disconnect()
    reconnectAttempts = 0
    setTimeout(() => connect(), 500)
  }

  // 组件卸载时减少引用计数
  onUnmounted(() => {
    refCount--
    // 只有当没有组件使用时才断开连接
    if (refCount <= 0) {
      disconnect()
      refCount = 0
    }
  })

  return {
    status,
    lastMessage,
    connect,
    disconnect,
    reconnect,
    onMessage,
  }
}
