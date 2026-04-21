<script setup></script>

<template>
    <section class="main">
        <div class="navTag n1_logo">Pixel - Vision</div>
        <div class="navTag n2_link"></div>
        <div class="navTag n3_cont"></div>
    </section>
</template>

<style scoped>
.main{
    position:fixed;
    z-index: 999;

    width: 100%;
    height: 50px;

    display: flex;
    justify-content: space-between;
    padding:0 5%;
    background-color: #0d0d0d;
}

.navTag{
    /* border:2px solid #8edc93; */
    height: 100%;
}

.n1_logo{
    width:300px;
    color:#fff;
    font-size: clamp(20px,30px,50px) ;
}

.n2_link{
    width: 700px;
}

.n3_cont{
    width: 400px;
}
</style>