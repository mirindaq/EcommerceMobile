import {
  Box,
  HStack,
  Pressable,
  SafeAreaView,
  Text,
  VStack,
} from "@/components/ui";
import { useHideTabBar } from "@/hooks/use-hide-tab-bar";
import { voucherService } from "@/services/voucher.service";
import { VoucherAvailableResponse } from "@/types/voucher.type";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  View,
} from "react-native";

export default function VoucherScreen() {
  const router = useRouter();
  useHideTabBar();

  const [vouchers, setVouchers] = useState<VoucherAvailableResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoading(true);
        // Gọi API lấy danh sách voucher khả dụng
        // Giả định API này đã lọc theo status SENT và voucher còn hạn
        const data = await voucherService.getAvailableVouchers();
        if (data) {
          setVouchers(data);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách voucher:", error);
        Alert.alert("Lỗi", "Không thể tải danh sách mã giảm giá.");
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#EF4444" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <HStack className="items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <Pressable onPress={() => router.push("/(tabs)/(profile)/profile")}>
          <ChevronLeft size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-semibold">Mã Giảm Giá</Text>
        <View style={{ width: 24 }} />
      </HStack>

      {/* List */}
      <ScrollView>
        {vouchers.length === 0 ? (
          <Box className="items-center py-10">
            <Text className="text-gray-500">Bạn chưa có mã giảm giá nào.</Text>
          </Box>
        ) : (
          vouchers.map((voucher, index) => (
            <HStack
              // Key duy nhất = id + vị trí trong mảng (để tránh lỗi trùng id 101)
              key={`${voucher.id}-${index}`}
              className="px-4 py-3 border-b border-gray-100 bg-white mb-2 mx-2 rounded-lg shadow-sm mt-2"
            >
              {/* Image */}
              <Image
                source={{
                  uri: "https://thumbs.dreamstime.com/b/gift-voucher-round-red-gold-label-isolated-transparent-background-gift-voucher-gift-voucher-gift-voucher-round-red-gold-352610206.jpg",
                }}
                style={{ width: 70, height: 70, borderRadius: 8 }}
                resizeMode="contain"
              />

              {/* Info */}
              <VStack className="flex-1 ml-3 justify-between">
                <View>
                  <Text className="font-bold text-gray-800" numberOfLines={2}>
                    {voucher.name}
                  </Text>
                  <Text className="text-red-500 font-semibold text-xs mt-1">
                    Giảm {voucher.discount}% (Tối đa{" "}
                    {formatCurrency(voucher.maxDiscountAmount)})
                  </Text>
                  <Text className="text-gray-600 text-xs mt-1">
                    Đơn tối thiểu {formatCurrency(voucher.minOrderAmount)}
                  </Text>
                </View>
                <Text className="text-gray-400 text-[10px] mt-1">
                  HSD: {formatDate(voucher.startDate)} -{" "}
                  {formatDate(voucher.endDate)}
                </Text>
              </VStack>

              {/* Button */}
              <VStack className="justify-center ml-2">
                <Pressable
                  className="border border-red-500 px-3 py-1 rounded-lg bg-red-50"
                  onPress={() => {
                    // Điều hướng về trang chủ hoặc trang sản phẩm để dùng voucher
                    router.push("/(tabs)");
                  }}
                >
                  <Text className="text-red-500 text-xs font-bold">
                    Dùng ngay
                  </Text>
                </Pressable>
              </VStack>
            </HStack>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
