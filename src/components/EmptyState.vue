<script setup>
import { onMounted, ref } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  icon: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  actionText: { type: String, default: '' },
})

const emit = defineEmits(['action'])

const containerRef = ref(null)

onMounted(() => {
  if (containerRef.value) {
    gsap.fromTo(containerRef.value, 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    )
  }
})
</script>

<template>
  <div ref="containerRef" class="empty-state">
    <div class="empty-icon" v-html="icon"></div>
    <h3 class="empty-title">{{ title }}</h3>
    <p v-if="description" class="empty-desc">{{ description }}</p>
    <button 
      v-if="actionText" 
      class="empty-action"
      @click="emit('action')"
    >
      {{ actionText }}
    </button>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
  color: rgba(255, 255, 255, 0.12);
  transition: color 0.3s ease;
}

.empty-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.empty-state:hover .empty-icon {
  color: rgba(255, 255, 255, 0.2);
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 8px;
  letter-spacing: 0.3px;
}

.empty-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.3);
  margin: 0 0 28px;
  line-height: 1.6;
  max-width: 320px;
}

.empty-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: 8px;
  color: #000000;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.empty-action:hover {
  background: var(--color-primary);
  color: #000000;
  transform: translateY(-1px);
}

.empty-action:active {
  transform: translateY(0);
}
</style>
