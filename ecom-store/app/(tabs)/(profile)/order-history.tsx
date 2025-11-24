import {
  Box,
  HStack,
  Pressable,
  SafeAreaView,
  Text,
  VStack,
} from "@/components/ui";
import { useHideTabBar } from "@/hooks/use-hide-tab-bar";
import { orderService } from "@/services/order.service"; // Import service
import { OrderResponse } from "@/types/order.type"; // Import type
import { Stack, useRouter } from "expo-router";
import { ArrowLeftIcon } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  View,
} from "react-native";

// Component hiển thị từng đơn hàng
const OrderCard = ({ order }: { order: OrderResponse }) => {
  const router = useRouter();

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });

  // Lấy sản phẩm đầu tiên để hiển thị đại diện (hoặc map hết nếu muốn)
  // Ở đây mình hiển thị list sản phẩm đơn giản
  return (
    <Box className="bg-white p-4 mb-3 rounded-lg shadow-sm">
      {/* Header Card: Shop Name & Status */}
      <HStack className="justify-between items-center mb-2 border-b border-gray-100 pb-2">
        <Text className="font-bold text-gray-800">CellphoneZ</Text>
        <Text className="text-red-500 font-semibold text-sm">
          {order.status === "COMPLETED" ? "Hoàn thành" : order.status}
        </Text>
      </HStack>

      {/* List sản phẩm trong đơn */}
      {order.orderDetails.map((detail, index) => (
        <HStack key={detail.id} className="items-start space-x-3 mb-3">
          <Image
            source={{
              uri:
                detail.productVariant.productThumbnail ||
                "https://via.placeholder.com/150", // Fallback ảnh
            }}
            className="w-16 h-16 rounded object-cover mr-3"
          />
          <VStack className="flex-1">
            <Text className="text-gray-800 text-sm" numberOfLines={2}>
              {detail.productVariant.productName}
            </Text>
            <Text className="text-gray-500 text-xs mt-1">
              Phân loại: {detail.productVariant.sku}
            </Text>
            <Text className="text-gray-500 text-xs">x{detail.quantity}</Text>
            <Text className="text-gray-800 font-medium text-sm mt-1">
              {formatCurrency(detail.price)}
            </Text>
          </VStack>
        </HStack>
      ))}

      {/* Tổng tiền */}
      <VStack className="items-end mb-3 border-t border-gray-100 pt-2">
        <Text className="text-gray-800 text-sm">
          Thành tiền:{" "}
          <Text className="text-red-500 font-bold text-base">
            {formatCurrency(order.finalTotalPrice)}
          </Text>
        </Text>
      </VStack>

      {/* Action Buttons */}
      <HStack className="justify-end space-x-3">
        <Pressable
          className="mr-2 border border-red-500 rounded-lg px-4 py-2"
          onPress={() => {
            router.replace("/(tabs)");
          }}
        >
          <Text className="text-red-500 font-medium">Mua lại</Text>
        </Pressable>
        <Pressable className="bg-red-500 rounded-lg px-4 py-2">
          <Text className="text-white font-medium">Đánh giá</Text>
        </Pressable>
      </HStack>
    </Box>
  );
};

export default function OrderHistoryScreen() {
  const router = useRouter();
  useHideTabBar();

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Gọi API lấy đơn hàng trạng thái COMPLETED
        const res = await orderService.getMyOrders(1, 100, "COMPLETED");
        if (res.data && res.data.data) {
          setOrders(res.data.data);
        }
      } catch (error) {
        console.error("Lỗi lấy lịch sử đơn hàng:", error);
        Alert.alert("Lỗi", "Không thể tải lịch sử đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#EF4444" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <HStack className="items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <Pressable onPress={() => router.push("/(tabs)/(profile)/profile")}>
          <ArrowLeftIcon size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-semibold">Lịch sử mua hàng</Text>
        <View style={{ width: 24 }} />
      </HStack>

      {/* List đơn đã giao */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack className="p-4">
          {orders.length === 0 ? (
            <Box className="items-center justify-center py-10">
              <Text className="text-gray-500">
                Bạn chưa có đơn hàng nào hoàn thành.
              </Text>
            </Box>
          ) : (
            orders.map((order) => <OrderCard key={order.id} order={order} />)
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
