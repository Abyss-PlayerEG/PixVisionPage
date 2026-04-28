import { gsap } from "gsap";
import { useRouter } from "vue-router";
import { ref, reactive, onMounted } from "vue";

export const useLoginView = () => {
  const router = useRouter();

  let aniEND = false;
  const activePanel = ref("");

  const bgimg = ref(null);
  const lfzTitle = ref(null);
  const title1 = ref(null);
  const title2 = ref(null);
  const loginFormZone = ref(null);

  
  /*
  GSAP动画时间轴
  */
 let tl_showpass1 = null;
 let tl_showpass2 = null;
 let tl_backtopass1 = null;
 onMounted(() => {
   //忘记密码01 - 显示
   tl_showpass1 = gsap.timeline({
      paused: true,
      reversed: true,
      onComplete: () => { // 显示动画完成后，确保#Zzone交互启用
        gsap.set("#Zzone", { pointerEvents: "auto" });
        gsap.set(".s1", { pointerEvents: "auto" });
        gsap.set(".s2", { pointerEvents: "none" });
      }
    })
    .to(
      ".fadeIn_loginItem",
      {
        x: 100,
        opacity: 0,
        ease: "power2.in",
      },
      "<",
    ).to(
      ".fadeIn_loginBt",
      {
        x: 100,
        opacity: 0,
        duration: 0.6,
        ease: "power2.in",
      },
      "<",
    ).to(
      ".fadeIn_loginInput",
      {
        x:100,
        stagger: -0.1,
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut",
      },
    ).fromTo(
      "#Zzone",
      {
        x: "-70%",
        opacity: 0,
      },
      {
        x: "-50%",
        opacity: 1,
        delay: 0.5,
        duration: 1,
        ease: "power3.out",
        pointerEvents: "auto",
      },
      '<'
    );

    //忘记密码01 - 返回（独立动画，非reverse）
    tl_backtopass1 = gsap.timeline({
    paused: true,
    onComplete: () => {
    // 1. 重置tl_backtopass1进度为0，回到初始暂停状态
    tl_backtopass1.progress(0).pause();
    // 2. 重置tl_showpass1为反向初始状态（确保下次play能正常触发）
    tl_showpass1.reverse().progress(0).pause();
    // 3. 恢复#Zzone的初始样式（清除行内样式，回归CSS默认）
      gsap.set("#Zzone", {
          x: "-70%",
          opacity: 0,
          pointerEvents: "none"
        });
        gsap.set(".s1", { x: 0, opacity: 1 });
        gsap.set(".s2", { x: "100%", opacity: 0 });

        //clearProps:all 清除所有行内样式，回归CSS默认
        gsap.set(".fadeIn_loginBt", { clearProps: "all" });
        gsap.set(".fadeIn_loginInput", { clearProps: "all" });
        gsap.set(".fadeIn_loginItem", { clearProps: "all" });
      }
    })
    .to(".s1, .s2", {
      pointerEvents: "none", // 立即禁用s1/s2的交互，避免拦截点击
      duration: 0, // 0秒执行，无动画，不影响视觉
    }, 0) // 0表示时间轴的第0秒就执行
    .to("#Zzone", {
      x: "-100%",
      opacity: 0,
      duration: 0.8,
      ease: "power3.in",
    })
    .to(
      ".fadeIn_loginInput",
      {
        x: 0,
        opacity: 1,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
      },
      "-=0.2"
    )
    .to(
      ".fadeIn_loginBt",
      {
        delay: 0.1,
        x: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
      },
      "<"
    )
    .to(
      ".fadeIn_loginItem",
      {
        delay: .5,
        x: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
      },
      "<"
    );

    //忘记密码02
    tl_showpass2 = gsap.timeline({
      paused: true,
      reversed: true,
      onComplete: () => {
        // 点击下一步：禁用s1，启用s2
        gsap.set(".s1", { pointerEvents: "none" });
        gsap.set(".s2", { pointerEvents: "auto" });
      },
      onReverseComplete: () => { 
        // 点击上一步：禁用s2，启用s1
        gsap.set(".s2", { pointerEvents: "none" });
        gsap.set(".s1", { pointerEvents: "auto" });
        tl_showpass2.progress(0).pause();
      }
    }).to(
      ".s1",
      {
        x: "100%",
        opacity: 0,
        duration: 1,
        ease: "power2.inOut",
      }
    )
    .fromTo(
      ".s2",
      {
        x: "0%",
        opacity: 0,
      },
      {
        delay: 0.2,
        x: "100%",
        opacity: 1,
        duration: 1,
        ease: "power2.inOut",
      },
      "<"
    )
    .to(
      ".pr-2",
      {
        x: "80%",
        opacity: 1,
        duration: 1,
        ease: "power2.inOut", 
      },
      "<"
    );
  })
  
  /*
  执行GSAP动画
  */
    // 忘记密码01
    const showPasswordPanel = (play) =>{
      if(play){
        // 1. 强制重置tl_showpass2到动画起点并暂停
        tl_showpass2.progress(0).pause();
        // 2. 复位s1样式（显示、初始位置、可交互）
        gsap.set(".s1", { 
          pointerEvents: "auto !important",
          x: 0,
          opacity: 1
        });
        // 3. 复位s2样式（隐藏、初始位置、不可交互）
        gsap.set(".s2", { 
          pointerEvents: "none",
          x: "100%",
          opacity: 0
        });
        // 4. 复位进度条样式
        gsap.set(".pr-2", { x: "0%", color: "#4e4e4e" });
        // =============================================
        tl_showpass1.play();
      }
      else{
        tl_backtopass1.play();
      }
    }

    // 忘记密码02
    const showPasswordPanel2 = (play) =>{
      if(play){
        tl_showpass2.play();
      }
      else{
        tl_showpass2.reverse();
      }
    }

 // 显示登录面板
 const showLoginPanel = () => {
   const tl = gsap.timeline();
   
   aniEND = false;
   activePanel.value = "login";
   
   tl.to(title1.value, {
     y: -250,
     opacity: 0,
     duration: 0.4,
     ease: "power2.out",
    });
    
    tl.to(
      title2.value,
      {
        y: -300,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      },
      "<"
    );

    tl.to(
      loginFormZone.value,
      {
        bottom: 0,
        duration: 0.6,
        ease: "power2.Out",
      },
      "<"
    );
    
    tl.to(
      bgimg.value,
      {
        width: "100vw",
        height: "100vh",
        duration: 0.6,
        ease: "power2.Out",
      },
      "<"
    );

    tl.from(
      ".fadeIn_loginInput",
      {
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
      },
      "<"
    );

    aniEND = true;
  };
  
 // 显示注册面板
 const showRegisterPanel = () =>{
  const tl = gsap.timeline();
  activePanel.value = "register";

  tl.set(".xzone_registerBt", { y: 20, opacity: 0 });
  tl.set(".xzone_tips", { y: 20, opacity: 0 });
  tl.set(".xzone_input", { y: 30, opacity: 0 });
  tl.set(".xzone_input_vcode", { y: 30, opacity: 0 });

  tl.to(
    lfzTitle.value,
    {
      opacity: .1,
      duration: 0.6,
      ease: "power2.Out",
    }
  )

  tl.to('#Xzone', {
      bottom: 0,
      duration: 0.5,
      ease: "power2.out",
    },
    "<"
  )

  tl.to(
    ".xzone_input",
    {
      y: 0,
      opacity: 1,
      duration: 0.4,
      stagger: 0.06,
      ease: "power2.out",
    },
    "-=0.2"
  )

  tl.to(
    ".xzone_input_vcode",
    {
      y: 0,
      opacity: 1,
      duration: 0.4,
      ease: "power2.out",
    },
    "-=0.4"
  )

  tl.to(
    ".xzone_registerBt",
    {
      y: 0,
      opacity: 1,
      duration: 0.4,
      ease: "power2.inOut",
    },
    "<"
  )

  tl.to(
    ".xzone_tips",
    {
      delay: 0.1,
      y: 0,
      opacity: 1,
      duration: 0.4,
      ease: "power2.out",
    },
    // "<"
  )
 }

  // 隐藏表单面板
    const hideFormPanel = () => {
      // 优先：如果注册面板打开 → 只关闭注册，直接 return
      if (activePanel.value === "register") {
        gsap.to(lfzTitle.value, { opacity: 1, duration: 0.4, ease: "power2.out" });
        gsap.to("#Xzone", {
          bottom: -700,
          duration: 0.4,
          ease: "power2.in",
          onComplete: () => {
            gsap.set("#Xzone", { bottom: -600 });
            // 清理注册表单
            for (const key in regForm) {
              regForm[key] = "";
            }
            for (const key in regFieldStates) {
              regFieldStates[key] = { status: "idle", message: "" };
            }
          },
        });
        activePanel.value = "login";
        return;
      }

      // 关闭登录面板
      if (!aniEND) return;

      const tl = gsap.timeline({
        onComplete: () => {
          aniEND = true;
          activePanel.value = "";
        }
      });

      // 关闭登录
      tl.to(loginFormZone.value, {
        bottom: -700,
        duration: 0.5,
        ease: "power2.in",
      }, 0);

      // 恢复背景
      tl.to(bgimg.value, {
        width: "120vw",
        height: "120vh",
        duration: 0.5,
        ease: "power2.in",
      }, 0);

      // 恢复文字
      tl.to(title1.value, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, 0.2);
      tl.to(title2.value, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, 0.2);

      tl.set(loginFormZone.value, { bottom: -700 });
      tl.set("#Xzone", { bottom: -600 });

      aniEND = false;
    };

    

  // 登录处理（打印信息）
  const handleLogin = () => {
    if (validateAll()) {
        loginForm.vCode = loginForm.vCode.toUpperCase();
        console.log("登录信息:", loginForm);
      }
    };
    




/*
表单校验数据
*/
// 登录表单字段验证规则
const FIELD_RULES = {
  usernameOrEmail: [
    { validator: (v) => !!v, message: "用户名/邮箱不能为空" },
    { validator: (v) => v.length >= 6, message: "用户名必须大于6位" },
    { validator: (v) => v.includes("@") ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) : true, message: "邮箱格式不正确" },
  ],
  password: [
    { validator: (v) => !!v, message: "密码不能为空" },
    { validator: (v) => v.length >= 8, message: "密码长度必须大于8位" },
  ],
  vCode: [
    { validator: (v) => !!v, message: "验证码不能为空" },
    { validator: (v) => /^[A-Za-z0-9]{6}$/.test(v), message: "为6位字母/数字" },
  ],
};

