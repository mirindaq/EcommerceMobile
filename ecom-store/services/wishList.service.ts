import axiosClient from "@/configurations/axios.config";
import type { WishListRequest, WishListResponse } from "@/types/wishList.type";
import type { ResponseApi } from "@/types/responseApi.type";

export const wishListService = {
    /**
     * Lấy danh sách yêu thích của customer hiện tại
     */
    getMyWishList: async (): Promise<WishListResponse[]> => {
        const response = await axiosClient.get<ResponseApi<WishListResponse[]>>(`/wishlist`);
        // API trả về ResponseApi<WishListResponse[]>, cần lấy data.data
        return response.data.data || [];
    },

    /**
     * Thêm sản phẩm vào danh sách yêu thích
     */
    addProducToWishList: async (request: WishListRequest): Promise<WishListResponse[]> => {
        const response = await axiosClient.post<ResponseApi<WishListResponse[]>>(`/wishlist/add`, request);
        return response.data.data || [];
    },

    /**
     * Xóa sản phẩm khỏi danh sách yêu thích
     */
    removeProductFromWishList: async (productId: number): Promise<WishListResponse[]> => {
        const requestBody: WishListRequest = { productId };
        const response = await axiosClient.delete<ResponseApi<WishListResponse[]>>(`/wishlist/remove`, { 
            data: requestBody 
        });
        return response.data.data || [];
    },
};