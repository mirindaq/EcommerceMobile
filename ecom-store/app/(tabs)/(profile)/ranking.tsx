import {
  Box,
  HStack,
  Icon,
  Pressable,
  SafeAreaView,
  Text,
  VStack,
} from "@/components/ui";
import { useHideTabBar } from "@/hooks/use-hide-tab-bar";
import { authService } from "@/services/auth.service";
import { rankingService } from "@/services/ranking.service";
import { Rank } from "@/types/ranking.type";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeftIcon } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView } from "react-native";

// --- Types ---
// Định nghĩa interface cục bộ để khớp với response thực tế của /auth/profile
interface UserProfileData {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  totalSpending?: number; // Field bạn vừa thêm vào Backend
  totalOrders?: number; // Field thống kê (nếu có)
  rank?: {
    id: number;
    name: string; // VD: S-SILVER
    minSpending: number;
    maxSpending: number;
    discountRate: number;
  };
}

// --- Constants ---
// Định nghĩa màu Gradient cho từng hạng
const RANK_STYLES: Record<string, [string, string, ...string[]]> = {
  "S-NEW": ["#F5F5F5", "#D4D4D4", "#A3A3A3", "#737373"], // Xám
  "S-SILVER": ["#7F7F7F", "#B5B5B5", "#E6E6E6", "#FFFFFF"], // Bạc
  "S-GOLD": ["#BF953F", "#FCF6BA", "#B38728", "#FBF5B7", "#AA771C"], // Vàng
  "S-PLATINUM": ["#000000", "#434343", "#888888", "#E0E0E0"], // Bạch kim
  "S-DIAMOND": ["#B9F2FF", "#58C8DA", "#0088CC", "#004466"], // Kim cương
};

const DEFAULT_GRADIENT: [string, string, ...string[]] = [
  "#F5F5F5",
  "#D4D4D4",
  "#A3A3A3",
  "#737373",
];

