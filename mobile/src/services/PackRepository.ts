import { PackDefinition } from '../types/pack';
import { MOCK_PACKS } from '../data/mockPacks';

class PackRepositoryImpl {
  private packs: PackDefinition[] = [...MOCK_PACKS];

  async getDailyPack(): Promise<PackDefinition> {
    return this.packs[0];
  }

  async getPackById(id: string): Promise<PackDefinition | undefined> {
    return this.packs.find((p) => p.id === id);
  }

  async decrementDrawCount(packId: string): Promise<void> {
    const pack = this.packs.find((p) => p.id === packId);
    if (pack && pack.availableDraws > 0) {
      pack.availableDraws -= 1;
    }
  }
}

export const PackRepository = new PackRepositoryImpl();
