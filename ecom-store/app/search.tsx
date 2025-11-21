import ProductBox from '@/components/ProductBox';
import SearchHeader from '@/components/search-category/SearchHeader';
import {
  Box, HStack,
  Icon,
  Input, InputField, InputIcon, InputSlot,
  Pressable,
  SafeAreaView,
  Text,
  VStack
} from '@/components/ui';
import { productService } from '@/services/product.service';
import type { Product } from '@/types/product.type';
import SearchHistoryUtil from '@/utils/searchHistory.util';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  CameraIcon,
  SearchIcon,
  XIcon
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  ScrollView
} from 'react-native';

type SortOption = 'price_asc' | 'price_desc' | 'rating_asc' | 'rating_desc' | null;

const screenWidth = Dimensions.get('window').width;

// Mock data for search suggestions
const searchSuggestions = [
  { id: 1, text: 'LỄ HỘI SÁCH -50%', isPromo: true },
  { id: 2, text: 'iphone 16', isPromo: false },
  { id: 3, text: 'sách code', isPromo: false },
  { id: 4, text: 'áo thun nam', isPromo: false },
  { id: 5, text: 'áo khoác nam', isPromo: false },
];

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialQuery = (params.q as string) || '';
  
  const [searchText, setSearchText] = useState(initialQuery);
  const [isSearchFocused, setIsSearchFocused] = useState(!initialQuery);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [totalItem, setTotalItem] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>(null); // Default: rating_desc
  const [refreshing, setRefreshing] = useState(false);

  // Load search history khi component mount
  useEffect(() => {
    loadSearchHistory();
    if (initialQuery) {
      performSearch(initialQuery, 1, sortBy);
    }
  }, []);

  const loadSearchHistory = async () => {
    const history = await SearchHistoryUtil.getSearchHistory();
    setSearchHistory(history);
  };

  const performSearch = async (query: string, currentPage: number = 1, currentSortBy: SortOption = null) => {
    if (!query || !query.trim()) return;

    try {
      setLoading(true);
      // Map sortBy to API supported values
      // Default (null) means rating_desc according to backend
      const apiSortBy = currentSortBy || undefined; // undefined will use default (rating_desc)
      
      const response = await productService.searchProductsWithElasticsearch(
        query.trim(),
        currentPage,
        12,
        apiSortBy
      );

      const productsData = response.data?.data || [];
      const newTotalPage = response.data?.totalPage || 0;
      const newTotalItem = response.data?.totalItem || 0;

      if (currentPage === 1) {
        setProducts(productsData);
      } else {
        setProducts(prev => [...prev, ...productsData]);
      }

      setTotalPage(newTotalPage);
      setTotalItem(newTotalItem);
      setPage(currentPage);

      // Lưu vào lịch sử tìm kiếm
      await SearchHistoryUtil.addSearchQuery(query.trim());
      await loadSearchHistory();
    } catch (error: any) {
      console.error('Error searching products:', error);
      Alert.alert('Lỗi', error?.response?.data?.message || 'Không thể tìm kiếm sản phẩm');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    if (!searchText.trim()) return;
    setIsSearchFocused(false);
    setPage(1);
    performSearch(searchText, 1, sortBy);
  };

  const handleSuggestionPress = (text: string) => {
    setSearchText(text);
    setIsSearchFocused(false);
    setPage(1);
    performSearch(text, 1, sortBy);
  };

  const handleHistoryPress = (query: string) => {
    setSearchText(query);
    setIsSearchFocused(false);
    setPage(1);
    performSearch(query, 1, sortBy);
  };

  const handleRemoveHistory = async (query: string) => {
    await SearchHistoryUtil.removeSearchQuery(query);
    await loadSearchHistory();
  };

  const handleLoadMore = () => {
    if (!loading && page < totalPage && searchText.trim()) {
      performSearch(searchText, page + 1, sortBy);
    }
  };

  const handleSortChange = (newSortBy: SortOption) => {
    setSortBy(newSortBy);
    setPage(1);
    performSearch(searchText, 1, newSortBy);
  };

  const handlePriceSort = () => {
    if (sortBy === 'price_asc') {
      handleSortChange('price_desc');
    } else {
      handleSortChange('price_asc');
    }
  };

  const handleRatingSort = () => {
    // Toggle between rating_asc and rating_desc
    // null (default) is treated as rating_desc
    if (sortBy === 'rating_asc') {
      handleSortChange('rating_desc');
    } else {
      // null or rating_desc -> rating_asc
      handleSortChange('rating_asc');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    performSearch(searchText, 1, sortBy);
  };

  const handleGoBack = () => {
    router.back();
  };


  // Render product item
  const renderProductItem = ({ item }: { item: Product }) => {
    return (
      <Pressable
        style={{ width: screenWidth / 2 - 20 }}
        className="mb-3 mx-1.5"
        onPress={() => router.push(`/product-detail?slug=${item.slug}`)}
      >
        <ProductBox product={item} />
      </Pressable>
    );
  };

  // Hiển thị kết quả tìm kiếm
  if (!isSearchFocused && searchText.trim()) {
    const ListHeader = () => (
      <HStack className="px-4 pt-2 pb-1 justify-between items-center">
        <Text className="text-gray-500 text-sm">
          Tìm thấy <Text className="font-bold text-gray-900">{totalItem.toLocaleString()}</Text>{' '}
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
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
          <SearchHeader
            searchText={searchText}
            placeholder="Tìm kiếm sản phẩm..."
            onSearchChange={(text) => {
              setSearchText(text);
              if (!text.trim()) {
                setIsSearchFocused(true);
              }
            }}
            onBack={handleGoBack}
          />
          <Box className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color="#EF4444" />
          </Box>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <SearchHeader
          searchText={searchText}
          placeholder="Tìm kiếm sản phẩm..."
          onSearchChange={(text) => {
            setSearchText(text);
            if (!text.trim()) {
              setIsSearchFocused(true);
            }
          }}
          onBack={handleGoBack}
        />
        
        {/* Custom SortBar for Search */}
        <Box className="flex-row bg-white border-b border-gray-100 px-2 py-2 items-center justify-between">
          <Pressable
            onPress={() => handleSortChange(null)}
            className="flex-1 items-center py-2"
          >
            <Text
              className={`text-sm font-medium ${
                sortBy === null ? 'text-red-500' : 'text-gray-600'
              }`}
            >
              Mặc định
            </Text>
          </Pressable>
          <Box className="w-[1px] h-4 bg-gray-200" />
          <Pressable
            onPress={handlePriceSort}
            className="flex-1 flex-row items-center justify-center py-2 space-x-1"
          >
            <Text
              className={`text-sm font-medium ${
                sortBy === 'price_asc' || sortBy === 'price_desc' ? 'text-red-500' : 'text-gray-600'
              }`}
            >
              Giá
            </Text>
            {sortBy === 'price_asc' ? (
              <ArrowUpIcon size={14} color="#EF4444" />
            ) : sortBy === 'price_desc' ? (
              <ArrowDownIcon size={14} color="#EF4444" />
            ) : (
              <ArrowUpDownIcon size={14} color="#6B7280" />
            )}
          </Pressable>
          <Box className="w-[1px] h-4 bg-gray-200" />
          <Pressable
            onPress={handleRatingSort}
            className="flex-1 flex-row items-center justify-center py-2 space-x-1"
          >
            <Text
              className={`text-sm font-medium ${
                sortBy === 'rating_asc' || sortBy === 'rating_desc' || sortBy === null ? 'text-red-500' : 'text-gray-600'
              }`}
            >
              Đánh giá
            </Text>
            {sortBy === 'rating_asc' ? (
              <ArrowUpIcon size={14} color="#EF4444" />
            ) : sortBy === 'rating_desc' || sortBy === null ? (
              <ArrowDownIcon size={14} color="#EF4444" />
            ) : (
              <ArrowUpDownIcon size={14} color="#6B7280" />
            )}
          </Pressable>
        </Box>

        <FlatList
          data={products}
          keyExtractor={(item: Product) => item.id.toString()}
          renderItem={renderProductItem}
          numColumns={2}
          columnWrapperStyle={{ paddingHorizontal: 8 }}
          contentContainerStyle={{ paddingBottom: 20, backgroundColor: '#F9FAFB' }}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmptyComponent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && products.length > 0 ? (
              <Box className="items-center py-4">
                <ActivityIndicator size="small" color="#EF4444" />
              </Box>
            ) : null
          }
          style={{ flex: 1 }}
        />
      </SafeAreaView>
    );
  }

  // Hiển thị màn hình tìm kiếm ban đầu
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Box className="bg-white px-4 py-3 border-b border-gray-200">
        <HStack className="items-center">
          <Pressable className="mr-3" onPress={handleGoBack}>
            <ArrowLeftIcon size={24} color="#374151" />
          </Pressable>
          
          <Input className="bg-gray-100 rounded-md flex-1 mr-3" variant="rounded">
            <InputSlot className="pl-4">
              <InputIcon>
                <SearchIcon size={16} color="#6B7280" />
              </InputIcon>
            </InputSlot>
            <InputField
              placeholder="Tìm kiếm sản phẩm..."
              value={searchText}
              onChangeText={setSearchText}
              onFocus={() => setIsSearchFocused(true)}
              onSubmitEditing={handleSearch}
              className="text-gray-900"
              placeholderTextColor="#9CA3AF"
            />
            {searchText.length > 0 && (
              <Pressable onPress={() => setSearchText('')} className="pr-2">
                <XIcon size={16} color="#6B7280" />
              </Pressable>
            )}
            <InputSlot className="pr-4">
              <InputIcon>
                <CameraIcon size={16} color="#6B7280" />
              </InputIcon>
            </InputSlot>
          </Input>
          
          <Pressable 
            className="bg-red-500 w-10 h-10 rounded-lg items-center justify-center"
            onPress={handleSearch}
          >
            <SearchIcon size={20} color="white" />
          </Pressable>
        </HStack>
      </Box>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        className="flex-1"
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Suggestions */}
        <Box className="px-4 py-4">
          <Text className="text-gray-900 font-bold text-lg mb-3">Gợi ý tìm kiếm</Text>
          <HStack className="flex-wrap">
            {searchSuggestions.map((suggestion) => (
              <Pressable 
                key={suggestion.id} 
                className="bg-gray-100 rounded-full px-4 py-2 mr-2 mb-2"
                onPress={() => handleSuggestionPress(suggestion.text)}
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

        {/* Recent Searches */}
        {searchHistory.length > 0 && (
          <Box className="px-4 pb-6">
            <HStack className="items-center justify-between mb-4">
              <Text className="text-gray-900 font-bold text-lg">Tìm kiếm gần đây</Text>
              <Pressable onPress={async () => {
                await SearchHistoryUtil.clearSearchHistory();
                await loadSearchHistory();
              }}>
                <Text className="text-red-500 text-sm">Xóa tất cả</Text>
              </Pressable>
            </HStack>
            
            <VStack space="sm">
              {searchHistory.map((search, index) => (
                <Pressable 
                  key={index} 
                  className="py-3 border-b border-gray-100"
                  onPress={() => handleHistoryPress(search)}
                >
                  <HStack className="items-center justify-between">
                    <HStack className="items-center flex-1">
                      <Icon as={SearchIcon} size="sm" className="text-gray-400 mr-3" />
                      <Text className="text-gray-700">{search}</Text>
                    </HStack>
                    <Pressable onPress={() => handleRemoveHistory(search)}>
                      <XIcon size={16} color="#9CA3AF" />
                    </Pressable>
                  </HStack>
                </Pressable>
              ))}
            </VStack>
          </Box>
        )}

        <Box className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
