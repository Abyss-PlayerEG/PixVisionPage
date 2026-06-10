<template>
  <div v-if="visible" class="image-viewer-overlay" @click.self="$emit('close')">
    <div class="image-viewer-container">
      <button class="image-viewer-close" @click="$emit('close')">&times;</button>
      
      <div class="image-viewer-content">
        <img v-if="imageSrc" :src="imageSrc" :alt="title" class="image-viewer-img" />
        <div v-else class="image-viewer-loading">加载中...</div>
      </div>

      <div class="image-viewer-info">
        <h3 class="image-viewer-title">{{ title || '未命名' }}</h3>
        <p v-if="subtitle" class="image-viewer-subtitle">{{ subtitle }}</p>
      </div>

      <div v-if="showActions" class="image-viewer-actions">
        <button 
          class="ad-action-btn ad-action-btn--approve" 
          :disabled="currentStatus === 10"
          @click="$emit('approve', 10)"
        >
          {{ currentStatus === 10 ? '已通过' : '通过' }}
        </button>
        <button 
          class="ad-action-btn ad-action-btn--warn" 
          :disabled="currentStatus === 30"
          @click="$emit('approve', 30)"
        >
          {{ currentStatus === 30 ? '已违规' : '不通过' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { fetchAuthImage } from '@/utils/adminHelpers'

const props = defineProps({
  visible: { type: Boolean, default: false },
  imageUrl: { type: String, default: '' },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  currentStatus: { type: Number, default: 20 },
  showActions: { type: Boolean, default: true },
})
defineEmits(['close', 'approve'])

const imageSrc = ref('')

const loadImage = async () => {
  if (!props.imageUrl) {
    imageSrc.value = ''
    return
  }
  imageSrc.value = await fetchAuthImage(props.imageUrl)
}

watch(() => props.imageUrl, loadImage)
watch(() => props.visible, (val) => {
  if (val) loadImage()
})
</script>

<style scoped>
.image-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.image-viewer-container {
  background: #1a1a2e;
  border-radius: 12px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.image-viewer-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  font-size: 24px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.image-viewer-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.image-viewer-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  max-height: 70vh;
  overflow: hidden;
}

.image-viewer-img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.image-viewer-loading {
  position: absolute;
  color: #888;
  font-size: 14px;
}

.image-viewer-info {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.image-viewer-title {
  color: white;
  font-size: 16px;
  margin: 0 0 4px 0;
}

.image-viewer-subtitle {
  color: #888;
  font-size: 13px;
  margin: 0;
}

.image-viewer-actions {
  padding: 16px 20px;
  display: flex;
  gap: 12px;
  justify-content: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.image-viewer-actions .ad-action-btn {
  flex: 1;
  max-width: 150px;
}

.image-viewer-actions .ad-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
