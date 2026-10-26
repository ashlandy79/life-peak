import React, { useState, useEffect } from 'react';
import { Pipette, Copy, Check } from 'lucide-react';

export interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number; // 0 ~ 1
}

export function parseColorToRgba(colorStr: string): RgbaColor {
  if (!colorStr) return { r: 103, g: 232, b: 249, a: 1 };
  const str = colorStr.trim().toLowerCase();

  if (str.startsWith('rgba')) {
    const match = str.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
    if (match) {
      return {
        r: Math.min(255, Math.max(0, parseInt(match[1], 10))),
        g: Math.min(255, Math.max(0, parseInt(match[2], 10))),
        b: Math.min(255, Math.max(0, parseInt(match[3], 10))),
        a: match[4] !== undefined ? Math.min(1, Math.max(0, parseFloat(match[4]))) : 1,
      };
    }
  } else if (str.startsWith('rgb')) {
    const match = str.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (match) {
      return {
        r: Math.min(255, Math.max(0, parseInt(match[1], 10))),
        g: Math.min(255, Math.max(0, parseInt(match[2], 10))),
        b: Math.min(255, Math.max(0, parseInt(match[3], 10))),
        a: 1,
      };
    }
  } else if (str.startsWith('#')) {
    const hex = str.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
        a: 1,
      };
    } else if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: 1,
      };
    } else if (hex.length === 8) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: Math.round((parseInt(hex.slice(6, 8), 16) / 255) * 100) / 100,
      };
    }
  }
  return { r: 103, g: 232, b: 249, a: 1 };
}

export function rgbaToString(c: RgbaColor): string {
  return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${Number(c.a.toFixed(2))})`;
}

export function rgbaToHex(c: RgbaColor, includeAlpha = false): string {
  const rHex = Math.round(c.r).toString(16).padStart(2, '0');
  const gHex = Math.round(c.g).toString(16).padStart(2, '0');
  const bHex = Math.round(c.b).toString(16).padStart(2, '0');
  if (includeAlpha) {
    const aHex = Math.round(c.a * 255).toString(16).padStart(2, '0');
    return `#${rHex}${gHex}${bHex}${aHex}`;
  }
  return `#${rHex}${gHex}${bHex}`;
}

const DEFAULT_PRESETS = [
  { name: '珍珠冰蓝', color: 'rgba(103, 232, 249, 0.95)' },
  { name: '皇家流金', color: 'rgba(251, 191, 36, 0.95)' },
  { name: '冷钛银灰', color: 'rgba(203, 213, 225, 0.90)' },
  { name: '幻夜紫霓', color: 'rgba(192, 132, 252, 0.92)' },
  { name: '彩虹绯粉', color: 'rgba(244, 114, 182, 0.92)' },
  { name: '翡翠荧绿', color: 'rgba(52, 211, 153, 0.90)' },
  { name: '曜石暗墨', color: 'rgba(15, 23, 42, 0.85)' },
  { name: '纯净透白', color: 'rgba(255, 255, 255, 0.88)' },
];

interface RgbaColorPickerProps {
  value: string;
  onChange: (rgba: string, hex: string) => void;
  label?: string;
  presets?: { name: string; color: string }[];
}

