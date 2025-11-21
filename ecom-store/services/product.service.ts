import axiosClient from '@/configurations/axios.config'
import type {
  ProductListResponse,
  ProductResponse,
} from '@/types/product.type'

export const productService = {
  /**
   * Lấy danh sách sản phẩm
   */
  getProducts: async (page: number = 1, size: number = 7, search: string = "") => {
    const response = await axiosClient.get<ProductListResponse>(
      `/products?page=${page}&size=${size}&search=${search}`
    )
    return response.data
  },

  /**
   * Lấy chi tiết sản phẩm theo ID
   */
  getProductById: async (id: number) => {
    const response = await axiosClient.get<ProductResponse>(`/products/${id}`)
    return response.data
  },

  /**
   * Lấy chi tiết sản phẩm theo slug
   */
  getProductBySlug: async (slug: string) => {
    const response = await axiosClient.get<ProductResponse>(`/products/slug/${slug}`)
    return response.data
  },

  /**
   * Tìm kiếm sản phẩm theo category slug
   */
  searchProducts: async (categorySlug: string, page: number = 1, size: number = 8, filters: Record<string, string> = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...filters
    })
    const response = await axiosClient.get<ProductListResponse>(
      `/products/search/${categorySlug}?${params.toString()}`
    )
    return response.data
  }
}
