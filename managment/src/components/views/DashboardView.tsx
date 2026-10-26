import React from 'react';
import {
  Layers,
  Package,
  Palette,
  ArrowRight,
  Plus,
  Clock,
  Compass,
  Sparkles,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import type {
  CardDefinition,
  DigitalPackDefinition,
  StudioView,
} from '../../core/lifepackTypes';

interface DashboardViewProps {
  cards: CardDefinition[];
  packs: DigitalPackDefinition[];
  templatesCount: number;
  onNavigate: (view: StudioView) => void;
  onEditCard: (cardId: string) => void;
  onNewCard: () => void;
  onEditPack: (packId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cards,
  packs,
  templatesCount,
  onNavigate,
  onEditCard,
  onNewCard,
  onEditPack,
}) => {
  const draftsCount = cards.filter((c) => c.status === 'DRAFT').length;
  const readyReviewCount = cards.filter((c) => c.status === 'READY_FOR_REVIEW').length;
  const readyExportCount = cards.filter((c) => c.status === 'READY_FOR_EXPORT').length;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* 欢迎标语与快捷操作 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-cyan-950/40 border border-neutral-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            LIFE PACK 官方数字资产制作与留档中心
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-100">
            卡片与数字卡包资产工坊
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            生产、组织与维护官方卡片与卡包。等级体系、光学蒙版与边框色盘在卡片模板库中集中配置，卡片制作台直接选择对应模组装配。
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={onNewCard}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            新建卡片
          </button>
          <button
            onClick={() => onNavigate('templates')}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs border border-neutral-700 flex items-center gap-1.5 transition-colors"
          >
            卡片模板库
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3 项关键资产数据统计 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('cards')}
          className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-cyan-500/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold">卡片资产总数</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-neutral-100">{cards.length}</div>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400">
              <span className="text-amber-400">{draftsCount} 草稿</span>
              <span>·</span>
              <span className="text-cyan-400">{readyExportCount} 可导出</span>
            </div>
          </div>
        </div>

        <div
          onClick={() => onNavigate('packs')}
          className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-blue-500/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold">数字卡包资产</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-neutral-100">{packs.length}</div>
            <div className="mt-1 text-[11px] text-neutral-400">
              包含正反面设计与包装分层
            </div>
          </div>
        </div>

        <div
          onClick={() => onNavigate('templates')}
          className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-purple-500/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold">卡片模板与模组库</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-neutral-100">{templatesCount}</div>
            <div className="mt-1 text-[11px] text-neutral-400">
              等级体系 · 光学蒙版 · 边框色盘
            </div>
          </div>
        </div>
      </div>

      {/* 最近制作的卡片资产列表 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-100">
            <Layers className="w-4 h-4 text-cyan-400" />
            最近编辑的卡片资产
          </div>
          <button
            onClick={() => onNavigate('cards')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            进入卡片资产库
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.slice(0, 6).map((card) => {
            return (
              <div
                key={card.id}
                onClick={() => onEditCard(card.id)}
                className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-cyan-500/50 transition-all cursor-pointer group flex gap-3.5 hover:shadow-lg hover:shadow-cyan-500/5"
              >
                {/* 缩略图 */}
                <div className="w-16 h-21 rounded-lg bg-neutral-950 border border-neutral-800 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                  {card.visual.compositePreviewAssetId || card.visual.thumbnailAssetId ? (
                    <img
                      src={card.visual.compositePreviewAssetId || card.visual.thumbnailAssetId || ''}
                      alt={card.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-neutral-600">
                      <Sparkles className="w-5 h-5" />
                      <span className="text-[8px] mt-1 font-mono">3:4</span>
                    </div>
                  )}
                  <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-black/70 text-[8px] font-mono text-cyan-300 rounded">
                    {card.cardCode}
                  </span>
                </div>

                {/* 属性与文案 */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-neutral-100 truncate group-hover:text-cyan-300 transition-colors">
                        {card.title}
                      </h4>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          card.status === 'READY_FOR_EXPORT'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            : card.status === 'READY_FOR_REVIEW'
                            ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {card.status === 'READY_FOR_EXPORT'
                          ? '可导出'
                          : card.status === 'READY_FOR_REVIEW'
                          ? '待评审'
                          : '草稿'}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {card.task.description || card.subtitle || '暂无任务描述'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-neutral-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {card.task.estimatedMinutes}分钟
                    </span>
                    <span className="flex items-center gap-1 font-medium text-neutral-400">
                      <Compass className="w-3 h-3" />
                      {card.task.difficulty === 'LIGHT'
                        ? '轻松'
                        : card.task.difficulty === 'NORMAL'
                        ? '普通'
                        : '大胆'}
                    </span>
                    <span className="ml-auto text-cyan-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                      进入工坊 →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 数字卡包与边框快速导流区 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* 卡包管理预览卡 */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-neutral-100">
              <Package className="w-4 h-4 text-blue-400" />
              数字卡包制作 (Digital Pack Studio)
            </div>
            <button
              onClick={() => onNavigate('packs')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              管理卡包 →
            </button>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            用于 App 首页/主题馆展示的数字卡包视觉资产。支持包装主体、正反面插画、品牌封签等组合编排，并可关联展示专属卡片集合。
          </p>
          <div className="space-y-2">
            {packs.slice(0, 2).map((pack) => (
              <div
                key={pack.id}
                onClick={() => onEditPack(pack.id)}
                className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800/80 flex items-center justify-between hover:border-blue-500/40 cursor-pointer transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-neutral-200">
                    {pack.title} · {pack.subtitle}
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono">
                    编号: {pack.packCode} · 关联 {pack.linkedCardIds.length} 张卡片
                  </div>
                </div>
                <span className="text-xs text-blue-400 font-medium">编辑 →</span>
              </div>
            ))}
          </div>
        </div>

        {/* 卡片模板与等级模组中心 */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-neutral-100">
              <Palette className="w-4 h-4 text-purple-400" />
              卡片模板与等级模组中心
            </div>
            <button
              onClick={() => onNavigate('templates')}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              管理模组 →
            </button>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            集中定义卡片等级体系（普通/高级/稀有/自定义）、全息光学蒙版、画图式流光色盘以及边框切片。卡片制作台仅需选择模组即可继承整套视觉标准。
          </p>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => onNavigate('templates')}
              className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800 hover:border-purple-500/40 text-left transition-colors flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-semibold text-neutral-200">卡片模板与模组库</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">
                  已配置 {templatesCount} 款等级模组与光学参数
                </div>
              </div>
              <span className="text-xs font-mono text-purple-400">进入模组工坊 →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
