import { reactive } from "vue";

/**
 * 登录业务逻辑模块
 * 负责登录、注册、忘记密码等核心业务流程
 */
export const useLoginBusiness = (router, validationModule, verificationModule, animationsModule, notificationCallback = null) => {
    // ==================== 按钮状态 ====================

    // 登录按钮状态
    const loginButtonState = reactive({
        text: "登录",
        disabled: false,
    });

    // 注册按钮状态
    const registerButtonState = reactive({
        text: "注册",
        disabled: false,
    });

    // 忘记密码确定按钮状态
    const forgotPasswordSubmitButtonState = reactive({
        text: "确定",
        disabled: false,
    });

    // ==================== 定时器引用 ====================

    let registerCountdownTimer = null;
    let forgotPasswordSubmitCountdownTimer = null;
    let loginSuccessCountdownTimer = null;

    // ==================== 通用成功倒计时函数 ====================

    /**
     * 通用成功倒计时处理函数
     * @param {Object} options - 配置选项
     * @param {Object} options.buttonState - 按钮状态对象（reactive）
     * @param {string} options.successMessage - 成功消息模板（包含 ${seconds} 占位符）
     * @param {number} options.duration - 倒计时时长（秒），默认 3
     * @param {Function} options.onComplete - 倒计时结束后的回调函数
     * @param {Function} options.setTimer - 设置定时器的函数
     * @param {Function} options.clearTimer - 清除定时器的函数
     */
    const handleSuccessCountdown = (options) => {
        const {
            buttonState,
            successMessage,
            duration = 3,
            onComplete,
            setTimer,
            clearTimer
        } = options;

        let seconds = duration;

        // 设置初始状态
        buttonState.text = successMessage.replace('${seconds}', seconds);
        buttonState.disabled = true;

        // 启动倒计时
        const timer = setInterval(() => {
            seconds--;

            if (seconds > 0) {
                // 更新倒计时文本
                buttonState.text = successMessage.replace('${seconds}', seconds);
            } else {
                // 倒计时结束
                clearInterval(timer);

                // 清理定时器引用
                if (clearTimer) {
                    clearTimer();
                }

                // 恢复按钮状态
                buttonState.disabled = false;

                // 执行回调
                if (onComplete && typeof onComplete === 'function') {
                    onComplete();
                }
            }
        }, 1000);

        // 保存定时器引用
        if (setTimer) {
            setTimer(timer);
        }

        return timer;
    };

    // ==================== 登录处理 ====================

    const handleLogin = async () => {
        // 导入API函数（避免循环依赖）
        const { handleLogin: apiHandleLogin } = await import('../../api/loginViewApi');

        // 验证所有字段
        if (!validationModule.validateAll()) {
            return;
        }

        // 调用 API 层处理登录
        const result = await apiHandleLogin(validationModule.loginForm);

        if (result.success) {
            console.log('[SUCCESS] 登录成功');

            // 使用通用倒计时函数
            handleSuccessCountdown({
                buttonState: loginButtonState,
                successMessage: '登录成功，${seconds}秒后跳转',
                duration: 3,
                onComplete: () => {
                    // 跳转到 HomePage
                    router.push('/');
                },
                setTimer: (timer) => { loginSuccessCountdownTimer = timer; },
                clearTimer: () => { loginSuccessCountdownTimer = null; }
            });
        } else {
            console.error('[ERROR] 登录失败:', result.message);
            if (notificationCallback) {
                notificationCallback('error', result.message || '登录失败，请检查用户名、密码和验证码');
            } else {
                alert(result.message || '登录失败，请检查用户名、密码和验证码');
            }
        }
    };

    // ==================== 注册处理 ====================

    const handleRegister = async () => {
        // 导入API函数（避免循环依赖）
        const { handleRegister: apiHandleRegister } = await import('../../api/loginViewApi');

        // 验证所有字段
        if (!validationModule.validateRegAll()) {
            return;
        }

        // 验证两次密码是否一致
        if (validationModule.regForm.password !== validationModule.regForm.confirmPassword) {
            validationModule.setRegFieldError('confirmPassword', '两次密码不一致');
            return;
        }

        // 调用 API 层处理注册
        const result = await apiHandleRegister(validationModule.regForm);

        if (result.success) {
            console.log('[SUCCESS] 注册成功');

            // 保存用户名和密码，用于自动填充登录表单
            const registeredUsername = result.registeredUsername;
            const registeredPassword = result.registeredPassword;

            // 清除验证码倒计时
            verificationModule.clearCountdown();

            // 清空注册表单所有输入内容
            for (const key in validationModule.regForm) {
                validationModule.regForm[key] = '';
            }
            // 清空字段验证状态
            for (const key in validationModule.regFieldStates) {
                validationModule.regFieldStates[key] = { status: 'idle', message: '' };
            }

            // 先填充登录表单的用户名和密码
            validationModule.loginForm.usernameOrEmail = registeredUsername;
            validationModule.loginForm.password = registeredPassword;
            console.log('已自动填充登录信息:', { username: registeredUsername });

            // 使用通用倒计时函数
            handleSuccessCountdown({
                buttonState: registerButtonState,
                successMessage: '注册成功，${seconds}秒后返回登录页面',
                duration: 3,
                onComplete: () => {
                    // 切换到登录面板
                    animationsModule.hideFormPanel(
                        validationModule.regForm,
                        validationModule.regFieldStates,
                        verificationModule.clearCountdown,
                        registerCountdownTimer,
                        registerButtonState
                    );

                    // 等待动画完成后，显示登录面板
                    if (!animationsModule.isLoginPanelOpen.value) {
                        setTimeout(() => {
                            animationsModule.showLoginPanel();
                        }, 600);
                    }
                },
                setTimer: (timer) => { registerCountdownTimer = timer; },
                clearTimer: () => { registerCountdownTimer = null; }
            });
        } else {
            console.error('[ERROR] 注册失败:', result.message);
            if (notificationCallback) {
                notificationCallback('error', result.message || '注册失败');
            } else {
                alert(result.message || '注册失败');
            }
        }
    };

    // ==================== 忘记密码处理 ====================

    // 处理忘记密码步骤1提交
    const handleForgotPasswordSubmit = async () => {
        // 验证用户名/邮箱和验证码
        const isUsernameOrEmailValid = validationModule.validateForgotPasswordField('usernameOrEmail');
        const isVCodeValid = validationModule.validateForgotPasswordField('vCode');

        if (!isUsernameOrEmailValid || !isVCodeValid) {
            console.log('表单验证失败');
            return;
        }

        console.log('忘记密码步骤2验证通过，准备提交请求');

        // 调用最终提交函数
        await handleForgotPasswordFinalSubmit();
    };

    // 处理忘记密码最终提交
    const handleForgotPasswordFinalSubmit = async () => {
        // 导入API函数（避免循环依赖）
        const { handleForgotPassword: apiHandleForgotPassword } = await import('../../api/loginViewApi');

        // 验证所有字段
        const isNewPasswordValid = validationModule.validateForgotPasswordField('newPassword');
        const isConfirmPasswordValid = validationModule.validateForgotPasswordField('confirmPassword');
        const isUsernameOrEmailValid = validationModule.validateForgotPasswordField('usernameOrEmail');
        const isVCodeValid = validationModule.validateForgotPasswordField('vCode');

        if (!isNewPasswordValid || !isConfirmPasswordValid || !isUsernameOrEmailValid || !isVCodeValid) {
            console.log('表单验证失败');
            return;
        }

        // 验证两次密码是否一致
        if (validationModule.forgotPasswordForm.newPassword !== validationModule.forgotPasswordForm.confirmPassword) {
            validationModule.setForgotPasswordFieldError('confirmPassword', '两次密码不一致');
            return;
        }

        // 调用 API 层处理忘记密码
        const result = await apiHandleForgotPassword(validationModule.forgotPasswordForm);

        if (result.success) {
            console.log('[SUCCESS] 密码重置成功');

            // 清除验证码倒计时
            verificationModule.clearForgotPasswordCountdown();

            // 清空忘记密码表单所有输入内容
            for (const key in validationModule.forgotPasswordForm) {
                validationModule.forgotPasswordForm[key] = '';
            }
            // 清空字段验证状态
            for (const key in validationModule.forgotPasswordFieldStates) {
                validationModule.forgotPasswordFieldStates[key] = { status: 'idle', message: '' };
            }

            // 使用通用倒计时函数
            handleSuccessCountdown({
                buttonState: forgotPasswordSubmitButtonState,
                successMessage: '重置成功，${seconds}秒后返回登录页面',
                duration: 3,
                onComplete: () => {
                    // 隐藏忘记密码面板，返回登录页面
                    animationsModule.showPasswordPanel(false);
                },
                setTimer: (timer) => { forgotPasswordSubmitCountdownTimer = timer; },
                clearTimer: () => { forgotPasswordSubmitCountdownTimer = null; }
            });
        } else {
            console.error('[ERROR] 密码重置失败:', result.message);
            alert(result.message || '密码重置失败');
        }
    };

    return {
        // 按钮状态
        loginButtonState,
        registerButtonState,
        forgotPasswordSubmitButtonState,
        // 业务逻辑
        handleLogin,
        handleRegister,
        handleForgotPasswordSubmit,
        handleForgotPasswordFinalSubmit,
        handleSuccessCountdown,
    };
};
