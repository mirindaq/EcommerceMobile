import React from "react";
import { ScrollView, Image, View } from "react-native";
import {
  Box,
  Text,
  HStack,
  VStack,
  Pressable,
  SafeAreaView,
} from "@/components/ui";
import { ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useHideTabBar } from "@/hooks/use-hide-tab-bar";

export default function VoucherScreen() {
  const router = useRouter();
  useHideTabBar();

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <HStack className="items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <Pressable onPress={() => router.push('/(tabs)/(profile)/profile')}>
          <ChevronLeft size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-semibold">Mã Giảm Giá</Text>
        <View style={{ width: 24 }} />
      </HStack>

      {/* List */}
      <ScrollView>
        {[1, 2, 3, 4].map((_, i) => (
          <HStack key={i} className="px-4 py-3 border-b border-gray-100">
            {/* Image */}
            <Image
              source={{
                uri: "https://thumbs.dreamstime.com/b/gift-voucher-round-red-gold-label-isolated-transparent-background-gift-voucher-gift-voucher-gift-voucher-round-red-gold-352610206.jpg",
              }}
              style={{ width: 70, height: 70, borderRadius: 8 }}
            />

            {/* Info */}
            <VStack className="flex-1 ml-3">
              <Text className="font-bold text-gray-800">
                Giảm 15% tối đa 40K
              </Text>
              <Text className="text-gray-600 text-sm">Đơn tối thiểu 50K</Text>
              <Text className="text-gray-400 text-xs mt-1">
                Hiệu lực từ: 25/11/2024
              </Text>
            </VStack>

            {/* Button */}
            <Pressable className="border border-red-500 px-3 py-1 rounded-lg self-center">
              <Text className="text-red-500 text-sm">Dùng ngay</Text>
            </Pressable>
          </HStack>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
