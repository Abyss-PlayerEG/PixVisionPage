import { reactive } from "vue";

/**
 * 表单验证模块
 * 负责所有表单的验证规则、验证逻辑和状态管理
 */
export const useFormValidation = () => {
    // ==================== 验证规则常量 ====================

    // 通用验证规则（复用）
    const COMMON_RULES = {
        // 用户名/邮箱验证
        usernameOrEmail: [
            { validator: (v) => !!v, message: "用户名/邮箱不能为空" },
            {
                validator: (v) => /^[a-zA-Z0-9_]{5,16}$/.test(v) || /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(v),
                message: "用户名或邮箱不正确"
            },
        ],
        // 密码验证
        password: [
            { validator: (v) => !!v, message: "密码不能为空" },
            { validator: (v) => /^[a-zA-Z0-9_.]{6,16}$/.test(v), message: "6-16位，只允许字母、数字、\"_\"、\".\"" },
        ],
        // 验证码验证（支持大小写）
        vCode: [
            { validator: (v) => !!v, message: "验证码不能为空" },
            { validator: (v) => /^[0-9A-Za-z]{6}$/.test(v), message: "6位字母和数字" },
        ],
    };

    // 登录表单字段验证规则
    const FIELD_RULES = {
        usernameOrEmail: COMMON_RULES.usernameOrEmail,
        password: COMMON_RULES.password,
        vCode: COMMON_RULES.vCode,
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
        password: COMMON_RULES.password,
        confirmPassword: [
            { validator: (v) => !!v, message: "请再次输入密码" },
            { validator: (v) => /^[a-zA-Z0-9_.]{6,16}$/.test(v), message: "6-16位，2只允许字母、数字、\"_\"、\".\"" },
            { validator: (v, regForm) => v === regForm.password, message: "两次密码不一致" },
        ],
        email: [
            { validator: (v) => !!v, message: "邮箱不能为空" },
            { validator: (v) => /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(v), message: "邮箱格式不正确" },
        ],
        vCode: COMMON_RULES.vCode,
    };

    // 忘记密码表单验证规则
    const FORGOT_PASSWORD_FIELD_RULES = {
        usernameOrEmail: COMMON_RULES.usernameOrEmail,
        newPassword: COMMON_RULES.password.map(rule => ({
            ...rule,
            message: rule.message.replace('密码', '新密码')
        })),
        confirmPassword: [
            { validator: (v) => !!v, message: "请再次输入密码" },
            { validator: (v) => /^[a-zA-Z0-9_.]{6,16}$/.test(v), message: "6-16位，只允许字母、数字、\"_\"、\".\"" },
            { validator: (v, forgotPasswordForm) => v === forgotPasswordForm.newPassword, message: "两次密码不一致" },
        ],
        vCode: COMMON_RULES.vCode,
    };

    // ==================== 表单数据 ====================

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

    // ==================== 字段验证状态 ====================

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

    // ==================== 登录表单验证函数 ====================

    // 验证登录表单单个字段
    const validateField = (fieldName) => {
        const value = loginForm[fieldName];
        const rules = FIELD_RULES[fieldName] || [];

        for (const rule of rules) {
            if (!rule.validator(value)) {
                fieldStates[fieldName].status = "error";
                fieldStates[fieldName].message = rule.message;
                return false;
            }
        }

        fieldStates[fieldName].status = "success";
        fieldStates[fieldName].message = "";
        return true;
    };

    // 验证登录表单所有字段
    const validateAll = () => {
        let allPassed = true;
        for (const fieldName in FIELD_RULES) {
            if (!validateField(fieldName)) {
                allPassed = false;
            }
        }
        return allPassed;
    };

    // 设置登录表单字段错误信息
    const setFieldError = (fieldName, message) => {
        fieldStates[fieldName].status = "error";
        fieldStates[fieldName].message = message;
    };

    // 清除登录表单字段验证状态
    const clearFieldState = (fieldName) => {
        fieldStates[fieldName].status = "idle";
        fieldStates[fieldName].message = "";
    };

    // ==================== 注册表单验证函数 ====================

    // 验证注册表单单个字段
    const validateRegField = (fieldName) => {
        const value = regForm[fieldName];
        const rules = REG_FIELD_RULES[fieldName] || [];

        for (const rule of rules) {
            // 特殊处理：confirmPassword需要访问regForm
            if (fieldName === 'confirmPassword' && rule.validator.length > 1) {
                if (!rule.validator(value, regForm)) {
                    regFieldStates[fieldName].status = "error";
                    regFieldStates[fieldName].message = rule.message;
                    return false;
                }
            } else {
                if (!rule.validator(value)) {
                    regFieldStates[fieldName].status = "error";
                    regFieldStates[fieldName].message = rule.message;
                    return false;
                }
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

    // 设置注册表单字段错误信息
    const setRegFieldError = (fieldName, message) => {
        regFieldStates[fieldName].status = "error";
        regFieldStates[fieldName].message = message;
    };

    // ==================== 忘记密码表单验证函数 ====================

    // 验证忘记密码表单单个字段
    const validateForgotPasswordField = (fieldName) => {
        const value = forgotPasswordForm[fieldName];
        const rules = FORGOT_PASSWORD_FIELD_RULES[fieldName] || [];

        for (const rule of rules) {
            // 特殊处理：confirmPassword需要访问forgotPasswordForm
            if (fieldName === 'confirmPassword' && rule.validator.length > 1) {
                if (!rule.validator(value, forgotPasswordForm)) {
                    forgotPasswordFieldStates[fieldName].status = "error";
                    forgotPasswordFieldStates[fieldName].message = rule.message;
                    return false;
                }
            } else {
                if (!rule.validator(value)) {
                    forgotPasswordFieldStates[fieldName].status = "error";
                    forgotPasswordFieldStates[fieldName].message = rule.message;
                    return false;
                }
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

    // 设置忘记密码表单字段错误信息
    const setForgotPasswordFieldError = (fieldName, message) => {
        forgotPasswordFieldStates[fieldName].status = "error";
        forgotPasswordFieldStates[fieldName].message = message;
    };

    return {
        // 表单数据
        loginForm,
        regForm,
        forgotPasswordForm,
        // 字段状态
        fieldStates,
        regFieldStates,
        forgotPasswordFieldStates,
        // 登录验证
        validateField,
        validateAll,
        setFieldError,
        clearFieldState,
        // 注册验证
        validateRegField,
        validateRegAll,
        clearRegFieldState,
        setRegFieldError,
        // 忘记密码验证
        validateForgotPasswordField,
        validateForgotPasswordAll,
        clearForgotPasswordFieldState,
        setForgotPasswordFieldError,
    };
};
