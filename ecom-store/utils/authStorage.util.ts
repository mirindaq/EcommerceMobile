/**
 * Utility để quản lý việc lưu trữ authentication data
 * Sử dụng expo-secure-store cho React Native
 */

import * as SecureStore from 'expo-secure-store';

export interface TokenData {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  roles?: string[];
  rank?: any;
  totalSpending?: number;
  // Thêm các field khác tùy theo API
  [key: string]: any;
}

class AuthStorageUtil {
  // Keys cho secure store
  private static readonly ACCESS_TOKEN_KEY = 'accessToken';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private static readonly USER_DATA_KEY = 'userData';

  /**
   * Lưu access token vào secure store
   */
  static async setAccessToken(accessToken: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.ACCESS_TOKEN_KEY, accessToken);
    } catch (error) {
      console.error('Error saving access token:', error);
      throw error;
    }
  }

  /**
   * Lấy access token từ secure store
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  /**
   * Lưu refresh token vào secure store
   */
  static async setRefreshToken(refreshToken: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error('Error saving refresh token:', error);
      throw error;
    }
  }

  /**
   * Lấy refresh token từ secure store
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * Xóa refresh token khỏi secure store
   */
  static async removeRefreshToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error removing refresh token:', error);
    }
  }

  /**
   * Lưu thông tin user vào secure store
   */
  static async setUserData(userData: UserProfile): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        this.USER_DATA_KEY,
        JSON.stringify(userData)
      );
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin user từ secure store
   */
  static async getUserData(): Promise<UserProfile | null> {
    try {
      const userDataString = await SecureStore.getItemAsync(this.USER_DATA_KEY);
      if (!userDataString) return null;
      return JSON.parse(userDataString) as UserProfile;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Lưu cả tokens và user data
   */
  static async setTokensAndData(
    tokens: TokenData,
    userData: UserProfile
  ): Promise<void> {
    await this.setAccessToken(tokens.accessToken);
    await this.setRefreshToken(tokens.refreshToken);
    await this.setUserData(userData);
  }

  /**
   * Lưu cả access token và refresh token
   */
  static async setTokens(tokens: TokenData): Promise<void> {
    await this.setAccessToken(tokens.accessToken);
    await this.setRefreshToken(tokens.refreshToken);
  }

  /**
   * Lấy cả access token và refresh token
   */
  static async getTokens(): Promise<TokenData | null> {
    const accessToken = await this.getAccessToken();
    const refreshToken = await this.getRefreshToken();

    if (!accessToken || !refreshToken) {
      return null;
    }

    return { accessToken, refreshToken };
  }

  /**
   * Cập nhật tokens mới (xóa cũ và lưu mới)
   */
  static async updateTokens(tokens: TokenData): Promise<void> {
    await this.setTokens(tokens);
  }

  /**
   * Xóa tất cả dữ liệu authentication
   */
  static async clearAll(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(this.ACCESS_TOKEN_KEY),
        SecureStore.deleteItemAsync(this.REFRESH_TOKEN_KEY),
        SecureStore.deleteItemAsync(this.USER_DATA_KEY),
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }

  /**
   * Kiểm tra có tokens không
   */
  static async hasTokens(): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    const refreshToken = await this.getRefreshToken();
    return accessToken !== null && refreshToken !== null;
  }

  /**
   * Kiểm tra có access token không
   */
  static async hasAccessToken(): Promise<boolean> {
    const token = await this.getAccessToken();
    return token !== null;
  }

  /**
   * Kiểm tra có user data không
   */
  static async hasUserData(): Promise<boolean> {
    const userData = await this.getUserData();
    return userData !== null;
  }

  /**
   * Kiểm tra user đã đăng nhập chưa (có đầy đủ token và data)
   */
  static async isAuthenticated(): Promise<boolean> {
    const hasTokens = await this.hasTokens();
    const hasUserData = await this.hasUserData();
    return hasTokens && hasUserData;
  }
}

export default AuthStorageUtil;

