type BadgeListener = () => void;

class BadgeServiceClass {
  private hasNewAlbum = false;
  private listeners: BadgeListener[] = [];

  getAlbumBadge(): boolean {
    return this.hasNewAlbum;
  }

  setAlbumBadge(val: boolean) {
    this.hasNewAlbum = val;
    this.notify();
  }

  subscribe(listener: BadgeListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

export const BadgeService = new BadgeServiceClass();
