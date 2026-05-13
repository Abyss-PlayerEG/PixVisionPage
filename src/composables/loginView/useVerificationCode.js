import { reactive } from "vue";
import {
    sendRegisterCode as apiSendRegisterCode,
    sendLoginCode as apiSendLoginCode,
    sendForgotPasswordCode as apiSendForgotPasswordCode
} from '../../api/loginViewApi';

/**
 * 验证码和倒计时管理模块
 * 负责所有场景的验证码发送和倒计时逻辑
 */
export const useVerificationCode = (validationModule) => {
    // ==================== 按钮状态 ====================

    // 注册验证码按钮状态
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

    // 忘记密码验证码按钮状态
    const forgotPasswordVCodeButtonState = reactive({
        text: "获取验证码",
        disabled: false,
        countdown: 0,
    });

    // ==================== 定时器引用 ====================

    let countdownTimer = null;
    let loginCountdownTimer = null;
    let forgotPasswordCountdownTimer = null;

    // ==================== 通用验证码发送函数 ====================

    const sendVerificationCode = async (options) => {
        const {
            validateFn,
            fieldName,
            buttonState,
            needCountdown = false,
            countdownFn = null,
            showSuccessAlert = true,
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

        try {
            // 设置按钮状态为发送中
            buttonState.disabled = true;
            buttonState.text = "发送中";

            // 调用 API 层发送验证码
            let result;
            if (options.apiType === 'register') {
                result = await apiSendRegisterCode(options.params, validateFn);
            } else if (options.apiType === 'login') {
                result = await apiSendLoginCode(options.params, validateFn);
            } else if (options.apiType === 'forgotPassword') {
                result = await apiSendForgotPasswordCode(options.params, validateFn);
            }

            if (result.success) {
                console.log("[SUCCESS] 验证码发送成功");

                if (needCountdown && countdownFn) {
                    // 需要倒计时
                    countdownFn();
                } else if (showSuccessAlert) {
                    // 不需要倒计时，但显示提示并恢复按钮
                    alert(successMessage);
                    buttonState.disabled = false;
                    buttonState.text = "获取验证码";
                }
            } else {
                // 发送失败，恢复按钮状态
                buttonState.disabled = false;
                buttonState.text = "获取验证码";
                console.error(`[ERROR] ${errorMessagePrefix}:`, result.message);
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

    // ==================== 统一验证码入口 ====================

    const handleGetVerificationCode = async (type) => {
        const configs = {
            register: {
                apiType: 'register',
                validateFn: validationModule.validateRegField,
                fieldName: 'email',
                params: { email: validationModule.regForm.email, username: validationModule.regForm.username },
                buttonState: vCodeButtonState,
                needCountdown: true,
                countdownFn: startCountdown,
                showSuccessAlert: false,
            },
            login: {
                apiType: 'login',
                validateFn: validationModule.validateField,
                fieldName: 'usernameOrEmail',
                params: { usernameOrEmail: validationModule.loginForm.usernameOrEmail },
                buttonState: loginVCodeButtonState,
                needCountdown: true,
                countdownFn: startLoginCountdown,
                showSuccessAlert: false,
            },
            forgotPassword: {
                apiType: 'forgotPassword',
                validateFn: validationModule.validateForgotPasswordField,
                fieldName: 'usernameOrEmail',
                params: { usernameOrEmail: validationModule.forgotPasswordForm.usernameOrEmail },
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

    // ==================== 各场景验证码发送 ====================

    // 发送注册验证码
    const sendRegisterCode = async () => {
        await handleGetVerificationCode('register');
    };

    // 发送登录验证码
    const sendLoginCode = async () => {
        await handleGetVerificationCode('login');
    };

    // 发送忘记密码验证码
    const sendForgotPasswordCode = async () => {
        await handleGetVerificationCode('forgotPassword');
    };

    // ==================== 注册倒计时管理 ====================

    // 开始注册倒计时
    const startCountdown = () => {
        vCodeButtonState.countdown = 60;
        vCodeButtonState.text = "60s";

        countdownTimer = setInterval(() => {
            vCodeButtonState.countdown--;

            if (vCodeButtonState.countdown > 0) {
                vCodeButtonState.text = `${vCodeButtonState.countdown}s`;
            } else {
                clearInterval(countdownTimer);
                vCodeButtonState.disabled = false;
                vCodeButtonState.text = "获取验证码";
            }
        }, 1000);
    };

    // 清除注册倒计时
    const clearCountdown = () => {
        if (countdownTimer) {
            clearInterval(countdownTimer);
            countdownTimer = null;
        }
        vCodeButtonState.disabled = false;
        vCodeButtonState.text = "获取验证码";
        vCodeButtonState.countdown = 0;
    };

    // ==================== 登录倒计时管理 ====================

    // 开始登录倒计时
    const startLoginCountdown = () => {
        loginVCodeButtonState.countdown = 60;
        loginVCodeButtonState.text = "60s";

        loginCountdownTimer = setInterval(() => {
            loginVCodeButtonState.countdown--;

            if (loginVCodeButtonState.countdown > 0) {
                loginVCodeButtonState.text = `${loginVCodeButtonState.countdown}s`;
            } else {
                clearInterval(loginCountdownTimer);
                loginCountdownTimer = null;
                loginVCodeButtonState.disabled = false;
                loginVCodeButtonState.text = "获取验证码";
            }
        }, 1000);
    };

    // 清除登录倒计时
    const clearLoginCountdown = () => {
        if (loginCountdownTimer) {
            clearInterval(loginCountdownTimer);
            loginCountdownTimer = null;
        }
        loginVCodeButtonState.disabled = false;
        loginVCodeButtonState.text = "获取验证码";
        loginVCodeButtonState.countdown = 0;
    };

    // ==================== 忘记密码倒计时管理 ====================

    // 开始忘记密码倒计时
    const startForgotPasswordCountdown = () => {
        forgotPasswordVCodeButtonState.countdown = 60;
        forgotPasswordVCodeButtonState.text = "60s";

        forgotPasswordCountdownTimer = setInterval(() => {
            forgotPasswordVCodeButtonState.countdown--;

            if (forgotPasswordVCodeButtonState.countdown > 0) {
                forgotPasswordVCodeButtonState.text = `${forgotPasswordVCodeButtonState.countdown}s`;
            } else {
                clearInterval(forgotPasswordCountdownTimer);
                forgotPasswordVCodeButtonState.disabled = false;
                forgotPasswordVCodeButtonState.text = "获取验证码";
            }
        }, 1000);
    };

    // 清除忘记密码倒计时
    const clearForgotPasswordCountdown = () => {
        if (forgotPasswordCountdownTimer) {
            clearInterval(forgotPasswordCountdownTimer);
            forgotPasswordCountdownTimer = null;
        }
        forgotPasswordVCodeButtonState.disabled = false;
        forgotPasswordVCodeButtonState.text = "获取验证码";
        forgotPasswordVCodeButtonState.countdown = 0;
    };

    return {
        // 按钮状态
        vCodeButtonState,
        loginVCodeButtonState,
        forgotPasswordVCodeButtonState,
        // 验证码发送
        sendRegisterCode,
        sendLoginCode,
        sendForgotPasswordCode,
        handleGetVerificationCode,
        // 倒计时管理
        startCountdown,
        clearCountdown,
        startLoginCountdown,
        clearLoginCountdown,
        startForgotPasswordCountdown,
        clearForgotPasswordCountdown,
    };
};
