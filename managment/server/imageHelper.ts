import fs from 'node:fs';

export interface ImageMetadata {
  width: number;
  height: number;
  hasAlpha: boolean;
  mimeType: string;
}

/**
 * 解析 PNG / JPEG 文件的真实尺寸与 Alpha 透明通道状态
 */
export function inspectImageFile(filePath: string): ImageMetadata {
  try {
    const buffer = fs.readFileSync(filePath);
    
    // 检查 PNG 魔数: 89 50 4E 47 0D 0A 1A 0A
    if (
      buffer.length >= 24 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      // IHDR chunk 从第 8 字节开始
      // 8..11: length (4 bytes)
      // 12..15: 'IHDR' (4 bytes)
      // 16..19: width (4 bytes big-endian)
      // 20..23: height (4 bytes big-endian)
      // 24: bit depth
      // 25: color type
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      const colorType = buffer.length > 25 ? buffer[25] : 6;
      
      // colorType: 4 (Gray+Alpha), 6 (RGBA), 3 (Indexed, 可能有 tRNS)
      let hasAlpha = colorType === 4 || colorType === 6;
      if (!hasAlpha && colorType === 3) {
        // 扫描是否存在 tRNS 块
        let offset = 8;
        while (offset + 8 < buffer.length) {
          const chunkLen = buffer.readUInt32BE(offset);
          const chunkType = buffer.toString('ascii', offset + 4, offset + 8);
          if (chunkType === 'tRNS') {
            hasAlpha = true;
            break;
          }
          if (chunkType === 'IEND') break;
          offset += 12 + chunkLen;
        }
      }

      return {
        width,
        height,
        hasAlpha,
        mimeType: 'image/png',
      };
    }

    // 检查 JPEG 魔数: FF D8
    if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xd8) {
      let offset = 2;
      let width = 0;
      let height = 0;

      while (offset + 4 < buffer.length) {
        if (buffer[offset] !== 0xff) {
          offset++;
          continue;
        }
        const marker = buffer[offset + 1];
        // SOF0 ~ SOF3, SOF5 ~ SOF7, SOF9 ~ SOF11, SOF13 ~ SOF15
        if (
          (marker >= 0xc0 && marker <= 0xc3) ||
          (marker >= 0xc5 && marker <= 0xc7) ||
          (marker >= 0xc9 && marker <= 0xcb) ||
          (marker >= 0xcd && marker <= 0xcf)
        ) {
          height = buffer.readUInt16BE(offset + 5);
          width = buffer.readUInt16BE(offset + 7);
          break;
        }
        const len = buffer.readUInt16BE(offset + 2);
        offset += 2 + len;
      }

      return {
        width: width || 1200,
        height: height || 1600,
        hasAlpha: false,
        mimeType: 'image/jpeg',
      };
    }

    // 默认回退
    return {
      width: 1200,
      height: 1600,
      hasAlpha: true,
      mimeType: 'image/png',
    };
  } catch (err) {
    console.error('inspectImageFile error:', err);
    return {
      width: 1200,
      height: 1600,
      hasAlpha: false,
      mimeType: 'application/octet-stream',
    };
  }
}
