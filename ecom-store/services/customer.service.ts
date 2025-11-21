import axiosClient from '@/configurations/axios.config';
import type { 
  CustomerResponse,
  UpdateCustomerProfileRequest
} from '@/types/customer.type';

export const customerService = {
  /**
   * Cập nhật thông tin profile của customer
   */
  updateCustomer: async (id: number, data: UpdateCustomerProfileRequest) => {
    const response = await axiosClient.put<CustomerResponse>(`/customers/${id}`, data);
    return response.data;
  },
};
