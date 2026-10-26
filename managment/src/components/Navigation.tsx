import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Package,
  Palette,
  Plus,
  Sparkles,
} from 'lucide-react';
import type { StudioView } from '../core/lifepackTypes';

interface NavigationProps {
  currentView: StudioView;
  onViewChange: (view: StudioView) => void;
  onNewCard: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onViewChange,
  onNewCard,
}) => {
  const navItems: { view: StudioView; label: string; icon: React.ReactNode }[] = [
    {
      view: 'dashboard',
      label: '制作台首页',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      view: 'cards',
      label: '卡片资产库',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      view: 'packs',
      label: '数字卡包库',
      icon: <Package className="w-4 h-4" />,
    },
    {
      view: 'templates',
      label: '卡片模板库',
      icon: <Palette className="w-4 h-4" />,
    },
  ];

  return (
    <header className="h-14 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* 品牌与系统标识 */}
      <div className="flex items-center gap-6">
        <div
          onClick={() => onViewChange('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-wider bg-gradient-to-r from-neutral-100 via-cyan-200 to-blue-400 bg-clip-text text-transparent">
                LIFE PACK
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                Studio
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 -mt-0.5">
              卡片与卡包资产制作台
            </div>
          </div>
        </div>

        {/* 主导航条 */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active =
              currentView === item.view ||
              (item.view === 'cards' && currentView === 'card-editor') ||
              (item.view === 'packs' && currentView === 'pack-editor');
            return (
              <button
                key={item.view}
                onClick={() => onViewChange(item.view)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  active
                    ? 'bg-neutral-800 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 状态与快速新建入口 */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Express 后端在线
        </div>

        <button
          onClick={onNewCard}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          新建卡片
        </button>
      </div>
    </header>
  );
};
