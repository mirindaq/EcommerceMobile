/**
 * Utility để quản lý lịch sử tìm kiếm
 * Sử dụng expo-secure-store cho React Native
 */

import * as SecureStore from 'expo-secure-store';

const SEARCH_HISTORY_KEY = 'searchHistory';
const MAX_HISTORY_ITEMS = 10;

class SearchHistoryUtil {
  /**
   * Lấy danh sách tìm kiếm gần đây
   */
  static async getSearchHistory(): Promise<string[]> {
    try {
      const historyString = await SecureStore.getItemAsync(SEARCH_HISTORY_KEY);
      if (!historyString) return [];
      const history = JSON.parse(historyString) as string[];
      return history;
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }

  /**
   * Lưu một từ khóa tìm kiếm vào lịch sử
   */
  static async addSearchQuery(query: string): Promise<void> {
    try {
      if (!query || !query.trim()) return;
      
      const trimmedQuery = query.trim();
      const history = await this.getSearchHistory();
      
      // Xóa query nếu đã tồn tại (để đưa lên đầu)
      const filteredHistory = history.filter(item => item.toLowerCase() !== trimmedQuery.toLowerCase());
      
      // Thêm query mới vào đầu danh sách
      const newHistory = [trimmedQuery, ...filteredHistory];
      
      // Giới hạn số lượng item
      const limitedHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);
      
      await SecureStore.setItemAsync(SEARCH_HISTORY_KEY, JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error adding search query:', error);
    }
  }

  /**
   * Xóa một từ khóa khỏi lịch sử
   */
  static async removeSearchQuery(query: string): Promise<void> {
    try {
      const history = await this.getSearchHistory();
      const filteredHistory = history.filter(item => item.toLowerCase() !== query.toLowerCase());
      await SecureStore.setItemAsync(SEARCH_HISTORY_KEY, JSON.stringify(filteredHistory));
    } catch (error) {
      console.error('Error removing search query:', error);
    }
  }

  /**
   * Xóa toàn bộ lịch sử tìm kiếm
   */
  static async clearSearchHistory(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }
}

export default SearchHistoryUtil;

