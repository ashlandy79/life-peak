export function getImageDimensions(src: string | File): Promise<[number, number]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const url = typeof src === 'string' ? src : URL.createObjectURL(src);
    img.onload = () => {
      resolve([img.naturalWidth, img.naturalHeight]);
      if (typeof src !== 'string') URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      reject(new Error('无法读取图像尺寸'));
      if (typeof src !== 'string') URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('文件转 DataURL 失败'));
    reader.readAsDataURL(file);
  });
}

export async function urlToBlob(url: string): Promise<Blob> {
  const res = await fetch(url);
  return await res.blob();
}

function loadImgElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图像加载失败'));
    img.src = src;
  });
}

/**
 * 生成指定尺寸的全透明 PNG DataURL（当可选的 UI 层或遮罩层未提供时作为占位纹理）
 */
export function createEmptyTransparentDataUrl(width = 64, height = 64): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas.toDataURL('image/png');
}

/**
 * 从主体图层 (subject.png) 自动提取高精度结构发光线条遮罩 (structure.png)
 * 输出符合 holo-card-main 规范的：RGB 全白 (255,255,255)，Alpha 为结构线条强度的 RGBA 贴图
 */
export async function generateStructureMaskFromSubject(
  subjectUrl: string,
  targetSize?: [number, number]
): Promise<string> {
  const img = await loadImgElement(subjectUrl);
  const w = targetSize ? targetSize[0] : img.naturalWidth;
  const h = targetSize ? targetSize[1] : img.naturalHeight;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);

  const imgData = ctx.getImageData(0, 0, w, h);
  const src = imgData.data;

  // 计算灰度亮度与 Alpha
  const lum = new Float32Array(w * h);
  const alpha = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const idx = i * 4;
    lum[i] = (0.2126 * src[idx] + 0.7152 * src[idx + 1] + 0.0722 * src[idx + 2]) / 255;
    alpha[i] = src[idx + 3] / 255;
  }

  const outData = ctx.createImageData(w, h);
  const dst = outData.data;

  // Sobel 算子提取内部结构线条 + Alpha 轮廓内发光边缘
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const a = alpha[i];
      if (a < 0.08) continue;

      // 内部亮度梯度 (Sobel)
      const gx =
        -lum[(y - 1) * w + (x - 1)] +
        lum[(y - 1) * w + (x + 1)] -
        2 * lum[y * w + (x - 1)] +
        2 * lum[y * w + (x + 1)] -
        lum[(y + 1) * w + (x - 1)] +
        lum[(y + 1) * w + (x + 1)];

      const gy =
        -lum[(y - 1) * w + (x - 1)] -
        2 * lum[(y - 1) * w + x] -
        lum[(y - 1) * w + (x + 1)] +
        lum[(y + 1) * w + (x - 1)] +
        2 * lum[(y + 1) * w + x] +
        lum[(y + 1) * w + (x + 1)];

      const grad = Math.hypot(gx, gy);

      // Alpha 轮廓梯度（剪影边缘流光）
      const minNeighborAlpha = Math.min(
        alpha[(y - 1) * w + x],
        alpha[(y + 1) * w + x],
        alpha[y * w + (x - 1)],
        alpha[y * w + (x + 1)]
      );
      const silhouetteEdge = Math.max(0, a - minNeighborAlpha) * 2.2;

      // 综合内部结构线条与外轮廓线，并按 native.py LUT 思路增强对比度
      const rawLine = Math.max(grad * 1.65 * minNeighborAlpha, silhouetteEdge);
      const lineAlpha = Math.max(0, Math.min(1, (rawLine - 0.14) / 0.55)) * a;

      const idx = i * 4;
      dst[idx] = 255;
      dst[idx + 1] = 255;
      dst[idx + 2] = 255;
      dst[idx + 3] = Math.round(lineAlpha * 255);
    }
  }

  ctx.putImageData(outData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * 将用户上传的 structure.png（支持黑底白线灰度图或透明通道线条图）标准化为
 * holo-card-main 渲染器所需的白底 + Alpha 线条图（严格复刻 native.py 的 LUT 与角色 Alpha 乘法）
 */
export async function normalizeStructureLayer(
  structureUrl: string,
  subjectUrl: string,
  targetSize: [number, number]
): Promise<string> {
  const [structImg, subjImg] = await Promise.all([
    loadImgElement(structureUrl),
    loadImgElement(subjectUrl),
  ]);

  const [w, h] = targetSize;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // 读取角色 Alpha
  ctx.drawImage(subjImg, 0, 0, w, h);
  const subjData = ctx.getImageData(0, 0, w, h).data;

  // 读取结构图
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(structImg, 0, 0, w, h);
  const structData = ctx.getImageData(0, 0, w, h);
  const s = structData.data;

  // 判断上传的 structure 是否已经是带透明通道的线条图
  let hasTransparency = false;
  for (let i = 3; i < s.length; i += 16) {
    if (s[i] < 245) {
      hasTransparency = true;
      break;
    }
  }

  for (let i = 0; i < w * h; i++) {
    const idx = i * 4;
    const charAlpha = subjData[idx + 3] / 255;
    let lineMask: number;

    if (hasTransparency) {
      lineMask = s[idx + 3] / 255;
    } else {
      // 黑底白线图：按 native.py 公式 lut = clamp((v - 24) / 207, 0, 1)
      const v = 0.299 * s[idx] + 0.587 * s[idx + 1] + 0.114 * s[idx + 2];
      lineMask = Math.max(0, Math.min(1, (v - 24) / 207));
    }

    s[idx] = 255;
    s[idx + 1] = 255;
    s[idx + 2] = 255;
    s[idx + 3] = Math.round(lineMask * charAlpha * 255);
  }

  ctx.putImageData(structData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * 源自 holo-card-main/matte_regions.py 的本地边缘连通域背景/棋盘格净化工具
 * 从图像四边种子出发，自动识别并剔除灰白棋盘格或纯色背景，保留主体内部高光与细节
 */
export async function removeCheckerboardMatte(imageUrl: string): Promise<string> {
  const img = await loadImgElement(imageUrl);
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;

  // 采样四角与边缘颜色分布，识别低饱和度的灰白棋盘格或背景色
  const isCandidateMatte = (idx: number): boolean => {
    const r = d[idx];
    const g = d[idx + 1];
    const b = d[idx + 2];
    const a = d[idx + 3];
    if (a < 16) return true;
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const sat = maxC === 0 ? 0 : (maxC - minC) / maxC;
    // 典型棋盘格/浅灰白底：低饱和度且亮度在 150~255 之间
    return sat < 0.12 && maxC >= 145;
  };

  const visited = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0;
  let tail = 0;

  const pushSeed = (x: number, y: number) => {
    const pos = y * w + x;
    if (!visited[pos] && isCandidateMatte(pos * 4)) {
      visited[pos] = 1;
      queue[tail++] = pos;
    }
  };

  for (let x = 0; x < w; x++) {
    pushSeed(x, 0);
    pushSeed(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    pushSeed(0, y);
    pushSeed(w - 1, y);
  }

  // 广度优先洪水填充连接外部背景区域
  while (head < tail) {
    const curr = queue[head++];
    const cx = curr % w;
    const cy = (curr - cx) / w;

    const neighbors = [
      [cx - 1, cy],
      [cx + 1, cy],
      [cx, cy - 1],
      [cx, cy + 1],
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const npos = ny * w + nx;
        if (!visited[npos] && isCandidateMatte(npos * 4)) {
          visited[npos] = 1;
          queue[tail++] = npos;
        }
      }
    }
  }

  // 将标记为背景的像素设为透明，并对邻接边缘做 1px 柔和羽化
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pos = y * w + x;
      if (visited[pos]) {
        d[pos * 4 + 3] = 0;
      } else if (x > 0 && x < w - 1 && y > 0 && y < h - 1) {
        const bgNeighbors =
          visited[pos - 1] +
          visited[pos + 1] +
          visited[pos - w] +
          visited[pos + w];
        if (bgNeighbors > 0) {
          d[pos * 4 + 3] = Math.round(d[pos * 4 + 3] * (1 - bgNeighbors * 0.18));
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}

