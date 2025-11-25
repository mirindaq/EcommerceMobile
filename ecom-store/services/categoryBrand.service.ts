import axiosClient from '@/configurations/axios.config';
import type { ResponseApi } from '@/types/responseApi.type';
import type { Brand } from '@/types/brand.type';

export const categoryBrandService = {
  getBrandsByCategorySlug: async (slug: string) => {
    const response = await axiosClient.get<ResponseApi<Brand[]>>(
      `/category-brands/categories/slug/${slug}/brands`
    );
    return response.data;
  },
};

