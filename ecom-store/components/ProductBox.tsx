import React from 'react';
import { Image } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Box, HStack, VStack, Text, Pressable, Badge, BadgeText, Icon,
} from '@/components/ui';
import {
  StarIcon, TruckIcon, MapPinIcon,
  HeartIcon,
} from 'lucide-react-native';

interface ProductBoxProps {
  product: {
    id: number;
    name: string;
    price: string;
    originalPrice?: string;
    discount?: string;
    rating: number;
    soldCount: string;
    image: string;
    deliveryTime: string;
    location: string;
    isLive?: boolean;
  };
}

export default function ProductBox({ product }: ProductBoxProps) {
  const router = useRouter();

  const handleProductPress = () => {
    router.push('/product-detail');
  };

  return (
    <Pressable 
      className="bg-white rounded-2xl overflow-hidden border border-gray-300 mb-4"
      onPress={handleProductPress}
    >
      <Box className="relative">
        <Image
          source={{ uri: product.image }}
          className="w-full h-48"
          resizeMode="cover"
          alt={`product-image-${product.id}`}
        />

        {/* Tag giảm giá */}
        {product.discount && (
          <Badge className="absolute top-2 right-2 bg-red-500 rounded-lg px-2 py-1">
            <BadgeText className="text-white font-bold text-xs">
              -{product.discount}%
            </BadgeText>
          </Badge>
        )}

        {/* Icon tiện ích ở cạnh phải */}
        <VStack className="absolute right-2 bottom-2">
          <Box className="bg-blue-50 rounded-full p-2">
            <HeartIcon size={16} color="#EF4444" />
          </Box>

        </VStack>
      </Box>

      {/* Thông tin sản phẩm */}
      <VStack className="p-3">
        <Text className="text-gray-900 font-medium text-sm mb-1">
          {product.name}
        </Text>

        {/* Rating & đã bán */}
        <HStack className="items-center mb-2">
          <Icon as={StarIcon} size="sm" className="text-yellow-400 mr-1" />
          <Text className="text-gray-800 font-semibold text-xs">{product.rating}</Text>
          <Text className="text-gray-400 text-xs mx-1">•</Text>
          <Text className="text-gray-500 text-xs">Đã bán {product.soldCount}</Text>
        </HStack>

        {/* Giá */}
        <HStack className="items-center mb-2">
          <Text className="text-red-500 font-bold text-lg mr-2">{product.price}</Text>
          {product.originalPrice && (
            <Text className="text-gray-400 text-xs line-through">
              {product.originalPrice}
            </Text>
          )}
        </HStack>

        {/* Giao hàng & vị trí */}
        <HStack className="items-center justify-between">
          <HStack className="items-center">
            <Box className="bg-green-500 rounded-full p-1 mr-1">
              <TruckIcon size={12} color="white" />
            </Box>
            <Text className="text-green-600 text-xs font-semibold">
              {product.deliveryTime}
            </Text>
          </HStack>

          <HStack className="items-center">
            <Icon as={MapPinIcon} size="xs" className="text-gray-400 mr-1" />
            <Text className="text-gray-500 text-xs">{product.location}</Text>
          </HStack>
        </HStack>
      </VStack>
    </Pressable>
  );
}
