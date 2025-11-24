import { Box, HStack, Icon, Pressable, Text, VStack } from "@/components/ui";
import { wishListService } from "@/services/wishList.service";
import type { Product } from "@/types/product.type";
import { WishListResponse } from "@/types/wishList.type";
import AuthStorageUtil from "@/utils/authStorage.util";
import { useRouter } from "expo-router";
import { HeartIcon, StarIcon } from "lucide-react-native";
import React, { useMemo } from "react";
import { Image } from "react-native";

interface ProductBoxProps {
  product?: Product;
  wishListItems?: WishListResponse[];
  onWishlistChange?: () => Promise<void>;
  wishItem?: WishListResponse;
  isWishlistScreen?: boolean;
  onRemove?: (productVariantId: number) => Promise<void>;
}

export default function ProductBox({
  product,
  wishListItems = [],
  onWishlistChange,
  wishItem,
  isWishlistScreen = false,
  onRemove,
}: ProductBoxProps) {
  const router = useRouter();

  // Format price helper
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const sourceData = isWishlistScreen ? wishItem : product;

  const firstVariant = product?.variants?.[0];
  const productName =
    (isWishlistScreen && wishItem?.productName) ||
    product?.name ||
    "Sản phẩm";
  const productPrice =
    (isWishlistScreen && wishItem?.price) || firstVariant?.price || 0;
  const productVariantId =
    (isWishlistScreen && wishItem?.productVariantId) ||
    firstVariant?.id ||
    null;
  const productSlug = product?.slug;
  const productImage =
    (isWishlistScreen && wishItem?.productImage) ||
    product?.thumbnail ||
    (product?.productImages && product.productImages.length > 0
      ? product.productImages[0]
      : "https://via.placeholder.com/150");

  const discountPercent =
    firstVariant &&
    firstVariant.oldPrice > 0 &&
    firstVariant.price < firstVariant.oldPrice
      ? Math.round(
          ((firstVariant.oldPrice - firstVariant.price) /
            firstVariant.oldPrice) *
            100
        )
      : firstVariant?.discount || 0;

  const displayRating =
    product?.rating && product.rating > 0 ? product.rating.toFixed(1) : null;

  const handleProductPress = () => {
    if (productSlug) {
      router.push(`/product-detail?slug=${productSlug}`);
    } else {
      console.log("Cannot navigate: No product slug found.");
    }
  };

  const isFavorite = useMemo(() => {
    if (isWishlistScreen) return true;

    if (!Array.isArray(wishListItems) || wishListItems.length === 0) {
      return false;
    }

    if (!productVariantId) return false;

    return wishListItems.some(
      (item) => item.productVariantId === productVariantId
    );
  }, [isWishlistScreen, wishListItems, productVariantId]);

  const handleToggleWishlist = async (e: any) => {
    e.stopPropagation();

    if (!productVariantId) {
      console.log("Không tìm thấy biến thể sản phẩm.");
      return;
    }

    if (isWishlistScreen) {
      if (onRemove) {
        await onRemove(productVariantId);
        console.log(
          "Removed from wishlist (from Favorite Screen):",
          productVariantId
        );
      }
      return;
    }

    const isAuthenticated = await AuthStorageUtil.isAuthenticated();
    if (!isAuthenticated) {
      console.log("Người dùng chưa đăng nhập, không thể thao tác Wishlist.");
      return;
    }

    try {
      if (isFavorite) {
        await wishListService.removeProductFromWishList(productVariantId);
        console.log("Removed from wishlist:", productVariantId);
      } else {
        await wishListService.addProducToWishList({
          productVariantId: productVariantId,
        });
        console.log("Added to wishlist:", productVariantId);
      }

      if (onWishlistChange) {
        await onWishlistChange();
      }
    } catch (error: any) {
      console.error("Wishlist error:", error);
    }
  };

  return (
    <Pressable
      className="bg-white rounded-xl overflow-hidden border border-gray-100 flex-1 m-1"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
      onPress={handleProductPress}
    >
      <Box className="relative bg-gray-50 aspect-square">
        <Image
          source={{ uri: productImage }}
          className="w-full h-full"
          resizeMode="cover"
        />

        {discountPercent > 0 && (
          <Box className="absolute top-0 left-0 bg-red-500 px-2 py-1 rounded-br-xl z-10">
            <Text className="text-white font-bold text-[10px]">
              -{discountPercent}%
            </Text>
          </Box>
        )}

        <Pressable
          className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-sm"
          onPress={handleToggleWishlist}
        >
          <Icon
            as={HeartIcon}
            size="sm"
            className={
              isFavorite ? "text-red-500 fill-red-500" : "text-gray-600"
            }
          />
        </Pressable>
      </Box>

      <VStack className="p-3 justify-between flex-1 gap-1">
        <Text
          className="text-gray-800 font-medium text-sm leading-5"
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {product?.name || productName}
        </Text>

        <HStack className="items-center gap-1 mt-1">
          <Icon
            as={StarIcon}
            size="xs"
            className="text-yellow-400 fill-yellow-400"
          />
          <Text className="text-gray-600 text-xs font-medium">
            {displayRating || "5.0"}
          </Text>
        </HStack>

        <VStack className="mt-2">
          <HStack className="items-baseline gap-1">
            <Text className="text-red-600 font-bold text-base">
              {firstVariant ? formatPrice(firstVariant.price) : "Liên hệ"}
            </Text>
          </HStack>

          {firstVariant &&
            firstVariant.oldPrice > 0 &&
            firstVariant.price < firstVariant.oldPrice && (
              <Text className="text-gray-400 text-xs line-through">
                {formatPrice(firstVariant.oldPrice)}
              </Text>
            )}
        </VStack>
      </VStack>
    </Pressable>
  );
}
