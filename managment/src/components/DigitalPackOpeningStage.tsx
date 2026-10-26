import React, { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import {
  Sparkles,
  RotateCcw,
  Play,
  Hand,
  CheckCircle2,
  ExternalLink,
  Layers,
  Crosshair,
  Award,
} from 'lucide-react';
import type { CardDefinition, DigitalPackDefinition } from '../core/lifepackTypes';
import {
  mountThreePack,
  type ThreePackInstance,
  type ThreePackConfig,
} from '../core/threePackRenderer';

interface DigitalPackOpeningStageProps {
  pack: DigitalPackDefinition;
  linkedCards: CardDefinition[];
  config?: ThreePackConfig;
  onOpenCard?: (card: CardDefinition) => void;
  className?: string;
}

export type TearPhase = 'idle' | 'dragging' | 'tearing' | 'torn' | 'card-emerged';

export const DigitalPackOpeningStage: React.FC<DigitalPackOpeningStageProps> = ({
  pack,
  linkedCards,
  config,
  onOpenCard,
  className = '',
}) => {
  const [tearProgress, setTearProgress] = useState<number>(0);
  const [phase, setPhase] = useState<TearPhase>('idle');

  // 内部展示卡片
  const currentCard = linkedCards[0] || null;

  // DOM & Three.js 引用
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const threeRef = useRef<ThreePackInstance | null>(null);

  // 拖拽手势状态
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);

  // 1. 初始化 Three.js 物理薄膜撕袋场景
  useEffect(() => {
    if (!canvasHostRef.current) return;

    let cancelled = false;
    const instance = mountThreePack(canvasHostRef.current, {
      sealedTextureUrl: pack.packBaseAssetId || '/packs/pack_sealed_norm.png',
      openedTextureUrl: pack.packOpenedAssetId || '/packs/pack_opened_norm.png',
      stripTextureUrl: '/packs/pack_strip_norm.png',
      initialConfig: config,
      onTearProgress: (p) => {
        if (!cancelled) setTearProgress(p);
      },
    });

    threeRef.current = instance;

    return () => {
      cancelled = true;
      instance.dispose();
      threeRef.current = null;
    };
  }, [pack.id, pack.packBaseAssetId, pack.packOpenedAssetId]);

  // 实时响应操作台参数更新
  useEffect(() => {
    if (threeRef.current && config) {
      threeRef.current.updateConfig(config);
    }
  }, [config]);

  // 2. 鼠标悬停 3D 偏转与高光流转
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasHostRef.current || !threeRef.current) return;
    const rect = canvasHostRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = (x / rect.width) * 2 - 1; // -1 .. +1
    const normY = (y / rect.height) * 2 - 1; // -1 .. +1

    threeRef.current.setMouse(normX, normY);
  }, []);

  const handleMouseLeave = useCallback(() => {
    threeRef.current?.setMouse(0, 0);
  }, []);

  // 3. 拖拽封口交互 (Pointer Events)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (phase === 'torn' || phase === 'card-emerged') return;
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setPhase('dragging');
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !threeRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    // 假设拖拽 220px 完成整条撕裂
    const targetWidth = 220;
    const p = Math.min(1.0, Math.max(0.0, deltaX / targetWidth));
    currentProgressRef.current = p;
    setTearProgress(p);

    // 实时驱动 Three.js 细分网格顶点弯曲
    threeRef.current.setProgress(p);

    if (p >= 1.0) {
      completeTear();
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (currentProgressRef.current >= 0.45) {
      autoCompleteTear();
    } else {
      springBack();
    }
  };

  // 自动撕开剩余部分
  const autoCompleteTear = () => {
    if (!threeRef.current) return;
    setPhase('tearing');

    const progressObj = { p: currentProgressRef.current };
    gsap.to(progressObj, {
      p: 1.0,
      duration: 0.4,
      ease: 'power2.in',
      onUpdate: () => {
        currentProgressRef.current = progressObj.p;
        threeRef.current?.setProgress(progressObj.p);
        setTearProgress(progressObj.p);
      },
      onComplete: () => {
        completeTear();
      },
    });
  };

  // 弹性回弹复位
  const springBack = () => {
    if (!threeRef.current) return;
    setPhase('idle');

    const progressObj = { p: currentProgressRef.current };
    gsap.to(progressObj, {
      p: 0,
      duration: 0.5,
      ease: 'elastic.out(1.2, 0.4)',
      onUpdate: () => {
        currentProgressRef.current = progressObj.p;
        threeRef.current?.setProgress(progressObj.p);
        setTearProgress(progressObj.p);
      },
    });
  };

  // 撕开完成，触发卡片从 3D 腔体内衬中升起，卡包向下滑落
  const completeTear = () => {
    setPhase('torn');
    setTearProgress(1.0);
    threeRef.current?.setProgress(1.0);

    // 延时 0.08s 启动卡片破袋升起并居中，同时卡包整体向下滑落移出视口
    const cardObj = { cp: 0 };
    gsap.to(cardObj, {
      cp: 1.0,
      duration: 1.35,
      ease: 'power2.out',
      delay: 0.08,
      onStart: () => {
        setPhase('card-emerged');
      },
      onUpdate: () => {
        threeRef.current?.setCardProgress(cardObj.cp);
      },
    });
  };

  // 一键演示完整开包流程
  const handleAutoPlay = () => {
    handleReset();
    setTimeout(() => {
      autoCompleteTear();
    }, 250);
  };

  // 重新打包复原
  const handleReset = () => {
    setPhase('idle');
    setTearProgress(0);
    currentProgressRef.current = 0;
    threeRef.current?.setProgress(0);
    threeRef.current?.setCardProgress(0);
    threeRef.current?.recenter();
  };

  return (
    <div
      className={`flex flex-col items-center justify-center select-none w-full ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 顶部状态与控制栏 */}
      <div className="w-full max-w-md flex items-center justify-between mb-3 px-3 z-20">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              phase === 'card-emerged'
                ? 'bg-emerald-400 animate-pulse'
                : phase === 'tearing' || phase === 'dragging'
                ? 'bg-amber-400 animate-ping'
                : 'bg-cyan-400'
            }`}
          />
          <span className="text-xs font-semibold text-neutral-300">
            {phase === 'idle' && '待机倾斜 · 请按住左侧撕口向右拉拽'}
            {phase === 'dragging' && `正在剥离撕开 (${Math.round(tearProgress * 100)}%)`}
            {phase === 'tearing' && '正在撕裂金属薄膜封口...'}
            {phase === 'torn' && '封口已解开！袋身收腰展开'}
            {phase === 'card-emerged' && '🎉 内部卡片已从内衬中破袋升起！'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleAutoPlay}
            disabled={phase === 'tearing'}
            className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-neutral-950 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-sm shadow-cyan-500/20"
            title="一键演示 Three.js 物理网格撕开"
          >
            <Play className="w-3 h-3 fill-current" />
            演示
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
            title="重新封包复原"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Three.js 3D 画布容器 */}
      <div className="relative w-full max-w-[360px] aspect-[360/540] rounded-2xl overflow-hidden bg-radial from-slate-900/60 via-neutral-950 to-neutral-950 flex items-center justify-center border border-neutral-800/80 shadow-2xl">
        <div ref={canvasHostRef} className="w-full h-full relative cursor-grab active:cursor-grabbing" />

        {/* 顶部撕条隐形手势感应区与拖拽手柄 */}
        {phase !== 'card-emerged' && (
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute top-[8%] left-[10%] right-[10%] h-[12%] z-30 cursor-grab active:cursor-grabbing flex items-center"
            title="按住左侧撕口向右拖拽撕开包装"
          >
            {/* 随着进度跟随的手势提示器 */}
            <div
              className="absolute w-7 h-7 rounded-full bg-cyan-400/20 border border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-400/30 transition-transform"
              style={{
                left: `${tearProgress * 85}%`,
              }}
            >
              <Hand className="w-3.5 h-3.5 text-cyan-300" />
            </div>

            {/* 待机提示文字 */}
            {phase === 'idle' && (
              <div className="absolute left-10 px-2 py-0.5 rounded-full bg-cyan-500 text-neutral-950 font-bold text-[9px] shadow-lg animate-bounce pointer-events-none">
                ← 拖拽撕开封口
              </div>
            )}
          </div>
        )}

        {/* 卡片升起后的交互浮层 */}
        {phase === 'card-emerged' && currentCard && (
          <div
            onClick={() => onOpenCard?.(currentCard)}
            className="absolute bottom-4 left-4 right-4 p-2.5 rounded-xl bg-neutral-900/90 border border-cyan-500/50 backdrop-blur-md flex items-center justify-between cursor-pointer hover:bg-neutral-800 transition-all z-40 shadow-xl shadow-cyan-500/10 group"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <div>
                <div className="text-xs font-bold text-neutral-100 flex items-center gap-1.5">
                  <span>{currentCard.title}</span>
                  <span className="font-mono text-[10px] text-cyan-400">
                    {currentCard.cardCode}
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400">
                  点击前往卡片制作台查看 2.5D 深度与翻转
                </div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        )}
      </div>

      {/* 底部物理特性解析说明 */}
      <div className="mt-3 text-center space-y-0.5 z-10">
        <div className="text-xs font-bold text-neutral-300">
          Three.js 连续薄膜网格弯折与袋身收腰
        </div>
        <div className="text-[10px] text-neutral-500 font-mono">
          未撕开部分顶点完全共面锁死 · 已撕开部分贝塞尔弧度弯曲 · 袋口深绿内衬腔体
        </div>
      </div>
    </div>
  );
};
