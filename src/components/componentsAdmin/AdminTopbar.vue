<template>
  <header class="ad-topbar">
    <div class="ad-logo" @click="$router.push('/')">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#00A947" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      <h1 class="ad-logo-title">PixelVision</h1>
      <span class="ad-logo-sub">管理后台</span>
    </div>
    <div class="ad-topbar-actions">
      <button class="ad-back-btn" @click="$router.push('/profile/me')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        返回个人主页
      </button>
      <button class="ad-logout-btn" @click="$emit('logout')">退出登录</button>
    </div>
  </header>
</template>

<script setup>
defineEmits(['logout'])
</script>
