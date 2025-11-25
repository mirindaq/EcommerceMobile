import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Đọc cấu hình từ environment variables (app.json extra)
// Giá trị mặc định từ app.json
const DEFAULT_CONFIG = {
  localIp: '192.168.1.100',
  port: '8080',
  apiPrefix: '/api/v1',
  timeout: 10000,
  previewUrl: 'https://api.mirindaq-dev.shop/api/v1',
  previewWsUrl: 'https://api.mirindaq-dev.shop/ws',
  devApiUrl: 'http://192.168.1.100:8080/api/v1',
  devWsUrl: 'http://192.168.1.100:8080/ws',
};

const getEnvConfig = () => {
  const apiConfig = Constants.expoConfig?.extra?.apiConfig || {};
  return {
    // Preview URLs (cho preview build) - ưu tiên: app.json > env > default
    PREVIEW_API_URL: apiConfig.previewUrl || process.env.EXPO_PUBLIC_PREVIEW_API_BASE_URL || DEFAULT_CONFIG.previewUrl,
    PREVIEW_WS_URL: apiConfig.previewWsUrl || process.env.EXPO_PUBLIC_PREVIEW_WS_BASE_URL || DEFAULT_CONFIG.previewWsUrl,
    // Development URLs - ưu tiên: app.json > env > default
    DEV_API_URL: apiConfig.devApiUrl || process.env.EXPO_PUBLIC_DEV_API_BASE_URL || DEFAULT_CONFIG.devApiUrl,
    DEV_WS_URL: apiConfig.devWsUrl || process.env.EXPO_PUBLIC_DEV_WS_BASE_URL || DEFAULT_CONFIG.devWsUrl,
    // Development config - ưu tiên: app.json > env > default
    LOCAL_IP: apiConfig.localIp || process.env.EXPO_PUBLIC_LOCAL_IP || DEFAULT_CONFIG.localIp,
    PORT: apiConfig.port || process.env.EXPO_PUBLIC_PORT || DEFAULT_CONFIG.port,
    API_PREFIX: apiConfig.apiPrefix || process.env.EXPO_PUBLIC_API_PREFIX || DEFAULT_CONFIG.apiPrefix,
  };
};

const { PREVIEW_API_URL, PREVIEW_WS_URL, DEV_API_URL, DEV_WS_URL, LOCAL_IP, PORT, API_PREFIX } = getEnvConfig();
const getExpoDevServerIP = (): string | null => {
  try {
    const hostUri = Constants.expoConfig?.hostUri || Constants.expoConfig?.extra?.hostUri;

    if (hostUri) {
      const match = hostUri.match(/^(\d+\.\d+\.\d+\.\d+)/);
      if (match && match[1]) {
        return match[1];
      }

      if (hostUri.includes('localhost') || hostUri.includes('127.0.0.1')) {
        return null;
      }
    }

    const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
    if (debuggerHost && !debuggerHost.includes('localhost') && !debuggerHost.includes('127.0.0.1')) {
      return debuggerHost;
    }
  } catch (error) {
    console.warn('Could not get IP from Expo:', error);
  }

  return null;
};

export const getBaseURL = (): string => {
  // Luôn sử dụng https://api.mirindaq-dev.shop/api/v1 cho cả dev và preview
  // Thêm /api/v1 vì các endpoint trong services không có prefix này
  return 'https://api.mirindaq-dev.shop/api/v1';
};

export const getWebSocketURL = (): string => {
  // Luôn sử dụng https://api.mirindaq-dev.shop/ws cho cả dev và preview
  return 'https://api.mirindaq-dev.shop/ws';
};

export const API_BASE_URL = getBaseURL();
export const WS_BASE_URL = getWebSocketURL();

if (__DEV__) {
  console.log('=== API Configuration ===');
  console.log('Platform:', Platform.OS);
  console.log('API Base URL:', API_BASE_URL);
  console.log('WebSocket Base URL:', WS_BASE_URL);
  console.log('Expo Dev Server IP:', getExpoDevServerIP() || 'Not detected');
  console.log('Fallback IP:', LOCAL_IP);
  console.log('========================');
}

