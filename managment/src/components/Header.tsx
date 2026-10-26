import React from 'react';
import { Sparkles, Download, Eye, EyeOff, Sun, Award, Image as ImageIcon } from 'lucide-react';
import type { CardRarityTier, OpticalMaskType, RimColorType } from '../core/types';
import { CARD_RARITY_TIERS, OPTICAL_MASK_OPTIONS, RIM_COLOR_OPTIONS } from '../core/parameters';

interface HeaderProps {
  tier: CardRarityTier;
  rimColor: RimColorType;
  opticalMask: OpticalMaskType;
  cardSize: [number, number];
  layerCount: number;
  immersive: boolean;
  onToggleImmersive: () => void;
  onOpenExport: () => void;
  onOpenStaticComposite: () => void;
  onLoadSample: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  tier,
  rimColor,
  opticalMask,
  cardSize,
  layerCount,
  immersive,
  onToggleImmersive,
  onOpenExport,
  onOpenStaticComposite,
  onLoadSample,
}) => {
  if (immersive) {
    return (
      <button
        onClick={onToggleImmersive}
        title="退出全屏沉浸模式 (Esc)"
        className="fixed top-5 right-5 z-50 w-11 h-11 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 flex items-center justify-center shadow-xl backdrop-blur-md transition-all"
      >
        <EyeOff className="w-5 h-5 text-cyan-400" />
      </button>
    );
  }

  const currentTierSpec = CARD_RARITY_TIERS[tier] || CARD_RARITY_TIERS.rare;
  const currentRim =
    RIM_COLOR_OPTIONS.find((r) => r.value === rimColor) || RIM_COLOR_OPTIONS[0];
  const currentMask =
    OPTICAL_MASK_OPTIONS.find((m) => m.value === opticalMask) ||
    OPTICAL_MASK_OPTIONS[0];

  return (
    <header className="w-full border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-purple-500 to-amber-400 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/15">
          <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-neutral-100 font-sans">
              LIFE SEAL · 全息封印闪卡工坊
            </h1>
            <span
              className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border"
              style={{
                backgroundColor: `${currentTierSpec.palette.primary}18`,
                borderColor: `${currentTierSpec.palette.primary}50`,
                color: currentTierSpec.palette.primary,
              }}
            >
              {currentTierSpec.label}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 hidden sm:block">
            3:4 1080×1440 详细设计 · 三级等级体系 (银灰/金色/珍珠蓝) · 全息虹彩蒙版 · 静态全图层合并
          </p>
        </div>
      </div>

      {/* 中央当前光效与边框状态指示胶囊 */}
      <div className="hidden lg:flex items-center gap-2 p-1.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800">
          <Award className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-neutral-400">等级基调:</span>
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ background: currentTierSpec.palette.primary }}
          />
          <span className="font-semibold text-neutral-200">{currentTierSpec.badge}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800">
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-neutral-400">结构光:</span>
          <span className="font-semibold text-amber-300">
            {currentTierSpec.structureLightLabel}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden xl:flex items-center gap-3 text-xs text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800 font-mono">
          <span>图层: {layerCount}</span>
          <div className="w-px h-3 bg-neutral-700" />
          <span>
            {cardSize[0]}×{cardSize[1]}
          </span>
        </div>

        {/* 核心需求 3：查看静态合图按钮 */}
        <button
          onClick={onOpenStaticComposite}
          className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-xs font-semibold text-cyan-200 transition-colors inline-flex items-center gap-1.5 shadow-sm shadow-cyan-500/10"
          title="将全部图层合并，查看 2D 纯平静态卡面"
        >
          <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span>静态合图</span>
        </button>

        <button
          onClick={onToggleImmersive}
          title="进入全屏沉浸观赏模式"
          className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>

        <button
          onClick={onLoadSample}
          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 border border-neutral-700 transition-colors hidden sm:inline-flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          重置示例卡
        </button>

        <button
          onClick={onOpenExport}
          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-semibold text-xs transition-all shadow-md shadow-cyan-500/20 inline-flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          导出成果
        </button>
      </div>
    </header>
  );
};
