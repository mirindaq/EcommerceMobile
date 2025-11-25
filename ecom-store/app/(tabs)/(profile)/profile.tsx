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
  CheckCircleIcon,
  ChevronRightIcon,
  GiftIcon,
  HeartIcon,
  LogOut,
  MapPinIcon,
  MessageCircleIcon,
  PackageIcon,
  PersonStandingIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  TicketIcon,
  TruckIcon,
  WalletIcon,
  WrenchIcon,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { Alert, ScrollView } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChatModal, setShowChatModal] = useState(false);

  // ProfileScreen.tsx - Cập nhật hàm fetchProfile

  const fetchProfile = async () => {
    try {
      setLoading(true);

      // 1. Chỉ cần check Auth (có token chưa)
      const isAuthenticated = await AuthStorageUtil.isAuthenticated();
      if (!isAuthenticated) {
        router.replace("/login");
        return;
      }

      // 2. Gọi API getProfile bằng Token (không cần truyền ID)
      // API này backend sẽ tự biết ai đang gọi dựa vào Token
      const res = await authService.getProfile();

      // Lưu ý: Kiểm tra cấu trúc response của authService.getProfile
      // Thường là res.data.data hoặc res.data tùy backend của bạn
      if (res.data && res.data.data) {
        setCustomer(res.data.data as unknown as CustomerSummary);
      } else if (res.data) {
        // Fallback nếu cấu trúc khác
        setCustomer(res.data as unknown as CustomerSummary);
      }
    } catch (error) {
      console.error("Lỗi lấy profile:", error);
      // Nếu token hết hạn (lỗi 401), authService thường có interceptor xử lý hoặc ta tự logout
    } finally {
      setLoading(false);
    }
  };

  // Gọi mỗi khi màn hình được focus
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
          await AuthStorageUtil.clearAll(); // Dùng hàm clearAll như trong file util
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
        <Box className="bg-red-500 px-4 pt-8 pb-3">
          <HStack className="items-center justify-between mb-4">
            <HStack className="items-center space-x-3">
              <Avatar size="lg" className="border-2 mr-3 border-white">
                <AvatarImage
                  source={{
                    // Ưu tiên avatar từ API, nếu không có thì dùng ảnh mặc định
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
          <Text className="text-white text-md text-center mt-3">
            Hàng ngàn ưu đãi đang chờ bạn khám phá!
          </Text>
        </Box>

        <Box className="bg-white mt-3 px-4 py-3">
          <HStack className="items-center justify-between mb-3">
            <Text className="font-semibold text-gray-900">Đơn mua</Text>
            <Pressable
              className="flex-row items-center"
              onPress={() => router.push("/order-history")}
            >
              <Text className="text-red-500 text-sm">Xem lịch sử mua hàng</Text>
              <ChevronRightIcon size={16} color="#EF4444" />
            </Pressable>
          </HStack>
          <HStack className="justify-between">
            {[
              { label: "Chờ xác nhận", icon: CheckCircleIcon },
              { label: "Chờ lấy hàng", icon: PackageIcon },
              { label: "Chờ giao hàng", icon: TruckIcon },
            ].map((item, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  if (item.label === "Chờ xác nhận")
                    router.push("/pending-confirm");
                  if (item.label === "Chờ lấy hàng")
                    router.push("/pending-pickup");
                  if (item.label === "Chờ giao hàng")
                    router.push("/pending-delivery");
                }}
                className="items-center flex-1"
              >
                <Icon as={item.icon} size="lg" className="text-gray-700 mb-1" />
                <Text className="text-xs text-gray-700 text-center">
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </HStack>
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
                label: "Ưu đãi giảm giá",
                icon: GiftIcon,
                onPress: () => router.push("/view-promotion"),
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

        <Box className="bg-white mt-3 px-4 py-3">
          <Text className="font-semibold text-gray-900 mb-3">Hỗ trợ</Text>
          {[
            {
              label: "Điều khoản sử dụng",
              icon: ShieldCheckIcon,
              onPress: () => router.push("/term-of-use"),
            },
            {
              label: "Trò chuyện tư vấn",
              icon: MessageCircleIcon,
              onPress: () => setShowChatModal(true),
            },
            { label: "Đăng xuất", icon: LogOut, onPress: handleLogout },
          ].map((item, i) => (
            <Pressable
              key={i}
              onPress={item.onPress}
              className="flex-row items-center justify-between py-3 border-b border-gray-100"
            >
              <HStack className="items-center space-x-3">
                <Icon as={item.icon} size="lg" className="text-gray-700" />
                <Text className="text-gray-800 ml-3">{item.label}</Text>
              </HStack>
              <ChevronRightIcon size={16} color="#9CA3AF" />
            </Pressable>
          ))}
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
