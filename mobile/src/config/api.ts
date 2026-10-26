import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEY_API_BASE = 'lifepack_api_base_url_v1';

// 默认本地后端开发地址（Web 下 localhost，真机/模拟器可动态配置或连接宝塔服务器）
const DEFAULT_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001';

let cachedBaseUrl: string = DEFAULT_HOST;

export async function getApiBaseUrl(): Promise<string> {
  try {
    const custom = await AsyncStorage.getItem(STORAGE_KEY_API_BASE);
    if (custom && custom.trim().length > 0) {
      cachedBaseUrl = custom.trim().replace(/\/+$/, '');
      return cachedBaseUrl;
    }
  } catch {
    // ignore
  }
  return cachedBaseUrl;
}

export async function setApiBaseUrl(newUrl: string): Promise<void> {
  cachedBaseUrl = newUrl.trim().replace(/\/+$/, '');
  await AsyncStorage.setItem(STORAGE_KEY_API_BASE, cachedBaseUrl);
}

export function getSyncApiBaseUrl(): string {
  return cachedBaseUrl;
}

/**
 * 将后端返回的相对路径（如 /uploads/xxx.png 或 /forest_bg.jpg）解析为完整可访问 URL
 */
export function resolveAssetUrl(urlOrPath?: string): string | undefined {
  if (!urlOrPath) return undefined;
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://') || urlOrPath.startsWith('data:')) {
    return urlOrPath;
  }
  const cleanPath = urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`;
  return `${cachedBaseUrl}${cleanPath}`;
}
