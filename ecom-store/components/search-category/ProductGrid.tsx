import ProductBox from '@/components/ProductBox';
import { Box, HStack, Pressable, Text } from '@/components/ui';
import type { Product } from '@/types/product.type';
import { SearchIcon } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Dimensions, FlatList } from 'react-native';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  onProductPress: (slug: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function ProductGrid({
  products,
  loading,
  onProductPress,
  onRefresh,
  refreshing = false,
}: ProductGridProps) {
  const screenWidth = Dimensions.get('window').width;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);

  const renderProductItem = ({ item }: { item: Product }) => {
    const variant = item.variants?.[0];
    const productBoxData = {
      id: item.id,
      name: item.name,
      price: formatPrice(variant?.price || 0),
      originalPrice: variant?.oldPrice ? formatPrice(variant.oldPrice) : undefined,
      discount: variant?.discount ? variant.discount.toString() : undefined,
      rating: item.rating || 0,
      soldCount: '0',
      image: item.thumbnail,
      deliveryTime: '2-3 ngày',
      location: 'Hà Nội',
    };

    return (
      <Pressable
        style={{ width: screenWidth / 2 - 20 }}
        className="mb-3 mx-1.5"
        onPress={() => onProductPress(item.slug)}
      >
        <ProductBox product={productBoxData} />
      </Pressable>
    );
  };

  const ListHeader = () => (
    <HStack className="px-4 pt-2 pb-1 justify-between items-center">
      <Text className="text-gray-500 text-sm">
        Tìm thấy <Text className="font-bold text-gray-900">{products.length}</Text>{' '}
        sản phẩm
      </Text>
    </HStack>
  );

  const ListEmptyComponent = () => {
    if (loading) return null;
    return (
      <Box className="items-center py-20">
        <SearchIcon size={48} color="#E5E7EB" />
        <Text className="text-gray-500 mt-4">Không tìm thấy sản phẩm nào</Text>
      </Box>
    );
  };

  if (loading && products.length === 0) {
    return (
      <Box className="flex-1 justify-center items-center py-20">
        <ActivityIndicator size="large" color="#EF4444" />
      </Box>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderProductItem}
      numColumns={2}
      columnWrapperStyle={{ paddingHorizontal: 8 }}
      contentContainerStyle={{ paddingBottom: 20, backgroundColor: '#F9FAFB' }}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={ListEmptyComponent}
      refreshing={refreshing}
      onRefresh={onRefresh}
      style={{ flex: 1 }}
    />
  );
}

