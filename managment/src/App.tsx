import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/views/DashboardView';
import { CardLibraryView } from './components/views/CardLibraryView';
import { CardStudioView } from './components/views/CardStudioView';
import { DigitalPackStudioView } from './components/views/DigitalPackStudioView';
import { CardTemplateLibraryView } from './components/views/CardTemplateLibraryView';
import { api } from './services/api';
import type {
  CardDefinition,
  CardTemplate,
  ContentCategory,
  ContentSeries,
  DigitalPackDefinition,
  StudioView,
} from './core/lifepackTypes';
import { RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<StudioView>('dashboard');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // 全局数据状态
  const [cards, setCards] = useState<CardDefinition[]>([]);
  const [packs, setPacks] = useState<DigitalPackDefinition[]>([]);
  const [seriesList, setSeriesList] = useState<ContentSeries[]>([]);
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [templates, setTemplates] = useState<CardTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const reloadData = useCallback(async () => {
    try {
      const [cardsData, packsData, metaData, templatesData] =
        await Promise.all([
          api.getCards(),
          api.getPacks(),
          api.getMeta(),
          api.getTemplates(),
        ]);

      setCards(cardsData);
      setPacks(packsData);
      setSeriesList(metaData.series);
      setCategories(metaData.categories);
      setTemplates(templatesData);
    } catch (err) {
      console.error('加载系统资产数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadData();
  }, [reloadData]);

  // 卡片操作
  const handleOpenCardStudio = (cardId: string) => {
    setSelectedCardId(cardId);
    setCurrentView('card-editor');
  };

  const handleNewCard = () => {
    setSelectedCardId(null);
    setCurrentView('card-editor');
  };

  const handleCloneCard = async (cardId: string) => {
    try {
      const cloned = await api.cloneCard(cardId);
      await reloadData();
      setSelectedCardId(cloned.id);
      setCurrentView('card-editor');
    } catch (err: any) {
      alert(`克隆卡片失败: ${err.message}`);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('确定要从资产库中永久删除这张卡片吗？')) return;
    try {
      await api.deleteCard(cardId);
      await reloadData();
    } catch (err: any) {
      alert(`删除卡片失败: ${err.message}`);
    }
  };

  const handleExportCard = (card: CardDefinition) => {
    const jsonStr = JSON.stringify(card, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `card-${card.cardCode}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 顶部四板块统一 Studio 导航栏 */}
      <Navigation
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
        onNewCard={handleNewCard}
      />

      {/* 视图内容容器 */}
      <main className="flex-1 flex flex-col">
        {loading && currentView === 'dashboard' ? (
          <div className="flex-1 flex items-center justify-center py-40 text-neutral-500 text-xs gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
            正在连接 LIFE PACK 服务端数据库...
          </div>
        ) : (
          <>
            {currentView === 'dashboard' && (
              <DashboardView
                cards={cards}
                packs={packs}
                templatesCount={templates.length}
                onNavigate={(v) => setCurrentView(v)}
                onEditCard={handleOpenCardStudio}
                onNewCard={handleNewCard}
                onEditPack={() => setCurrentView('packs')}
              />
            )}

            {currentView === 'cards' && (
              <CardLibraryView
                cards={cards}
                seriesList={seriesList}
                categories={categories}
                onOpenCardStudio={handleOpenCardStudio}
                onNewCard={handleNewCard}
                onCloneCard={handleCloneCard}
                onDeleteCard={handleDeleteCard}
                onExportCard={handleExportCard}
              />
            )}

            {currentView === 'card-editor' && (
              <CardStudioView
                cardId={selectedCardId}
                onBack={() => {
                  setCurrentView('cards');
                  void reloadData();
                }}
                onSaved={() => {
                  void reloadData();
                }}
              />
            )}

            {currentView === 'packs' && (
              <DigitalPackStudioView
                packs={packs}
                cards={cards}
                seriesList={seriesList}
                onRefresh={reloadData}
                onOpenCardStudio={handleOpenCardStudio}
              />
            )}

            {currentView === 'templates' && (
              <CardTemplateLibraryView
                templates={templates}
                cards={cards}
                onRefresh={reloadData}
                onOpenCardStudio={handleOpenCardStudio}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};
export default App;
