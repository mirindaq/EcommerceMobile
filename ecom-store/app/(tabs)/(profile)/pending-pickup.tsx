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
import { ActivityIndicator, Image, ScrollView, View } from "react-native";

export default function PendingPickup() {
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
        // Gọi API lấy đơn chờ lấy hàng
        const res = await orderService.getMyOrders(1, 50, ["READY_FOR_PICKUP"]);

        // Kiểm tra và set data đúng cấu trúc phân trang
        if (res.data && res.data.data) {
          setOrders(res.data.data);
        }
      } catch (error) {
        console.error(error);
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
      <HStack className="items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <Pressable onPress={() => router.push("/(tabs)/(profile)/profile")}>
          <ChevronLeftIcon size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-semibold">Chờ lấy hàng</Text>
        <View style={{ width: 24 }} />
      </HStack>

      <ScrollView className="px-4 mt-3">
        {orders.length === 0 ? (
          <Box className="items-center py-10">
            <Text className="text-gray-500">Không có đơn hàng chờ lấy.</Text>
          </Box>
        ) : (
          orders.map((order) => {
            const firstItem = order.orderDetails[0];
            return (
              <Box
                key={order.id}
                className="bg-white p-3 rounded-xl mb-3 shadow-sm"
              >
                <HStack className="space-x-3">
                  <Image
                    source={{
                      uri:
                        firstItem?.productVariant.productThumbnail ||
                        "https://via.placeholder.com/150",
                    }}
                    className="w-20 h-20 rounded mr-3 bg-gray-100"
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
                        Mã đơn: #{order.id}
                      </Text>
                    </View>
                    <Text className="text-red-500 font-bold mt-1">
                      {formatCurrency(order.finalTotalPrice)}
                    </Text>
                  </VStack>
                </HStack>

                {/* Thay thế phần QR/Map bằng thông báo text */}
                <Box className="mt-3 bg-green-50 p-3 rounded-lg border border-green-200 items-center">
                  <Text className="text-green-700 text-center font-medium text-sm">
                    Đơn hàng của bạn đã sẵn sàng, hãy đến CellphoneZ shop để
                    nhận ngay!
                  </Text>
                </Box>
              </Box>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
