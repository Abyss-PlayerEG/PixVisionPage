<script setup></script>

<template>
    <section class="main">
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
        <section class="navTag n3_cont"></section>
    </section>
</template>

<style scoped>
.main{
    position:fixed;
    z-index: 999;

    width: 100%;
    height: 50px;

    display: flex;
    padding:0 5%;
    background-color: #0d0d0d;
}

.navTag{
    /* border:2px solid #8edc93; */
    height: 100%;
}

.n1_logo{
    font-family: "华文琥珀";
    width:200px;
    min-height: 50px;
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
    border:2px solid #8edc93;
    width: 400px;
    margin-left: auto;
   }
</style>