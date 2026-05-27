<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { resetDefaultAvatar, syncBilibiliAvatar } from '@/api/profileApi.js'

const props = defineProps({
  show: { type: Boolean, default: false },
  outputSize: { type: Number, default: 1024 },
  previewSize: { type: Number, default: 300 },
  hasBilibili: { type: Boolean, default: false },
})

// 标题根据阶段自动切换
const dialogTitle = computed(() => {
  return stage.value === 'pick' ? '上传你的头像' : '修改头像大小'
})

const emit = defineEmits(['update:show', 'confirm', 'cancel', 'close', 'avatar-updated'])

// ── 状态 ──
const isVisible = ref(false)
const overlayRef = ref(null)
const dialogRef = ref(null)

const stage = ref('pick')        // 'pick' | 'crop'
const sourceImage = ref(null)    // Image 元素
const sourceFile = ref(null)     // 原始文件
const sourceDataUrl = ref('')    // 预览用的 data URL

const cropContainerRef = ref(null)
const imageRef = ref(null)
const dragging = ref(false)
const pointerLocked = ref(false)
const justDragged = ref(false)  // 防止拖拽结束后的残余 click 关闭弹窗
const isTransitioning = ref(false)  // 阶段切换动画进行中，阻止交互
const dragStart = reactive({ x: 0, y: 0 })
const translate = reactive({ x: 0, y: 0 })
const zoom = ref(1)
const minZoom = ref(1)
const maxZoom = ref(3)

const cursorDot = reactive({ x: 0, y: 0, show: false })

const previewUrl = ref('')
const isProcessing = ref(false)
const isQuickAction = ref(false)  // 一键操作进行中（初始化头像 / 同步B站头像）

// ── 一键操作：初始化头像 ──
const handleResetDefault = async () => {
  if (isQuickAction.value) return
  isQuickAction.value = true
  const result = await resetDefaultAvatar()
  isQuickAction.value = false
  if (result.success) {
    emit('avatar-updated', { type: 'reset', data: result.data })
    closeDialog()
  } else {
    // 通知由外部处理（可在此 emit 或调用 composable 中的 notification）
    emit('avatar-updated', { type: 'reset', error: result.message })
  }
}

// ── 一键操作：同步 Bilibili 头像 ──
const handleSyncBilibili = async () => {
  if (isQuickAction.value || !props.hasBilibili) return
  isQuickAction.value = true
  const result = await syncBilibiliAvatar()
  isQuickAction.value = false
  if (result.success) {
    emit('avatar-updated', { type: 'bilibili', data: result.data })
    closeDialog()
  } else {
    emit('avatar-updated', { type: 'bilibili', error: result.message })
  }
}

const dropzoneHint = computed(() => {
  return `支持 JPG / JPEG / PNG，建议尺寸 ≥ ${props.outputSize}×${props.outputSize}`
})
const cropSize = computed(() => props.previewSize)

// 弹窗宽度动态适配：previewSize > 300 时自动加宽，小于 300 时保持 420 基础宽度
const dialogStyle = computed(() => {
  const delta = Math.max(0, props.previewSize - 300)
  return { width: `${420 + delta}px` }
})

const imageStyle = computed(() => {
  if (!sourceImage.value) return {}
  const s = zoom.value
  return {
    transform: `translate(${translate.x}px, ${translate.y}px) scale(${s})`,
    transformOrigin: '0 0',
    userSelect: 'none',
    pointerEvents: 'none',
  }
})

// ── 初始化图片位置（居中 cover） ──
const initPosition = () => {
  if (!sourceImage.value) return
  const img = sourceImage.value
  const size = cropSize.value
  const iw = img.naturalWidth
  const ih = img.naturalHeight

  // 以短边撑满 crop 区域
  const baseScale = iw > ih ? size / ih : size / iw

  minZoom.value = baseScale
  maxZoom.value = Math.max(baseScale * 3, 3)
  zoom.value = baseScale

  const cssW = iw * baseScale
  const cssH = ih * baseScale
  translate.x = -(cssW - size) / 2
  translate.y = -(cssH - size) / 2
}

// ── 将指针坐标限制在裁剪圆形区域内 ──
const clampToCircle = (cx, cy, radius, px, py) => {
  const dx = px - cx
  const dy = py - cy
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist <= radius) return { x: px, y: py }
  const angle = Math.atan2(dy, dx)
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius,
  }
}

