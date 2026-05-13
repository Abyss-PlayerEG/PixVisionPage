import { gsap } from "gsap";
import { ref, onMounted } from "vue";

/**
 * 登录页面动画管理模块
 * 负责所有GSAP动画的初始化和控制
 */
export const useLoginAnimations = () => {
    let aniEND = false; // 动画完成标志
    const activePanel = ref("");
    const isLoginPanelOpen = ref(false);

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
                gsap.set(".fadeIn_loginBt", { clearProps: "all" });
                gsap.set(".fadeIn_loginInput", { clearProps: "all" });
                gsap.set(".fadeIn_loginItem", { clearProps: "all" });
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
        const tl = gsap.timeline();

        aniEND = false;
        activePanel.value = "login";
        isLoginPanelOpen.value = true;
        console.log("登录面板状态：" + isLoginPanelOpen.value);

        tl.to(title1.value, {
            y: -250,
            opacity: 0,
            duration: 0.4,
            ease: "power2.out",
        });

        tl.to(title2.value, {
            y: -300,
            opacity: 0,
            duration: 0.5,
            ease: "power2.out",
        }, "<");

        tl.to(loginFormZone.value, {
            bottom: 0,
            duration: 0.6,
            ease: "power2.Out",
        }, "<");

        tl.to(bgimg.value, {
            width: "100vw",
            height: "100vh",
            duration: 0.6,
            ease: "power2.Out",
        }, "<");

        tl.from(".fadeIn_loginInput", {
            y: 100,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
        }, "<");

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

        tl.to(lfzTitle.value, {
            opacity: .1,
            duration: 0.6,
            ease: "power2.Out",
        });

        tl.to('#Xzone', {
            bottom: 0,
            duration: 0.5,
            ease: "power2.out",
        }, "<");

        tl.to(".xzone_input", {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.06,
            ease: "power2.out",
        }, "-=0.2");

        tl.to(".xzone_input_vcode", {
            y: 0,
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
        }, "-=0.4");

        tl.to(".xzone_registerBt", {
            y: 0,
            opacity: 1,
            duration: 0.4,
            ease: "power2.inOut",
        }, "<");

        tl.to(".xzone_tips", {
            delay: 0.1,
            y: 0,
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
        });
    };

    // 隐藏表单面板
    const hideFormPanel = (regForm, regFieldStates, clearCountdown, registerCountdownTimer, registerButtonState) => {
        // 优先：如果注册面板打开 -> 只关闭注册
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
                isLoginPanelOpen.value = false;
                console.log("登录面板状态：" + isLoginPanelOpen.value);
            }
        });

        tl.to(loginFormZone.value, {
            bottom: -700,
            duration: 0.5,
            ease: "power2.in",
        }, 0);

        tl.to(bgimg.value, {
            width: "120vw",
            height: "120vh",
            duration: 0.5,
            ease: "power2.in",
        }, 0);

        tl.to(title1.value, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, 0.2);
        tl.to(title2.value, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, 0.2);

        tl.set(loginFormZone.value, { bottom: -700 });
        tl.set("#Xzone", { bottom: -600 });

        aniEND = false;
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
    };
};
