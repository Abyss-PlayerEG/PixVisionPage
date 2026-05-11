<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isScrolled = ref(false);
const isHovered = ref(false);
let scrollListener = null;
let mouseEnterTimer = null;
let mouseLeaveTimer = null;

// 监听页面滚动
const handleScroll = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  
  if (scrollTop > 900) {
    isScrolled.value = true;
  } else {
    // 滚回顶部
    isScrolled.value = false;
  }
};

// 鼠标移入导航栏
const handleMouseEnter = () => {
  // 清除离开定时器（防止闪烁）
  if (mouseLeaveTimer) {
    clearTimeout(mouseLeaveTimer);
    mouseLeaveTimer = null;
  }
  
  // 延迟显示背景，避免过于灵敏
  mouseEnterTimer = setTimeout(() => {
    isHovered.value = true;
    mouseEnterTimer = null;
  }, 100);
};

// 鼠标移出导航栏
const handleMouseLeave = () => {
  // 清除进入定时器（如果还在延迟期内就移出）
  if (mouseEnterTimer) {
    clearTimeout(mouseEnterTimer);
    mouseEnterTimer = null;
  }
  
  // 延迟隐藏，避免快速移动时的闪烁
  mouseLeaveTimer = setTimeout(() => {
    isHovered.value = false;
    mouseLeaveTimer = null;
  }, 150); // 150ms延迟
};

onMounted(() => {
  // 检查初始滚动位置
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  if (scrollTop > 50) {
    isScrolled.value = true;
  }
  
  scrollListener = window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  if (scrollListener) {
    window.removeEventListener('scroll', handleScroll);
  }
  if (mouseEnterTimer) {
    clearTimeout(mouseEnterTimer);
  }
  if (mouseLeaveTimer) {
    clearTimeout(mouseLeaveTimer);
  }
});
</script>

<template>
    <section class="main" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
        <div class="main_bg" :class="{ 'bg-visible': isScrolled || isHovered }"></div>
        <!-- 左侧标题 -->
        <div class="navTag n1_logo">Pixel - Vision</div>

        <!-- 中部资源导航 -->
        <section class="navTag n2_link">
            <div class="n2_btn">资源总览</div>
            <div class="n2_btn">创作中心</div>
            <div class="n2_btn">关于我们</div>
            <div class="search_btn"></div>
        </section>

        <!-- 右侧个人选项 -->
        <section class="navTag n3_cont">
            <div class="show_zone"></div>
            <div class="login_btn">JoinUs</div>
        </section>
    </section>
</template>

<style scoped>
.main{
    position:fixed;
    z-index: 999;
    width: 100%;
    height: 100px;
    padding-bottom: 50px;

    display: flex;
    padding:0 5%;
}

/* 独立的黑色背景色块 */
.main_bg{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 50px;
    background-color: rgba(26, 26, 26, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
    z-index: -1;
    
    /* 默认状态：在可视区域外 */
    transform: translateY(-100%);
    transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* 显示状态：滑入可视区域 */
.main_bg.bg-visible{
    transform: translateY(0);
}

.navTag{
    /* border:2px solid #8edc93; */
    height: 100%;
    position: relative;
    z-index: 1; /* 确保文字在背景之上 */
}

.n1_logo{
    font-family: "华文琥珀";
    width:200px;
    height: 50px;
    line-height: 50px;
    color:#fff;
    font-size: clamp(20px,30px,50px) ;
    margin-right: 20px;
}

.n2_link{
    /* border:2px solid #8edc93; */
    width: 700px;
    height: 50px;
    line-height: 50px;
    display: flex;
}

.n2_btn{
    color: #fff;
    font-size: clamp(16px,18px,20px) ;
    margin-right: 50px;
}

.n3_cont{
    /* border:2px solid #8edc93; */
    width: 400px;
    height: 50px;
    margin-left: auto;

    display: flex;
    justify-content: end;
    align-items: center;
}

.login_btn{
    width: 100px;
    height: 30px;
    margin-left: 10px;
    line-height: 30px;
    text-align: center;
    cursor: pointer;

    transition: all 0.3s ease;

    border-radius: 15px;
    color: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.15); 
    border: 1px solid rgba(255, 255, 255, 0.3); /* 玻璃边 */
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1); /* 柔光阴影 */
}

.login_btn:hover{ 
    color: rgba(255, 255, 255);
    border: 1px solid rgba(255, 255, 255);
}
</style>