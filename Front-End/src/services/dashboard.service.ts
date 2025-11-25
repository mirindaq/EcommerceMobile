import { orderService } from './order.service';
import { productService } from './product.service';
import { customerService } from './customer.service';
import type { OrderStatus } from '@/types/order.type';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueChange: number;
  ordersChange: number;
  productsChange: number;
  customersChange: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface RecentOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  amount: number;
  date: string;
  status: OrderStatus;
}

export const dashboardService = {
  // Lấy thống kê tổng quan
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      // Lấy tất cả đơn hàng đã hoàn thành (lấy nhiều để tính toán)
      // Lưu ý: Nếu có quá nhiều đơn hàng, có thể cần tối ưu bằng cách lấy theo từng trang
      const allCompletedOrders = await orderService.getAllOrdersForAdmin({
        page: 1,
        size: 10000,
        status: 'COMPLETED' as OrderStatus
      });

      const completedOrders = allCompletedOrders.data?.data || [];

      // Lọc đơn hàng theo tháng
      const currentMonthOrdersList = completedOrders.filter(order => {
        try {
          const orderDate = new Date(order.orderDate);
          return orderDate >= currentMonthStart && orderDate <= currentMonthEnd;
        } catch {
          return false;
        }
      });

      const lastMonthOrdersList = completedOrders.filter(order => {
        try {
          const orderDate = new Date(order.orderDate);
          return orderDate >= lastMonthStart && orderDate <= lastMonthEnd;
        } catch {
          return false;
        }
      });

      // Tính tổng doanh thu
      const currentRevenue = currentMonthOrdersList.reduce((sum, order) => sum + (order.finalTotalPrice || 0), 0);
      const lastRevenue = lastMonthOrdersList.reduce((sum, order) => sum + (order.finalTotalPrice || 0), 0);
      const revenueChange = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

      // Tính số đơn hàng
      const currentOrdersCount = currentMonthOrdersList.length;
      const lastOrdersCount = lastMonthOrdersList.length;
      const ordersChange = lastOrdersCount > 0 ? ((currentOrdersCount - lastOrdersCount) / lastOrdersCount) * 100 : 0;

      // Lấy tổng số đơn hàng (tất cả status)
      const allOrders = await orderService.getAllOrdersForAdmin({
        page: 1,
        size: 1
      });
      const totalOrders = allOrders.data?.totalItem || 0;

      // Lấy tổng số sản phẩm
      const products = await productService.getProducts(1, 1);
      const totalProducts = products.data?.totalItem || 0;

      // Lấy tổng số khách hàng
      const customers = await customerService.getCustomers({
        page: 1,
        size: 1
      });
      const totalCustomers = customers.data?.totalItem || 0;

      // Tính phần trăm thay đổi cho products và customers (giả sử không có dữ liệu tháng trước, dùng giá trị mặc định)
      const productsChange = 0; // Cần API riêng để tính
      const customersChange = 0; // Cần API riêng để tính

      return {
        totalRevenue: currentRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        revenueChange: Math.round(revenueChange * 10) / 10,
        ordersChange: Math.round(ordersChange * 10) / 10,
        productsChange,
        customersChange
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Trả về giá trị mặc định nếu có lỗi
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0,
        revenueChange: 0,
        ordersChange: 0,
        productsChange: 0,
        customersChange: 0
      };
    }
  },

  // Lấy doanh thu theo tháng (12 tháng gần đây)
  getMonthlyRevenue: async (): Promise<MonthlyRevenue[]> => {
    try {
      const months: MonthlyRevenue[] = [];
      const now = new Date();

      // Lấy tất cả đơn hàng đã hoàn thành một lần
      const allCompletedOrders = await orderService.getAllOrdersForAdmin({
        page: 1,
        size: 10000,
        status: 'COMPLETED' as OrderStatus
      });

      const completedOrders = allCompletedOrders.data?.data || [];

      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

        const monthOrders = completedOrders.filter(order => {
          try {
            const orderDate = new Date(order.orderDate);
            return orderDate >= monthStart && orderDate <= monthEnd;
          } catch {
            return false;
          }
        });

        const revenue = monthOrders.reduce((sum, order) => sum + (order.finalTotalPrice || 0), 0);

        months.push({
          month: date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
          revenue
        });
      }

      return months;
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
      return [];
    }
  },

  // Lấy đơn hàng gần đây
  getRecentOrders: async (limit: number = 5): Promise<RecentOrder[]> => {
    try {
      const orders = await orderService.getAllOrdersForAdmin({
        page: 1,
        size: limit
      });

      return (orders.data?.data || []).map(order => ({
        id: order.id,
        orderNumber: `#${order.id}`,
        customerName: order.customer?.fullName || 'Khách hàng',
        amount: order.finalTotalPrice || 0,
        date: order.orderDate,
        status: order.status
      }));
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      return [];
    }
  }
};

