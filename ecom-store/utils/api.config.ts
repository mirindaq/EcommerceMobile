import Constants from 'expo-constants';
import { Platform } from 'react-native';

const LOCAL_IP = '192.168.1.100';
const PORT = '8080';
const API_PREFIX = '/api/v1';
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

  const expoIP = getExpoDevServerIP();
  return `http://${expoIP || LOCAL_IP}:${PORT}${API_PREFIX}`;
};

export const API_BASE_URL = getBaseURL();

if (__DEV__) {
  console.log('=== API Configuration ===');
  console.log('Platform:', Platform.OS);
  console.log('API Base URL:', API_BASE_URL);
  console.log('Expo Dev Server IP:', getExpoDevServerIP() || 'Not detected');
  console.log('Fallback IP:', LOCAL_IP);
  console.log('========================');
}

