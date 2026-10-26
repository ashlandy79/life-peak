import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Image as RNImage } from 'react-native';
import {
  mountTcgHoloCard,
  type ExtendedTcgCardHandle,
} from '../core/tcgHoloRenderer';
import type {
  CardRarityTier,
  LifeSealCardMeta,
  RimColorType,
  TcgCardAssets,
  TcgHoloParameters,
} from '../core/tcgTypes';
import {
  CARD_RARITY_TIERS,
  DEFAULT_LIFE_SEAL_META,
  DEFAULT_TCG_PARAMETERS,
} from '../core/tcgParameters';
import { renderLifeSealUiLayer } from '../utils/lifeSealUiRenderer';
import type { CardDefinition } from '../types/card';

export interface TcgHoloCardRef {
  getHandle: () => ExtendedTcgCardHandle | null;
  flipCard: () => void;
  recenter: () => void;
  unsealCard: () => Promise<void>;
  resealCard: () => Promise<void>;
  setTier: (tier: CardRarityTier) => Promise<void>;
}

export interface TcgHoloCardProps {
  card?: CardDefinition | null;
  isSealed?: boolean;
  tier?: CardRarityTier;
  customAssets?: Partial<TcgCardAssets>;
  customMeta?: Partial<LifeSealCardMeta>;
  initialParameters?: Partial<TcgHoloParameters>;
  cardWidth?: number;
  onCardReady?: (handle: ExtendedTcgCardHandle) => void;
  onFlipChange?: (flipped: boolean) => void;
  onError?: (error: Error) => void;
  style?: any;
}

function resolveAssetUrl(source: any, fallback: string): string {
  if (!source) return fallback;
  if (typeof source === 'string') return source;
  if (typeof source === 'object' && source.uri) return source.uri;
  if (typeof source === 'number') {
    try {
      const resolved = RNImage.resolveAssetSource(source);
      if (resolved?.uri) return resolved.uri;
    } catch {
      // fallback
    }
  }
  return fallback;
}

