<script setup>
import { useLoginView } from "../assets/JS/loginView.js";

const {
  router,
  bgimg,
  title1,
  title2,
  loginFormZone,
  loginForm,
  fieldStates,
  showLoginPanel,
  hideLoginPanel,
  validateField,
  handleLogin,
} = useLoginView();
</script>

<template>
  <section id="Bg">
    <img src="../assets/IMG/dark.jpg" alt="" ref="bgimg"/>

    <div class="round"></div>
    <div class="round"></div>
    <div class="round"></div>

    <!-- 登录面板 -->
    <section id="loginFormZone" ref="loginFormZone">
      <div class="lfz_titile">-&nbsp;Login&nbsp;-</div>
      <div class="auth_inputarea" :class="fieldStates.usernameOrEmail.status">
        <svg t="1775718259433" class="icon" viewBox="0 0 1126 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1676" width="20" height="20"><path d="M792.576 379.392a25.6 25.6 0 0 0 25.2928 25.8048h283.2384A25.6 25.6 0 0 0 1126.4 379.392a25.6 25.6 0 0 0-25.2928-25.8048h-283.2384a25.6 25.6 0 0 0-25.344 25.8048z m303.9232 80.7424H761.856c-16.5376 0-29.9008 11.6224-29.9008 25.7536 0 14.1824 13.312 25.7536 29.9008 25.7536h334.6432c16.4864 0 29.9008-11.5712 29.9008-25.7536 0-14.1312-13.4144-25.7536-29.9008-25.7536z m4.608 106.496h-283.2384a25.6 25.6 0 0 0-25.344 25.7536 25.6 25.6 0 0 0 25.344 25.7536h283.2384A25.6 25.6 0 0 0 1126.4 592.384a25.6 25.6 0 0 0-25.2928-25.8048zM543.0272 1024H341.6576C150.8352 1024 0 1024 0 923.648v-20.1216c0-188.16 153.2928-341.1968 341.7088-341.1968h201.2672c188.416 0 341.76 153.0368 341.76 341.1968v20.0704C884.6848 1024 726.3232 1024 542.976 1024z m-203.1616-405.1456c-158.464 0-287.4368 128.4096-287.4368 286.208v20.48c0 40.9088 166.0928 40.9088 287.4368 40.9088h204.9536c100.4544 0 287.4368 0 287.4368-40.96v-20.3776c0-157.8496-128.9728-286.208-287.4368-286.208H339.8656z m92.416-76.7488a271.4112 271.4112 0 0 1-271.2064-271.0528A271.36 271.36 0 0 1 432.2816 0a271.36 271.36 0 0 1 271.2064 271.0528 271.4624 271.4624 0 0 1-271.2064 271.0528z m-215.3472-271.872c0 118.1696 96.6144 214.3232 215.3472 214.3232 118.784 0 215.3984-96.1536 215.3984-214.3232 0-118.2208-96.6144-214.3232-215.3984-214.3232S216.9344 152.0128 216.9344 270.2336z" fill="#939393" p-id="1677"></path></svg>
        <input type="text" v-model="loginForm.usernameOrEmail" @blur="validateField('usernameOrEmail')" placeholder="请输入用户名/邮箱">
        <span class="error-msg">{{ fieldStates.usernameOrEmail.message }}</span>
      </div>
      <div class="auth_inputarea" :class="fieldStates.password.status">
        <svg t="1775718313591" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2679" width="20" height="20"><path d="M204.8 390.4A19.2 19.2 0 0 0 185.6 409.6v409.6c0 10.5984 8.6016 19.2 19.2 19.2h614.4a19.2 19.2 0 0 0 19.2-19.2V409.6A19.2 19.2 0 0 0 819.2 390.4H204.8z m96-64V204.8c0-45.9264 37.2736-83.2 83.2-83.2h256c45.9264 0 83.2 37.2736 83.2 83.2v121.6H819.2c45.9264 0 83.2 37.2736 83.2 83.2v409.6c0 45.9264-37.2736 83.2-83.2 83.2H204.8A83.2 83.2 0 0 1 121.6 819.2V409.6c0-45.9264 37.2736-83.2 83.2-83.2h96z m64 0h294.4V204.8a19.2 19.2 0 0 0-19.2-19.2h-256A19.2 19.2 0 0 0 364.8 204.8v121.6z" fill="#5A5A68" p-id="2680"></path><path d="M358.4 646.4a32 32 0 1 1 0-64h307.2a32 32 0 1 1 0 64H358.4z" fill="#5A5A68" p-id="2681"></path></svg>
        <input type="password" v-model="loginForm.password" @blur="validateField('password')" placeholder="请输入密码">
        <span class="error-msg">{{ fieldStates.password.message }}</span>
      </div>
      <div class="auth_inputarea" :class="fieldStates.vCode.status">
        <svg t="1775718366251" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3659" width="20" height="20"><path d="M874.666667 896H149.333333c-83.2 0-149.333333-66.133333-149.333333-149.333333V277.333333c0-83.2 66.133333-149.333333 149.333333-149.333333h725.333334c83.2 0 149.333333 66.133333 149.333333 149.333333v469.333334c0 83.2-66.133333 149.333333-149.333333 149.333333zM149.333333 213.333333c-36.266667 0-64 27.733333-64 64v469.333334c0 36.266667 27.733333 64 64 64h725.333334c36.266667 0 64-27.733333 64-64V277.333333c0-36.266667-27.733333-64-64-64H149.333333z" p-id="3660" fill="#2c2c2c"></path><path d="M270.933333 597.333333h-10.666666c-44.8 0-81.066667-36.266667-81.066667-81.066666v-10.666667c0-44.8 36.266667-81.066667 81.066667-81.066667h10.666666c44.8 0 81.066667 36.266667 81.066667 81.066667v10.666667c0 44.8-36.266667 81.066667-81.066667 81.066666zM512 597.333333c-46.933333 0-85.333333-38.4-85.333333-85.333333s38.4-85.333333 85.333333-85.333333 85.333333 38.4 85.333333 85.333333-38.4 85.333333-85.333333 85.333333zM757.333333 597.333333c-46.933333 0-85.333333-38.4-85.333333-85.333333s38.4-85.333333 85.333333-85.333333 85.333333 38.4 85.333334 85.333333-38.4 85.333333-85.333334 85.333333z" fill="#2c2c2c" p-id="3661"></path></svg>
        <input type="text" v-model="loginForm.vCode" @blur="validateField('vCode')" placeholder="请输入验证码">
        <button class="getCodeBt">获取验证码</button>
        <span class="error-msg">{{ fieldStates.vCode.message }}</span>
      </div>

      <button class="loginBt" @click="handleLogin">登录</button>
      <div class="lfz_tips">
        <p>忘记密码?</p>
        <p>没有账号?</p>
      </div>
    </section>

    <!-- 隐藏LoginFormZone的Zone -->
     <section id="hideLFZ" ref="hideLFZ" @click="hideLoginPanel"></section>

    <section id="titleSlider">
      <div class="title1" ref="title1">
        <p>加入我们，成为美的缔造者</p>
        <p>Join us and become a creator of beauty.</p>
      </div>

      <div class="title2" ref="title2">
        <div class="button" @click="() => router.push('/')">返回</div>
        <div class="button" @click="showLoginPanel">Login</div>
        <div class="button" @click="showLoginPanel">注册</div>
      </div>
    </section>
  </section>
</template>

<style scoped lang="scss">
@import url(../assets/CSS/loginView.css);
</style>