const updateCursorDot = (clientX, clientY) => {
  const rect = cropContainerRef.value?.getBoundingClientRect()
  if (!rect) return
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const radius = rect.width / 2
  const clamped = clampToCircle(cx, cy, radius, clientX, clientY)
  cursorDot.x = clamped.x - rect.left
  cursorDot.y = clamped.y - rect.top
}

// ── 拖拽 ──
const clampTranslate = () => {
  if (!sourceImage.value) return
  const size = cropSize.value
  const img = sourceImage.value
  const cssW = img.naturalWidth * zoom.value
  const cssH = img.naturalHeight * zoom.value

  // 边界：图片必须始终覆盖整个裁剪框
  translate.x = Math.max(-(cssW - size), Math.min(0, translate.x))
  translate.y = Math.max(-(cssH - size), Math.min(0, translate.y))
}

const onCropPointerDown = (e) => {
  if (stage.value !== 'crop') return
  if (e.button !== 0) return  // 仅响应鼠标左键 / 触控板主按钮
  e.preventDefault()

  dragging.value = true
  pointerLocked.value = true
  dragStart.x = e.clientX - translate.x
  dragStart.y = e.clientY - translate.y

  cursorDot.show = true
  updateCursorDot(e.clientX, e.clientY)

  // 全局隐藏真实光标
  document.body.classList.add('avc-cursor-hidden')
}

const onPointerMove = (e) => {
  // 光标锁定：即使未在拖拽图片，也更新光标圆点位置
  if (pointerLocked.value) {
    updateCursorDot(e.clientX, e.clientY)
  }
  if (!dragging.value) return
  translate.x = e.clientX - dragStart.x
  translate.y = e.clientY - dragStart.y
  clampTranslate()
}

const onPointerUp = () => {
  if (!dragging.value && !pointerLocked.value) return
  justDragged.value = true  // 标记刚完成拖拽，阻止紧随的 click 事件关闭弹窗
  dragging.value = false
  pointerLocked.value = false
  cursorDot.show = false
  document.body.classList.remove('avc-cursor-hidden')
}

// ── 滚轮缩放 ──
const onWheel = (e) => {
  if (stage.value !== 'crop') return
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  const newZoom = Math.max(minZoom.value, Math.min(maxZoom.value, zoom.value + delta))
  if (newZoom === zoom.value) return

  // 以鼠标位置为中心缩放
  const rect = cropContainerRef.value.getBoundingClientRect()
  const cx = e.clientX - rect.left
  const cy = e.clientY - rect.top
  const ratio = newZoom / zoom.value

  translate.x = cx - (cx - translate.x) * ratio
  translate.y = cy - (cy - translate.y) * ratio
  zoom.value = newZoom
  clampTranslate()
}

// ── 阶段切换 GSAP 过渡动画 ──
// 仅动画 opacity + scale + translateY（纯 GPU 合成，不触发 Layout 重排）
// 高度变化通过 min-height 锁定：防止 DOM 切换时弹窗塌缩，切换后瞬间扩展（新内容淡入盖过）
const animateStageSwitch = async (fromSelector, toSelector, beforeSwitch) => {
  if (isTransitioning.value) return
  isTransitioning.value = true

  const dialogEl = dialogRef.value
  if (!dialogEl) { isTransitioning.value = false; return }

  // 1. 锁定 min-height 防止弹窗塌缩，overflow 防溢出
  const currentHeight = dialogEl.offsetHeight
  dialogEl.style.minHeight = currentHeight + 'px'
  dialogEl.style.overflow = 'hidden'

  // 2. 旧内容淡出（仅 GPU 属性：opacity + scale + translateY）
  const oldEl = dialogEl.querySelector(fromSelector)
  if (oldEl) {
    await new Promise((resolve) => {
      gsap.to(oldEl, {
        opacity: 0, scale: 0.95, y: -12,
        duration: 0.2, ease: 'power2.in',
        onComplete: resolve,
      })
    })
  }

  // 3. 切换 stage / 重置数据
  if (beforeSwitch) beforeSwitch()
  await nextTick()

  // 4. 释放 min-height，弹窗瞬间扩展到新内容高度（不可见：新内容 opacity 仍为 0）
  dialogEl.style.minHeight = ''

  // 5. 新内容预隐藏 + 淡入（仅 GPU 属性）
  const newEl = dialogEl.querySelector(toSelector)
  if (newEl) {
    gsap.set(newEl, { opacity: 0, scale: 0.95, y: 12 })
  }

  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        dialogEl.style.overflow = ''
        isTransitioning.value = false
        resolve()
      },
    })
    if (newEl) {
      tl.to(newEl, {
        opacity: 1, scale: 1, y: 0,
        duration: 0.4, ease: 'back.out(1.2)',
      }, 0)
    }
  })
}

