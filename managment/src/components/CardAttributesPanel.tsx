import React, { useState } from 'react';
import {
  Tag,
  FileText,
  Shield,
  Plus,
  Trash2,
  Compass,
  Star,
} from 'lucide-react';
import type {
  AttributePillTag,
  CardAttributeCategory,
  LifeSealCardMeta,
  SectorButtonState,
  TagIconType,
} from '../core/types';
import type { TagLibraryItem } from '../core/lifepackTypes';
import { ATTRIBUTE_CATEGORIES } from '../core/parameters';

interface CardAttributesPanelProps {
  meta: LifeSealCardMeta;
  onChange: (nextMeta: LifeSealCardMeta) => void;
  tagLibrary?: TagLibraryItem[];
}

const DEFAULT_FALLBACK_TAGS: TagLibraryItem[] = [
  { id: 'tag-door', label: '出门', icon: 'door', defaultStars: 4 },
  { id: 'tag-social', label: '社交', icon: 'social', defaultStars: 2 },
  { id: 'tag-absurd', label: '荒谬', icon: 'absurd', defaultStars: 5 },
  { id: 'tag-food', label: '食物', icon: 'food', defaultStars: 3 },
  { id: 'tag-travel', label: '出行', icon: 'travel', defaultStars: 3 },
  { id: 'tag-night', label: '夜间', icon: 'night', defaultStars: 4 },
  { id: 'tag-self', label: '自我', icon: 'self', defaultStars: 3 },
  { id: 'tag-emotion', label: '情绪', icon: 'emotion', defaultStars: 4 },
  { id: 'tag-sparkle', label: '奇遇', icon: 'sparkle', defaultStars: 5 },
];

const SECTOR_STATES: {
  value: SectorButtonState;
  label: string;
  defaultText: string;
  badgeColor: string;
}[] = [
  {
    value: 'sealed',
    label: '已封印 (锁定)',
    defaultText: '已封印',
    badgeColor: 'border-indigo-500/50 bg-indigo-500/20 text-indigo-200',
  },
  {
    value: 'redeemed',
    label: '已兑现 (解封)',
    defaultText: '已兑现',
    badgeColor: 'border-emerald-500/50 bg-emerald-500/20 text-emerald-200',
  },
];

/**
 * 渲染图 2 对应的 6 大事件属性 SVG 预览图标
 */
const CategorySvgIcon: React.FC<{ category: CardAttributeCategory }> = ({ category }) => {
  switch (category) {
    case 'food':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2">
          <path d="M6 3v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3M8 3v18M16 3c-1.7 0-3 1.8-3 4s1.3 4 3 4 3-1.8 3-4-1.3-4-3-4zm0 8v10" />
        </svg>
      );
    case 'travel':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2">
          <path d="M4 16l14-5c1.5-.5 2.5.5 2 2l-1 3-14 5c-1.2.4-2-.5-1-5zm3-4l3-4 3 1" />
        </svg>
      );
    case 'social':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2">
          <circle cx="12" cy="8" r="3" />
          <path d="M7 19c0-2.8 2.2-5 5-5s5 2.2 5 5" />
          <circle cx="5.5" cy="9.5" r="2" />
          <path d="M2 18c0-2 1.5-3.5 3.5-3.5" />
          <circle cx="18.5" cy="9.5" r="2" />
          <path d="M22 18c0-2-1.5-3.5-3.5-3.5" />
        </svg>
      );
    case 'night':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          <path d="M17 5l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
        </svg>
      );
    case 'self':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      );
    case 'emotion':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M8 10c.5-1 1.5-1 2 0" />
          <circle cx="15" cy="10" r="1" fill="currentColor" />
          <path d="M8.5 14.5c1 2 6 2 7 0" />
        </svg>
      );
  }
};

