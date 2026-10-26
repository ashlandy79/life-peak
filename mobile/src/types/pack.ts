export type PackOpeningStageType =
  | 'SEALED'
  | 'PULLING'
  | 'TEARING'
  | 'OPEN'
  | 'REVEAL_CARD'
  | 'COMPLETE';

export interface PackAssetManifest {
  packId: string;
  version: number;
  closedPreview: any;
  openPreview?: any;
  sealStrip?: any;
  tearMask?: any;
  interior?: any;
}

export interface PackDefinition {
  id: string;
  seriesId: string;
  title: string;
  subtitle: string;
  description: string;
  sealedImage: any;
  openedImage?: any;
  stripImage?: any;
  totalCards: number;
  unlockedCount: number;
  availableDraws: number;
  dailyQuote?: string;
  tag?: string;
}
