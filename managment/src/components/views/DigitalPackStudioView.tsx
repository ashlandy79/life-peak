import React, { useState } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Download,
  Layers,
  Sparkles,
  ExternalLink,
  Check,
  Image as ImageIcon,
  CheckSquare,
  Square,
  Sliders,
  Sun,
  Flame,
  Shield,
  RotateCcw,
  Copy,
  Maximize2,
} from 'lucide-react';
import type {
  CardDefinition,
  ContentSeries,
  DigitalPackDefinition,
} from '../../core/lifepackTypes';
import {
  type ThreePackConfig,
  DEFAULT_THREE_PACK_CONFIG,
  PACK_CONFIG_PRESETS,
} from '../../core/threePackRenderer';
import { api } from '../../services/api';
import JSZip from 'jszip';
import { DigitalPackOpeningStage } from '../DigitalPackOpeningStage';

interface DigitalPackStudioViewProps {
  packs: DigitalPackDefinition[];
  cards: CardDefinition[];
  seriesList: ContentSeries[];
  onRefresh: () => void;
  onOpenCardStudio: (cardId: string) => void;
}

export const DigitalPackStudioView: React.FC<DigitalPackStudioViewProps> = ({
  packs,
  cards,
  seriesList,
  onRefresh,
  onOpenCardStudio,
}) => {
  const [selectedPack, setSelectedPack] = useState<DigitalPackDefinition | null>(
    packs[0] || null
  );
  const [viewMode, setViewMode] = useState<'interactive-tear' | 'layers'>('interactive-tear');
  const [rightTab, setRightTab] = useState<'console' | 'layers' | 'cards'>('console');
  const [packConfig, setPackConfig] = useState<ThreePackConfig>(DEFAULT_THREE_PACK_CONFIG);
  const safeConfig: ThreePackConfig = {
    ...DEFAULT_THREE_PACK_CONFIG,
    ...packConfig,
  };
  const [activePreset, setActivePreset] = useState<string>('naturalShimmer');
  const [copiedConfig, setCopiedConfig] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadingKind, setUploadingKind] = useState<string | null>(null);

  // 新建卡包表单
  const [newCode, setNewCode] = useState(`LPP-${Date.now().toString().slice(-4)}`);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newSeries, setNewSeries] = useState(seriesList[0]?.id || '');
  const [newWidth, setNewWidth] = useState(1200);
  const [newHeight, setNewHeight] = useState(1600);

  const handleSelectPreset = (key: string) => {
    const preset = PACK_CONFIG_PRESETS[key];
    if (preset) {
      setActivePreset(key);
      setPackConfig({ ...preset.config });
    }
  };

  const handleUpdateConfigParam = (key: keyof ThreePackConfig, value: number | boolean) => {
    setActivePreset('custom');
    setPackConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCreatePack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const created = await api.createPack({
        schemaVersion: '1.0.0',
        id: `pack-${Date.now()}`,
        packCode: newCode,
        internalName: newTitle,
        title: newTitle,
        subtitle: newSubtitle,
        description: '以生活、观察与微小冒险为主题的数字卡包视觉资产',
        locale: 'zh-CN',
        packType: 'DIGITAL_PACK',
        seriesId: newSeries || null,
        tags: ['自然', '奇遇'],
        stylePresetId: null,
        canvasWidth: newWidth,
        canvasHeight: newHeight,
        aspectRatio: `${newWidth}:${newHeight}`,
        linkedCardIds: [],
        packBaseAssetId: null,
        packFrontArtworkAssetId: null,
        packLogoAssetId: null,
        packSealAssetId: null,
        packAccentAssetIds: [],
        packBackArtworkAssetId: null,
        packOpenedAssetId: null,
        frontCompositeAssetId: null,
        backCompositeAssetId: null,
        openedPreviewAssetId: null,
        thumbnailAssetId: null,
        status: 'DRAFT',
        version: 1,
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setIsCreating(false);
      setNewTitle('');
      setNewSubtitle('');
      onRefresh();
      setSelectedPack(created);
    } catch (err: any) {
      alert(err.message || '创建卡包失败');
    }
  };

  const handleUploadPackLayer = async (
    kind: 'packBase' | 'packFrontArtwork' | 'packLogo' | 'packSeal' | 'packBack',
    file: File
  ) => {
    if (!selectedPack) return;
    setUploadingKind(kind);
    try {
      const asset = await api.uploadAssetFile(file, 'PACK_LAYER', `${selectedPack.title}-${kind}`);
      const patchMap: Record<string, any> = {
        packBase: { packBaseAssetId: asset.url },
        packFrontArtwork: { packFrontArtworkAssetId: asset.url },
        packLogo: { packLogoAssetId: asset.url },
        packSeal: { packSealAssetId: asset.url },
        packBack: { packBackArtworkAssetId: asset.url },
      };
      await api.updatePack(selectedPack.id, patchMap[kind]);
      onRefresh();
      setSelectedPack({ ...selectedPack, ...patchMap[kind] });
    } catch (err: any) {
      alert(err.message || '上传卡包图层失败');
    } finally {
      setUploadingKind(null);
    }
  };

  const handleToggleLinkedCard = async (cardId: string) => {
    if (!selectedPack) return;
    const exists = selectedPack.linkedCardIds.includes(cardId);
    const nextIds = exists
      ? selectedPack.linkedCardIds.filter((id) => id !== cardId)
      : [...selectedPack.linkedCardIds, cardId];

    await api.updatePack(selectedPack.id, { linkedCardIds: nextIds });
    onRefresh();
    setSelectedPack({ ...selectedPack, linkedCardIds: nextIds });
  };

  const handleExportPackZip = async () => {
    if (!selectedPack) return;
    try {
      const zip = new JSZip();
      zip.file(
        'pack.json',
        JSON.stringify(
          {
            ...selectedPack,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        )
      );

      zip.file(
        'manifest.json',
        JSON.stringify(
          {
            packCode: selectedPack.packCode,
            title: selectedPack.title,
            version: selectedPack.version,
            linkedCardsCount: selectedPack.linkedCardIds.length,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        )
      );

      // 包含说明
      zip.file(
        'README.txt',
        `LIFE PACK 数字卡包资产包 - ${selectedPack.title}\n编号: ${selectedPack.packCode}\n关联卡片数量: ${selectedPack.linkedCardIds.length}\n导出时间: ${new Date().toLocaleString()}`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = `${selectedPack.packCode}-pack-package.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      alert('导出卡包 ZIP 失败: ' + err.message);
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 sm:p-8 gap-6">
      {/* 左侧：卡包列表 */}
      <div className="w-full md:w-80 flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex-shrink-0">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm text-neutral-100">
            <Package className="w-4 h-4 text-blue-400" />
            数字卡包库 ({packs.length})
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-blue-300 transition-colors"
            title="新建数字卡包"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {packs.map((pack) => {
            const active = selectedPack?.id === pack.id;
            return (
              <div
                key={pack.id}
                onClick={() => setSelectedPack(pack)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  active
                    ? 'border-blue-500/60 bg-blue-500/15 text-blue-100 shadow-sm'
                    : 'border-neutral-800/80 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-blue-300 font-bold">
                    {pack.packCode}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-neutral-400 font-mono">
                    关联 {pack.linkedCardIds.length} 张
                  </span>
                </div>
                <div className="text-xs font-bold text-neutral-100 mt-1 truncate">
                  {pack.title}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5 truncate">
                  {pack.subtitle || '数字包装视觉'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 右侧：卡包制作视口与图层组装 */}
      <div className="flex-1 flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        {selectedPack ? (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* 卡包分层视觉合成与撕包视口 */}
            <div className="flex-1 p-6 flex flex-col items-center justify-center bg-neutral-950/80 relative overflow-hidden">
              {/* 视口顶部模式切换 */}
              <div className="w-full max-w-md flex items-center justify-between mb-3 px-1 z-20">
                <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setViewMode('interactive-tear')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === 'interactive-tear'
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    3D 撕包交互体验
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('layers')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === 'layers'
                        ? 'bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    包装分层画板
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleExportPackZip}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 border border-neutral-700 transition-colors cursor-pointer"
                  title="导出卡包资产包"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  导出 ZIP
                </button>
              </div>

              {/* 模式 A: 3D 撕包真实交互 */}
              {viewMode === 'interactive-tear' ? (
                <div className="w-full flex-1 flex items-center justify-center">
                  <DigitalPackOpeningStage
                    pack={selectedPack}
                    config={safeConfig}
                    linkedCards={
                      cards.filter((c) => selectedPack.linkedCardIds.includes(c.id)).length > 0
                        ? cards.filter((c) => selectedPack.linkedCardIds.includes(c.id))
                        : cards
                    }
                    onOpenCard={(c) => onOpenCardStudio(c.id)}
                  />
                </div>
              ) : (
                /* 模式 B: 原有包装画板叠加层 */
                <div className="flex flex-col items-center justify-center">
                  <div className="w-full max-w-[320px] aspect-[3/4] rounded-2xl border-2 border-neutral-700 relative overflow-hidden shadow-2xl flex items-center justify-center bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900">
                    {/* 1. 包装底板 */}
                    {selectedPack.packBaseAssetId && (
                      <img
                        src={selectedPack.packBaseAssetId}
                        alt="底板"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}

                    {/* 2. 正面插画 */}
                    {selectedPack.packFrontArtworkAssetId && (
                      <img
                        src={selectedPack.packFrontArtworkAssetId}
                        alt="插画"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                      />
                    )}

                    {/* 3. 品牌/系列 Logo */}
                    {selectedPack.packLogoAssetId && (
                      <img
                        src={selectedPack.packLogoAssetId}
                        alt="Logo"
                        className="absolute top-6 left-1/2 -translate-x-1/2 max-w-[65%] object-contain pointer-events-none z-10"
                      />
                    )}

                    {/* 4. 封口签贴纸 */}
                    {selectedPack.packSealAssetId && (
                      <img
                        src={selectedPack.packSealAssetId}
                        alt="封口签"
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 max-w-[50%] object-contain pointer-events-none z-10"
                      />
                    )}

                    {/* 占位信息 */}
                    {!selectedPack.packBaseAssetId && !selectedPack.packFrontArtworkAssetId && (
                      <div className="text-center p-6 text-neutral-500 space-y-2">
                        <Package className="w-10 h-10 mx-auto opacity-30 text-blue-400" />
                        <div className="text-xs font-bold text-neutral-300">
                          {selectedPack.title}
                        </div>
                        <div className="text-[10px] text-neutral-500">
                          请在右侧面板上传卡包包装底板或插画
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 右侧：操作台、包装属性与关联卡片编排 */}
            <div className="w-full lg:w-[430px] p-5 border-t lg:border-t-0 lg:border-l border-neutral-800 flex flex-col h-full bg-neutral-900/90 overflow-hidden">
              {/* 顶部标题与选项卡导航 */}
              <div className="pb-3 border-b border-neutral-800 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="truncate pr-2">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                      {selectedPack.packCode}
                    </span>
                    <h3 className="text-sm font-black text-neutral-100 mt-1 truncate">
                      {selectedPack.title}
                    </h3>
                  </div>

                  {/* 选项卡切换 */}
                  <div className="flex items-center p-1 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] font-semibold flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setRightTab('console')}
                      className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                        rightTab === 'console'
                          ? 'bg-cyan-600 text-neutral-950 font-bold shadow-sm shadow-cyan-500/20'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                      title="3D撕包参数操作台"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      操作台
                    </button>
                    <button
                      type="button"
                      onClick={() => setRightTab('layers')}
                      className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                        rightTab === 'layers'
                          ? 'bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                      title="包装分层资产"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      分层
                    </button>
                    <button
                      type="button"
                      onClick={() => setRightTab('cards')}
                      className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                        rightTab === 'cards'
                          ? 'bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                      title="关联卡片"
                    >
                      <Package className="w-3.5 h-3.5" />
                      卡片({selectedPack.linkedCardIds.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* Tab 1: 3D 物理与光影调控操作台 */}
              {rightTab === 'console' && (
                <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-4 custom-scrollbar text-xs">
                  {/* 1. 材质风格预设快速套用 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        材质风格预设
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {activePreset === 'custom' ? '自定义调节中' : '已载入'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(PACK_CONFIG_PRESETS).map(([key, p]) => {
                        const isSelected = activePreset === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleSelectPreset(key)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-cyan-500 bg-cyan-950/40 text-neutral-100 shadow-sm shadow-cyan-500/10'
                                : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                            }`}
                          >
                            <div className="font-bold text-xs flex items-center justify-between">
                              <span>{p.label}</span>
                              {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
                            </div>
                            <div className="text-[10px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                              {p.desc}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. 微光与高光控制 (Optics) */}
                  <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                      <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                        微光与高光控制 (Optics)
                      </span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40 font-mono">
                        正常微光水平
                      </span>
                    </div>

                    {/* 全息虹彩强度 holoPower */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-neutral-300 font-medium">全息虹彩微光 (uHoloPower)</span>
                        <span className="font-mono text-cyan-400 font-bold bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                          {safeConfig.holoPower.toFixed(2)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={safeConfig.holoPower}
                        onChange={(e) => handleUpdateConfigParam('holoPower', parseFloat(e.target.value))}
                        className="w-full accent-cyan-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                      />
                      <div className="text-[10px] text-neutral-500 mt-0.5">
                        微光推荐 0.20 ~ 0.35；过高易洗白插画，过低无反光。
                      </div>
                    </div>

                    {/* 高光聚光锐度 specularPower */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-neutral-300 font-medium">高光聚光锐度 (Specular Power)</span>
                        <span className="font-mono text-amber-400 font-bold bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                          {safeConfig.specularPower}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        step="2"
                        value={safeConfig.specularPower}
                        onChange={(e) => handleUpdateConfigParam('specularPower', parseInt(e.target.value))}
                        className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                      />
                      <div className="text-[10px] text-neutral-500 mt-0.5">
                        指数越高光斑越收敛细腻（48 聚光微斑，24 泛光大片）。
                      </div>
                    </div>

                    {/* 高光反光亮度 specularIntensity */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-neutral-300 font-medium">高光反光亮度 (Specular Intensity)</span>
                        <span className="font-mono text-amber-300 font-bold bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                          {safeConfig.specularIntensity.toFixed(2)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="0.8"
                        step="0.02"
                        value={safeConfig.specularIntensity}
                        onChange={(e) => handleUpdateConfigParam('specularIntensity', parseFloat(e.target.value))}
                        className="w-full accent-amber-300 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                      />
                      <div className="text-[10px] text-neutral-500 mt-0.5">
                        控制白色受光斑强度，降至 0.20 杜绝画面泛白刺眼。
                      </div>
                    </div>

                    {/* 环境光与主光强度 */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-neutral-400">环境漫射光</span>
                          <span className="font-mono text-neutral-200">{safeConfig.ambientLight.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min="0.3"
                          max="1.8"
                          step="0.05"
                          value={safeConfig.ambientLight}
                          onChange={(e) => handleUpdateConfigParam('ambientLight', parseFloat(e.target.value))}
                          className="w-full accent-blue-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-neutral-400">定向主光照</span>
                          <span className="font-mono text-neutral-200">{safeConfig.directionalLight.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min="0.3"
                          max="2.0"
                          step="0.05"
                          value={safeConfig.directionalLight}
                          onChange={(e) => handleUpdateConfigParam('directionalLight', parseFloat(e.target.value))}
                          className="w-full accent-blue-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* 曝光与边缘轮廓光 */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-neutral-400">曝光补偿</span>
                          <span className="font-mono text-neutral-200">{safeConfig.exposure.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min="0.6"
                          max="1.6"
                          step="0.05"
                          value={safeConfig.exposure}
                          onChange={(e) => handleUpdateConfigParam('exposure', parseFloat(e.target.value))}
                          className="w-full accent-blue-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-neutral-400">边缘轮廓彩色光</span>
                          <span className="font-mono text-neutral-200">{safeConfig.pointLightStrength.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1.8"
                          step="0.05"
                          value={safeConfig.pointLightStrength}
                          onChange={(e) => handleUpdateConfigParam('pointLightStrength', parseFloat(e.target.value))}
                          className="w-full accent-blue-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. 物理力学与形变控制 */}
                  <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                      <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-rose-400" />
                        物理形变与力学 (Deformation)
                      </span>
                      <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40 font-mono">
                        受力方程实时联动
                      </span>
                    </div>

                    {/* 收腰幅度 waistPinch */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-neutral-300 font-medium">气压释放收腰 (Waist Pinch)</span>
                        <span className="font-mono text-rose-400 font-bold bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                          {safeConfig.waistPinch.toFixed(3)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="0.12"
                        step="0.002"
                        value={safeConfig.waistPinch}
                        onChange={(e) => handleUpdateConfigParam('waistPinch', parseFloat(e.target.value))}
                        className="w-full accent-rose-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                      />
                      <div className="text-[10px] text-neutral-500 mt-0.5">
                        撕开时袋身气压凹折。已由原 0.12 降至 0.038 解决夸张沙漏变形。
                      </div>
                    </div>

                    {/* 袋口顶唇翻卷 lipCurl */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-neutral-300 font-medium">袋口前膜翻折 (Lip Curl)</span>
                        <span className="font-mono text-cyan-300 font-bold bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                          {safeConfig.lipCurl.toFixed(2)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="0.30"
                        step="0.01"
                        value={safeConfig.lipCurl}
                        onChange={(e) => handleUpdateConfigParam('lipCurl', parseFloat(e.target.value))}
                        className="w-full accent-cyan-300 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                      />
                      <div className="text-[10px] text-neutral-500 mt-0.5">
                        开封后袋口向前张开露出内部卡片的立体开口角度。
                      </div>
                    </div>

                    {/* 撕条拱起与抬升 */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-neutral-400">拱起峰值 (bendZ)</span>
                          <span className="font-mono text-neutral-200">{safeConfig.bendZ.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.5"
                          step="0.05"
                          value={safeConfig.bendZ}
                          onChange={(e) => handleUpdateConfigParam('bendZ', parseFloat(e.target.value))}
                          className="w-full accent-emerald-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-neutral-400">上翘抬升 (liftY)</span>
                          <span className="font-mono text-neutral-200">{safeConfig.liftY.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min="0.3"
                          max="1.8"
                          step="0.05"
                          value={safeConfig.liftY}
                          onChange={(e) => handleUpdateConfigParam('liftY', parseFloat(e.target.value))}
                          className="w-full accent-emerald-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* 金属火花开关 */}
                    <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80">
                      <div>
                        <div className="text-neutral-300 text-[11px] font-medium">撕裂金属火花光点</div>
                        <div className="text-[10px] text-neutral-500">在撕裂处跟随光标产生微型物理光斑</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUpdateConfigParam('sparkEnabled', !safeConfig.sparkEnabled)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          safeConfig.sparkEnabled
                            ? 'bg-amber-500 text-neutral-950 shadow-sm'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {safeConfig.sparkEnabled ? '已开启' : '已关闭'}
                      </button>
                    </div>
                  </div>

                  {/* 4. 图层定位与视差微调 (Layer Positioning & Tilt) */}
                  <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                      <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                        <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                        图层定位与视差控制 (Positioning & Tilt)
                      </span>
                      <span className="text-[10px] text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/40 font-mono">
                        防漏光接缝微调
                      </span>
                    </div>

                    {/* 3D 偏转灵敏度 tiltSensitivity */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-neutral-300 font-medium">3D 悬浮偏转幅度 (Tilt Sensitivity)</span>
                        <span className="font-mono text-blue-400 font-bold bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                          {safeConfig.tiltSensitivity.toFixed(3)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="0.12"
                        step="0.005"
                        value={safeConfig.tiltSensitivity}
                        onChange={(e) => handleUpdateConfigParam('tiltSensitivity', parseFloat(e.target.value))}
                        className="w-full accent-blue-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                      />
                      <div className="text-[10px] text-neutral-500 mt-0.5">
                        已调降至 0.045（仅产生微量高级动感，彻底避免仰视露出背面缝隙）。
                      </div>
                    </div>

                    {/* 撕条咬合重叠量 stripOverlap */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-neutral-300 font-medium">撕条接缝重叠度 (Strip Overlap)</span>
                        <span className="font-mono text-cyan-400 font-bold bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                          {safeConfig.stripOverlap.toFixed(3)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="0.04"
                        step="0.002"
                        value={safeConfig.stripOverlap}
                        onChange={(e) => handleUpdateConfigParam('stripOverlap', parseFloat(e.target.value))}
                        className="w-full accent-cyan-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                      />
                      <div className="text-[10px] text-neutral-500 mt-0.5">
                        撕条向下延展覆盖袋口切线边缘，消除图层垂直缝隙黑线。
                      </div>
                    </div>

                    {/* 撕条垂直与水平偏移 */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-neutral-400">撕条垂直偏移 (Y)</span>
                          <span className="font-mono text-neutral-200">{safeConfig.stripOffsetY.toFixed(3)}</span>
                        </div>
                        <input
                          type="range"
                          min="-0.08"
                          max="0.08"
                          step="0.002"
                          value={safeConfig.stripOffsetY}
                          onChange={(e) => handleUpdateConfigParam('stripOffsetY', parseFloat(e.target.value))}
                          className="w-full accent-indigo-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-neutral-400">撕条水平偏移 (X)</span>
                          <span className="font-mono text-neutral-200">{safeConfig.stripOffsetX.toFixed(3)}</span>
                        </div>
                        <input
                          type="range"
                          min="-0.08"
                          max="0.08"
                          step="0.002"
                          value={safeConfig.stripOffsetX}
                          onChange={(e) => handleUpdateConfigParam('stripOffsetX', parseFloat(e.target.value))}
                          className="w-full accent-indigo-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* 袋身垂直偏移与图层前后间距 */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-neutral-400">袋身垂直偏移 (Y)</span>
                          <span className="font-mono text-neutral-200">{safeConfig.bodyOffsetY.toFixed(3)}</span>
                        </div>
                        <input
                          type="range"
                          min="-0.08"
                          max="0.08"
                          step="0.002"
                          value={safeConfig.bodyOffsetY}
                          onChange={(e) => handleUpdateConfigParam('bodyOffsetY', parseFloat(e.target.value))}
                          className="w-full accent-indigo-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-neutral-400">图层前后 Z 间隙</span>
                          <span className="font-mono text-neutral-200">{safeConfig.layerGapZ.toFixed(3)}</span>
                        </div>
                        <input
                          type="range"
                          min="0.000"
                          max="0.015"
                          step="0.001"
                          value={safeConfig.layerGapZ}
                          onChange={(e) => handleUpdateConfigParam('layerGapZ', parseFloat(e.target.value))}
                          className="w-full accent-indigo-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 底部重置与参数导出 */}
                  <div className="flex items-center gap-2 pt-1 pb-2">
                    <button
                      type="button"
                      onClick={() => handleSelectPreset('naturalShimmer')}
                      className="flex-1 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-neutral-700"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
                      恢复微光推荐值
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(safeConfig, null, 2));
                        setCopiedConfig(true);
                        setTimeout(() => setCopiedConfig(false), 2000);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-neutral-700"
                      title="复制当前所有参数为 JSON"
                    >
                      {copiedConfig ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">已复制</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-cyan-400" />
                          <span>导出配置</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: 包装分层资产配置 */}
              {rightTab === 'layers' && (
                <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-4 custom-scrollbar text-xs">
                  <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-3">
                    <div className="text-xs font-semibold text-neutral-200">包装分层资产上传</div>

                    {/* 底板 */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400">1. 包装底板 (Base):</span>
                      <label className="text-blue-400 hover:underline cursor-pointer text-xs font-medium">
                        {uploadingKind === 'packBase'
                          ? '上传中...'
                          : selectedPack.packBaseAssetId
                          ? '已设置 (替换)'
                          : '上传'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleUploadPackLayer('packBase', e.target.files[0]);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* 正面插画 */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400">2. 正面插画 (Artwork):</span>
                      <label className="text-blue-400 hover:underline cursor-pointer text-xs font-medium">
                        {uploadingKind === 'packFrontArtwork'
                          ? '上传中...'
                          : selectedPack.packFrontArtworkAssetId
                          ? '已设置 (替换)'
                          : '上传'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleUploadPackLayer('packFrontArtwork', e.target.files[0]);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Logo */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400">3. 系列 Logo:</span>
                      <label className="text-blue-400 hover:underline cursor-pointer text-xs font-medium">
                        {uploadingKind === 'packLogo'
                          ? '上传中...'
                          : selectedPack.packLogoAssetId
                          ? '已设置 (替换)'
                          : '上传'}
                        <input
                          type="file"
                          accept="image/png"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleUploadPackLayer('packLogo', e.target.files[0]);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* 封签 */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400">4. 封口签 (Seal):</span>
                      <label className="text-blue-400 hover:underline cursor-pointer text-xs font-medium">
                        {uploadingKind === 'packSeal'
                          ? '上传中...'
                          : selectedPack.packSealAssetId
                          ? '已设置 (替换)'
                          : '上传'}
                        <input
                          type="file"
                          accept="image/png"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleUploadPackLayer('packSeal', e.target.files[0]);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: 关联展示卡片编排 */}
              {rightTab === 'cards' && (
                <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-4 custom-scrollbar text-xs">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-neutral-200">
                        关联卡片编排 ({selectedPack.linkedCardIds.length} 张)
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        仅用于主题展示
                      </span>
                    </div>

                    <div className="space-y-2">
                      {cards.map((card) => {
                        const linked = selectedPack.linkedCardIds.includes(card.id);
                        return (
                          <div
                            key={card.id}
                            onClick={() => handleToggleLinkedCard(card.id)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              linked
                                ? 'border-blue-500/50 bg-blue-500/10 text-neutral-200'
                                : 'border-neutral-800/80 bg-neutral-950/50 text-neutral-400 hover:border-neutral-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {linked ? (
                                <CheckSquare className="w-4 h-4 text-blue-400 flex-shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-neutral-600 flex-shrink-0" />
                              )}
                              <span className="text-xs font-medium truncate">{card.title}</span>
                            </div>
                            <span className="text-[10px] font-mono text-cyan-400 flex-shrink-0 ml-2">
                              {card.cardCode}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 底部删除卡包功能 */}
              <div className="pt-3 border-t border-neutral-800 flex-shrink-0">
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm(`确定要删除数字卡包 [${selectedPack.packCode}] ${selectedPack.title} 吗？`)) {
                      await api.deletePack(selectedPack.id);
                      onRefresh();
                      setSelectedPack(packs.find((p) => p.id !== selectedPack.id) || null);
                    }
                  }}
                  className="w-full py-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/50 text-red-300 border border-red-500/20 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  删除该数字卡包
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-neutral-500">
            请从左侧选择或新建一个数字卡包。
          </div>
        )}
      </div>

      {/* 新建卡包弹窗 */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreatePack}
            className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-2xl text-neutral-100"
          >
            <h3 className="text-base font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-400" />
              新建数字卡包
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">卡包编号 (Pack Code)</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs font-mono outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">卡包主名称</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="如：LIFE PACK / 森林小奇遇"
                  required
                  className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">副标题</label>
                <input
                  type="text"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="如：自然探索与日常慢下来"
                  className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs outline-none focus:border-blue-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">画板宽 (px)</label>
                  <input
                    type="number"
                    value={newWidth}
                    onChange={(e) => setNewWidth(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs font-mono outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">画板高 (px)</label>
                  <input
                    type="number"
                    value={newHeight}
                    onChange={(e) => setNewHeight(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs font-mono outline-none focus:border-blue-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 text-xs hover:bg-neutral-700 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
              >
                创建卡包
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
