import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  mountThreePack,
  type ThreePackInstance,
  type ThreePackConfig,
} from '../core/threePackRenderer';

interface ThreePackStageProps {
  width: number;
  height: number;
  onTearProgress?: (progress: number) => void;
  onTearComplete?: () => void;
  config?: Partial<ThreePackConfig>;
}

// 零依赖的高性能原生动画插值缓动函数
function tween(
  from: number,
  to: number,
  durationMs: number,
  easing: (t: number) => number,
  onUpdate: (val: number) => void,
  onComplete?: () => void
): () => void {
  let isCancelled = false;
  const startTime = performance.now();

  function tick(now: number) {
    if (isCancelled) return;
    const elapsed = now - startTime;
    const progress = Math.min(1.0, Math.max(0.0, elapsed / durationMs));
    const eased = easing(progress);
    const current = from + (to - from) * eased;
    onUpdate(current);

    if (progress < 1.0) {
      requestAnimationFrame(tick);
    } else {
      onComplete?.();
    }
  }

  requestAnimationFrame(tick);
  return () => {
    isCancelled = true;
  };
}

const easeInQuad = (t: number) => t * t;
const easeOutPower2 = (t: number) => 1 - (1 - t) * (1 - t);
const easeElasticOut = (t: number) => {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
};

