import CartIcon from '@/components/CartIcon';
import {
  Avatar, AvatarFallbackText,
  Badge, BadgeText,
  Box, HStack,
  Icon,
  Input, InputField, InputIcon, InputSlot,
  Pressable,
  SafeAreaView,
  Text,
  VStack,
} from '@/components/ui';
import { cartService } from '@/services/cart.service';
import { productService } from '@/services/product.service';
import { productQuestionService } from '@/services/productQuestion.service';
import type { Product, ProductVariantResponse } from '@/types/product.type';
import type { ProductQuestion } from '@/types/productQuestion.type';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeftIcon,
  CameraIcon,
  CheckIcon, ChevronRightIcon,
  ClockIcon,
  MessageCircleIcon,
  MinusIcon, PlusIcon,
  SearchIcon,
  SendIcon,
  SettingsIcon,
  ShieldIcon,
  StarIcon,
  TruckIcon,
  XIcon
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantResponse | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});
  const [availableVariants, setAvailableVariants] = useState<{ [key: string]: string[] }>({});
  const [showVariantModal, setShowVariantModal] = useState(false);
  
  // Question states
  const [questionContent, setQuestionContent] = useState('');
  const [allQuestions, setAllQuestions] = useState<ProductQuestion[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  const pageSize = 5;

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const productId = params.id ? Number(params.id) : null;
        const slug = params.slug as string | undefined;
        
        if (!productId && !slug) {
          Alert.alert('Lỗi', 'Không tìm thấy sản phẩm');
          router.back();
          return;
        }

        const response = slug 
          ? await productService.getProductBySlug(slug)
          : await productService.getProductById(productId!);
        const productData = response.data;

        setProduct(productData);

        if (productData.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
          extractVariantsFromProduct(productData);
        }

        // Load questions
        if (productData.slug) {
          loadQuestions(productData.slug, 1);
        }
      } catch (error: any) {
        console.error('Error loading product:', error);
        Alert.alert('Lỗi', error?.response?.data?.message || 'Không thể tải sản phẩm');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.id, params.slug]);

  // Load questions
  const loadQuestions = async (slug: string, page: number) => {
    try {
      setQuestionsLoading(true);
      const response = await productQuestionService.getProductQuestionsBySlug(slug, page, pageSize);
      const questions = response.data.data;
      const newTotalPages = response.data.totalPage;
      const newTotalItems = response.data.totalItem;

      setTotalPages(newTotalPages);
      setTotalItems(newTotalItems);

      if (page === 1) {
        setAllQuestions(questions);
      } else {
        setAllQuestions(prev => [...prev, ...questions]);
      }
    } catch (error: any) {
      console.error('Error loading questions:', error);
    } finally {
      setQuestionsLoading(false);
    }
  };

  // Extract variants from API data dynamically
  const extractVariantsFromProduct = (product: Product) => {
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
    if (!product) return;
    const matchingVariant = findMatchingVariant();
    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
    }
  }, [selectedVariants, product?.id]);

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

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    if (type === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!questionContent.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập câu hỏi');
      return;
    }

    if (!product?.id) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin sản phẩm');
      return;
    }

    try {
      setIsSubmittingQuestion(true);
      await productQuestionService.createProductQuestion({
        content: questionContent.trim(),
        productId: product.id
      });
      Alert.alert('Thành công', 'Câu hỏi đã được gửi thành công!');
      setQuestionContent('');
      setAllQuestions([]);
      setCurrentPage(1);
      if (product.slug) {
        loadQuestions(product.slug, 1);
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error?.response?.data?.message || 'Không thể gửi câu hỏi');
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const handleAnswerSubmit = async (questionId: number, content: string) => {
    if (!content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập câu trả lời');
      return;
    }

    try {
      setIsSubmittingAnswer(true);
      await productQuestionService.createProductQuestionAnswer({
        content: content.trim(),
        productQuestionId: questionId
      });
      Alert.alert('Thành công', 'Trả lời đã được gửi thành công!');
      setAllQuestions([]);
      setCurrentPage(1);
      if (product?.slug) {
        loadQuestions(product.slug, 1);
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error?.response?.data?.message || 'Không thể gửi trả lời');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      if (product?.variants && product.variants.length > 0) {
        setShowVariantModal(true);
      } else {
        Alert.alert('Lỗi', 'Vui lòng chọn biến thể sản phẩm');
      }
      return;
    }

    try {
      await cartService.addProductToCart({
        productVariantId: selectedVariant.id,
        quantity: quantity,
      });
      Alert.alert('Thành công', 'Đã thêm vào giỏ hàng');
      setShowVariantModal(false);
    } catch (error: any) {
      Alert.alert('Lỗi', error?.response?.data?.message || 'Không thể thêm vào giỏ hàng');
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) {
      if (product?.variants && product.variants.length > 0) {
        setShowVariantModal(true);
      } else {
        Alert.alert('Lỗi', 'Vui lòng chọn biến thể sản phẩm');
      }
      return;
    }

    try {
      await cartService.addProductToCart({
        productVariantId: selectedVariant.id,
        quantity: quantity,
      });
      setShowVariantModal(false);
      router.push('/cart');
    } catch (error: any) {
      Alert.alert('Lỗi', error?.response?.data?.message || 'Không thể thêm vào giỏ hàng');
    }
  };

  if (loading || !product) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <Box className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EF4444" />
          <Text className="text-gray-500 mt-4">
            {loading ? 'Đang tải sản phẩm...' : 'Không tìm thấy sản phẩm'}
          </Text>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
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
              placeholder="Tìm kiếm sản phẩm"
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
            {product.productImages.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={{ width: width, height: width }}
                className="rounded"
                resizeMode="cover"
              />
            ))}
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

          <Text className="text-gray-900 font-bold text-lg mb-3">
            {product.name}
          </Text>

          {/* Rating & Sales */}
          <HStack className="items-center mb-4">
            <HStack className="items-center mr-4">
              <Icon as={StarIcon} size="sm" className="text-yellow-400 mr-1" />
              <Text className="text-gray-800 font-semibold text-sm">{product.rating || 'Chưa có đánh giá'}</Text>
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
                onPress={() => setShowVariantModal(true)}
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

          {/* Product Questions Section */}
          <Box className="mb-6">
            <HStack className="items-center justify-between mb-4">
              <HStack className="items-center">
                <Icon as={MessageCircleIcon} size="sm" className="text-blue-600 mr-2" />
                <Text className="text-gray-900 font-bold text-lg">Hỏi và đáp</Text>
              </HStack>
            </HStack>

            {/* Question Input */}
            <Box className="bg-gray-50 rounded-lg p-4 mb-4">
              <TextInput
                value={questionContent}
                onChangeText={setQuestionContent}
                placeholder="Viết câu hỏi của bạn tại đây"
                multiline
                numberOfLines={3}
                className="bg-white rounded-lg p-3 border border-gray-200 text-sm text-gray-900 mb-3"
                placeholderTextColor="#9CA3AF"
                style={{ minHeight: 80, textAlignVertical: 'top' }}
              />
              <Pressable
                onPress={handleSubmitQuestion}
                disabled={isSubmittingQuestion || !questionContent.trim()}
                className={`bg-red-500 rounded-lg px-4 py-3 items-center ${(isSubmittingQuestion || !questionContent.trim()) ? 'opacity-50' : ''}`}
              >
                {isSubmittingQuestion ? (
                  <HStack className="items-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-semibold ml-2">Đang gửi...</Text>
                  </HStack>
                ) : (
                  <HStack className="items-center">
                    <Text className="text-white font-semibold mr-2">Gửi câu hỏi</Text>
                    <Icon as={SendIcon} size="sm" className="text-white" />
                  </HStack>
                )}
              </Pressable>
            </Box>

            {/* Questions List */}
            {questionsLoading && allQuestions.length === 0 ? (
              <Box className="items-center py-8">
                <ActivityIndicator size="small" color="#EF4444" />
              </Box>
            ) : allQuestions.length === 0 ? (
              <Box className="bg-gray-50 rounded-lg p-6 items-center">
                <Icon as={MessageCircleIcon} size="lg" className="text-gray-300 mb-2" />
                <Text className="text-gray-500 text-sm text-center">Chưa có câu hỏi nào</Text>
                <Text className="text-gray-400 text-xs text-center mt-1">Hãy là người đầu tiên đặt câu hỏi!</Text>
              </Box>
            ) : (
              <VStack className="space-y-4">
                {allQuestions.map((question) => (
                  <QuestionItem
                    key={question.id}
                    question={question}
                    onAnswerSubmit={handleAnswerSubmit}
                    isSubmitting={isSubmittingAnswer}
                  />
                ))}
                {currentPage < totalPages && (
                  <Pressable
                    onPress={() => {
                      const nextPage = currentPage + 1;
                      setCurrentPage(nextPage);
                      if (product.slug) {
                        loadQuestions(product.slug, nextPage);
                      }
                    }}
                    disabled={questionsLoading}
                    className="bg-gray-100 rounded-lg p-3 items-center"
                  >
                    {questionsLoading ? (
                      <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                      <Text className="text-gray-700 font-semibold">Xem thêm câu hỏi ({totalItems - allQuestions.length} còn lại)</Text>
                    )}
                  </Pressable>
                )}
              </VStack>
            )}
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
            <CartIcon 
              size={20} 
              color="#6B7280" 
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            />
          </HStack>

          <Pressable
            className="bg-red-500 rounded-lg px-6 py-3 flex-1 ml-4"
            onPress={handleBuyNow}
          >
            <Text className="text-white font-bold text-lg text-center">Mua ngay</Text>
          </Pressable>
        </HStack>
      </Box>

      {/* Variant Selection Modal */}
      <Modal
        visible={showVariantModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowVariantModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableOpacity 
            style={{ flex: 1 }} 
            activeOpacity={1} 
            onPress={() => setShowVariantModal(false)}
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
              <TouchableOpacity onPress={() => setShowVariantModal(false)}>
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
              <HStack className="space-x-3">
                <Pressable
                  className="bg-gray-200 rounded-lg px-4 py-4 flex-1"
                  onPress={handleAddToCart}
                >
                  <Text className="text-gray-900 font-bold text-base text-center">Thêm vào giỏ</Text>
                </Pressable>
                <Pressable
                  className="bg-red-500 rounded-lg px-6 py-4 flex-1"
                  onPress={handleBuyNow}
                >
                  <Text className="text-white font-bold text-lg text-center">Mua ngay</Text>
                </Pressable>
              </HStack>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Question Item Component
const QuestionItem: React.FC<{
  question: ProductQuestion;
  onAnswerSubmit: (questionId: number, content: string) => void;
  isSubmitting: boolean;
}> = ({ question, onAnswerSubmit, isSubmitting }) => {
  const [answerContent, setAnswerContent] = useState('');
  const [showAnswerInput, setShowAnswerInput] = useState(false);
  const [expandedAnswers, setExpandedAnswers] = useState(question.answers && question.answers.length > 0);

  // Helper function to get user initials for avatar
  const getUserInitials = (name: string) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return words[words.length - 1].charAt(0).toUpperCase();
  };

  // Helper function to format time ago
  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Hôm nay';
    if (diffInDays === 1) return 'Hôm qua';
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} tuần trước`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} tháng trước`;
  };

  return (
    <Box className="bg-white border-b border-gray-200 pb-4 mb-4">
      <HStack className="items-start">
        {/* User Avatar */}
        <Avatar className="w-10 h-10 mr-3">
          <AvatarFallbackText className="bg-purple-600 text-white font-semibold text-sm">
            {getUserInitials(question.userName)}
          </AvatarFallbackText>
        </Avatar>

        <VStack className="flex-1">
          {/* Question Header */}
          <HStack className="items-center mb-2">
            <Text className="text-gray-900 font-semibold text-sm mr-2">{question.userName}</Text>
            {question.createdAt && (
              <HStack className="items-center">
                <ClockIcon size={12} color="#9CA3AF" />
                <Text className="text-gray-400 text-xs ml-1">{formatTimeAgo(question.createdAt)}</Text>
              </HStack>
            )}
          </HStack>

          {/* Question Content */}
          <Text className="text-gray-700 text-sm leading-relaxed mb-3">{question.content}</Text>

          {/* Action Buttons */}
          <HStack className="items-center mb-3">
            {question.answers && question.answers.length > 0 && (
              <Pressable
                onPress={() => setExpandedAnswers(!expandedAnswers)}
                className="mr-4"
              >
                <Text className="text-red-600 text-sm font-medium">
                  {expandedAnswers ? 'Thu gọn phản hồi' : `Chi tiết phản hồi (${question.answers.length})`}
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => setShowAnswerInput(!showAnswerInput)}
            >
              <HStack className="items-center">
                <Icon as={MessageCircleIcon} size="sm" className="text-red-600 mr-1" />
                <Text className="text-red-600 text-sm font-medium">Phản hồi</Text>
              </HStack>
            </Pressable>
          </HStack>

          {/* Answer Form */}
          {showAnswerInput && (
            <VStack className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200">
              <Text className="text-gray-800 font-semibold text-sm mb-3">Trả lời câu hỏi</Text>
              <TextInput
                value={answerContent}
                onChangeText={setAnswerContent}
                placeholder="Viết câu trả lời của bạn tại đây..."
                multiline
                numberOfLines={3}
                className="bg-white rounded-lg p-3 border border-gray-200 text-sm text-gray-900 mb-3"
                placeholderTextColor="#9CA3AF"
                style={{ minHeight: 80, textAlignVertical: 'top' }}
              />
              <HStack className="space-x-2">
                <Pressable
                  onPress={() => {
                    setShowAnswerInput(false);
                    setAnswerContent('');
                  }}
                  className="bg-gray-200 rounded-lg px-4 py-2 flex-1"
                >
                  <Text className="text-gray-700 font-semibold text-center">Hủy</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (answerContent.trim()) {
                      onAnswerSubmit(question.id, answerContent);
                      setAnswerContent('');
                      setShowAnswerInput(false);
                    }
                  }}
                  disabled={isSubmitting || !answerContent.trim()}
                  className={`bg-red-500 rounded-lg px-4 py-2 flex-1 ${(isSubmitting || !answerContent.trim()) ? 'opacity-50' : ''}`}
                >
                  {isSubmitting ? (
                    <HStack className="items-center justify-center">
                      <ActivityIndicator size="small" color="white" />
                      <Text className="text-white font-semibold ml-2">Đang gửi...</Text>
                    </HStack>
                  ) : (
                    <HStack className="items-center justify-center">
                      <Text className="text-white font-semibold mr-2">Gửi phản hồi</Text>
                      <Icon as={SendIcon} size="sm" className="text-white" />
                    </HStack>
                  )}
                </Pressable>
              </HStack>
            </VStack>
          )}

          {/* Answers Section */}
          {question.answers && question.answers.length > 0 && expandedAnswers && (
            <VStack className="mt-3 space-y-4">
              {question.answers.map((answer) => (
                <HStack key={answer.id} className="items-start pl-4 border-l-2 border-gray-100">
                  {/* Answer Avatar */}
                  <Avatar className="w-10 h-10 mr-3">
                    <AvatarFallbackText className={answer.admin ? 'bg-red-600 text-white font-bold text-xs' : 'bg-purple-600 text-white font-semibold text-sm'}>
                      {answer.admin ? 'S' : getUserInitials(answer.userName || 'U')}
                    </AvatarFallbackText>
                  </Avatar>

                  <VStack className="flex-1">
                    {/* Answer Header */}
                    <HStack className="items-center mb-2">
                      <Text className="text-gray-900 font-semibold text-sm mr-2">
                        {answer.admin ? 'Quản Trị Viên' : (answer.userName || 'Người dùng')}
                      </Text>
                      {answer.admin && (
                        <Badge className="bg-red-500">
                          <BadgeText className="text-white text-xs">QTV</BadgeText>
                        </Badge>
                      )}
                      {answer.createdAt && (
                        <HStack className="items-center ml-2">
                          <ClockIcon size={12} color="#9CA3AF" />
                          <Text className="text-gray-400 text-xs ml-1">{formatTimeAgo(answer.createdAt)}</Text>
                        </HStack>
                      )}
                    </HStack>

                    {/* Answer Content */}
                    <Text className="text-gray-700 text-sm leading-relaxed">{answer.content}</Text>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          )}
        </VStack>
      </HStack>
    </Box>
  );
};
