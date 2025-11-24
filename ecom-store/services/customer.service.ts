import axiosClient from '@/configurations/axios.config';
import type {
  CustomerDetailResponse,
  CustomerResponse,
  UpdateCustomerProfileRequest
} from '@/types/customer.type';

export const customerService = {

  getCustomerDetail: async (id: number) => {
    // Giả sử endpoint là /customers/{id}
    const response = await axiosClient.get<CustomerDetailResponse>(`/customers/${id}`);
    return response.data;
  },

  /**
   * Cập nhật thông tin profile của customer
   */
  updateCustomer: async (id: number, data: UpdateCustomerProfileRequest) => {
    const response = await axiosClient.put<CustomerResponse>(`/customers/${id}`, data);
    return response.data;
  },
};