export const ThreePackStage: React.FC<ThreePackStageProps> = ({
  width,
  height,
  onTearProgress,
  onTearComplete,
  config,
}) => {
  const containerRef = useRef<any>(null);
  const handleRef = useRef<any>(null);
  const hintRef = useRef<any>(null);

  const threeRef = useRef<ThreePackInstance | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);

  // 状态机追踪（通过 ref 保持状态，避免 React 重新渲染）
  const isTornRef = useRef<boolean>(false);
  const isEmergedRef = useRef<boolean>(false);
  const activeTweenCancelRef = useRef<(() => void) | null>(null);

  // 将回调以 Ref 形式持有，彻底切断 useEffect 对回调函数的依赖，保证 WebGL 上下文只创建 1 次
  const onTearProgressRef = useRef(onTearProgress);
  onTearProgressRef.current = onTearProgress;

  const onTearCompleteRef = useRef(onTearComplete);
  onTearCompleteRef.current = onTearComplete;

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(style);
      } catch {
        // ignore
      }
    }
  };

  // 第二阶段：卡包向下滑落移出视口，卡片顺势破袋升起并 360° 翻转居中
  const launchCardEmergence = () => {
    if (isEmergedRef.current) return;
    isEmergedRef.current = true;
    isTornRef.current = true;

    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    threeRef.current?.setProgress(1.0);
    onTearProgressRef.current?.(1.0);

    // 隐藏手柄引导
    if (handleRef.current) {
      handleRef.current.style.opacity = '0';
    }

    activeTweenCancelRef.current?.();
    activeTweenCancelRef.current = tween(
      0,
      1.0,
      320,
      easeOutPower2,
      (cp) => {
        threeRef.current?.setCardProgress(cp);
      },
      () => {
        onTearCompleteRef.current?.();
      }
    );
  };

  // 第一阶段自动撕开补足（平滑过渡至 100% 紧接第二阶段出卡）
  const autoCompleteTear = () => {
    if (!threeRef.current || isTornRef.current) return;
    isTornRef.current = true;
    const startVal = currentProgressRef.current;
    activeTweenCancelRef.current?.();

    activeTweenCancelRef.current = tween(
      startVal,
      1.0,
      350,
      easeInQuad,
      (val) => {
        currentProgressRef.current = val;
        threeRef.current?.setProgress(val);
        onTearProgressRef.current?.(val);

        if (handleRef.current) {
          const maxPx = width * 0.68;
          handleRef.current.style.transform = `translateX(${val * maxPx}px)`;
        }
      },
      () => {
        launchCardEmergence();
      }
    );
  };

  // 未达阈值松手，弹性回弹复位至 0
  const springBack = () => {
    if (!threeRef.current || isTornRef.current) return;
    const startVal = currentProgressRef.current;
    activeTweenCancelRef.current?.();

    activeTweenCancelRef.current = tween(
      startVal,
      0,
      450,
      easeElasticOut,
      (val) => {
        currentProgressRef.current = val;
        threeRef.current?.setProgress(val);
        onTearProgressRef.current?.(val);

        if (handleRef.current) {
          const maxPx = width * 0.68;
          handleRef.current.style.transform = `translateX(${val * maxPx}px)`;
        }
        if (val <= 0.05 && hintRef.current) {
          hintRef.current.style.display = 'flex';
        }
      }
    );
  };

  // WebGL 场景挂载：空依赖项数组 []，整个生命周期只挂载一次，彻底解决 Too many active WebGL contexts
  useEffect(() => {
    const domNode =
      containerRef.current && (containerRef.current as any).tagName
        ? (containerRef.current as HTMLElement)
        : (containerRef.current as any)?._nativeTag ||
          (containerRef.current as any)?.getDOMNode?.() ||
          (containerRef.current as any);

    if (!domNode || typeof window === 'undefined') return;

    let cancelled = false;

    // 默认锁定移动端视角静置（tiltSensitivity = 0）
    const instance = mountThreePack(domNode, {
      sealedTextureUrl: '/packs/pack_sealed_norm.png',
      openedTextureUrl: '/packs/pack_opened_norm.png',
      stripTextureUrl: '/packs/pack_strip_norm.png',
      cardBackTextureUrl: '/back.png',
      initialConfig: {
        tiltSensitivity: 0.0,
        ...config,
      },
      onTearProgress: (p) => {
        if (!cancelled) {
          onTearProgressRef.current?.(p);
        }
      },
    });

    threeRef.current = instance;

    // 绑定原生鼠标与触控事件（完全复刻卡片工坊 Pointer Capture 与跟随手感）
    const onPointerDown = (e: any) => {
      if (isTornRef.current || isEmergedRef.current) return;
      isDraggingRef.current = true;
      activeTweenCancelRef.current?.();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      startXRef.current = clientX;
      triggerHaptic(Haptics.ImpactFeedbackStyle.Light);

      if (e.pointerId && domNode.setPointerCapture) {
        try {
          domNode.setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }
    };

    const onPointerMove = (e: any) => {
      if (!threeRef.current || !isDraggingRef.current || isTornRef.current) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - startXRef.current;

      if ('preventDefault' in e && e.cancelable) {
        e.preventDefault();
      }

      // 卡包撕裂目标宽度：拖拽约 190px 完成整条撕裂
      const targetWidth = Math.min(width * 0.72, 210);
      const p = Math.min(1.0, Math.max(0.0, deltaX / targetWidth));
      currentProgressRef.current = p;
      threeRef.current.setProgress(p);
      onTearProgressRef.current?.(p);

      // 直接操作 DOM 更新手势拉手，零 React 重新渲染损耗
      if (handleRef.current) {
        const maxPx = width * 0.68;
        handleRef.current.style.transform = `translateX(${p * maxPx}px)`;
      }
      if (p > 0.05 && hintRef.current) {
        hintRef.current.style.display = 'none';
      }

      // 手指拖拽到达 100%，立即触发破袋升起
      if (p >= 1.0) {
        isDraggingRef.current = false;
        launchCardEmergence();
      }
    };

    const onPointerUp = (e: any) => {
      if (!isDraggingRef.current || isTornRef.current) return;
      isDraggingRef.current = false;

      if (e.pointerId && domNode.releasePointerCapture) {
        try {
          domNode.releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }

      // 超过 38% 阈值松手，自动顺畅补足至 100% 并出卡；否则弹性回弹
      if (currentProgressRef.current >= 0.38) {
        autoCompleteTear();
      } else {
        springBack();
      }
    };

    domNode.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    domNode.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);

    return () => {
      cancelled = true;
      activeTweenCancelRef.current?.();
      domNode.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domNode.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      instance.dispose();
      threeRef.current = null;
    };
  }, []); // 严格空依赖项，确保整个页面生命周期只存在 1 个 WebGL 上下文！

  return (
    <View
      ref={containerRef}
      style={[
        styles.stageContainer,
        { width, height },
      ]}
    >
      {/* 顶部撕条动态手势引导指示器（完全对齐卡片工坊，提供绝佳交互反馈） */}
      <View
        style={[
          styles.tearGuideOverlay,
          {
            width: width * 0.84,
            top: height * 0.058,
          },
        ]}
        pointerEvents="none"
      >
        {/* 跟随撕裂物理进度的青色手势拉手 */}
        <View ref={handleRef} style={styles.dragHandleCircle}>
          <Text style={styles.handleIcon}>👉</Text>
        </View>

        {/* 待机状态提示文案 */}
        <View ref={hintRef} style={styles.idleHintBadge}>
          <Text style={styles.idleHintText}>向右拉拽撕开 ➔</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    userSelect: 'none',
    touchAction: 'none',
    cursor: 'grab',
  } as any,
  tearGuideOverlay: {
    position: 'absolute',
    height: 48,
    zIndex: 45,
    justifyContent: 'center',
  },
  dragHandleCircle: {
    position: 'absolute',
    left: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(103, 232, 249, 0.28)',
    borderWidth: 1.5,
    borderColor: '#67E8F9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#67E8F9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 6,
    transition: 'opacity 0.25s ease',
  } as any,
  handleIcon: {
    fontSize: 16,
  },
  idleHintBadge: {
    position: 'absolute',
    left: 42,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(103, 232, 249, 0.5)',
  },
  idleHintText: {
    color: '#67E8F9',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
