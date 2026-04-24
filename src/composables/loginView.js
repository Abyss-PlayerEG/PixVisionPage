import { gsap } from "gsap";
import { useRouter } from "vue-router";
import { ref, reactive, onMounted } from "vue";

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

export const useLoginView = () => {
  const router = useRouter();

  let aniEND = false;

  const bgimg = ref(null);
  const title1 = ref(null);
  const title2 = ref(null);
  const loginFormZone = ref(null);

  // 登录表单数据
  const loginForm = reactive({
    usernameOrEmail: "",
    password: "",
    vCode: "",
  });

  // 登录表单字段状态
  // idle: 未验证
  // error: 验证失败
  // success: 验证成功
  const fieldStates = reactive({
    usernameOrEmail: { status: "idle", message: "" },
    password: { status: "idle", message: "" },
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

  /*
  GSAP动画时间轴
  */
  let tl_showpass1 = null;
  let tl_showpass2 = null;
  onMounted(() => {
    //忘记密码01
    tl_showpass1 = gsap.timeline({
      paused: true,//暂停
      reversed: true,//反向状态
    })
    .to(
      ".fadeIn_loginitem",
      {
        x: 100,
        opacity: 0,
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
        ease: "power2.out",
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
        ease: "power2.out",
        pointerEvents: "auto",
      },
      '<'
    );
    
    //忘记密码02
    tl_showpass2 = gsap.timeline();
  })

  /*
  执行GSAP动画
  */
  // 显示登录面板
  const showLoginPanel = () => {
    const tl = gsap.timeline();

    aniEND = false;

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

  // 隐藏表单面板
  const hideFormPanel = () => {
    if (!aniEND) return;

    aniEND = false;
    const tl = gsap.timeline();

    tl.to(loginFormZone.value, {
      bottom: -700,
      duration: 0.5,
      ease: "power2.in",
    });

    tl.to(
      bgimg.value,
      {
        width: "120vw",
        height: "120vh",
        duration: 0.5,
        ease: "power2.in",
      },
      "<"
    );

    tl.to(
      title1.value,
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
      }
    );

    tl.to(
      title2.value,
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
      },
      "<"
    );

    aniEND = false;
  };

  // 忘记密码01
  const showPasswordPanel = (play) =>{
    if(play){
      tl_showpass1.play();
    }
    else{
      tl_showpass1.reverse();
    }
  }

  // 忘记密码02
  const showPasswordPanel2 = () =>{
    const tl = gsap.timeline();

    tl.to(
      ".s1",
      {
        x: "50%",
        opacity: 0,
        duration: 1,
        ease: "power2.out",
        pointerEvents: "auto",
      }
    ),
    tl.to(
      ".s2",
      {
        delay: 0.2,
        x: "100%",
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        pointerEvents: "auto",
      },
      '<'
    ),
    tl.to(
      ".pr-2",
      {
        x: "80%",
        color: "#fff",
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        pointerEvents: "auto",
      },
      '<'
    )
  }

  const handleLogin = () => {
    if (validateAll()) {
        loginForm.vCode = loginForm.vCode.toUpperCase();
        console.log("登录信息:", loginForm);
    }
  };

  return {
    router,
    bgimg,
    title1,
    title2,
    loginFormZone,
    loginForm,
    fieldStates,
    showLoginPanel,
    hideFormPanel,
    validateField,
    validateAll,
    setFieldError,
    clearFieldState,
    handleLogin,
    showPasswordPanel,
    showPasswordPanel2,
  };
};