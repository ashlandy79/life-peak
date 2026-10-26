import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Save,
  Check,
  Eye,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  FileText,
  RefreshCw,
  Crosshair,
  Shield,
  Download,
  AlertCircle,
  Palette,
  Image as ImageIcon,
} from 'lucide-react';
import { TcgHoloCard } from '../TcgHoloCard';
import { CardAttributesPanel } from '../CardAttributesPanel';
import { ExportModal } from '../ExportModal';
import { StaticCompositeModal } from '../StaticCompositeModal';
import { api } from '../../services/api';
import { generateSampleCardBundleAsync } from '../../utils/sampleAssets';
import { renderLifeSealUiLayer } from '../../utils/lifeSealUiRenderer';
import { createEmptyTransparentDataUrl } from '../../utils/imageUtils';
import {
  DEFAULT_LIFE_SEAL_META,
  DEFAULT_TCG_PARAMETERS,
} from '../../core/parameters';
import type {
  CardRarityTier,
  LifeSealCardMeta,
  RimColorType,
  TcgCardAssets,
  TcgCardHandle,
  TcgHoloParameters,
} from '../../core/types';
import type {
  CardDefinition,
  CardTemplate,
  ContentCategory,
  ContentSeries,
  ProductionStatus,
  TagLibraryItem,
} from '../../core/lifepackTypes';

type StudioTab = 'attributes' | 'task' | 'layers';

interface CardStudioViewProps {
  cardId?: string | null;
  onBack: () => void;
  onSaved?: (savedCard: CardDefinition) => void;
}

