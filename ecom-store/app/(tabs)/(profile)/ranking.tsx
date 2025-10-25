import React from "react";
import { ScrollView, Image } from "react-native";
import { Box, VStack, HStack, Text, Pressable, Icon, SafeAreaView } from "@/components/ui";
import { ArrowLeftIcon } from "lucide-react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export function SilverCard() {
  return (
    <LinearGradient
      colors={["#7F7F7F", "#B5B5B5", "#E6E6E6", "#FFFFFF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: 16,
        padding: 16,
        marginTop: 8,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <VStack className="space-y-2">
        <Text className="text-white font-semibold">Viet Hoang</Text>
        <Text className="text-white">
          Thời gian hiệu lực:{" "}
          <Text className="font-bold text-white">31/12/2025</Text>
        </Text>
      </VStack>
    </LinearGradient>
  );
}

export default function RankingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#0A327C]" edges={['top']}>
      {/* Header */}
      <HStack className="items-center px-4 py-3 bg-white">
        <Pressable onPress={() => router.navigate("/profile")}>
          <Icon as={ArrowLeftIcon} size="lg" color="black" />
        </Pressable>
        <Text className="flex-1 text-center font-semibold text-lg text-black">
          Hạng thành viên
        </Text>
      </HStack>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

        {/* Thông tin thành viên */}
        <VStack className="px-5 py-6 bg-[#0A327C]">
          <Text className="text-white text-lg font-semibold mb-2">
            Thân chào Việt Hoàng,
          </Text>
          <Text className="text-white text-base mb-4">
            Bạn đang là thành viên hạng{" "}
            <Text className="font-bold text-white">S - New</Text>
          </Text>
          {/* import LinearGradient from "react-native-linear-gradient"; */}
          <LinearGradient
            colors={["#7F7F7F", "#B5B5B5", "#E6E6E6", "#FFFFFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 16,
              paddingVertical: 40,
              paddingLeft: 30,
              marginTop: 8,
            }}
          >
            <VStack className="space-y-2">
              <Text className="text-white font-semibold">Viet Hoang</Text>
              <Text className="text-white">Thời gian hiệu lực: </Text>
              <Text className="font-bold text-lg text-white">31/12/2025</Text>
            </VStack>
          </LinearGradient>
        </VStack>

        {/* Thông báo khởi động */}
        <Box className="bg-white rounded-t-3xl p-5 -mt-3">
          <Text className="text-center text-lg font-bold text-gray-900 mb-2">
            Khởi động chu kỳ mới!
          </Text>
          <Text className="text-center text-gray-700 mb-5">
            Thứ hạng của bạn đã được cập nhật lại từ{" "}
            <Text className="font-semibold">S - Null</Text> thành{" "}
            <Text className="font-semibold">S - New</Text>. Hãy tiếp tục tích
            lũy để nhận thêm nhiều quyền lợi và ưu đãi hơn!
          </Text>

          {/* 3 chỉ số */}
          <HStack className="justify-between mb-6">
            <VStack className="items-center flex-1">
              <Image
                source={{
                  uri: "https://rtkvn.vn/wp-content/uploads/2022/08/icon-voucher.png",
                }}
                style={{ width: 40, height: 40, marginBottom: 6 }}
              />
              <Text className="text-gray-700 text-sm">Đã sử dụng</Text>
              <Text className="font-bold text-gray-900">10</Text>
            </VStack>
            <VStack className="items-center flex-1">
              <Image
                source={{
                  uri: "https://e7.pngegg.com/pngimages/459/122/png-clipart-savings-account-computer-icons-bank-save-saving-orange-thumbnail.png",
                }}
                style={{ width: 40, height: 40, marginBottom: 6 }}
              />
              <Text className="text-gray-700 text-sm">Tiết kiệm</Text>
              <Text className="font-bold text-gray-900">600.590đ</Text>
            </VStack>
          </HStack>

          {/* Xem thêm ưu đãi */}
          <Pressable className="items-center mt-4">
            <Text className="text-base text-blue-600 font-semibold mb-2">
              Xem thêm ưu đãi
            </Text>
            <Image
              source={{
                uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5f6qWgTZI0XL9r8jhe0jHXkM6JkgOgUQp4A&s",
              }}
              style={{ width: 100, height: 100 }}
            />
          </Pressable>
        </Box>
        <Box className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
