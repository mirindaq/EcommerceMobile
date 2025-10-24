import { Badge, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Image } from '@/components/ui/image';
import { Input, InputField } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { FilterIcon, HeartIcon, SearchIcon, SortAscIcon, StarIcon } from 'lucide-react-native';
import React, { useState } from 'react';

// Mock data for products
const allProducts = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max',
    price: '34.990.000',
    originalPrice: '37.990.000',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
    discount: '8%',
    rating: 4.9,
    isFavorite: false,
    category: 'Điện thoại',
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24 Ultra',
    price: '29.990.000',
    originalPrice: '32.990.000',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop',
    discount: '9%',
    rating: 4.8,
    isFavorite: true,
    category: 'Điện thoại',
  },
  {
    id: 3,
    name: 'MacBook Pro M3',
    price: '45.990.000',
    originalPrice: '48.990.000',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
    discount: '6%',
    rating: 4.9,
    isFavorite: false,
    category: 'Laptop',
  },
  {
    id: 4,
    name: 'iPad Pro 12.9" M2',
    price: '28.990.000',
    originalPrice: '31.990.000',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop',
    discount: '9%',
    rating: 4.8,
    isFavorite: true,
    category: 'Tablet',
  },
  {
    id: 5,
    name: 'AirPods Pro 2',
    price: '5.990.000',
    originalPrice: '6.990.000',
    image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300&h=300&fit=crop',
    discount: '14%',
    rating: 4.7,
    isFavorite: false,
    category: 'Phụ kiện',
  },
  {
    id: 6,
    name: 'Apple Watch Series 9',
    price: '8.990.000',
    originalPrice: '9.990.000',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=300&fit=crop',
    discount: '10%',
    rating: 4.6,
    isFavorite: true,
    category: 'Phụ kiện',
  },
];

const categories = [
  { id: 'all', name: 'Tất cả', count: 156, color: '#FF6B6B' },
  { id: 'phone', name: 'Điện thoại', count: 45, color: '#4ECDC4' },
  { id: 'laptop', name: 'Laptop', count: 32, color: '#45B7D1' },
  { id: 'tablet', name: 'Tablet', count: 28, color: '#96CEB4' },
  { id: 'accessories', name: 'Phụ kiện', count: 51, color: '#FFEAA7' },
  { id: 'fashion', name: 'Thời trang', count: 38, color: '#DDA0DD' },
  { id: 'home', name: 'Gia dụng', count: 42, color: '#98D8C8' },
  { id: 'sports', name: 'Thể thao', count: 29, color: '#F7DC6F' },
];

