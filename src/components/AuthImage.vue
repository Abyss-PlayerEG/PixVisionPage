<template>
  <img v-if="src" :src="src" :alt="alt" :class="className" @error="onError" />
  <div v-else class="auth-img-placeholder" :class="className"></div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { fetchAuthImage } from '@/utils/adminHelpers'

const props = defineProps({
  url: { type: String, default: '' },
  alt: { type: String, default: '' },
  className: { type: String, default: '' },
})

const src = ref('')

const loadImage = async () => {
  if (!props.url) {
    src.value = ''
    return
  }
  src.value = await fetchAuthImage(props.url)
}

const onError = () => {
  src.value = ''
}

watch(() => props.url, loadImage)
onMounted(loadImage)
</script>

<style scoped>
.auth-img-placeholder {
  background: rgba(255, 255, 255, 0.1);
}
</style>
