<script setup>
import "@/composables/mainIndex.js"
import { useRouter } from "vue-router"

//组件引用
import NavBar from "@/components/NavBar.vue";

//依赖申明
const router = useRouter()

//====功能实现===============================================
//0.滚到顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script>

<template>
    <section id="num1z">
        <NavBar/>
        <video src="../assets/Video/灰质海滩.mp4"
        autoplay
        muted
        loop
        playsinline
        disablePictureInPicture
        controlslist="nodownload nofullscreen noremoteplayback"></video>
    </section>

    <section id="Bg">
        <img 
          src="../assets/IMG/dark.jpg" 
          alt="" 
        >

        <div class="round"></div>
        <div class="round"></div>
        <div class="round"></div>

        <section id="titleSlider">
            <div class="title1">
                <p>加入我们，成为美的缔造者</p>
                <p>Join us and become a creator of beauty.</p>
            </div>
            <div class="title2">
                <div class="button" @click="scrollToTop()">Back</div>
                <div class="button" @click="()=>router.push('/login')">Login</div>
                <div class="button" @click="()=>router.push('/login')">Join</div>
            </div>
        </section>
    </section>
    
</template>

<style>
@import url(../assets/CSS/mainIndex.css);
</style>