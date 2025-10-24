import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  ScrollView,
  Image,
  Dimensions,
  Modal  ,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import {
  Box, HStack, VStack, Text, Pressable,
  Heading, Badge, BadgeText, Icon, Avatar, AvatarImage, AvatarFallbackText,
  SafeAreaView, Input, InputField, InputIcon, InputSlot,
} from '@/components/ui';
import {
  ArrowLeftIcon, SearchIcon, CameraIcon, XIcon, ShareIcon, ShoppingCartIcon,
  StarIcon, HeartIcon, MessageCircleIcon, SettingsIcon, TruckIcon, MapPinIcon,
  ShieldIcon, CheckIcon, ChevronRightIcon, MinusIcon, PlusIcon
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// API data structure
interface ProductVariant {
  id: number;
  price: number;
  oldPrice: number;
  sku: string;
  stock: number;
  productVariantValues: Array<{
    id: number;
    variantValue: {
      id: number;
      value: string;
      status: boolean;
      variantId: number;
      variantName: string;
    };
  }>;
}

interface ProductData {
  id: number;
  name: string;
  slug: string;
  stock: number;
  discount: number;
  description: string;
  thumbnail: string;
  status: boolean;
  rating: number | null;
  spu: string;
  brandId: number;
  categoryId: number;
  productImages: string[];
  attributes: any[];
  variants: ProductVariant[];
}

export default function ProductDetailScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});
  const [availableVariants, setAvailableVariants] = useState<{ [key: string]: string[] }>({});
  const [showVariantModal, setShowVariantModal] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);


  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        // Mock API call - replace with actual API call
        const mockProduct: ProductData = {
          id: 3,
          name: "Laptop Asus TUF Gaming3",
          slug: "laptop-asus-tuf-gaming3",
          stock: 49,
          discount: 0.0,
          description: "AI không còn là khái niệm xa lạ, mà đã trở thành công nghệ cốt lõi của thời đại...",
          thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
          status: true,
          rating: null,
          spu: "LATG",
          brandId: 1,
          categoryId: 1,
          productImages: [
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop",
          ],
          attributes: [],
          variants: [
            {
              id: 3,
              price: 100000.0,
              oldPrice: 0.0,
              sku: "LATG-1-5",
              stock: 50,
              productVariantValues: [
                {
                  id: 5,
                  variantValue: {
                    id: 1,
                    value: "Xanh",
                    status: true,
                    variantId: 1,
                    variantName: "Màu sắc"
                  }
                },
                {
                  id: 6,
                  variantValue: {
                    id: 5,
                    value: "RTX5080",
                    status: true,
                    variantId: 2,
                    variantName: "CARD"
                  }
                }
              ]
            },
            {
              id: 4,
              price: 120000.0,
              oldPrice: 0.0,
              sku: "LATG-2-5",
              stock: 50,
              productVariantValues: [
                {
                  id: 7,
                  variantValue: {
                    id: 2,
                    value: "Đỏ",
                    status: true,
                    variantId: 1,
                    variantName: "Màu sắc"
                  }
                },
                {
                  id: 8,
                  variantValue: {
                    id: 5,
                    value: "RTX5080",
                    status: true,
                    variantId: 2,
                    variantName: "CARD"
                  }
                }
              ]
            }
          ]
        };

        setProduct(mockProduct);

        if (mockProduct.variants && mockProduct.variants.length > 0) {
          setSelectedVariant(mockProduct.variants[0]);
          extractVariantsFromProduct(mockProduct);
        } 
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, []);

  // Extract variants from API data dynamically
  const extractVariantsFromProduct = (product: ProductData) => {
    if (!product.variants || product.variants.length === 0) return;

    const variantGroups: { [key: string]: Set<string> } = {};
    const defaultSelections: { [key: string]: string } = {};

    product.variants.forEach(variant => {
      if (variant.productVariantValues) {
        variant.productVariantValues.forEach(variantValue => {
          const { value } = variantValue.variantValue;
          const variantName = variantValue.variantValue.variantName || 'Mặc định';

          if (!variantGroups[variantName]) {
            variantGroups[variantName] = new Set();
          }
          variantGroups[variantName].add(value);
        });
      }
    });

    // Convert Sets to Arrays and set defaults
    const availableVariants: { [key: string]: string[] } = {};
    Object.keys(variantGroups).forEach(variantName => {
      availableVariants[variantName] = Array.from(variantGroups[variantName]);
      defaultSelections[variantName] = availableVariants[variantName][0];
    });

    setAvailableVariants(availableVariants);
    setSelectedVariants(defaultSelections);
  };

  // Find matching variant based on selections
  const findMatchingVariant = () => {
    if (!product?.variants) return null;

    return product.variants.find(variant => {
      if (!variant.productVariantValues) return false;

      // Get all variant values for this variant
      const variantValues = variant.productVariantValues.map(vv => ({
        name: vv.variantValue.variantName,
        value: vv.variantValue.value
      }));

      // Check if all selected variants match this variant
      return Object.keys(selectedVariants).every(variantName => {
        const selectedValue = selectedVariants[variantName];
        if (!selectedValue) return true;

        return variantValues.some(vv =>
          vv.name === variantName && vv.value === selectedValue
        );
      });
    });
  };

  // Update selected variant when selections change
  useEffect(() => {
    const matchingVariant = findMatchingVariant();
    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
    }
  }, [selectedVariants, product]);

  const handleGoBack = () => {
    router.back();
  };

  // Handle variant selection
  const handleVariantSelection = (variantName: string, value: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantName]: value
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Box className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Đang tải...</Text>
        </Box>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Box className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Không tìm thấy sản phẩm</Text>
        </Box>
      </SafeAreaView>
    );
  }

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    if (type === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
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
              // value={searchText}
              // onChangeText={setSearchText}
              // onFocus={() => setIsSearchFocused(true)}
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
        {/* Product Images */}
        <Box className="relative">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
          >
            <HStack>
              {product.productImages.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={{ width: width, height: width }}
                  className="rounded"
                  resizeMode="cover"
                  alt={`product-image-${index}`}
                />
              ))}
            </HStack>
          </ScrollView>

          {/* Image pagination */}
          <Box className="absolute bottom-4 right-4 bg-black/50 rounded-full px-3 py-1">
            <Text className="text-white text-sm">
              {currentImageIndex + 1}/{product.productImages.length}
            </Text>
          </Box>
        </Box>

        {/* Product Info */}
        <Box className="px-4 py-4">
          {/* Brand & Title */}
          <HStack className="items-center mb-2">
            <Text className="text-gray-500 text-sm mr-2">SPU: {product.spu}</Text>
            <Badge className="bg-red-500">
              <BadgeText className="text-white text-xs">Mall</BadgeText>
            </Badge>
          </HStack>

          <Text className="text-gray-900 font-bold text-lg mb-3" >
            {product.name}
          </Text>

          {/* Rating & Sales */}
          <HStack className="items-center mb-4">
            <HStack className="items-center mr-4">
              <Icon as={StarIcon} size="sm" className="text-yellow-400 mr-1" />
              <Text className="text-gray-800 font-semibold text-sm">{product.rating || 'Chưa có đánh giá'}</Text>
            </HStack>
            <Text className="text-gray-500 text-sm">Kho: {product.stock}</Text>
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
            {product.discount > 0 && (
              <Badge className="bg-green-100 ml-2">
                <BadgeText className="text-green-800 text-xs">Giảm {product.discount}%</BadgeText>
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
                onPress={() => setShowVariantModal(true)}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <HStack className="items-center justify-between">
                  <VStack className="flex-1">
                    <Text className="text-gray-900 font-bold text-lg">Mô hình</Text>
                    <Text className="text-gray-600 text-sm">
                      {Object.keys(selectedVariants).map(key => selectedVariants[key]).join(', ')}
                    </Text>
                  </VStack>
                  <Icon as={ChevronRightIcon} size="sm" className="text-gray-400" />
                </HStack>
              </Pressable>
            </Box>
          )}


          {/* Reviews */}
          <Box className="mb-6">
            <HStack className="items-center justify-between mb-4">
              <Text className="text-gray-900 font-bold text-lg">Đánh Giá Sản Phẩm</Text>
              <Text className="text-gray-500 text-sm">{product.rating || 'Chưa có đánh giá'} ★</Text>
            </HStack>

            <Box className="bg-gray-50 rounded-lg p-4 mb-3">
              <Text className="text-gray-500 text-sm text-center">Chưa có đánh giá nào</Text>
            </Box>
          </Box>
        </Box>
      </ScrollView>

      {/* Bottom Action Bar */}
      <Box className="bg-white border-t border-gray-200 px-4 py-3">
        <HStack className="items-center justify-between">
          <HStack className="items-center space-x-4">
            <Pressable className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
              <MessageCircleIcon size={20} color="#6B7280" />
            </Pressable>
            <Pressable className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
              <ShoppingCartIcon size={20} color="#6B7280" />
            </Pressable>
          </HStack>

          <Pressable
            className="bg-red-500 rounded-lg px-6 py-3 flex-1 ml-4"
            onPress={() => setShowVariantModal(true)}
            style={({ pressed }) => [
              { 
                backgroundColor: pressed ? '#dc2626' : '#ef4444',
                opacity: pressed ? 0.9 : 1, 
              }
            ]}
          >
            <VStack className="items-center">
              <Text className="text-white font-bold text-lg">Mua ngay</Text>
            </VStack>
          </Pressable>
        </HStack>
      </Box>

      <Modal
        visible={showVariantModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowVariantModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
          <TouchableOpacity 
            style={{ flex: 1 }} 
            activeOpacity={1} 
            onPress={() => setShowVariantModal(false)}
          />
          <View style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: '60%',
            position: 'absolute',
            bottom: 30,
            left: 0,
            right: 0,
          }}>
            {/* Header */}
            <HStack className="items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-gray-900 font-bold text-lg">Chọn mô hình</Text>
              <TouchableOpacity onPress={() => setShowVariantModal(false)}>
                <Icon as={XIcon} size="sm" className="text-gray-400" />
              </TouchableOpacity>
            </HStack>

            {/* Body */}
            <ScrollView className="flex-1 p-4">
              {/* Product Preview */}
              <HStack className="mb-6">
                <VStack className="mr-4">
                  <Image
                    source={{ uri: product.thumbnail }}
                    className="w-20 h-20 rounded-lg"
                    resizeMode="cover"
                    alt="product-thumbnail"
                  />
                  {/* Thumbnail images below main image */}
                  <HStack className="mt-2 space-x-1">
                    {product.productImages.slice(0, 3).map((image, index) => (
                      <Image
                        key={index}
                        source={{ uri: image }}
                        className="w-6 h-6 rounded"
                        resizeMode="cover"
                        alt={`product-image-${index}`}
                      />
                    ))}
                  </HStack>
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
                        onPress={() => handleVariantSelection(variantName, value)}
                        className={`mr-2 mb-2 p-3 rounded-lg border ${selectedVariants[variantName] === value
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 bg-white'
                          }`}
                      >
                        <Text className={`text-sm font-medium ${selectedVariants[variantName] === value ? 'text-red-700' : 'text-gray-700'
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
                    onPress={() => handleQuantityChange('decrease')}
                    className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center"
                  >
                    <Icon as={MinusIcon} size="sm" className="text-gray-600" />
                  </Pressable>
                  <Text className="text-gray-900 font-bold text-lg mx-4">{quantity}</Text>
                  <Pressable
                    onPress={() => handleQuantityChange('increase')}
                    className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center"
                  >
                    <Icon as={PlusIcon} size="sm" className="text-gray-600" />
                  </Pressable>
                </HStack>
              </Box>
            </ScrollView>

            {/* Footer */}
            <View className="p-4 border-t border-gray-200">
              <Pressable
                className="bg-red-500 rounded-lg px-6 py-4"
                onPress={() => {
                  // Handle buy now logic here
                  console.log('Buy now with variant:', selectedVariant, 'quantity:', quantity);
                  setShowVariantModal(false);
                  // Navigate to checkout or handle purchase
                }}
              >
                <Text className="text-white font-bold text-lg text-center">Mua ngay</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
