import React from 'react';
import { Box, HStack, VStack, Text, Badge, BadgeText, Icon, Pressable } from '@/components/ui';
import { StarIcon, TruckIcon, ShieldIcon, CheckIcon, ChevronRightIcon, SettingsIcon } from 'lucide-react-native';
import type { Product, ProductVariantResponse } from '@/types/product.type';

interface ProductInfoProps {
  product: Product;
  selectedVariant: ProductVariantResponse | null;
  availableVariants: { [key: string]: string[] };
  selectedVariants: { [key: string]: string };
  onVariantModalOpen: () => void;
  formatPrice: (price: number) => string;
}

export default function ProductInfo({
  product,
  selectedVariant,
  availableVariants,
  selectedVariants,
  onVariantModalOpen,
  formatPrice,
}: ProductInfoProps) {
  return (
    <Box className="px-4 py-4">
      {/* Brand & Title */}
      <HStack className="items-center mb-2">
        <Text className="text-gray-500 text-sm mr-2">SPU: {product.spu}</Text>
        <Badge className="bg-red-500">
          <BadgeText className="text-white text-xs">Mall</BadgeText>
        </Badge>
      </HStack>

      <Text className="text-gray-900 font-bold text-lg mb-3">
        {product.name}
      </Text>

      {/* Rating & Sales */}
      <HStack className="items-center mb-4">
        <HStack className="items-center mr-4">
          <Icon as={StarIcon} size="sm" className="text-yellow-400 mr-1" />
          <Text className="text-gray-800 font-semibold text-sm">
            {product.rating > 0 ? product.rating.toFixed(1) : 'Chưa có đánh giá'}
          </Text>
        </HStack>
        <Text className="text-gray-500 text-sm">Kho: {selectedVariant?.stock || product.stock}</Text>
      </HStack>

      {/* Price */}
      <HStack className="items-center mb-4">
        <Text className="text-red-500 font-bold text-2xl mr-3">
          {selectedVariant ? formatPrice(selectedVariant.price) : formatPrice(0)}
        </Text>
        {selectedVariant && selectedVariant.oldPrice > 0 && (
          <Text className="text-gray-400 text-lg line-through">
            {formatPrice(selectedVariant.oldPrice)}
          </Text>
        )}
        {selectedVariant && selectedVariant.discount > 0 && (
          <Badge className="bg-green-100 ml-2">
            <BadgeText className="text-green-800 text-xs">Giảm {selectedVariant.discount}%</BadgeText>
          </Badge>
        )}
      </HStack>

      {/* Delivery Info */}
      <Box className="bg-gray-50 rounded-lg p-4 mb-4">
        <HStack className="items-center mb-2">
          <Icon as={TruckIcon} size="sm" className="text-green-500 mr-2" />
          <Text className="text-gray-700 text-sm">Nhận từ 25 Th10 - 27 Th10</Text>
        </HStack>
        <HStack className="items-center mb-2">
          <Text className="text-green-600 text-sm font-semibold">Phí ship 0₫</Text>
        </HStack>
        <Text className="text-gray-500 text-xs">Tặng Voucher 15.000₫ nếu đơn giao sau thời gian trên.</Text>
      </Box>

      {/* Guarantees */}
      <VStack className="mb-4">
        <HStack className="items-center mb-3">
          <Box className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
            <Icon as={ShieldIcon} size="sm" className="text-blue-600" />
          </Box>
          <VStack className="flex-1">
            <Text className="text-gray-900 font-medium text-sm">Trả hàng miễn phí 15 ngày</Text>
            <Text className="text-gray-500 text-xs">Chính hãng</Text>
          </VStack>
        </HStack>
        <HStack className="items-center mb-3">
          <Box className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
            <Icon as={CheckIcon} size="sm" className="text-green-600" />
          </Box>
          <VStack className="flex-1">
            <Text className="text-gray-900 font-medium text-sm">SPayLater: Mua trước trả sau</Text>
            <Text className="text-gray-500 text-xs">0% lãi suất</Text>
          </VStack>
        </HStack>
      </VStack>

      {/* Variant Selection Button */}
      {Object.keys(availableVariants).length > 0 && (
        <Box className="mb-4">
          <Pressable
            onPress={onVariantModalOpen}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <HStack className="items-center justify-between">
              <VStack className="flex-1">
                <Text className="text-gray-900 font-bold text-lg">Cấu hình</Text>
                <Text className="text-gray-600 text-sm">
                  {Object.keys(selectedVariants).map(key => selectedVariants[key]).join(', ')}
                </Text>
              </VStack>
              <Icon as={ChevronRightIcon} size="sm" className="text-gray-400" />
            </HStack>
          </Pressable>
        </Box>
      )}

      {/* Technical Specifications */}
      {product.attributes && product.attributes.length > 0 && (
        <Box className="mb-6">
          <HStack className="items-center justify-between mb-4">
            <HStack className="items-center">
              <Icon as={SettingsIcon} size="sm" className="text-blue-600 mr-2" />
              <Text className="text-gray-900 font-bold text-lg">Thông số kỹ thuật</Text>
            </HStack>
          </HStack>
          <VStack className="space-y-3">
            {product.attributes.map((attr, index) => (
              <Box key={index} className="flex-row overflow-hidden border border-gray-200">
                <Box className="w-2/5 bg-gray-50 p-3 border-r border-gray-200">
                  <Text className="text-gray-700 text-sm font-semibold">{attr.attribute.name}</Text>
                </Box>
                <Box className="flex-1 bg-white p-3">
                  <Text className="text-gray-900 text-sm font-medium">{attr.value}</Text>
                </Box>
              </Box>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
}