// Pick → Crop（initPosition 在 beforeSwitch 内立即执行，确保渲染时 translate/zoom 已正确）
const transitionToCrop = async () => {
  await animateStageSwitch('.avc-pick', '.avc-crop-stage', () => {
    stage.value = 'crop'
    initPosition()
  })
}
const handleFile = (file) => {
  if (!file) return
  const allowed = ['image/jpeg', 'image/png']
  if (!allowed.includes(file.type)) {
    console.warn('[AvatarCropper] 不支持的格式:', file.type)
    return
  }
  sourceFile.value = file
  const reader = new FileReader()
  reader.onload = (ev) => {
    const img = new Image()
    img.onload = () => {
      sourceImage.value = img
      sourceDataUrl.value = ev.target.result
      transitionToCrop()
    }
    img.src = ev.target.result
  }
  reader.readAsDataURL(file)
}

const onFileInput = (e) => {
  const file = e.target.files?.[0]
  handleFile(file)
  // 重置 input 以允许重复选择同一文件
  e.target.value = ''
}

// ── 拖放上传 ──
const isDragOver = ref(false)
const dragCounter = ref(0)  // 处理嵌套元素触发的多次 enter/leave

const onDragEnter = (e) => {
  e.preventDefault()
  dragCounter.value++
  if (dragCounter.value === 1) isDragOver.value = true
}
const onDragOver = (e) => { e.preventDefault() }
const onDragLeave = (e) => {
  e.preventDefault()
  dragCounter.value--
  if (dragCounter.value <= 0) {
    dragCounter.value = 0
    isDragOver.value = false
  }
}
const onDrop = (e) => {
  e.preventDefault()
  isDragOver.value = false
  dragCounter.value = 0
  const file = e.dataTransfer?.files?.[0]
  handleFile(file)
}

// ── 裁剪输出 ──
const doCrop = () => {
  if (!sourceImage.value) return null

  const img = sourceImage.value
  const size = cropSize.value

  // zoom 已包含初始适配比例，可直接用于坐标换算
  const sx = -translate.x / zoom.value
  const sy = -translate.y / zoom.value
  const sw = size / zoom.value
  const sh = size / zoom.value

  const canvas = document.createElement('canvas')
  canvas.width = props.outputSize
  canvas.height = props.outputSize
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, props.outputSize, props.outputSize)

  return canvas
}

const confirm = () => {
  if (isProcessing.value) return
  isProcessing.value = true

  const canvas = doCrop()
  if (!canvas) { isProcessing.value = false; return }

  canvas.toBlob((blob) => {
    // 生成预览
    previewUrl.value = URL.createObjectURL(blob)

    emit('confirm', {
      blob,
      file: sourceFile.value,
      dataUrl: canvas.toDataURL('image/png'),
      width: props.outputSize,
      height: props.outputSize,
    })
    closeDialog()
  }, 'image/png', 0.95)
}

const cancel = () => {
  emit('cancel')
  closeDialog()
}

// 裁剪阶段返回选择图片（带动画过渡）
const goBack = async () => {
  await animateStageSwitch('.avc-crop-stage', '.avc-pick', () => {
    sourceImage.value = null
    sourceFile.value = null
    sourceDataUrl.value = ''
    zoom.value = 1
    translate.x = 0
    translate.y = 0
    stage.value = 'pick'
  })
}

// ── GSAP 动画 ──
const closeDialog = () => {
  if (!isVisible.value) return

  const tl = gsap.timeline({
    onComplete: () => {
      isVisible.value = false
      emit('update:show', false)
      emit('close')
      resetState()
    }
  })
  tl.to(dialogRef.value, { scale: 0.95, autoAlpha: 0, duration: 0.2, ease: 'power2.in' }, 0)
    .to(overlayRef.value, { autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, 0)
}

const showDialog = () => {
  if (isVisible.value) return
  isVisible.value = true

  nextTick(() => {
    if (!dialogRef.value || !overlayRef.value) return
    gsap.set(overlayRef.value, { autoAlpha: 0 })
    gsap.set(dialogRef.value, { scale: 0.9, autoAlpha: 0 })

    gsap.timeline()
      .to(overlayRef.value, { autoAlpha: 1, duration: 0.25, ease: 'power2.out' }, 0)
      .to(dialogRef.value, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'back.out(1.4)' }, 0.04)
  })
}

