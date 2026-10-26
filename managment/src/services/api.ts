import type {
  AssetRecord,
  AssetType,
  CardDefinition,
  CardTemplate,
  ContentCategory,
  ContentSeries,
  DigitalPackDefinition,
  FrameTemplate,
  IpCharacter,
  TagLibraryItem,
} from '../core/lifepackTypes';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    let errMessage = `HTTP error ${res.status}`;
    try {
      const err = await res.json();
      if (err.error) errMessage = err.error;
    } catch {
      // fallback
    }
    throw new Error(errMessage);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // 元数据
  async getMeta(): Promise<{
    series: ContentSeries[];
    categories: ContentCategory[];
    characters: IpCharacter[];
  }> {
    return request('/meta');
  },

  // 卡片
  async getCards(params?: { search?: string; series?: string; status?: string }): Promise<CardDefinition[]> {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.series) q.set('series', params.series);
    if (params?.status) q.set('status', params.status);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return request(`/cards${qs}`);
  },

  async getCard(id: string): Promise<CardDefinition> {
    return request(`/cards/${id}`);
  },

  async createCard(card: CardDefinition): Promise<CardDefinition> {
    return request('/cards', {
      method: 'POST',
      body: JSON.stringify(card),
    });
  },

  async updateCard(id: string, card: Partial<CardDefinition>): Promise<CardDefinition> {
    return request(`/cards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(card),
    });
  },

  async cloneCard(id: string): Promise<CardDefinition> {
    return request(`/cards/${id}/clone`, {
      method: 'POST',
    });
  },

  async deleteCard(id: string): Promise<{ success: boolean }> {
    return request(`/cards/${id}`, {
      method: 'DELETE',
    });
  },

  // 卡包
  async getPacks(): Promise<DigitalPackDefinition[]> {
    return request('/packs');
  },

  async getPack(id: string): Promise<DigitalPackDefinition> {
    return request(`/packs/${id}`);
  },

  async createPack(pack: DigitalPackDefinition): Promise<DigitalPackDefinition> {
    return request('/packs', {
      method: 'POST',
      body: JSON.stringify(pack),
    });
  },

  async updatePack(id: string, pack: Partial<DigitalPackDefinition>): Promise<DigitalPackDefinition> {
    return request(`/packs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pack),
    });
  },

  async deletePack(id: string): Promise<{ success: boolean }> {
    return request(`/packs/${id}`, {
      method: 'DELETE',
    });
  },

  // 卡片模板与等级模组 (Card Templates)
  async getTemplates(): Promise<CardTemplate[]> {
    return request('/templates');
  },

  async getTemplate(id: string): Promise<CardTemplate> {
    return request(`/templates/${id}`);
  },

  async createTemplate(template: CardTemplate): Promise<CardTemplate> {
    return request('/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  },

  async updateTemplate(id: string, template: Partial<CardTemplate>): Promise<CardTemplate> {
    return request(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(template),
    });
  },

  async deleteTemplate(id: string): Promise<{ success: boolean }> {
    return request(`/templates/${id}`, {
      method: 'DELETE',
    });
  },

  // 兼容别名
  async getFrames(): Promise<FrameTemplate[]> {
    return this.getTemplates();
  },

  async createFrame(frame: FrameTemplate): Promise<FrameTemplate> {
    return this.createTemplate(frame);
  },

  async updateFrame(id: string, frame: Partial<FrameTemplate>): Promise<FrameTemplate> {
    return this.updateTemplate(id, frame);
  },

  async deleteFrame(id: string): Promise<{ success: boolean }> {
    return this.deleteTemplate(id);
  },

  // 属性标签库 (Tag Library)
  async getTags(): Promise<TagLibraryItem[]> {
    return request('/tags');
  },

  async createTag(tag: TagLibraryItem): Promise<TagLibraryItem> {
    return request('/tags', {
      method: 'POST',
      body: JSON.stringify(tag),
    });
  },

  async deleteTag(id: string): Promise<{ success: boolean }> {
    return request(`/tags/${id}`, {
      method: 'DELETE',
    });
  },

  // 素材库
  async getAssets(type?: AssetType): Promise<AssetRecord[]> {
    const qs = type ? `?type=${type}` : '';
    return request(`/assets${qs}`);
  },

  async uploadAssetFile(file: File, assetType: AssetType = 'OTHER', name?: string): Promise<AssetRecord> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('assetType', assetType);
    if (name) formData.append('name', name);

    const res = await fetch(`${API_BASE}/assets/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `上传失败: ${res.status}`);
    }

    return res.json();
  },

  async uploadAssetDataUrl(dataUrl: string, name: string, assetType: AssetType = 'PREVIEW'): Promise<AssetRecord> {
    return request('/assets/dataurl', {
      method: 'POST',
      body: JSON.stringify({ dataUrl, name, assetType }),
    });
  },

  async deleteAsset(id: string): Promise<{ success: boolean }> {
    return request(`/assets/${id}`, {
      method: 'DELETE',
    });
  },

  // 备份与恢复
  async exportBackup(): Promise<any> {
    return request('/backup/export');
  },

  async importBackup(data: any): Promise<{ success: boolean; count: number }> {
    return request('/backup/import', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  },
};
