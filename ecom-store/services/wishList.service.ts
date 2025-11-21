import axiosClient from "@/configurations/axios.config";
import type { WishListRequest, WishListResponse } from "@/types/wishList.type";

export const wishListService = {
    /**
     * Lấy danh sách yêu thích của customer hiện tại
     */
    getMyWishList: async () => {
        const response = await axiosClient.get<WishListResponse[]>(`/wishlist`);
        return response.data;
    },

    /**
     * Thêm sản phẩm vào danh sách yêu thích
     */
    addProducToWishList: async (request: WishListRequest) => {
        const response = await axiosClient.post<WishListResponse[]>(`/wishlist/add`, request);
        return response.data;
    },

    /**
     * Xóa sản phẩm khỏi danh sách yêu thích
     */
    removeProductFromWishList: async (productVariantId: number) => {
        const requestBody: WishListRequest = { productVariantId };
        const response = await axiosClient.delete<WishListResponse[]>(`/wishlist/remove`, { 
            data: requestBody 
        });
        return response.data;
    },
};