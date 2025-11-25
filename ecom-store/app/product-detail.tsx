import CartIcon from "@/components/CartIcon";
import ChatTypeModal from "@/components/chat/ChatTypeModal";
import {
  ProductDescription,
  ProductImages,
  ProductInfo,
  ProductQuestions,
  VariantSelector,
} from "@/components/product-detail";
import {
  Box,
  HStack,
  Input,
  InputField,
  InputIcon,
  InputSlot,
  Pressable,
  SafeAreaView,
  Text,
} from "@/components/ui";
import { cartService } from "@/services/cart.service";
import { productService } from "@/services/product.service";
import { productQuestionService } from "@/services/productQuestion.service";
import { wishListService } from "@/services/wishList.service";
import type { Product, ProductVariantResponse } from "@/types/product.type";
import type { ProductQuestion } from "@/types/productQuestion.type";
import { WishListResponse } from "@/types/wishList.type";
import AuthStorageUtil from "@/utils/authStorage.util";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeftIcon,
  CameraIcon,
  HeartIcon,
  MessageCircleIcon,
  SearchIcon,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView } from "react-native";

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariantResponse | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<{
    [key: string]: string;
  }>({});
  const [availableVariants, setAvailableVariants] = useState<{
    [key: string]: string[];
  }>({});
  const [showVariantModal, setShowVariantModal] = useState(false);

  // Question states
  const [questionContent, setQuestionContent] = useState("");
  const [allQuestions, setAllQuestions] = useState<ProductQuestion[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  // Wishlist states
  const [wishListItems, setWishListItems] = useState<WishListResponse[]>([]);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const pageSize = 5;

  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const productId = params.id ? Number(params.id) : null;
        const slug = params.slug as string | undefined;

        if (!productId && !slug) {
          Alert.alert("Lỗi", "Không tìm thấy sản phẩm");
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

        // Load wishlist
        await loadWishlist();
      } catch (error: any) {
        console.error("Error loading product:", error);
        Alert.alert(
          "Lỗi",
          error?.response?.data?.message || "Không thể tải sản phẩm"
        );
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.id, params.slug]);

  // Load wishlist
  const loadWishlist = async () => {
    const isAuthenticated = await AuthStorageUtil.isAuthenticated();
    if (!isAuthenticated) {
      setWishListItems([]);
      return;
    }

    try {
      const wishListRes = await wishListService.getMyWishList();
      setWishListItems(Array.isArray(wishListRes) ? wishListRes : []);
    } catch (error) {
      console.error("Error loading wishlist:", error);
      setWishListItems([]);
    }
  };

  // Check if product is in wishlist (backend uses productId, not variantId)
  const isInWishlist = (): boolean => {
    if (
      !product?.id ||
      !Array.isArray(wishListItems) ||
      wishListItems.length === 0
    ) {
      return false;
    }
    const productId = product.id;
    // Backend stores by Product, so we check by productId
    // Response has id field which is the wishlist entry id, and productId field
    return wishListItems.some((item) => {
      // Check if item has productId field matching our product.id
      return (item as any).productId === productId;
    });
  };

  // Toggle wishlist
  const handleToggleWishlist = async () => {
    if (!product?.id) {
      Alert.alert("Thông báo", "Không tìm thấy thông tin sản phẩm");
      return;
    }

    const isAuthenticated = await AuthStorageUtil.isAuthenticated();
    if (!isAuthenticated) {
      Alert.alert(
        "Thông báo",
        "Vui lòng đăng nhập để thêm vào danh sách yêu thích"
      );
      router.push("/login");
      return;
    }

    try {
      setIsWishlistLoading(true);
      const productId = product.id;

      // Check if product is already in wishlist
      const inWishlist = isInWishlist();

      if (inWishlist) {
        await wishListService.removeProductFromWishList(productId);
        Alert.alert("Thành công", "Đã xóa khỏi danh sách yêu thích");
      } else {
        await wishListService.addProducToWishList({ productId });
        Alert.alert("Thành công", "Đã thêm vào danh sách yêu thích");
      }

      await loadWishlist();
    } catch (error: any) {
      console.error("Wishlist error:", error);
      Alert.alert(
        "Lỗi",
        error?.response?.data?.message ||
          "Không thể thao tác danh sách yêu thích"
      );
    } finally {
      setIsWishlistLoading(false);
    }
  };

  // Load questions
  const loadQuestions = async (slug: string, page: number) => {
    try {
      setQuestionsLoading(true);
      const response = await productQuestionService.getProductQuestionsBySlug(
        slug,
        page,
        pageSize
      );
      const questions = response.data.data;
      const newTotalPages = response.data.totalPage;
      const newTotalItems = response.data.totalItem;

      setTotalPages(newTotalPages);
      setTotalItems(newTotalItems);

      if (page === 1) {
        setAllQuestions(questions);
      } else {
        setAllQuestions((prev) => [...prev, ...questions]);
      }
    } catch (error: any) {
      console.error("Error loading questions:", error);
    } finally {
      setQuestionsLoading(false);
    }
  };

  // Extract variants from API data dynamically
  const extractVariantsFromProduct = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return;

    const variantGroups: { [key: string]: Set<string> } = {};
    const defaultSelections: { [key: string]: string } = {};

    product.variants.forEach((variant) => {
      if (variant.productVariantValues) {
        variant.productVariantValues.forEach((variantValue) => {
          const { value } = variantValue.variantValue;
          const variantName =
            variantValue.variantValue.variantName || "Mặc định";

          if (!variantGroups[variantName]) {
            variantGroups[variantName] = new Set();
          }
          variantGroups[variantName].add(value);
        });
      }
    });

    // Convert Sets to Arrays and set defaults
    const availableVariants: { [key: string]: string[] } = {};
    Object.keys(variantGroups).forEach((variantName) => {
      availableVariants[variantName] = Array.from(variantGroups[variantName]);
      defaultSelections[variantName] = availableVariants[variantName][0];
    });

    setAvailableVariants(availableVariants);
    setSelectedVariants(defaultSelections);
  };

  // Find matching variant based on selections
  const findMatchingVariant = () => {
    if (!product?.variants) return null;

    return product.variants.find((variant) => {
      if (!variant.productVariantValues) return false;

      // Get all variant values for this variant
      const variantValues = variant.productVariantValues.map((vv) => ({
        name: vv.variantValue.variantName,
        value: vv.variantValue.value,
      }));

      // Check if all selected variants match this variant
      return Object.keys(selectedVariants).every((variantName) => {
        const selectedValue = selectedVariants[variantName];
        if (!selectedValue) return true;

        return variantValues.some(
          (vv) => vv.name === variantName && vv.value === selectedValue
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
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName]: value,
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleQuantityChange = (type: "increase" | "decrease") => {
    if (type === "increase") {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleSearchPress = () => {
    router.push("/search");
  };

  const handleSubmitQuestion = async () => {
    if (!questionContent.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập câu hỏi");
      return;
    }

    if (!product?.id) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin sản phẩm");
      return;
    }

    try {
      setIsSubmittingQuestion(true);
      await productQuestionService.createProductQuestion({
        content: questionContent.trim(),
        productId: product.id,
      });
      Alert.alert("Thành công", "Câu hỏi đã được gửi thành công!");
      setQuestionContent("");
      setAllQuestions([]);
      setCurrentPage(1);
      if (product.slug) {
        loadQuestions(product.slug, 1);
      }
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error?.response?.data?.message || "Không thể gửi câu hỏi"
      );
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const handleAnswerSubmit = async (questionId: number, content: string) => {
    if (!content.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập câu trả lời");
      return;
    }

    try {
      setIsSubmittingAnswer(true);
      await productQuestionService.createProductQuestionAnswer({
        content: content.trim(),
        productQuestionId: questionId,
      });
      Alert.alert("Thành công", "Trả lời đã được gửi thành công!");
      setAllQuestions([]);
      setCurrentPage(1);
      if (product?.slug) {
        loadQuestions(product.slug, 1);
      }
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error?.response?.data?.message || "Không thể gửi trả lời"
      );
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      if (product?.variants && product.variants.length > 0) {
        setShowVariantModal(true);
      } else {
        Alert.alert("Lỗi", "Vui lòng chọn biến thể sản phẩm");
      }
      return;
    }

    try {
      await cartService.addProductToCart({
        productVariantId: selectedVariant.id,
        quantity: quantity,
      });
      Alert.alert("Thành công", "Đã thêm vào giỏ hàng");
      setShowVariantModal(false);
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error?.response?.data?.message || "Không thể thêm vào giỏ hàng"
      );
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) {
      if (product?.variants && product.variants.length > 0) {
        setShowVariantModal(true);
      } else {
        Alert.alert("Lỗi", "Vui lòng chọn biến thể sản phẩm");
      }
      return;
    }

    try {
      await cartService.addProductToCart({
        productVariantId: selectedVariant.id,
        quantity: quantity,
      });
      setShowVariantModal(false);
      router.push("/cart");
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error?.response?.data?.message || "Không thể thêm vào giỏ hàng"
      );
    }
  };

  if (loading || !product) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <Box className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EF4444" />
          <Text className="text-gray-500 mt-4">
            {loading ? "Đang tải sản phẩm..." : "Không tìm thấy sản phẩm"}
          </Text>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <Box className="bg-white px-4 py-3 border-b border-gray-200">
        <HStack className="items-center">
          <Pressable className="mr-3" onPress={handleGoBack}>
            <ArrowLeftIcon size={24} color="#374151" />
          </Pressable>

          <Pressable className="flex-1 mr-3" onPress={handleSearchPress}>
            <Input
              className="bg-gray-100 rounded-md"
              variant="rounded"
              pointerEvents="none" // Quan trọng: Chặn touch vào Input để Pressable bắt sự kiện
            >
              <InputSlot className="pl-4">
                <InputIcon>
                  <SearchIcon size={16} color="#6B7280" />
                </InputIcon>
              </InputSlot>
              <InputField
                placeholder="Tìm kiếm sản phẩm"
                className="text-gray-900"
                placeholderTextColor="#9CA3AF"
                editable={false} // Không cho nhập ở đây
              />
              <InputSlot className="pr-4">
                <InputIcon>
                  <CameraIcon size={16} color="#6B7280" />
                </InputIcon>
              </InputSlot>
            </Input>
          </Pressable>

          {/* Nút search đỏ bên phải */}
          <Pressable
            className="bg-red-500 w-10 h-10 rounded-lg items-center justify-center"
            onPress={handleSearchPress}
          >
            <SearchIcon size={20} color="white" />
          </Pressable>

          {/* Wishlist Button */}
          <Pressable
            className="ml-2 bg-gray-100 w-10 h-10 rounded-lg items-center justify-center"
            onPress={handleToggleWishlist}
            disabled={isWishlistLoading || !selectedVariant}
          >
            <HeartIcon
              size={20}
              color={isInWishlist() ? "#EF4444" : "#6B7280"}
              fill={isInWishlist() ? "#EF4444" : "none"}
            />
          </Pressable>
        </HStack>
      </Box>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Product Images */}
        <ProductImages
          images={product.productImages}
          currentIndex={currentImageIndex}
          onIndexChange={setCurrentImageIndex}
        />

        {/* Product Info */}
        <ProductInfo
          product={product}
          selectedVariant={selectedVariant}
          availableVariants={availableVariants}
          selectedVariants={selectedVariants}
          onVariantModalOpen={() => setShowVariantModal(true)}
          formatPrice={formatPrice}
        />

        {/* Product Description */}
        <ProductDescription description={product.description} />

        {/* Product Questions */}
        <ProductQuestions
          questions={allQuestions}
          loading={questionsLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          questionContent={questionContent}
          isSubmittingQuestion={isSubmittingQuestion}
          isSubmittingAnswer={isSubmittingAnswer}
          onQuestionChange={setQuestionContent}
          onSubmitQuestion={handleSubmitQuestion}
          onAnswerSubmit={handleAnswerSubmit}
          onLoadMore={() => {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            if (product.slug) {
              loadQuestions(product.slug, nextPage);
            }
          }}
        />
      </ScrollView>

      {/* Bottom Action Bar */}
      <Box className="bg-white border-t border-gray-200 px-4 py-3">
        <HStack className="items-center justify-between">
          <HStack className="items-center space-x-4">
            <Pressable
              onPress={() => setShowChatModal(true)}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            >
              <MessageCircleIcon size={20} color="#6B7280" />
            </Pressable>
            <CartIcon
              size={20}
              color="#6B7280"
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center ml-3"
            />
          </HStack>

          <Pressable
            className="bg-red-500 rounded-lg px-6 py-3 flex-1 ml-4"
            onPress={handleBuyNow}
          >
            <Text className="text-white font-bold text-lg text-center">
              Mua ngay
            </Text>
          </Pressable>
        </HStack>
      </Box>

      {/* Variant Selection Modal */}
      <VariantSelector
        visible={showVariantModal}
        product={product}
        selectedVariant={selectedVariant}
        availableVariants={availableVariants}
        selectedVariants={selectedVariants}
        quantity={quantity}
        onClose={() => setShowVariantModal(false)}
        onVariantSelect={handleVariantSelection}
        onQuantityChange={handleQuantityChange}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        formatPrice={formatPrice}
      />

      <ChatTypeModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
      />
    </SafeAreaView>
  );
}
