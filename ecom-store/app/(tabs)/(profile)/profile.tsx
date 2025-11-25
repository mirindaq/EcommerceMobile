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
        <Box className="bg-red-500 px-4 pt-8 pb-3">
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

        {/* --- TIỆN ÍCH KHÁC (ĐÃ SỬA: Bento Grid) --- */}
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
            ].map((item, i) => {
              // Kiểm tra xem có phải item cuối cùng (Bảo hành) không
              const isLastItem = i === 2;

              return (
                <Pressable
                  key={i}
                  onPress={item.onPress}
                  // Logic: Nếu là cuối cùng thì w-full và flex-row (ngang), còn lại w-[48%] và dọc
                  className={`items-center justify-center bg-gray-50 rounded-xl py-3 mb-2 ${
                    isLastItem ? "w-full flex-row space-x-2 py-6" : "w-[48%]"
                  }`}
                >
                  <Icon
                    as={item.icon}
                    size="lg"
                    // Nếu nằm ngang thì bỏ margin bottom (mb-0), thêm margin right (đã có space-x-2 lo)
                    className={`text-red-500 ${isLastItem ? "mr-2" : "mb-1"}`}
                  />
                  <Text className="text-sm text-gray-700 text-center">
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </HStack>
        </Box>

        {/* Hỗ trợ */}
        <Box className="bg-white mt-3 px-4 py-3">
          <Text className="font-semibold text-gray-900 mb-3">Hỗ trợ</Text>
          {[
            {
              label: "Điều khoản sử dụng",
              icon: ShieldCheckIcon,
              onPress: () => router.push("/term-of-use"),
            },
            { label: "Đăng xuất", icon: LogOut, onPress: handleLogout },
          ].map((item, i) => (
            <Pressable
              key={i}
              onPress={item.onPress}
              className={`flex-row items-center justify-between py-3 ${
                i < 2 ? "border-b border-gray-100" : ""
              }`}
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
