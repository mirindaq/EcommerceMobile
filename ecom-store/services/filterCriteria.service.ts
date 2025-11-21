import axiosClient from '@/configurations/axios.config';
import type { FilterCriteriaListResponse } from '@/types/filterCriteria.type';

export const filterCriteriaService = {
  getFilterCriteriaByCategorySlug: async (categorySlug: string) => {
    const response = await axiosClient.get<FilterCriteriaListResponse>(
      `/filter-criteria/categories/slug/${categorySlug}`
    );
    return response.data;
  },
};

