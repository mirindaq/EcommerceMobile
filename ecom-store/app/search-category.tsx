import ProductBox from '@/components/ProductBox';
import {
  Box, HStack,
  Input, InputField, InputIcon, InputSlot,
  Pressable,
  SafeAreaView,
  Text,
  VStack,
} from '@/components/ui';
import { categoryBrandService } from '@/services/categoryBrand.service';
import { productService } from '@/services/product.service';
import { variantService } from '@/services/variant.service';
import type { Brand } from '@/types/brand.type';
import type { Product } from '@/types/product.type';
import type { Variant } from '@/types/variant.type';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeftIcon,
  ArrowUpDownIcon,
  CheckIcon,
  ChevronDownIcon, ChevronUpIcon,
  FilterIcon,
  SearchIcon, XIcon
} from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// --- Types & Interfaces ---
interface SearchFilters {
  brands?: number[];
  inStock?: boolean;
  priceMin?: number;
  priceMax?: number;
  variants?: { [variantId: number]: number[] };
}

type SortType = 'popular' | 'newest' | 'best_selling' | 'price_asc' | 'price_desc';

// --- Main Component ---
export default function SearchCategoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const slug = params.slug as string | undefined;
  const screenWidth = Dimensions.get('window').width;

  // UI States
  const [searchText, setSearchText] = useState('');
  const [categoryName, setCategoryName] = useState<string>('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortBy, setSortBy] = useState<SortType>('popular');
  const [expandedSections, setExpandedSections] = useState<{ 
    brands: boolean;
    variants: { [key: number]: boolean };
  }>({
    brands: true,
    variants: {},
  });

  // Data States
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});

  // --- Effects ---
  useEffect(() => {
    if (slug) {
      const name = slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      setCategoryName(name);
      loadInitialData();
    }
  }, [slug]);

  useEffect(() => {
    if (slug) loadProducts();
  }, [slug, filters, sortBy]);

  // --- Logic Handlers ---
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [brandsRes, variantsRes] = await Promise.all([
        categoryBrandService.getBrandsByCategorySlug(slug!),
        variantService.getVariantsByCategorySlug(slug!),
      ]);
      setBrands(brandsRes.data || []);
      setVariants(variantsRes.data || []);
    } catch (error) {
      console.error('Init Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const searchParams: Record<string, string> = {};
      
      // Map Filters
      if (filters.brands?.length) {
        const brandSlugs = brands.filter(b => filters.brands?.includes(b.id)).map(b => b.slug);
        if (brandSlugs.length) searchParams.brands = brandSlugs.join(',');
      }
      if (filters.inStock) searchParams.inStock = 'true';
      if (filters.priceMin) searchParams.priceMin = filters.priceMin.toString();
      if (filters.priceMax) searchParams.priceMax = filters.priceMax.toString();
      
      // Map Variants
      if (filters.variants) {
        Object.entries(filters.variants).forEach(([vId, valIds]) => {
          const variant = variants.find(v => v.id === Number(vId));
          if (variant && valIds.length && variant.variantValues) {
            const valSlugs = variant.variantValues.filter(vv => valIds.includes(vv.id)).map(vv => vv.slug || vv.value);
            if (valSlugs.length) searchParams[variant.slug] = valSlugs.join(',');
          }
        });
      }

      // TODO: Add sort param to API call here if backend supports it
      // searchParams.sort = sortBy; 

      const response = await productService.searchProducts(slug!, 1, 20, searchParams);
      setProducts(response.data?.data || []);
    } catch (error) {
      console.error('Search Error:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  // Helper to format price
  const formatPrice = (price: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  // Filter Handlers (Giữ nguyên logic cũ, chỉ làm gọn code)
  const toggleFilter = (type: 'brands' | 'variants', id: number, subId?: number) => {
    setFilters(prev => {
      if (type === 'brands') {
        const list = prev.brands || [];
        const newList = list.includes(id) ? list.filter(x => x !== id) : [...list, id];
        return { ...prev, brands: newList.length ? newList : undefined };
      } else if (type === 'variants' && subId) {
        const vars = prev.variants || {};
        const vals = vars[id] || [];
        const newVals = vals.includes(subId) ? vals.filter(x => x !== subId) : [...vals, subId];
        const newVars = { ...vars };
        if (newVals.length) newVars[id] = newVals;
        else delete newVars[id];
        return { ...prev, variants: Object.keys(newVars).length ? newVars : undefined };
      }
      return prev;
    });
  };

  const countActiveFilters = useMemo(() => {
    let count = 0;
    if (filters.brands?.length) count++;
    if (filters.inStock) count++;
    if (filters.priceMin || filters.priceMax) count++;
    if (filters.variants && Object.keys(filters.variants).length) count++;
    return count;
  }, [filters]);

  // --- Sub Components ---
  
  // 1. Sort Bar (Tab lọc nhanh)
  const SortBar = () => (
    <Box className="flex-row bg-white border-b border-gray-100 px-2 py-2 items-center justify-between">
       <Pressable onPress={() => setSortBy('popular')} className="flex-1 items-center py-2">
          <Text className={`text-sm font-medium ${sortBy === 'popular' ? 'text-red-500' : 'text-gray-600'}`}>Phổ biến</Text>
       </Pressable>
       <Box className="w-[1px] h-4 bg-gray-200" />
       <Pressable onPress={() => setSortBy('newest')} className="flex-1 items-center py-2">
          <Text className={`text-sm font-medium ${sortBy === 'newest' ? 'text-red-500' : 'text-gray-600'}`}>Mới nhất</Text>
       </Pressable>
       <Box className="w-[1px] h-4 bg-gray-200" />
       <Pressable onPress={() => setSortBy(prev => prev === 'price_asc' ? 'price_desc' : 'price_asc')} className="flex-1 flex-row items-center justify-center py-2 space-x-1">
          <Text className={`text-sm font-medium ${sortBy.includes('price') ? 'text-red-500' : 'text-gray-600'}`}>Giá</Text>
          <ArrowUpDownIcon size={14} color={sortBy.includes('price') ? '#EF4444' : '#6B7280'} />
       </Pressable>
       <Box className="w-[1px] h-4 bg-gray-200" />
       <Pressable onPress={() => setShowFilterModal(true)} className="flex-row items-center px-3 py-1 ml-1">
          <Text className="text-sm font-medium text-gray-800 mr-1">Bộ lọc</Text>
          <FilterIcon size={14} color="#374151" />
          {countActiveFilters > 0 && (
            <Box className="absolute top-0 right-0 bg-red-500 w-2 h-2 rounded-full" />
          )}
       </Pressable>
    </Box>
  );

  // 2. Render Item for Product Grid
  const renderProductItem = ({ item }: { item: Product }) => {
    const variant = item.variants?.[0];
    const productBoxData = {
      id: item.id,
      name: item.name,
      price: formatPrice(variant?.price || 0),
      originalPrice: variant?.oldPrice ? formatPrice(variant.oldPrice) : undefined,
      discount: variant?.discount ? variant.discount.toString() : undefined,
      rating: item.rating || 0,
      soldCount: '0', // Add to API logic later
      image: item.thumbnail,
      deliveryTime: '2-3 ngày',
      location: 'Hà Nội',
    };

    return (
      <Pressable 
        style={{ width: (screenWidth / 2) - 20 }} 
        className="mb-3 mx-1.5"
        onPress={() => router.push(`/product-detail?slug=${item.slug}`)}
      >
        <ProductBox product={productBoxData} />
      </Pressable>
    );
  };

  // 3. Header Component for FlatList (Brands)
  const ListHeader = () => (
    <VStack className="bg-gray-50 mb-2">
      {/* Brands Scroll */}
      {brands.length > 0 && (
        <Box className="py-3 pl-4 bg-white mb-2">
          <FlatList
            horizontal
            data={brands}
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => {
              const isSelected = filters.brands?.includes(item.id);
              return (
                <Pressable
                  onPress={() => toggleFilter('brands', item.id)}
                  className={`px-4 py-1.5 rounded-full mr-2 border ${
                    isSelected ? 'bg-red-50 border-red-500' : 'bg-white border-gray-200'
                  }`}
                >
                  <Text className={`text-sm font-medium ${isSelected ? 'text-red-600' : 'text-gray-600'}`}>
                    {item.name}
                  </Text>
                </Pressable>
              );
            }}
          />
        </Box>
      )}
      
      <HStack className="px-4 pt-2 pb-1 justify-between items-center">
         <Text className="text-gray-500 text-sm">
           Tìm thấy <Text className="font-bold text-gray-900">{products.length}</Text> sản phẩm
         </Text>
      </HStack>
    </VStack>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#EF4444" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* --- Top Header --- */}
      <Box className="bg-white pt-2 pb-2 px-4 flex-row items-center border-b border-gray-100">
        <Pressable onPress={() => router.back()} className="p-1 mr-2">
           <ArrowLeftIcon size={24} color="#1F2937" />
        </Pressable>
        <Input className="flex-1 h-10 bg-gray-100 border-0 rounded-lg" variant="rounded">
          <InputSlot className="pl-3">
            <InputIcon as={SearchIcon} size="sm" className="text-gray-400" />
          </InputSlot>
          <InputField
            placeholder={categoryName || "Tìm kiếm..."}
            value={searchText}
            onChangeText={setSearchText}
            className="text-sm text-gray-800"
            placeholderTextColor="#9CA3AF"
          />
          {searchText.length > 0 && (
             <InputSlot className="pr-3" onPress={() => setSearchText('')}>
               <InputIcon as={XIcon} size="xs" className="text-gray-400" />
             </InputSlot>
          )}
        </Input>
      </Box>

      {/* --- Sort Bar --- */}
      <SortBar />

      {/* --- Main Content --- */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductItem}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 8 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
            !productsLoading ? (
                <Box className="items-center py-20">
                    <SearchIcon size={48} color="#E5E7EB" />
                    <Text className="text-gray-500 mt-4">Không tìm thấy sản phẩm nào</Text>
                </Box>
            ) : null
        }
        refreshing={productsLoading}
        onRefresh={loadProducts}
      />

      {/* --- Filter Modal (Bottom Sheet Style) --- */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View className="flex-1 bg-black/40 justify-end">
           <TouchableOpacity className="flex-1" onPress={() => setShowFilterModal(false)} />
           
           <Box className="bg-white rounded-t-3xl h-[85%] w-full overflow-hidden">
              {/* Modal Header */}
              <HStack className="p-4 border-b border-gray-100 justify-between items-center bg-white">
                 <Text className="text-lg font-bold text-gray-900">Bộ lọc tìm kiếm</Text>
                 <TouchableOpacity onPress={() => setShowFilterModal(false)} className="p-1 bg-gray-100 rounded-full">
                    <XIcon size={20} color="#6B7280" />
                 </TouchableOpacity>
              </HStack>

              {/* Modal Content */}
              <FlatList 
                className="flex-1 px-4"
                data={[]} // Dummy data to use ListHeaderComponent for content
                renderItem={null}
                ListHeaderComponent={
                    <VStack className="pb-24 pt-4">
                        {/* Price Range */}
                        <VStack className="mb-6">
                            <Text className="font-bold text-gray-900 text-lg mb-3">Khoảng giá</Text>
                            <HStack className="space-x-3">
                                <Box className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <Text className="text-gray-500 text-xs mb-1">Từ (₫)</Text>
                                    <TextInput 
                                        placeholder="0" 
                                        keyboardType="numeric"
                                        value={filters.priceMin?.toString() || ''}
                                        onChangeText={(t) => setFilters(p => ({...p, priceMin: t ? Number(t) : undefined}))}
                                        className="text-gray-900 text-base font-medium"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </Box>
                                <Box className="justify-center pt-6">
                                    <Text className="text-gray-400 text-lg">-</Text>
                                </Box>
                                <Box className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <Text className="text-gray-500 text-xs mb-1">Đến (₫)</Text>
                                    <TextInput 
                                        placeholder="Không giới hạn" 
                                        keyboardType="numeric"
                                        value={filters.priceMax?.toString() || ''}
                                        onChangeText={(t) => setFilters(p => ({...p, priceMax: t ? Number(t) : undefined}))}
                                        className="text-gray-900 text-base font-medium"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </Box>
                            </HStack>
                        </VStack>

                        {/* Dynamic Variants */}
                        {variants.map(variant => {
                            const isExpanded = expandedSections.variants[variant.id] || false;
                            return (
                                <VStack key={variant.id} className="mb-4">
                                    <Pressable 
                                        onPress={() => setExpandedSections(p => ({
                                            ...p, 
                                            variants: {
                                                ...p.variants, 
                                                [variant.id]: !(p.variants[variant.id] || false)
                                            }
                                        }))}
                                        className="flex-row justify-between items-center py-3 border-b border-gray-100"
                                    >
                                        <Text className="font-bold text-gray-900 text-base">{variant.name}</Text>
                                        {isExpanded ? (
                                            <ChevronUpIcon size={20} color="#6B7280" />
                                        ) : (
                                            <ChevronDownIcon size={20} color="#6B7280" />
                                        )}
                                    </Pressable>
                                    
                                    {isExpanded && variant.variantValues && (
                                        <Box className="flex-row flex-wrap mt-3">
                                            {variant.variantValues.map(val => {
                                                const active = filters.variants?.[variant.id]?.includes(val.id) || false;
                                                return (
                                                    <Pressable
                                                        key={val.id}
                                                        onPress={() => toggleFilter('variants', variant.id, val.id)}
                                                        className={`px-4 py-2.5 rounded-lg border mr-2 mb-2 ${
                                                            active 
                                                                ? 'bg-red-50 border-red-500' 
                                                                : 'bg-white border-gray-200'
                                                        }`}
                                                    >
                                                        <Text className={`text-sm font-medium ${
                                                            active ? 'text-red-600' : 'text-gray-700'
                                                        }`}>
                                                            {val.value}
                                                        </Text>
                                                    </Pressable>
                                                );
                                            })}
                                        </Box>
                                    )}
                                </VStack>
                            );
                        })}
                        
                        {/* In Stock Toggle */}
                        <Pressable 
                            onPress={() => setFilters(p => ({...p, inStock: !p.inStock}))}
                            className="flex-row justify-between items-center py-4 border-t border-gray-100"
                        >
                            <VStack className="flex-1">
                                <Text className="font-bold text-gray-900 text-base">Chỉ hiện còn hàng</Text>
                                <Text className="text-gray-500 text-xs mt-1">Ẩn các sản phẩm đã hết hàng</Text>
                            </VStack>
                            <Box className={`w-7 h-7 rounded-lg border-2 items-center justify-center ${
                                filters.inStock 
                                    ? 'bg-red-500 border-red-500' 
                                    : 'bg-white border-gray-300'
                            }`}>
                                {filters.inStock && <CheckIcon size={18} color="white" />}
                            </Box>
                        </Pressable>
                    </VStack>
                }
              />

              {/* Sticky Footer Buttons */}
              <Box className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex-row space-x-3 shadow-lg">
                  <Pressable 
                    onPress={() => setFilters({})}
                    className="flex-1 py-3 rounded-xl border border-gray-300 items-center justify-center bg-white"
                  >
                      <Text className="font-semibold text-gray-700">Thiết lập lại</Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => setShowFilterModal(false)}
                    className="flex-1 py-3 rounded-xl bg-red-600 items-center justify-center shadow-sm"
                  >
                      <Text className="font-bold text-white">Áp dụng ({countActiveFilters})</Text>
                  </Pressable>
              </Box>
           </Box>
        </View>
      </Modal>
    </SafeAreaView>
  );
}