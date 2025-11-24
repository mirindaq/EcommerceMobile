import axiosClient from '@/configurations/axios.config';
import type {
  CreateFeedbackRequest,
  FeedbackResponse,
} from '@/types/feedback.type';
import type { ResponseApi } from '@/types/responseApi.type';

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
};
