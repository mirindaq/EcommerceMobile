// app/(tabs)/profile/order-history.tsx

import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Pressable as RNPressable,
  Modal,
  TouchableOpacity,
  Platform,
  View,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  Box,
  VStack,
  HStack,
  Text,
  Pressable,
  SafeAreaView,
  Button,
  ButtonText,
} from "@/components/ui";
import {
  ArrowLeftIcon,
  PackageIcon,
  CalendarIcon,
  MapPinIcon,
  CreditCardIcon,
  ShoppingBagIcon,
  EyeIcon,
  FilterIcon,
  XIcon,
} from "lucide-react-native";
import { useRouter, Stack } from "expo-router";
import { orderService } from "@/services/order.service";
import { useHideTabBar } from "@/hooks/use-hide-tab-bar";
import AuthStorageUtil from "@/utils/authStorage.util";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import type { OrderResponse, OrderStatus } from "@/types/order.type";

type StatusTab =
  | "ALL"
  | "PENDING"
  | "CONFIRMED"
  | "DELIVERING"
  | "COMPLETED"
  | "CANCELLED";

export default function OrderHistoryScreen() {
  useHideTabBar();
  useAuthGuard();
  const router = useRouter();

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<StatusTab>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Filter states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  // Date picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date>(
    new Date(2020, 11, 1)
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Date>(new Date());

  useEffect(() => {
    loadOrders();
  }, [activeTab, currentPage, startDate, endDate]);

  const loadOrders = async () => {
    try {
      setLoading(true);

      // Check if user is logged in
      const token = await AuthStorageUtil.getAccessToken();
      if (!token) {
        Alert.alert("Thông báo", "Vui lòng đăng nhập để xem đơn hàng", [
          {
            text: "Đăng nhập",
            onPress: () => router.replace("/login"),
          },
        ]);
        return;
      }

      const status = getStatusParam(activeTab);
      const response = await orderService.getMyOrders(
        currentPage,
        pageSize,
        status,
        startDate || undefined,
        endDate || undefined
      );
      setOrders(response.data.data || []);
      setTotalPages(response.data.totalPage || 1);
    } catch (error: any) {
      console.error("Error loading orders:", error);

      // Check if it's an authentication error
      if (error?.status === 401 || error?.status === 500) {
        Alert.alert(
          "Phiên đăng nhập hết hạn",
          "Vui lòng đăng nhập lại để tiếp tục",
          [
            {
              text: "Đăng nhập",
              onPress: () => router.replace("/login"),
            },
          ]
        );
      } else {
        Alert.alert("Lỗi", "Không thể tải danh sách đơn hàng");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getStatusParam = (statusTab: StatusTab): string[] | undefined => {
    const statusMap: Record<StatusTab, string[] | undefined> = {
      ALL: undefined,
      PENDING: ["PENDING", "PENDING_PAYMENT"],
      CONFIRMED: [
        "PROCESSING",
        "READY_FOR_PICKUP",
        "SHIPPED",
        "ASSIGNED_SHIPPER",
      ],
      DELIVERING: ["DELIVERING"],
      COMPLETED: ["COMPLETED"],
      CANCELLED: ["FAILED", "CANCELED", "PAYMENT_FAILED"],
    };
    return statusMap[statusTab];
  };

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig: Record<
      string,
      { text: string; bg: string; textColor: string }
    > = {
      PENDING: {
        text: "Chờ xác nhận",
        bg: "bg-yellow-100",
        textColor: "text-yellow-700",
      },
      PENDING_PAYMENT: {
        text: "Chờ thanh toán",
        bg: "bg-orange-100",
        textColor: "text-orange-700",
      },
      PROCESSING: {
        text: "Đang xử lý",
        bg: "bg-blue-100",
        textColor: "text-blue-700",
      },
      READY_FOR_PICKUP: {
        text: "Sẵn sàng lấy hàng",
        bg: "bg-blue-100",
        textColor: "text-blue-700",
      },
      SHIPPED: {
        text: "Đã giao cho ĐVVC",
        bg: "bg-blue-100",
        textColor: "text-blue-700",
      },
      ASSIGNED_SHIPPER: {
        text: "Đã phân shipper",
        bg: "bg-blue-100",
        textColor: "text-blue-700",
      },
      DELIVERING: {
        text: "Đang giao hàng",
        bg: "bg-purple-100",
        textColor: "text-purple-700",
      },
      COMPLETED: {
        text: "Hoàn thành",
        bg: "bg-green-100",
        textColor: "text-green-700",
      },
      FAILED: {
        text: "Giao thất bại",
        bg: "bg-red-100",
        textColor: "text-red-700",
      },
      CANCELED: {
        text: "Đã hủy",
        bg: "bg-red-100",
        textColor: "text-red-700",
      },
      PAYMENT_FAILED: {
        text: "Thanh toán thất bại",
        bg: "bg-red-100",
        textColor: "text-red-700",
      },
    };

    const config = statusConfig[status] || {
      text: status,
      bg: "bg-gray-100",
      textColor: "text-gray-700",
    };

    return (
      <Box className={`px-3 py-1 rounded-full ${config.bg}`}>
        <Text className={`text-xs font-semibold ${config.textColor}`}>
          {config.text}
        </Text>
      </Box>
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    const methodMap: Record<string, string> = {
      CASH_ON_DELIVERY: "Thanh toán khi nhận hàng",
      VN_PAY: "VNPAY",
      PAY_OS: "PAYOS",
    };
    return methodMap[method] || method;
  };

  const handleTabChange = (tab: StatusTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleViewDetail = (orderId: number) => {
    router.push(`/order-detail?orderId=${orderId}`);
  };

  const handleStartDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") {
      setShowStartDatePicker(false);
    }
    if (date) {
      setSelectedStartDate(date);
      setTempStartDate(formatDate(date));
    }
  };

  const handleEndDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") {
      setShowEndDatePicker(false);
    }
    if (date) {
      setSelectedEndDate(date);
      setTempEndDate(formatDate(date));
    }
  };

  const handleApplyFilter = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setCurrentPage(1);
    setShowFilterModal(false);
  };

  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
    setTempStartDate("");
    setTempEndDate("");
    setSelectedStartDate(new Date(2020, 11, 1));
    setSelectedEndDate(new Date());
    setCurrentPage(1);
    setShowFilterModal(false);
  };

  const renderTabs = () => {
    const tabs: { key: StatusTab; label: string }[] = [
      { key: "ALL", label: "Tất cả" },
      { key: "PENDING", label: "Chờ xác nhận" },
      { key: "CONFIRMED", label: "Đã xác nhận" },
      { key: "DELIVERING", label: "Đang giao" },
      { key: "COMPLETED", label: "Hoàn thành" },
      { key: "CANCELLED", label: "Đã hủy" },
    ];

    return (
      <View
        style={{
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#e5e7eb",
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 8,
            paddingVertical: 12,
            gap: 8,
          }}
        >
          {tabs.map((tab) => (
            <RNPressable key={tab.key} onPress={() => handleTabChange(tab.key)}>
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor:
                    activeTab === tab.key ? "#dc2626" : "#f3f4f6",
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: activeTab === tab.key ? "#fff" : "#4b5563",
                  }}
                >
                  {tab.label}
                </Text>
              </View>
            </RNPressable>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderOrderCard = (order: OrderResponse) => (
    <Box key={order.id} className="bg-white mb-3 rounded-2xl shadow-sm">
      {/* Order Header */}
      <Box className="bg-gray-50 px-4 py-3 rounded-t-2xl border-b border-gray-200">
        <HStack className="items-center justify-between mb-2">
          <HStack className="items-center gap-2">
            <Text className="text-xs text-gray-600">Mã đơn hàng:</Text>
            <Text className="text-sm font-bold text-gray-900">#{order.id}</Text>
          </HStack>
          {getStatusBadge(order.status)}
        </HStack>
        <HStack className="items-center gap-1">
          <CalendarIcon size={14} color="#6B7280" />
          <Text className="text-xs text-gray-600">
            {formatDateTime(order.orderDate)}
          </Text>
        </HStack>
      </Box>

      {/* Order Items */}
      <VStack className="p-4 gap-3">
        {order.orderDetails.slice(0, 2).map((detail) => (
          <HStack key={detail.id} className="gap-3">
            <Image
              source={{ uri: detail.productVariant.productThumbnail }}
              className="w-16 h-16 rounded-lg bg-gray-100"
              resizeMode="cover"
            />
            <VStack className="flex-1">
              <Text numberOfLines={2} className="text-sm font-medium mb-1">
                {detail.productVariant.productName}
              </Text>
              <Text className="text-xs text-gray-500 mb-1">
                SKU: {detail.productVariant.sku}
              </Text>
              <HStack className="items-center justify-between">
                <Text className="text-xs text-gray-600">
                  x{detail.quantity}
                </Text>
                <Text className="text-sm font-semibold text-red-600">
                  {formatCurrency(detail.finalPrice)}
                </Text>
              </HStack>
            </VStack>
          </HStack>
        ))}
        {order.orderDetails.length > 2 && (
          <Text className="text-xs text-gray-500 text-center">
            + {order.orderDetails.length - 2} sản phẩm khác
          </Text>
        )}
      </VStack>

      {/* Order Summary */}
      <Box className="px-4 pb-4">
        <HStack className="items-center justify-between py-2 border-t border-gray-200">
          <HStack className="items-center gap-1">
            <MapPinIcon size={16} color="#6B7280" />
            <Text className="text-xs text-gray-600">
              {order.isPickup ? "Nhận tại cửa hàng" : "Giao hàng"}
            </Text>
          </HStack>
          <HStack className="items-center gap-1">
            <CreditCardIcon size={16} color="#6B7280" />
            <Text className="text-xs text-gray-600">
              {getPaymentMethodLabel(order.paymentMethod)}
            </Text>
          </HStack>
        </HStack>

        <HStack className="items-center justify-between py-3 border-t border-gray-200">
          <Text className="text-sm font-bold text-gray-900">
            Tổng thanh toán:
          </Text>
          <Text className="text-lg font-bold text-red-600">
            {formatCurrency(order.finalTotalPrice)}
          </Text>
        </HStack>

        <Button
          onPress={() => handleViewDetail(order.id)}
          className="w-full bg-white border-2 border-red-600"
        >
          <HStack className="items-center gap-2">
            <EyeIcon size={18} color="#DC2626" />
            <ButtonText className="text-red-600 font-semibold">
              Xem chi tiết
            </ButtonText>
          </HStack>
        </Button>
      </Box>
    </Box>
  );

  const renderEmptyState = () => (
    <Box className="items-center justify-center p-8">
      <Box className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
        <PackageIcon size={40} color="#9CA3AF" />
      </Box>
      <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
        Chưa có đơn hàng nào
      </Text>
      <Text className="text-gray-600 mb-6 text-center">
        Bạn chưa có đơn hàng nào trong danh mục này
      </Text>
      <Button onPress={() => router.push("/")} className="bg-red-600">
        <HStack className="items-center gap-2">
          <ShoppingBagIcon size={18} color="#FFF" />
          <ButtonText>Mua sắm ngay</ButtonText>
        </HStack>
      </Button>
    </Box>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <HStack className="items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <Pressable onPress={() => router.push("/(tabs)/(profile)/profile")}>
          <ArrowLeftIcon size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-semibold">Đơn hàng của tôi</Text>
        <Box style={{ width: 24 }} />
      </HStack>

      {/* Filter Bar */}
      <Box className="bg-white px-4 py-3 border-b border-gray-200">
        <HStack className="items-center justify-between">
          <Text className="text-sm font-medium text-gray-700">
            {startDate || endDate
              ? `Lọc: ${startDate || "..."} → ${endDate || "..."}`
              : "Lọc theo ngày"}
          </Text>
          <HStack className="items-center gap-2">
            {(startDate || endDate) && (
              <TouchableOpacity onPress={handleClearFilter}>
                <Text className="text-sm text-red-600 font-medium">
                  Xóa bộ lọc
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => {
                setTempStartDate(startDate);
                setTempEndDate(endDate);
                setShowFilterModal(true);
              }}
              className="bg-red-600 px-4 py-2 rounded-lg"
            >
              <HStack className="items-center gap-2">
                <FilterIcon size={18} color="#FFF" />
                <Text className="text-sm text-white font-medium">Lọc</Text>
              </HStack>
            </TouchableOpacity>
          </HStack>
        </HStack>
      </Box>

      {/* Tabs */}
      {renderTabs()}

      {/* Content */}
      {loading && !refreshing ? (
        <Box className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EF4444" />
          <Text className="text-gray-600 mt-4">Đang tải...</Text>
        </Box>
      ) : orders.length === 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        >
          {renderEmptyState()}
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <Box className="p-4">
            {orders.map((order) => renderOrderCard(order))}
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <HStack className="items-center justify-center gap-2 py-4">
              <Button
                size="sm"
                variant="outline"
                onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-gray-300"
              >
                <ButtonText>Trước</ButtonText>
              </Button>
              <Text className="text-sm text-gray-600">
                Trang {currentPage} / {totalPages}
              </Text>
              <Button
                size="sm"
                variant="outline"
                onPress={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="border-gray-300"
              >
                <ButtonText>Sau</ButtonText>
              </Button>
            </HStack>
          )}
        </ScrollView>
      )}

      {/* Date Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
          className="flex-1 bg-black/50 justify-center items-center"
        >
          <TouchableOpacity
            activeOpacity={1}
            className="bg-white rounded-2xl w-11/12 max-w-md"
          >
            {/* Modal Header */}
            <HStack className="items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold">Lọc theo ngày</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <XIcon size={24} color="#000" />
              </TouchableOpacity>
            </HStack>

            {/* Modal Content */}
            <VStack className="p-4 gap-4">
              <VStack className="gap-2">
                <Text className="text-sm font-medium text-gray-700">
                  Từ ngày
                </Text>
                <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
                  <Box className="border border-gray-300 rounded-lg px-3 py-3 bg-gray-50">
                    <Text className="text-sm text-gray-900">
                      {tempStartDate || "Chọn ngày bắt đầu"}
                    </Text>
                  </Box>
                </TouchableOpacity>
                {showStartDatePicker && (
                  <DateTimePicker
                    value={selectedStartDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleStartDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </VStack>

              <VStack className="gap-2">
                <Text className="text-sm font-medium text-gray-700">
                  Đến ngày
                </Text>
                <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
                  <Box className="border border-gray-300 rounded-lg px-3 py-3 bg-gray-50">
                    <Text className="text-sm text-gray-900">
                      {tempEndDate || "Chọn ngày kết thúc"}
                    </Text>
                  </Box>
                </TouchableOpacity>
                {showEndDatePicker && (
                  <DateTimePicker
                    value={selectedEndDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleEndDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </VStack>
            </VStack>

            {/* Modal Actions */}
            <HStack className="gap-3 p-4 border-t border-gray-200">
              <Button
                onPress={handleClearFilter}
                className="flex-1 bg-gray-100"
              >
                <ButtonText className="text-gray-700">Xóa bộ lọc</ButtonText>
              </Button>
              <Button onPress={handleApplyFilter} className="flex-1 bg-red-600">
                <ButtonText>Áp dụng</ButtonText>
              </Button>
            </HStack>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
