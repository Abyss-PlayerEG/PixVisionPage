<script setup>
import { useLoginView } from "../composables/loginView.js";

const LV = useLoginView();

const {
  router,
  bgimg,
  title1,
  title2,
  lfzTitle,
  loginFormZone,
  loginForm,
  regForm,
  forgotPasswordForm,
  fieldStates,
  regFieldStates,
  forgotPasswordFieldStates,
  vCodeButtonState,
  loginVCodeButtonState,
  registerButtonState,
  forgotPasswordVCodeButtonState,
  forgotPasswordSubmitButtonState,
  showLoginPanel,
  showRegisterPanel,
  hideFormPanel,
  validateField,
  validateRegField,
  validateForgotPasswordField,
  handleLogin,
  handleRegister,
  clearFieldState,
  showPasswordPanel,
  showPasswordPanel2,
  sendRegisterCode,
  sendLoginCode,
  sendForgotPasswordCode,
  handleGetVerificationCode,
  clearCountdown,
  clearLoginCountdown,
  clearForgotPasswordCountdown,
  handleForgotPasswordSubmit,
  handleForgotPasswordFinalSubmit,
} = useLoginView();

// 忘记密码 - 下一步处理
const handleForgotPasswordNext = () => {
  // 验证新密码和确认密码
  const isNewPasswordValid = validateForgotPasswordField('newPassword');
  const isConfirmPasswordValid = validateForgotPasswordField('confirmPassword');
  
  // 只有两个字段都验证通过，才进入步骤2
  if (isNewPasswordValid && isConfirmPasswordValid) {
    // 显示步骤2（输入用户名/邮箱和验证码）
    showPasswordPanel2(true);
  }
};
</script>

