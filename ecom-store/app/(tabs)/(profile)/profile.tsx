import React from "react";
import { ScrollView, Image } from "react-native";
import {
  Box,
  VStack,
  HStack,
  Text,
  Pressable,
  Icon,
  Badge,
  BadgeText,
  Avatar,
  AvatarImage,
  SafeAreaView,
  Divider,
} from "@/components/ui";
import {
  ShoppingCartIcon,
  MessageCircleIcon,
  ChevronRightIcon,
  PackageIcon,
  TruckIcon,
  CheckCircleIcon,
  CreditCardIcon,
  SmartphoneIcon,
  UtensilsIcon,
  WalletIcon,
  TicketIcon,
  PiggyBankIcon,
  ShieldCheckIcon,
  LogOut,
  WrenchIcon,
  ReceiptIcon,
  MapPinIcon,
  GiftIcon,
  PersonStandingIcon,
} from "lucide-react-native";

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Box className="bg-red-500 px-4 pt-8 pb-6">
          <HStack className="items-center justify-between mb-4">
            <HStack className="items-center space-x-3">
              <Avatar size="lg" className="border-2 mr-3 border-white">
                <AvatarImage
                  source={{
                    uri: "https://aic.com.vn/wp-content/uploads/2024/10/avatar-fb-mac-dinh-1.jpg",
                  }}
                  alt="avatar"
                />
              </Avatar>
              <VStack>
                <Text className="text-white font-bold text-lg">Việt Hoàng</Text>
                <Text className="text-white text-sm">S - New</Text>
              </VStack>
            </HStack>
            <HStack space="3xl">
              <Pressable>
                <ShoppingCartIcon size={24} color="white" />
              </Pressable>
              <Pressable>
                <MessageCircleIcon size={24} color="white" />
              </Pressable>
            </HStack>
          </HStack>
        </Box>

        <Box className="bg-white mt-3 px-4 py-3">
          <HStack className="items-center justify-between mb-3">
            <Text className="font-semibold text-gray-900">Đơn mua</Text>
            <Pressable className="flex-row items-center">
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
              <Pressable key={i} className="items-center flex-1">
                <Icon as={item.icon} size="lg" className="text-gray-700 mb-1" />
                <Text className="text-xs text-gray-700 text-center">
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </HStack>
        </Box>

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
                className="items-center justify-center w-[48%] bg-gray-50 rounded-xl py-3 mb-2"
              >
                <Icon as={item.icon} size="lg" className="text-red-500 mb-1" />
                <Text className="text-sm text-gray-700">{item.label}</Text>
              </Pressable>
            ))}
          </HStack>
        </Box>

        {/* <Box className="bg-white mt-3 px-4 py-3">
          <Text className="font-semibold text-gray-900 mb-3">
            Dịch vụ tài chính
          </Text>
          <HStack className="justify-between">
            {[
              { label: "Vay tiêu dùng", icon: ShieldCheckIcon },
              { label: "Tải ShopeePay", icon: SmartphoneIcon },
            ].map((item, i) => (
              <Pressable key={i} className="items-center flex-1">
                <Icon
                  as={item.icon}
                  size="lg"
                  className="text-orange-500 mb-1"
                />
                <Text className="text-xs text-gray-700 text-center">
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </HStack>
        </Box> */}

        <Box className="bg-white mt-3 px-4 py-3 rounded-xl">
          <Text className="font-semibold text-gray-900 mb-3">
            Tiện ích khác
          </Text>
          <HStack className="flex-wrap justify-between">
            {[
              { label: "Thông tin cá nhân", icon: PersonStandingIcon },
              { label: "Địa chỉ giao hàng", icon: MapPinIcon },
              { label: "Bảo hành & sửa chữa", icon: WrenchIcon },
              { label: "Ưu đãi giảm giá", icon: GiftIcon },
            ].map((item, i) => (
              <Pressable
                key={i}
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
            { label: "Điều khoản sử dụng", icon: ShieldCheckIcon },
            {
              label: "Trò chuyện với nhân viên tư vấn",
              icon: MessageCircleIcon,
            },
            { label: "Đăng xuất", icon: LogOut },
          ].map((item, i) => (
            <Pressable
              key={i}
              className="flex-row items-center justify-between py-3 border-b border-gray-100"
            >
              <HStack className="items-center space-x-3">
                <Icon as={item.icon} size="lg" className="text-gray-700" />
                <Text className="text-gray-800">{item.label}</Text>
              </HStack>
              <ChevronRightIcon size={16} color="#9CA3AF" />
            </Pressable>
          ))}
        </Box>

        <Divider className="my-3" />
        <Box className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