export const CardAttributesPanel: React.FC<CardAttributesPanelProps> = ({
  meta,
  onChange,
  tagLibrary = DEFAULT_FALLBACK_TAGS,
}) => {
  const [selectedTagId, setSelectedTagId] = useState<string>(tagLibrary[0]?.id || 'tag-door');
  const [selectedStars, setSelectedStars] = useState<number>(3);

  const updateField = <K extends keyof LifeSealCardMeta>(
    key: K,
    value: LifeSealCardMeta[K]
  ) => {
    onChange({
      ...meta,
      [key]: value,
    });
  };

  const handleSelectCategory = (cat: CardAttributeCategory, defaultLabel: string) => {
    onChange({
      ...meta,
      badgeCategory: cat,
      badgeCustomText: defaultLabel,
    });
  };

  const handleUpdateTag = (index: number, patch: Partial<AttributePillTag>) => {
    const nextTags = meta.tags.map((t, i) => (i === index ? { ...t, ...patch } : t));
    updateField('tags', nextTags);
  };

  const handleAddTagFromLibrary = () => {
    if (meta.tags.length >= 4) {
      alert('每张卡片最多添加 4 个属性标签胶囊');
      return;
    }
    const found = tagLibrary.find((t) => t.id === selectedTagId) || tagLibrary[0];
    if (!found) return;

    const nextTags: AttributePillTag[] = [
      ...meta.tags,
      {
        id: `tag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        icon: found.icon,
        label: found.label,
        stars: selectedStars,
      },
    ];
    updateField('tags', nextTags);
  };

  const handleRemoveTag = (index: number) => {
    const nextTags = meta.tags.filter((_, i) => i !== index);
    updateField('tags', nextTags);
  };

  return (
    <div className="flex flex-col gap-5 text-neutral-200">
      {/* 顶部排版总控开关 */}
      <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between gap-3">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={meta.enableOverlay}
            onChange={(e) => updateField('enableOverlay', e.target.checked)}
            className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
          />
          <div>
            <div className="text-xs font-semibold text-neutral-100">
              启用「奇遇封印卡 (LIFE SEAL)」排版层
            </div>
            <div className="text-[10px] text-neutral-400">
              控制卡片正面的左上徽章、任务文案、属性胶囊与扇形切角按钮
            </div>
          </div>
        </label>
      </div>

      {/* 1. 左上角事件分类徽章 */}
      <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 flex flex-col gap-3">
        <div className="text-sm font-semibold text-neutral-100">
          左上角分类徽章 (6大生活事件)
        </div>

        <div className="grid grid-cols-3 gap-2">
          {ATTRIBUTE_CATEGORIES.map((cat) => {
            const active = meta.badgeCategory === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => handleSelectCategory(cat.value, cat.label)}
                className={`p-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-2 ${
                  active
                    ? 'border-cyan-400 bg-cyan-500/15 text-white shadow-sm'
                    : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <div style={{ color: cat.color }}>
                  <CategorySvgIcon category={cat.value} />
                </div>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div>
            <label className="block text-[11px] text-neutral-400 mb-1">
              徽章自定义中文
            </label>
            <input
              type="text"
              value={meta.badgeCustomText}
              onChange={(e) => updateField('badgeCustomText', e.target.value)}
              placeholder="食物"
              className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 focus:border-cyan-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] text-neutral-400 mb-1">
              卡片序号 (带 #)
            </label>
            <input
              type="text"
              value={meta.cardNumber}
              onChange={(e) => updateField('cardNumber', e.target.value)}
              placeholder="#027"
              className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs font-mono text-neutral-100 focus:border-cyan-400 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. 中央封印纹样 (LIFE SEAL) */}
      <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
            <Shield className="w-4 h-4 text-cyan-400" />
            中央封印纹样 (LIFE SEAL 棱镜罗盘)
          </div>
          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
            <span className="text-neutral-400">显示纹样</span>
            <input
              type="checkbox"
              checked={meta.showSealCrest}
              onChange={(e) => updateField('showSealCrest', e.target.checked)}
              className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
            />
          </label>
        </div>

        {meta.showSealCrest && (
          <div>
            <label className="block text-[11px] text-neutral-400 mb-1">
              中央封印铭文
            </label>
            <input
              type="text"
              value={meta.sealTitle}
              onChange={(e) => updateField('sealTitle', e.target.value)}
              placeholder="LIFE SEAL"
              className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs font-mono text-neutral-100 focus:border-cyan-400 outline-none"
            />
          </div>
        )}
      </div>

      {/* 3. 任务与文案信息 */}
      <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
          <FileText className="w-4 h-4 text-cyan-400" />
          任务信息 (奇遇标题 + 主内容 + 网感补刀)
        </div>

        <div className="flex flex-col gap-2.5">
          <div>
            <label className="block text-[11px] text-neutral-400 mb-1">
              奇遇小标题
            </label>
            <input
              type="text"
              value={meta.taskHeader}
              onChange={(e) => updateField('taskHeader', e.target.value)}
              placeholder="今日奇遇 #027"
              className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 focus:border-cyan-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] text-neutral-400 mb-1">
              任务主内容 (支持回车换行)
            </label>
            <textarea
              rows={2}
              value={meta.taskMainText}
              onChange={(e) => updateField('taskMainText', e.target.value)}
              placeholder="去楼下便利店，&#10;买一瓶你没喝过的饮料。"
              className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 focus:border-cyan-400 outline-none resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-[11px] text-neutral-400 mb-1">
              网感补刀 (底部副文案)
            </label>
            <input
              type="text"
              value={meta.taskSubText}
              onChange={(e) => updateField('taskSubText', e.target.value)}
              placeholder="不准研究配料表。"
              className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 focus:border-cyan-400 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. 属性标签胶囊组 (下拉 Select 选择 + 1~5 星评级) */}
      <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
            <Tag className="w-4 h-4 text-cyan-400" />
            属性标签库选择 (含 1~5 星评级)
          </div>
          <span className="text-[10px] text-neutral-400 font-mono">
            {meta.tags.length} / 4 个标签
          </span>
        </div>

        {/* 下拉添加新标签工具条 */}
        {meta.tags.length < 4 && (
          <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 flex flex-wrap items-center gap-2">
            <select
              value={selectedTagId}
              onChange={(e) => {
                setSelectedTagId(e.target.value);
                const item = tagLibrary.find((t) => t.id === e.target.value);
                if (item) setSelectedStars(item.defaultStars || 3);
              }}
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 outline-none focus:border-cyan-400 min-w-[130px]"
            >
              {tagLibrary.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label} (默认 {t.defaultStars} 星)
                </option>
              ))}
            </select>

            {/* 设定星级 */}
            <div className="flex items-center gap-1 bg-neutral-900 px-2 py-1 rounded-lg border border-neutral-700">
              <span className="text-[10px] text-neutral-400 mr-1">星级:</span>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedStars(s)}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      s <= selectedStars
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-neutral-600'
                    }`}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddTagFromLibrary}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              添加
            </button>
          </div>
        )}

        {/* 当前卡片已选标签列表 */}
        <div className="flex flex-col gap-2">
          {meta.tags.length === 0 ? (
            <div className="text-center py-4 text-xs text-neutral-500">
              暂未添加标签，请从上方标签库下拉选择并添加
            </div>
          ) : (
            meta.tags.map((tag, idx) => (
              <div
                key={tag.id}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-200 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                    {tag.label}
                  </span>

                  {/* 1~5 星交互星级 */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => {
                      const curStars = tag.stars || 3;
                      const active = s <= curStars;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleUpdateTag(idx, { stars: s })}
                          title={`点击设为 ${s} 星`}
                          className="p-0.5 hover:scale-125 transition-transform"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              active
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-neutral-700'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveTag(idx)}
                  className="p-1 text-neutral-500 hover:text-red-400 rounded-lg transition-colors"
                  title="移除标签"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. 左下角扇形按钮 */}
      <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
          <Compass className="w-4 h-4 text-cyan-400" />
          左下扇形状态按钮
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {SECTOR_STATES.map((st) => {
            const active = meta.sectorState === st.value;
            return (
              <button
                key={st.value}
                type="button"
                onClick={() =>
                  onChange({
                    ...meta,
                    sectorState: st.value,
                    sectorCustomText: st.defaultText,
                    showSealCrest: st.value === 'sealed',
                  })
                }
                className={`px-3 py-2.5 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  active
                    ? st.badgeColor + ' shadow-md'
                    : 'border-neutral-800 bg-neutral-950/50 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>

        <div className="pt-1">
          <label className="block text-[11px] text-neutral-400 mb-1">
            扇形按钮自定义文字
          </label>
          <input
            type="text"
            value={meta.sectorCustomText}
            onChange={(e) => updateField('sectorCustomText', e.target.value)}
            placeholder="已封印 / 已兑现"
            className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 focus:border-cyan-400 outline-none"
          />
        </div>
      </div>
    </div>
  );
};
