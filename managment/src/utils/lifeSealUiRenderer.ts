import type {
  CardAttributeCategory,
  LifeSealCardMeta,
  RimColorType,
  SectorButtonState,
  TagIconType,
} from '../core/types';
import type { BorderLayerConfig } from '../core/lifepackTypes';

export interface UiBorderRenderOptions {
  outerBorder?: BorderLayerConfig;
  innerBorder?: BorderLayerConfig;
}

/**
 * 获取 5 种流光边框配色的渐变色板
 */
function getRimPalette(rimColor: RimColorType): {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
} {
  switch (rimColor) {
    case 'pearl-blue':
      return {
        primary: '#67e8f9',
        secondary: '#60a5fa',
        accent: '#e879f9',
        glow: 'rgba(56, 189, 248, 0.65)',
      };
    case 'rainbow':
      return {
        primary: '#f472b6',
        secondary: '#facc15',
        accent: '#2dd4bf',
        glow: 'rgba(236, 72, 153, 0.65)',
      };
    case 'gold':
      return {
        primary: '#fef08a',
        secondary: '#f59e0b',
        accent: '#d97706',
        glow: 'rgba(245, 158, 11, 0.65)',
      };
    case 'purple':
      return {
        primary: '#e879f9',
        secondary: '#a855f7',
        accent: '#6366f1',
        glow: 'rgba(168, 85, 247, 0.65)',
      };
    case 'silver':
      return {
        primary: '#f8fafc',
        secondary: '#94a3b8',
        accent: '#cbd5e1',
        glow: 'rgba(203, 213, 225, 0.55)',
      };
  }
}

/**
 * 绘制图 2 的 6 大卡片属性专属矢量图标（食物 / 出行 / 社交 / 夜间 / 自我 / 情绪）及标签扩展图标
 */