const resetState = () => {
  stage.value = 'pick'
  sourceImage.value = null
  sourceFile.value = null
  sourceDataUrl.value = ''
  zoom.value = 1
  translate.x = 0
  translate.y = 0
  isProcessing.value = false
  isTransitioning.value = false
  // 清理光标锁定状态（防止弹窗异常关闭时残留）
  dragging.value = false
  pointerLocked.value = false
  cursorDot.show = false
  document.body.classList.remove('avc-cursor-hidden')
}

// ── 监听 ──
watch(() => props.show, (v) => {
  if (v) showDialog()
  else if (isVisible.value) cancel()
})

const onOverlayClick = (e) => {
  // 忽略拖拽结束后的残余 click（触控板/鼠标拖拽到遮罩层上松开时触发）
  if (justDragged.value) {
    justDragged.value = false
    return
  }
  if (e.target === overlayRef.value) cancel()
}

// ── 生命周期 ──
onMounted(() => {
  if (props.show) showDialog()
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
})

onUnmounted(() => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  if (dialogRef.value) gsap.killTweensOf(dialogRef.value)
  if (overlayRef.value) gsap.killTweensOf(overlayRef.value)
})

defineExpose({ showDialog, cancel })
</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" ref="overlayRef" class="avc-overlay" @click="onOverlayClick">
      <div ref="dialogRef" class="avc-dialog" :style="dialogStyle" @click.stop>
        <!-- 标题栏 -->
        <div class="avc-header">
          <h3 class="avc-title">{{ dialogTitle }}</h3>
        </div>

        <!-- 阶段：选择图片 -->
        <div v-if="stage === 'pick'" class="avc-pick">
          <div
            class="avc-dropzone"
            :class="{ 'is-dragover': isDragOver }"
            @click="() => $refs.fileInput.click()"
            @dragenter="onDragEnter"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @drop="onDrop"
          >
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/>
              <path d="m21 15-5-5L5 21"/>
            </svg>
            <p class="avc-dropzone-hint">点击选择图片或拖放至此</p>
            <p class="avc-dropzone-sub">{{ dropzoneHint }}</p>
          </div>
          <input ref="fileInput" type="file" accept=".jpg,.jpeg,.png" class="avc-file-input" @change="onFileInput" />

          <!-- 一键操作按钮 -->
          <div class="avc-quick-actions">
            <button
              class="avc-quick-btn avc-quick-btn--reset"
              :disabled="isQuickAction"
              @click="handleResetDefault"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>{{ isQuickAction ? '处理中...' : '初始化头像' }}</span>
            </button>
            <button
              class="avc-quick-btn avc-quick-btn--bilibili"
              :class="{ 'avc-quick-btn--disabled': !hasBilibili }"
              :disabled="isQuickAction || !hasBilibili"
              @click="handleSyncBilibili"
            >
              <svg viewBox="0 0 1024 1024" width="16" height="16" fill="currentColor">
                <path d="M777.514667 131.669333a53.333333 53.333333 0 0 1 0 75.434667L728.746667 255.829333h49.92A160 160 0 0 1 938.666667 415.872v320a160 160 0 0 1-160 160H245.333333A160 160 0 0 1 85.333333 735.872v-320a160 160 0 0 1 160-160h49.749334L246.4 207.146667a53.333333 53.333333 0 1 1 75.392-75.434667l113.152 113.152c3.370667 3.370667 6.186667 7.04 8.448 10.965333h137.088c2.261333-3.925333 5.12-7.68 8.490667-11.008l113.109333-113.152a53.333333 53.333333 0 0 1 75.434667 0z m1.152 231.253334H245.333333a53.333333 53.333333 0 0 0-53.205333 49.365333l-0.128 4.010667v320c0 28.117333 21.76 51.157333 49.365333 53.162666l3.968 0.170667h533.333334a53.333333 53.333333 0 0 0 53.205333-49.365333l0.128-3.968v-320c0-29.44-23.893333-53.333333-53.333333-53.333334z m-426.666667 106.666666c29.44 0 53.333333 23.893333 53.333333 53.333334v53.333333a53.333333 53.333333 0 1 1-106.666666 0v-53.333333c0-29.44 23.893333-53.333333 53.333333-53.333334z m320 0c29.44 0 53.333333 23.893333 53.333333 53.333334v53.333333a53.333333 53.333333 0 1 1-106.666666 0v-53.333333c0-29.44 23.893333-53.333333 53.333333-53.333334z"></path>
              </svg>
              <span>{{ isQuickAction ? '处理中...' : '同步B站头像' }}</span>
            </button>
          </div>
        </div>

        <!-- 阶段：裁剪 -->
        <div v-else-if="stage === 'crop'" class="avc-crop-stage">
          <!-- 裁剪区域 -->
          <div
            ref="cropContainerRef"
            class="avc-crop-container"
            :class="{ 'pointer-locked': pointerLocked }"
            :style="{ width: cropSize + 'px', height: cropSize + 'px' }"
            @pointerdown="onCropPointerDown"
            @wheel.prevent="onWheel"
            @dragstart.prevent
          >
            <img v-if="sourceDataUrl" ref="imageRef" :src="sourceDataUrl" class="avc-crop-image" :style="imageStyle" draggable="false" />
            <!-- 裁剪框叠加层 -->
            <div class="avc-crop-frame"></div>
            <!-- 四角标记 -->
            <div class="avc-crop-corner avc-corner-tl"></div>
            <div class="avc-crop-corner avc-corner-tr"></div>
            <div class="avc-crop-corner avc-corner-bl"></div>
            <div class="avc-crop-corner avc-corner-br"></div>
            <!-- 锁定的光标圆点（模拟鼠标被限制在圆形内） -->
            <div v-show="cursorDot.show" class="avc-cursor-dot" :style="{ left: cursorDot.x + 'px', top: cursorDot.y + 'px' }"></div>
          </div>

          <!-- 缩放滑块 -->
          <div class="avc-zoom-bar">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              type="range"
              class="avc-zoom-slider"
              :min="minZoom"
              :max="maxZoom"
              :step="0.01"
              v-model.number="zoom"
            />
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="avc-actions">
          <button class="avc-btn avc-btn--no" :disabled="isTransitioning" @click="stage === 'pick' ? cancel() : goBack()">
            {{ stage === 'pick' ? '取消' : '返回' }}
          </button>
          <button
            v-if="stage === 'crop'"
            class="avc-btn avc-btn--yes"
            :disabled="isProcessing || isTransitioning"
            @click="confirm"
          >
            {{ isProcessing ? '处理中...' : '确认' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ── 遮罩 ── */
.avc-overlay {
  position: fixed;
  inset: 0;
  z-index: 11000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
}

/* ── 弹窗卡片 ── */
.avc-dialog {
  width: 420px;
  max-width: calc(100vw - 48px);
  padding: 28px 28px 24px;
  border-radius: 16px;
  background: #1a1a1a;
  border: 1px solid #333;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ── 标题 ── */
.avc-header { width: 100%; margin-bottom: 20px; }

.avc-title {
  font-size: 17px;
  font-weight: 600;
  color: #ffffff;
  text-align: center;
  margin: 0;
}

/* ── 选择阶段 ── */
.avc-pick { width: 100%; }

.avc-dropzone {
  width: 100%;
  height: 240px;
  border: 2px dashed #444;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  color: #666;
  transition: all 0.25s ease;
  background: rgba(255, 255, 255, 0.02);
}

.avc-dropzone:hover {
  border-color: #00A947;
  color: #00A947;
  background: rgba(0, 169, 71, 0.04);
}

.avc-dropzone-hint {
  font-size: 15px;
  color: #aaaaaa;
  margin: 0;
  font-weight: 500;
}

.avc-dropzone-sub {
  font-size: 12px;
  color: #666;
  margin: 0;
}

/* 拖拽悬停高亮 */
.avc-dropzone.is-dragover {
  border-color: #00A947;
  color: #00A947;
  background: rgba(0, 169, 71, 0.08);
  border-style: solid;
  box-shadow: 0 0 0 4px rgba(0, 169, 71, 0.1);
}

.avc-dropzone.is-dragover .avc-dropzone-hint {
  color: #00A947;
}

.avc-dropzone.is-dragover .avc-dropzone-sub {
  color: rgba(0, 169, 71, 0.6);
}

.avc-file-input { display: none; }

/* ── 一键操作按钮 ── */
.avc-quick-actions {
  width: 100%;
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.avc-quick-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 0;
  border-radius: 10px;
  border: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  color: #ffffff;
  transition: all 0.2s ease;
}

.avc-quick-btn:active {
  transform: scale(0.97);
}

.avc-quick-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.avc-quick-btn:disabled:active {
  transform: none;
}

/* 初始化头像：绿色 */
.avc-quick-btn--reset {
  background: #00A947;
}

.avc-quick-btn--reset:hover:not(:disabled) {
  filter: brightness(0.9);
}

/* 同步B站头像：B站粉 */
.avc-quick-btn--bilibili {
  background: #FB7299;
}

.avc-quick-btn--bilibili:hover:not(:disabled) {
  filter: brightness(0.9);
}

/* 未绑定B站时：灰色，不可交互 */
.avc-quick-btn--disabled {
  background: #444 !important;
  color: #888 !important;
  cursor: not-allowed !important;
}

/* ── 裁剪阶段 ── */
.avc-crop-stage {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.avc-crop-container {
  position: relative;
  overflow: hidden;
  border-radius: 50%;
  background: #0a0a0a;
  cursor: grab;
  touch-action: none;
  flex-shrink: 0;
}

.avc-crop-container:active { cursor: grabbing; }

/* 光标锁定：隐藏容器内真实光标（后备；实际由全局 .avc-cursor-hidden 控制） */
.avc-crop-container.pointer-locked { cursor: none; }

.avc-crop-image {
  position: absolute;
  top: 0;
  left: 0;
  max-width: none;
  will-change: transform;
}

/* ── 裁剪框 ── */
.avc-crop-frame {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

/* ── 四角标记 ── */
.avc-crop-corner {
  position: absolute;
  width: 20px;
  height: 20px;
  pointer-events: none;
}

.avc-corner-tl { top: -1px; left: -1px; border-top: 3px solid #00A947; border-left: 3px solid #00A947; border-radius: 4px 0 0 0; }
.avc-corner-tr { top: -1px; right: -1px; border-top: 3px solid #00A947; border-right: 3px solid #00A947; border-radius: 0 4px 0 0; }
.avc-corner-bl { bottom: -1px; left: -1px; border-bottom: 3px solid #00A947; border-left: 3px solid #00A947; border-radius: 0 0 0 4px; }
.avc-corner-br { bottom: -1px; right: -1px; border-bottom: 3px solid #00A947; border-right: 3px solid #00A947; border-radius: 0 0 4px 0; }

/* ── 缩放条 ── */
.avc-zoom-bar {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 4px;
  color: #888;
}

.avc-zoom-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  background: #333;
  outline: none;
  cursor: pointer;
}

.avc-zoom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #00A947;
  border: 2px solid #1a1a1a;
  cursor: pointer;
  box-shadow: 0 0 8px rgba(0, 169, 71, 0.4);
}

.avc-zoom-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #00A947;
  border: 2px solid #1a1a1a;
  cursor: pointer;
  box-shadow: 0 0 8px rgba(0, 169, 71, 0.4);
}

/* ── 光标锁定时模拟圆点 ── */
.avc-cursor-dot {
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(0, 169, 71, 0.35);
  border: 2px solid rgba(0, 169, 71, 0.75);
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: 20;
  box-shadow: 0 0 12px rgba(0, 169, 71, 0.35);
  transition: width 0.1s ease, height 0.1s ease, background 0.1s ease;
}

/* ── 按钮区 ── */
.avc-actions {
  width: 100%;
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.avc-btn {
  flex: 1;
  padding: 10px 0;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.avc-btn--no {
  background: rgba(255, 255, 255, 0.08);
  color: #cecece;
}

.avc-btn--no:hover { background: rgba(255, 255, 255, 0.14); }
.avc-btn--no:active { transform: scale(0.97); }

.avc-btn--yes {
  background: #00A947;
  color: #ffffff;
}

.avc-btn--yes:hover { filter: brightness(0.9); }
.avc-btn--yes:active { transform: scale(0.97); }
.avc-btn--yes:disabled { opacity: 0.5; cursor: not-allowed; filter: none; }
.avc-btn--yes:disabled:active { transform: none; }

/* ── 响应式 ── */
@media (max-width: 480px) {
  .avc-dialog { padding: 20px 16px 16px; }
  .avc-dropzone { height: 180px; }
  .avc-actions { flex-direction: column-reverse; gap: 8px; }
}
</style>

<!-- 全局光标隐藏（非 scoped，拖拽时隐藏页面所有光标） -->
<style>
.avc-cursor-hidden,
.avc-cursor-hidden * {
  cursor: none !important;
}
</style>