const sortOptions = [
  { id: 'popular', name: 'Phổ biến' },
  { id: 'newest', name: 'Mới nhất' },
  { id: 'price_low', name: 'Giá thấp' },
  { id: 'price_high', name: 'Giá cao' },
  { id: 'rating', name: 'Đánh giá' },
];

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<number[]>([2, 4, 6]);
  const [sortBy, setSortBy] = useState('popular');
  const [showSortModal, setShowSortModal] = useState(false);

  const toggleFavorite = (productId: number) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'phone' && product.category === 'Điện thoại') ||
      (selectedCategory === 'laptop' && product.category === 'Laptop') ||
      (selectedCategory === 'tablet' && product.category === 'Tablet') ||
      (selectedCategory === 'accessories' && product.category === 'Phụ kiện');
    
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <Box className="px-4 py-3 bg-white">
          <HStack className="items-center justify-between">
            <VStack>
              <Heading size="lg" className="text-gray-900">
                Khám phá
              </Heading>
              <Text className="text-gray-600">
                Tìm kiếm sản phẩm yêu thích
              </Text>
            </VStack>
            <Pressable className="p-2">
              <Icon as={FilterIcon} size="lg" className="text-gray-700" />
            </Pressable>
          </HStack>
        </Box>

        {/* Search Bar */}
        <Box className="px-4 py-3 bg-white">
          <HStack className="bg-gray-100 rounded-lg px-4 py-3 items-center">
            <Icon as={SearchIcon} size="sm" className="text-gray-500 mr-3" />
            <Input className="flex-1 border-0">
              <InputField
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </Input>
          </HStack>
        </Box>

        {/* Categories */}
        <Box className="px-4 mb-4 bg-white">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HStack space="sm">
              {categories.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full ${
                    selectedCategory === category.id 
                      ? 'bg-red-500' 
                      : 'bg-gray-100'
                  }`}
                >
                  <Text className={`font-medium text-sm ${
                    selectedCategory === category.id 
                      ? 'text-white' 
                      : 'text-gray-700'
                  }`}>
                    {category.name} ({category.count})
                  </Text>
                </Pressable>
              ))}
            </HStack>
          </ScrollView>
        </Box>

        {/* Products Grid */}
        <Box className="px-4 bg-white">
          <HStack className="items-center justify-between mb-4">
            <Text className="text-gray-900 font-semibold text-lg">
              {filteredProducts.length} sản phẩm
            </Text>
            <HStack className="items-center space-x-2">
              <Pressable 
                onPress={() => setShowSortModal(true)}
                className="flex-row items-center space-x-1 bg-gray-100 rounded-lg px-3 py-2"
              >
                <Icon as={SortAscIcon} size="sm" className="text-gray-600" />
                <Text className="text-gray-600 text-sm">
                  {sortOptions.find(opt => opt.id === sortBy)?.name}
                </Text>
              </Pressable>
            </HStack>
          </HStack>

          <Box className="flex-row flex-wrap justify-between">
            {filteredProducts.map((product) => (
              <Box key={product.id} className="w-[48%] mb-4">
                <Box className="bg-white rounded-xl box-shadow-soft-1 border border-gray-200 overflow-hidden">
                  <Box className="relative">
        <Image
                      source={{ uri: product.image }}
                      className="w-full h-32"
                      alt={product.name}
                    />
                    <Pressable
                      onPress={() => toggleFavorite(product.id)}
                      className="absolute top-2 right-2 p-1"
                    >
                      <Icon
                        as={HeartIcon}
                        size="sm"
                        className={`${
                          favorites.includes(product.id)
                            ? 'text-red-500'
                            : 'text-gray-400'
                        }`}
                        fill={favorites.includes(product.id) ? 'currentColor' : 'none'}
                      />
                    </Pressable>
                    <Badge className="absolute top-2 left-2 bg-red-500">
                      <BadgeText className="text-white text-xs">
                        -{product.discount}
                      </BadgeText>
                    </Badge>
                  </Box>
                  
                  <VStack space="sm" className="p-3">
                    <Text className="text-gray-600 text-xs">
                      {product.category}
                    </Text>
                    <Text className="text-gray-900 font-medium text-sm">
                      {product.name}
                    </Text>
                    
                    <HStack className="items-center space-x-1">
                      <Text className="text-red-500 font-bold text-sm">
                        {product.price}đ
                      </Text>
                      <Text className="text-gray-400 text-xs line-through">
                        {product.originalPrice}đ
                      </Text>
                    </HStack>
                    
                    <HStack className="items-center justify-between">
                      <HStack className="items-center space-x-1">
                        <Icon as={StarIcon} size="xs" className="text-yellow-500" />
                        <Text className="text-gray-600 text-xs">
                          {product.rating}
                        </Text>
                      </HStack>
                      <Button size="sm" className="bg-red-500 rounded-lg">
                        <ButtonText className="text-white text-xs">
                          Thêm
                        </ButtonText>
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Bottom Spacing */}
        <Box className="h-20" />
      </ScrollView>

      {/* Sort Modal */}
      {showSortModal && (
        <Box className="absolute inset-0 bg-black/50 items-center justify-center">
          <Box className="bg-white rounded-xl p-6 w-80">
            <VStack space="md">
              <HStack className="items-center justify-between">
                <Text className="text-gray-900 font-semibold text-lg">
                  Sắp xếp theo
                </Text>
                <Pressable onPress={() => setShowSortModal(false)}>
                  <Text className="text-red-500 font-medium">Đóng</Text>
                </Pressable>
              </HStack>
              
              <VStack space="sm">
                {sortOptions.map((option) => (
                  <Pressable
                    key={option.id}
                    onPress={() => {
                      setSortBy(option.id);
                      setShowSortModal(false);
                    }}
                    className={`p-3 rounded-lg ${
                      sortBy === option.id ? 'bg-red-50' : 'bg-transparent'
                    }`}
                  >
                    <HStack className="items-center justify-between">
                      <Text className={`font-medium ${
                        sortBy === option.id ? 'text-red-500' : 'text-gray-700'
                      }`}>
                        {option.name}
                      </Text>
                      {sortBy === option.id && (
                        <Icon as={StarIcon} size="sm" className="text-red-500" />
                      )}
                    </HStack>
                  </Pressable>
                ))}
              </VStack>
            </VStack>
          </Box>
        </Box>
      )}
    </SafeAreaView>
  );
}