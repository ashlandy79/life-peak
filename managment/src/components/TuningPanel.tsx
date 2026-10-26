import React from 'react';
import {
  Sliders,
  RotateCcw,
  Eye,
  Flame,
  RefreshCw,
  Compass,
  Crosshair,
  Sun,
  Award,
  Sparkles,
} from 'lucide-react';
import type {
  OpticalMaskType,
  RimColorType,
  StructureLightMode,
  TcgHoloParameters,
  TcgInspectionMode,
  TcgPreset,
} from '../core/types';
import {
  OPTICAL_MASK_OPTIONS,
  RIM_COLOR_OPTIONS,
  TCG_PARAMETER_CONTROLS,
  type TcgNumericParamKey,
} from '../core/parameters';

interface TuningPanelProps {
  tcgParameters: TcgHoloParameters;
  tcgPreset: TcgPreset;
  tcgInspection: TcgInspectionMode;
  isFlipped: boolean;
  gyroEnabled: boolean;
  onTcgParameterChange: <K extends keyof TcgHoloParameters>(
    key: K,
    value: TcgHoloParameters[K]
  ) => void;
  onTcgPresetChange: (preset: TcgPreset) => void;
  onTcgInspectionChange: (mode: TcgInspectionMode) => void;
  onFlipCard: () => void;
  onRecenterCard: () => void;
  onToggleGyro: () => void;
  onTcgReset: () => void;
}

const TCG_PRESET_LIST: {
  value: Exclude<TcgPreset, 'custom'>;
  label: string;
  badge: string;
}[] = [
  { value: 'life-seal-default', label: '图1·磨砂封印态', badge: '珍珠蓝' },
  { value: 'sunbeam-unsealed', label: '阳光丁达尔解封', badge: '流金' },
  { value: 'popout-max', label: '极限破框出画', badge: '+2.4×' },
  { value: 'shadowbox', label: '内凹立体橱窗', badge: '-2.1×' },
  { value: 'neon-bloom', label: '轮廓霓虹超频', badge: 'HDR 40×' },
];

const TCG_INSPECTION_MODES: { value: TcgInspectionMode; label: string }[] = [
  { value: 'composite', label: '完整破框流光合成 (Full HDR Composite)' },
  { value: 'no-glow', label: '关闭闪膜与流光 (仅审查图层与排版)' },
  { value: 'bloom-only', label: '仅查看角色轮廓 HDR 辉光 (Emission + Bloom)' },
  { value: 'structure-mask', label: '仅查看结构线条遮罩 (Structure Mask)' },
  { value: 'background-only', label: '仅查看全景背景底板 (Background Only)' },
  { value: 'character-only', label: '仅查看核心画面图层 (Character Only)' },
  { value: 'ui-only', label: '仅查看卡片 UI 与边框层 (UI & Frame Only)' },
];