export function drawCategoryVectorIcon(
  ctx: CanvasRenderingContext2D,
  type: CardAttributeCategory | TagIconType,
  cx: number,
  cy: number,
  size: number,
  color = '#ffffff'
) {
  ctx.save();
  ctx.translate(cx, cy);
  const s = size / 48; // 基准坐标系 -24..+24
  ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (type) {
    case 'food': {
      // 左侧叉子 (Fork)
      ctx.lineWidth = 3.2;
      // 叉柄
      ctx.beginPath();
      ctx.moveTo(-8, -2);
      ctx.lineTo(-8, 17);
      ctx.stroke();
      // 叉头三齿
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-12.5, -16);
      ctx.lineTo(-12.5, -5);
      ctx.quadraticCurveTo(-12.5, -1, -8, -1);
      ctx.quadraticCurveTo(-3.5, -1, -3.5, -5);
      ctx.lineTo(-3.5, -16);
      ctx.moveTo(-8, -16);
      ctx.lineTo(-8, -2);
      ctx.stroke();

      // 右侧勺子 (Spoon)
      ctx.beginPath();
      ctx.ellipse(8.5, -9.5, 5.2, 7.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(8.5, -2.5);
      ctx.lineTo(8.5, 17);
      ctx.stroke();
      break;
    }

    case 'travel': {
      // 图 2 款倾斜运动鞋 (Sneaker)
      ctx.rotate(-0.42);
      ctx.lineWidth = 2.8;
      // 鞋身轮廓
      ctx.beginPath();
      ctx.moveTo(-16, 6);
      ctx.lineTo(16, 6);
      ctx.quadraticCurveTo(19, 6, 18, 1);
      ctx.quadraticCurveTo(16, -4, 7, -5);
      ctx.lineTo(0, -12);
      ctx.quadraticCurveTo(-4, -13, -6, -7);
      ctx.quadraticCurveTo(-11, -6, -16, -9);
      ctx.quadraticCurveTo(-18, -3, -16, 6);
      ctx.closePath();
      ctx.fill();

      // 鞋底亮线与鞋带刻度
      ctx.strokeStyle = color === '#ffffff' ? '#1e293b' : '#ffffff';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-15, 2.8);
      ctx.lineTo(16, 2.8);
      ctx.stroke();

      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(4, -5);
      ctx.moveTo(3, -5.5);
      ctx.lineTo(7, -2.5);
      ctx.stroke();
      break;
    }

    case 'social': {
      // 图 2 款三人剪影 (Three People)
      // 左右后排两人
      for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(dir * 11.5, -5.5, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(dir * 5, 11);
        ctx.quadraticCurveTo(dir * 5, 1.5, dir * 11.5, 1.5);
        ctx.quadraticCurveTo(dir * 18, 1.5, dir * 18, 11);
        ctx.closePath();
        ctx.fill();
      }
      // 中央前排主人物（带描边分隔）
      ctx.beginPath();
      ctx.arc(0, -8, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-9.5, 13.5);
      ctx.quadraticCurveTo(-9.5, 0, 0, 0);
      ctx.quadraticCurveTo(9.5, 0, 9.5, 13.5);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'night': {
      // 图 2 款弯月与四角星 (Crescent Moon & Star)
      ctx.beginPath();
      ctx.arc(-2, 0, 14, 0.35 * Math.PI, 1.65 * Math.PI, false);
      ctx.arc(5, -2.5, 11.5, 1.52 * Math.PI, 0.48 * Math.PI, true);
      ctx.closePath();
      ctx.fill();

      // 右侧小四角星
      const sx = 10.5;
      const sy = -1.5;
      const sr = 4.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy - sr);
      ctx.quadraticCurveTo(sx, sy, sx + sr, sy);
      ctx.quadraticCurveTo(sx, sy, sx, sy + sr);
      ctx.quadraticCurveTo(sx, sy, sx - sr, sy);
      ctx.quadraticCurveTo(sx, sy, sx, sy - sr);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'self': {
      // 图 2 款双叶嫩芽 (Two Leaves)
      // 右侧主叶
      ctx.beginPath();
      ctx.moveTo(-1, 12);
      ctx.quadraticCurveTo(-3, -6, 9, -15);
      ctx.quadraticCurveTo(15, -1, -1, 12);
      ctx.closePath();
      ctx.fill();

      // 左侧副叶
      ctx.beginPath();
      ctx.moveTo(-2, 10);
      ctx.quadraticCurveTo(-15, 2, -11, -11);
      ctx.quadraticCurveTo(-1, -5, -2, 10);
      ctx.closePath();
      ctx.fill();

      // 根茎
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(-1.5, 9);
      ctx.lineTo(-3, 16);
      ctx.stroke();
      break;
    }

    case 'emotion': {
      // 图 2 款眨眼笑脸 (Expressive Face)
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.stroke();

      // 左眼 (弯月笑眼)
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(-5.5, -3.5, 3, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();

      // 右眼 (圆点/眨眼星芒)
      ctx.beginPath();
      ctx.arc(5.5, -3.5, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // 开口大笑嘴型
      ctx.beginPath();
      ctx.arc(0, 2, 7.5, 0.08 * Math.PI, 0.92 * Math.PI);
      ctx.closePath();
      ctx.stroke();
      break;
    }

    case 'door': {
      // 拱门/出门图标
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(-9, 13);
      ctx.lineTo(-9, -4);
      ctx.arc(0, -4, 9, Math.PI, 0, false);
      ctx.lineTo(9, 13);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'absurd': {
      // 戏剧/荒谬魔性面具或闪电花朵
      ctx.beginPath();
      ctx.arc(0, -1, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color === '#ffffff' ? '#1e293b' : '#ffffff';
      ctx.beginPath();
      ctx.arc(-4.5, -3, 2.2, 0, Math.PI * 2);
      ctx.arc(4.5, -3, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = color === '#ffffff' ? '#1e293b' : '#ffffff';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-5, 4);
      ctx.quadraticCurveTo(0, 8, 5, 3);
      ctx.stroke();
      break;
    }

    case 'sparkle':
    default: {
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.quadraticCurveTo(0, 0, 15, 0);
      ctx.quadraticCurveTo(0, 0, 0, 15);
      ctx.quadraticCurveTo(0, 0, -15, 0);
      ctx.quadraticCurveTo(0, 0, 0, -15);
      ctx.closePath();
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}

/**
 * 绘制圆角矩形辅助路径
 */
function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * 将图 1 设计的整套卡片属性与全息边框合成为高清 RGBA 图层 DataURL
 */
export async function renderLifeSealUiLayer(
  meta: LifeSealCardMeta,
  rimColor: RimColorType,
  size: [number, number] = [1080, 1440],
  customUiDataUrl?: string,
  borderOptions?: UiBorderRenderOptions
): Promise<string> {
  const [width, height] = size;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 如果用户上传了自定义底层 UI 图，先绘制在底层
  if (customUiDataUrl) {
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = customUiDataUrl;
    });
  }

  if (!meta.enableOverlay) {
    return canvas.toDataURL('image/png');
  }

  // 以 1080x1440 (3:4) 为设计基准坐标系进行自适应缩放
  const sx = width / 1080;
  const sy = height / 1440;
  const s = Math.min(sx, sy);

  const palette = getRimPalette(rimColor);

  ctx.save();

  // ============================================================================
  // 1. 绘制卡片四周外边框 (Outer Border) 与内边框 (Inner Border)
  // ============================================================================
  const outerCfg = borderOptions?.outerBorder;
  const innerCfg = borderOptions?.innerBorder;

  // 1.1 外边框 (Outer Border) 绘制
  if (outerCfg?.mode === 'IMAGE' && outerCfg.imageAssetUrl) {
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = outerCfg.imageAssetUrl!;
    });
  } else {
    const pad = (outerCfg?.offset ?? 22) * s;
    const outerR = Math.max(4, (outerCfg?.radius ?? 48) * s);
    const thick = Math.max(1, (outerCfg?.thickness ?? 10) * s);
    const glow = (outerCfg?.glowStrength ?? 18) * s;
    const color = outerCfg?.color;

    ctx.save();
    if (color) {
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = glow;
    } else {
      const borderGrad = ctx.createLinearGradient(0, 0, width, height);
      borderGrad.addColorStop(0, palette.primary);
      borderGrad.addColorStop(0.35, palette.secondary);
      borderGrad.addColorStop(0.7, palette.accent);
      borderGrad.addColorStop(1, palette.primary);
      ctx.strokeStyle = borderGrad;
      ctx.shadowColor = palette.glow;
      ctx.shadowBlur = glow;
    }
    ctx.lineWidth = thick;
    roundRectPath(ctx, pad, pad, width - pad * 2, height - pad * 2, outerR);
    ctx.stroke();
    ctx.restore();
  }

  // 1.2 内边框 (Inner Border) 绘制
  if (innerCfg?.mode === 'IMAGE' && innerCfg.imageAssetUrl) {
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = innerCfg.imageAssetUrl!;
    });
  } else {
    const outerPad = (outerCfg?.offset ?? 22) * s;
    const innerOffset = (innerCfg?.offset ?? 10) * s;
    const totalPad = outerPad + innerOffset;
    const outerRadiusVal = outerCfg?.radius ?? 48;
    const innerR = Math.max(
      2,
      (innerCfg?.radius ?? Math.max(4, outerRadiusVal - 8)) * s
    );
    const innerThick = Math.max(1, (innerCfg?.thickness ?? 2.5) * s);
    const innerGlow = (innerCfg?.glowStrength ?? 0) * s;
    const innerColor = innerCfg?.color || 'rgba(255, 255, 255, 0.78)';

    ctx.save();
    ctx.strokeStyle = innerColor;
    if (innerGlow > 0) {
      ctx.shadowColor = innerColor;
      ctx.shadowBlur = innerGlow;
    }
    ctx.lineWidth = innerThick;
    roundRectPath(
      ctx,
      totalPad,
      totalPad,
      width - totalPad * 2,
      height - totalPad * 2,
      innerR
    );
    ctx.stroke();
    ctx.restore();
  }

  // ============================================================================
  // 2. 左上角：属性徽章 (图 1 圆形发光渐变徽章 + 图 2 专属图标 + 下方属性文字)
  // ============================================================================
  const badgeX = 148 * sx;
  const badgeY = 142 * sy;
  const badgeR = 54 * s;

  ctx.save();
  // 外发光光晕根据卡片级别与属性色调融合
  if (meta.tier === 'common') {
    ctx.shadowColor = 'rgba(203, 213, 225, 0.75)';
  } else if (meta.tier === 'advanced') {
    ctx.shadowColor = 'rgba(245, 158, 11, 0.85)';
  } else {
    ctx.shadowColor = 'rgba(236, 72, 153, 0.75)';
  }
  ctx.shadowBlur = 24 * s;

  const badgeGrad = ctx.createLinearGradient(
    badgeX - badgeR,
    badgeY - badgeR,
    badgeX + badgeR,
    badgeY + badgeR
  );

  if (meta.tier === 'common') {
    // 普通级 (银灰基调)：冷银钛金底衬，带分类微调
    badgeGrad.addColorStop(0, '#64748b');
    badgeGrad.addColorStop(0.5, '#94a3b8');
    badgeGrad.addColorStop(1, '#cbd5e1');
  } else if (meta.tier === 'advanced') {
    // 高级 (流金基调)：香槟暖金至浓郁琥珀金
    badgeGrad.addColorStop(0, '#b45309');
    badgeGrad.addColorStop(0.5, '#f59e0b');
    badgeGrad.addColorStop(1, '#fde047');
  } else {
    // 稀有级 (珍珠蓝 / 图 1 同款)：还原图 1 标志性粉紫/冰青渐变
    if (meta.badgeCategory === 'food') {
      badgeGrad.addColorStop(0, '#a855f7');
      badgeGrad.addColorStop(0.5, '#ec4899');
      badgeGrad.addColorStop(1, '#f97316');
    } else if (meta.badgeCategory === 'travel') {
      badgeGrad.addColorStop(0, '#3b82f6');
      badgeGrad.addColorStop(0.5, '#06b6d4');
      badgeGrad.addColorStop(1, '#34d399');
    } else if (meta.badgeCategory === 'social') {
      badgeGrad.addColorStop(0, '#6366f1');
      badgeGrad.addColorStop(0.5, '#a855f7');
      badgeGrad.addColorStop(1, '#ec4899');
    } else if (meta.badgeCategory === 'night') {
      badgeGrad.addColorStop(0, '#1e1b4b');
      badgeGrad.addColorStop(0.5, '#4f46e5');
      badgeGrad.addColorStop(1, '#c084fc');
    } else if (meta.badgeCategory === 'self') {
      badgeGrad.addColorStop(0, '#059669');
      badgeGrad.addColorStop(0.5, '#10b981');
      badgeGrad.addColorStop(1, '#a3e635');
    } else {
      badgeGrad.addColorStop(0, '#f43f5e');
      badgeGrad.addColorStop(0.5, '#fb923c');
      badgeGrad.addColorStop(1, '#facc15');
    }
  }

  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
  ctx.fillStyle = badgeGrad;
  ctx.fill();

  // 徽章亮白/微金描边
  ctx.lineWidth = 3.5 * s;
  ctx.strokeStyle =
    meta.tier === 'advanced'
      ? 'rgba(254, 240, 138, 0.95)'
      : 'rgba(255, 255, 255, 0.95)';
  ctx.stroke();
  ctx.restore();

  // 绘制徽章内部矢量图标
  drawCategoryVectorIcon(ctx, meta.badgeCategory, badgeX, badgeY, 54 * s, '#ffffff');

  // 徽章下方文字 (如 "食物")
  if (meta.badgeCustomText) {
    ctx.save();
    ctx.font = `600 ${Math.round(32 * s)}px "Plus Jakarta Sans", "PingFang SC", "Microsoft YaHei", sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 10 * s;
    ctx.fillText(meta.badgeCustomText, badgeX, badgeY + badgeR + 40 * s);
    ctx.restore();
  }

  // ============================================================================
  // 3. 右上角：卡号标识 (#027)
  // ============================================================================
  if (meta.cardNumber) {
    ctx.save();
    ctx.font = `700 ${Math.round(44 * s)}px "Plus Jakarta Sans", system-ui, sans-serif`;
    ctx.fillStyle = 'rgba(248, 250, 252, 0.95)';
    ctx.textAlign = 'right';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 12 * s;
    ctx.fillText(meta.cardNumber, width - 86 * sx, 148 * sy);
    ctx.restore();
  }

  // ============================================================================
  // 4. 中央：封印纹样 (LIFE SEAL 星芒罗盘与棱镜几何徽记)
  // 需求 4：解封过后的卡片直接隐藏中央封印纹样，仅在封印状态且 showSealCrest 为 true 时显示
  // ============================================================================
  if (meta.showSealCrest && meta.sectorState === 'sealed') {
    const cx = width * 0.5;
    const cy = height * 0.375;
    const r = 86 * s;

    ctx.save();
    ctx.shadowColor = 'rgba(103, 232, 249, 0.6)';
    ctx.shadowBlur = 14 * s;

    // 外层纤细几何圆环
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.72)';
    ctx.lineWidth = 2.2 * s;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // 内部菱形连线
    ctx.strokeStyle = 'rgba(165, 243, 252, 0.45)';
    ctx.lineWidth = 1.6 * s;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 1.35);
    ctx.lineTo(cx + r * 0.85, cy);
    ctx.lineTo(cx, cy + r * 1.35);
    ctx.lineTo(cx - r * 0.85, cy);
    ctx.closePath();
    ctx.stroke();

    // 左右延伸水平细线
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.65)';
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 235 * s, cy);
    ctx.lineTo(cx - 125 * s, cy);
    ctx.moveTo(cx + 125 * s, cy);
    ctx.lineTo(cx + 235 * s, cy);
    ctx.stroke();

    // 上下棱镜长芒针 (复刻图 1 中央彩色折光棱镜针)
    const needleGrad = ctx.createLinearGradient(cx, cy - 135 * s, cx, cy + 135 * s);
    needleGrad.addColorStop(0, '#67e8f9');
    needleGrad.addColorStop(0.4, '#ffffff');
    needleGrad.addColorStop(0.6, '#c084fc');
    needleGrad.addColorStop(1, '#38bdf8');

    // 上芒针
    ctx.fillStyle = needleGrad;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 142 * s);
    ctx.lineTo(cx + 11 * s, cy - 28 * s);
    ctx.lineTo(cx, cy - 18 * s);
    ctx.lineTo(cx - 11 * s, cy - 28 * s);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5 * s;
    ctx.stroke();

    // 下芒针
    ctx.beginPath();
    ctx.moveTo(cx, cy + 142 * s);
    ctx.lineTo(cx + 11 * s, cy + 28 * s);
    ctx.lineTo(cx, cy + 18 * s);
    ctx.lineTo(cx - 11 * s, cy + 28 * s);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 中央 LIFE SEAL 英文标识
    ctx.font = `600 ${Math.round(28 * s)}px "Cinzel", "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = 'rgba(248, 250, 252, 0.94)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const spacedTitle = (meta.sealTitle || 'LIFE SEAL').split('').join(' ');
    ctx.fillText(spacedTitle, cx, cy);
    ctx.restore();
  }

  // ============================================================================
  // 5. 中下部偏左：任务信息 (今日奇遇 + 任务主文案 + 网感补刀)
  // ============================================================================
  const textLeftX = 88 * sx;
  let cursorY = 735 * sy;

  ctx.save();
  ctx.textAlign = 'left';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.92)';
  ctx.shadowBlur = 16 * s;
  ctx.shadowOffsetY = 3 * s;

  // 5.1 今日奇遇小标题
  if (meta.taskHeader) {
    ctx.font = `600 ${Math.round(35 * s)}px "Plus Jakarta Sans", "PingFang SC", "Microsoft YaHei", sans-serif`;
    ctx.fillStyle = 'rgba(241, 245, 249, 0.92)';
    ctx.fillText(meta.taskHeader, textLeftX, cursorY);
    cursorY += 66 * sy;
  }

  // 5.2 主任务内容 (支持多行)
  if (meta.taskMainText) {
    ctx.font = `700 ${Math.round(52 * s)}px "Plus Jakarta Sans", "PingFang SC", "Microsoft YaHei", sans-serif`;
    ctx.fillStyle = '#ffffff';
    const lines = meta.taskMainText.split('\n');
    for (const line of lines) {
      ctx.fillText(line, textLeftX, cursorY);
      cursorY += 72 * sy;
    }
  }

  // 5.3 网感补刀副文案
  if (meta.taskSubText) {
    cursorY += 10 * sy;
    ctx.font = `500 ${Math.round(32 * s)}px "Plus Jakarta Sans", "PingFang SC", "Microsoft YaHei", sans-serif`;
    ctx.fillStyle = 'rgba(203, 213, 225, 0.85)';
    ctx.fillText(meta.taskSubText, textLeftX, cursorY);
  }
  ctx.restore();

  // ============================================================================
  // 6. 左下排：属性标签胶囊组 (出门 / 社交 / 荒谬 4)
  // ============================================================================
  if (meta.tags && meta.tags.length > 0) {
    const pillY = 995 * sy;
    const pillH = 66 * s;
    let pillX = 88 * sx;

    ctx.save();
    ctx.font = `600 ${Math.round(28 * s)}px "Plus Jakarta Sans", "PingFang SC", "Microsoft YaHei", sans-serif`;

    for (const tag of meta.tags) {
      const starsCount = Math.min(5, Math.max(1, tag.stars || 3));
      const textWidth = ctx.measureText(tag.label).width;
      
      // 计算星级宽度
      const starFontSize = Math.round(18 * s);
      const starFont = `700 ${starFontSize}px "Plus Jakarta Sans", "PingFang SC", sans-serif`;
      ctx.save();
      ctx.font = starFont;
      const filledStars = '★'.repeat(starsCount);
      const emptyStars = '☆'.repeat(5 - starsCount);
      const filledWidth = ctx.measureText(filledStars).width;
      const emptyWidth = ctx.measureText(emptyStars).width;
      ctx.restore();

      const starsTotalWidth = filledWidth + emptyWidth + 8 * s;
      const pillW = Math.max(210 * s, 76 * s + textWidth + starsTotalWidth + 20 * s);

      // 毛玻璃深色胶囊底
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
      ctx.shadowBlur = 12 * s;
      ctx.fillStyle = 'rgba(30, 34, 46, 0.85)';
      roundRectPath(ctx, pillX, pillY, pillW, pillH, pillH / 2);
      ctx.fill();

      // 胶囊金属高光描边
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.55)';
      ctx.lineWidth = 2.2 * s;
      ctx.stroke();
      ctx.restore();

      // 胶囊左侧浅色圆形图标底托
      const iconCircleX = pillX + 36 * s;
      const iconCircleY = pillY + pillH / 2;
      ctx.beginPath();
      ctx.arc(iconCircleX, iconCircleY, 21 * s, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(241, 245, 249, 0.92)';
      ctx.fill();

      // 绘制深色小图标
      drawCategoryVectorIcon(ctx, tag.icon, iconCircleX, iconCircleY, 28 * s, '#1e293b');

      // 绘制胶囊右侧文字
      ctx.fillStyle = 'rgba(248, 250, 252, 0.95)';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.fillText(tag.label, pillX + 68 * s, iconCircleY + 1 * s);

      // 绘制 1~5 星星级评价
      const starStartX = pillX + 68 * s + textWidth + 8 * s;
      ctx.save();
      ctx.font = starFont;
      ctx.textBaseline = 'middle';
      // 金色实心星
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
      ctx.shadowBlur = 4 * s;
      ctx.fillText(filledStars, starStartX, iconCircleY + 1 * s);
      // 暗色空心星
      ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.shadowBlur = 0;
      ctx.fillText(emptyStars, starStartX + filledWidth, iconCircleY + 1 * s);
      ctx.restore();

      pillX += pillW + 20 * sx;
    }
    ctx.restore();
  }

  // ============================================================================
  // 7. 左下角：1/4 扇形状态按钮 (复刻图 1 左下角全息切角扇形「待兑现」按钮)
  // ============================================================================
  {
    const sectorOriginX = 22 * sx;
    const sectorOriginY = height - 22 * sy;
    const sectorR = 370 * s;

    ctx.save();
    // 构造左下角扇形裁剪区域
    ctx.beginPath();
    ctx.moveTo(sectorOriginX, sectorOriginY - sectorR * 0.86);
    ctx.quadraticCurveTo(
      sectorOriginX + sectorR * 0.82,
      sectorOriginY - sectorR * 0.78,
      sectorOriginX + sectorR * 0.95,
      sectorOriginY
    );
    ctx.lineTo(sectorOriginX + 36 * s, sectorOriginY);
    ctx.quadraticCurveTo(
      sectorOriginX,
      sectorOriginY,
      sectorOriginX,
      sectorOriginY - 36 * s
    );
    ctx.closePath();

    // 根据按钮状态填充全息星云渐变底纹
    const secGrad = ctx.createLinearGradient(
      sectorOriginX,
      sectorOriginY - sectorR,
      sectorOriginX + sectorR,
      sectorOriginY
    );
    // 根据卡片等级与当前状态（需求 2：仅保留「已封印」与「已兑现」）相得益彰地配置渐变底色
    const getSectorColors = (): [string, string, string] => {
      if (meta.tier === 'common') {
        // 普通级 (银灰色基底)
        switch (meta.sectorState) {
          case 'sealed':
            return ['rgba(30, 41, 59, 0.95)', 'rgba(15, 23, 42, 0.95)', 'rgba(71, 85, 105, 0.9)'];
          case 'redeemed':
          default:
            return ['rgba(148, 163, 184, 0.95)', 'rgba(52, 211, 153, 0.88)', 'rgba(241, 245, 249, 0.95)'];
        }
      } else if (meta.tier === 'advanced') {
        // 高级 (金色基底)
        switch (meta.sectorState) {
          case 'sealed':
            return ['rgba(69, 26, 3, 0.95)', 'rgba(120, 53, 15, 0.92)', 'rgba(30, 20, 10, 0.95)'];
          case 'redeemed':
          default:
            return ['rgba(245, 158, 11, 0.95)', 'rgba(16, 185, 129, 0.88)', 'rgba(254, 240, 138, 0.95)'];
        }
      } else {
        // 稀有级 (珍珠蓝基底 - 图 1 标志性配色)
        switch (meta.sectorState) {
          case 'sealed':
            return ['rgba(30, 27, 75, 0.95)', 'rgba(15, 23, 42, 0.95)', 'rgba(67, 56, 202, 0.9)'];
          case 'redeemed':
          default:
            return ['rgba(52, 211, 153, 0.9)', 'rgba(6, 182, 212, 0.88)', 'rgba(59, 130, 246, 0.9)'];
        }
      }
    };
    const [c1, c2, c3] = getSectorColors();
    secGrad.addColorStop(0, c1);
    secGrad.addColorStop(0.55, c2);
    secGrad.addColorStop(1, c3);

    ctx.shadowColor = palette.glow;
    ctx.shadowBlur = 22 * s;
    ctx.fillStyle = secGrad;
    ctx.fill();

    // 扇形外围双层流光弧线
    const secBorderGrad = ctx.createLinearGradient(
      sectorOriginX,
      sectorOriginY - sectorR,
      sectorOriginX + sectorR,
      sectorOriginY
    );
    secBorderGrad.addColorStop(0, palette.primary);
    secBorderGrad.addColorStop(0.5, palette.secondary);
    secBorderGrad.addColorStop(1, palette.accent);
    ctx.strokeStyle = secBorderGrad;
    ctx.lineWidth = 8 * s;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.lineWidth = 2.5 * s;
    ctx.stroke();

    // 外侧平行装饰细圆弧 (复刻图 1 扇形外缘的白色轨道线)
    ctx.beginPath();
    ctx.moveTo(sectorOriginX + 8 * s, sectorOriginY - sectorR * 0.92);
    ctx.quadraticCurveTo(
      sectorOriginX + sectorR * 0.88,
      sectorOriginY - sectorR * 0.84,
      sectorOriginX + sectorR * 1.02,
      sectorOriginY - 6 * s
    );
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.65)';
    ctx.lineWidth = 2.2 * s;
    ctx.stroke();

    // 扇形内部矢量图标 + 文字 ("已封印" / "已兑现")
    const btnCenterX = sectorOriginX + sectorR * 0.36;
    const btnCenterY = sectorOriginY - sectorR * 0.34;

    const btnIconType: CardAttributeCategory | TagIconType =
      meta.sectorState === 'redeemed' ? 'sparkle' : 'night';

    drawCategoryVectorIcon(ctx, btnIconType, btnCenterX, btnCenterY - 26 * s, 68 * s, '#ffffff');

    ctx.font = `700 ${Math.round(42 * s)}px "Plus Jakarta Sans", "PingFang SC", "Microsoft YaHei", sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(15, 23, 42, 0.75)';
    ctx.shadowBlur = 10 * s;
    ctx.fillText(
      meta.sectorCustomText || (meta.sectorState === 'sealed' ? '已封印' : '已兑现'),
      btnCenterX,
      btnCenterY + 52 * s
    );
    ctx.restore();
  }

  // ============================================================================
  // 8. 右下角：稀有度标识 (RARE · LIFE EVENT)
  // ============================================================================
  if (meta.rarityText) {
    ctx.save();
    ctx.font = `600 ${Math.round(25 * s)}px "Plus Jakarta Sans", system-ui, sans-serif`;
    ctx.fillStyle = 'rgba(226, 232, 240, 0.82)';
    ctx.textAlign = 'right';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 8 * s;
    const trackedRarity = meta.rarityText.split('').join(' ');
    ctx.fillText(trackedRarity, width - 82 * sx, height - 110 * sy);
    ctx.restore();
  }

  ctx.restore();
  return canvas.toDataURL('image/png');
}

/**
 * 绘制卡牌高精度纯净双层流光外框（用于 2D 解封纯平合图）
 */
function drawCleanBorder(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rimColor: RimColorType
) {
  const sx = width / 1080;
  const sy = height / 1440;
  const s = Math.min(sx, sy);
  const palette = getRimPalette(rimColor);
  const pad = 22 * s;
  const outerR = 48 * s;

  const borderGrad = ctx.createLinearGradient(0, 0, width, height);
  borderGrad.addColorStop(0, palette.primary);
  borderGrad.addColorStop(0.35, palette.secondary);
  borderGrad.addColorStop(0.7, palette.accent);
  borderGrad.addColorStop(1, palette.primary);

  ctx.save();
  ctx.shadowColor = palette.glow;
  ctx.shadowBlur = 18 * s;
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 10 * s;
  roundRectPath(ctx, pad, pad, width - pad * 2, height - pad * 2, outerR);
  ctx.stroke();

  // 内部高光细线框
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.78)';
  ctx.lineWidth = 2.5 * s;
  roundRectPath(
    ctx,
    pad + 10 * s,
    pad + 10 * s,
    width - (pad + 10 * s) * 2,
    height - (pad + 10 * s) * 2,
    outerR - 6 * s
  );
  ctx.stroke();
  ctx.restore();
}

/**
 * 需求 5：将全部图层无形变合并生成平整 2D 高清静态合图
 * 呈现效果：解封过后（清晰原画无磨砂）且取消奇遇封印卡 (LIFE SEAL) UI 遮挡
 */
export async function renderStaticFlatComposite(
  bgUrl: string,
  subjectUrl: string,
  _uiUrl: string,
  structureUrl: string,
  meta: LifeSealCardMeta,
  size: [number, number] = [1080, 1440],
  _frostedBlur = 0.0
): Promise<string> {
  const [w, h] = size;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const loadImg = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(img);
      img.src = url;
    });

  const [bgImg, subImg, structImg] = await Promise.all([
    loadImg(bgUrl),
    loadImg(subjectUrl),
    structureUrl ? loadImg(structureUrl) : null,
  ]);

  // 1. 绘制背景
  if (bgImg.complete && bgImg.naturalWidth > 0) {
    ctx.drawImage(bgImg, 0, 0, w, h);
  }

  // 2. 绘制主体画面（解封清晰态，无磨砂压暗）
  if (subImg.complete && subImg.naturalWidth > 0) {
    ctx.drawImage(subImg, 0, 0, w, h);
  }

  // 3. 专属等级结构线发光 (Screen 混合模式) - 解封后璀璨发光
  if (structImg && structImg.complete && structImg.naturalWidth > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    if (meta.tier === 'common') {
      ctx.globalAlpha = 0.55;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 14;
    } else if (meta.tier === 'advanced') {
      ctx.globalAlpha = 0.85;
      ctx.shadowColor = 'rgba(245, 158, 11, 0.95)';
      ctx.shadowBlur = 20;
    } else {
      ctx.globalAlpha = 0.95;
      ctx.shadowColor = 'rgba(56, 189, 248, 1.0)';
      ctx.shadowBlur = 26;
    }
    ctx.drawImage(structImg, 0, 0, w, h);
    ctx.restore();
  }

  // 4. 绘制纯净卡牌流光边框（需求 5：已取消奇遇封印卡 LIFE SEAL 文本与徽记遮挡，呈现纯粹解封原画收藏卡）
  const rimColor: RimColorType =
    meta.tier === 'common' ? 'silver' : meta.tier === 'advanced' ? 'gold' : 'pearl-blue';
  drawCleanBorder(ctx, w, h, rimColor);

  return canvas.toDataURL('image/png');
}

