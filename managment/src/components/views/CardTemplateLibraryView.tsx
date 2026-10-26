import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Sliders,
  Palette,
  Layers,
  Plus,
  Trash2,
  Save,
  Check,
  RotateCcw,
  Eye,
  Crosshair,
  Award,
  RefreshCw,
  Copy,
  Upload,
  Image as ImageIcon,
  Sun,
  Maximize2,
  SlidersHorizontal,
} from 'lucide-react';
import { TcgHoloCard } from '../TcgHoloCard';
import { RgbaColorPicker } from '../RgbaColorPicker';
import { api } from '../../services/api';
import { generateSampleCardBundleAsync } from '../../utils/sampleAssets';
import { renderLifeSealUiLayer } from '../../utils/lifeSealUiRenderer';
import {
  DEFAULT_LIFE_SEAL_META,
  DEFAULT_TCG_PARAMETERS,
  OPTICAL_MASK_OPTIONS,
  RIM_COLOR_OPTIONS,
} from '../../core/parameters';
import type {
  CardDefinition,
  CardTemplate,
  BorderLayerConfig,
  FrameMode,
} from '../../core/lifepackTypes';
import type {
  OpticalMaskType,
  RimColorType,
  StructureLightMode,
  TcgCardAssets,
  TcgCardHandle,
  TcgHoloParameters,
} from '../../core/types';

interface CardTemplateLibraryViewProps {
  templates: CardTemplate[];
  cards: CardDefinition[];
  onRefresh: () => void;
  onOpenCardStudio?: (cardId: string) => void;
}

const PRESET_PALETTES = [
  { name: '冰川珍珠蓝', color: '#67e8f9', secColor: '#818cf8', rim: 'pearl-blue' as RimColorType },
  { name: '皇家香槟金', color: '#fbbf24', secColor: '#f59e0b', rim: 'gold' as RimColorType },
  { name: '冷调钛拉丝', color: '#94a3b8', secColor: '#cbd5e1', rim: 'silver' as RimColorType },
  { name: '幻夜紫霓虹', color: '#c084fc', secColor: '#a855f7', rim: 'purple' as RimColorType },
  { name: '彩虹棱镜', color: '#ec4899', secColor: '#38bdf8', rim: 'rainbow' as RimColorType },
  { name: '翡翠流光', color: '#34d399', secColor: '#10b981', rim: 'pearl-blue' as RimColorType },
  { name: '曜石暗金', color: '#334155', secColor: '#d97706', rim: 'gold' as RimColorType },
  { name: '极光粉霞', color: '#f472b6', secColor: '#fb7185', rim: 'rainbow' as RimColorType },
];

