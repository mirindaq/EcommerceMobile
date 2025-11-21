import axiosClient from '@/configurations/axios.config';
import type { ResponseApi } from '@/types/responseApi.type';
import type { Variant } from '@/types/variant.type';

export const variantService = {
  getVariantsByCategorySlug: async (slug: string) => {
    const response = await axiosClient.get<ResponseApi<Variant[]>>(
      `/variants/category/slug/${slug}`
    );
    return response.data;
  },
};

