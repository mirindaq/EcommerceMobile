import axiosClient from "@/configurations/axios.config";
import type { CartAddRequest, CartResponse } from "@/types/cart.type";

export const cartService = {
  /**
   * Lấy giỏ hàng của customer hiện tại
   */
  getCart: async () => {
    const response = await axiosClient.get<CartResponse>(`/carts`);
    return response.data;
  },

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  addProductToCart: async (request: CartAddRequest) => {
    const response = await axiosClient.post<CartResponse>(`/carts/add`, request);
    return response.data;
  },

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   */
  removeProductFromCart: async (productVariantId: number) => {
    const response = await axiosClient.delete<CartResponse>(`/carts/remove/${productVariantId}`);
    return response.data;
  },

  /**
   * Cập nhật số lượng sản phẩm trong giỏ hàng
   */
  updateCartItemQuantity: async (productVariantId: number, quantity: number) => {
    const response = await axiosClient.put<CartResponse>(`/carts/update-quantity`, {
      productVariantId,
      quantity
    });
    return response.data;
  },
};
   