import { useRouter } from "vue-router";
import { useLoginAnimations } from './loginView/useLoginAnimations';
import { useFormValidation } from './loginView/useFormValidation';
import { useVerificationCode } from './loginView/useVerificationCode';
import { useLoginBusiness } from './loginView/useLoginBusiness';

/**
 * 登录页面主入口
 * 整合动画、验证、验证码、业务逻辑四大模块
 */
export const useLoginView = (notificationCallback = null) => {
    const router = useRouter();

    // 初始化各功能模块
    const validation = useFormValidation();
    const verification = useVerificationCode(validation, notificationCallback);  // 传入 validation 模块和通知回调
    const animations = useLoginAnimations(validation, verification, null);  // ✅ 传入依赖模块
    const business = useLoginBusiness(router, validation, verification, animations, notificationCallback);
    
    // ✅ 修复：将businessModule传递给animations，用于hideFormPanel
    animations.__setBusinessModule(business);

    // 导出数据 - 合并所有模块的导出
    return {
        router,
        // 动画模块
        ...animations,
        // 验证模块
        ...validation,
        // 验证码模块
        ...verification,
        // 业务逻辑模块
        ...business,
    };
};
