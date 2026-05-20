<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

// 配置常量
const HDcont = 1900; // 滚动阈值，可在此处修改

const isScrolled = ref(false);
const isHovered = ref(false);
let scrollListener = null;
let mouseEnterTimer = null;
let mouseLeaveTimer = null;

// 导航菜单相关状态
const activeMenuIndex = ref(-1); // 当前激活的菜单索引，-1表示未激活
const isDropdownVisible = ref(false); // 下拉菜单是否可见
const dropdownContent = ref(''); // 下拉菜单内容
const hoveredBtnIndex = ref(-1); // hover状态的按钮索引
const showUnderline = ref(false); // 控制白色横条显示（需要等待背景加载完成）

// 计算属性：背景是否应该显示
const shouldShowBg = computed(() => {
  return isScrolled.value || isHovered.value || isDropdownVisible.value;
});

// 菜单配置
const menuItems = [
  { label: '资源总览', content: '这里是资源总览的内容区域' },
  { label: '创作中心', content: '这里是创作中心的内容区域' },
  { label: '关于我们', content: '这里是关于我们的内容区域' }
];

// 监听页面滚动
const handleScroll = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  isScrolled.value = scrollTop > HDcont;
};

// 鼠标移入导航栏
const handleMouseEnter = () => {
  // 清除离开定时器（防止闪烁）
  if (mouseLeaveTimer) {
    clearTimeout(mouseLeaveTimer);
    mouseLeaveTimer = null;
  }
  
  // 立即设置 hover 状态（背景会自动显示）
  isHovered.value = true;
  
  // 延迟显示横条，确保背景已经加载完成
  setTimeout(() => {
    showUnderline.value = true;
  }, 150);
};

// 鼠标移出导航栏
const handleMouseLeave = () => {
  // 清除进入定时器（如果还在延迟期内就移出）
  if (mouseEnterTimer) {
    clearTimeout(mouseEnterTimer);
    mouseEnterTimer = null;
  }
  
  // 立即隐藏横条
  showUnderline.value = false;
  
  // 立即取消 hover 状态（背景会根据其他状态决定是否隐藏）
  isHovered.value = false;
};

// 点击左侧标题回到顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

// 处理菜单项点击
const handleMenuClick = (index) => {
  const menuItem = menuItems[index];
  
  if (!isDropdownVisible.value) {
    // 首次打开：播放展开动画
    activeMenuIndex.value = index;
    dropdownContent.value = menuItem.content;
    isDropdownVisible.value = true;
    showUnderline.value = true; // 确保横条显示
  } else {
    // 已打开：直接切换内容（不重新播放动画）
    if (activeMenuIndex.value !== index) {
      activeMenuIndex.value = index;
      dropdownContent.value = menuItem.content;
    }
  }
};

// 关闭下拉菜单
const closeDropdown = () => {
  // 立即关闭选项卡
  isDropdownVisible.value = false;
  activeMenuIndex.value = -1;
  dropdownContent.value = '';
  showUnderline.value = false;
  
  // 背景会根据 shouldShowBg 自动重新计算：
  // - 如果在顶部区域且没有hover → 背景收起
  // - 如果在内容区域（isScrolled=true）→ 背景保持
  // - 如果有hover → 背景保持
};

// 处理按钮hover
const handleBtnHover = (index) => {
  hoveredBtnIndex.value = index;
};

// 处理按钮离开
const handleBtnLeave = () => {
  hoveredBtnIndex.value = -1;
};

