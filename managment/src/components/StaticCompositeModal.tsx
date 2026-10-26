import React, { useState, useEffect } from 'react';
import {
  Download,
  Copy,
  Check,
  X,
  Loader2,
  Eye,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import type { LifeSealCardMeta } from '../core/types';
import { renderStaticFlatComposite } from '../utils/lifeSealUiRenderer';

interface StaticCompositeModalProps {
  isOpen: boolean;
  onClose: () => void;
  bgUrl: string;
  subjectUrl: string;
  uiUrl: string;
  structureUrl: string;
  meta: LifeSealCardMeta;
  size: [number, number];
  frostedBlur: number;
}

export const StaticCompositeModal: React.FC<StaticCompositeModalProps> = ({
  isOpen,
  onClose,
  bgUrl,
  subjectUrl,
  uiUrl,
  structureUrl,
  meta,
  size,
  frostedBlur,
}) => {
  const [flatImageUrl, setFlatImageUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);

    renderStaticFlatComposite(
      bgUrl,
      subjectUrl,
      uiUrl,
      structureUrl,
      meta,
      size,
      0.0
    ).then((url) => {
      if (!cancelled) {
        setFlatImageUrl(url);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen, bgUrl, subjectUrl, uiUrl, structureUrl, meta, size]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!flatImageUrl) return;
    const a = document.createElement('a');
    a.href = flatImageUrl;
    a.download = `life-seal-${meta.tier}-${meta.cardNumber.replace('#', '')}-flat.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = async () => {
    if (!flatImageUrl) return;
    try {
      const res = await fetch(flatImageUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert('浏览器未开放剪贴板写入权限，请直接点击“下载合图”保存！');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-100">
        {/* 顶部标题栏 */}
        <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold">
                  解封原画静态合图 (2D Unsealed Composite)
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {size[0]}×{size[1]} · 3:4
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                  {meta.tier === 'common'
                    ? '普通 · 银灰'
                    : meta.tier === 'advanced'
                    ? '高级 · 流金'
                    : '稀有 · 珍珠蓝'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                需求 5：解封原画合图（背景 + 主体 + 专属等级发光结构线 + 纯净流光边框，已取消奇遇封印卡 LIFE SEAL 文本遮挡）
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={loading || !flatImageUrl}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 border border-neutral-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  已复制到剪贴板
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  复制图片
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              disabled={loading || !flatImageUrl}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              下载 2D 合图
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 视口展示区 */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 to-neutral-950 relative min-h-[460px]">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-neutral-400">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <span className="text-xs font-mono">正在像素级合并全部图层与光学遮罩...</span>
            </div>
          ) : (
            <div className="relative group max-w-full max-h-full flex items-center justify-center">
              <img
                src={flatImageUrl}
                alt="Static Flat Holo Card"
                className="max-h-[72vh] w-auto aspect-[3/4] object-contain rounded-2xl shadow-2xl border border-neutral-800 transition-transform duration-200"
              />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[11px] text-neutral-300 font-mono pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                3:4 无畸变正视静态合图
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
