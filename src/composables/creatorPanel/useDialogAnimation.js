/**
 * 通用弹窗动画 Composable
 * 封装 GSAP 弹窗的入场/退场动画
 * 
 * @module useDialogAnimation
 */

import { nextTick } from 'vue'
import gsap from 'gsap'

/**
 * 创建弹窗动画控制器
 * @param {import('vue').Ref} overlayRef - 遮罩层 ref
 * @param {import('vue').Ref} dialogRef - 弹窗内容 ref
 * @param {Object} options - 配置选项
 * @param {Function} options.onOpen - 打开后的回调
 * @param {Function} options.onClose - 关闭后的回调
 * @returns {{ open: Function, close: Function }}
 */
export const useDialogAnimation = (overlayRef, dialogRef, options = {}) => {
  const { onOpen, onClose } = options

  /**
   * 打开弹窗（入场动画）
   * 需要在 showXxx.value = true 之后的 nextTick 中调用
   */
  const open = () => {
    nextTick(() => {
      if (!overlayRef.value || !dialogRef.value) return
      
      gsap.set(overlayRef.value, { autoAlpha: 0 })
      gsap.set(dialogRef.value, { scale: 0.9, autoAlpha: 0 })
      gsap.timeline()
        .to(overlayRef.value, { autoAlpha: 1, duration: 0.25, ease: 'power2.out' }, 0)
        .to(dialogRef.value, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'back.out(1.4)' }, 0.04)
      
      if (onOpen) onOpen()
    })
  }

  /**
   * 关闭弹窗（退场动画）
   * @param {Function} onFinished - 动画完成后的回调（通常用于设置 showXxx.value = false）
   */
  const close = (onFinished) => {
    if (!overlayRef.value || !dialogRef.value) {
      if (onFinished) onFinished()
      return
    }

    const tl = gsap.timeline({
      onComplete: () => {
        if (onFinished) onFinished()
        if (onClose) onClose()
      }
    })
    tl.to(dialogRef.value, { scale: 0.95, autoAlpha: 0, duration: 0.2, ease: 'power2.in' }, 0)
      .to(overlayRef.value, { autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, 0)
  }

  /**
   * 清理 GSAP 动画（在 onUnmounted 中调用）
   */
  const cleanup = () => {
    if (overlayRef.value) gsap.killTweensOf(overlayRef.value)
    if (dialogRef.value) gsap.killTweensOf(dialogRef.value)
  }

  return { open, close, cleanup }
}
