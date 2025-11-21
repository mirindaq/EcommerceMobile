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
import { ChevronLeftIcon } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useHideTabBar } from "@/hooks/use-hide-tab-bar";

export default function PendingConfirm() {
  const router = useRouter();
  useHideTabBar();

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <HStack className="items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <Pressable onPress={() => router.push('/(tabs)/(profile)/profile')}>
          <ChevronLeftIcon size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-semibold">Chờ xác nhận</Text>
        <View style={{ width: 24 }} />
      </HStack>

      <ScrollView className="px-4 mt-3">
        {/* Demo 1 item */}
        <Box className="bg-white p-3 rounded-xl mb-3">
          <HStack className="space-x-3">
            <Image
              source={{
                uri: "data:image/jpeg;base64,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",
              }}
              className="w-20 h-20 rounded mr-3"
            />

            <VStack className="flex-1">
              <Text className="font-semibold">Điện thoại Xiaomi Redmi</Text>
              <Text className="text-xs text-gray-500">Số lượng: 1</Text>
              <Text className="text-red-500 font-bold mt-1">3.290.000₫</Text>
            </VStack>
          </HStack>

          <HStack className="justify-end mt-3 space-x-3">
            <Pressable className="mr-3 px-4 py-2 bg-gray-200 rounded-lg">
              <Text className="text-gray-700">Huỷ đơn</Text>
            </Pressable>
            <Pressable className="px-4 py-2 bg-red-500 rounded-lg">
              <Text className="text-white">Liên hệ Shop</Text>
            </Pressable>
          </HStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