export const CardStudioView: React.FC<CardStudioViewProps> = ({
  cardId,
  onBack,
  onSaved,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [immersive, setImmersive] = useState<boolean>(false);

  // 基础元数据与模板字典
  const [seriesList, setSeriesList] = useState<ContentSeries[]>([]);
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [templates, setTemplates] = useState<CardTemplate[]>([]);
  const [tagLibrary, setTagLibrary] = useState<TagLibraryItem[]>([]);

  // 当前卡片主档案定义
  const [cardDef, setCardDef] = useState<CardDefinition | null>(null);

  // 空透明占位图
  const [emptyOverlayUrl] = useState(() => createEmptyTransparentDataUrl(64, 64));

  // 1. 核心图层状态 (仅主体与背景，由卡片作者维护)
  const [layers, setLayers] = useState<{
    background: { file: File | null; dataUrl: string; size: [number, number] };
    subject: { file: File | null; dataUrl: string; size: [number, number]; hasAlpha?: boolean };
    back: { file: File | null; dataUrl: string; size: [number, number] };
    structure: { dataUrl: string };
  }>({
    background: { file: null, dataUrl: '', size: [1080, 1440] },
    subject: { file: null, dataUrl: '', size: [1080, 1440], hasAlpha: true },
    back: { file: null, dataUrl: '/back.png', size: [1080, 1440] },
    structure: { dataUrl: '' },
  });

  // 2. 卡片排版与文案属性
  const [lifeSealMeta, setLifeSealMeta] = useState<LifeSealCardMeta>(DEFAULT_LIFE_SEAL_META);
  const [composedUiUrl, setComposedUiUrl] = useState<string>('');

  // 3. WebGL 光学状态 (完全继承自选中的卡片模板)
  const [tcgParameters, setTcgParameters] = useState<TcgHoloParameters>(DEFAULT_TCG_PARAMETERS);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [tcgCardHandle, setTcgCardHandle] = useState<TcgCardHandle | null>(null);

  // 4. Tab 与弹窗状态
  const [activeTab, setActiveTab] = useState<StudioTab>('attributes');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isStaticCompositeOpen, setIsStaticCompositeOpen] = useState<boolean>(false);

  // 载入字典数据与卡片
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        const [metaData, tplList, tagsData] = await Promise.all([
          api.getMeta(),
          api.getTemplates(),
          api.getTags(),
        ]);

        if (cancelled) return;
        setSeriesList(metaData.series);
        setCategories(metaData.categories);
        setTemplates(tplList);
        setTagLibrary(tagsData);

        if (cardId) {
          // 编辑现有卡片
          const existing = await api.getCard(cardId);
          if (cancelled) return;
          setCardDef(existing);

          // 恢复其绑定的模板模组与光学参数
          const boundTpl = tplList.find((t) => t.id === existing.frameTemplateId) || tplList[0];
          if (boundTpl) {
            const initialParams: TcgHoloParameters = {
              ...(boundTpl.renderParameters || DEFAULT_TCG_PARAMETERS),
              rimColor: boundTpl.rimColor,
              structureLightMode: boundTpl.structureLightMode,
              opticalMask: boundTpl.opticalMask,
            };
            setTcgParameters(initialParams);
          }

          if (existing.visual?.renderConfig?.lifeSealMeta) {
            setLifeSealMeta(existing.visual.renderConfig.lifeSealMeta);
          }

          const sample = await generateSampleCardBundleAsync();
          if (cancelled) return;
          setLayers({
            background: { file: null, dataUrl: sample.backgroundUrl, size: sample.size },
            subject: { file: null, dataUrl: sample.subjectUrl, size: sample.size, hasAlpha: true },
            back: { file: null, dataUrl: sample.backUrl, size: sample.size },
            structure: { dataUrl: sample.structureUrl },
          });
          setComposedUiUrl(sample.uiUrl);
        } else {
          // 新建卡片：默认绑定第一个模组 (通常为稀有或普通)
          const defaultTpl = tplList[0];
          const sample = await generateSampleCardBundleAsync();
          if (cancelled) return;
          setLayers({
            background: { file: null, dataUrl: sample.backgroundUrl, size: sample.size },
            subject: { file: null, dataUrl: sample.subjectUrl, size: sample.size, hasAlpha: true },
            back: { file: null, dataUrl: sample.backUrl, size: sample.size },
            structure: { dataUrl: sample.structureUrl },
          });

          const initialParams: TcgHoloParameters = defaultTpl
            ? {
                ...(defaultTpl.renderParameters || DEFAULT_TCG_PARAMETERS),
                rimColor: defaultTpl.rimColor,
                structureLightMode: defaultTpl.structureLightMode,
                opticalMask: defaultTpl.opticalMask,
              }
            : DEFAULT_TCG_PARAMETERS;

          setTcgParameters(initialParams);
          setLifeSealMeta(DEFAULT_LIFE_SEAL_META);
          setComposedUiUrl(sample.uiUrl);

          const newCode = `LP-${String(Math.floor(Math.random() * 9000) + 1000)}`;
          const initialCard: CardDefinition = {
            schemaVersion: '1.0.0',
            id: `card-${Date.now()}`,
            cardCode: newCode,
            internalName: '新制作卡片',
            title: '未命名奇遇卡',
            subtitle: 'NEW ADVENTURE',
            description: '卡片制作台初始草稿',
            locale: 'zh-CN',
            seriesId: metaData.series[0]?.id || null,
            primaryCategoryId: metaData.categories[0]?.id || null,
            tags: ['新奇尝试', '探索'],
            characterIds: [metaData.characters[0]?.id || 'char-default'],
            frameTemplateId: defaultTpl?.id || null,
            status: 'DRAFT',
            version: 1,
            task: {
              title: '开启一段意料之外的生活探索。',
              description: '放下既定安排，向未知迈出一小步。',
              steps: ['走出舒适区', '记录一个特殊瞬间'],
              completionCriteria: '完成上述动作即算兑现。',
              estimatedMinutes: 20,
              difficulty: 'LIGHT',
              locationType: 'OUTDOOR',
              budgetLevel: 'FREE',
              socialIntensity: 'LIGHT',
              completionTitle: '奇遇封印已成功解除！',
              completionMessage: '愿这段记忆成为你生活中的独特闪光。',
              blessingTexts: ['探索未知，步履不停。'],
              recordRequired: false,
              allowCollectWithoutRecord: true,
              requiresPurchase: false,
              requiresStrangerInteraction: false,
            },
            visual: {
              canvasWidth: 1200,
              canvasHeight: 1600,
              aspectRatio: '3:4',
              sourceImageAssetId: null,
              backgroundAssetId: null,
              subjectAssetId: null,
              foregroundOccluderAssetId: null,
              foregroundAccentAssetId: null,
              frameAssetSnapshotId: defaultTpl?.id || null,
              stylePresetId: 'style-holo-collectible',
              compositePreviewAssetId: null,
              thumbnailAssetId: null,
              cardBackTemplateId: null,
              renderConfig: {
                tcgParameters: initialParams,
                lifeSealMeta: DEFAULT_LIFE_SEAL_META,
                rimColor: initialParams.rimColor,
              },
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setCardDef(initialCard);
        }
      } catch (err: any) {
        console.error('加载卡片失败:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadData();
    return () => {
      cancelled = true;
    };
  }, [cardId]);

  // 当属性或流光颜色变化时，动态重绘 UI 图层
  const cardSize: [number, number] =
    layers.background.size || layers.subject.size || [1080, 1440];

  useEffect(() => {
    let cancelled = false;
    const boundTpl = templates.find((t) => t.id === cardDef?.frameTemplateId);
    renderLifeSealUiLayer(
      lifeSealMeta,
      tcgParameters.rimColor,
      cardSize,
      undefined,
      {
        outerBorder: boundTpl?.outerBorder,
        innerBorder: boundTpl?.innerBorder,
      }
    ).then((url) => {
      if (!cancelled) {
        setComposedUiUrl(url);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [
    lifeSealMeta,
    tcgParameters.rimColor,
    cardDef?.frameTemplateId,
    templates,
    cardSize[0],
    cardSize[1],
  ]);

  // 快捷键 Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && immersive) {
        setImmersive(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [immersive]);

  // 核心优化 1：切换卡片模组 / 等级体系，联动全套光效与边框
  const handleSelectTemplate = (templateId: string) => {
    if (!cardDef) return;
    setCardDef({ ...cardDef, frameTemplateId: templateId });

    const found = templates.find((t) => t.id === templateId);
    if (found) {
      const nextParams: TcgHoloParameters = {
        ...(found.renderParameters || DEFAULT_TCG_PARAMETERS),
        rimColor: found.rimColor,
        structureLightMode: found.structureLightMode,
        opticalMask: found.opticalMask,
      };
      setTcgParameters(nextParams);
      tcgCardHandle?.setParameters(nextParams);

      setLifeSealMeta((prev) => ({
        ...prev,
        tier: (found.rarityTier as CardRarityTier) || 'common',
        rarityText: found.rarityBadge || found.name,
      }));
    }
  };

  const handleLifeSealMetaChange = (nextMeta: LifeSealCardMeta) => {
    setLifeSealMeta(nextMeta);
    if (nextMeta.sectorState === 'sealed' && !tcgParameters.isSealed) {
      const nextParams: Partial<TcgHoloParameters> = {
        isSealed: true,
        frostedBlur: 0.65,
      };
      setTcgParameters((prev) => ({ ...prev, ...nextParams }));
      tcgCardHandle?.setParameters(nextParams);
    } else if (nextMeta.sectorState === 'redeemed' && tcgParameters.isSealed) {
      const nextParams: Partial<TcgHoloParameters> = {
        isSealed: false,
        frostedBlur: 0.0,
        depth: tcgParameters.depth === 0 ? 0.85 : tcgParameters.depth,
      };
      setTcgParameters((prev) => ({ ...prev, ...nextParams }));
      tcgCardHandle?.setParameters(nextParams);
    }

    if (cardDef) {
      setCardDef((prev) =>
        prev
          ? {
              ...prev,
              title: nextMeta.taskHeader || prev.title,
              subtitle: nextMeta.taskMainText || prev.subtitle,
            }
          : null
      );
    }
  };

  // 保存卡片定义
  const handleSaveCard = async () => {
    if (!cardDef) return;

    try {
      setSaving(true);
      setSaveSuccess(false);

      let thumbnailDataUrl: string | undefined = undefined;
      try {
        if (tcgCardHandle) {
          const blob = await tcgCardHandle.exportPng();
          thumbnailDataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        }
      } catch (e) {
        console.warn('截取缩略图失败:', e);
      }

      const updatedPayload: CardDefinition = {
        ...cardDef,
        title: lifeSealMeta.taskHeader || cardDef.title,
        subtitle: lifeSealMeta.taskMainText || cardDef.subtitle,
        task: {
          ...cardDef.task,
          title: lifeSealMeta.taskMainText || cardDef.task.title,
          description: lifeSealMeta.taskSubText || cardDef.task.description,
        },
        visual: {
          ...cardDef.visual,
          renderConfig: {
            tcgParameters,
            lifeSealMeta,
            rimColor: tcgParameters.rimColor,
          },
          thumbnailAssetId: thumbnailDataUrl || cardDef.visual?.thumbnailAssetId || null,
        },
        updatedAt: new Date().toISOString(),
      };

      let result: CardDefinition;
      if (cardId) {
        result = await api.updateCard(cardId, updatedPayload);
      } else {
        result = await api.createCard(updatedPayload);
      }

      setCardDef(result);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      onSaved?.(result);
    } catch (err: any) {
      alert(`保存失败: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // 单独处理主体上传与背景上传
  const handleSubjectUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setLayers((prev) => ({
          ...prev,
          subject: { file, dataUrl, size: [img.width, img.height], hasAlpha: true },
        }));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setLayers((prev) => ({
          ...prev,
          background: { file, dataUrl, size: [img.width, img.height] },
        }));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const currentBoundTemplate = templates.find((t) => t.id === cardDef?.frameTemplateId);

  // 组装传给 3D 渲染器的图层
  const tcgAssets: TcgCardAssets = {
    background: layers.background.dataUrl,
    character: layers.subject.dataUrl,
    ui: composedUiUrl || emptyOverlayUrl,
    structure: layers.structure.dataUrl || emptyOverlayUrl,
    back: layers.back.dataUrl || '/back.png',
    width: cardSize[0],
    height: cardSize[1],
  };

  const isReady = Boolean(layers.background.dataUrl && layers.subject.dataUrl);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-40 text-neutral-400 text-xs gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
        正在装载卡片制作台...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-neutral-950 text-neutral-100 min-h-[calc(100vh-56px)]">
      {/* 顶部制作台控制栏 (Sub-header) */}
      <div className="h-13 bg-neutral-900/90 border-b border-neutral-800 px-4 flex items-center justify-between gap-3 sticky top-14 z-30 backdrop-blur-md">
        {/* 左侧：返回、卡片标识与等级模组下拉选择 */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
            title="返回卡片资产库"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">返回卡片库</span>
          </button>

          <div className="h-5 w-px bg-neutral-800" />

          {/* 编号与标题 */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
              {cardDef?.cardCode || 'LP-NEW'}
            </span>
            <input
              type="text"
              value={cardDef?.title || ''}
              onChange={(e) => {
                const val = e.target.value;
                setCardDef((prev) => (prev ? { ...prev, title: val } : null));
                setLifeSealMeta((prev) => ({ ...prev, taskHeader: val }));
              }}
              placeholder="卡片名称"
              className="bg-neutral-950/60 border border-neutral-700/80 rounded-md px-2.5 py-1 text-xs font-semibold text-neutral-100 focus:outline-none focus:border-cyan-500 max-w-[140px] sm:max-w-[200px]"
            />
          </div>

          {/* 核心需求 1：卡片等级模组下拉选择 (Select) */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] text-neutral-400 hidden md:inline">等级模组:</span>
            <select
              value={cardDef?.frameTemplateId || ''}
              onChange={(e) => handleSelectTemplate(e.target.value)}
              className="bg-neutral-950 border border-cyan-500/40 rounded-md px-2.5 py-1 text-xs font-semibold text-cyan-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="">未绑定模组</option>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name} [{tpl.rarityBadge || tpl.rarityTier}]
                </option>
              ))}
            </select>
          </div>

          {/* 状态选择 */}
          {cardDef && (
            <select
              value={cardDef.status}
              onChange={(e) =>
                setCardDef((prev) =>
                  prev ? { ...prev, status: e.target.value as ProductionStatus } : null
                )
              }
              className="hidden lg:inline-block bg-neutral-950 border border-neutral-700 rounded-md px-2 py-1 text-[11px] text-neutral-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="DRAFT">草稿阶段 (DRAFT)</option>
              <option value="READY_FOR_REVIEW">待审核 (REVIEW)</option>
              <option value="READY_FOR_EXPORT">待入包 (READY)</option>
              <option value="ARCHIVED">已归档 (ARCHIVED)</option>
            </select>
          )}
        </div>

        {/* 右侧：操作与保存工具 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStaticCompositeOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center gap-1.5 transition-colors"
            title="生成纯平 2D 原画静态合图"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">静态合图</span>
          </button>

          <button
            onClick={() => setIsExportOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center gap-1.5 transition-colors"
            title="导出切片与 WebGL 渲染包"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">导出包</span>
          </button>

          <button
            onClick={() => setImmersive(!immersive)}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors"
            title={immersive ? '退出沉浸模式' : '进入沉浸全屏模式'}
          >
            {immersive ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleSaveCard}
            disabled={saving}
            className={`px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
              saveSuccess
                ? 'bg-emerald-500 text-neutral-950 shadow-emerald-500/20'
                : 'bg-cyan-500 hover:bg-cyan-400 text-neutral-950 shadow-cyan-500/20'
            }`}
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>保存中...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>已保存</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>保存卡片</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 主工作区 */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* 左侧：3:4 WebGL 模组全息闪卡展示视口 */}
        <section className="flex-1 min-h-[540px] lg:min-h-0 flex flex-col items-center justify-center p-4 sm:p-8 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/75 via-neutral-950 to-neutral-950 overflow-hidden">
          {/* 氛围光 */}
          <div
            className="absolute w-[500px] h-[500px] blur-[140px] rounded-full pointer-events-none transition-colors duration-700 opacity-20"
            style={{
              backgroundColor: currentBoundTemplate?.borderCustomColor || '#67e8f9',
            }}
          />

          {isReady ? (
            <div className="w-full flex flex-col items-center justify-center z-10">
              <TcgHoloCard
                assets={tcgAssets}
                initialParameters={tcgParameters}
                onCardReady={(handle) => {
                  setTcgCardHandle(handle);
                  handle.setParameters(tcgParameters);
                }}
                onFlipChange={setIsFlipped}
              />

              {/* 视口底部操作条 */}
              {!immersive && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 z-20">
                  <button
                    onClick={() => setIsStaticCompositeOpen(true)}
                    className="px-3 py-1.5 rounded-full bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/50 text-[11px] font-semibold text-cyan-200 flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    查看静态合图 (2D)
                  </button>

                  <button
                    onClick={() => {
                      const willUnseal = tcgParameters.isSealed;
                      if (willUnseal) {
                        const nextParams: Partial<TcgHoloParameters> = {
                          isSealed: false,
                          frostedBlur: 0.0,
                          depth: tcgParameters.depth === 0 ? 0.85 : tcgParameters.depth,
                        };
                        setTcgParameters((prev) => ({ ...prev, ...nextParams }));
                        tcgCardHandle?.setParameters(nextParams);
                        setLifeSealMeta((prev) => ({
                          ...prev,
                          sectorState: 'redeemed',
                          sectorCustomText: '已兑现',
                          showSealCrest: false,
                        }));
                      } else {
                        const nextParams: Partial<TcgHoloParameters> = {
                          isSealed: true,
                          frostedBlur: 0.65,
                        };
                        setTcgParameters((prev) => ({ ...prev, ...nextParams }));
                        tcgCardHandle?.setParameters(nextParams);
                        setLifeSealMeta((prev) => ({
                          ...prev,
                          sectorState: 'sealed',
                          sectorCustomText: '已封印',
                          showSealCrest: true,
                        }));
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 border transition-all ${
                      tcgParameters.isSealed
                        ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-200 shadow-md'
                        : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200 shadow-md'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    {tcgParameters.isSealed ? '已封印 (点击解封)' : '已兑现 (点击重新封印)'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => tcgCardHandle?.flipCard()}
                      className="px-3 py-1.5 rounded-full bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-[11px] font-medium text-purple-200 flex items-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      {isFlipped ? '翻回正面' : '翻看卡背'}
                    </button>
                    <button
                      onClick={() => tcgCardHandle?.recenter()}
                      title="重置居中视角"
                      className="p-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 transition-colors"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border border-neutral-800 bg-neutral-900/50 text-center max-w-sm z-10">
              <AlertCircle className="w-8 h-8 text-cyan-400" />
              <div className="text-sm font-semibold">正在载入卡片图层</div>
            </div>
          )}
        </section>

        {/* 右侧工作台面板：精简聚焦于内容、文字、任务与主体/背景图层 */}
        {!immersive && (
          <aside className="w-full lg:w-[480px] xl:w-[520px] border-t lg:border-t-0 lg:border-l border-neutral-800 bg-neutral-950 flex flex-col z-20 max-h-[calc(100vh-108px)]">
            {/* 三栏 Tab 导航：属性与标签 / 任务内容 / 主体背景切片 */}
            <div className="grid grid-cols-3 border-b border-neutral-800 bg-neutral-900/70 p-1.5 gap-1">
              <button
                onClick={() => setActiveTab('attributes')}
                className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'attributes'
                    ? 'bg-neutral-800 text-cyan-300 shadow-sm border border-cyan-500/40'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>卡片属性与标签</span>
              </button>
              <button
                onClick={() => setActiveTab('task')}
                className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'task'
                    ? 'bg-neutral-800 text-emerald-300 shadow-sm border border-emerald-500/40'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>任务内容规则</span>
              </button>
              <button
                onClick={() => setActiveTab('layers')}
                className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'layers'
                    ? 'bg-neutral-800 text-purple-300 shadow-sm border border-purple-500/40'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>主体与背景图层</span>
              </button>
            </div>

            {/* 面板内容 */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
              {/* TAB 1: 属性与标签 (含标签库下拉 + 1~5星评价) */}
              {activeTab === 'attributes' && (
                <div className="space-y-5">
                  {/* 系列与分类归属 */}
                  {cardDef && (
                    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3.5 space-y-3">
                      <div className="text-xs font-bold text-neutral-200">所属内容系列与主分类</div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10px] text-neutral-400 block mb-1">内容系列 (Series)</label>
                          <select
                            value={cardDef.seriesId || ''}
                            onChange={(e) =>
                              setCardDef({ ...cardDef, seriesId: e.target.value || null })
                            }
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200"
                          >
                            {seriesList.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-neutral-400 block mb-1">主分类 (Category)</label>
                          <select
                            value={cardDef.primaryCategoryId || ''}
                            onChange={(e) =>
                              setCardDef({ ...cardDef, primaryCategoryId: e.target.value || null })
                            }
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <CardAttributesPanel
                    meta={lifeSealMeta}
                    onChange={handleLifeSealMetaChange}
                    tagLibrary={tagLibrary}
                  />
                </div>
              )}

              {/* TAB 2: 任务内容 */}
              {activeTab === 'task' && cardDef && (
                <div className="space-y-5">
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
                    任务内容定义了卡片在生活中的行动指令与解封达成条件。
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-neutral-300 font-semibold block mb-1">
                        行动标题 (Task Title)
                      </label>
                      <input
                        type="text"
                        value={cardDef.task.title}
                        onChange={(e) =>
                          setCardDef({
                            ...cardDef,
                            task: { ...cardDef.task, title: e.target.value },
                          })
                        }
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-neutral-300 font-semibold block mb-1">
                        详细规则与行动指南 (Description)
                      </label>
                      <textarea
                        rows={3}
                        value={cardDef.task.description}
                        onChange={(e) =>
                          setCardDef({
                            ...cardDef,
                            task: { ...cardDef.task, description: e.target.value },
                          })
                        }
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-neutral-300 font-semibold block mb-1">
                          预计耗时 (分钟)
                        </label>
                        <input
                          type="number"
                          value={cardDef.task.estimatedMinutes}
                          onChange={(e) =>
                            setCardDef({
                              ...cardDef,
                              task: {
                                ...cardDef.task,
                                estimatedMinutes: Number(e.target.value) || 15,
                              },
                            })
                          }
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-neutral-300 font-semibold block mb-1">
                          达成判定标准
                        </label>
                        <input
                          type="text"
                          value={cardDef.task.completionCriteria}
                          onChange={(e) =>
                            setCardDef({
                              ...cardDef,
                              task: { ...cardDef.task, completionCriteria: e.target.value },
                            })
                          }
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="border-t border-neutral-800 pt-3 space-y-3">
                      <div className="text-xs font-bold text-neutral-200">解封达成奖励与祝词</div>
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">达成祝词标题</label>
                        <input
                          type="text"
                          value={cardDef.task.completionTitle}
                          onChange={(e) =>
                            setCardDef({
                              ...cardDef,
                              task: { ...cardDef.task, completionTitle: e.target.value },
                            })
                          }
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-100"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">达成祝词内容</label>
                        <textarea
                          rows={2}
                          value={cardDef.task.completionMessage}
                          onChange={(e) =>
                            setCardDef({
                              ...cardDef,
                              task: { ...cardDef.task, completionMessage: e.target.value },
                            })
                          }
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: 仅主体与背景切片 (核心图层) */}
              {activeTab === 'layers' && (
                <div className="space-y-5">
                  {/* 当前继承的模板模组提示 */}
                  {currentBoundTemplate && (
                    <div className="p-3 rounded-xl bg-neutral-900/80 border border-cyan-500/30 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-neutral-400">当前绑定视觉模组: </span>
                        <span className="font-bold text-cyan-300">
                          {currentBoundTemplate.name}
                        </span>
                      </div>
                      <span
                        className="text-[9px] px-2 py-0.5 rounded font-bold text-neutral-950"
                        style={{ backgroundColor: currentBoundTemplate.borderCustomColor }}
                      >
                        {currentBoundTemplate.rarityBadge || currentBoundTemplate.rarityTier}
                      </span>
                    </div>
                  )}

                  {/* 1. 透明主体图片 (Subject) */}
                  <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-neutral-200 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-cyan-400" />
                        核心透明主体图片 (subject.png)
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                        必需 · Alpha
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {layers.subject.dataUrl && (
                        <div
                          className="w-20 h-28 rounded-lg overflow-hidden border border-neutral-700 flex items-center justify-center p-1 bg-neutral-950"
                          style={{
                            backgroundImage:
                              'linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)',
                            backgroundSize: '12px 12px',
                            backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
                          }}
                        >
                          <img
                            src={layers.subject.dataUrl}
                            alt="主体预览"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      )}

                      <div className="flex-1 space-y-2">
                        <label className="inline-block px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs cursor-pointer shadow-sm transition-all">
                          替换主体切片
                          <input
                            type="file"
                            accept="image/png,image/webp"
                            onChange={handleSubjectUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[10px] text-neutral-400 leading-relaxed">
                          主体图层承载 2.5D 深度视差悬浮。要求保留完整透明通道 (Alpha Channel)。
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2. 背景图片 (Background) */}
                  <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-neutral-200 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-emerald-400" />
                        背景底图切片 (background.png)
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400">必需</span>
                    </div>

                    <div className="flex items-center gap-4">
                      {layers.background.dataUrl && (
                        <div className="w-20 h-28 rounded-lg overflow-hidden border border-neutral-700 bg-neutral-950 flex items-center justify-center">
                          <img
                            src={layers.background.dataUrl}
                            alt="背景预览"
                            className="max-h-full max-w-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 space-y-2">
                        <label className="inline-block px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs border border-neutral-700 cursor-pointer transition-all">
                          替换背景底图
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleBackgroundUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[10px] text-neutral-400 leading-relaxed">
                          底板承载全息着色器与动态高光漫反射。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* 静态合图与导出弹窗 */}
      <StaticCompositeModal
        isOpen={isStaticCompositeOpen}
        onClose={() => setIsStaticCompositeOpen(false)}
        bgUrl={layers.background.dataUrl}
        subjectUrl={layers.subject.dataUrl}
        uiUrl={composedUiUrl}
        structureUrl={layers.structure.dataUrl}
        meta={lifeSealMeta}
        size={cardSize}
        frostedBlur={tcgParameters.frostedBlur}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        tcgCardHandle={tcgCardHandle}
        tcgAssets={tcgAssets}
        tcgParameters={tcgParameters}
        lifeSealMeta={lifeSealMeta}
      />
    </div>
  );
};
