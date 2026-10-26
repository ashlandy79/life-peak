import React, { useRef, useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Sparkles,
  Wand2,
  FlipHorizontal,
  Eraser,
} from 'lucide-react';
import {
  getImageDimensions,
  fileToDataUrl,
  generateStructureMaskFromSubject,
  normalizeStructureLayer,
  removeCheckerboardMatte,
} from '../utils/imageUtils';

export interface LayerSlotData {
  file: File | null;
  dataUrl: string;
  size: [number, number] | null;
}

export interface UploadedLayers {
  background: LayerSlotData;
  subject: LayerSlotData;
  accent: LayerSlotData;
  structure: LayerSlotData;
  back: LayerSlotData;
}

interface LayerUploaderProps {
  layers: UploadedLayers;
  onChange: (layers: UploadedLayers) => void;
  onLoadSample: () => void;
}

type LayerKey = keyof UploadedLayers;

interface SlotInfo {
  key: LayerKey;
  filename: string;
  title: string;
  description: string;
  required: boolean;
  color: string;
}

const SLOTS: SlotInfo[] = [
  {
    key: 'background',
    filename: 'background.png',
    title: '全景背景底板 (Background)',
    description: '完整不透明底层画面，承载视差移动、十字星芒与光学蒙版环境底色',
    required: true,
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300',
  },
  {
    key: 'subject',
    filename: 'subject.png / character.png',
    title: '核心画面主体 (Core Subject / Character)',
    description: '被封印或破框浮出的核心透明主体，在正值 Depth 下可突破卡框悬浮',
    required: true,
    color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-300',
  },
  {
    key: 'structure',
    filename: 'structure.png',
    title: '结构线发光遮罩 (Structure Glow Mask)',
    description: '黑底白线或透明轮廓线条图，驱动核心画面 40× RGBM HDR 霓虹流光',
    required: false,
    color: 'from-pink-500/20 to-rose-500/20 border-pink-500/40 text-pink-300',
  },
  {
    key: 'accent',
    filename: 'foreground-accent.png / ui.png',
    title: '附加装饰图层 (Optional Custom Overlay)',
    description: '可选上传的额外装饰 PNG，将自动与「奇遇卡属性排版」合并为 UI 层',
    required: false,
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300',
  },
  {
    key: 'back',
    filename: 'back.png',
    title: '卡牌背面 (Card Back)',
    description: '点击卡面 180° 翻转时展示的背面图（默认搭载官方皇家蓝金卡背）',
    required: false,
    color: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/40 text-indigo-300',
  },
];