export const CardTemplateLibraryView: React.FC<CardTemplateLibraryViewProps> = ({
  templates,
  cards,
  onRefresh,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate | null>(
    templates[0] || null
  );
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'palette' | 'optics' | 'basic'>('palette');

  // 3D 实时预览句柄与底图
  const [previewHandle, setPreviewHandle] = useState<TcgCardHandle | null>(null);
  const [composedUiUrl, setComposedUiUrl] = useState<string>('');
  const [sampleAssets, setSampleAssets] = useState<{
    bg: string;
    sub: string;
    ui: string;
    structure: string;
    back: string;
  } | null>(null);

  // 文件上传引用
  const outerFileInputRef = useRef<HTMLInputElement>(null);
  const innerFileInputRef = useRef<HTMLInputElement>(null);

  // 1. 初始化示例底图
  useEffect(() => {
    let cancelled = false;
    generateSampleCardBundleAsync().then((bundle) => {
      if (!cancelled) {
        setSampleAssets({
          bg: bundle.backgroundUrl,
          sub: bundle.subjectUrl,
          ui: bundle.uiUrl,
          structure: bundle.structureUrl,
          back: bundle.backUrl,
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // 2. 外部模板列表同步
  useEffect(() => {
    if (templates.length > 0) {
      if (!selectedTemplate || !templates.some((t) => t.id === selectedTemplate.id)) {
        setSelectedTemplate(templates[0]);
      } else {
        const found = templates.find((t) => t.id === selectedTemplate.id);
        if (found) setSelectedTemplate(found);
      }
    }
  }, [templates]);

  // 3. 核心：模板库 3D 卡片强制始终处于「解封态」，并实时同步光学参数
  useEffect(() => {
    if (previewHandle && selectedTemplate) {
      const params = selectedTemplate.renderParameters || DEFAULT_TCG_PARAMETERS;
      previewHandle.setParameters({
        ...params,
        rimColor: selectedTemplate.rimColor,
        structureLightMode: selectedTemplate.structureLightMode,
        opticalMask: selectedTemplate.opticalMask,
        isSealed: false,          // 确保始终处于解封状态
        frostedBlur: 0.0,         // 无毛玻璃暗化
      });
    }
  }, [selectedTemplate?.id, previewHandle]);

  // 4. 实时动态重绘 UI 贴图（防抖 50ms），确保内外边框修改即时生效
  useEffect(() => {
    if (!selectedTemplate) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      renderLifeSealUiLayer(
        { ...DEFAULT_LIFE_SEAL_META, showSealCrest: false },
        selectedTemplate.rimColor,
        [1080, 1440],
        undefined,
        {
          outerBorder: selectedTemplate.outerBorder,
          innerBorder: selectedTemplate.innerBorder,
        }
      ).then((url) => {
        if (!cancelled) {
          setComposedUiUrl(url);
        }
      });
    }, 50);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    selectedTemplate?.id,
    selectedTemplate?.outerBorder,
    selectedTemplate?.innerBorder,
    selectedTemplate?.borderCustomColor,
    selectedTemplate?.rimColor,
    previewHandle,
  ]);

  // 表单变更辅助
  const handleUpdateField = <K extends keyof CardTemplate>(
    field: K,
    val: CardTemplate[K]
  ) => {
    if (!selectedTemplate) return;
    const updated = { ...selectedTemplate, [field]: val };
    setSelectedTemplate(updated);

    if (previewHandle) {
      if (field === 'rimColor') {
        previewHandle.setParameters({ rimColor: val as RimColorType, isSealed: false });
      }
      if (field === 'structureLightMode') {
        previewHandle.setParameters({ structureLightMode: val as StructureLightMode, isSealed: false });
      }
      if (field === 'opticalMask') {
        previewHandle.setParameters({ opticalMask: val as OpticalMaskType, isSealed: false });
      }
    }
  };

  // 外边框属性更新
  const handleUpdateOuterBorder = (patch: Partial<BorderLayerConfig>) => {
    if (!selectedTemplate) return;
    const current: BorderLayerConfig = selectedTemplate.outerBorder || {
      mode: 'COLOR',
      color: selectedTemplate.borderCustomColor || 'rgba(103, 232, 249, 0.95)',
      thickness: 10,
      radius: 48,
      offset: 22,
      glowStrength: 18,
    };
    const next = { ...current, ...patch };
    const updated: CardTemplate = {
      ...selectedTemplate,
      outerBorder: next,
      borderCustomColor: next.mode === 'COLOR' ? next.color : selectedTemplate.borderCustomColor,
    };
    setSelectedTemplate(updated);
  };

  // 内边框属性更新
  const handleUpdateInnerBorder = (patch: Partial<BorderLayerConfig>) => {
    if (!selectedTemplate) return;
    const current: BorderLayerConfig = selectedTemplate.innerBorder || {
      mode: 'COLOR',
      color: 'rgba(255, 255, 255, 0.78)',
      thickness: 2.5,
      radius: 42,
      offset: 10,
      glowStrength: 4,
    };
    const next = { ...current, ...patch };
    const updated: CardTemplate = {
      ...selectedTemplate,
      innerBorder: next,
    };
    setSelectedTemplate(updated);
  };

  // 上传外边框图片
  const handleUploadOuterBorderImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      handleUpdateOuterBorder({
        mode: 'IMAGE',
        imageAssetUrl: dataUrl,
      });
    };
    reader.readAsDataURL(file);
  };

  // 上传内边框图片
  const handleUploadInnerBorderImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      handleUpdateInnerBorder({
        mode: 'IMAGE',
        imageAssetUrl: dataUrl,
      });
    };
    reader.readAsDataURL(file);
  };

  // 光学微调滑块更新（实时热预览）
  const handleUpdateParam = <K extends keyof TcgHoloParameters>(
    key: K,
    val: TcgHoloParameters[K]
  ) => {
    if (!selectedTemplate) return;
    const baseParams = selectedTemplate.renderParameters || DEFAULT_TCG_PARAMETERS;
    const updatedParams = { ...baseParams, [key]: val, isSealed: false, frostedBlur: 0.0 };
    const updatedTemplate = { ...selectedTemplate, renderParameters: updatedParams };
    setSelectedTemplate(updatedTemplate);
    previewHandle?.setParameters({ [key]: val, isSealed: false, frostedBlur: 0.0 });
  };

  // 保存模组配置
  const handleSave = async () => {
    if (!selectedTemplate) return;
    try {
      setSaving(true);
      setSaveSuccess(false);

      if (isCreating) {
        const created = await api.createTemplate(selectedTemplate);
        onRefresh();
        setSelectedTemplate(created);
        setIsCreating(false);
      } else {
        const updated = await api.updateTemplate(selectedTemplate.id, selectedTemplate);
        onRefresh();
        setSelectedTemplate(updated);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      alert(`保存失败: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // 新建模组
  const handleCreateNew = () => {
    const code = `TPL-${String(Math.floor(Math.random() * 900) + 100)}`;
    const newTpl: CardTemplate = {
      id: `tpl-${Date.now()}`,
      templateCode: code,
      name: '新卡片视觉模组',
      description: '自定义卡片等级体系与双层边框光学模组',
      rarityTier: 'advanced',
      rarityBadge: '高级',
      outerBorder: {
        mode: 'COLOR',
        color: 'rgba(251, 191, 36, 0.95)',
        thickness: 10,
        radius: 48,
        offset: 22,
        glowStrength: 18,
      },
      innerBorder: {
        mode: 'COLOR',
        color: 'rgba(254, 240, 138, 0.82)',
        thickness: 2.5,
        radius: 42,
        offset: 10,
        glowStrength: 4,
      },
      frameMode: 'PROGRAMMATIC',
      borderCustomColor: '#fbbf24',
      borderSecondaryColor: '#f59e0b',
      rimColor: 'gold',
      opticalMask: 'holo-rainbow',
      structureLightMode: 'tyndall-gold',
      renderParameters: {
        ...DEFAULT_TCG_PARAMETERS,
        rimColor: 'gold',
        structureLightMode: 'tyndall-gold',
        opticalMask: 'holo-rainbow',
        isSealed: false,
        frostedBlur: 0.0,
      },
      canvasWidth: 1200,
      canvasHeight: 1600,
      aspectRatio: '3:4',
      safeArea: { x: 0.08, y: 0.08, width: 0.84, height: 0.84 },
      version: 1,
      status: 'READY',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSelectedTemplate(newTpl);
    setIsCreating(true);
  };

  // 删除模组
  const handleDelete = async (tpl: CardTemplate) => {
    const refCount = cards.filter((c) => c.frameTemplateId === tpl.id).length;
    if (refCount > 0) {
      alert(`该模组正被 ${refCount} 张卡片使用，无法直接删除！请先将卡片绑定到其他模组。`);
      return;
    }
    if (!confirm(`确定要删除模组 [${tpl.name}] 吗？`)) return;

    try {
      await api.deleteTemplate(tpl.id);
      onRefresh();
      if (selectedTemplate?.id === tpl.id) {
        setSelectedTemplate(templates.find((t) => t.id !== tpl.id) || null);
      }
    } catch (err: any) {
      alert(`删除失败: ${err.message}`);
    }
  };

  // 组装传给 3D 卡片的资源（始终使用动态合成的 UI 贴图）
  const tcgAssets: TcgCardAssets = {
    background: sampleAssets?.bg || '',
    character: sampleAssets?.sub || '',
    ui: composedUiUrl || sampleAssets?.ui || '',
    structure: sampleAssets?.structure || '',
    back: sampleAssets?.back || '/back.png',
    width: 1080,
    height: 1440,
  };

  const referencedCards = selectedTemplate
    ? cards.filter((c) => c.frameTemplateId === selectedTemplate.id)
    : [];

  const currentOuterBorder: BorderLayerConfig = selectedTemplate?.outerBorder || {
    mode: 'COLOR',
    color: selectedTemplate?.borderCustomColor || 'rgba(103, 232, 249, 0.95)',
    thickness: 10,
    radius: 48,
    offset: 22,
    glowStrength: 18,
  };

  const currentInnerBorder: BorderLayerConfig = selectedTemplate?.innerBorder || {
    mode: 'COLOR',
    color: 'rgba(255, 255, 255, 0.78)',
    thickness: 2.5,
    radius: 42,
    offset: 10,
    glowStrength: 4,
  };

  const params = selectedTemplate?.renderParameters || DEFAULT_TCG_PARAMETERS;

  return (
    <div className="flex-1 flex flex-col bg-neutral-950 text-neutral-100 min-h-[calc(100vh-56px)]">
      {/* 顶部标题与快速操作栏 */}
      <div className="h-14 bg-neutral-900/80 border-b border-neutral-800 px-6 flex items-center justify-between sticky top-14 z-30 backdrop-blur-md">
        <div>
          <h1 className="text-base font-bold text-neutral-100 flex items-center gap-2">
            <Palette className="w-5 h-5 text-cyan-400" />
            卡片模板与模组工坊 (Card Template Studio)
          </h1>
          <p className="text-[11px] text-neutral-400">
            支持外边框与内边框独立控制（上传切片/RGBA色盘二选一）、全息光学蒙版与动态光束多维度自制。
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCreateNew}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-cyan-300 border border-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            新建等级模组
          </button>

          {selectedTemplate && (
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
                saveSuccess
                  ? 'bg-emerald-500 text-neutral-950 shadow-emerald-500/20'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-neutral-950 shadow-cyan-500/20'
              }`}
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  保存中...
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  已保存
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  保存模组配置
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 主体三栏布局 */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* 左侧：模组母版列表 */}
        <aside className="w-full lg:w-72 border-r border-neutral-800 bg-neutral-950/90 flex flex-col">
          <div className="p-3 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <span>已有模板模组 ({templates.length})</span>
            <button
              onClick={onRefresh}
              className="p-1 hover:text-neutral-200 transition-colors"
              title="刷新列表"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-2 custom-scrollbar">
            {templates.map((tpl) => {
              const active = selectedTemplate?.id === tpl.id;
              const refCount = cards.filter((c) => c.frameTemplateId === tpl.id).length;
              return (
                <div
                  key={tpl.id}
                  onClick={() => {
                    setSelectedTemplate(tpl);
                    setIsCreating(false);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 ${
                    active
                      ? 'bg-neutral-900 border-cyan-500/60 shadow-md shadow-cyan-500/10'
                      : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-cyan-300">
                      {tpl.templateCode || tpl.frameCode}
                    </span>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded font-semibold text-neutral-950"
                      style={{
                        backgroundColor:
                          tpl.outerBorder?.color || tpl.borderCustomColor || '#67e8f9',
                      }}
                    >
                      {tpl.rarityBadge || tpl.rarityTier}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-neutral-200 truncate">{tpl.name}</div>
                    <div className="text-[10px] text-neutral-500 truncate mt-0.5">
                      {tpl.description || '无模组描述'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1 border-t border-neutral-800/80">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full border border-white/30"
                        style={{
                          backgroundColor:
                            tpl.outerBorder?.color || tpl.borderCustomColor || '#94a3b8',
                        }}
                      />
                      <span>
                        {tpl.outerBorder?.mode === 'IMAGE' ? '切片贴图' : '双边框色盘'}
                      </span>
                    </div>
                    <span>{refCount} 张卡片使用</span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* 中间：3D WebGL 实时预览视口 (始终处于解封状态) */}
        <section className="flex-1 min-h-[460px] lg:min-h-0 flex flex-col items-center justify-center p-6 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/80 via-neutral-950 to-neutral-950 overflow-hidden">
          {/* 光晕背景 */}
          <div
            className="absolute w-[480px] h-[480px] blur-[140px] rounded-full pointer-events-none transition-colors duration-700 opacity-20"
            style={{
              backgroundColor:
                currentOuterBorder.mode === 'COLOR'
                  ? currentOuterBorder.color
                  : '#67e8f9',
            }}
          />

          {sampleAssets && selectedTemplate ? (
            <div className="w-full flex flex-col items-center justify-center z-10">
              <TcgHoloCard
                assets={tcgAssets}
                initialParameters={{
                  ...params,
                  isSealed: false,
                  frostedBlur: 0.0,
                }}
                onCardReady={(handle) => {
                  setPreviewHandle(handle);
                  handle.setParameters({
                    ...params,
                    isSealed: false,
                    frostedBlur: 0.0,
                  });
                }}
              />

              <div className="mt-3 flex items-center gap-3">
                <span className="text-[11px] text-emerald-400/90 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  已保持解封态预览 · [{selectedTemplate.name}]
                </span>
                <button
                  onClick={() => previewHandle?.recenter()}
                  className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-[11px] flex items-center gap-1 transition-colors"
                  title="重置视角到正中"
                >
                  <Crosshair className="w-3 h-3" />
                  视角居中
                </button>
              </div>
            </div>
          ) : (
            <div className="text-neutral-500 text-xs flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              正在装载模组全息视口...
            </div>
          )}
        </section>

        {/* 右侧：参数配置面板 */}
        {selectedTemplate && (
          <aside className="w-full lg:w-[460px] xl:w-[500px] border-t lg:border-t-0 lg:border-l border-neutral-800 bg-neutral-950 flex flex-col z-20 max-h-[calc(100vh-112px)]">
            {/* Tab 栏 */}
            <div className="grid grid-cols-3 border-b border-neutral-800 bg-neutral-900/80 p-1.5 gap-1">
              <button
                onClick={() => setActiveTab('palette')}
                className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'palette'
                    ? 'bg-neutral-800 text-cyan-300 shadow-sm border border-cyan-500/40'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>边框与色盘</span>
              </button>
              <button
                onClick={() => setActiveTab('optics')}
                className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'optics'
                    ? 'bg-neutral-800 text-amber-300 shadow-sm border border-amber-500/40'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>光学蒙版与光效</span>
              </button>
              <button
                onClick={() => setActiveTab('basic')}
                className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'basic'
                    ? 'bg-neutral-800 text-purple-300 shadow-sm border border-purple-500/40'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>等级体系信息</span>
              </button>
            </div>

            {/* 面板内容 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar text-neutral-200">
              {/* TAB 1: 边框与色盘 (内外边框拆分 + 二选一 + RGBA色盘 + 丰富几何参数) */}
              {activeTab === 'palette' && (
                <div className="space-y-5">
                  {/* 1. 外边框 (Outer Border) */}
                  <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3.5 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
                        <label className="text-xs font-bold text-neutral-100">
                          外边框配置 (Outer Border)
                        </label>
                      </div>
                      <span className="text-[10px] text-neutral-400">
                        卡片四周主轮廓与外辉光
                      </span>
                    </div>

                    {/* 模式切换 (二选一) */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateOuterBorder({ mode: 'COLOR' })}
                        className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          currentOuterBorder.mode === 'COLOR'
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <Palette className="w-3.5 h-3.5 text-cyan-400" />
                        <span>系统颜色 (RGBA色盘)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateOuterBorder({ mode: 'IMAGE' })}
                        className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          currentOuterBorder.mode === 'IMAGE'
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>上传自定义图片 (PNG)</span>
                      </button>
                    </div>

                    {/* 外边框模式 A: RGBA 色盘与几何滑块 */}
                    {currentOuterBorder.mode === 'COLOR' ? (
                      <div className="space-y-3 pt-1">
                        <RgbaColorPicker
                          label="外边框色彩 (RGBA 自选提色)"
                          value={currentOuterBorder.color}
                          onChange={(rgba) => handleUpdateOuterBorder({ color: rgba })}
                        />

                        {/* 几何滑块 */}
                        <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-3 space-y-3">
                          {/* 边框粗细 */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-neutral-400">外边框厚度 (Thickness)</span>
                              <span className="font-mono text-cyan-300">
                                {currentOuterBorder.thickness}px
                              </span>
                            </div>
                            <input
                              type="range"
                              min="2"
                              max="40"
                              step="1"
                              value={currentOuterBorder.thickness}
                              onChange={(e) =>
                                handleUpdateOuterBorder({ thickness: Number(e.target.value) })
                              }
                              className="w-full accent-cyan-400 cursor-pointer"
                            />
                          </div>

                          {/* 圆角 */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-neutral-400">外边框圆角半径 (Radius)</span>
                              <span className="font-mono text-cyan-300">
                                {currentOuterBorder.radius}px
                              </span>
                            </div>
                            <input
                              type="range"
                              min="12"
                              max="64"
                              step="1"
                              value={currentOuterBorder.radius}
                              onChange={(e) =>
                                handleUpdateOuterBorder({ radius: Number(e.target.value) })
                              }
                              className="w-full accent-cyan-400 cursor-pointer"
                            />
                          </div>

                          {/* 外边距 */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-neutral-400">外边距间隙 (Padding)</span>
                              <span className="font-mono text-cyan-300">
                                {currentOuterBorder.offset}px
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="40"
                              step="1"
                              value={currentOuterBorder.offset}
                              onChange={(e) =>
                                handleUpdateOuterBorder({ offset: Number(e.target.value) })
                              }
                              className="w-full accent-cyan-400 cursor-pointer"
                            />
                          </div>

                          {/* 辉光发散 */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-neutral-400">辉光发散半径 (Glow Blur)</span>
                              <span className="font-mono text-cyan-300">
                                {currentOuterBorder.glowStrength}px
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="50"
                              step="1"
                              value={currentOuterBorder.glowStrength}
                              onChange={(e) =>
                                handleUpdateOuterBorder({
                                  glowStrength: Number(e.target.value),
                                })
                              }
                              className="w-full accent-cyan-400 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* 外边框模式 B: 上传图片切片 */
                      <div className="p-4 border border-dashed border-neutral-700 rounded-xl space-y-3 bg-neutral-950/60 text-center">
                        <input
                          ref={outerFileInputRef}
                          type="file"
                          accept="image/png,image/webp"
                          onChange={handleUploadOuterBorderImage}
                          className="hidden"
                        />
                        {currentOuterBorder.imageAssetUrl ? (
                          <div className="space-y-2">
                            <img
                              src={currentOuterBorder.imageAssetUrl}
                              alt="外边框切片"
                              className="max-h-28 mx-auto object-contain rounded border border-neutral-700 bg-black/40"
                            />
                            <div className="flex items-center justify-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => outerFileInputRef.current?.click()}
                                className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] text-cyan-300 border border-neutral-700 cursor-pointer"
                              >
                                更换切片
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateOuterBorder({
                                    imageAssetUrl: null,
                                    mode: 'COLOR',
                                  })
                                }
                                className="px-2.5 py-1 rounded bg-red-950/60 hover:bg-red-900/60 text-[11px] text-red-300 border border-red-800/60 cursor-pointer"
                              >
                                移除切片返回自选色
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => outerFileInputRef.current?.click()}
                            className="cursor-pointer py-4 space-y-1.5"
                          >
                            <Upload className="w-6 h-6 text-cyan-400 mx-auto" />
                            <div className="text-xs font-semibold text-neutral-300">
                              点击上传透明 PNG 外边框切片
                            </div>
                            <div className="text-[10px] text-neutral-500">
                              建议 1080×1440 尺寸，上传后自动替换系统绘制外框
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 2. 内边框 (Inner Border) */}
                  <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3.5 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm bg-purple-400" />
                        <label className="text-xs font-bold text-neutral-100">
                          内边框配置 (Inner Border)
                        </label>
                      </div>
                      <span className="text-[10px] text-neutral-400">
                        内嵌高光细线与内缩层叠
                      </span>
                    </div>

                    {/* 模式切换 (二选一) */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateInnerBorder({ mode: 'COLOR' })}
                        className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          currentInnerBorder.mode === 'COLOR'
                            ? 'bg-purple-500/20 border-purple-400 text-purple-200 shadow-sm'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <Palette className="w-3.5 h-3.5 text-purple-400" />
                        <span>系统颜色 (RGBA色盘)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateInnerBorder({ mode: 'IMAGE' })}
                        className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          currentInnerBorder.mode === 'IMAGE'
                            ? 'bg-purple-500/20 border-purple-400 text-purple-200 shadow-sm'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>上传自定义图片 (PNG)</span>
                      </button>
                    </div>

                    {/* 内边框模式 A: RGBA 色盘与几何滑块 */}
                    {currentInnerBorder.mode === 'COLOR' ? (
                      <div className="space-y-3 pt-1">
                        <RgbaColorPicker
                          label="内边框色彩 (RGBA 自选提色)"
                          value={currentInnerBorder.color}
                          onChange={(rgba) => handleUpdateInnerBorder({ color: rgba })}
                        />

                        {/* 几何滑块 */}
                        <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-3 space-y-3">
                          {/* 线条粗细 */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-neutral-400">内边框线宽 (Thickness)</span>
                              <span className="font-mono text-purple-300">
                                {currentInnerBorder.thickness}px
                              </span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="24"
                              step="0.5"
                              value={currentInnerBorder.thickness}
                              onChange={(e) =>
                                handleUpdateInnerBorder({ thickness: Number(e.target.value) })
                              }
                              className="w-full accent-purple-400 cursor-pointer"
                            />
                          </div>

                          {/* 内缩间距 */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-neutral-400">到外边框内缩间距 (Offset)</span>
                              <span className="font-mono text-purple-300">
                                {currentInnerBorder.offset}px
                              </span>
                            </div>
                            <input
                              type="range"
                              min="4"
                              max="48"
                              step="1"
                              value={currentInnerBorder.offset}
                              onChange={(e) =>
                                handleUpdateInnerBorder({ offset: Number(e.target.value) })
                              }
                              className="w-full accent-purple-400 cursor-pointer"
                            />
                          </div>

                          {/* 圆角 */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-neutral-400">内边框圆角 (Radius)</span>
                              <span className="font-mono text-purple-300">
                                {currentInnerBorder.radius}px
                              </span>
                            </div>
                            <input
                              type="range"
                              min="8"
                              max="48"
                              step="1"
                              value={currentInnerBorder.radius}
                              onChange={(e) =>
                                handleUpdateInnerBorder({ radius: Number(e.target.value) })
                              }
                              className="w-full accent-purple-400 cursor-pointer"
                            />
                          </div>

                          {/* 辉光 */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-neutral-400">内边框霓虹发光 (Glow)</span>
                              <span className="font-mono text-purple-300">
                                {currentInnerBorder.glowStrength}px
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="40"
                              step="1"
                              value={currentInnerBorder.glowStrength}
                              onChange={(e) =>
                                handleUpdateInnerBorder({
                                  glowStrength: Number(e.target.value),
                                })
                              }
                              className="w-full accent-purple-400 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* 内边框模式 B: 上传图片切片 */
                      <div className="p-4 border border-dashed border-neutral-700 rounded-xl space-y-3 bg-neutral-950/60 text-center">
                        <input
                          ref={innerFileInputRef}
                          type="file"
                          accept="image/png,image/webp"
                          onChange={handleUploadInnerBorderImage}
                          className="hidden"
                        />
                        {currentInnerBorder.imageAssetUrl ? (
                          <div className="space-y-2">
                            <img
                              src={currentInnerBorder.imageAssetUrl}
                              alt="内边框切片"
                              className="max-h-28 mx-auto object-contain rounded border border-neutral-700 bg-black/40"
                            />
                            <div className="flex items-center justify-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => innerFileInputRef.current?.click()}
                                className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] text-purple-300 border border-neutral-700 cursor-pointer"
                              >
                                更换切片
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateInnerBorder({
                                    imageAssetUrl: null,
                                    mode: 'COLOR',
                                  })
                                }
                                className="px-2.5 py-1 rounded bg-red-950/60 hover:bg-red-900/60 text-[11px] text-red-300 border border-red-800/60 cursor-pointer"
                              >
                                移除切片返回自选色
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => innerFileInputRef.current?.click()}
                            className="cursor-pointer py-4 space-y-1.5"
                          >
                            <Upload className="w-6 h-6 text-purple-400 mx-auto" />
                            <div className="text-xs font-semibold text-neutral-300">
                              点击上传透明 PNG 内边框切片
                            </div>
                            <div className="text-[10px] text-neutral-500">
                              通常包含装饰角标、发光花纹或内边饰线条
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 3. 内嵌流光整体色调 */}
                  <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3.5 space-y-2.5">
                    <label className="text-xs font-bold text-neutral-300 block">
                      内嵌流光色彩基调 (Rim Color Base)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {RIM_COLOR_OPTIONS.map((r) => {
                        const active = selectedTemplate.rimColor === r.value;
                        return (
                          <button
                            key={r.value}
                            type="button"
                            onClick={() =>
                              handleUpdateField('rimColor', r.value as RimColorType)
                            }
                            className={`p-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                              active
                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                            }`}
                          >
                            {r.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: 光学蒙版与光效配置 (预设 + 多维度深度自制) */}
              {activeTab === 'optics' && (
                <div className="space-y-5">
                  {/* 1. 光学蒙版预设选择 */}
                  <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3.5 space-y-2.5">
                    <label className="text-xs font-bold text-neutral-300 block">
                      全息光学蒙版预设 (Optical Mask Presets)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {OPTICAL_MASK_OPTIONS.map((mask) => {
                        const active = selectedTemplate.opticalMask === mask.value;
                        return (
                          <button
                            key={mask.value}
                            type="button"
                            onClick={() =>
                              handleUpdateField('opticalMask', mask.value as OpticalMaskType)
                            }
                            className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                              active
                                ? 'bg-amber-500/15 border-amber-400 text-white shadow-sm'
                                : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                            }`}
                          >
                            <div className="font-semibold">{mask.label}</div>
                            <div className="text-[9px] text-neutral-500 mt-0.5 truncate">
                              {mask.desc}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. 结构线发光与投射模式 */}
                  <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3.5 space-y-2.5">
                    <label className="text-xs font-bold text-neutral-300 block">
                      结构线发光模式 (Structure Light Mode)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { mode: 'subtle-sun', label: '微弱阳光', desc: '低调晨曦日光' },
                        { mode: 'tyndall-gold', label: '暖金丁达尔', desc: '圣光斜向光束' },
                        { mode: 'holo-rainbow', label: '全息虹彩', desc: '全光谱干涉' },
                      ].map((item) => {
                        const active = selectedTemplate.structureLightMode === item.mode;
                        return (
                          <button
                            key={item.mode}
                            type="button"
                            onClick={() =>
                              handleUpdateField(
                                'structureLightMode',
                                item.mode as StructureLightMode
                              )
                            }
                            className={`p-2 rounded-lg border text-center text-xs transition-all cursor-pointer ${
                              active
                                ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                            }`}
                          >
                            <div>{item.label}</div>
                            <div className="text-[9px] text-neutral-500 mt-0.5">{item.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. 多维度光束与扫光自制 */}
                  <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3.5 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-amber-400" />
                        <label className="text-xs font-bold text-neutral-100">
                          动态光束自制定制 (Custom Beam Studio)
                        </label>
                      </div>
                      <label className="flex items-center gap-1.5 text-[11px] text-cyan-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={params.useCustomColors ?? false}
                          onChange={(e) =>
                            handleUpdateParam('useCustomColors', e.target.checked)
                          }
                          className="accent-cyan-400 rounded"
                        />
                        启用自定义光束色盘
                      </label>
                    </div>

                    {params.useCustomColors && (
                      <RgbaColorPicker
                        label="光束色彩 (Beam Color RGBA)"
                        value={params.customBeamColor || '#ffffff'}
                        onChange={(rgba, hex) => {
                          handleUpdateParam('customBeamColor', hex);
                        }}
                      />
                    )}

                    <div className="space-y-3 pt-1">
                      {/* 光束倾角 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-neutral-400">光束入射旋转角度 (Beam Angle)</span>
                          <span className="font-mono text-amber-300">
                            {params.beamAngle ?? 0}°
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-60"
                          max="60"
                          step="1"
                          value={params.beamAngle ?? 0}
                          onChange={(e) =>
                            handleUpdateParam('beamAngle', Number(e.target.value))
                          }
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                      </div>

                      {/* 光束宽度 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-neutral-400">光束宽度与羽化 (Beam Width)</span>
                          <span className="font-mono text-amber-300">
                            {params.beamWidth ?? 1.2}x
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.2"
                          max="3.0"
                          step="0.05"
                          value={params.beamWidth ?? 1.2}
                          onChange={(e) =>
                            handleUpdateParam('beamWidth', Number(e.target.value))
                          }
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                      </div>

                      {/* 聚光高光强度 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-neutral-400">聚光高光动感反射 (Glare)</span>
                          <span className="font-mono text-amber-300">
                            {params.glareIntensity ?? 1.0}x
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.05"
                          value={params.glareIntensity ?? 1.0}
                          onChange={(e) =>
                            handleUpdateParam('glareIntensity', Number(e.target.value))
                          }
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. 微观粒子与全息物理滑块 */}
                  <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-2">
                      <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                      <label className="text-xs font-bold text-neutral-100">
                        光学微结构与干涉物理滑块
                      </label>
                    </div>

                    {/* 景深立体度 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-400">2.5D 景深立体度 (Depth)</span>
                        <span className="font-mono text-cyan-300">
                          {params.depth ?? 0.85}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-2"
                        max="2.5"
                        step="0.05"
                        value={params.depth ?? 0.85}
                        onChange={(e) => handleUpdateParam('depth', Number(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    {/* 全息虹彩总强度 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-400">全息虹彩总强度 (Foil Power)</span>
                        <span className="font-mono text-cyan-300">
                          {params.power ?? 1.05}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.05"
                        value={params.power ?? 1.05}
                        onChange={(e) => handleUpdateParam('power', Number(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    {/* 蒙版干涉强度 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-400">光学蒙版干涉强度 (Mask Intensity)</span>
                        <span className="font-mono text-cyan-300">
                          {params.maskIntensity ?? 1.15}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.05"
                        value={params.maskIntensity ?? 1.15}
                        onChange={(e) =>
                          handleUpdateParam('maskIntensity', Number(e.target.value))
                        }
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    {/* 十字星芒与微晶粒子 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-400">十字星芒与微晶粒子 (Sparkles)</span>
                        <span className="font-mono text-cyan-300">
                          {params.starIntensity ?? 1.0}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.05"
                        value={params.starIntensity ?? 1.0}
                        onChange={(e) =>
                          handleUpdateParam('starIntensity', Number(e.target.value))
                        }
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    {/* 双尺度 HDR 辉光 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-400">双尺度 HDR 辉光扩散 (Bloom)</span>
                        <span className="font-mono text-cyan-300">
                          {params.bloomIntensity ?? 0.8}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.05"
                        value={params.bloomIntensity ?? 0.8}
                        onChange={(e) =>
                          handleUpdateParam('bloomIntensity', Number(e.target.value))
                        }
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    {/* 结构线 40× 自发光 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-400">结构线 HDR 自发光 (Contour)</span>
                        <span className="font-mono text-cyan-300">
                          {params.contourBrightness ?? 0.85}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={params.contourBrightness ?? 0.85}
                        onChange={(e) =>
                          handleUpdateParam('contourBrightness', Number(e.target.value))
                        }
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: 等级体系信息 */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3.5 space-y-3">
                    <label className="text-xs font-bold text-neutral-300 block">
                      模组基本信息与等级
                    </label>

                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">模组编号</label>
                      <input
                        type="text"
                        value={selectedTemplate.templateCode || selectedTemplate.frameCode || ''}
                        onChange={(e) => handleUpdateField('templateCode', e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-neutral-200"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">模组展示名称</label>
                      <input
                        type="text"
                        value={selectedTemplate.name}
                        onChange={(e) => handleUpdateField('name', e.target.value)}
                        placeholder="例如：稀有·冰川珍珠蓝"
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-neutral-400 block mb-1">
                          所属等级分类 (Tier)
                        </label>
                        <select
                          value={selectedTemplate.rarityTier}
                          onChange={(e) => handleUpdateField('rarityTier', e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200"
                        >
                          <option value="common">普通 (Common)</option>
                          <option value="advanced">高级 (Advanced)</option>
                          <option value="rare">稀有 (Rare)</option>
                          <option value="epic">史诗 (Epic)</option>
                          <option value="legendary">典藏 (Legendary)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-neutral-400 block mb-1">
                          角标文字 (Badge)
                        </label>
                        <input
                          type="text"
                          value={selectedTemplate.rarityBadge || ''}
                          onChange={(e) => handleUpdateField('rarityBadge', e.target.value)}
                          placeholder="普通 / 稀有 / 典藏"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">模组设计说明</label>
                      <textarea
                        rows={3}
                        value={selectedTemplate.description || ''}
                        onChange={(e) => handleUpdateField('description', e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-xs text-neutral-200"
                      />
                    </div>
                  </div>

                  {/* 关联卡片统计与安全删除 */}
                  <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-3.5 space-y-2">
                    <div className="text-xs font-semibold text-neutral-300">
                      正在使用此模组的卡片 ({referencedCards.length})
                    </div>
                    {referencedCards.length > 0 ? (
                      <div className="text-[11px] text-neutral-400 max-h-28 overflow-y-auto space-y-1 custom-scrollbar">
                        {referencedCards.map((c) => (
                          <div key={c.id} className="flex items-center justify-between py-0.5">
                            <span className="font-mono text-cyan-400">{c.cardCode}</span>
                            <span className="truncate max-w-[200px]">{c.title}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-neutral-500">
                        当前暂无卡片绑定此模组，可安全删除。
                      </div>
                    )}

                    <div className="pt-2 border-t border-neutral-800">
                      <button
                        onClick={() => handleDelete(selectedTemplate)}
                        className="w-full py-2 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-800/60 text-red-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        删除此模组
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
