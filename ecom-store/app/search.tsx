import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  Image,
} from 'react-native';
import { useLayoutEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  Box, HStack, VStack, Text, Pressable,
  Heading, Badge, BadgeText, Icon, Avatar, AvatarImage, AvatarFallbackText,
  SafeAreaView, Input, InputField, InputIcon, InputSlot,
} from '@/components/ui';
import {
  ArrowLeftIcon, SearchIcon, CameraIcon, XIcon
} from 'lucide-react-native';

// Mock data for search suggestions
const searchSuggestions = [
  { id: 1, text: 'LỄ HỘI SÁCH -50%', isPromo: true },
  { id: 2, text: 'iphone 16', isPromo: false },
  { id: 3, text: 'sách code', isPromo: false },
  { id: 4, text: 'áo thun nam', isPromo: false },
  { id: 5, text: 'áo khoác nam', isPromo: false },
];

const suggestedProducts = [
  {
    id: 1,
    title: 'Clean Code',
    author: 'Robert C. Martin',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=300&fit=crop',
    price: '299.000₫',
    originalPrice: '399.000₫',
    discount: '25',
  },
  {
    id: 2,
    title: 'Harajuku Style',
    brand: 'HANLU',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=300&fit=crop',
    price: '599.000₫',
    originalPrice: '799.000₫',
    discount: '25',
  },
];

export default function SearchScreen() {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('LỄ HỘI SÁCH -50%');
  const [isSearchFocused, setIsSearchFocused] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Box className="bg-white px-4 py-3 border-b border-gray-200">
        <HStack className="items-center">
          <Pressable className="mr-3" onPress={handleGoBack}>
            <ArrowLeftIcon size={24} color="#374151" />
          </Pressable>
          
          <Input className="bg-gray-100 rounded-full flex-1 mr-3" variant="rounded">
            <InputSlot className="pl-4">
              <InputIcon>
                <SearchIcon size={16} color="#6B7280" />
              </InputIcon>
            </InputSlot>
            <InputField
              placeholder="LỄ HỘI SÁCH -50%"
              value={searchText}
              onChangeText={setSearchText}
              onFocus={() => setIsSearchFocused(true)}
              className="text-gray-900"
              placeholderTextColor="#9CA3AF"
            />
            <InputSlot className="pr-4">
              <InputIcon>
                <CameraIcon size={16} color="#6B7280" />
              </InputIcon>
            </InputSlot>
          </Input>
          
          <Pressable className="bg-red-500 w-10 h-10 rounded-lg items-center justify-center">
            <SearchIcon size={20} color="white" />
          </Pressable>
        </HStack>
      </Box>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <Box className="px-4 py-4">
          <HStack className="flex-wrap">
            {searchSuggestions.map((suggestion) => (
              <Pressable 
                key={suggestion.id} 
                className="bg-gray-100 rounded-full px-4 py-2 mr-2 mb-2"
              >
                <HStack className="items-center">
                  {suggestion.isPromo && (
                    <Box className="w-4 h-4 bg-red-500 rounded-full mr-2" />
                  )}
                  <Text className="text-gray-700 text-sm">{suggestion.text}</Text>
                </HStack>
              </Pressable>
            ))}
          </HStack>
        </Box>

        {/* Search Suggestions Section */}
        <Box className="px-4 pb-6">
          <Text className="text-gray-900 font-bold text-lg mb-4">Gợi ý tìm kiếm</Text>
          
          <HStack space="md" className="justify-between">
            {suggestedProducts.map((product) => (
              <Pressable key={product.id} className="flex-1">
                <Box className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <Image 
                    source={{ uri: product.image }} 
                    className="w-full h-40"
                    resizeMode="cover"
                  />
                  <Box className="p-3">
                    {product.author && (
                      <Text className="text-gray-500 text-xs mb-1">{product.author}</Text>
                    )}
                    {product.brand && (
                      <HStack className="items-center mb-1">
                        <Text className="text-gray-500 text-xs mr-1">{product.brand}</Text>
                      </HStack>
                    )}
                    <Text className="text-gray-900 font-medium text-sm mb-2" numberOfLines={2}>
                      {product.title}
                    </Text>
                    <HStack className="items-center justify-between">
                      <HStack className="items-center">
                        <Text className="text-red-500 font-bold text-sm">{product.price}</Text>
                        <Text className="text-gray-400 text-xs line-through ml-2">{product.originalPrice}</Text>
                      </HStack>
                      <Badge className="bg-red-500">
                        <BadgeText className="text-white text-xs">-{product.discount}%</BadgeText>
                      </Badge>
                    </HStack>
                  </Box>
                </Box>
              </Pressable>
            ))}
          </HStack>
        </Box>

        {/* Recent Searches */}
        <Box className="px-4 pb-6">
          <Text className="text-gray-900 font-bold text-lg mb-4">Tìm kiếm gần đây</Text>
          
          <VStack space="sm">
            {['laptop gaming', 'iphone 15 pro', 'áo khoác nam', 'giày nike'].map((search, index) => (
              <Pressable key={index} className="py-3 border-b border-gray-100">
                <HStack className="items-center justify-between">
                  <HStack className="items-center flex-1">
                    <Icon as={SearchIcon} size="sm" className="text-gray-400 mr-3" />
                    <Text className="text-gray-700">{search}</Text>
                  </HStack>
                  <Pressable>
                    <XIcon size={16} color="#9CA3AF" />
                  </Pressable>
                </HStack>
              </Pressable>
            ))}
          </VStack>
        </Box>

        {/* Popular Categories */}
        <Box className="px-4 pb-6">
          <Text className="text-gray-900 font-bold text-lg mb-4">Danh mục phổ biến</Text>
          
          <VStack space="sm">
            {['Điện thoại & Phụ kiện', 'Laptop & Máy tính', 'Thời trang nam', 'Thời trang nữ', 'Giày dép', 'Sách'].map((category, index) => (
              <Pressable key={index} className="py-3 border-b border-gray-100">
                <HStack className="items-center justify-between">
                  <Text className="text-gray-700">{category}</Text>
                  <Icon as={ArrowLeftIcon} size="sm" className="text-gray-400 rotate-180" />
                </HStack>
              </Pressable>
            ))}
          </VStack>
        </Box>

        <Box className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