export const LayerUploader: React.FC<LayerUploaderProps> = ({
  layers,
  onChange,
  onLoadSample,
}) => {
  const globalInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false);
  const [processingKey, setProcessingKey] = useState<string | null>(null);

  const distributeFiles = async (fileList: FileList | File[]) => {
    const updated = { ...layers };
    const files = Array.from(fileList);

    for (const file of files) {
      const name = file.name.toLowerCase();
      let targetKey: LayerKey | null = null;

      if (name.includes('background') || name.includes('bg')) {
        targetKey = 'background';
      } else if (name.includes('structure') || name.includes('contour') || name.includes('line')) {
        targetKey = 'structure';
      } else if (name.includes('back')) {
        targetKey = 'back';
      } else if (
        name.includes('accent') ||
        name.includes('ui') ||
        name.includes('frame') ||
        name.includes('decor')
      ) {
        targetKey = 'accent';
      } else if (
        name.includes('subject') ||
        name.includes('character') ||
        name.includes('main')
      ) {
        targetKey = 'subject';
      }

      if (targetKey) {
        try {
          let dataUrl = await fileToDataUrl(file);
          const size = await getImageDimensions(dataUrl);
          if (targetKey === 'structure' && updated.subject.dataUrl) {
            dataUrl = await normalizeStructureLayer(
              dataUrl,
              updated.subject.dataUrl,
              updated.background.size || size
            );
          }
          updated[targetKey] = { file, dataUrl, size };
        } catch (e) {
          console.error(`加载 ${file.name} 失败:`, e);
        }
      }
    }

    onChange(updated);
  };

  const handleSingleSlotUpload = async (key: LayerKey, file: File) => {
    try {
      setProcessingKey(key);
      let dataUrl = await fileToDataUrl(file);
      const size = await getImageDimensions(dataUrl);

      if (key === 'structure' && layers.subject.dataUrl) {
        const base = layers.background.size || layers.subject.size || size;
        dataUrl = await normalizeStructureLayer(dataUrl, layers.subject.dataUrl, base);
      }

      const nextLayers = {
        ...layers,
        [key]: { file, dataUrl, size },
      };

      if (key === 'subject') {
        const autoStruct = await generateStructureMaskFromSubject(
          dataUrl,
          layers.background.size || size
        );
        nextLayers.structure = {
          file: null,
          dataUrl: autoStruct,
          size: layers.background.size || size,
        };
      }

      onChange(nextLayers);
    } catch (e) {
      alert(`读取图片失败: ${(e as Error).message}`);
    } finally {
      setProcessingKey(null);
    }
  };

  const handleAutoExtractStructure = async () => {
    if (!layers.subject.dataUrl) return;
    try {
      setProcessingKey('structure');
      const targetSize = layers.background.size || layers.subject.size || [1080, 1440];
      const structUrl = await generateStructureMaskFromSubject(
        layers.subject.dataUrl,
        targetSize
      );
      onChange({
        ...layers,
        structure: {
          file: null,
          dataUrl: structUrl,
          size: targetSize,
        },
      });
    } catch (e) {
      alert(`提取结构线失败: ${(e as Error).message}`);
    } finally {
      setProcessingKey(null);
    }
  };

  const handleRemoveMatte = async (key: 'subject' | 'accent') => {
    const slot = layers[key];
    if (!slot.dataUrl) return;
    try {
      setProcessingKey(key);
      const cleanedUrl = await removeCheckerboardMatte(slot.dataUrl);
      const nextLayers = {
        ...layers,
        [key]: {
          ...slot,
          dataUrl: cleanedUrl,
        },
      };
      if (key === 'subject') {
        const targetSize = layers.background.size || slot.size || [1080, 1440];
        const structUrl = await generateStructureMaskFromSubject(cleanedUrl, targetSize);
        nextLayers.structure = {
          file: null,
          dataUrl: structUrl,
          size: targetSize,
        };
      }
      onChange(nextLayers);
    } catch (e) {
      alert(`背景净化失败: ${(e as Error).message}`);
    } finally {
      setProcessingKey(null);
    }
  };

  const removeSlot = (key: LayerKey) => {
    onChange({
      ...layers,
      [key]: {
        file: null,
        dataUrl: key === 'back' ? '/back.png' : '',
        size: null,
      },
    });
  };

  const baseSize = layers.background.size || layers.subject.size;

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingGlobal(true);
        }}
        onDragLeave={() => setIsDraggingGlobal(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingGlobal(false);
          if (e.dataTransfer.files?.length) {
            distributeFiles(e.dataTransfer.files);
          }
        }}
        className={`relative p-4 rounded-xl border-2 border-dashed transition-all duration-200 text-center flex flex-col items-center justify-center gap-2 cursor-pointer
          ${
            isDraggingGlobal
              ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
              : 'border-neutral-700/80 bg-neutral-900/60 hover:border-neutral-500 hover:bg-neutral-900/90'
          }`}
        onClick={() => globalInputRef.current?.click()}
      >
        <input
          ref={globalInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) {
              distributeFiles(e.target.files);
            }
          }}
        />

        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-full bg-cyan-400/10 text-cyan-400">
            <Upload className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-neutral-200">
              拖拽多个图层文件或点击批量导入
            </div>
            <div className="text-[11px] text-neutral-400">
              自动识别 <code className="text-amber-300">background.png</code> /{' '}
              <code className="text-cyan-300">subject.png</code> /{' '}
              <code className="text-pink-300">structure.png</code> /{' '}
              <code className="text-emerald-300">foreground-accent.png</code>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLoadSample();
          }}
          className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-xs font-medium text-cyan-200 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          重置为图 1「奇遇封印卡」官方示例图层
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {SLOTS.map((slot) => {
          const item = layers[slot.key];
          const hasImage = Boolean(item.dataUrl);
          const isSizeMismatch =
            hasImage &&
            slot.key !== 'back' &&
            baseSize &&
            item.size &&
            (item.size[0] !== baseSize[0] || item.size[1] !== baseSize[1]);

          return (
            <div
              key={slot.key}
              className={`relative flex flex-col p-3.5 rounded-xl border transition-all ${
                hasImage
                  ? 'border-neutral-700 bg-neutral-900/90'
                  : 'border-neutral-800 bg-neutral-900/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded font-mono font-medium border ${slot.color}`}
                  >
                    {slot.filename}
                  </span>
                  {slot.required ? (
                    <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60 font-semibold">
                      必填
                    </span>
                  ) : (
                    <span className="text-[10px] text-neutral-400 bg-neutral-800/80 px-1.5 py-0.5 rounded">
                      可选
                    </span>
                  )}
                </div>

                {hasImage && !slot.required && (
                  <button
                    onClick={() => removeSlot(slot.key)}
                    title="移除或重置图层"
                    className="p-1 text-neutral-400 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="text-xs text-neutral-200 font-semibold">{slot.title}</div>
              <div className="text-[11px] text-neutral-400 mb-2.5 leading-relaxed">
                {slot.description}
              </div>

              {(slot.key === 'structure' || slot.key === 'subject' || slot.key === 'accent') && (
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  {slot.key === 'structure' && layers.subject.dataUrl && (
                    <button
                      type="button"
                      disabled={processingKey === 'structure'}
                      onClick={handleAutoExtractStructure}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 border border-pink-500/30 text-[11px] font-medium transition-colors"
                    >
                      <Wand2 className="w-3 h-3" />
                      {processingKey === 'structure'
                        ? '正在提取结构线...'
                        : '从核心画面自动生成结构发光线'}
                    </button>
                  )}

                  {(slot.key === 'subject' || slot.key === 'accent') && hasImage && (
                    <button
                      type="button"
                      disabled={processingKey === slot.key}
                      onClick={() => handleRemoveMatte(slot.key as 'subject' | 'accent')}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[11px] font-medium transition-colors"
                    >
                      <Eraser className="w-3 h-3" />
                      {processingKey === slot.key
                        ? '净化背景中...'
                        : '智能去除棋盘格/浅色底 (Matte Repair)'}
                    </button>
                  )}
                </div>
              )}

              {hasImage ? (
                <div className="relative rounded-lg overflow-hidden border border-neutral-700/60 bg-neutral-950/60 flex items-center justify-between p-2">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <img
                      src={item.dataUrl}
                      alt={slot.title}
                      className={`w-12 h-14 object-contain rounded border border-neutral-800 flex-shrink-0 ${
                        slot.key === 'structure' ? 'bg-black' : 'bg-neutral-900'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-xs text-neutral-200 font-mono truncate">
                        {item.file?.name || slot.filename.split(' ')[0]}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono mt-0.5 flex items-center gap-1.5">
                        {item.size
                          ? `${item.size[0]} × ${item.size[1]} px`
                          : slot.key === 'back'
                          ? '默认皇家蓝金卡背'
                          : '已就绪'}
                        {isSizeMismatch ? (
                          <span
                            title="尺寸与基准不一致，引擎将自动缩放对齐"
                            className="inline-flex items-center text-amber-400 gap-0.5"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            自动对齐
                          </span>
                        ) : (
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  <label className="cursor-pointer text-xs px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-neutral-700 transition-colors flex-shrink-0">
                    更换
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleSingleSlotUpload(slot.key, file);
                      }}
                    />
                  </label>
                </div>
              ) : (
                <label className="flex-1 min-h-[58px] border border-dashed border-neutral-800 hover:border-neutral-600 rounded-lg p-3 flex items-center justify-center gap-2 cursor-pointer bg-neutral-950/30 hover:bg-neutral-950/70 transition-all text-neutral-400 hover:text-neutral-200">
                  {slot.key === 'back' ? (
                    <FlipHorizontal className="w-4 h-4 text-neutral-500" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-neutral-500" />
                  )}
                  <span className="text-xs">点击上传或拖放图片</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleSingleSlotUpload(slot.key, file);
                    }}
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
