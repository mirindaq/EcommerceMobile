import {
  Box,
  HStack,
  Icon,
  Pressable,
  Text,
  VStack
} from '@/components/ui';
import type { Product } from '@/types/product.type';
import { useRouter } from 'expo-router';
import { HeartIcon, StarIcon } from 'lucide-react-native';
import React from 'react';
import { Image } from 'react-native';

interface ProductBoxProps {
  product: Product;
}

export default function ProductBox({ product }: ProductBoxProps) {
  const router = useRouter();

  // Format price helper
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const firstVariant =
    product.variants && product.variants.length > 0
      ? product.variants[0]
      : null;

  const productImage =
    product.thumbnail ||
    (product.productImages && product.productImages.length > 0
      ? product.productImages[0]
      : 'https://via.placeholder.com/150'); // Fallback image

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

  const displayRating = product.rating > 0 ? product.rating.toFixed(1) : null;

  const handleProductPress = () => {
    router.push(`/product-detail?slug=${product.slug}`);
  };

  const handleAddToWishlist = (e: any) => {
    e.stopPropagation(); // Ngăn chặn click vào cha (chuyển trang)
    // TODO: Logic add wishlist
    console.log('Add to wishlist');
  };

  return (
    <Pressable
      className="bg-white rounded-xl overflow-hidden border border-gray-100 flex-1 m-1"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, // Giảm shadow cho nhẹ nhàng hơn
        shadowRadius: 8,
        elevation: 2,
      }}
      onPress={handleProductPress}
    >
      {/* --- IMAGE AREA --- */}
      <Box className="relative bg-gray-50 aspect-square">
        <Image
          source={{ uri: productImage }}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Discount Badge - Minimalist */}
        {discountPercent > 0 && (
          <Box className="absolute top-0 left-0 bg-red-500 px-2 py-1 rounded-br-xl z-10">
            <Text className="text-white font-bold text-[10px]">
              -{discountPercent}%
            </Text>
          </Box>
        )}

        {/* Wishlist Button - Floating & Accessible */}
        <Pressable
          className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-sm"
          onPress={handleAddToWishlist}
        >
          <Icon as={HeartIcon} size="sm" className="text-gray-600" />
        </Pressable>
      </Box>

      {/* --- INFO AREA --- */}
      <VStack className="p-3 justify-between flex-1 gap-1">
        {/* Category / Brand (Optional - adds context) */}
        {/* <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">
          {product.category?.name || 'Sản phẩm'}
        </Text> */}

        {/* Product Name */}
        <Text
          className="text-gray-800 font-medium text-sm leading-5"
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {product.name}
        </Text>

        {/* Rating & Sold Count */}
        <HStack className="items-center gap-1 mt-1">
          <Icon as={StarIcon} size="xs" className="text-yellow-400 fill-yellow-400" />
          <Text className="text-gray-600 text-xs font-medium">
            {displayRating || '5.0'}
          </Text>

        </HStack>

        {/* Price Section - Bottom Align */}
        <VStack className="mt-2">
          <HStack className="items-baseline gap-1">
            <Text className="text-red-600 font-bold text-base">
              {firstVariant ? formatPrice(firstVariant.price) : 'Liên hệ'}
            </Text>
            {/* <Text className="text-gray-500 font-semibold text-xs underline">đ</Text> */}
          </HStack>
          
          {/* Old Price - Subtle */}
          {firstVariant &&
            firstVariant.oldPrice > 0 &&
            firstVariant.price < firstVariant.oldPrice && (
              <Text className="text-gray-400 text-xs line-through">
                {formatPrice(firstVariant.oldPrice)}
              </Text>
            )}
        </VStack>
      </VStack>

      {/* Optional: Add Cart Button overlay on bottom right if needed, 
          but usually clean card is better */}
    </Pressable>
  );
}