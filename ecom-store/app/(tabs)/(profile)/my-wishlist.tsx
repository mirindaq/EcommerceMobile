import ProductBox from "@/components/ProductBox";
import {
  Box,
  HStack,
  Pressable,
  SafeAreaView,
  Text,
  VStack,
} from "@/components/ui";
import { useHideTabBar } from "@/hooks/use-hide-tab-bar";
import { wishListService } from "@/services/wishList.service";
import { WishListResponse } from "@/types/wishList.type";
import { useRouter } from "expo-router";
import {
  ArrowLeftIcon,
  HeartIcon,
  ShoppingCartIcon,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

export default function FavoriteProductsScreen() {
  const router = useRouter();
  useHideTabBar();

  const [wishList, setWishList] = useState<WishListResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWishList = useCallback(async () => {
    try {
      setLoading(true);
      const data = await wishListService.getMyWishList();
      // Đảm bảo data luôn là một mảng
      setWishList(Array.isArray(data) ? data : []);
    } catch (error) {
      setWishList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishList();
  }, [loadWishList]);

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      const updatedList = await wishListService.removeProductFromWishList(
        productId
      );
      // Đảm bảo updatedList luôn là một mảng
      setWishList(Array.isArray(updatedList) ? updatedList : []);
    } catch (error) {
      // Reload wishlist nếu có lỗi
      loadWishList();
    }
  };

  const handleGoBack = () => {
    router.push("/(tabs)/(profile)/profile");
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <Box className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EF4444" />
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header - Đồng nhất với các trang profile khác */}
      <HStack className="items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <Pressable onPress={handleGoBack}>
          <ArrowLeftIcon size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-semibold">Danh sách yêu thích</Text>
        <View style={{ width: 24 }} />
      </HStack>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Thông báo số lượng sản phẩm */}
        {wishList.length > 0 && (
          <Box className="p-4 bg-white border-b border-gray-200">
            <Text className="text-gray-700 text-sm font-medium">
              Bạn có{" "}
              <Text className="font-bold text-red-600">{wishList.length}</Text>{" "}
              sản phẩm trong danh sách yêu thích.
            </Text>
          </Box>
        )}

        <Box className="px-4 py-4">
          {wishList.length === 0 ? (
            <VStack className="items-center justify-center py-20 px-4">
              <Box className="w-24 h-24 bg-red-50 rounded-full items-center justify-center mb-4">
                <HeartIcon size={48} color="#EF4444" />
              </Box>
              <Text className="text-gray-900 font-bold text-lg mb-2 text-center">
                Chưa có sản phẩm yêu thích
              </Text>
              <Text className="text-gray-500 text-center text-sm mb-6">
                Hãy thêm sản phẩm vào danh sách yêu thích để dễ dàng tìm lại sau
              </Text>
              <Pressable
                onPress={() => router.push("/(tabs)")}
                className="bg-red-600 px-6 py-3 rounded-lg flex-row items-center"
              >
                <ShoppingCartIcon size={20} color="white" />
                <Text className="text-white font-semibold ml-2">
                  Tiếp tục mua sắm
                </Text>
              </Pressable>
            </VStack>
          ) : (
            <HStack space="md" className="flex-wrap justify-between">
              {wishList.map((wishItem) => (
                <Box key={wishItem.id} style={{ width: "48%" }}>
                  <ProductBox
                    wishItem={wishItem}
                    isWishlistScreen={true}
                    onRemove={handleRemoveFromWishlist}
                  />
                </Box>
              ))}
            </HStack>
          )}
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
