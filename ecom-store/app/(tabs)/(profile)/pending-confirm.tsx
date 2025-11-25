import {
  Box,
  HStack,
  Pressable,
  SafeAreaView,
  Text,
  VStack,
} from "@/components/ui";
import { useHideTabBar } from "@/hooks/use-hide-tab-bar";
import { orderService } from "@/services/order.service";
import { OrderResponse } from "@/types/order.type";
import { useRouter } from "expo-router";
import { ChevronLeftIcon } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  View,
} from "react-native";

export default function PendingConfirm() {
  const router = useRouter();
  useHideTabBar();

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Gọi song song các API để lấy các trạng thái chờ xác nhận/xử lý
        const [pendingRes, processingRes] = await Promise.all([
          orderService.getMyOrders(1, 50, ["PENDING"]),
          // orderService.getMyOrders(1, 50, ["PENDING_PAYMENT"]),
          orderService.getMyOrders(1, 50, ["PROCESSING"]),
        ]);

        // Gộp dữ liệu lại
        const allOrders = [
          ...(pendingRes.data?.data || []),
          // ...(paymentRes.data?.data || []),
          ...(processingRes.data?.data || []),
        ];

        // Sắp xếp theo ngày mới nhất (giảm dần id hoặc orderDate)
        allOrders.sort((a, b) => b.id - a.id);

        setOrders(allOrders);
      } catch (error) {
        console.error(error);
        Alert.alert("Lỗi", "Không thể tải danh sách đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Xử lý Huỷ đơn (Demo)
  const handleCancelOrder = async (orderId: number) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn huỷ đơn này?", [
      { text: "Không" },
      {
        text: "Có",
        onPress: async () => {
          // Gọi API huỷ đơn ở đây nếu có (orderService.cancelOrder)
          console.log("Cancel order", orderId);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#EF4444" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <HStack className="items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <Pressable onPress={() => router.push("/(tabs)/(profile)/profile")}>
          <ChevronLeftIcon size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-semibold">Chờ xác nhận</Text>
        <View style={{ width: 24 }} />
      </HStack>

      <ScrollView className="px-4 mt-3">
        {orders.length === 0 ? (
          <Box className="items-center py-10">
            <Text className="text-gray-500">Không có đơn hàng nào.</Text>
          </Box>
        ) : (
          orders.map((order) => {
            const firstItem = order.orderDetails[0];
            return (
              <Box
                key={order.id}
                className="bg-white p-3 rounded-xl mb-3 shadow-sm"
              >
                {/* Header card */}
                <HStack className="justify-between mb-2">
                  <Text className="text-gray-500 text-xs font-bold">
                    #{order.id}
                  </Text>
                  <Text className="text-blue-600 text-xs font-bold">
                    {order.status}
                  </Text>
                </HStack>

                <HStack className="space-x-3">
                  <Image
                    source={{
                      uri:
                        firstItem?.productVariant.productThumbnail ||
                        "https://via.placeholder.com/150",
                    }}
                    className="w-20 h-20 rounded mr-3 bg-gray-100"
                    resizeMode="cover"
                  />

                  <VStack className="flex-1 justify-between">
                    <View>
                      <Text
                        className="font-semibold text-gray-800"
                        numberOfLines={2}
                      >
                        {firstItem?.productVariant.productName}
                      </Text>
                      <Text className="text-xs text-gray-500 mt-1">
                        Phân loại: {firstItem?.productVariant.sku}
                      </Text>
                      {order.orderDetails.length > 1 && (
                        <Text className="text-xs text-gray-400 italic">
                          (và {order.orderDetails.length - 1} sản phẩm khác)
                        </Text>
                      )}
                    </View>
                    <Text className="text-red-500 font-bold mt-1">
                      {formatCurrency(order.finalTotalPrice)}
                    </Text>
                  </VStack>
                </HStack>

                <HStack className="justify-end mt-3 space-x-3">
                  <Pressable
                    className="mr-3 px-4 py-2 bg-gray-200 rounded-lg"
                    onPress={() => handleCancelOrder(order.id)}
                  >
                    <Text className="text-gray-700 font-medium">Huỷ đơn</Text>
                  </Pressable>
                  <Pressable className="px-4 py-2 bg-red-500 rounded-lg">
                    <Text className="text-white font-medium">Liên hệ Shop</Text>
                  </Pressable>
                </HStack>
              </Box>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
