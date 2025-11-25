import axiosClient from '@/configurations/axios.config';
import type {
  VoucherAvailableApiResponse
} from '@/types/voucher.type';

export const voucherService = {
  /**
   * Lấy danh sách voucher khả dụng cho customer hiện tại
   */
  getAvailableVouchers: async () => {
    const response = await axiosClient.get<VoucherAvailableApiResponse>('/vouchers/available');
    return response.data.data;
  }
};