<template>
  <nav class="ad-sidebar">
    <button
      v-for="item in navItems"
      :key="item.key"
      class="ad-nav-item"
      :class="{ active: activeTab === item.key }"
      @click="$emit('switchTab', item.key)"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path :d="item.icon"/>
      </svg>
      {{ item.label }}
    </button>
  </nav>
</template>

<script setup>
defineProps({
  activeTab: { type: String, required: true },
  navItems: { type: Array, required: true },
})
defineEmits(['switchTab'])
</script>
