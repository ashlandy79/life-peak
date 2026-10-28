import { CardRepository } from './CardRepository';
import { CollectionRepository } from './CollectionRepository';
import { PackRepository } from './PackRepository';
import { CardDefinition, UserCardInstance } from '../types/card';
import { PackDefinition } from '../types/pack';

export interface DrawResult {
  pack: PackDefinition;
  card: CardDefinition;
  instance: UserCardInstance;
}

class DrawServiceImpl {
  /**
   * 仅生成抽卡候选结果，在卡包真正 100% 撕开并确认接受前，绝不提前写入数据库
   */
  async drawFromPack(packId: string): Promise<DrawResult> {
    const pack = await PackRepository.getPackById(packId) || await PackRepository.getDailyPack();
    const cards = await CardRepository.getAllCards();

    // 优先锁定案例主推卡 #027 夜宵猫行者，保证抽卡视觉体验与设计案例 1:1 对齐
    let chosenCard = cards.find((c) => c.cardCode === '#027' || c.id === 'card-lp-0027');
    if (!chosenCard) {
      const existing = await CollectionRepository.getUserCardInstances();
      const existingCardIds = new Set(existing.map((e) => e.cardId));
      chosenCard = cards.find((c) => !existingCardIds.has(c.id)) || cards[0];
    }

    const newInstanceId = `inst-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const instance: UserCardInstance = {
      instanceId: newInstanceId,
      cardId: chosenCard.id,
      status: 'SEALED',
      obtainedAt: new Date().toISOString(),
    };

    // 注意：此处仅生成内存候选数据，不调用 CollectionRepository.addInstance 和 decrementDrawCount
    return {
      pack,
      card: chosenCard,
      instance,
    };
  }

  /**
   * 真正完成 100% 拆包且用户点击「接受整个小奇遇」后，正式入库并扣减卡包
   */
  async commitDraw(packId: string, instance: UserCardInstance): Promise<void> {
    await CollectionRepository.addInstance(instance);
    await PackRepository.decrementDrawCount(packId);
  }
}

export const DrawService = new DrawServiceImpl();