onMounted(() => {
  // 检查初始滚动位置
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  isScrolled.value = scrollTop > HDcont;
  
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
        <div class="main_bg" :class="{ 'bg-visible': shouldShowBg }"></div>
        
        <!-- 左侧标题 -->
        <div class="navTag n1_logo" @click="scrollToTop">Pixel - Vision</div>

        <!-- 中部资源导航 -->
        <section class="navTag n2_link">
            <div 
                v-for="(item, index) in menuItems" 
                :key="index"
                class="n2_btn_wrapper"
                @mouseenter="handleBtnHover(index)"
                @mouseleave="handleBtnLeave"
            >
                <div 
                    class="n2_btn" 
                    :class="{ 'active': activeMenuIndex === index }"
                    @click="handleMenuClick(index)"
                >
                    {{ item.label }}
                </div>
                <div 
                    class="underline" 
                    :class="{ 
                        'visible': activeMenuIndex === index,
                        'hover-visible': hoveredBtnIndex === index && activeMenuIndex !== index && showUnderline
                    }"
                ></div>
            </div>
            <div class="search_btn"></div>
        </section>

        <!-- 右侧个人选项 -->
        <section class="navTag n3_cont">
            <div class="show_zone"></div>
            <div class="login_btn" @click="$router.push('/login')">JoinUs</div>
        </section>
    </section>

    <!-- 玻璃遮罩层 - 独立于导航栏 -->
    <transition name="overlay">
        <div v-if="isDropdownVisible" class="overlay" @click="closeDropdown"></div>
    </transition>

    <!-- 下拉选项卡 - 独立于导航栏 -->
    <transition name="dropdown">
        <div v-if="isDropdownVisible" class="dropdown-menu">
            <div class="dropdown-content">
                {{ dropdownContent }}
            </div>
        </div>
    </transition>
</template>

<style scoped>
.main{
    position:fixed;
    z-index: 1000;
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
    background-color: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    z-index: -1;
    
    /* 默认状态：在可视区域外 */
    transform: translateY(-100%);
    transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
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
    cursor: pointer;
    transition: opacity 0.3s ease;
}

.n1_logo:hover {
    opacity: 0.8;
}

.n2_link{
    /* border:2px solid #8edc93; */
    width: 700px;
    height: 50px;
    line-height: 50px;
    display: flex;
}

.n2_btn_wrapper {
    position: relative;
    margin-right: 50px;
}

.n2_btn{
    color: #fff;
    font-size: clamp(16px,18px,20px) ;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0 10px;
}

.n2_btn:hover {
    opacity: 0.8;
}

.n2_btn.active {
    opacity: 1;
}

/* 白色横条 - 从左到右展开 */
.underline {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background-color: #cecece;
    transition: width 0.3s ease, background-color 0.3s ease;
}

/* 点击后固定显示（纯白色） */
.underline.visible {
    width: 100%;
    background-color: #fff;
}

/* hover时显示（仅当未激活且背景已加载时，灰色） */
.underline.hover-visible {
    width: 100%;
    background-color: #cecece;
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
    /* background: rgba(255, 255, 255, 0.15);  */
    border: 1px solid rgba(255, 255, 255, 0.3); /* 玻璃边 */
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1); /* 柔光阴影 */
}

.login_btn:hover{ 
    color: rgba(255, 255, 255);
    border: 1px solid rgba(255, 255, 255);
}

/* 玻璃遮罩层 - 层级低于导航栏 */
.overlay {
    position: fixed;
    top: 50px;
    left: 0;
    width: 100%;
    height: calc(100vh - 50px);
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    z-index: 998;
}

/* 遮罩过渡动画 */
.overlay-enter-active,
.overlay-leave-active {
    transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
    opacity: 0;
}

.overlay-enter-to,
.overlay-leave-from {
    opacity: 1;
}

/* 下拉菜单样式 - 层级低于导航栏 */
.dropdown-menu {
    position: fixed;
    top: 50px;
    left: 0;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 999;
    padding: 40px 5%;
    min-height: 300px;
}

.dropdown-content {
    color: #fff;
    font-size: 18px;
    max-width: 1200px;
    margin: 0 auto;
}

/* 下拉菜单过渡动画 - 从上到下 */
.dropdown-enter-active,
.dropdown-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-50px);
}

.dropdown-enter-to,
.dropdown-leave-from {
    opacity: 1;
    transform: translateY(0);
}
</style>