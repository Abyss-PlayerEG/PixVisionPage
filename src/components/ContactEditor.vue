<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { addUserData, deleteUserData } from '@/api/userDataApi.js'
import { showError } from '@/utils/notification.js'

const props = defineProps({
  show: { type: Boolean, default: false },
  contacts: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:show', 'saved'])

// 支持的平台类型（按顺序展示图标）
const platformTypes = ['电话', '邮箱', 'QQ', '微信', 'Bilibili']

// 平台图标映射（小尺寸 SVG）
const platformIcons = {
  '电话': {
    viewBox: '0 0 24 24',
    paths: ['M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'],
    stroke: true,
  },
  '邮箱': {
    viewBox: '0 0 24 24',
    paths: ['M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z', 'M22 6 12 13 2 6'],
    stroke: true,
  },
  'QQ': {
    viewBox: '0 0 1024 1024',
    paths: ['M512 188.384c194.752 0 204.64 173.984 215.36 208.256 0 0 15.36 17.12 19.008 43.232 2.368 16.864-7.232 36-7.232 36s62.24 83.872 62.24 149.76c0 41.12-12.128 62.368-26.24 62.368-14.272 0-35.008-43.52-35.008-43.52s-32.512 69.408-48.768 79.392c-16.224 9.888 58.624 20.768 58.624 53.12 0 32.512-59.488 46.88-108.096 46.88-48.768 0-126.272-25.248-126.272-25.248l-28-0.864s-21.6 30.624-110.88 30.624c-89.248 0-128-24.256-128-53.12 0-38.88 56.896-44.16 56.896-44.16s-36.256-10.112-66.88-95.84c0 0-21.248 46.24-51.264 46.24 0 0-12.608-7.52-12.608-49.6 0-87.168 62.624-129.664 89.6-155.776 0 0-4.48-11.392-2.112-25.504 2.624-15.744 12-25.248 12-25.248s-3.52-18.88 9.632-34.112c2.624-42.4 33.28-202.88 228-202.88m0-64c-204.736 0-277.376 146.88-290.24 245.376-6.144 12-9.632 24.352-11.008 36a112.64 112.64 0 0 0-12.768 44.256c-35.488 32.608-87.104 88.224-87.104 181.856 0 64.992 23.872 92.768 44 104.64l15.008 8.96H189.12c-2.88 9.152-4.384 19.04-4.384 29.76 0 27.52 13.888 117.28 192 117.28 65.28 0 106.016-14.144 131.008-29.248 26.24 7.872 87.616 24.64 134.016 24.64 104.64 0 172.256-43.52 172.256-110.912 0-12-2.4-22.624-6.272-32.128 30.88-13.984 57.504-50.112 57.504-119.232 0-60.64-33.504-124.256-56.256-160.512 1.76-10.368 2.368-21.984 0.768-33.984a154.56 154.56 0 0 0-23.136-61.632l-0.736-3.744C752.384 205.504 660.128 124.384 512 124.384z'],
    stroke: false,
  },
  '微信': {
    viewBox: '0 0 1024 1024',
    paths: ['M767.818667 409.173333C867.338667 444.266667 938.666667 539.136 938.666667 650.666667c0 42.709333-10.496 83.978667-30.261334 120.842666-1.792 3.338667-4.992 8.928-9.696 16.96l14.613334 53.557334c6.506667 23.893333-15.402667 45.813333-39.296 39.296l-53.642667-14.634667-6.229333 3.669333A254.933333 254.933333 0 0 1 682.666667 906.666667c-77.994667 0-147.84-34.88-194.805334-89.888a352.608 352.608 0 0 1-56.64 4.554666c-63.338667 0-124.266667-16.853333-177.472-48.298666-1.834667-1.088-6.410667-3.733333-13.632-7.893334l-80.544 21.653334c-23.914667 6.432-45.76-15.573333-39.146666-39.434667l21.792-78.752a961.205333 961.205333 0 0 1-15.904-27.317333A336.384 336.384 0 0 1 85.333333 480c0-188.618667 154.965333-341.333333 345.888-341.333333 159.914667 0 297.984 108.010667 335.818667 259.296 0.949333 3.765333 1.173333 7.552 0.778667 11.2z m-68.106667-13.952C662.88 282.037333 555.178667 202.666667 431.221333 202.666667 275.434667 202.666667 149.333333 326.933333 149.333333 480c0 46.272 11.498667 90.837333 33.194667 130.698667 2.88 5.290667 10.176 17.706667 21.621333 36.746666a32 32 0 0 1 3.413334 25.013334l-10.517334 37.994666 39.232-10.549333a32 32 0 0 1 24.234667 3.146667c14.272 8.192 22.773333 13.098667 25.802667 14.890666A283.882667 283.882667 0 0 0 431.221333 757.333333c6.154667 0 12.288-0.192 18.389334-0.576A255.061333 255.061333 0 0 1 426.666667 650.666667c0-141.386667 114.613333-256 256-256 5.728 0 11.413333 0.192 17.045333 0.554666z m133.706667 397.056a32 32 0 0 1 3.338666-24.725333 996.672 996.672 0 0 0 15.242667-26.293333A190.997333 190.997333 0 0 0 874.666667 650.666667c0-106.037333-85.962667-192-192-192s-192 85.962667-192 192 85.962667 192 192 192a190.933333 190.933333 0 0 0 98.570666-27.2c2.208-1.322667 8.288-4.874667 18.517334-10.837334a32 32 0 0 1 24.522666-3.210666l12.565334 3.424-3.424-12.565334zM330.666667 426.666667a42.666667 42.666667 0 1 1 0-85.333334 42.666667 42.666667 0 0 1 0 85.333334z m192 0a42.666667 42.666667 0 1 1 0-85.333334 42.666667 42.666667 0 0 1 0 85.333334z m85.333333 202.666666a32 32 0 1 1 0-64 32 32 0 0 1 0 64z m149.333333 0a32 32 0 1 1 0-64 32 32 0 0 1 0 64z'],
    stroke: false,
  },
  'Bilibili': {
    viewBox: '0 0 1024 1024',
    paths: ['M777.514667 131.669333a53.333333 53.333333 0 0 1 0 75.434667L728.746667 255.829333h49.92A160 160 0 0 1 938.666667 415.872v320a160 160 0 0 1-160 160H245.333333A160 160 0 0 1 85.333333 735.872v-320a160 160 0 0 1 160-160h49.749334L246.4 207.146667a53.333333 53.333333 0 1 1 75.392-75.434667l113.152 113.152c3.370667 3.370667 6.186667 7.04 8.448 10.965333h137.088c2.261333-3.925333 5.12-7.68 8.490667-11.008l113.109333-113.152a53.333333 53.333333 0 0 1 75.434667 0z m1.152 231.253334H245.333333a53.333333 53.333333 0 0 0-53.205333 49.365333l-0.128 4.010667v320c0 28.117333 21.76 51.157333 49.365333 53.162666l3.968 0.170667h533.333334a53.333333 53.333333 0 0 0 53.205333-49.365333l0.128-3.968v-320c0-29.44-23.893333-53.333333-53.333333-53.333334z m-426.666667 106.666666c29.44 0 53.333333 23.893333 53.333333 53.333334v53.333333a53.333333 53.333333 0 1 1-106.666666 0v-53.333333c0-29.44 23.893333-53.333333 53.333333-53.333334z m320 0c29.44 0 53.333333 23.893333 53.333333 53.333334v53.333333a53.333333 53.333333 0 1 1-106.666666 0v-53.333333c0-29.44 23.893333-53.333333 53.333333-53.333334z'],
    stroke: false,
  },
}

// ── 格式校验规则（与后端正则一致）──
const formatRules = {
  '电话': { regex: /^1[3-9]\d{9}$/, hint: '11位手机号，以1开头' },
  '邮箱': { regex: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/, hint: 'xx@xx.xx 格式' },
  'QQ':   { regex: /^[1-9]\d{4,10}$/, hint: '5-11位数字，不能以0开头' },
  '微信':  { regex: /^[a-zA-Z0-9_-]{5,19}$/, hint: '5-20位，字母/数字/下划线/减号' },
  'Bilibili': { regex: /^\d{1,16}$/, hint: '1-16位纯数字UID' },
}

/**
 * 校验单行数据的格式，返回 null 表示通过，否则返回错误提示
 */
const validateRow = (row) => {
  const rule = formatRules[row.type]
  if (!rule) return null
  if (!rule.regex.test(row.value.trim())) {
    return `${row.type}格式不正确`
  }
  return null
}

// ── 状态 ──
const isVisible = ref(false)
const overlayRef = ref(null)
const dialogRef = ref(null)
const isSaving = ref(false)
const editingRows = ref([])

// 当前选中类型（用于标记哪些行已选择类型）
const usedTypes = () => editingRows.value.filter(r => r.type).map(r => r.type)

const initRows = () => {
  if (props.contacts && props.contacts.length > 0) {
    editingRows.value = props.contacts.map(c => ({
      id: c.id ?? c.user_data_id ?? c.data_id ?? null,
      type: c.user_data_name || c.type || '',
      value: c.user_data || c.value || '',
    }))
  } else {
    editingRows.value = [{ id: null, type: '', value: '' }]
  }
}

const addRow = () => {
  if (editingRows.value.length >= 5) return
  editingRows.value.push({ id: null, type: '', value: '' })
}

const removeRow = (index) => {
  editingRows.value.splice(index, 1)
}

const selectType = (rowIndex, type) => {
  // 如果点击已选中的类型，取消选择
  if (editingRows.value[rowIndex].type === type) {
    editingRows.value[rowIndex].type = ''
    return
  }
  editingRows.value[rowIndex].type = type
}

const save = async () => {
  if (isSaving.value) return

  // 校验：检查是否有未填完的行
  for (let i = 0; i < editingRows.value.length; i++) {
    const row = editingRows.value[i]
    if (!row.type || !row.value.trim()) {
      showError('请完善所有行的类型和内容后再保存')
      return
    }
  }

  // 过滤有效行
  const validRows = editingRows.value.filter(r => r.type && r.value.trim())
  if (validRows.length === 0) {
    showError('请至少添加一条完整的联系方式')
    return
  }

  // 格式校验
  for (const row of validRows) {
    const err = validateRow(row)
    if (err) {
      showError(err)
      return
    }
  }

  // ── Diff 比对：找出真正变化的数据 ──
  // 原始数据的类型-值签名集合
  const originalByKey = new Map()
  for (const c of props.contacts) {
    const key = `${c.user_data_name}::${c.user_data}`
    originalByKey.set(key, c.id ?? c.user_data_id ?? c.data_id)
  }

  // 当前编辑行的签名集合
  const currentKeys = new Set()
  for (const row of validRows) {
    currentKeys.add(`${row.type}::${row.value.trim()}`)
  }

  // 需要删除的 ID：原始中有但当前没有的
  const idsToDelete = []
  for (const [key, id] of originalByKey) {
    if (!currentKeys.has(key) && id != null) {
      idsToDelete.push(id)
    }
  }

  // 需要新增的行：当前中有但原始没有的
  const rowsToAdd = []
  for (const row of validRows) {
    const key = `${row.type}::${row.value.trim()}`
    if (!originalByKey.has(key)) {
      rowsToAdd.push(row)
    }
  }

  // 没有任何变化，直接关闭
  if (idsToDelete.length === 0 && rowsToAdd.length === 0) {
    emit('saved', validRows)
    closeDialog()
    return
  }

  isSaving.value = true

  try {
    // 批量删除移除的数据
    if (idsToDelete.length > 0) {
      const delResult = await deleteUserData(idsToDelete)
      if (!delResult.success) {
        showError(delResult.message || '删除失败')
        return
      }
    }

    // 逐条新增变化的数据
    for (const row of rowsToAdd) {
      const addResult = await addUserData(row.type, row.value.trim())
      if (!addResult.success) {
        showError(addResult.message || '保存失败')
        return
      }
    }

    emit('saved', validRows)
    closeDialog()
  } catch (error) {
    console.error('保存联系方式异常:', error)
  } finally {
    isSaving.value = false
  }
}

const cancel = () => {
  closeDialog()
}

// ── GSAP 动画 ──
const closeDialog = () => {
  if (!isVisible.value) return

  const tl = gsap.timeline({
    onComplete: () => {
      isVisible.value = false
      emit('update:show', false)
    }
  })
  tl.to(dialogRef.value, { scale: 0.95, autoAlpha: 0, duration: 0.2, ease: 'power2.in' }, 0)
    .to(overlayRef.value, { autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, 0)
}

const showDialog = () => {
  if (isVisible.value) return
  initRows()
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

const onOverlayClick = (e) => {
  if (e.target === overlayRef.value) cancel()
}

watch(() => props.show, (v) => {
  if (v) showDialog()
  else if (isVisible.value) cancel()
})

onMounted(() => {
  if (props.show) showDialog()
})

onUnmounted(() => {
  if (dialogRef.value) gsap.killTweensOf(dialogRef.value)
  if (overlayRef.value) gsap.killTweensOf(overlayRef.value)
})

defineExpose({ showDialog, cancel })
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      ref="overlayRef"
      class="ce-overlay"
      @click="onOverlayClick"
    >
      <div ref="dialogRef" class="ce-dialog" @click.stop>
        <!-- 标题 -->
        <h3 class="ce-title">编辑联系方式</h3>
        <p class="ce-subtitle">最多添加 5 条联系方式</p>

        <!-- 编辑行列表 -->
        <div class="ce-rows">
          <div
            v-for="(row, rowIndex) in editingRows"
            :key="rowIndex"
            class="ce-row"
          >
            <!-- 平台类型图标选择器 -->
            <div class="ce-type-icons">
              <button
                v-for="pt in platformTypes"
                :key="pt"
                class="ce-type-btn"
                :class="{
                  'ce-type-btn--active': row.type === pt,
                  'ce-type-btn--used': row.type !== pt && editingRows.some((r, i) => i !== rowIndex && r.type === pt),
                }"
                :disabled="row.type !== pt && editingRows.some((r, i) => i !== rowIndex && r.type === pt)"
                :title="pt"
                @click="selectType(rowIndex, pt)"
              >
                <svg
                  :viewBox="platformIcons[pt].viewBox"
                  width="20"
                  height="20"
                  :fill="platformIcons[pt].stroke ? 'none' : 'currentColor'"
                  :stroke="platformIcons[pt].stroke ? 'currentColor' : 'none'"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    v-for="(d, pi) in platformIcons[pt].paths"
                    :key="pi"
                    :d="d"
                  />
                </svg>
              </button>
            </div>

            <!-- 账号详情输入 -->
            <input
              v-model="row.value"
              class="ce-input"
              type="text"
              :placeholder="row.type === 'Bilibili' ? 'B站UID' : row.type ? '请输入' + row.type : '先选择类型'"
              :disabled="!row.type"
              maxlength="100"
            />

            <!-- 删除按钮 -->
            <button
              class="ce-remove"
              @click="removeRow(rowIndex)"
              title="删除此行"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- 新增一行 -->
        <button
          v-if="editingRows.length < 5"
          class="ce-add-row"
          @click="addRow"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>新增一行</span>
        </button>

        <!-- 底部按钮 -->
        <div class="ce-actions">
          <button class="ce-btn ce-btn--cancel" :disabled="isSaving" @click="cancel">取消</button>
          <button class="ce-btn ce-btn--save" :disabled="isSaving" @click="save">
            <svg v-if="isSaving" class="ce-spinner" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32" stroke-linecap="round">
                <animate attributeName="stroke-dashoffset" values="32;0" dur="0.8s" repeatCount="indefinite" />
              </circle>
            </svg>
            <span v-else>保存</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ── 遮罩 ── */
.ce-overlay {
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
.ce-dialog {
  width: 420px;
  max-width: calc(100vw - 48px);
  padding: 28px 24px 24px;
  border-radius: 16px;
  background: #1a1a1a;
  border: 1px solid #333;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.55);
}

/* ── 标题 ── */
.ce-title {
  font-size: 17px;
  font-weight: 600;
  color: #ffffff;
  text-align: center;
  margin: 0 0 4px;
}

.ce-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  text-align: center;
  margin: 0 0 20px;
}

/* ── 编辑行 ── */
.ce-rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 8px;
}

.ce-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  position: relative;
}

/* ── 平台类型图标选择器 ── */
.ce-type-icons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.ce-type-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1.5px solid transparent;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  transition: all 0.2s ease;
}

