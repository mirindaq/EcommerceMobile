import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Package, ShoppingCart, Users, DollarSign, TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { useQuery } from "@/hooks/useQuery"
import { dashboardService } from "@/services/dashboard.service"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

export default function Dashboard() {
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery(
    () => dashboardService.getDashboardStats(),
    {
      queryKey: ['dashboard-stats'],
      staleTime: 5 * 60 * 1000, // 5 phút
    }
  )

  // Fetch monthly revenue
  const { data: monthlyRevenue, isLoading: revenueLoading } = useQuery(
    () => dashboardService.getMonthlyRevenue(),
    {
      queryKey: ['monthly-revenue'],
      staleTime: 5 * 60 * 1000,
    }
  )

  // Fetch recent orders
  const { data: recentOrders, isLoading: ordersLoading } = useQuery(
    () => dashboardService.getRecentOrders(5),
    {
      queryKey: ['recent-orders'],
      staleTime: 2 * 60 * 1000, // 2 phút
    }
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const statsData = [
    {
      title: "Tổng doanh thu",
      value: stats ? formatCurrency(stats.totalRevenue) : "₫0",
      description: stats 
        ? `${stats.revenueChange >= 0 ? '+' : ''}${stats.revenueChange.toFixed(1)}% so với tháng trước`
        : "Đang tải...",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      trend: stats ? (stats.revenueChange >= 0 ? "up" : "down") : "up"
    },
    {
      title: "Đơn hàng",
      value: stats ? formatNumber(stats.totalOrders) : "0",
      description: stats 
        ? `${stats.ordersChange >= 0 ? '+' : ''}${stats.ordersChange.toFixed(1)}% so với tháng trước`
        : "Đang tải...",
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      trend: stats ? (stats.ordersChange >= 0 ? "up" : "down") : "up"
    },
    {
      title: "Sản phẩm",
      value: stats ? formatNumber(stats.totalProducts) : "0",
      description: stats && stats.productsChange !== 0
        ? `${stats.productsChange >= 0 ? '+' : ''}${stats.productsChange.toFixed(1)}% so với tháng trước`
        : "Tổng số sản phẩm",
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      trend: stats ? (stats.productsChange >= 0 ? "up" : "down") : "up"
    },
    {
      title: "Khách hàng",
      value: stats ? formatNumber(stats.totalCustomers) : "0",
      description: stats && stats.customersChange !== 0
        ? `${stats.customersChange >= 0 ? '+' : ''}${stats.customersChange.toFixed(1)}% so với tháng trước`
        : "Tổng số khách hàng",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      trend: stats ? (stats.customersChange >= 0 ? "up" : "down") : "up"
    }
  ]

  const chartConfig = {
    revenue: {
      label: "Doanh thu",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <div className="space-y-3 p-2">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-lg text-gray-600">
          Tổng quan về hoạt động kinh doanh của bạn
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <Card key={stat.title} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.borderColor} border`}>
                  {statsLoading ? (
                    <Loader2 className={`h-6 w-6 ${stat.color} animate-spin`} />
                  ) : (
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  )}
                </div>
                {!statsLoading && (
                  <div className="flex items-center space-x-1">
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Doanh thu theo tháng</CardTitle>
            <CardDescription className="text-gray-600">
              Biểu đồ doanh thu trong 12 tháng gần đây
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {revenueLoading ? (
              <div className="h-[250px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : monthlyRevenue && monthlyRevenue.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="revenue" 
                    fill="var(--color-revenue)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-200">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-base font-medium text-gray-500">Chưa có dữ liệu</p>
                  <p className="text-sm text-gray-400">Chưa có đơn hàng nào trong 12 tháng gần đây</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-3 hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Đơn hàng gần đây</CardTitle>
            <CardDescription className="text-gray-600">
              Những đơn hàng mới nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-900">
                        {order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.customerName}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(order.amount)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDate(order.date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-gray-400">
                <p className="text-sm">Chưa có đơn hàng nào</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
