import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Copy,
  Trash2,
  ExternalLink,
  Clock,
  Compass,
  Sparkles,
  Download,
  AlertCircle,
  Tag,
} from 'lucide-react';
import type {
  CardDefinition,
  ContentCategory,
  ContentSeries,
  ProductionStatus,
} from '../../core/lifepackTypes';

interface CardLibraryViewProps {
  cards: CardDefinition[];
  seriesList: ContentSeries[];
  categories: ContentCategory[];
  onOpenCardStudio: (cardId: string) => void;
  onNewCard: () => void;
  onCloneCard: (cardId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onExportCard: (card: CardDefinition) => void;
}

export const CardLibraryView: React.FC<CardLibraryViewProps> = ({
  cards,
  seriesList,
  categories,
  onOpenCardStudio,
  onNewCard,
  onCloneCard,
  onDeleteCard,
  onExportCard,
}) => {
  const [search, setSearch] = useState('');
  const [selectedSeries, setSelectedSeries] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredCards = cards.filter((card) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchText =
        card.cardCode.toLowerCase().includes(q) ||
        card.title.toLowerCase().includes(q) ||
        card.internalName.toLowerCase().includes(q) ||
        card.task.description.toLowerCase().includes(q);
      if (!matchText) return false;
    }
    if (selectedSeries !== 'all' && card.seriesId !== selectedSeries) {
      return false;
    }
    if (selectedCategory !== 'all' && card.primaryCategoryId !== selectedCategory) {
      return false;
    }
    if (selectedStatus !== 'all' && card.status !== selectedStatus) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* 头部标题与控制栏 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-neutral-100">卡片资产库</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-800 text-cyan-300 border border-neutral-700">
              共 {cards.length} 张卡片
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            浏览、检索、编辑或归档 LIFE PACK 官方奇遇卡片，点击任意卡片即可进入全息制作生成台。
          </p>
        </div>

        <button
          onClick={onNewCard}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          新建卡片
        </button>
      </div>

      {/* 筛选与搜索条 */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-wrap items-center gap-3">
        {/* 关键词搜索 */}
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索卡片编号 (LP-0001)、标题或任务文案..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-neutral-200 outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        {/* 所属系列筛选 */}
        <select
          value={selectedSeries}
          onChange={(e) => setSelectedSeries(e.target.value)}
          className="bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-300 outline-none focus:border-cyan-400"
        >
          <option value="all">全部内容系列</option>
          {seriesList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* 主分类筛选 */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-300 outline-none focus:border-cyan-400"
        >
          <option value="all">全部分类</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* 制作状态筛选 */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-300 outline-none focus:border-cyan-400"
        >
          <option value="all">全部制作状态</option>
          <option value="DRAFT">草稿 (DRAFT)</option>
          <option value="READY_FOR_REVIEW">待检查 (READY_FOR_REVIEW)</option>
          <option value="READY_FOR_EXPORT">可导出 (READY_FOR_EXPORT)</option>
          <option value="ARCHIVED">已归档 (ARCHIVED)</option>
        </select>
      </div>

      {/* 卡片网格展示 */}
      {filteredCards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredCards.map((card) => {
            const hasCompleteVisual =
              Boolean(card.visual.backgroundAssetId && card.visual.subjectAssetId);

            return (
              <div
                key={card.id}
                className="rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-cyan-500/50 transition-all flex flex-col overflow-hidden group shadow-md hover:shadow-cyan-500/10"
              >
                {/* 顶部 3:4 预览区 */}
                <div
                  onClick={() => onOpenCardStudio(card.id)}
                  className="aspect-[3/4] w-full bg-neutral-950 relative overflow-hidden cursor-pointer flex items-center justify-center group-hover:brightness-105 transition-all"
                >
                  {card.visual.compositePreviewAssetId || card.visual.thumbnailAssetId ? (
                    <img
                      src={card.visual.compositePreviewAssetId || card.visual.thumbnailAssetId || ''}
                      alt={card.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-neutral-600 gap-2">
                      <Sparkles className="w-8 h-8 opacity-40" />
                      <span className="text-[10px] font-mono">1200 × 1600 (3:4)</span>
                      <span className="text-[11px] text-cyan-400/80 underline font-medium">
                        进入工坊配图
                      </span>
                    </div>
                  )}

                  {/* 悬浮角标 */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-cyan-300 border border-cyan-500/30">
                      {card.cardCode}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md border ${
                        card.status === 'READY_FOR_EXPORT'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                          : card.status === 'READY_FOR_REVIEW'
                          ? 'bg-blue-950/80 text-blue-300 border-blue-500/40'
                          : 'bg-neutral-900/80 text-neutral-400 border-neutral-700'
                      }`}
                    >
                      {card.status === 'READY_FOR_EXPORT'
                        ? '可导出'
                        : card.status === 'READY_FOR_REVIEW'
                        ? '待评审'
                        : '草稿'}
                    </span>
                  </div>

                  {/* 覆盖 Hover 快速进入提示 */}
                  <div className="absolute inset-0 bg-cyan-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="px-3.5 py-1.5 rounded-full bg-cyan-500 text-neutral-950 font-bold text-xs flex items-center gap-1 shadow-lg">
                      <ExternalLink className="w-3.5 h-3.5" />
                      进入全息工坊
                    </span>
                  </div>
                </div>

                {/* 卡片信息区 */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3
                      onClick={() => onOpenCardStudio(card.id)}
                      className="text-sm font-bold text-neutral-100 hover:text-cyan-300 cursor-pointer transition-colors line-clamp-1"
                    >
                      {card.title}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                      {card.task.description || card.subtitle || '暂无任务文案'}
                    </p>
                  </div>

                  {/* 标签与时长 */}
                  <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        {card.task.estimatedMinutes} 分钟
                      </span>
                      <span className="flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-purple-400" />
                        {card.task.difficulty === 'LIGHT'
                          ? '轻度任务'
                          : card.task.difficulty === 'NORMAL'
                          ? '常规任务'
                          : '大胆冒险'}
                      </span>
                    </div>

                    {card.tags && card.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {card.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 底部操作工具栏 */}
                  <div className="pt-2 flex items-center justify-between border-t border-neutral-800">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onCloneCard(card.id)}
                        title="克隆副本"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-cyan-300 hover:bg-neutral-800 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onExportCard(card)}
                        title="导出单卡 ZIP 包"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-cyan-300 hover:bg-neutral-800 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`确定要删除卡片 [${card.cardCode}] ${card.title} 吗？`)) {
                            onDeleteCard(card.id);
                          }
                        }}
                        title="删除卡片"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenCardStudio(card.id)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-cyan-300 flex items-center gap-1 transition-colors"
                    >
                      工坊制作
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <AlertCircle className="w-8 h-8 text-neutral-500 mx-auto" />
          <div className="text-sm font-semibold text-neutral-300">没有找到匹配的卡片资产</div>
          <div className="text-xs text-neutral-500 max-w-sm mx-auto">
            请尝试调整搜索关键词或重置筛选条件，或者点击上方“新建卡片”开启一张新的生活奇遇。
          </div>
          <button
            onClick={onNewCard}
            className="mt-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-cyan-300 rounded-lg border border-neutral-700 transition-colors"
          >
            新建第一张卡片
          </button>
        </div>
      )}
    </div>
  );
};
