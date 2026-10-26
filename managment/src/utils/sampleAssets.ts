import { DEFAULT_LIFE_SEAL_META } from '../core/parameters';
import { renderLifeSealUiLayer } from './lifeSealUiRenderer';

export interface SampleCardBundle {
  size: [number, number];
  backgroundUrl: string;
  subjectUrl: string;
  uiUrl: string;
  structureUrl: string;
  backUrl: string;
}

export async function generateSampleCardBundleAsync(): Promise<SampleCardBundle> {
  const width = 1080;
  const height = 1440; // 3 : 4 标准卡片尺寸

  // 1. 生成富有层次的深色艺术背景 (background.png)
  const bgCanvas = document.createElement('canvas');
  bgCanvas.width = width;
  bgCanvas.height = height;
  const bgCtx = bgCanvas.getContext('2d')!;

  const grad = bgCtx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#131624');
  grad.addColorStop(0.45, '#1d1c2b');
  grad.addColorStop(0.8, '#141923');
  grad.addColorStop(1, '#0c0f17');
  bgCtx.fillStyle = grad;
  bgCtx.fillRect(0, 0, width, height);

  // 暖褐与暗金复古餐桌/街角光影色块（还原图 1 被封印的核心画面肌理感）
  const warmGlow = bgCtx.createRadialGradient(
    width * 0.52,
    height * 0.38,
    50,
    width * 0.52,
    height * 0.38,
    560
  );
  warmGlow.addColorStop(0, 'rgba(180, 125, 78, 0.42)');
  warmGlow.addColorStop(0.5, 'rgba(92, 68, 54, 0.28)');
  warmGlow.addColorStop(1, 'rgba(15, 23, 42, 0)');
  bgCtx.fillStyle = warmGlow;
  bgCtx.fillRect(0, 0, width, height);

  // 细微星尘与背景光斑
  for (let i = 0; i < 110; i++) {
    const sx = (Math.sin(i * 91.7) * 0.5 + 0.5) * width;
    const sy = (Math.cos(i * 53.3) * 0.5 + 0.5) * height;
    const r = (i % 4) + 1.2;
    bgCtx.fillStyle =
      i % 3 === 0
        ? `rgba(103, 232, 249, ${0.15 + (i % 5) * 0.06})`
        : `rgba(251, 191, 36, ${0.12 + (i % 4) * 0.05})`;
    bgCtx.beginPath();
    bgCtx.arc(sx, sy, r, 0, Math.PI * 2);
    bgCtx.fill();
  }

  // 2. 生成核心画面主体 (subject.png) + 3. 结构线发光遮罩 (structure.png)
  // 描绘充满奇遇感的便利店奇幻特饮瓶、冰块、柠檬片、木勺与漂浮星芒（绝不包含旧版顶部标题或底部黑框）
  const subCanvas = document.createElement('canvas');
  subCanvas.width = width;
  subCanvas.height = height;
  const subCtx = subCanvas.getContext('2d')!;

  const structCanvas = document.createElement('canvas');
  structCanvas.width = width;
  structCanvas.height = height;
  const stCtx = structCanvas.getContext('2d')!;

  const cx = width * 0.5;
  const cy = height * 0.41;

  // 绘制斜向木勺/魔杖与漂浮奇遇器皿
  const drawArtwork = (ctx: CanvasRenderingContext2D, isStruct: boolean) => {
    ctx.save();

    // 1) 斜向复古汤勺/调酒匙 (呼应图 1 画面中横跨的勺子造型)
    ctx.save();
    ctx.translate(cx + 30, cy - 35);
    ctx.rotate(0.42);
    ctx.beginPath();
    ctx.ellipse(-180, 0, 95, 58, 0, 0, Math.PI * 2);
    if (!isStruct) {
      const spoonGrad = ctx.createLinearGradient(-275, -58, -85, 58);
      spoonGrad.addColorStop(0, '#c08457');
      spoonGrad.addColorStop(0.5, '#8c583a');
      spoonGrad.addColorStop(1, '#523428');
      ctx.fillStyle = spoonGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.55)';
      ctx.lineWidth = 4;
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.stroke();
    }

    // 勺柄
    ctx.beginPath();
    ctx.moveTo(-85, -12);
    ctx.lineTo(290, -18);
    ctx.lineTo(290, 18);
    ctx.lineTo(-85, 12);
    ctx.closePath();
    if (!isStruct) {
      ctx.fillStyle = '#7c4d34';
      ctx.fill();
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.45)';
      ctx.lineWidth = 3.5;
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.stroke();
    }
    ctx.restore();

    // 2) 中央奇遇特饮玻璃瓶 (带棱面切光)
    ctx.save();
    ctx.translate(cx - 25, cy + 40);
    ctx.rotate(-0.15);
    ctx.beginPath();
    ctx.moveTo(-42, -210);
    ctx.lineTo(42, -210);
    ctx.lineTo(52, -135);
    ctx.quadraticCurveTo(135, -80, 130, 15);
    ctx.lineTo(120, 175);
    ctx.quadraticCurveTo(115, 220, 0, 220);
    ctx.quadraticCurveTo(-115, 220, -120, 175);
    ctx.lineTo(-130, 15);
    ctx.quadraticCurveTo(-135, -80, -52, -135);
    ctx.closePath();

    if (!isStruct) {
      const bottleGrad = ctx.createLinearGradient(-130, -210, 130, 220);
      bottleGrad.addColorStop(0, 'rgba(56, 189, 248, 0.72)');
      bottleGrad.addColorStop(0.45, 'rgba(168, 85, 247, 0.68)');
      bottleGrad.addColorStop(0.85, 'rgba(236, 72, 153, 0.65)');
      bottleGrad.addColorStop(1, 'rgba(245, 158, 11, 0.7)');
      ctx.fillStyle = bottleGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.78)';
      ctx.lineWidth = 5;
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 7;
      ctx.stroke();
    }

    // 瓶身内部几何折光切线与气泡
    ctx.beginPath();
    ctx.moveTo(-85, -30);
    ctx.lineTo(85, -30);
    ctx.moveTo(-95, 70);
    ctx.lineTo(95, 70);
    ctx.moveTo(0, -135);
    ctx.lineTo(0, 195);
    ctx.moveTo(-65, -75);
    ctx.lineTo(65, 145);
    ctx.moveTo(65, -75);
    ctx.lineTo(-65, 145);
    ctx.strokeStyle = isStruct ? '#ffffff' : 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = isStruct ? 5.5 : 3;
    ctx.stroke();
    ctx.restore();

    // 3) 漂浮的冰晶切块与柑橘切片轮廓
    const crystals = [
      { x: cx - 220, y: cy - 150, r: 68, rot: 0.3 },
      { x: cx + 235, y: cy - 120, r: 62, rot: -0.4 },
      { x: cx + 210, y: cy + 165, r: 74, rot: 0.55 },
      { x: cx - 210, y: cy + 175, r: 58, rot: -0.25 },
    ];

    for (const c of crystals) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = (k * Math.PI) / 3;
        const px = Math.cos(a) * c.r;
        const py = Math.sin(a) * c.r;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      if (!isStruct) {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.32)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.65)';
        ctx.lineWidth = 3.5;
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5.5;
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();
  };

  drawArtwork(subCtx, false);
  drawArtwork(stCtx, true);

  const uiUrl = await renderLifeSealUiLayer(
    DEFAULT_LIFE_SEAL_META,
    'pearl-blue',
    [width, height]
  );

  return {
    size: [width, height],
    backgroundUrl: '/forest_bg.jpg',
    subjectUrl: '/link_subject.png',
    uiUrl,
    structureUrl: '/link_subject.png',
    backUrl: '/back.png',
  };
}
