import axiosClient from '@/configurations/axios.config';
import type {
  OrderCreationRequest,
  OrderListResponse,
  OrderApiResponse,
} from '@/types/order.type';

export const orderService = {
  /**
   * Tạo đơn hàng mới
   */
  createOrder: async (request: OrderCreationRequest) => {
    const response = await axiosClient.post("/orders", request);
    return response.data;
  },

  /**
   * Lấy danh sách đơn hàng của customer hiện tại
   */
  getMyOrders: async (page: number = 1, size: number = 10, statuses?: string[], startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (statuses && statuses.length > 0) {
      statuses.forEach(status => params.append('status', status));
    }
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await axiosClient.get<OrderListResponse>(`/orders/my-orders?${params.toString()}`);
    return response.data;
  },

  /**
   * Lấy chi tiết đơn hàng theo ID
   */
  getOrderDetailById: async (id: number) => {
    const response = await axiosClient.get<OrderApiResponse>(`/orders/${id}`);
    return response.data;
  },
}