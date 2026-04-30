import { gsap } from "gsap";
import { useRouter } from "vue-router";
import { ref, reactive, onMounted } from "vue";
import { AUTH_API, MAIL_API, PASSWORD_API } from '../config/api';

export const useLoginView = () => {
    const router = useRouter();

    let aniEND = false; // 登录面板打开/关闭状态
    const activePanel = ref("");

    // ✅ 新增：登录面板的打开/关闭状态 (true=打开, false=关闭)
    const isLoginPanelOpen = ref(false);

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
                    x: 100,
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
    const showPasswordPanel = (play) => {
        if (play) {
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
        } else {
            tl_backtopass1.play();
        }
    }

    // 忘记密码02
    const showPasswordPanel2 = (play) => {
        if (play) {
            tl_showpass2.play();
        } else {
            tl_showpass2.reverse();
        }
    }

    // 显示登录面板
    const showLoginPanel = () => {
        const tl = gsap.timeline();

        aniEND = false;
        activePanel.value = "login";
        isLoginPanelOpen.value = true; // ✅ 设置登录面板为打开状态
        console.log("登录面板状态：" + isLoginPanelOpen.value);

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
    const showRegisterPanel = () => {
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
                    // 清除验证码倒计时
                    clearCountdown();
                    // 清除注册按钮倒计时
                    if (registerCountdownTimer) {
                        clearInterval(registerCountdownTimer);
                        registerCountdownTimer = null;
                    }
                    registerButtonState.text = '注册';
                    registerButtonState.disabled = false;
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
                isLoginPanelOpen.value = false; // ✅ 设置登录面板为关闭状态
                console.log("登录面板状态：" + isLoginPanelOpen.value);
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


    // 登录处理
    const handleLogin = async () => {
        // 验证所有字段
        if (!validateAll()) {
            return;
        }

        try {
            // 构建表单数据
            const formData = new URLSearchParams();
            formData.append('usernameOrEmail', loginForm.usernameOrEmail);
            formData.append('password', loginForm.password);
            formData.append('vCode', loginForm.vCode.toUpperCase()); // 验证码转为大写

            console.log('发送登录请求数据:', {
                usernameOrEmail: loginForm.usernameOrEmail,
                password: '(已加密)',
                vCode: loginForm.vCode.toUpperCase(),
            });

            // 调用后端登录接口
            const response = await fetch(AUTH_API.LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            });

            const result = await response.json();

            // 打印后端返回的响应
            console.log('登录接口响应:', JSON.stringify(result, null, 2));

            // 根据业务状态码处理（兼容 code 和 recode 字段）
            const statusCode = result.code || result.recode;
            if (statusCode === 200 && result.data) {
                console.log('✅ 登录成功');
                console.log('完整的 result.data:', JSON.stringify(result.data, null, 2));

                // 保存 Token 到 localStorage
                if (result.data.token) {
                    localStorage.setItem('token', result.data.token);
                    console.log('Token 已保存:', result.data.token);
                } else {
                    console.warn('⚠️ result.data 中没有 token 字段');
                }

                // 保存用户信息到 localStorage
                // 后端返回的用户信息直接在 result.data 中，需要排除 token 字段
                const userInfo = { ...result.data };
                delete userInfo.token; // 移除 token，只保存用户信息
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
                console.log('用户信息已保存:', userInfo);

                // 跳转到 HomePage
                router.push('/home');
            } else {
                console.error('❌ 登录失败:', result.message);
                alert(result.message || '登录失败，请检查用户名、密码和验证码');
            }

            return result;

        } catch (error) {
            console.error('网络请求失败:', error);
            alert('网络错误，请稍后重试');
        }
    };


    /*
    表单校验数据
    */
    // 登录表单字段验证规则
    const FIELD_RULES = {
        usernameOrEmail: [
            { validator: (v) => !!v, message: "用户名/邮箱不能为空" },
            {
                validator: (v) => /^[a-zA-Z0-9_]{5,16}$/.test(v) || /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(v),
                message: "用户名或邮箱不正确"
            },
        ],
        password: [
            { validator: (v) => !!v, message: "密码不能为空" },
            { validator: (v) => /^[a-zA-Z0-9_.]{6,16}$/.test(v), message: "6-16位，只允许字母、数字、\"_\"、\".\"" },
        ],
        vCode: [
            { validator: (v) => !!v, message: "验证码不能为空" },
            { validator: (v) => /^[0-9A-Z]{6}$/.test(v), message: "6位字母和数字" },
        ],
    };

    // 注册表单验证规则
    const REG_FIELD_RULES = {
        nickname: [
            { validator: (v) => !v || v.length <= 20, message: "昵称最多20位" },
        ],
        username: [
            { validator: (v) => !!v, message: "用户名不能为空" },
            { validator: (v) => /^[a-zA-Z0-9_]{5,16}$/.test(v), message: "5-16位, 只允许字母、数字和\"_\"" },
        ],
        password: [
            { validator: (v) => !!v, message: "密码不能为空" },
            { validator: (v) => /^[a-zA-Z0-9_.]{6,16}$/.test(v), message: "6-16位，只允许字母、数字、\"_\"、\".\"" },
        ],
        confirmPassword: [
            { validator: (v) => !!v, message: "请再次输入密码" },
            { validator: (v) => /^[a-zA-Z0-9_.]{6,16}$/.test(v), message: "6-16位，2只允许字母、数字、\"_\"、\".\"" },
            { validator: (v) => v === regForm.password, message: "两次密码不一致" },
        ],
        email: [
            { validator: (v) => !!v, message: "邮箱不能为空" },
            { validator: (v) => /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(v), message: "邮箱格式不正确" },
        ],
        vCode: [
            { validator: (v) => !!v, message: "验证码不能为空" },
            { validator: (v) => /^[0-9A-Za-z]{6}$/.test(v), message: "6位字母和数字" },
        ],
    };

    // 忘记密码表单验证规则
    const FORGOT_PASSWORD_FIELD_RULES = {
        usernameOrEmail: [
            { validator: (v) => !!v, message: "用户名/邮箱不能为空" },
            {
                validator: (v) => /^[a-zA-Z0-9_]{5,16}$/.test(v) || /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(v),
                message: "用户名或邮箱不正确"
            },
        ],
        newPassword: [
            { validator: (v) => !!v, message: "新密码不能为空" },
            { validator: (v) => /^[a-zA-Z0-9_.]{6,16}$/.test(v), message: "6-16位，只允许字母、数字、\"_\"、\".\"" },
        ],
        confirmPassword: [
            { validator: (v) => !!v, message: "请再次输入密码" },
            { validator: (v) => /^[a-zA-Z0-9_.]{6,16}$/.test(v), message: "6-16位，只允许字母、数字、\"_\"、\".\"" },
            { validator: (v) => v === forgotPasswordForm.newPassword, message: "两次密码不一致" },
        ],
        vCode: [
            { validator: (v) => !!v, message: "验证码不能为空" },
            { validator: (v) => /^[0-9A-Z]{6}$/.test(v), message: "6位字母和数字" },
        ],
    };

    // 登录表单数据
    const loginForm = reactive({
        usernameOrEmail: "",
        password: "",
        vCode: "",
    });

    // 注册表单数据
    const regForm = reactive({
        nickname: "",
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        vCode: "",
    });

    // 忘记密码表单数据
    const forgotPasswordForm = reactive({
        usernameOrEmail: "",
        newPassword: "",
        confirmPassword: "",
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

    // 忘记密码表单字段状态
    const forgotPasswordFieldStates = reactive({
        usernameOrEmail: { status: "idle", message: "" },
        newPassword: { status: "idle", message: "" },
        confirmPassword: { status: "idle", message: "" },
        vCode: { status: "idle", message: "" },
    });

    // 验证码按钮状态
    const vCodeButtonState = reactive({
        text: "获取验证码",
        disabled: false,
        countdown: 0,
    });

    // 登录验证码按钮状态
    const loginVCodeButtonState = reactive({
        text: "获取验证码",
        disabled: false,
    });

    // 注册按钮状态
    const registerButtonState = reactive({
        text: "注册",
        disabled: false,
    });

    // 忘记密码验证码按钮状态
    const forgotPasswordVCodeButtonState = reactive({
        text: "获取验证码",
        disabled: false,
        countdown: 0,
    });

    // 忘记密码确定按钮状态
    const forgotPasswordSubmitButtonState = reactive({
        text: "确定",
        disabled: false,
    });

    let countdownTimer = null;
    let loginCountdownTimer = null;
    let registerCountdownTimer = null;
    let forgotPasswordCountdownTimer = null;
    let forgotPasswordSubmitCountdownTimer = null;

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

    // 设置注册表单字段验证错误信息
    const setRegFieldError = (fieldName, message) => {
        regFieldStates[fieldName].status = "error";
        regFieldStates[fieldName].message = message;
    };

    // 验证忘记密码表单字段
    const validateForgotPasswordField = (fieldName) => {
        const value = forgotPasswordForm[fieldName];
        const rules = FORGOT_PASSWORD_FIELD_RULES[fieldName] || [];

        for (const rule of rules) {
            if (!rule.validator(value)) {
                forgotPasswordFieldStates[fieldName].status = "error";
                forgotPasswordFieldStates[fieldName].message = rule.message;
                return false;
            }
        }

        forgotPasswordFieldStates[fieldName].status = "success";
        forgotPasswordFieldStates[fieldName].message = "";
        return true;
    };

    // 验证忘记密码表单所有字段
    const validateForgotPasswordAll = () => {
        let allPassed = true;

        for (const fieldName in FORGOT_PASSWORD_FIELD_RULES) {
            if (!validateForgotPasswordField(fieldName)) {
                allPassed = false;
            }
        }

        return allPassed;
    };

    // 清除忘记密码表单字段验证状态
    const clearForgotPasswordFieldState = (fieldName) => {
        forgotPasswordFieldStates[fieldName].status = "idle";
        forgotPasswordFieldStates[fieldName].message = "";
    };

    // 通用验证码发送函数
    const sendVerificationCode = async (options) => {
        const {
            validateFn,           // 验证函数
            fieldName,            // 要验证的字段名
            apiUrl,               // API 地址
            params,               // 请求参数对象
            buttonState,          // 按钮状态对象
            needCountdown = false, // 是否需要倒计时
            countdownFn = null,   // 倒计时函数
            showSuccessAlert = true, // 是否显示成功提示
            successMessage = "验证码已发送到您的邮箱，请查收",
            errorMessagePrefix = "验证码发送失败"
        } = options;

        // 验证字段
        if (validateFn && fieldName) {
            const isValid = validateFn(fieldName);
            if (!isValid) {
                return;
            }
        }

        console.log('发送验证码请求数据:', params);

        try {
            // 设置按钮状态为发送中
            buttonState.disabled = true;
            buttonState.text = "发送中";

            // 构建 URL 参数
            const queryString = Object.keys(params)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                .join('&');

            // 调用后端接口发送验证码
            const response = await fetch(`${apiUrl}?${queryString}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            // 打印后端返回的响应
            console.log('发送验证码响应:', JSON.stringify(result, null, 2));

            if (result.data === true || result.code === 200 || result.recode === 200) {
                console.log("✅ 验证码发送成功");

                if (needCountdown && countdownFn) {
                    // 需要倒计时
                    countdownFn();
                } else if (showSuccessAlert) {
                    // 不需要倒计时，但显示提示并恢复按钮
                    alert(successMessage);
                    buttonState.disabled = false;
                    buttonState.text = "获取验证码";
                }
                // 如果既不需要倒计时也不需要显示提示，则保持按钮为“发送中”状态
            } else {
                // 发送失败，恢复按钮状态
                buttonState.disabled = false;
                buttonState.text = "获取验证码";
                console.error(`❌ ${errorMessagePrefix}:`, result.message);
                alert(result.message || errorMessagePrefix);
            }
        } catch (error) {
            // 网络错误，恢复按钮状态
            buttonState.disabled = false;
            buttonState.text = "获取验证码";
            console.error("发送验证码请求失败:", error);
            alert("网络错误，请稍后重试");
        }
    };

    // 通用的获取验证码按钮点击处理函数
    const handleGetVerificationCode = async (type) => {
        const configs = {
            register: {
                validateFn: validateRegField,
                fieldName: 'email',
                apiUrl: MAIL_API.SEND_REGISTER_CODE,
                params: { email: regForm.email, username: regForm.username },
                buttonState: vCodeButtonState,
                needCountdown: true,
                countdownFn: startCountdown,
                showSuccessAlert: false,
            },
            login: {
                validateFn: validateField,
                fieldName: 'usernameOrEmail',
                apiUrl: MAIL_API.SEND_LOGIN_CODE,
                params: { usernameOrEmail: loginForm.usernameOrEmail },
                buttonState: loginVCodeButtonState,
                needCountdown: true,
                countdownFn: startLoginCountdown,
                showSuccessAlert: false,
            },
            forgotPassword: {
                validateFn: validateForgotPasswordField,
                fieldName: 'usernameOrEmail',
                apiUrl: MAIL_API.SEND_FORGET_PASSWORD_CODE,
                params: { usernameOrEmail: forgotPasswordForm.usernameOrEmail },
                buttonState: forgotPasswordVCodeButtonState,
                needCountdown: true,
                countdownFn: startForgotPasswordCountdown,
                showSuccessAlert: false,
            }
        };

        const config = configs[type];
        if (!config) {
            console.error(`未知的验证码类型: ${type}`);
            return;
        }

        await sendVerificationCode(config);
    };

    // 发送注册验证码
    const sendRegisterCode = async () => {
        await handleGetVerificationCode('register');
    };

    // 发送登录验证码
    const sendLoginCode = async () => {
        await handleGetVerificationCode('login');
    };

    // 开始倒计时
    const startCountdown = () => {
        vCodeButtonState.countdown = 60;
        vCodeButtonState.text = "60s";

        countdownTimer = setInterval(() => {
            vCodeButtonState.countdown--;

            if (vCodeButtonState.countdown > 0) {
                vCodeButtonState.text = `${vCodeButtonState.countdown}s`;
            } else {
                // 倒计时结束
                clearInterval(countdownTimer);
                vCodeButtonState.disabled = false;
                vCodeButtonState.text = "获取验证码";
            }
        }, 1000);
    };

    // 清除倒计时定时器
    const clearCountdown = () => {
        if (countdownTimer) {
            clearInterval(countdownTimer);
            countdownTimer = null;
        }
        vCodeButtonState.disabled = false;
        vCodeButtonState.text = "获取验证码";
        vCodeButtonState.countdown = 0;
    };

    // 开始登录验证码倒计时
    const startLoginCountdown = () => {
        loginVCodeButtonState.countdown = 60;
        loginVCodeButtonState.text = "60s";

        loginCountdownTimer = setInterval(() => {
            loginVCodeButtonState.countdown--;

            if (loginVCodeButtonState.countdown > 0) {
                loginVCodeButtonState.text = `${loginVCodeButtonState.countdown}s`;
            } else {
                // 倒计时结束
                clearInterval(loginCountdownTimer);
                loginCountdownTimer = null;
                loginVCodeButtonState.disabled = false;
                loginVCodeButtonState.text = "获取验证码";
            }
        }, 1000);
    };

    // 清除登录验证码倒计时定时器
    const clearLoginCountdown = () => {
        if (loginCountdownTimer) {
            clearInterval(loginCountdownTimer);
            loginCountdownTimer = null;
        }
        loginVCodeButtonState.disabled = false;
        loginVCodeButtonState.text = "获取验证码";
        loginVCodeButtonState.countdown = 0;
    };

    // 发送忘记密码验证码
    const sendForgotPasswordCode = async () => {
        await handleGetVerificationCode('forgotPassword');
    };

    // 开始忘记密码倒计时
    const startForgotPasswordCountdown = () => {
        forgotPasswordVCodeButtonState.countdown = 60;
        forgotPasswordVCodeButtonState.text = "60s";

        forgotPasswordCountdownTimer = setInterval(() => {
            forgotPasswordVCodeButtonState.countdown--;

            if (forgotPasswordVCodeButtonState.countdown > 0) {
                forgotPasswordVCodeButtonState.text = `${forgotPasswordVCodeButtonState.countdown}s`;
            } else {
                // 倒计时结束
                clearInterval(forgotPasswordCountdownTimer);
                forgotPasswordVCodeButtonState.disabled = false;
                forgotPasswordVCodeButtonState.text = "获取验证码";
            }
        }, 1000);
    };

    // 清除忘记密码倒计时定时器
    const clearForgotPasswordCountdown = () => {
        if (forgotPasswordCountdownTimer) {
            clearInterval(forgotPasswordCountdownTimer);
            forgotPasswordCountdownTimer = null;
        }
        forgotPasswordVCodeButtonState.disabled = false;
        forgotPasswordVCodeButtonState.text = "获取验证码";
        forgotPasswordVCodeButtonState.countdown = 0;
    };

    // 注册处理
    const handleRegister = async () => {
        // 验证所有字段
        if (!validateRegAll()) {
            return;
        }

        // 验证两次密码是否一致
        if (regForm.password !== regForm.confirmPassword) {
            setRegFieldError('confirmPassword', '两次密码不一致');
            return;
        }

        try {
            // 构建表单数据
            const formData = new URLSearchParams();
            formData.append('username', regForm.username);
            formData.append('password', regForm.password);
            formData.append('confirmPassword', regForm.confirmPassword);

            // 昵称可选，如果为空则不传（后端会自动生成）
            if (regForm.nickname && regForm.nickname.trim()) {
                formData.append('nickname', regForm.nickname);
            }

            formData.append('email', regForm.email);
            formData.append('vCode', regForm.vCode.toUpperCase()); // 验证码转为大写

            // 打印即将发送的数据（调试用）
            console.log('发送注册数据:', {
                username: regForm.username,
                nickname: regForm.nickname || '(未填写，后端将自动生成)',
                email: regForm.email,
            });

            // 调用后端注册接口
            const response = await fetch(AUTH_API.REGISTER, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            });

            const result = await response.json();

            // 打印后端返回的JSON
            console.log('注册接口响应:', JSON.stringify(result, null, 2));

            // 根据业务状态码处理（兼容 code 和 recode 字段）
            const statusCode = result.code || result.recode;
            if (statusCode === 200) {
                console.log('✅ 注册成功');

                // 保存用户名和密码，用于自动填充登录表单
                const registeredUsername = regForm.username;
                const registeredPassword = regForm.password;

                // 清除验证码倒计时
                clearCountdown();

                // 清空注册表单所有输入内容
                for (const key in regForm) {
                    regForm[key] = '';
                }
                // 清空字段验证状态
                for (const key in regFieldStates) {
                    regFieldStates[key] = { status: 'idle', message: '' };
                }

                // ✅ 先填充登录表单的用户名和密码
                loginForm.usernameOrEmail = registeredUsername;
                loginForm.password = registeredPassword;
                console.log('已自动填充登录信息:', { username: registeredUsername });

                // 开始注册按钮倒计时
                let seconds = 3;
                registerButtonState.text = `注册成功，${seconds}秒后返回登录页面`;
                registerButtonState.disabled = true;

                registerCountdownTimer = setInterval(() => {
                    seconds--;
                    if (seconds > 0) {
                        registerButtonState.text = `注册成功，${seconds}秒后返回登录页面`;
                    } else {
                        // 倒计时结束
                        clearInterval(registerCountdownTimer);
                        registerCountdownTimer = null;
                        registerButtonState.text = '注册';
                        registerButtonState.disabled = false;

                        // 切换到登录面板
                        hideFormPanel(); // 先关闭/切换表单面板

                        // 等待动画完成后，显示登录面板
                        if (!isLoginPanelOpen.value) {
                            setTimeout(() => {
                                showLoginPanel(); // ✅ 直接打开登录面板（数据已预先填充）
                            }, 600); // 等待 hideFormPanel 动画完成
                        }
                    }
                }, 1000);
            } else {
                console.error('❌ 注册失败:', result.message);
            }

            return result;

        } catch (error) {
            console.error('网络请求失败:', error);
            alert('网络错误，请稍后重试');
        }
    };

    // 处理忘记密码步骤1提交（步骤2的确定按钮）
    const handleForgotPasswordSubmit = async () => {
        // 验证用户名/邮箱和验证码
        const isUsernameOrEmailValid = validateForgotPasswordField('usernameOrEmail');
        const isVCodeValid = validateForgotPasswordField('vCode');

        // 如果验证失败，则不继续
        if (!isUsernameOrEmailValid || !isVCodeValid) {
            console.log('表单验证失败');
            return;
        }

        console.log('忘记密码步骤2验证通过，准备提交请求');

        // 调用最终提交函数
        await handleForgotPasswordFinalSubmit();
    };

    // 处理忘记密码最终提交（步骤2）
    const handleForgotPasswordFinalSubmit = async () => {
        // 验证所有字段
        const isNewPasswordValid = validateForgotPasswordField('newPassword');
        const isConfirmPasswordValid = validateForgotPasswordField('confirmPassword');
        const isUsernameOrEmailValid = validateForgotPasswordField('usernameOrEmail');
        const isVCodeValid = validateForgotPasswordField('vCode');

        // 如果任何字段验证失败，则不继续
        if (!isNewPasswordValid || !isConfirmPasswordValid || !isUsernameOrEmailValid || !isVCodeValid) {
            console.log('表单验证失败');
            return;
        }

        // 验证两次密码是否一致
        if (forgotPasswordForm.newPassword !== forgotPasswordForm.confirmPassword) {
            setForgotPasswordFieldError('confirmPassword', '两次密码不一致');
            return;
        }

        try {
            // 构建请求参数
            const params = new URLSearchParams();
            params.append('usernameOrEmail', forgotPasswordForm.usernameOrEmail);
            params.append('newPassword', forgotPasswordForm.newPassword);
            params.append('confirmPassword', forgotPasswordForm.confirmPassword);
            params.append('vCode', forgotPasswordForm.vCode.toUpperCase()); // 验证码转为大写

            console.log('发送忘记密码请求数据:', {
                usernameOrEmail: forgotPasswordForm.usernameOrEmail,
                newPassword: '(已加密)',
                confirmPassword: '(已加密)',
                vCode: forgotPasswordForm.vCode.toUpperCase(),
            });

            // 调用后端忘记密码接口
            const response = await fetch(PASSWORD_API.FORGOT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params,
            });

            const result = await response.json();

            // 打印后端返回的响应
            console.log('忘记密码接口响应:', JSON.stringify(result, null, 2));

            // 根据业务状态码处理（兼容 code 和 recode 字段）
            const statusCode = result.code || result.recode;
            if (statusCode === 200) {
                console.log('✅ 密码重置成功');

                // 清除验证码倒计时
                clearForgotPasswordCountdown();

                // 清空忘记密码表单所有输入内容
                for (const key in forgotPasswordForm) {
                    forgotPasswordForm[key] = '';
                }
                // 清空字段验证状态
                for (const key in forgotPasswordFieldStates) {
                    forgotPasswordFieldStates[key] = { status: 'idle', message: '' };
                }

                // 开始确定按钮倒计时
                let seconds = 3;
                forgotPasswordSubmitButtonState.text = `重置成功，${seconds}秒后返回登录页面`;
                forgotPasswordSubmitButtonState.disabled = true;

                forgotPasswordSubmitCountdownTimer = setInterval(() => {
                    seconds--;
                    if (seconds > 0) {
                        forgotPasswordSubmitButtonState.text = `重置成功，${seconds}秒后返回登录页面`;
                    } else {
                        // 倒计时结束
                        clearInterval(forgotPasswordSubmitCountdownTimer);
                        forgotPasswordSubmitCountdownTimer = null;
                        forgotPasswordSubmitButtonState.text = '确定';
                        forgotPasswordSubmitButtonState.disabled = false;

                        // 隐藏忘记密码面板，返回登录页面
                        showPasswordPanel(false);
                    }
                }, 1000);
            } else {
                console.error('❌ 密码重置失败:', result.message);
            }

            return result;

        } catch (error) {
            console.error('网络请求失败:', error);
            alert('网络错误，请稍后重试');
        }
    };

    // 设置忘记密码表单字段验证错误信息
    const setForgotPasswordFieldError = (fieldName, message) => {
        forgotPasswordFieldStates[fieldName].status = "error";
        forgotPasswordFieldStates[fieldName].message = message;
    };

    // 导出数据
    return {
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
        isLoginPanelOpen, // ✅ 导出登录面板状态
        showLoginPanel,
        showRegisterPanel,
        hideFormPanel,
        validateField,
        validateAll,
        validateRegField,
        validateRegAll,
        validateForgotPasswordField,
        validateForgotPasswordAll,
        setFieldError,
        clearFieldState,
        clearRegFieldState,
        clearForgotPasswordFieldState,
        setRegFieldError,
        setForgotPasswordFieldError,
        handleLogin,
        handleRegister,
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
    };
};