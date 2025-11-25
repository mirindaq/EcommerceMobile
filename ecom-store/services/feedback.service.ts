import axiosClient from '@/configurations/axios.config';
import type {
  CreateFeedbackRequest,
  FeedbackResponse,
  RatingStatistics,
} from '@/types/feedback.type';
import type { ResponseApi, ResponseApiWithPagination } from '@/types/responseApi.type';

export const feedbackService = {
  /**
   * Tạo đánh giá sản phẩm
   */
  createFeedback: async (request: CreateFeedbackRequest) => {
    const response = await axiosClient.post<ResponseApi<FeedbackResponse>>(
      "/feedbacks",
      request
    );
    return response.data;
  },

  /**
   * Kiểm tra xem đã đánh giá sản phẩm này chưa
   */
  checkIfReviewed: async (orderId: number, productVariantId: number) => {
    const response = await axiosClient.get<ResponseApi<boolean>>(
      `/feedbacks/check?orderId=${orderId}&productVariantId=${productVariantId}`
    );
    return response.data;
  },

  /**
   * Lấy chi tiết đánh giá
   */
  getFeedbackDetail: async (orderId: number, productVariantId: number) => {
    const response = await axiosClient.get<ResponseApi<FeedbackResponse>>(
      `/feedbacks/detail?orderId=${orderId}&productVariantId=${productVariantId}`
    );
    return response.data;
  },

  /**
   * Lấy danh sách đánh giá của sản phẩm (cho product detail page)
   */
  getFeedbacksByProduct: async (productId: number, page = 1, size = 10) => {
    const response = await axiosClient.get<ResponseApi<{
      content: FeedbackResponse[];
      totalPages: number;
      totalElements: number;
      number: number;
      size: number;
    }>>(
      `/feedbacks/product/${productId}?page=${page}&size=${size}`
    );
    return response.data;
  },

  /**
   * Lấy thống kê rating của sản phẩm
   */
  getRatingStatistics: async (productId: number) => {
    const response = await axiosClient.get<ResponseApi<RatingStatistics>>(
      `/feedbacks/product/${productId}/statistics`
    );
    return response.data;
  },
};