// 注册表单验证规则
const REG_FIELD_RULES = {
  nickname: [
    { validator: (v) => !v || v.length <= 20, message: "昵称最多20位" },
  ],
  username: [
    { validator: (v) => !!v, message: "用户名不能为空" },
    { validator: (v) => /^[a-zA-Z0-9_]{4,16}$/.test(v), message: "用户名4-16位字母/数字/下划线" },
  ],
  password: [
    { validator: (v) => !!v, message: "密码不能为空" },
    { validator: (v) => v.length >= 8, message: "密码长度至少8位" },
    { validator: (v) => /[A-Z]/.test(v) && /[a-z]/.test(v) && /[0-9]/.test(v), message: "需包含大小写字母和数字" },
  ],
  confirmPassword: [
    { validator: (v) => !!v, message: "请再次输入密码" },
    { validator: (v) => v === regForm.password, message: "两次密码不一致" },
  ],
  email: [
    { validator: (v) => !!v, message: "邮箱不能为空" },
    { validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message: "邮箱格式不正确" },
  ],
  vCode: [
    { validator: (v) => !!v, message: "验证码不能为空" },
    { validator: (v) => /^[A-Za-z0-9]{6}$/.test(v), message: "为6位字母/数字" },
  ],
};

const loginForm = reactive({
  usernameOrEmail: "",
  password: "",
  vCode: "",
});

