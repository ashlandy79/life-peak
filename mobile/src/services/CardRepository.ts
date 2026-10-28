import { CardDefinition } from '../types/card';
import { MOCK_CARDS } from '../data/mockCards';
import { getApiBaseUrl, resolveAssetUrl } from '../config/api';

class CardRepositoryImpl {
  private cards: CardDefinition[] = [...MOCK_CARDS];
  private hasFetchedRemote = false;

  async initFromRemote(): Promise<CardDefinition[]> {
    try {
      const baseUrl = await getApiBaseUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(`${baseUrl}/api/cards`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const remoteCards: any[] = await res.json();
        if (Array.isArray(remoteCards) && remoteCards.length > 0) {
          const mappedCards: CardDefinition[] = remoteCards.map((rc) => {
            const visual = rc.visual || {};
            const bgUrl = resolveAssetUrl(visual.backgroundAssetId || visual.renderConfig?.backgroundUrl);
            const subUrl = resolveAssetUrl(visual.subjectAssetId || visual.renderConfig?.subjectUrl);
            const prevUrl = resolveAssetUrl(visual.compositePreviewAssetId || visual.thumbnailAssetId);

            return {
              id: rc.id,
              cardCode: rc.cardCode || 'LP-0000',
              title: rc.title || '今日奇遇',
              subtitle: rc.subtitle || rc.task?.description || '',
              seriesId: rc.seriesId || 'series-remote',
              seriesName: rc.internalName || '城市漫游 · 生活奇遇',
              quote: rc.description || rc.subtitle || '在琐碎日常里，打捞微小的闪光。',
              taskTitle: rc.task?.title || rc.title || '生活微习惯',
              taskDescription: rc.task?.description || rc.description || '放慢脚步，感知世界。',
              taskDurationMinutes: rc.task?.estimatedMinutes || 15,
              tags: Array.isArray(rc.tags) ? rc.tags : ['生活', '探索'],
              previewImage: prevUrl ? { uri: prevUrl } : require('../../assets/cards/link_subject.png'),
              backgroundImage: bgUrl ? { uri: bgUrl } : require('../../assets/cards/forest_bg.jpg'),
              subjectImage: subUrl ? { uri: subUrl } : require('../../assets/cards/link_subject.png'),
              backLiningImage: require('../../assets/packs/inner_lining_texture.png'),
              tier: rc.visual?.renderConfig?.rimColor === 'gold' ? 'advanced' : 'rare',
            };
          });

          // Combine with mock cards so default high-quality Link cards are also preserved
          const existingCodes = new Set(mappedCards.map((c) => c.cardCode));
          const uniqueMocks = MOCK_CARDS.filter((m) => !existingCodes.has(m.cardCode));
          this.cards = [...mappedCards, ...uniqueMocks];
          this.hasFetchedRemote = true;
          return [...this.cards];
        }
      }
    } catch {
      // Backend not yet reachable or offline -> fallback to local cards
    } finally {
      this.hasFetchedRemote = true;
    }
    return [...this.cards];
  }

  async getAllCards(): Promise<CardDefinition[]> {
    if (!this.hasFetchedRemote) {
      return this.initFromRemote();
    }
    return [...this.cards];
  }

  async getCardById(id: string): Promise<CardDefinition | undefined> {
    const list = await this.getAllCards();
    return list.find((c) => c.id === id);
  }

  async getCardByCode(code: string): Promise<CardDefinition | undefined> {
    const list = await this.getAllCards();
    return list.find((c) => c.cardCode === code);
  }
}

export const CardRepository = new CardRepositoryImpl();