export const TuningPanel: React.FC<TuningPanelProps> = ({
  tcgParameters,
  tcgPreset,
  tcgInspection,
  isFlipped,
  gyroEnabled,
  onTcgParameterChange,
  onTcgPresetChange,
  onTcgInspectionChange,
  onFlipCard,
  onRecenterCard,
  onToggleGyro,
  onTcgReset,
}) => {
  return (
    <div className="flex flex-col gap-5 text-neutral-200">
      {/* 1. 预设与快捷重置 */}
      <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
            <Flame className="w-4 h-4 text-cyan-400" />
            光学状态预设 (Holo Presets)
          </div>
          <button
            onClick={onTcgReset}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-400 hover:text-cyan-300 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重置默认
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TCG_PRESET_LIST.map((p) => (
            <button
              key={p.value}
              onClick={() => onTcgPresetChange(p.value)}
              className={`px-3 py-2 text-xs rounded-lg border font-medium transition-all text-left flex items-center justify-between ${
                tcgPreset === p.value
                  ? 'border-cyan-400 bg-cyan-500/15 text-cyan-100 shadow-sm shadow-cyan-500/20'
                  : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              <span className="truncate">{p.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-cyan-300 ml-1 flex-shrink-0">
                {p.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. 6 种光学蒙版选择 (封印毛玻璃 / 丁达尔阳光 / 全息虹彩 / 棱镜色散 / 星云流沙 / 金属蚀刻) */}
      <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
            <Sun className="w-4 h-4 text-amber-400" />
            光学蒙版选择 (6 Optical Masks)
          </div>
          <span className="text-[10px] text-amber-300 font-mono">Shader 实时合成</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {OPTICAL_MASK_OPTIONS.map((mask) => {
            const active = tcgParameters.opticalMask === mask.value;
            return (
              <button
                key={mask.value}
                type="button"
                onClick={() =>
                  onTcgParameterChange('opticalMask', mask.value as OpticalMaskType)
                }
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  active
                    ? 'border-amber-400/80 bg-amber-500/15 text-amber-100 shadow-md shadow-amber-500/10'
                    : 'border-neutral-800 bg-neutral-950/50 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{mask.label}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-amber-300 font-mono">
                    {mask.badge}
                  </span>
                </div>
                <p className="text-[10px] opacity-80 leading-relaxed">{mask.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 结构线专属发光模式 (微弱阳光 / 暖金丁达尔 / 全息虹彩) */}
      <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            结构线轮廓光效 (Structure Light)
          </div>
          <span className="text-[10px] text-cyan-300 font-mono">等级专属算法</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            {
              mode: 'subtle-sun' as StructureLightMode,
              label: '微弱阳光',
              badge: '普通',
              desc: '柔和纯白素雅日光',
            },
            {
              mode: 'tyndall-gold' as StructureLightMode,
              label: '暖金丁达尔',
              badge: '高级',
              desc: '明亮圣光散射金光束',
            },
            {
              mode: 'holo-rainbow' as StructureLightMode,
              label: '全息虹彩',
              badge: '稀有',
              desc: '图1七彩 HDR 辉光',
            },
          ].map((item) => {
            const active = tcgParameters.structureLightMode === item.mode;
            return (
              <button
                key={item.mode}
                type="button"
                onClick={() => onTcgParameterChange('structureLightMode', item.mode)}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  active
                    ? 'border-cyan-400 bg-cyan-500/15 text-white shadow-sm'
                    : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{item.label}</span>
                  <span className="text-[10px] px-1 py-0.5 rounded bg-black/40 text-cyan-300 font-mono">
                    {item.badge}
                  </span>
                </div>
                <p className="text-[10px] opacity-75">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 5 种内嵌流光金框颜色选择 (珍珠蓝 / 彩色 / 金色 / 紫色 / 银灰色) */}
      <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
            <Award className="w-4 h-4 text-cyan-400" />
            内嵌流光边框颜色 (5 Rim Colors)
          </div>
          <span className="text-[10px] text-cyan-300 font-mono">稀有度配色</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {RIM_COLOR_OPTIONS.map((rim) => {
            const active = tcgParameters.rimColor === rim.value;
            return (
              <button
                key={rim.value}
                type="button"
                onClick={() => onTcgParameterChange('rimColor', rim.value as RimColorType)}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  active
                    ? 'border-cyan-400 bg-cyan-500/15 text-white shadow-sm'
                    : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-gradient-to-tr ${rim.previewGradient} border border-white/40 flex-shrink-0`}
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">{rim.label}</div>
                  <div className="text-[10px] opacity-75 truncate">{rim.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 需求 7：光学蒙版与流光色盘细化自定义配置 */}
      <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
            <Sparkles className="w-4 h-4 text-pink-400" />
            色盘与流光自定义配置 (Color Palette & Beam)
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={tcgParameters.useCustomColors}
              onChange={(e) =>
                onTcgParameterChange('useCustomColors', e.target.checked)
              }
              className="w-3.5 h-3.5 accent-pink-500 rounded cursor-pointer"
            />
            <span
              className={
                tcgParameters.useCustomColors
                  ? 'text-pink-300 font-semibold'
                  : 'text-neutral-400'
              }
            >
              启用色盘接管
            </span>
          </label>
        </div>

        <div className="text-[10px] text-neutral-400 leading-relaxed">
          开启色盘接管后，卡牌边框流光与旋转扫光束颜色将直接使用下方色盘自定义十六进制颜色，而非固定稀有度配色。
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* 自定义边框流光颜色 */}
          <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-200">
                边框流光自定义色
              </span>
              <div
                className="w-5 h-5 rounded-full border border-white/40 shadow-sm"
                style={{ backgroundColor: tcgParameters.customRimColor || '#67e8f9' }}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={tcgParameters.customRimColor || '#67e8f9'}
                onChange={(e) => onTcgParameterChange('customRimColor', e.target.value)}
                className="w-8 h-8 rounded border border-neutral-700 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={tcgParameters.customRimColor || '#67e8f9'}
                onChange={(e) => onTcgParameterChange('customRimColor', e.target.value)}
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 font-mono text-xs text-neutral-100 outline-none focus:border-pink-400"
              />
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              {['#67e8f9', '#f472b6', '#fbbf24', '#a855f7', '#cbd5e1'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onTcgParameterChange('customRimColor', c)}
                  className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* 自定义卡面扫光光束颜色 */}
          <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-200">
                卡面扫光束自定义色
              </span>
              <div
                className="w-5 h-5 rounded-full border border-white/40 shadow-sm"
                style={{ backgroundColor: tcgParameters.customBeamColor || '#ffffff' }}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={tcgParameters.customBeamColor || '#ffffff'}
                onChange={(e) => onTcgParameterChange('customBeamColor', e.target.value)}
                className="w-8 h-8 rounded border border-neutral-700 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={tcgParameters.customBeamColor || '#ffffff'}
                onChange={(e) => onTcgParameterChange('customBeamColor', e.target.value)}
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 font-mono text-xs text-neutral-100 outline-none focus:border-pink-400"
              />
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              {['#ffffff', '#fef08a', '#67e8f9', '#ec4899', '#34d399'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onTcgParameterChange('customBeamColor', c)}
                  className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. 正反面翻转、视角归零与手机陀螺仪体感 */}
      <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 flex flex-col gap-3">
        <div className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            卡牌翻转与体感操控 (Interactive Controls)
          </span>
          <span className="text-[10px] text-neutral-400">支持点击卡面直接翻面</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onFlipCard}
            className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              isFlipped
                ? 'border-amber-500 bg-amber-500/20 text-amber-200'
                : 'border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {isFlipped ? '翻回正面' : '翻转看卡背'}
          </button>

          <button
            type="button"
            onClick={onRecenterCard}
            className="py-2 px-3 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            校准归零
          </button>

          <button
            type="button"
            onClick={onToggleGyro}
            className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              gyroEnabled
                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                : 'border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            {gyroEnabled ? '陀螺仪已开启' : '开启陀螺仪'}
          </button>
        </div>

        <label className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-xs cursor-pointer">
          <div>
            <span className="text-neutral-200 font-medium">
              使用结构线贴图 (structure.png) 驱动发光
            </span>
            <p className="text-[10px] text-neutral-500">
              关闭后将改用 Shader 内置色彩墨线算法 (ink) 实时检测发光边缘
            </p>
          </div>
          <input
            type="checkbox"
            checked={tcgParameters.useExtractedStructure}
            onChange={(e) =>
              onTcgParameterChange('useExtractedStructure', e.target.checked)
            }
            className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
          />
        </label>
      </div>

      {/* 5. 通道与辉光隔离审查 */}
      <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 flex flex-col gap-2.5">
        <div className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          通道与辉光隔离审查 (Inspection Mode)
        </div>
        <select
          value={tcgInspection}
          onChange={(e) => onTcgInspectionChange(e.target.value as TcgInspectionMode)}
          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-xs text-neutral-200 outline-none focus:border-cyan-400 transition-colors"
        >
          {TCG_INSPECTION_MODES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* 6. 12 项光学、磨砂与破框景深精调滑块 */}
      <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
            <Sliders className="w-4 h-4 text-cyan-400" />
            破框景深、磨砂封印与 HDR 流光精调 (12 Controls)
          </div>
          {tcgPreset === 'custom' && (
            <span className="text-[10px] text-cyan-300 bg-cyan-500/15 px-2 py-0.5 rounded border border-cyan-500/30">
              自定义模式
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {(Object.keys(TCG_PARAMETER_CONTROLS) as TcgNumericParamKey[]).map((key) => {
            const spec = TCG_PARAMETER_CONTROLS[key];
            const val = tcgParameters[key];
            const isDepth = key === 'depth';
            const isHighlight =
              key === 'depth' || key === 'frostedBlur' || key === 'contourBrightness';

            return (
              <div
                key={key}
                className={`flex flex-col gap-1.5 p-3 rounded-xl border ${
                  isHighlight
                    ? 'bg-cyan-950/15 border-cyan-500/30'
                    : 'bg-neutral-950/50 border-neutral-800/80'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-100">{spec.label}</span>
                  <span className="font-mono text-cyan-300 bg-neutral-900 px-2 py-0.5 rounded border border-cyan-500/20 text-[11px]">
                    {isDepth && val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                    {spec.unit || ''}
                  </span>
                </div>

                <div className="text-[10px] text-neutral-400 leading-relaxed">
                  {spec.description}
                </div>

                <input
                  type="range"
                  min={spec.min}
                  max={spec.max}
                  step={spec.step}
                  value={val}
                  onChange={(e) =>
                    onTcgParameterChange(key, parseFloat(e.target.value))
                  }
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none mt-1"
                />

                {isDepth && (
                  <div className="flex justify-between text-[10px] font-mono text-neutral-500 px-0.5 mt-0.5">
                    <span>-3.0× (内凹橱窗)</span>
                    <span className="text-neutral-400">0.0× (平齐)</span>
                    <span className="text-cyan-300">+3.0× (破框悬浮)</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
