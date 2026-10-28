/**
 * Polaroid Back Face Texture Generator
 * Dynamically draws an authentic Polaroid photo with handwritten notes,
 * date stamp, and gold wax seal onto an HTML5 Canvas, returning a high-res Data URL.
 */

export interface PolaroidData {
  photoUrl?: string;
  cardTitle: string;
  dateText: string;
  noteText: string;
  sealText?: string;
}

export async function renderPolaroidTexture(data: PolaroidData): Promise<string> {
  if (typeof document === 'undefined') {
    return '';
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1440;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const {
    photoUrl = '/forest_bg.jpg',
    cardTitle,
    dateText,
    noteText,
    sealText = '✦ 奇遇发生 ✦',
  } = data;

  // 1. Polaroid Paper Base (Warm off-white paper texture with vignette)
  ctx.fillStyle = '#F5F2EB';
  ctx.fillRect(0, 0, 1080, 1440);

  // Subtle paper grain gradient
  const paperGrad = ctx.createLinearGradient(0, 0, 1080, 1440);
  paperGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
  paperGrad.addColorStop(0.5, 'rgba(240, 235, 222, 0.4)');
  paperGrad.addColorStop(1, 'rgba(230, 222, 206, 0.6)');
  ctx.fillStyle = paperGrad;
  ctx.fillRect(0, 0, 1080, 1440);

  // 2. Photo Window (Classic Polaroid Proportions)
  const photoX = 84;
  const photoY = 84;
  const photoW = 1080 - 84 * 2; // 912
  const photoH = 920;

  // Photo window frame & shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#181E29';
  ctx.fillRect(photoX, photoY, photoW, photoH);
  ctx.restore();

  // Load & draw the lifestyle photo
  try {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = photoUrl;
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve; // Continue on fallback
    });

    if (img.width > 0 && img.height > 0) {
      // Cover fit
      const scale = Math.max(photoW / img.width, photoH / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const drawX = photoX + (photoW - drawW) / 2;
      const drawY = photoY + (photoH - drawH) / 2;

      ctx.save();
      ctx.beginPath();
      ctx.rect(photoX, photoY, photoW, photoH);
      ctx.clip();
      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // Subtle photo vignette overlay
      const vig = ctx.createRadialGradient(
        photoX + photoW / 2,
        photoY + photoH / 2,
        photoW * 0.3,
        photoX + photoW / 2,
        photoY + photoH / 2,
        photoW * 0.75
      );
      vig.addColorStop(0, 'transparent');
      vig.addColorStop(1, 'rgba(10, 15, 30, 0.35)');
      ctx.fillStyle = vig;
      ctx.fillRect(photoX, photoY, photoW, photoH);
      ctx.restore();
    }
  } catch (e) {
    console.warn('Failed to draw photo on polaroid', e);
  }

  // Photo inner rim stroke
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = 2;
  ctx.strokeRect(photoX, photoY, photoW, photoH);

  // 3. Polaroid Bottom Area (Handwritten mood notes & date)
  const bottomStartY = photoY + photoH + 50;

  // Date & Card Title Tag
  ctx.font = 'bold 32px "Courier New", monospace, sans-serif';
  ctx.fillStyle = '#6E675F';
  ctx.fillText(`${dateText}  ·  ${cardTitle}`, photoX + 10, bottomStartY + 10);

  // Decorative subtle line under date
  ctx.strokeStyle = 'rgba(156, 147, 132, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(photoX + 10, bottomStartY + 30);
  ctx.lineTo(photoX + photoW - 10, bottomStartY + 30);
  ctx.stroke();

  // Handwritten Mood Note
  ctx.font = '500 36px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#2A2520';

  // Word wrap note text
  const maxLineW = photoW - 180;
  const lineHeight = 56;
  const words = noteText.split('');
  let currentLine = '';
  let lineY = bottomStartY + 86;

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine + words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxLineW && i > 0) {
      ctx.fillText(currentLine, photoX + 10, lineY);
      currentLine = words[i];
      lineY += lineHeight;
      if (lineY > 1380) break; // Overflow protection
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    ctx.fillText(currentLine, photoX + 10, lineY);
  }

  // 4. Gold Seal / Stamp in bottom right corner
  const sealCenterX = photoX + photoW - 70;
  const sealCenterY = 1440 - 130;
  const sealRadius = 58;

  ctx.save();
  ctx.translate(sealCenterX, sealCenterY);
  ctx.rotate(-0.15); // Slight tilt

  // Golden wax seal circle
  ctx.beginPath();
  ctx.arc(0, 0, sealRadius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(217, 119, 6, 0.15)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(180, 83, 9, 0.75)';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Inner dashed circle
  ctx.beginPath();
  ctx.arc(0, 0, sealRadius - 7, 0, Math.PI * 2);
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = 'rgba(180, 83, 9, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Seal text
  ctx.setLineDash([]);
  ctx.font = 'bold 19px "PingFang SC", sans-serif';
  ctx.fillStyle = '#B45309';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(sealText, 0, 0);

  ctx.restore();

  return canvas.toDataURL('image/png', 0.95);
}
