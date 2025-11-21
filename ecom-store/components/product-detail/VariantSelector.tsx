import React from 'react';
import { Modal, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Box, HStack, VStack, Text, Pressable, Icon } from '@/components/ui';
import { XIcon, MinusIcon, PlusIcon } from 'lucide-react-native';
import type { Product, ProductVariantResponse } from '@/types/product.type';

interface VariantSelectorProps {
  visible: boolean;
  product: Product;
  selectedVariant: ProductVariantResponse | null;
  availableVariants: { [key: string]: string[] };
  selectedVariants: { [key: string]: string };
  quantity: number;
  onClose: () => void;
  onVariantSelect: (variantName: string, value: string) => void;
  onQuantityChange: (type: 'increase' | 'decrease') => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  formatPrice: (price: number) => string;
}

export default function VariantSelector({
  visible,
  product,
  selectedVariant,
  availableVariants,
  selectedVariants,
  quantity,
  onClose,
  onVariantSelect,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
  formatPrice,
}: VariantSelectorProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <TouchableOpacity 
          style={{ flex: 1 }} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <View style={{
          backgroundColor: 'white',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: '70%',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }}>
          {/* Header */}
          <HStack className="items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-gray-900 font-bold text-lg">Chọn cấu hình</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon as={XIcon} size="sm" className="text-gray-400" />
            </TouchableOpacity>
          </HStack>

          {/* Body */}
          <ScrollView className="flex-1 p-4" bounces={false}>
            {/* Product Preview */}
            <HStack className="mb-6">
              <VStack className="mr-4">
                <Image
                  source={{ uri: product.thumbnail }}
                  className="w-20 h-20 rounded-lg"
                  resizeMode="cover"
                />
              </VStack>
              <VStack className="flex-1">
                <Text className="text-red-500 font-bold text-xl">
                  {selectedVariant ? formatPrice(selectedVariant.price) : formatPrice(0)}
                </Text>
                {selectedVariant && selectedVariant.oldPrice > 0 && (
                  <Text className="text-gray-400 text-sm line-through">
                    {formatPrice(selectedVariant.oldPrice)}
                  </Text>
                )}
                <Text className="text-gray-500 text-sm">Kho: {selectedVariant?.stock || 0}</Text>
              </VStack>
            </HStack>

            {/* Variant Selection */}
            {Object.keys(availableVariants).map((variantName) => (
              <Box key={variantName} className="mb-6">
                <Text className="text-gray-900 font-bold text-lg mb-3">{variantName}</Text>
                <HStack className="flex-wrap">
                  {availableVariants[variantName].map((value) => (
                    <Pressable
                      key={value}
                      onPress={() => onVariantSelect(variantName, value)}
                      className={`mr-2 mb-2 p-3 rounded-lg border ${
                        selectedVariants[variantName] === value
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <Text className={`text-sm font-medium ${
                        selectedVariants[variantName] === value ? 'text-red-700' : 'text-gray-700'
                      }`}>
                        {value}
                      </Text>
                    </Pressable>
                  ))}
                </HStack>
              </Box>
            ))}

            {/* Quantity Selection */}
            <Box className="mb-6">
              <Text className="text-gray-900 font-bold text-lg mb-3">Số lượng</Text>
              <HStack className="items-center">
                <Pressable
                  onPress={() => onQuantityChange('decrease')}
                  className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center"
                >
                  <Icon as={MinusIcon} size="sm" className="text-gray-600" />
                </Pressable>
                <Text className="text-gray-900 font-bold text-lg mx-4">{quantity}</Text>
                <Pressable
                  onPress={() => onQuantityChange('increase')}
                  className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center"
                >
                  <Icon as={PlusIcon} size="sm" className="text-gray-600" />
                </Pressable>
              </HStack>
            </Box>
          </ScrollView>

          {/* Footer */}
          <View className="p-4 border-t border-gray-200">
            <HStack className="space-x-3">
              <Pressable
                className="bg-gray-200 rounded-lg px-4 py-4 flex-1"
                onPress={onAddToCart}
              >
                <Text className="text-gray-900 font-bold text-base text-center">Thêm vào giỏ</Text>
              </Pressable>
              <Pressable
                className="bg-red-500 rounded-lg px-6 py-4 flex-1"
                onPress={onBuyNow}
              >
                <Text className="text-white font-bold text-lg text-center">Mua ngay</Text>
              </Pressable>
            </HStack>
          </View>
        </View>
      </View>
    </Modal>
  );
}

