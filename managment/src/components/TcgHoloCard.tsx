import React, { useEffect, useRef, useState } from 'react';
import {
  mountTcgHoloCard,
  type ExtendedTcgCardHandle,
} from '../core/tcgHoloRenderer';
import type { TcgCardAssets, TcgCardHandle, TcgHoloParameters } from '../core/types';

interface TcgHoloCardProps {
  assets: TcgCardAssets;
  initialParameters: TcgHoloParameters;
  onCardReady?: (handle: TcgCardHandle) => void;
  onFlipChange?: (flipped: boolean) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export const TcgHoloCard: React.FC<TcgHoloCardProps> = ({
  assets,
  initialParameters,
  onCardReady,
  onFlipChange,
  onError,
  className = '',
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<ExtendedTcgCardHandle | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // 仅在卡牌尺寸变化或首次挂载时重建 WebGL 上下文
  useEffect(() => {
    if (!hostRef.current) return;

    let cancelled = false;
    setErrorMsg('');
    setLoading(true);

    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    hostRef.current.append(container);

    mountTcgHoloCard(
      container,
      assets,
      initialParameters,
      (err) => {
        if (!cancelled) {
          setErrorMsg(err.message);
          setLoading(false);
          onError?.(err);
        }
      },
      (flipped) => {
        if (!cancelled) {
          onFlipChange?.(flipped);
        }
      }
    )
      .then((handle) => {
        if (cancelled) {
          handle.dispose();
        } else {
          instanceRef.current = handle;
          setLoading(false);
          onCardReady?.(handle);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = String(err?.message ?? err);
          setErrorMsg(msg);
          setLoading(false);
          onError?.(err instanceof Error ? err : new Error(msg));
        }
      });

    return () => {
      cancelled = true;
      if (instanceRef.current) {
        instanceRef.current.dispose();
        instanceRef.current = null;
      }
      container.remove();
    };
  }, [assets.width, assets.height]);

  // 热更新各个图层的 WebGL 贴图（零闪烁、不重置卡片倾角）
  useEffect(() => {
    if (instanceRef.current && assets.character) {
      instanceRef.current.updateLayerTexture('character', assets.character);
    }
  }, [assets.character]);

  useEffect(() => {
    if (instanceRef.current && assets.background) {
      instanceRef.current.updateLayerTexture('background', assets.background);
    }
  }, [assets.background]);

  useEffect(() => {
    if (instanceRef.current && assets.ui) {
      instanceRef.current.updateLayerTexture('ui', assets.ui);
    }
  }, [assets.ui]);

  useEffect(() => {
    if (instanceRef.current && assets.structure) {
      instanceRef.current.updateLayerTexture('structure', assets.structure);
    }
  }, [assets.structure]);

  useEffect(() => {
    if (instanceRef.current && assets.back) {
      instanceRef.current.updateLayerTexture('back', assets.back);
    }
  }, [assets.back]);

  return (
    <div className={`relative flex flex-col items-center justify-center w-full ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20 rounded-xl">
          <div className="flex flex-col items-center gap-3 text-cyan-200">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs tracking-wider uppercase">
              Compiling Holo & Optical Mask Shaders...
            </span>
          </div>
        </div>
      )}
      <div ref={hostRef} className="w-full flex justify-center" />
      {errorMsg && (
        <div className="mt-4 p-3 bg-red-950/80 border border-red-700/60 rounded-lg text-red-200 text-xs max-w-md text-center">
          <p className="font-semibold mb-1">WebGL 渲染异常</p>
          <p>{errorMsg}</p>
        </div>
      )}
    </div>
  );
};
