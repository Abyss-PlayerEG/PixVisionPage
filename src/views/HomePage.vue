<!--
登录跳转测试页面
-->

<script setup lang="js">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref('');

onMounted(() => {
  // 从 localStorage 获取用户信息
  const userInfoStr = localStorage.getItem('userInfo');
  console.log('HomePage 加载，localStorage 中的 userInfo:', userInfoStr);
  
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr);
      console.log('解析后的用户信息:', userInfo);
      // 优先显示昵称，如果没有则显示用户名
      username.value = userInfo.nickname || userInfo.username || '用户';
      console.log('当前登录用户:', username.value);
    } catch (error) {
      console.error('解析用户信息失败:', error);
      username.value = '用户';
    }
  } else {
    // 如果没有用户信息，跳转到登录页
    console.warn('未找到用户信息，跳转到登录页');
    console.log('localStorage 中的所有键:', Object.keys(localStorage));
    router.push('/login');
  }
});

// 退出登录
const handleLogout = () => {
  // 清除本地存储
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  console.log('已退出登录');
  
  // 跳转到登录页
  router.push('/login');
};
</script>

<template>
  <div class="home-page">
    <h1>欢迎，{{ username }}！</h1>
    <p>您已成功登录</p>
    <button @click="handleLogout">退出登录</button>
  </div>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

button {
  padding: 12px 32px;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}
</style>