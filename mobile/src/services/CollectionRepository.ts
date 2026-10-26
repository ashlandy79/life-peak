import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserCardInstance } from '../types/card';
import { INITIAL_USER_INSTANCES } from '../data/mockCards';

const INSTANCES_STORAGE_KEY = 'lifepack_user_card_instances_v1';

class CollectionRepositoryImpl {
  private instances: UserCardInstance[] = [];
  private initialized = false;

  private async init() {
    if (this.initialized) return;
    try {
      const stored = await AsyncStorage.getItem(INSTANCES_STORAGE_KEY);
      if (stored) {
        this.instances = JSON.parse(stored);
      } else {
        this.instances = [...INITIAL_USER_INSTANCES];
      }
    } catch {
      this.instances = [...INITIAL_USER_INSTANCES];
    }
    this.initialized = true;
  }

  async getUserCardInstances(): Promise<UserCardInstance[]> {
    await this.init();
    return [...this.instances];
  }

  async getInstanceById(instanceId: string): Promise<UserCardInstance | undefined> {
    await this.init();
    return this.instances.find((i) => i.instanceId === instanceId);
  }

  async addInstance(instance: UserCardInstance): Promise<void> {
    await this.init();
    const existingIndex = this.instances.findIndex((i) => i.instanceId === instance.instanceId);
    if (existingIndex >= 0) {
      this.instances[existingIndex] = instance;
    } else {
      this.instances.unshift(instance);
    }
    await this.persist();
  }

  async acceptTask(instanceId: string): Promise<UserCardInstance | undefined> {
    await this.init();
    const instance = this.instances.find((i) => i.instanceId === instanceId);
    if (instance) {
      instance.status = 'ACTIVE';
      instance.acceptedAt = new Date().toISOString();
      await this.persist();
    }
    return instance;
  }

  async completeTask(
    instanceId: string,
    memoryText?: string,
    memoryPhotoUri?: string
  ): Promise<UserCardInstance | undefined> {
    await this.init();
    const instance = this.instances.find((i) => i.instanceId === instanceId);
    if (instance) {
      instance.status = 'COLLECTED';
      instance.completedAt = new Date().toISOString();
      if (memoryText) instance.memoryText = memoryText;
      if (memoryPhotoUri) instance.memoryPhotoUri = memoryPhotoUri;
      await this.persist();
    }
    return instance;
  }

  async getLatestSealedOrActiveInstance(): Promise<UserCardInstance | undefined> {
    await this.init();
    return this.instances.find((i) => i.status === 'SEALED' || i.status === 'ACTIVE');
  }

  async unsealInstance(
    instanceId: string,
    memoryOption?: string,
    memoryText?: string
  ): Promise<UserCardInstance | undefined> {
    await this.init();
    const instance = this.instances.find((i) => i.instanceId === instanceId);
    if (instance) {
      instance.status = 'COLLECTED';
      instance.completedAt = new Date().toISOString();
      if (memoryText) {
        instance.memoryText = memoryText;
      }
      await this.persist();
    }
    return instance;
  }

  async toggleFavorite(instanceId: string): Promise<UserCardInstance | undefined> {
    await this.init();
    const instance = this.instances.find((i) => i.instanceId === instanceId);
    if (instance) {
      instance.isFavorite = !instance.isFavorite;
      await this.persist();
    }
    return instance;
  }

  private async persist() {
    try {
      await AsyncStorage.setItem(INSTANCES_STORAGE_KEY, JSON.stringify(this.instances));
    } catch {
      // ignore
    }
  }
}

export const CollectionRepository = new CollectionRepositoryImpl();