export const RgbaColorPicker: React.FC<RgbaColorPickerProps> = ({
  value,
  onChange,
  label,
  presets = DEFAULT_PRESETS,
}) => {
  const [color, setColor] = useState<RgbaColor>(() => parseColorToRgba(value));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setColor(parseColorToRgba(value));
  }, [value]);

  const updateColor = (next: Partial<RgbaColor>) => {
    const merged = { ...color, ...next };
    setColor(merged);
    const rgbaStr = rgbaToString(merged);
    const hexStr = rgbaToHex(merged);
    onChange(rgbaStr, hexStr);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.startsWith('#') && (val.length === 7 || val.length === 9)) {
      const parsed = parseColorToRgba(val);
      setColor(parsed);
      onChange(rgbaToString(parsed), val);
    }
  };

  const handleNativeColorPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseColorToRgba(e.target.value);
    // 保留当前的 alpha
    parsed.a = color.a;
    setColor(parsed);
    onChange(rgbaToString(parsed), e.target.value);
  };

  const copyRgba = () => {
    navigator.clipboard?.writeText(rgbaToString(color));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const hexVal = rgbaToHex(color);

  return (
    <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3 space-y-3">
      {label && (
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
          <span>{label}</span>
          <span className="font-mono text-[11px] text-cyan-400">
            {rgbaToString(color)}
          </span>
        </div>
      )}

      {/* 色板与拾色预览栏 */}
      <div className="flex items-center gap-2.5">
        {/* 棋盘格背景上的颜色展示方块 */}
        <div
          className="relative w-10 h-10 rounded-lg border border-neutral-700 overflow-hidden flex-shrink-0 shadow-inner"
          style={{
            backgroundImage:
              'linear-gradient(45deg, #1f2937 25%, transparent 25%), linear-gradient(-45deg, #1f2937 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1f2937 75%), linear-gradient(-45deg, transparent 75%, #1f2937 75%)',
            backgroundSize: '10px 10px',
            backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
          }}
        >
          <div
            className="w-full h-full"
            style={{ backgroundColor: rgbaToString(color) }}
          />
        </div>

        {/* 快速吸色器与 Hex 输入 */}
        <div className="flex-1 flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1">
          <label className="cursor-pointer flex items-center gap-1 text-[11px] text-neutral-400 hover:text-cyan-300">
            <Pipette className="w-3.5 h-3.5" />
            <input
              type="color"
              value={hexVal}
              onChange={handleNativeColorPick}
              className="opacity-0 absolute w-0 h-0 pointer-events-none"
            />
            <span>吸色</span>
          </label>
          <span className="text-neutral-700">|</span>
          <input
            type="text"
            value={hexVal}
            onChange={handleHexChange}
            placeholder="#67e8f9"
            className="w-20 bg-transparent text-xs font-mono text-neutral-200 focus:outline-none uppercase"
          />
          <div className="flex-1" />
          <button
            type="button"
            onClick={copyRgba}
            title="复制 RGBA 代码"
            className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* 快捷推荐色块芯片 */}
      <div className="grid grid-cols-4 gap-1.5 pt-1">
        {presets.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              const parsed = parseColorToRgba(p.color);
              setColor(parsed);
              onChange(p.color, rgbaToHex(parsed));
            }}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-950/70 border border-neutral-800 hover:border-neutral-600 text-[10px] text-neutral-300 transition-colors text-left truncate"
            title={`${p.name} (${p.color})`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-white/20"
              style={{ backgroundColor: p.color }}
            />
            <span className="truncate">{p.name}</span>
          </button>
        ))}
      </div>

      {/* RGBA 四通道独立微调滑块 */}
      <div className="space-y-2 pt-1 border-t border-neutral-800/80">
        {/* R */}
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-4 font-mono font-bold text-red-400">R</span>
          <input
            type="range"
            min="0"
            max="255"
            value={color.r}
            onChange={(e) => updateColor({ r: Number(e.target.value) })}
            className="flex-1 accent-red-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
          />
          <span className="w-8 font-mono text-right text-neutral-300">{color.r}</span>
        </div>

        {/* G */}
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-4 font-mono font-bold text-emerald-400">G</span>
          <input
            type="range"
            min="0"
            max="255"
            value={color.g}
            onChange={(e) => updateColor({ g: Number(e.target.value) })}
            className="flex-1 accent-emerald-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
          />
          <span className="w-8 font-mono text-right text-neutral-300">{color.g}</span>
        </div>

        {/* B */}
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-4 font-mono font-bold text-blue-400">B</span>
          <input
            type="range"
            min="0"
            max="255"
            value={color.b}
            onChange={(e) => updateColor({ b: Number(e.target.value) })}
            className="flex-1 accent-blue-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
          />
          <span className="w-8 font-mono text-right text-neutral-300">{color.b}</span>
        </div>

        {/* A (透明度 Alpha) */}
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-4 font-mono font-bold text-cyan-400">A</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={color.a}
            onChange={(e) => updateColor({ a: Number(e.target.value) })}
            className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
          />
          <span className="w-8 font-mono text-right text-neutral-300">
            {Math.round(color.a * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