export const TcgHoloCard = forwardRef<TcgHoloCardRef, TcgHoloCardProps>(
  (
    {
      card,
      isSealed = false,
      tier = 'rare',
      customAssets,
      customMeta,
      initialParameters,
      cardWidth,
      onCardReady,
      onFlipChange,
      onError,
      style,
    },
    ref
  ) => {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const handleRef = useRef<ExtendedTcgCardHandle | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const currentMetaRef = useRef<LifeSealCardMeta>(DEFAULT_LIFE_SEAL_META);
    const currentTierRef = useRef<CardRarityTier>(tier);

    // Determine effective tier and meta
    const effectiveTier = (card?.tier as CardRarityTier) || tier || 'rare';
    currentTierRef.current = effectiveTier;
    const tierSpec = CARD_RARITY_TIERS[effectiveTier] || CARD_RARITY_TIERS.rare;

    // Helper to generate the Canvas 2D UI texture
    const generateUiTexture = async (sealed: boolean, targetTier: CardRarityTier = effectiveTier) => {
      const spec = CARD_RARITY_TIERS[targetTier] || CARD_RARITY_TIERS.rare;
      const meta: LifeSealCardMeta = {
        ...DEFAULT_LIFE_SEAL_META,
        tier: targetTier,
        cardNumber: card?.cardCode || '#027',
        showSealCrest: sealed,
        taskHeader: card?.taskTitle || '今日奇遇 #027',
        taskMainText: card?.title || '去楼下便利店，\n买一瓶你没喝过的饮料。',
        taskSubText: card?.taskDescription || card?.subtitle || '不准研究配料表。',
        sectorState: sealed ? 'sealed' : 'redeemed',
        sectorCustomText: sealed ? '已封印' : '已兑现',
        rarityText: spec.defaultRarityText,
        ...customMeta,
      };
      currentMetaRef.current = meta;

      const uiDataUrl = await renderLifeSealUiLayer(
        meta,
        spec.rimColor,
        [1080, 1440]
      );
      return uiDataUrl;
    };

    // Expose imperative methods to parents
    useImperativeHandle(ref, () => ({
      getHandle: () => handleRef.current,
      flipCard: () => {
        handleRef.current?.flipCard();
      },
      recenter: () => {
        handleRef.current?.recenter();
      },
      unsealCard: async () => {
        if (!handleRef.current) return;
        const spec = CARD_RARITY_TIERS[currentTierRef.current] || CARD_RARITY_TIERS.rare;
        // 1. Update shader parameters to unsealed
        handleRef.current.setParameters({
          isSealed: false,
          frostedBlur: 0.0,
          depth: 0.85,
          power: 1.05,
          rimColor: spec.rimColor,
          structureLightMode: spec.structureLightMode,
        });
        // 2. Re-render UI layer texture with crest removed and sector redeemed
        const newUiUrl = await generateUiTexture(false, currentTierRef.current);
        await handleRef.current.updateLayerTexture('ui', newUiUrl);
      },
      resealCard: async () => {
        if (!handleRef.current) return;
        const spec = CARD_RARITY_TIERS[currentTierRef.current] || CARD_RARITY_TIERS.rare;
        handleRef.current.setParameters({
          isSealed: true,
          frostedBlur: 0.65,
          depth: 0.0,
          power: 0.0,
          rimColor: spec.rimColor,
        });
        const newUiUrl = await generateUiTexture(true, currentTierRef.current);
        await handleRef.current.updateLayerTexture('ui', newUiUrl);
      },
      setTier: async (newTier: CardRarityTier) => {
        currentTierRef.current = newTier;
        if (!handleRef.current) return;
        const spec = CARD_RARITY_TIERS[newTier] || CARD_RARITY_TIERS.rare;
        handleRef.current.setParameters({
          rimColor: spec.rimColor,
          structureLightMode: spec.structureLightMode,
        });
        const newUiUrl = await generateUiTexture(isSealed, newTier);
        await handleRef.current.updateLayerTexture('ui', newUiUrl);
      },
    }));

    useEffect(() => {
      if (Platform.OS !== 'web' || !hostRef.current) return;

      let cancelled = false;
      setLoading(true);
      setErrorMessage('');

      const mountCard = async () => {
        try {
          // Generate UI texture
          const uiUrl = await generateUiTexture(isSealed, effectiveTier);
          if (cancelled) return;

          const backgroundUrl = resolveAssetUrl(
            card?.backgroundImage,
            customAssets?.background || '/forest_bg.jpg'
          );
          const characterUrl = resolveAssetUrl(
            card?.subjectImage,
            customAssets?.character || '/link_subject.png'
          );
          const structureUrl = resolveAssetUrl(
            card?.subjectImage,
            customAssets?.structure || '/link_subject.png'
          );
          const backUrl = resolveAssetUrl(
            card?.backLiningImage,
            customAssets?.back || '/back.png'
          );

          const assets: TcgCardAssets = {
            width: 1080,
            height: 1440,
            background: backgroundUrl,
            character: characterUrl,
            ui: uiUrl,
            structure: structureUrl,
            back: backUrl,
            ...customAssets,
          };

          const container = document.createElement('div');
          container.style.width = '100%';
          container.style.display = 'flex';
          container.style.justifyContent = 'center';
          container.style.alignItems = 'center';
          hostRef.current?.append(container);

          const initialParams: Partial<TcgHoloParameters> = {
            ...DEFAULT_TCG_PARAMETERS,
            rimColor: tierSpec.rimColor,
            structureLightMode: tierSpec.structureLightMode,
            isSealed,
            frostedBlur: isSealed ? 0.65 : 0.0,
            depth: isSealed ? 0.0 : 0.85,
            power: isSealed ? 0.0 : 1.05,
            ...initialParameters,
          };

          const handle = await mountTcgHoloCard(
            container,
            assets,
            initialParams,
            (err) => {
              if (!cancelled) {
                setErrorMessage(err.message);
                onError?.(err);
              }
            },
            (flipped) => {
              if (!cancelled) {
                onFlipChange?.(flipped);
              }
            },
            cardWidth
          );

          if (cancelled) {
            handle.dispose();
          } else {
            handleRef.current = handle;
            setLoading(false);
            onCardReady?.(handle);
          }
        } catch (err: any) {
          if (!cancelled) {
            const msg = String(err?.message || err);
            setErrorMessage(msg);
            setLoading(false);
            onError?.(err instanceof Error ? err : new Error(msg));
          }
        }
      };

      mountCard();

      return () => {
        cancelled = true;
        if (handleRef.current) {
          handleRef.current.dispose();
          handleRef.current = null;
        }
        if (hostRef.current) {
          hostRef.current.replaceChildren();
        }
      };
    }, [card?.id, cardWidth]);

    // Handle isSealed prop changes after mount
    useEffect(() => {
      if (!handleRef.current) return;
      const spec = CARD_RARITY_TIERS[effectiveTier] || CARD_RARITY_TIERS.rare;
      if (isSealed) {
        handleRef.current.setParameters({
          isSealed: true,
          frostedBlur: 0.65,
          depth: 0.0,
          power: 0.0,
        });
      } else {
        handleRef.current.setParameters({
          isSealed: false,
          frostedBlur: 0.0,
          depth: 0.85,
          power: 1.05,
          rimColor: spec.rimColor,
          structureLightMode: spec.structureLightMode,
        });
      }

      generateUiTexture(isSealed, effectiveTier).then((newUi) => {
        handleRef.current?.updateLayerTexture('ui', newUi);
      });
    }, [isSealed]);

    // Handle tier changes after mount
    useEffect(() => {
      if (!handleRef.current) return;
      const spec = CARD_RARITY_TIERS[effectiveTier] || CARD_RARITY_TIERS.rare;
      handleRef.current.setParameters({
        rimColor: spec.rimColor,
        structureLightMode: spec.structureLightMode,
      });
      generateUiTexture(isSealed, effectiveTier).then((newUi) => {
        handleRef.current?.updateLayerTexture('ui', newUi);
      });
    }, [effectiveTier]);

    if (Platform.OS !== 'web') {
      return (
        <View style={[styles.fallbackContainer, style]}>
          <Text style={styles.fallbackText}>3D Holographic Card (Web Only)</Text>
        </View>
      );
    }

    return (
      <View style={[styles.wrapper, style]}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#67E8F9" />
            <Text style={styles.loadingText}>加载 3D 全息卡片中...</Text>
          </View>
        )}
        <div ref={hostRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>渲染提示: {errorMessage}</Text>
          </View>
        ) : null}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderRadius: 16,
  },
  loadingText: {
    marginTop: 8,
    color: '#67E8F9',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  errorBox: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderWidth: 1,
    borderRadius: 8,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 11,
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0F172A',
    borderRadius: 16,
  },
  fallbackText: {
    color: '#94A3B8',
    fontSize: 13,
  },
});
