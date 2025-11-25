
import { authService } from '@/services/auth.service';
import { API_BASE_URL } from '@/utils/api.config';
import AuthStorageUtil from '@/utils/authStorage.util';
import axios from 'axios';
import { router } from 'expo-router';
import Constants from 'expo-constants';

// Đọc timeout từ environment variables
const getTimeout = (): number => {
  const apiConfig = Constants.expoConfig?.extra?.apiConfig || {};
  const timeout = apiConfig.timeout || process.env.EXPO_PUBLIC_API_TIMEOUT;
  return timeout ? parseInt(String(timeout), 10) : 10000;
};


const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: getTimeout(),
});

axiosClient.interceptors.request.use(
  async (config) => {
    console.log('API_BASE_URL:', API_BASE_URL);
    const token = await AuthStorageUtil.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest._skipAuthInterceptor) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await authService.refreshToken();
        const { accessToken, refreshToken: newRefreshToken } = (response.data as any).data;

        await AuthStorageUtil.setTokens({
          accessToken,
          refreshToken: newRefreshToken,
        });

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await AuthStorageUtil.clearAll();

        try {
          await authService.logout();
        } catch (logoutError) {
          console.log('Logout failed:', logoutError);
        }

        router.replace('/login');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    } else if (error.response?.status === 401) {
      await AuthStorageUtil.clearAll();

      try {
        await authService.logout();
      } catch (logoutError) {
        console.log('Logout failed:', logoutError);
      }

      router.replace('/login');
      return Promise.reject(error);
    }

    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response.data,
      });

      if (error.response.status === 403) {
        console.error('Không có quyền truy cập');
      } else if (error.response.status === 500) {
        console.error('Lỗi server, vui lòng thử lại sau');
        console.error('Error details:', error.response.data);
      }
      
      return Promise.reject(error.response.data || error.response);
    }
    
    if (error.request) {
      const fullUrl = `${error.config?.baseURL || ''}${error.config?.url || ''}`;
      console.error('❌ Network Error - No response received:', {
        method: error.config?.method,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: fullUrl,
        message: error.message,
        code: error.code,
      });
      console.error('💡 Check if:');
      console.error('  1. Server is running at:', error.config?.baseURL);
      console.error('  2. Network connection is available');
      console.error('  3. CORS is configured correctly');
    } else {
      console.error('Request Error:', error.message);
    }
    
    throw error;
  }
);

export default axiosClient;