const regForm = reactive({
  nickname: "",
  username: "",
  password: "",
  confirmPassword: "",
  email: "",
  vCode: "",
});

// 登录表单字段状态
const fieldStates = reactive({
  usernameOrEmail: { status: "idle", message: "" },
  password: { status: "idle", message: "" },
  vCode: { status: "idle", message: "" },
});

// 注册表单字段状态
const regFieldStates = reactive({
  nickname: { status: "idle", message: "" },
  username: { status: "idle", message: "" },
  password: { status: "idle", message: "" },
  confirmPassword: { status: "idle", message: "" },
  email: { status: "idle", message: "" },
  vCode: { status: "idle", message: "" },
});

// 验证登录表单字段
// 返回验证是否通过
const validateField = (fieldName) => {
  const value = loginForm[fieldName];
  const rules = FIELD_RULES[fieldName] || [];

  // 验证规则
  for (const rule of rules) {
    if (!rule.validator(value)) {
      fieldStates[fieldName].status = "error";
      fieldStates[fieldName].message = rule.message;
      return false;
    }
  }

  // 验证通过
  fieldStates[fieldName].status = "success";
  fieldStates[fieldName].message = "";
  return true;
};

// 验证登录表单所有字段
// 返回验证是否通过
const validateAll = () => {
  let allPassed = true;

  // 验证所有字段
  for (const fieldName in FIELD_RULES) {
    if (!validateField(fieldName)) {
      allPassed = false;
    }
  }

  return allPassed;
};

