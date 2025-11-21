import ProductBox from "@/components/ProductBox";
import { Box, HStack, SafeAreaView, Text } from "@/components/ui";
import { useHideTabBar } from "@/hooks/use-hide-tab-bar";
import { wishListService } from "@/services/wishList.service";
import { WishListResponse } from "@/types/wishList.type";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView } from "react-native";

export default function FavoriteProductsScreen() {
  const router = useRouter();
  useHideTabBar();

  const [wishList, setWishList] = useState<WishListResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWishList = useCallback(async () => {
    try {
      setLoading(true);
      const data = await wishListService.getMyWishList();
      setWishList(data || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setWishList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishList();
  }, [loadWishList]);

  const handleRemoveFromWishlist = async (productVariantId: number) => {
    try {
      const updatedList = await wishListService.removeProductFromWishList(
        productVariantId
      );
      setWishList(updatedList || []);
      console.log("Removed from wishlist:", productVariantId);
    } catch (error) {
      console.error("Error removing from wishlist:", error);
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
      {/* Header (GIỮ NGUYÊN) */}
      <Box className="bg-white px-4 py-3 border-b border-gray-200 z-10">
        {/* ... */}
      </Box>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Thông báo số lượng sản phẩm */}
        <Box className="p-4 bg-white border-b border-gray-200">
          <Text className="text-gray-700 text-sm font-medium">
            Bạn có **{wishList.length}** sản phẩm trong danh sách yêu thích.
          </Text>
        </Box>
        <Box className="px-4 py-4">
          {wishList.length === 0 ? (
            <Text className="text-gray-500 text-center mt-10">
              Danh sách yêu thích của bạn đang trống.
            </Text>
          ) : (
            <HStack space="md" className="flex-wrap justify-between">
              {wishList.map((wishItem) => (
                <Box key={wishItem.id} style={{ width: "48%" }}>
                  <ProductBox
                    // Truyền dữ liệu WishListResponse qua prop `wishItem`
                    wishItem={wishItem}
                    // Đánh dấu đây là màn hình WishList để ProductBox biết cách hiển thị
                    isWishlistScreen={true}
                    // Truyền hàm xóa
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
