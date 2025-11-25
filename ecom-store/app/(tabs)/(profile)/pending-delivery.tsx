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

export default function PendingDelivery() {
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
        // Lấy trạng thái SHIPPED và DELIVERING
        const [shippedRes, deliveringRes, assignedRes] = await Promise.all([
          orderService.getMyOrders(1, 50, ["SHIPPED"]),
          orderService.getMyOrders(1, 50, ["DELIVERING"]),
          orderService.getMyOrders(1, 50, ["ASSIGNED_SHIPPER"]),
        ]);

        const allOrders = [
          ...(shippedRes.data?.data || []),
          ...(deliveringRes.data?.data || []),
          ...(assignedRes.data?.data || []),
        ];

        allOrders.sort((a, b) => b.id - a.id);
        setOrders(allOrders);
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
        <Text className="text-lg font-semibold">Đang vận chuyển</Text>
        <View style={{ width: 24 }} />
      </HStack>

      <ScrollView className="px-4 mt-3">
        {orders.length === 0 ? (
          <Box className="items-center py-10">
            <Text className="text-gray-500">
              Chưa có đơn hàng nào đang giao.
            </Text>
          </Box>
        ) : (
          orders.map((order) => {
            const firstItem = order.orderDetails[0];
            return (
              <Box
                key={order.id}
                className="bg-white p-3 rounded-xl mb-3 shadow-sm"
              >
                <HStack className="justify-between mb-2">
                  <Text className="text-gray-500 text-xs font-bold">
                    #{order.id}
                  </Text>
                  <Text className="text-orange-500 text-xs font-bold">
                    Đang giao hàng
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
                        SL:{" "}
                        {order.orderDetails.reduce(
                          (acc, item) => acc + item.quantity,
                          0
                        )}{" "}
                        sản phẩm
                      </Text>
                    </View>
                    <Text className="text-red-500 font-bold mt-1">
                      {formatCurrency(order.finalTotalPrice)}
                    </Text>
                  </VStack>
                </HStack>

                <HStack className="justify-end mt-3 space-x-3">
                  <Pressable className="px-4 py-2 bg-red-500 rounded-lg">
                    <Text className="text-white font-medium">Đã nhận hàng</Text>
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
