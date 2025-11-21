import axiosClient from '@/configurations/axios.config';
import type {
  CategoryListResponse
} from '@/types/category.type';

export const categoryService = {
  /**
   * Lấy tất cả danh mục (cho home screen)
   */
  getAllCategoriesSimple: async () => {
    const response = await axiosClient.get<CategoryListResponse>('/categories/all'); 
    return response.data;
  }
};
