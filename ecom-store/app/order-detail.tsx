import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Image,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  Box,
  VStack,
  HStack,
  Text,
  Pressable,
  SafeAreaView,
} from "@/components/ui";
import { ArrowLeftIcon, PackageIcon, TruckIcon } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { orderService } from "@/services/order.service";
import type { OrderResponse } from "@/types/order.type";

export default function OrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetail();
  }, [orderId]);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderDetailById(Number(orderId));
      setOrder(response.data);
    } catch (error: any) {
      console.error("Error loading order detail:", error);
      Alert.alert("Lỗi", "Không thể tải chi tiết đơn hàng");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: "Chờ xác nhận",
      PENDING_PAYMENT: "Chờ thanh toán",
      PROCESSING: "Đang xử lý",
      READY_FOR_PICKUP: "Sẵn sàng lấy hàng",
      SHIPPED: "Đã giao",
      ASSIGNED_SHIPPER: "Đã giao shipper",
      DELIVERING: "Đang giao",
      FAILED: "Thất bại",
      CANCELED: "Đã hủy",
      COMPLETED: "Hoàn thành",
      PAYMENT_FAILED: "Thanh toán thất bại",
    };
    return statusMap[status] || status;
  };

  const getPaymentMethodText = (method: string) => {
    const methodMap: Record<string, string> = {
      CASH_ON_DELIVERY: "Thanh toán khi nhận hàng",
      VN_PAY: "VNPAY",
      PAY_OS: "PAYOS",
    };
    return methodMap[method] || method;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Box className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EF4444" />
        </Box>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Box className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Không tìm thấy đơn hàng</Text>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <HStack className="items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <Pressable onPress={() => router.back()}>
          <ArrowLeftIcon size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-semibold">Chi tiết đơn hàng</Text>
        <View style={{ width: 24 }} />
      </HStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Status */}
        <Box className="bg-white p-4 mb-2">
          <HStack className="items-center gap-3">
            <Box className="w-12 h-12 bg-red-100 rounded-full items-center justify-center">
              {order.isPickup ? (
                <PackageIcon size={24} color="#EF4444" />
              ) : (
                <TruckIcon size={24} color="#EF4444" />
              )}
            </Box>
            <VStack className="flex-1">
              <Text className="font-bold text-lg">
                {getStatusText(order.status)}
              </Text>
              <Text className="text-gray-600 text-sm">
                Đơn hàng #{order.id}
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* Delivery Info */}
        <Box className="bg-white p-4 mb-2">
          <Text className="font-bold text-base mb-3">
            {order.isPickup ? "Thông tin nhận hàng" : "Địa chỉ giao hàng"}
          </Text>
          <VStack className="gap-2">
            <HStack className="justify-between">
              <Text className="text-gray-600">Người nhận:</Text>
              <Text className="font-semibold">{order.receiverName}</Text>
            </HStack>
            <HStack className="justify-between">
              <Text className="text-gray-600">Số điện thoại:</Text>
              <Text className="font-semibold">{order.receiverPhone}</Text>
            </HStack>
            {!order.isPickup && (
              <VStack className="gap-1">
                <Text className="text-gray-600">Địa chỉ:</Text>
                <Text className="font-semibold">{order.receiverAddress}</Text>
              </VStack>
            )}
            {order.isPickup && (
              <VStack className="gap-1">
                <Text className="text-gray-600">Nhận tại:</Text>
                <Text className="font-semibold">
                  Cửa hàng CellphoneS - 125 Trần Phú, Hải Châu, Đà Nẵng
                </Text>
              </VStack>
            )}
            {order.note && (
              <VStack className="gap-1">
                <Text className="text-gray-600">Ghi chú:</Text>
                <Text className="font-semibold">{order.note}</Text>
              </VStack>
            )}
          </VStack>
        </Box>

        {/* Product List */}
        <Box className="bg-white p-4 mb-2">
          <Text className="font-bold text-base mb-3">Sản phẩm đã đặt</Text>
          <VStack className="gap-3">
            {order.orderDetails.map((item, index) => (
              <Box
                key={item.id}
                className={`flex-row gap-3 ${
                  index < order.orderDetails.length - 1
                    ? "pb-3 mb-3 border-b border-gray-200"
                    : ""
                }`}
              >
                <Image
                  source={{ uri: item.productVariant.productThumbnail }}
                  className="w-20 h-20 rounded bg-gray-100"
                  resizeMode="cover"
                />
                <VStack className="flex-1 justify-between">
                  <View>
                    <Text numberOfLines={2} className="text-sm font-medium">
                      {item.productVariant.productName}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      {item.productVariant.sku}
                    </Text>
                  </View>
                  <HStack className="justify-between items-end">
                    <Text className="text-xs text-gray-600">
                      x{item.quantity}
                    </Text>
                    <VStack className="items-end">
                      <Text className="text-sm font-semibold text-red-600">
                        {formatCurrency(item.finalPrice)}
                      </Text>
                      {item.discount > 0 && (
                        <Text className="text-xs text-gray-400 line-through">
                          {formatCurrency(item.price)}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                </VStack>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Payment Info */}
        <Box className="bg-white p-4 mb-2">
          <Text className="font-bold text-base mb-3">Thông tin thanh toán</Text>
          <VStack className="gap-2">
            <HStack className="justify-between">
              <Text className="text-gray-600">Phương thức:</Text>
              <Text className="font-semibold">
                {getPaymentMethodText(order.paymentMethod)}
              </Text>
            </HStack>
            <HStack className="justify-between">
              <Text className="text-gray-600">Tổng tiền hàng:</Text>
              <Text>{formatCurrency(order.totalPrice)}</Text>
            </HStack>
            {order.totalDiscount > 0 && (
              <HStack className="justify-between">
                <Text className="text-gray-600">Giảm giá:</Text>
                <Text className="text-red-600">
                  - {formatCurrency(order.totalDiscount)}
                </Text>
              </HStack>
            )}
            <Box className="h-px bg-gray-200 my-1" />
            <HStack className="justify-between items-center">
              <Text className="font-bold text-base">Tổng thanh toán:</Text>
              <Text className="font-bold text-xl text-red-600">
                {formatCurrency(order.finalTotalPrice)}
              </Text>
            </HStack>
          </VStack>
        </Box>

        {/* Order Info */}
        <Box className="bg-white p-4 mb-2">
          <Text className="font-bold text-base mb-3">Thông tin đơn hàng</Text>
          <VStack className="gap-2">
            <HStack className="justify-between">
              <Text className="text-gray-600">Mã đơn hàng:</Text>
              <Text className="font-semibold">#{order.id}</Text>
            </HStack>
            <HStack className="justify-between">
              <Text className="text-gray-600">Thời gian đặt:</Text>
              <Text className="font-semibold">
                {new Date(order.orderDate).toLocaleString("vi-VN")}
              </Text>
            </HStack>
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