.ce-type-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
  border-color: rgba(255, 255, 255, 0.12);
}

.ce-type-btn--active {
  background: rgba(0, 169, 71, 0.12);
  border-color: rgba(0, 169, 71, 0.5);
  color: #00A947;
}

.ce-type-btn--active:hover {
  background: rgba(0, 169, 71, 0.18) !important;
  border-color: #00A947 !important;
  color: #00A947 !important;
}

.ce-type-btn--used:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}

/* ── 输入框 ── */
.ce-input {
  width: 100%;
  height: 38px;
  padding: 0 32px 0 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.ce-input:focus {
  border-color: rgba(0, 169, 71, 0.5);
}

.ce-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.ce-input:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ── 删除按钮 ── */
.ce-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.25);
  cursor: pointer;
  transition: all 0.2s ease;
}

.ce-remove:hover {
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
}

/* ── 新增一行 ── */
.ce-add-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 0;
  margin-top: 4px;
  background: transparent;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.35);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ce-add-row:hover {
  border-color: rgba(0, 169, 71, 0.4);
  color: #00A947;
  background: rgba(0, 169, 71, 0.05);
}

/* ── 底部按钮 ── */
.ce-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.ce-btn {
  flex: 1;
  padding: 10px 0;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.ce-btn--cancel {
  background: rgba(255, 255, 255, 0.08);
  color: #cecece;
}

.ce-btn--cancel:hover {
  background: rgba(255, 255, 255, 0.14);
}

.ce-btn--cancel:active {
  transform: scale(0.97);
}

.ce-btn--save {
  background: #00A947;
  color: #ffffff;
}

.ce-btn--save:hover {
  filter: brightness(0.9);
}

.ce-btn--save:active {
  transform: scale(0.97);
}

.ce-btn--save:disabled {
  opacity: 0.5;
  cursor: wait;
  filter: none;
}

.ce-btn:disabled:active {
  transform: none;
}

.ce-spinner {
  animation: ce-spin 1s linear infinite;
}

@keyframes ce-spin {
  to { transform: rotate(360deg); }
}

/* ── 响应式 ── */
@media (max-width: 480px) {
  .ce-dialog {
    padding: 20px 16px 16px;
  }

  .ce-type-btn {
    width: 36px;
    height: 36px;
  }

  .ce-type-icons {
    gap: 6px;
  }
}
</style>
