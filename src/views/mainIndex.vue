<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from "vue-router"

//组件引用
import NavBar from "@/components/NavBar.vue";
import Waterfall from "@/components/Waterfall.vue";

// 引入 composable
import { useCopyAnimation, useArrowAnimation } from "@/composables/mainIndex.js"

//依赖申明
const router = useRouter()

// 初始化文案动画
const { initCopyAnimation, cleanupCopyAnimation } = useCopyAnimation()

// 初始化箭头动画
const { triggerArrowAnimation, cleanupArrowAnimation } = useArrowAnimation()

onMounted(() => {
  // 启动文案动画
  initCopyAnimation()
})

onUnmounted(() => {
  // 清理动画和定时器
  cleanupCopyAnimation()
  cleanupArrowAnimation()
})
</script>

<template>
    <NavBar/>
    
    <section id="num1z">
        <div class="n1_showzone">
            <!-- 01.视频背景 -->
            <video src="../assets/Video/灰质海滩.mp4"
            autoplay
            muted
            loop
            playsinline
            disablePictureInPicture
            controlslist="nodownload nofullscreen noremoteplayback"></video>
    
            <!-- 02.文案展示 -->
            <div class="n1_showCopy1"></div>
            <div class="n1_showCopy2"></div>
            <div class="n1_btn" @mouseenter="triggerArrowAnimation">
                <div class="n1_btn_arrow">
                    <svg t="1778551186497" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1800" width="20" height="20"><path d="M292.571429 209.334857a65.828571 65.828571 0 0 1 14.482285-41.472 55.881143 55.881143 0 0 1 82.870857-5.997714l321.462858 302.665143 5.485714 5.924571a66.194286 66.194286 0 0 1-5.485714 89.014857L389.851429 862.061714a51.492571 51.492571 0 0 1-17.334858 11.337143 60.489143 60.489143 0 0 1-21.284571 4.315429C318.829714 877.714286 292.571429 849.481143 292.571429 814.592V209.334857z" p-id="1801" fill="#e6e6e6"></path></svg>
                </div>
                <p>我们为什么要制作&nbsp;</p>
                <p>pixel - vision</p>
            </div>

            <!-- 03.跳转卡片 -->
            <!-- 04.介绍文案 -->
        </div>
    </section>

    <section id="num2z">
        <h1>abc</h1>
        <h1>abc</h1>
        <h1>abc</h1>
        <h1>abc</h1>
        <h1>abc</h1>
        <h1>abc</h1>
        <div class="water_fall">
            <!-- 距离顶部还有 200px 时就固定并开始水平滚动 -->
            <Waterfall :pin-offset-top="200" />
        </div>
    </section>

    <div style="height: 200vh;"></div>
</template>

<style>
@import url(../assets/CSS/mainIndex.css);
</style>