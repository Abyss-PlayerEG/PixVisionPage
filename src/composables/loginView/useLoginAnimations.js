import { gsap } from "gsap";
import { ref, onMounted } from "vue";

/**
 * 登录页面动画管理模块
 * 负责所有GSAP动画的初始化和控制
 */
export const useLoginAnimations = (validationModule = null, verificationModule = null, businessModule = null) => {
    let aniEND = false; // 动画完成标志
    const activePanel = ref("");
    const isLoginPanelOpen = ref(false);
    
    // ✅ 修复：保存模块引用，支持后续设置
    let _validationModule = validationModule;
    let _verificationModule = verificationModule;
    let _businessModule = businessModule;
    
    // ✅ 修复：保存timeline引用，用于正确清理动画
    let registerTimeline = null;
    let loginTimeline = null;

    // DOM元素引用
    const bgimg = ref(null);
    const lfzTitle = ref(null);
    const title1 = ref(null);
    const title2 = ref(null);
    const loginFormZone = ref(null);

    // GSAP动画时间轴
    let tl_showpass1 = null;
    let tl_showpass2 = null;
    let tl_backtopass1 = null;
    
    // ✅ 修复：保存忘记密码相关的timeline引用，纳入统一管理
    let forgotPasswordTimeline = null;

    // 初始化动画时间轴
    onMounted(() => {
        // 忘记密码01 - 显示动画
        tl_showpass1 = gsap.timeline({
            paused: true,
            reversed: true,
            onComplete: () => {
                gsap.set("#Zzone", { pointerEvents: "auto" });
                gsap.set(".s1", { pointerEvents: "auto" });
                gsap.set(".s2", { pointerEvents: "none" });
            }
        })
            .to(".fadeIn_loginItem", {
                x: 100,
                opacity: 0,
                ease: "power2.in",
            }, "<")
            .to(".fadeIn_loginBt", {
                x: 100,
                opacity: 0,
                duration: 0.6,
                ease: "power2.in",
            }, "<")
            .to(".fadeIn_loginInput", {
                x: 100,
                stagger: -0.1,
                opacity: 0,
                duration: 0.5,
                ease: "power2.inOut",
            })
            .fromTo("#Zzone", {
                x: "-70%",
                opacity: 0,
            }, {
                x: "-50%",
                opacity: 1,
                delay: 0.5,
                duration: 1,
                ease: "power3.out",
                pointerEvents: "auto",
            }, '<');

        // 忘记密码01 - 返回动画（独立动画，非reverse）
        tl_backtopass1 = gsap.timeline({
            paused: true,
            onComplete: () => {
                tl_backtopass1.progress(0).pause();
                tl_showpass1.reverse().progress(0).pause();
                gsap.set("#Zzone", {
                    x: "-70%",
                    opacity: 0,
                    pointerEvents: "none"
                });
                gsap.set(".s1", { x: 0, opacity: 1 });
                gsap.set(".s2", { x: "100%", opacity: 0 });
                
                // ✅ 修复：不使用clearProps，而是明确设置正确的最终状态
                // clearProps会清除所有GSAP样式，导致元素回到CSS默认状态，可能引起显示问题
                gsap.set(".fadeIn_loginBt", { x: 0, opacity: 1 });
                gsap.set(".fadeIn_loginInput", { x: 0, opacity: 1 });
                gsap.set(".fadeIn_loginItem", { x: 0, opacity: 1 });
            }
        })
            .to(".s1, .s2", {
                pointerEvents: "none",
                duration: 0,
            }, 0)
            .to("#Zzone", {
                x: "-100%",
                opacity: 0,
                duration: 0.8,
                ease: "power3.in",
            })
            .to(".fadeIn_loginInput", {
                x: 0,
                opacity: 1,
                stagger: 0.1,
                duration: 0.6,
                ease: "power2.out",
            }, "-=0.2")
            .to(".fadeIn_loginBt", {
                delay: 0.1,
                x: 0,
                opacity: 1,
                duration: 0.6,
                ease: "power2.out",
            }, "<")
            .to(".fadeIn_loginItem", {
                delay: .5,
                x: 0,
                opacity: 1,
                duration: 0.6,
                ease: "power2.out",
            }, "<");

        // 忘记密码02 - 切换动画
        tl_showpass2 = gsap.timeline({
            paused: true,
            reversed: true,
            onComplete: () => {
                gsap.set(".s1", { pointerEvents: "none" });
                gsap.set(".s2", { pointerEvents: "auto" });
            },
            onReverseComplete: () => {
                gsap.set(".s2", { pointerEvents: "none" });
                gsap.set(".s1", { pointerEvents: "auto" });
                tl_showpass2.progress(0).pause();
            }
        }).to(".s1", {
            x: "100%",
            opacity: 0,
            duration: 1,
            ease: "power2.inOut",
        })
            .fromTo(".s2", {
                x: "0%",
                opacity: 0,
            }, {
                delay: 0.2,
                x: "100%",
                opacity: 1,
                duration: 1,
                ease: "power2.inOut",
            }, "<")
            .to(".pr-2", {
                x: "80%",
                opacity: 1,
                duration: 1,
                ease: "power2.inOut",
            }, "<");
    });

    // 忘记密码01 - 显示/隐藏
    const showPasswordPanel = (play) => {
        if (play) {
            tl_showpass2.progress(0).pause();
            gsap.set(".s1", {
                pointerEvents: "auto !important",
                x: 0,
                opacity: 1
            });
            gsap.set(".s2", {
                pointerEvents: "none",
                x: "100%",
                opacity: 0
            });
            gsap.set(".pr-2", { x: "0%", color: "#4e4e4e" });
            tl_showpass1.play();
        } else {
            tl_backtopass1.play();
        }
    };

    // 忘记密码02 - 切换步骤
    const showPasswordPanel2 = (play) => {
        if (play) {
            tl_showpass2.play();
        } else {
            tl_showpass2.reverse();
        }
    };

    // 显示登录面板
    const showLoginPanel = () => {
        // ✅ 修复：先kill掉旧的timeline，防止冲突
        if (loginTimeline) {
            loginTimeline.kill();
            loginTimeline = null;
        }
        if (registerTimeline) {
            registerTimeline.kill();
            registerTimeline = null;
        }
        // ✅ 修复：kill掉忘记密码相关的timeline
        if (forgotPasswordTimeline) {
            forgotPasswordTimeline.kill();
            forgotPasswordTimeline = null;
        }
        if (tl_showpass1) {
            tl_showpass1.kill();
        }
        if (tl_backtopass1) {
            tl_backtopass1.kill();
        }
        if (tl_showpass2) {
            tl_showpass2.kill();
        }
        
        gsap.killTweensOf([title1.value, title2.value, loginFormZone.value, bgimg.value, ".fadeIn_loginInput", ".fadeIn_loginBt", ".fadeIn_loginItem"]);
        
        loginTimeline = gsap.timeline();

        aniEND = false;
        activePanel.value = "login";
        isLoginPanelOpen.value = true;
        console.log("登录面板状态：" + isLoginPanelOpen.value);

        loginTimeline.to(title1.value, {
            y: -250,
            opacity: 0,
            duration: 0.4,
            ease: "power2.out",
        });

        loginTimeline.to(title2.value, {
            y: -300,
            opacity: 0,
            duration: 0.5,
            ease: "power2.out",
        }, "<");

        loginTimeline.to(loginFormZone.value, {
            bottom: 0,
            duration: 0.6,
            ease: "power2.Out",
        }, "<");

        loginTimeline.to(bgimg.value, {
            width: "100vw",
            height: "100vh",
            duration: 0.6,
            ease: "power2.Out",
        }, "<");

        // ✅ 修复：使用fromTo明确指定起点和终点，避免状态残留问题
        loginTimeline.fromTo(".fadeIn_loginInput",
            { y: 100, opacity: 0 },  // 明确的起点
            {
                y: 0,
                opacity: 1,
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
        // ✅ 修复：先kill掉旧的timeline，防止冲突
        if (registerTimeline) {
            registerTimeline.kill();
            registerTimeline = null;
        }
        if (loginTimeline) {
            loginTimeline.kill();
            loginTimeline = null;
        }
        // ✅ 修复：kill掉忘记密码相关的timeline
        if (forgotPasswordTimeline) {
            forgotPasswordTimeline.kill();
            forgotPasswordTimeline = null;
        }
        if (tl_showpass1) {
            tl_showpass1.kill();
        }
        if (tl_backtopass1) {
            tl_backtopass1.kill();
        }
        if (tl_showpass2) {
            tl_showpass2.kill();
        }
        
        gsap.killTweensOf([lfzTitle.value, '#Xzone', '.xzone_input', '.xzone_input_vcode', '.xzone_registerBt', '.xzone_tips']);
        
        registerTimeline = gsap.timeline();
        activePanel.value = "register";

        registerTimeline.set(".xzone_registerBt", { y: 20, opacity: 0 });
        registerTimeline.set(".xzone_tips", { y: 20, opacity: 0 });
        registerTimeline.set(".xzone_input", { y: 30, opacity: 0 });
        registerTimeline.set(".xzone_input_vcode", { y: 30, opacity: 0 });

        registerTimeline.to(lfzTitle.value, {
            opacity: .1,
            duration: 0.6,
            ease: "power2.Out",
        });

        registerTimeline.to('#Xzone', {
            bottom: 0,
            duration: 0.5,
            ease: "power2.out",
        }, "<");

        registerTimeline.to(".xzone_input", {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.06,
            ease: "power2.out",
        }, "-=0.2");

        registerTimeline.to(".xzone_input_vcode", {
            y: 0,
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
        }, "-=0.4");

        registerTimeline.to(".xzone_registerBt", {
            y: 0,
            opacity: 1,
            duration: 0.4,
            ease: "power2.inOut",
        }, "<");

        registerTimeline.to(".xzone_tips", {
            delay: 0.1,
            y: 0,
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
        });
        
        // ✅ 修复：注册面板动画完成后设置aniEND标志
        aniEND = true;
    };

    // 隐藏表单面板（无参数版本，直接从模块内部获取数据）
    const hideFormPanel = () => {
        // ✅ 修复：从模块内部获取所需数据，避免事件对象传递问题
        const regForm = _validationModule?.regForm;
        const regFieldStates = _validationModule?.regFieldStates;
        const clearCountdown = _verificationModule?.clearCountdown;
        const registerButtonState = _businessModule?.registerButtonState;
        let registerCountdownTimer = null; // 定时器引用应该在verificationModule中管理
        
        // 优先：如果注册面板打开 -> 只关闭注册
        if (activePanel.value === "register") {
            // ✅ 修复：先kill掉注册面板的timeline，立即停止进入动画
            if (registerTimeline) {
                registerTimeline.kill();
                registerTimeline = null;
            }
            
            // ✅ 修复：使用immediateRender确保opacity立即设置为1，避免颜色问题
            gsap.set(lfzTitle.value, { opacity: 1 });
            
            // ✅ 修复：使用overwrite: true确保新动画立即覆盖旧动画
            gsap.to("#Xzone", {
                bottom: -700,
                duration: 0.4,
                ease: "power2.in",
                overwrite: true,  // ✅ 关键：立即覆盖之前的动画
                onComplete: () => {
                    gsap.set("#Xzone", { bottom: -600 });
                    
                    // ✅ 修复：安全检查，确保regForm是对象而非事件对象
                    if (regForm && typeof regForm === 'object' && !regForm.preventDefault) {
                        // 清理注册表单
                        for (const key in regForm) {
                            if (regForm.hasOwnProperty(key)) {
                                regForm[key] = "";
                            }
                        }
                    }
                    
                    if (regFieldStates && typeof regFieldStates === 'object') {
                        for (const key in regFieldStates) {
                            if (regFieldStates.hasOwnProperty(key)) {
                                regFieldStates[key] = { status: "idle", message: "" };
                            }
                        }
                    }
                    
                    // 清除验证码倒计时
                    if (clearCountdown && typeof clearCountdown === 'function') {
                        clearCountdown();
                    }
                    
                    // 恢复按钮状态
                    if (registerButtonState) {
                        registerButtonState.text = '注册';
                        registerButtonState.disabled = false;
                    }
                    
                    // ✅ 修复：注册面板关闭完成后重置aniEND标志
                    aniEND = true;
                },
            });
            activePanel.value = "";  // ✅ 修复：关闭注册面板后应设置为空
            return;
        }

        // 关闭登录面板
        if (!aniEND) return;
        
        // ✅ 修复：先kill掉旧的timeline
        if (loginTimeline) {
            loginTimeline.kill();
            loginTimeline = null;
        }
        if (registerTimeline) {
            registerTimeline.kill();
            registerTimeline = null;
        }

        loginTimeline = gsap.timeline({
            onComplete: () => {
                aniEND = true;
                activePanel.value = "";
                isLoginPanelOpen.value = false;
                console.log("登录面板状态：" + isLoginPanelOpen.value);
            }
        });

        loginTimeline.to(loginFormZone.value, {
            bottom: -700,
            duration: 0.5,
            ease: "power2.in",
        }, 0);

        loginTimeline.to(bgimg.value, {
            width: "120vw",
            height: "120vh",
            duration: 0.5,
            ease: "power2.in",
        }, 0);

        loginTimeline.to(title1.value, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, 0.2);
        loginTimeline.to(title2.value, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, 0.2);

        // ✅ 修复：重置输入框和面板位置到初始状态
        loginTimeline.set(".fadeIn_loginInput", { y: 100, opacity: 0 });
        loginTimeline.set(loginFormZone.value, { bottom: -700 });
        loginTimeline.set("#Xzone", { bottom: -600 });

        aniEND = false;
    };

    // ✅ 修复：提供方法用于设置businessModule（解决循环依赖）
    const __setBusinessModule = (module) => {
        _businessModule = module;
    };

    return {
        bgimg,
        lfzTitle,
        title1,
        title2,
        loginFormZone,
        activePanel,
        isLoginPanelOpen,
        showPasswordPanel,
        showPasswordPanel2,
        showLoginPanel,
        showRegisterPanel,
        hideFormPanel,
        __setBusinessModule,  // ✅ 导出设置方法
    };
};
