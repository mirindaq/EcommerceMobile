// app/(tabs)/profile/order-history.tsx

import React from "react";
import { ScrollView, Image, View } from "react-native";
import {
  Box,
  VStack,
  HStack,
  Text,
  Pressable,
  SafeAreaView,
} from "@/components/ui";
import { ArrowLeftIcon } from "lucide-react-native";
import { useRouter, Stack } from "expo-router";
import { useHideTabBar } from "@/hooks/use-hide-tab-bar";

// Dữ liệu đơn hàng đã giao
const deliveredOrders = [
  {
    shop: "Unicoshop",
    productName: "Tai nghe gaming nhét tai có dây b...",
    variant: "Game đen typeC",
    quantity: 1,
    price: 55000,
    total: 43999,
    status: "Hoàn thành",
    imageUri:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTn4pOI6n38VcZeEEpbmO-MkZHdTtMUlUq8w&s",
    reviewDeadline: "28 Th11",
  },
  {
    shop: "Perfect Style",
    productName: "Cường lực Baiko Full màn Realme...",
    variant: "Realme Neo 5 / 5 SE",
    quantity: 3,
    price: 16800,
    total: 40320,
    status: "Hoàn thành",
    imageUri:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAyejKVu0OuZ0WXAwwE7LyhMDUt_2J7K7AUA&s",
    reviewDeadline: null,
  },
  {
    shop: "Shop GrreExpress",
    productName: "Cáp Sạc OPPO 80W 8A 100W10A ...",
    variant: "[A-C 10A]",
    quantity: 1,
    price: 129000,
    total: 129000,
    status: "Hoàn thành",
    imageUri:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPLqtNLrOvvMwwzGAN90S5LLqbUYp4zAvf4g&s",
    reviewDeadline: null,
  },
];

// Component đơn hàng
const OrderCard = ({ order }: { order: (typeof deliveredOrders)[0] }) => {
  const formatCurrency = (amount: number) =>
    amount.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });

  return (
    <Box className="bg-white p-4 mb-3 rounded-lg shadow-sm">
      <HStack className="justify-between items-center mb-2 border-b border-gray-100 pb-2">
        <Text className="font-bold text-gray-800">{order.shop}</Text>
        <Text className="text-red-500 font-semibold text-sm">
          {order.status}
        </Text>
      </HStack>

      <HStack className="items-start space-x-3 mb-3">
        <Image
          source={{ uri: order.imageUri }}
          className="w-16 h-16 rounded object-cover mr-3"
        />
        <VStack className="flex-1">
          <Text className="text-gray-800 text-sm" numberOfLines={2}>
            {order.productName}
          </Text>
          <Text className="text-gray-500 text-xs mt-1">
            {order.variant}
            <Text className="text-gray-500 text-xs"> x{order.quantity}</Text>
          </Text>
          <Text className="text-gray-800 font-medium text-sm mt-1">
            {formatCurrency(order.price)}
          </Text>
        </VStack>
      </HStack>

      <VStack className="items-end mb-3">
        <Text className="text-gray-800 text-sm">
          Tổng số tiền ({order.quantity} sản phẩm):{" "}
          <Text className="text-red-500 font-bold">
            {formatCurrency(order.total)}
          </Text>
        </Text>
      </VStack>

      <HStack className="justify-end space-x-3">
        <Pressable className="mr-2 border border-red-500 rounded-lg px-4 py-2">
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <HStack className="items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <Pressable onPress={() => router.push('/(tabs)/(profile)/profile')}>
          <ArrowLeftIcon size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-semibold">Đơn đã mua</Text>
        <View style={{ width: 24 }} />
      </HStack>

      {/* List đơn đã giao */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack className="p-4">
          {deliveredOrders.map((order, index) => (
            <OrderCard key={index} order={order} />
          ))}
        </VStack>

      </ScrollView>
    </SafeAreaView>
  );
}
