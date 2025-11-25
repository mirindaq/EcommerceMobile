import ChatTypeModal from "@/components/chat/ChatTypeModal";
import {
  Avatar,
  AvatarImage,
  Box,
  HStack,
  Icon,
  Pressable,
  SafeAreaView,
  Spinner,
  Text,
  VStack,
} from "@/components/ui";
import { authService } from "@/services/auth.service";
import { CustomerSummary } from "@/types/customer.type";
import AuthStorageUtil from "@/utils/authStorage.util";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ChevronRightIcon,
  HeartIcon,
  LogOut,
  MapPinIcon,
  MessageCircleIcon,
  PackageIcon,
  PersonStandingIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  TicketIcon,
  WalletIcon,
  WrenchIcon,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { Alert, ScrollView } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  // Lưu ý: Đảm bảo interface CustomerSummary của bạn đã có trường rank: { name: string }
  const [customer, setCustomer] = useState<CustomerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChatModal, setShowChatModal] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const isAuthenticated = await AuthStorageUtil.isAuthenticated();
      if (!isAuthenticated) {
        router.replace("/login");
        return;
      }
      const res = await authService.getProfile();
      if (res.data && res.data.data) {
        setCustomer(res.data.data as unknown as CustomerSummary);
      } else if (res.data) {
        setCustomer(res.data as unknown as CustomerSummary);
      }
    } catch (error) {
      console.error("Lỗi lấy profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đồng ý",
        onPress: async () => {
          await AuthStorageUtil.clearAll();
          router.replace("/login");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Spinner size="large" color="#EF4444" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Header */}
        {/* Header */}
        <Box className="bg-red-500 pt-8 pb-4">
          <Box className="px-4">
            {/* Info Section */}
            <HStack className="items-center justify-between mb-4">
              <HStack className="items-center space-x-3">
                <Avatar size="lg" className="border-2 mr-3 border-white">
                  <AvatarImage
                    source={{
                      uri:
                        customer?.avatar ||
                        "https://aic.com.vn/wp-content/uploads/2024/10/avatar-fb-mac-dinh-1.jpg",
                    }}
                    alt="avatar"
                  />
                </Avatar>
                <VStack>
                  <Text className="text-white font-bold text-lg">
                    {customer?.fullName || "Khách hàng"}
                  </Text>
                  <Box className="bg-red-600/50 self-start px-2 py-0.5 rounded-full mt-1">
                    <Text className="text-white/90 text-xs font-medium">
                      {customer?.rank?.name || "Thành viên"}
                    </Text>
                  </Box>
                </VStack>
              </HStack>
              <HStack space="xl">
                <Pressable onPress={() => router.push("/my-wishlist")}>
                  <HeartIcon size={24} color="white" />
                </Pressable>
                <Pressable onPress={() => router.push("/cart")}>
                  <ShoppingCartIcon size={24} color="white" />
                </Pressable>
                <Pressable onPress={() => setShowChatModal(true)}>
                  <MessageCircleIcon size={24} color="white" />
                </Pressable>
              </HStack>
            </HStack>

            {/* --- BANNER STYLE SHOPEE --- */}
            <Pressable
              onPress={() => router.push("/my-voucher")} // Link tới trang voucher hoặc ưu đãi
              className="bg-[#FFF8E1] rounded-lg p-2.5 flex-row items-center justify-between mt-2"
            >
              <HStack className="items-center flex-1 mr-2">
                {/* Badge VIP giả lập */}
                <Box className="bg-[#F59E0B] px-1.5 py-0.5 rounded mr-2">
                  <Text className="text-white text-[10px] font-bold">
                    {customer?.rank.name || "Thành viên"}
                  </Text>
                </Box>

                {/* Text chính */}
                <Text
                  numberOfLines={1}
                  className="text-gray-800 text-sm font-medium flex-1"
                >
                  Hàng vạn ưu đãi đang chờ bạn khám phá!
                </Text>
              </HStack>

              {/* Mũi tên chỉ sang phải */}
              <ChevronRightIcon size={16} color="#9CA3AF" />
            </Pressable>
          </Box>
        </Box>

        {/* Đơn mua */}
        <Box className="bg-white mt-3 px-4 py-3">
          <Text className="font-semibold text-gray-900 mb-3">Đơn mua</Text>
          <Pressable
            onPress={() => router.push("/order-history")}
            className="flex-row items-center justify-between py-2"
          >
            <HStack className="items-center space-x-3">
              <Icon as={PackageIcon} size="lg" className="text-red-500" />
              <Text className="text-gray-800 ml-3 text-base">
                Lịch sử mua hàng
              </Text>
            </HStack>
            <ChevronRightIcon size={20} color="#9CA3AF" />
          </Pressable>
        </Box>

        {/* Tiện ích của tôi */}
        <Box className="bg-white mt-3 px-4 py-3">
          <Text className="font-semibold text-gray-900 mb-3">
            Tiện ích của tôi
          </Text>
          <HStack className="flex-wrap justify-between">
            {[
              { label: "Hạng thành viên", icon: WalletIcon },
              { label: "Voucher", icon: TicketIcon },
            ].map((item, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  if (item.label === "Hạng thành viên") router.push("/ranking");
                  if (item.label === "Voucher") router.push("/my-voucher");
                }}
                className="items-center justify-center w-[48%] bg-gray-50 rounded-xl py-3 mb-2"
              >
                <Icon as={item.icon} size="lg" className="text-red-500 mb-1" />
                <Text className="text-sm text-gray-700">{item.label}</Text>
              </Pressable>
            ))}
          </HStack>
        </Box>

        {/* Tiện ích khác */}
        <Box className="bg-white mt-3 px-4 py-3 rounded-xl">
          <Text className="font-semibold text-gray-900 mb-3">
            Tiện ích khác
          </Text>
          <HStack className="flex-wrap justify-between">
            {[
              {
                label: "Thông tin cá nhân",
                icon: PersonStandingIcon,
                onPress: () => router.push("/edit-profile"),
              },
              {
                label: "Địa chỉ giao hàng",
                icon: MapPinIcon,
                onPress: () => router.push("/my-address"),
              },
              {
                label: "Bảo hành & sửa chữa",
                icon: WrenchIcon,
                onPress: () => router.push("/guarantee-policy"),
              },
              {
                label: "Điều khoản sử dụng",
                icon: ShieldCheckIcon,
                onPress: () => router.push("/term-of-use"),
              },
            ].map((item, i) => (
              <Pressable
                key={i}
                onPress={item.onPress}
                className="items-center justify-center w-[48%] bg-gray-50 rounded-xl py-3 mb-2"
              >
                <Icon as={item.icon} size="lg" className="text-red-500 mb-1" />
                <Text className="text-sm text-gray-700 text-center">
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </HStack>
        </Box>

        {/* Tài khoản */}
        <Box className="bg-white mt-3 px-4 py-3">
          <Text className="font-semibold text-gray-900 mb-3">Tài khoản</Text>
          <Pressable
            onPress={handleLogout}
            className="flex-row items-center justify-between py-2"
          >
            <HStack className="items-center space-x-3">
              <Icon as={LogOut} size="lg" className="text-gray-700" />
              <Text className="text-gray-800 ml-3 text-base">Đăng xuất</Text>
            </HStack>
            <ChevronRightIcon size={20} color="#9CA3AF" />
          </Pressable>
        </Box>

        <Box className="h-24" />
      </ScrollView>

      <ChatTypeModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
      />
    </SafeAreaView>
  );
}