// 设置登录表单字段验证错误信息
const setFieldError = (fieldName, message) => {
  fieldStates[fieldName].status = "error";
  fieldStates[fieldName].message = message;
};

// 清除登录表单字段验证状态
// 用于在登录表单数据改变时调用
const clearFieldState = (fieldName) => {
  fieldStates[fieldName].status = "idle";
  fieldStates[fieldName].message = "";
};

// 验证注册表单字段
const validateRegField = (fieldName) => {
  const value = regForm[fieldName];
  const rules = REG_FIELD_RULES[fieldName] || [];

  for (const rule of rules) {
    if (!rule.validator(value)) {
      regFieldStates[fieldName].status = "error";
      regFieldStates[fieldName].message = rule.message;
      return false;
    }
  }

  regFieldStates[fieldName].status = "success";
  regFieldStates[fieldName].message = "";
  return true;
};

// 验证注册表单所有字段
const validateRegAll = () => {
  let allPassed = true;

  for (const fieldName in REG_FIELD_RULES) {
    if (!validateRegField(fieldName)) {
      allPassed = false;
    }
  }

  return allPassed;
};

// 清除注册表单字段验证状态
const clearRegFieldState = (fieldName) => {
  regFieldStates[fieldName].status = "idle";
  regFieldStates[fieldName].message = "";
};

// 注册处理
const handleRegister = () => {
  if (validateRegAll()) {
    console.log("注册信息:", regForm);
  }
};

// 导出数据
return{
    router,
    bgimg,
    title1,
    title2,
    lfzTitle,
    loginFormZone,
    loginForm,
    regForm,
    fieldStates,
    regFieldStates,
    showLoginPanel,
    showRegisterPanel,
    hideFormPanel,
    validateField,
    validateAll,
    validateRegField,
    validateRegAll,
    setFieldError,
    clearFieldState,
    clearRegFieldState,
    handleLogin,
    handleRegister,
    showPasswordPanel,
    showPasswordPanel2,
  };
};