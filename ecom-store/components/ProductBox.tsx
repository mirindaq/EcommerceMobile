import { Box, HStack, Icon, Pressable, Text, VStack } from "@/components/ui";
import { wishListService } from "@/services/wishList.service";
import type { Product } from "@/types/product.type";
import { WishListResponse } from "@/types/wishList.type";
import AuthStorageUtil from "@/utils/authStorage.util";
import { useRouter } from "expo-router";
import { HeartIcon, StarIcon } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Animated, Image } from "react-native";

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
  const [heartScale] = useState(new Animated.Value(1));

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
    (isWishlistScreen && wishItem?.productName) || product?.name || "Sản phẩm";
  const productPrice =
    (isWishlistScreen && wishItem?.price) || firstVariant?.price || 0;
  const productVariantId =
    (isWishlistScreen && null) || // Wishlist screen doesn't use variantId
    firstVariant?.id ||
    null;
  // Backend uses productId, not productVariantId
  const productId =
    (isWishlistScreen && wishItem?.productId) || product?.id || null;
  const productSlug =
    (isWishlistScreen && wishItem?.productSlug) || product?.slug;
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
    // Nếu là wishlist screen, dùng productSlug từ wishItem
    const slug =
      isWishlistScreen && wishItem?.productSlug
        ? wishItem.productSlug
        : productSlug;

    if (slug) {
      router.push(`/product-detail?slug=${slug}`);
    }
  };

  const isFavorite = useMemo(() => {
    if (isWishlistScreen) return true;

    if (!Array.isArray(wishListItems) || wishListItems.length === 0) {
      return false;
    }

    // Backend stores by Product, not ProductVariant
    if (!productId) return false;

    // Check if productId matches (backend response has productId field)
    return wishListItems.some((item) => item.productId === productId);
  }, [isWishlistScreen, wishListItems, productId]);

  const handleToggleWishlist = async (e: any) => {
    e.stopPropagation();

    // Animation effect khi click
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.3,
        useNativeDriver: true,
        tension: 300,
        friction: 3,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 3,
      }),
    ]).start();

    // Backend uses productId, not productVariantId
    // Nếu là wishlist screen, lấy productId từ wishItem
    const targetProductId =
      isWishlistScreen && wishItem?.productId ? wishItem.productId : productId;

    if (!targetProductId) {
      return;
    }

    if (isWishlistScreen) {
      if (onRemove) {
        await onRemove(targetProductId);
      }
      return;
    }

    const isAuthenticated = await AuthStorageUtil.isAuthenticated();
    if (!isAuthenticated) {
      return;
    }

    try {
      if (isFavorite) {
        await wishListService.removeProductFromWishList(targetProductId);
      } else {
        await wishListService.addProducToWishList({
          productId: targetProductId,
        });
      }

      if (onWishlistChange) {
        await onWishlistChange();
      }
    } catch (error: any) {
      // Silent error handling
    }
  };

  return (
    <Pressable
      className="bg-white rounded-xl overflow-hidden border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        width: "100%",
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

        <Animated.View
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            transform: [{ scale: heartScale }],
          }}
        >
          <Pressable
            className={`rounded-full p-2 shadow-lg ${
              isFavorite ? "bg-red-50" : "bg-white"
            }`}
            onPress={handleToggleWishlist}
            style={{
              borderWidth: 1,
              borderColor: isFavorite ? "#EF4444" : "#E5E7EB",
            }}
          >
            <Icon
              as={HeartIcon}
              size="md"
              className={
                isFavorite ? "text-red-600 fill-red-600" : "text-gray-700"
              }
            />
          </Pressable>
        </Animated.View>
      </Box>

      <VStack className="p-3 gap-1">
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
              {isWishlistScreen && wishItem?.price
                ? formatPrice(wishItem.price)
                : firstVariant
                ? formatPrice(firstVariant.price)
                : "Liên hệ"}
            </Text>
          </HStack>

          {/* Hiển thị giá cũ nếu có (chỉ cho product, không có trong wishItem) */}
          {!isWishlistScreen &&
            firstVariant &&
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
