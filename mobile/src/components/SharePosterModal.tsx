import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { CardDefinition } from '../types/card';
import { DoodleCat, DoodleSparkle } from './DoodleDeco';

interface SharePosterModalProps {
  visible: boolean;
  card: CardDefinition;
  userNote: string;
  recordDate: string;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const POSTER_WIDTH = Math.min(SCREEN_WIDTH * 0.88, 360);

export const SharePosterModal: React.FC<SharePosterModalProps> = ({
  visible,
  card,
  userNote,
  recordDate,
  onClose,
}) => {
  const [saving, setSaving] = useState(false);

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(style);
      } catch {}
    }
  };

  const handleDownload = async () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);

    try {
      if (Platform.OS === 'web') {
        // High-res canvas export for Web
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Background
        ctx.fillStyle = '#060C17';
        ctx.fillRect(0, 0, 1080, 1920);

        // Gradient glow
        const rad = ctx.createRadialGradient(540, 600, 100, 540, 600, 800);
        rad.addColorStop(0, 'rgba(103, 232, 249, 0.25)');
        rad.addColorStop(0.5, 'rgba(245, 158, 11, 0.15)');
        rad.addColorStop(1, 'transparent');
        ctx.fillStyle = rad;
        ctx.fillRect(0, 0, 1080, 1920);

        // Outer border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 4;
        ctx.strokeRect(40, 40, 1000, 1840);

        // Header Title
        ctx.font = 'bold 44px "PingFang SC", sans-serif';
        ctx.fillStyle = '#FAF7F2';
        ctx.textAlign = 'center';
        ctx.fillText('LIFE PACK · 奇遇收藏卡', 540, 140);

        ctx.font = '500 28px "PingFang SC", sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText(`${recordDate}  ·  独家珍藏`, 540, 200);

        // Card Artwork
        const cardImg = new window.Image();
        cardImg.crossOrigin = 'anonymous';
        cardImg.src = typeof card.previewImage === 'string' ? card.previewImage : (card.previewImage as any)?.uri || '/cards/album/card_01.png';
        await new Promise(r => { cardImg.onload = r; cardImg.onerror = r; });

        const cardX = 140;
        const cardY = 260;
        const cardW = 800;
        const cardH = 920;

        // Card Shadow & frame
        ctx.save();
        ctx.shadowColor = 'rgba(103, 232, 249, 0.4)';
        ctx.shadowBlur = 40;
        ctx.strokeStyle = '#FDE047';
        ctx.lineWidth = 6;
        ctx.strokeRect(cardX, cardY, cardW, cardH);
        ctx.restore();

        if (cardImg.width > 0) {
          ctx.drawImage(cardImg, cardX, cardY, cardW, cardH);
        }

        // Card Tag & Title Box
        ctx.fillStyle = 'rgba(10, 19, 36, 0.88)';
        ctx.fillRect(cardX, cardY + cardH - 120, cardW, 120);
        ctx.font = 'bold 40px "PingFang SC", sans-serif';
        ctx.fillStyle = '#FAF7F2';
        ctx.textAlign = 'left';
        ctx.fillText(`${card.cardCode || '#027'}  ${card.title}`, cardX + 30, cardY + cardH - 50);

        // Mood Quote Section
        const noteY = 1260;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(140, noteY, 800, 380, 24);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 32px "PingFang SC", sans-serif';
        ctx.fillStyle = '#FDE047';
        ctx.fillText('✦ 随手日记 · 真实心境 ✦', 180, noteY + 60);

        ctx.font = '500 32px "PingFang SC", sans-serif';
        ctx.fillStyle = '#FAF7F2';
        const quoteText = userNote || card.quote || '在星光下，把所有的烦恼都变成星星。';
        // Wrap text
        let cur = '';
        let lineIdx = 0;
        for (let ch of quoteText) {
          if (ctx.measureText(cur + ch).width > 700) {
            ctx.fillText(cur, 180, noteY + 130 + lineIdx * 54);
            cur = ch;
            lineIdx++;
          } else {
            cur += ch;
          }
        }
        if (cur) {
          ctx.fillText(cur, 180, noteY + 130 + lineIdx * 54);
        }

        // Footer
        ctx.font = 'bold 30px "PingFang SC", sans-serif';
        ctx.fillStyle = '#64748B';
        ctx.textAlign = 'center';
        ctx.fillText('LIFE PACK · 让生活成为一种收藏', 540, 1780);

        // Trigger download
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `lifepack-${card.cardCode || 'card'}-${Date.now()}.png`;
        a.click();

        Alert.alert('已保存海报', '精致分享海报已生成并下载到您的本地！');
      } else {
        Alert.alert('海报生成', '海报已准备就绪，可截图或分享给好友！');
      }
    } catch (e) {
      console.warn('Share poster export failed', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBody}>
          {/* Top Close Button */}
          <TouchableOpacity style={styles.floatingCloseBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.floatingCloseText}>✕</Text>
          </TouchableOpacity>

          {/* Poster Visual Preview */}
          <View style={styles.posterContainer}>
            {/* Header */}
            <View style={styles.posterHeader}>
              <View style={styles.brandRow}>
                <View style={styles.brandBubble}>
                  <Text style={styles.brandBubbleText}>LIFE PACK</Text>
                </View>
                <Text style={styles.headerTagText}>奇遇纪念卡</Text>
              </View>
              <Text style={styles.headerDateText}>{recordDate}</Text>
            </View>

            {/* Central Card Visual */}
            <View style={styles.cardPreviewBox}>
              <Image
                source={card.previewImage || require('../../assets/cards/album/card_01.png')}
                style={styles.cardPreviewImage}
                contentFit="cover"
              />
              <View style={styles.cardMetaBar}>
                <Text style={styles.cardCodePill}>{card.cardCode || '#027'}</Text>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <View style={styles.rarityPill}>
                  <Text style={styles.rarityText}>{card.rarityTag || 'UR'}</Text>
                </View>
              </View>
            </View>

            {/* Mood Note Section */}
            <View style={styles.noteSection}>
              <View style={styles.noteTitleRow}>
                <DoodleSparkle size={14} color="#FDE047" />
                <Text style={styles.noteSectionTitle}>随手记录 · 今日心境</Text>
              </View>
              <Text style={styles.noteContentText} numberOfLines={3}>
                {userNote || card.quote || '在星光下，把所有的烦恼都变成星星。今天走了一条没走过的小路。'}
              </Text>
            </View>

            {/* Poster Footer */}
            <View style={styles.posterFooter}>
              <View style={styles.footerLeft}>
                <DoodleCat size={22} color="#CBD5E1" />
                <Text style={styles.footerBrandText}>LIFE PACK</Text>
              </View>
              <Text style={styles.footerSloganText}>让生活成为一种收藏 ✧</Text>
            </View>
          </View>

          {/* Bottom Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.downloadBtn}
              onPress={handleDownload}
              activeOpacity={0.85}
              disabled={saving}
            >
              <Text style={styles.downloadBtnText}>
                {saving ? '正在导出...' : '✦ 保存海报到相册'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 20, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 100,
  },
  modalBody: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  floatingCloseBtn: {
    position: 'absolute',
    top: -46,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 10,
  },
  floatingCloseText: {
    color: '#FAF7F2',
    fontSize: 16,
    fontWeight: '700',
  },
  posterContainer: {
    width: POSTER_WIDTH,
    backgroundColor: '#091224',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(103, 232, 249, 0.35)',
    padding: 18,
    shadowColor: '#67E8F9',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 26,
    elevation: 12,
  },
  posterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#FAF7F2',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  brandBubbleText: {
    color: '#FAF7F2',
    fontSize: 9.5,
    fontWeight: '800',
  },
  headerTagText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
  },
  headerDateText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  cardPreviewBox: {
    width: '100%',
    height: Math.round(POSTER_WIDTH * 0.95),
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(253, 224, 71, 0.65)',
    backgroundColor: '#0F172A',
    position: 'relative',
    shadowColor: '#FDE047',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  cardPreviewImage: {
    width: '100%',
    height: '100%',
  },
  cardMetaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(9, 18, 36, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardCodePill: {
    color: '#FDE047',
    fontSize: 12,
    fontWeight: '800',
  },
  cardTitle: {
    color: '#FAF7F2',
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
    marginLeft: 8,
  },
  rarityPill: {
    backgroundColor: '#F59E0B',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rarityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  noteSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
  },
  noteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  noteSectionTitle: {
    color: '#FDE047',
    fontSize: 12,
    fontWeight: '700',
  },
  noteContentText: {
    color: '#E2E8F0',
    fontSize: 12.5,
    lineHeight: 18,
  },
  posterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerBrandText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '800',
  },
  footerSloganText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  actionRow: {
    marginTop: 16,
    width: POSTER_WIDTH,
  },
  downloadBtn: {
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
  },
  downloadBtnText: {
    color: '#18181B',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