<template>
  <section id="Bg">
    <img src="../assets/IMG/dark.jpg" alt="" ref="bgimg"/>

    <div class="round"></div>
    <div class="round"></div>
    <div class="round"></div>

    <!-- 登录面板 -->
    <section id="loginFormZone" ref="loginFormZone">
      <div class="lfz_titile" ref="lfzTitle">-&nbsp;Login&nbsp;-</div>
      <div class="auth_inputarea fadeIn_loginInput" :class="fieldStates.usernameOrEmail.status">
        <svg t="1775718259433" class="icon" viewBox="0 0 1126 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1676" width="20" height="20"><path d="M792.576 379.392a25.6 25.6 0 0 0 25.2928 25.8048h283.2384A25.6 25.6 0 0 0 1126.4 379.392a25.6 25.6 0 0 0-25.2928-25.8048h-283.2384a25.6 25.6 0 0 0-25.344 25.8048z m303.9232 80.7424H761.856c-16.5376 0-29.9008 11.6224-29.9008 25.7536 0 14.1824 13.312 25.7536 29.9008 25.7536h334.6432c16.4864 0 29.9008-11.5712 29.9008-25.7536 0-14.1312-13.4144-25.7536-29.9008-25.7536z m4.608 106.496h-283.2384a25.6 25.6 0 0 0-25.344 25.7536 25.6 25.6 0 0 0 25.344 25.7536h283.2384A25.6 25.6 0 0 0 1126.4 592.384a25.6 25.6 0 0 0-25.2928-25.8048zM543.0272 1024H341.6576C150.8352 1024 0 1024 0 923.648v-20.1216c0-188.16 153.2928-341.1968 341.7088-341.1968h201.2672c188.416 0 341.76 153.0368 341.76 341.1968v20.0704C884.6848 1024 726.3232 1024 542.976 1024z m-203.1616-405.1456c-158.464 0-287.4368 128.4096-287.4368 286.208v20.48c0 40.9088 166.0928 40.9088 287.4368 40.9088h204.9536c100.4544 0 287.4368 0 287.4368-40.96v-20.3776c0-157.8496-128.9728-286.208-287.4368-286.208H339.8656z m92.416-76.7488a271.4112 271.4112 0 0 1-271.2064-271.0528A271.36 271.36 0 0 1 432.2816 0a271.36 271.36 0 0 1 271.2064 271.0528 271.4624 271.4624 0 0 1-271.2064 271.0528z m-215.3472-271.872c0 118.1696 96.6144 214.3232 215.3472 214.3232 118.784 0 215.3984-96.1536 215.3984-214.3232 0-118.2208-96.6144-214.3232-215.3984-214.3232S216.9344 152.0128 216.9344 270.2336z" fill="#939393" p-id="1677"></path></svg>
        <input type="text" v-model="loginForm.usernameOrEmail" @blur="validateField('usernameOrEmail')" placeholder="请输入用户名/邮箱">
        <span class="error-msg">{{ fieldStates.usernameOrEmail.message }}</span>
      </div>
      <div class="auth_inputarea fadeIn_loginInput" :class="fieldStates.password.status">
        <svg t="1775718313591" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2679" width="20" height="20"><path d="M204.8 390.4A19.2 19.2 0 0 0 185.6 409.6v409.6c0 10.5984 8.6016 19.2 19.2 19.2h614.4a19.2 19.2 0 0 0 19.2-19.2V409.6A19.2 19.2 0 0 0 819.2 390.4H204.8z m96-64V204.8c0-45.9264 37.2736-83.2 83.2-83.2h256c45.9264 0 83.2 37.2736 83.2 83.2v121.6H819.2c45.9264 0 83.2 37.2736 83.2 83.2v409.6c0 45.9264-37.2736 83.2-83.2 83.2H204.8A83.2 83.2 0 0 1 121.6 819.2V409.6c0-45.9264 37.2736-83.2 83.2-83.2h96z m64 0h294.4V204.8a19.2 19.2 0 0 0-19.2-19.2h-256A19.2 19.2 0 0 0 364.8 204.8v121.6z" fill="#5A5A68" p-id="2680"></path><path d="M358.4 646.4a32 32 0 1 1 0-64h307.2a32 32 0 1 1 0 64H358.4z" fill="#5A5A68" p-id="2681"></path></svg>
        <input type="password" v-model="loginForm.password" @blur="validateField('password')" placeholder="请输入密码">
        <span class="error-msg">{{ fieldStates.password.message }}</span>
      </div>
      <div class="auth_inputarea fadeIn_loginInput" :class="fieldStates.vCode.status">
        <svg t="1775718366251" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3659" width="20" height="20"><path d="M874.666667 896H149.333333c-83.2 0-149.333333-66.133333-149.333333-149.333333V277.333333c0-83.2 66.133333-149.333333 149.333333-149.333333h725.333334c83.2 0 149.333333 66.133333 149.333333 149.333333v469.333334c0 83.2-66.133333 149.333333-149.333333 149.333333zM149.333333 213.333333c-36.266667 0-64 27.733333-64 64v469.333334c0 36.266667 27.733333 64 64 64h725.333334c36.266667 0 64-27.733333 64-64V277.333333c0-36.266667-27.733333-64-64-64H149.333333z" p-id="3660" fill="#2c2c2c"></path><path d="M270.933333 597.333333h-10.666666c-44.8 0-81.066667-36.266667-81.066667-81.066666v-10.666667c0-44.8 36.266667-81.066667 81.066667-81.066667h10.666666c44.8 0 81.066667 36.266667 81.066667 81.066667v10.666667c0 44.8-36.266667 81.066667-81.066667 81.066666zM512 597.333333c-46.933333 0-85.333333-38.4-85.333333-85.333333s38.4-85.333333 85.333333-85.333333 85.333333 38.4 85.333333 85.333333-38.4 85.333333-85.333333 85.333333zM757.333333 597.333333c-46.933333 0-85.333333-38.4-85.333333-85.333333s38.4-85.333333 85.333333-85.333333 85.333333 38.4 85.333334 85.333333-38.4 85.333333-85.333334 85.333333z" fill="#2c2c2c" p-id="3661"></path></svg>
        <input type="text" v-model="loginForm.vCode" @blur="validateField('vCode')" placeholder="请输入验证码">
        <button class="getCodeBt" @click="sendLoginCode" :disabled="loginVCodeButtonState.disabled">{{ loginVCodeButtonState.text }}</button>
        <span class="error-msg">{{ fieldStates.vCode.message }}</span>
      </div>
      
      <button class="loginBt fadeIn_loginBt" @click="handleLogin">登录</button>
      <div class="lfz_tips fadeIn_loginItem">
        <p @click="showPasswordPanel">忘记密码?</p>
        <p @click="showRegisterPanel">没有账号?</p>
      </div>
      
      
      
      <!-- 忘记密码 -->
      <section id="Zzone">
        <!-- 01.进度条 -->
        <div class="progress">
          <div class="pr-1" @click="showPasswordPanel2(false)">上一步</div>
          <div class="pr-2">当前进度</div>
          <div class="pr-3" @click="showPasswordPanel(false)">返回<span>·</span></div>
        </div>
        
        <!-- 02.切换框 -->
        <div class="switch">  
          
          <div class="s1">
            <div class="auth_inputarea" :class="forgotPasswordFieldStates.newPassword.status">
              <svg t="1775718313591" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2679" width="20" height="20"><path d="M204.8 390.4A19.2 19.2 0 0 0 185.6 409.6v409.6c0 10.5984 8.6016 19.2 19.2 19.2h614.4a19.2 19.2 0 0 0 19.2-19.2V409.6A19.2 19.2 0 0 0 819.2 390.4H204.8z m96-64V204.8c0-45.9264 37.2736-83.2 83.2-83.2h256c45.9264 0 83.2 37.2736 83.2 83.2v121.6H819.2c45.9264 0 83.2 37.2736 83.2 83.2v409.6c0 45.9264-37.2736 83.2-83.2 83.2H204.8A83.2 83.2 0 0 1 121.6 819.2V409.6c0-45.9264 37.2736-83.2 83.2-83.2h96z m64 0h294.4V204.8a19.2 19.2 0 0 0-19.2-19.2h-256A19.2 19.2 0 0 0 364.8 204.8v121.6z" fill="#5A5A68" p-id="2680"></path><path d="M358.4 646.4a32 32 0 1 1 0-64h307.2a32 32 0 1 1 0 64H358.4z" fill="#5A5A68" p-id="2681"></path></svg>
              <input type="password" v-model="forgotPasswordForm.newPassword" @blur="validateForgotPasswordField('newPassword')" placeholder="输入新的密码">
              <span class="error-msg">{{ forgotPasswordFieldStates.newPassword.message }}</span>
            </div>
            <div class="auth_inputarea" :class="forgotPasswordFieldStates.confirmPassword.status">
              <svg t="1775718313591" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2679" width="20" height="20"><path d="M204.8 390.4A19.2 19.2 0 0 0 185.6 409.6v409.6c0 10.5984 8.6016 19.2 19.2 19.2h614.4a19.2 19.2 0 0 0 19.2-19.2V409.6A19.2 19.2 0 0 0 819.2 390.4H204.8z m96-64V204.8c0-45.9264 37.2736-83.2 83.2-83.2h256c45.9264 0 83.2 37.2736 83.2 83.2v121.6H819.2c45.9264 0 83.2 37.2736 83.2 83.2v409.6c0 45.9264-37.2736 83.2-83.2 83.2H204.8A83.2 83.2 0 0 1 121.6 819.2V409.6c0-45.9264 37.2736-83.2 83.2-83.2h96z m64 0h294.4V204.8a19.2 19.2 0 0 0-19.2-19.2h-256A19.2 19.2 0 0 0 364.8 204.8v121.6z" fill="#5A5A68" p-id="2680"></path><path d="M358.4 646.4a32 32 0 1 1 0-64h307.2a32 32 0 1 1 0 64H358.4z" fill="#5A5A68" p-id="2681"></path></svg>
              <input type="password" v-model="forgotPasswordForm.confirmPassword" @blur="validateForgotPasswordField('confirmPassword')" placeholder="确认新的密码">
              <span class="error-msg">{{ forgotPasswordFieldStates.confirmPassword.message }}</span>
            </div>
            <button class="loginBt" @click="handleForgotPasswordNext">下一步</button>
          </div>
          
          <div class="s2">
            <div class="auth_inputarea" :class="forgotPasswordFieldStates.usernameOrEmail.status">
              <svg t="1775718259433" class="icon" viewBox="0 0 1126 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1676" width="20" height="20"><path d="M792.576 379.392a25.6 25.6 0 0 0 25.2928 25.8048h283.2384A25.6 25.6 0 0 0 1126.4 379.392a25.6 25.6 0 0 0-25.2928-25.8048h-283.2384a25.6 25.6 0 0 0-25.344 25.8048z m303.9232 80.7424H761.856c-16.5376 0-29.9008 11.6224-29.9008 25.7536 0 14.1824 13.312 25.7536 29.9008 25.7536h334.6432c16.4864 0 29.9008-11.5712 29.9008-25.7536 0-14.1312-13.4144-25.7536-29.9008-25.7536z m4.608 106.496h-283.2384a25.6 25.6 0 0 0-25.344 25.7536 25.6 25.6 0 0 0 25.344 25.7536h283.2384A25.6 25.6 0 0 0 1126.4 592.384a25.6 25.6 0 0 0-25.2928-25.8048zM543.0272 1024H341.6576C150.8352 1024 0 1024 0 923.648v-20.1216c0-188.16 153.2928-341.1968 341.7088-341.1968h201.2672c188.416 0 341.76 153.0368 341.76 341.1968v20.0704C884.6848 1024 726.3232 1024 542.976 1024z m-203.1616-405.1456c-158.464 0-287.4368 128.4096-287.4368 286.208v20.48c0 40.9088 166.0928 40.9088 287.4368 40.9088h204.9536c100.4544 0 287.4368 0 287.4368-40.96v-20.3776c0-157.8496-128.9728-286.208-287.4368-286.208H339.8656z m92.416-76.7488a271.4112 271.4112 0 0 1-271.2064-271.0528A271.36 271.36 0 0 1 432.2816 0a271.36 271.36 0 0 1 271.2064 271.0528 271.4624 271.4624 0 0 1-271.2064 271.0528z m-215.3472-271.872c0 118.1696 96.6144 214.3232 215.3472 214.3232 118.784 0 215.3984-96.1536 215.3984-214.3232 0-118.2208-96.6144-214.3232-215.3984-214.3232S216.9344 152.0128 216.9344 270.2336z" fill="#939393" p-id="1677"></path></svg>
              <input type="text" v-model="forgotPasswordForm.usernameOrEmail" @blur="validateForgotPasswordField('usernameOrEmail')" placeholder="请输入用户名/邮箱">
              <span class="error-msg">{{ forgotPasswordFieldStates.usernameOrEmail.message }}</span>
            </div>
            <div class="auth_inputarea" :class="forgotPasswordFieldStates.vCode.status">
              <svg t="1775718366251" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3659" width="20" height="20"><path d="M874.666667 896H149.333333c-83.2 0-149.333333-66.133333-149.333333-149.333333V277.333333c0-83.2 66.133333-149.333333 149.333333-149.333333h725.333334c83.2 0 149.333333 66.133333 149.333333 149.333333v469.333334c0 83.2-66.133333 149.333333-149.333333 149.333333zM149.333333 213.333333c-36.266667 0-64 27.733333-64 64v469.333334c0 36.266667 27.733333 64 64 64h725.333334c36.266667 0 64-27.733333 64-64V277.333333c0-36.266667-27.733333-64-64-64H149.333333z" p-id="3660" fill="#2c2c2c"></path><path d="M270.933333 597.333333h-10.666666c-44.8 0-81.066667-36.266667-81.066667-81.066666v-10.666667c0-44.8 36.266667-81.066667 81.066667-81.066667h10.666666c44.8 0 81.066667 36.266667 81.066667 81.066667v10.666667c0 44.8-36.266667 81.066667-81.066667 81.066666zM512 597.333333c-46.933333 0-85.333333-38.4-85.333333-85.333333s38.4-85.333333 85.333333-85.333333 85.333333 38.4 85.333333 85.333333-38.4 85.333333-85.333333 85.333333zM757.333333 597.333333c-46.933333 0-85.333333-38.4-85.333333-85.333333s38.4-85.333333 85.333333-85.333333 85.333333 38.4 85.333334 85.333333-38.4 85.333333-85.333334 85.333333z" fill="#2c2c2c" p-id="3661"></path></svg>
              <input type="text" v-model="forgotPasswordForm.vCode" @blur="validateForgotPasswordField('vCode')" placeholder="请输入验证码">
              <button class="getCodeBt" @click="sendForgotPasswordCode" :disabled="forgotPasswordVCodeButtonState.disabled">{{ forgotPasswordVCodeButtonState.text }}</button>
              <span class="error-msg">{{ forgotPasswordFieldStates.vCode.message }}</span>
            </div>
            <button class="loginBt" @click="handleForgotPasswordSubmit" :disabled="forgotPasswordSubmitButtonState.disabled">{{ forgotPasswordSubmitButtonState.text }}</button>
          </div>
        </div>
      </section>

    </section>
    
    <!-- 注册页面 -->
    <section id="Xzone">
      <div class="xzone_title">- JoinUs -</div>
      <div class="xzone_back" @click="hideFormPanel">
      </div>
      <div class="xzone_content">
        <div class="xzone_input fadeIn_regInput" :class="regFieldStates.nickname.status">
          <svg class="icon" viewBox="0 0 1024 1024" width="20" height="20"><path d="M512 128c-141.44 0-256 114.56-256 256s114.56 256 256 256 256-114.56 256-256-114.56-256-256-256z" fill="#5A5A68" p-id="1680"></path><path d="M512 192c-105.6 0-192 86.4-192 192s86.4 192 192 192 192-86.4 192-192-86.4-192-192-192z" fill="#5A5A68" p-id="1681"></path><path d="M512 384c-52.8 0-96 43.2-96 96s43.2 96 96 96 96-43.2 96-96-43.2-96-96-96z" fill="#5A5A68" p-id="1682"></path><path d="M512 512c-35.2 0-64 28.8-64 64s28.8 64 64 64 64-28.8 64-64-28.8-64-64-64z" fill="#5A5A68" p-id="1683"></path></svg>
          <input type="text" v-model="regForm.nickname" @blur="validateRegField('nickname')" placeholder="请输入昵称【可选】">
          <span class="error-msg">{{ regFieldStates.nickname.message }}</span>
        </div>
        <div class="xzone_input fadeIn_regInput" :class="regFieldStates.username.status">
          <svg class="icon" viewBox="0 0 1024 1024" width="20" height="20"><path d="M864 256H704V192c0-70.4-57.6-128-128-128s-128 57.6-128 128v64H160c-88 0-160 72-160 160v352c0 88 72 160 160 160h704c88 0 160-72 160-160V416c0-88-72-160-160-160z m-448 0H288v64c0 35.2 28.8 64 64 64s64-28.8 64-64v-64h64v192c0 35.2-28.8 64-64 64s-64-28.8-64-64V256z" fill="#5A5A68" p-id="1684"></path></svg>
          <input type="text" v-model="regForm.username" @blur="validateRegField('username')" placeholder="请输入用户名">
          <span class="error-msg">{{ regFieldStates.username.message }}</span>
        </div>
        <div class="xzone_input fadeIn_regInput" :class="regFieldStates.password.status">
          <svg class="icon" viewBox="0 0 1024 1024" width="20" height="20"><path d="M204.8 390.4A19.2 19.2 0 0 0 185.6 409.6v409.6c0 10.5984 8.6016 19.2 19.2 19.2h614.4a19.2 19.2 0 0 0 19.2-19.2V409.6A19.2 19.2 0 0 0 819.2 390.4H204.8z m96-64V204.8c0-45.9264 37.2736-83.2 83.2-83.2h256c45.9264 0 83.2 37.2736 83.2 83.2v121.6H819.2c45.9264 0 83.2 37.2736 83.2 83.2v409.6c0 45.9264-37.2736 83.2-83.2 83.2H204.8A83.2 83.2 0 0 1 121.6 819.2V409.6c0-45.9264 37.2736-83.2 83.2-83.2h96z m64 0h294.4V204.8a19.2 19.2 0 0 0-19.2-19.2h-256A19.2 19.2 0 0 0 364.8 204.8v121.6z" fill="#5A5A68" p-id="1685"></path><path d="M358.4 646.4a32 32 0 1 1 0-64h307.2a32 32 0 1 1 0 64H358.4z" fill="#5A5A68" p-id="1686"></path></svg>
          <input type="password" v-model="regForm.password" @blur="validateRegField('password')" placeholder="请输入登录密码">
          <span class="error-msg">{{ regFieldStates.password.message }}</span>
        </div>
        <div class="xzone_input fadeIn_regInput" :class="regFieldStates.confirmPassword.status">
          <svg class="icon" viewBox="0 0 1024 1024" width="20" height="20"><path d="M204.8 390.4A19.2 19.2 0 0 0 185.6 409.6v409.6c0 10.5984 8.6016 19.2 19.2 19.2h614.4a19.2 19.2 0 0 0 19.2-19.2V409.6A19.2 19.2 0 0 0 819.2 390.4H204.8z m96-64V204.8c0-45.9264 37.2736-83.2 83.2-83.2h256c45.9264 0 83.2 37.2736 83.2 83.2v121.6H819.2c45.9264 0 83.2 37.2736 83.2 83.2v409.6c0 45.9264-37.2736 83.2-83.2 83.2H204.8A83.2 83.2 0 0 1 121.6 819.2V409.6c0-45.9264 37.2736-83.2 83.2-83.2h96z m64 0h294.4V204.8a19.2 19.2 0 0 0-19.2-19.2h-256A19.2 19.2 0 0 0 364.8 204.8v121.6z" fill="#5A5A68" p-id="1687"></path><path d="M358.4 646.4a32 32 0 1 1 0-64h307.2a32 32 0 1 1 0 64H358.4z" fill="#5A5A68" p-id="1688"></path></svg>
          <input type="password" v-model="regForm.confirmPassword" @blur="validateRegField('confirmPassword')" placeholder="请再次输入密码">
          <span class="error-msg">{{ regFieldStates.confirmPassword.message }}</span>
        </div>
        <div class="xzone_input fadeIn_regInput" :class="regFieldStates.email.status">
          <svg class="icon" viewBox="0 0 1024 1024" width="20" height="20"><path d="M853.333333 170.666667H170.666667c-46.933333 0-85.333333 38.4-85.333333 85.333333v512c0 46.933333 38.4 85.333333 85.333333 85.333333h682.666667c46.933333 0 85.333333-38.4 85.333333-85.333333v-512c0-46.933333-38.4-85.333333-85.333333-85.333333z m-682.666666 85.333333V768L426.666667 512 170.666667 768V256z m682.666666 426.666666L512 512l-341.333333 170.666667V256L512 426.666667 853.333333 256v426.666666z" fill="#5A5A68" p-id="1689"></path></svg>
          <input type="text" v-model="regForm.email" @blur="validateRegField('email')" placeholder="请输入邮箱地址">
          <span class="error-msg">{{ regFieldStates.email.message }}</span>
        </div>
        <div class="xzone_input_vcode fadeIn_regInput" :class="regFieldStates.vCode.status">
          <svg class="icon" viewBox="0 0 1024 1024" width="20" height="20"><path d="M270.933333 597.333333h-10.666666c-44.8 0-81.066667-36.266667-81.066667-81.066666v-10.666667c0-44.8 36.266667-81.066667 81.066667-81.066667h10.666666c44.8 0 81.066667 36.266667 81.066667 81.066667v10.666667c0 44.8-36.266667 81.066667-81.066667 81.066666zM512 597.333333c-46.933333 0-85.333333-38.4-85.333333-85.333333s38.4-85.333333 85.333333-85.333333 85.333333 38.4 85.333333 85.333333-38.4 85.333333-85.333333 85.333333zM757.333333 597.333333c-46.933333 0-85.333333-38.4-85.333333-85.333333s38.4-85.333333 85.333333-85.333333 85.333333 38.4 85.333334 85.333333-38.4 85.333333-85.333334 85.333333z" fill="#5A5A68" p-id="1690"></path></svg>
          <input type="text" v-model="regForm.vCode" @blur="validateRegField('vCode')" placeholder="请输入验证码">
          <button class="getCodeBt" @click="sendRegisterCode" :disabled="vCodeButtonState.disabled">{{ vCodeButtonState.text }}</button>
          <span class="error-msg">{{ regFieldStates.vCode.message }}</span>
        </div>
        <button class="xzone_registerBt fadeIn_regInput" @click="handleRegister" :disabled="registerButtonState.disabled">{{ registerButtonState.text }}</button>
        <div class="xzone_tips fadeIn_regInput">
          已有账号?<span @click="hideFormPanel">立即登录</span>
        </div>
      </div>
    </section>

    <!-- 隐藏LoginFormZone的Zone -->
     <section id="hideFZ" ref="hideFZ" @click="hideFormPanel"></section>

    <section id="titleSlider">
      <div class="title1" ref="title1">
        <p>加入我们，成为美的缔造者</p>
        <p>Join us and become a creator of beauty.</p>
      </div>

      <div class="title2" ref="title2">
        <div class="button" @click="() => router.push('/')">Back</div>
        <div class="button" @click="showLoginPanel">Start</div>
        <div class="button" @click="showRegisterPanel">Join</div>
      </div>
    </section>
  </section>
</template>

<style scoped lang="scss">
@import url(../assets/CSS/loginView.css);
</style>