import React from "react";
import { ScrollView, Image } from "react-native";
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
import { View } from "react-native";

export default function PendingPickup() {
  const router = useRouter();
  useHideTabBar();

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <HStack className="items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <Pressable onPress={() => router.push('/(tabs)/(profile)/profile')}>
          <ChevronLeftIcon size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-semibold">Chờ lấy hàng</Text>
        <View style={{ width: 24 }} />
      </HStack>

      <ScrollView className="px-4 mt-3">
        <Box className="bg-white p-3 rounded-xl mb-3">
          <HStack className="space-x-3">
            <Image
              source={{
                uri: "data:image/jpeg;base64,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",
              }}
              className="w-20 h-20 rounded mr-3"
            />

            <VStack className="flex-1">
              <Text className="font-semibold">Áo thun nam form rộng</Text>
              <Text className="text-xs text-gray-500">Số lượng: 2</Text>
              <Text className="text-red-500 font-bold mt-1">250.000₫</Text>
            </VStack>
          </HStack>

          <HStack className="justify-end mt-3 space-x-3">
            <Pressable className="px-4 py-2 bg-red-500 rounded-lg">
              <Text className="text-white">Liên hệ Shop</Text>
            </Pressable>
          </HStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