// --- Helper ---
const formatCurrency = (value?: number) => {
  return (value || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
};

export default function RankingScreen() {
  const router = useRouter();
  useHideTabBar();

  // State
  const [customer, setCustomer] = useState<UserProfileData | null>(null);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Lấy thông tin user (Profile)
        const profileRes = await authService.getProfile();
        // Kiểm tra data nằm ở res.data hay res.data.data tùy interceptor
        const customerData = profileRes.data?.data || profileRes.data;

        // 2. Lấy danh sách Rank (Cấu hình hạng)
        const rankRes = await rankingService.getAllRankings();
        const rankList = rankRes.data || [];

        // Sắp xếp rank theo mức chi tiêu tăng dần (quan trọng để tính logic thăng hạng)
        rankList.sort((a, b) => a.minSpending - b.minSpending);

        setCustomer(customerData as unknown as UserProfileData);
        setRanks(rankList);
      } catch (error) {
        console.error("Lỗi tải thông tin hạng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Logic Tính Toán ---

  // Lấy tên hạng hiện tại (Fallback về S-NEW nếu null)
  const currentRankName = customer?.rank?.name || "S-NEW";

  // Lấy tổng chi tiêu hiện tại
  const currentSpending = customer?.totalSpending || 0;

  // Xác định vị trí rank hiện tại trong danh sách
  const currentRankIndex = ranks.findIndex((r) => r.name === currentRankName);

  // Tìm rank kế tiếp
  const nextRank =
    currentRankIndex !== -1 && currentRankIndex < ranks.length - 1
      ? ranks[currentRankIndex + 1]
      : null;

  // Tính số tiền cần mua thêm
  const neededAmount = nextRank ? nextRank.minSpending - currentSpending : 0;

  // Lấy màu gradient (Dùng ép kiểu để fix lỗi TypeScript LinearGradient)
  const gradientColors = RANK_STYLES[currentRankName] || DEFAULT_GRADIENT;

  // Tính phần trăm tiến độ (cho Progress Bar)
  const progressPercent = nextRank
    ? Math.min((currentSpending / nextRank.minSpending) * 100, 100)
    : 100;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0A327C] items-center justify-center">
        <ActivityIndicator size="large" color="#FFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0A327C]" edges={["top"]}>
      {/* Header */}
      <HStack className="items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <Pressable onPress={() => router.push("/(tabs)/(profile)/profile")}>
          <Icon as={ArrowLeftIcon} size="lg" color="#000" />
        </Pressable>
        <Text className="flex-1 text-center font-semibold text-lg text-black">
          Hạng thành viên
        </Text>
        <Box className="w-6" />
      </HStack>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Phần trên: Thông tin & Thẻ thành viên */}
        <VStack className="px-5 py-6 bg-[#0A327C]">
          <Text className="text-white text-lg font-semibold mb-2">
            Thân chào {customer?.fullName},
          </Text>
          <Text className="text-white text-base mb-4">
            Bạn đang là thành viên hạng{" "}
            <Text className="font-bold text-white">{currentRankName}</Text>
          </Text>

          {/* Thẻ thành viên Dynamic */}
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 16,
              paddingVertical: 30, // Tăng padding để thẻ to đẹp hơn
              paddingHorizontal: 25,
              marginTop: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 8,
              minHeight: 180, // Đảm bảo chiều cao tối thiểu
              justifyContent: "space-between",
            }}
          >
            <VStack>
              <Text className="text-white font-bold text-2xl uppercase tracking-widest shadow-sm">
                {currentRankName.replace("S-", "")} MEMBER
              </Text>
              <Text className="text-white text-xs opacity-80 mt-1">
                CellphoneZ Loyalty Program
              </Text>
            </VStack>

            <VStack className="space-y-1">
              <Text className="text-white font-semibold text-lg">
                {customer?.fullName}
              </Text>
              <Text className="text-white opacity-90 text-sm">
                Chi tiêu tích lũy:
              </Text>
              <Text className="font-bold text-xl text-white">
                {formatCurrency(currentSpending)}
              </Text>
            </VStack>
          </LinearGradient>
        </VStack>

        {/* Phần dưới: Thông tin thăng hạng & Thống kê */}
        <Box className="bg-white rounded-t-3xl p-5 -mt-4 min-h-[500px]">
          <Text className="text-center text-lg font-bold text-gray-900 mb-2">
            Lộ trình thăng hạng
          </Text>

          <Text className="text-center text-gray-700 mb-5 px-2 leading-6">
            {nextRank ? (
              <>
                Bạn cần chi tiêu thêm{" "}
                <Text className="font-bold text-red-500">
                  {formatCurrency(neededAmount > 0 ? neededAmount : 0)}
                </Text>{" "}
                để đạt hạng{" "}
                <Text className="font-bold text-[#0A327C]">
                  {nextRank.name}
                </Text>
                .
              </>
            ) : (
              <Text className="text-green-600 font-bold">
                Tuyệt vời! Bạn đã đạt hạng cao nhất.
              </Text>
            )}
          </Text>

          {/* Progress Bar */}
          {nextRank && (
            <VStack className="mb-8">
              <Box className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <Box
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </Box>
              <HStack className="justify-between mt-2">
                <Text className="text-xs text-gray-500">{currentRankName}</Text>
                <Text className="text-xs text-gray-500">{nextRank.name}</Text>
              </HStack>
            </VStack>
          )}

          <Box className="h-[1px] bg-gray-100 w-full mb-6" />

          {/* Các chỉ số thống kê */}
          <HStack className="justify-between mb-8">
            {/* Cột bên trái: Thay bằng % Giảm giá của hạng */}
            <VStack className="items-center flex-1 border-r border-gray-100">
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/726/726476.png", // Icon % giảm giá
                }}
                style={{ width: 40, height: 40, marginBottom: 8 }}
                resizeMode="contain"
              />
              <Text className="text-gray-500 text-xs">Quyền lợi giảm giá</Text>
              <Text className="font-bold text-gray-900 text-lg">
                {/* Lấy % giảm giá từ Rank, nếu chưa có thì hiện 0% */}
                {customer?.rank?.discountRate || 0}%
              </Text>
            </VStack>

            <VStack className="items-center flex-1">
              <Image
                source={{
                  uri: "https://e7.pngegg.com/pngimages/459/122/png-clipart-savings-account-computer-icons-bank-save-saving-orange-thumbnail.png",
                }}
                style={{ width: 40, height: 40, marginBottom: 8 }}
                resizeMode="contain"
              />
              <Text className="text-gray-500 text-xs">Tổng chi tiêu</Text>
              <Text className="font-bold text-gray-900 text-lg">
                {formatCurrency(currentSpending)}
              </Text>
            </VStack>
          </HStack>

          {/* Nút xem voucher */}
          <Pressable
            className="items-center py-4 bg-blue-50 rounded-xl"
            onPress={() => router.push("/my-voucher")}
          >
            <Text className="text-base text-blue-600 font-bold mb-2">
              Kho Voucher & Ưu đãi
            </Text>
            <Image
              source={{
                uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5f6qWgTZI0XL9r8jhe0jHXkM6JkgOgUQp4A&s",
              }}
              style={{ width: 80, height: 60 }}
              resizeMode="contain"
            />
          </Pressable>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
