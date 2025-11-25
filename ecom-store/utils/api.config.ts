import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Đọc cấu hình từ environment variables (app.json extra)
const getEnvConfig = () => {
  const apiConfig = Constants.expoConfig?.extra?.apiConfig || {};
  return {
    // Preview URLs (cho preview build)
    PREVIEW_API_URL: apiConfig.previewUrl || process.env.EXPO_PUBLIC_PREVIEW_API_BASE_URL || null,
    PREVIEW_WS_URL: apiConfig.previewWsUrl || process.env.EXPO_PUBLIC_PREVIEW_WS_BASE_URL || null,
    // Development URLs
    DEV_API_URL: apiConfig.devApiUrl || process.env.EXPO_PUBLIC_DEV_API_BASE_URL || null,
    DEV_WS_URL: apiConfig.devWsUrl || process.env.EXPO_PUBLIC_DEV_WS_BASE_URL || null,
    // Development config (fallback)
    LOCAL_IP: apiConfig.localIp || process.env.EXPO_PUBLIC_LOCAL_IP || '192.168.1.100',
    PORT: apiConfig.port || process.env.EXPO_PUBLIC_PORT || '8080',
    API_PREFIX: apiConfig.apiPrefix || process.env.EXPO_PUBLIC_API_PREFIX || '/api/v1',
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
  // Preview API URL (cho preview build)
  if (PREVIEW_API_URL) {
    return PREVIEW_API_URL;
  }

  // Development API URL
  if (DEV_API_URL) {
    return DEV_API_URL;
  }

  // Development mode (fallback)
  if (__DEV__) {
    if (Platform.OS === 'android') {
      const expoIP = getExpoDevServerIP();
      if (expoIP) {
        return `http://${expoIP}:${PORT}${API_PREFIX}`;
      }
      return `http://10.0.2.2:${PORT}${API_PREFIX}`;
    } else if (Platform.OS === 'ios') {
      const expoIP = getExpoDevServerIP();
      if (expoIP) {
        return `http://${expoIP}:${PORT}${API_PREFIX}`;
      }
      return `http://localhost:${PORT}${API_PREFIX}`;
    }
  }

  // Fallback
  const expoIP = getExpoDevServerIP();
  return `http://${expoIP || LOCAL_IP}:${PORT}${API_PREFIX}`;
};

export const getWebSocketURL = (): string => {
  // Preview WS URL (cho preview build)
  if (PREVIEW_WS_URL) {
    return PREVIEW_WS_URL;
  }

  // Development WS URL
  if (DEV_WS_URL) {
    return DEV_WS_URL;
  }

  // Development mode (fallback)
  if (__DEV__) {
    if (Platform.OS === 'android') {
      const expoIP = getExpoDevServerIP();
      if (expoIP) {
        return `http://${expoIP}:${PORT}/ws`;
      }
      return `http://10.0.2.2:${PORT}/ws`;
    } else if (Platform.OS === 'ios') {
      const expoIP = getExpoDevServerIP();
      if (expoIP) {
        return `http://${expoIP}:${PORT}/ws`;
      }
      return `http://localhost:${PORT}/ws`;
    }
  }

  // Fallback
  const expoIP = getExpoDevServerIP();
  return `http://${expoIP || LOCAL_IP}:${PORT}/ws`;
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

