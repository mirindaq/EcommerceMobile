import React from "react";
import { ScrollView, Image, TouchableOpacity } from "react-native";
import {
  Box,
  HStack,
  VStack,
  Text,
  Pressable,
  Icon,
  Badge,
  BadgeText,
  SafeAreaView,
} from "@/components/ui";
import {
  ArrowLeftIcon,
  ClockIcon,
  HeartIcon, // Dùng HeartIcon cho icon sản phẩm đã yêu thích
  // Bỏ StarIcon vì không còn hiển thị rating theo kiểu Home
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useHideTabBar } from "@/hooks/use-hide-tab-bar";

// Khai báo kiểu dữ liệu cho sản phẩm
interface Product {
  id: number;
  name: string;
  price: string;
  originalPrice?: string; // Giá gốc (có thể không có)
  discount?: string; // Phần trăm giảm giá (có thể không có)
  rating: number; // Giữ rating
  soldCount: string; // Giữ soldCount
  image: string;
  deliveryTime: string;
  location: string;
  isLive: boolean;
}

// Dữ liệu sản phẩm Yêu thích giả
const FAVORITE_PRODUCTS: Product[] = [
  {
    id: 10,
    name: "Laptop Dell XPS 13 (2024) - Màn hình OLED",
    price: "32.000.000₫",
    rating: 5.0,
    soldCount: "Đã bán 500+",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
    deliveryTime: "1 Ngày",
    location: "TP. Hồ Chí Minh",
    isLive: true,
  },
  {
    id: 11,
    name: "Kem chống nắng Biore UV Aqua Rich Watery Essence",
    price: "159.000₫",
    originalPrice: "200.000₫", // Có giảm giá
    discount: "20",
    rating: 4.9,
    soldCount: "Đã bán 15k+",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
    deliveryTime: "3 Giờ",
    location: "Hà Nội",
    isLive: true,
  },
  {
    id: 12,
    name: "Bàn phím cơ AKKO 3098B Multi-mode",
    price: "1.990.000₫",
    rating: 4.9,
    soldCount: "Đã bán 800+",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
    deliveryTime: "2 Ngày",
    location: "Đà Nẵng",
    isLive: false,
  },
  {
    id: 13,
    name: "Giày chạy bộ Adidas Ultraboost Light",
    price: "3.200.000₫",
    originalPrice: "4.000.000₫", // Có giảm giá
    discount: "20",
    rating: 5.0,
    soldCount: "Đã bán 3k+",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
    deliveryTime: "4 Giờ",
    location: "TP. Hồ Chí Minh",
    isLive: true,
  },
];

// Component ProductBox (Đã đồng bộ giao diện với HomeScreen)
const ProductBox: React.FC<{ product: Product }> = ({ product }) => (
  <Pressable className="bg-white rounded-lg overflow-hidden shadow-sm mb-4 border border-gray-100">
    <Image
      source={{ uri: product.image }}
      className="w-full h-40 object-cover"
    />

    {/* 1. Discount Badge (Hiển thị nếu có giảm giá) */}
    {product.discount && (
      <Badge
        action="muted"
        size="sm"
        className="absolute top-2 left-2 bg-red-500" // Đổi vị trí sang trái-trên như trang chủ
      >
        <BadgeText className="text-white text-xs font-bold">
          -{product.discount}%
        </BadgeText>
      </Badge>
    )}

    {/* 2. Nút Yêu thích (ở vị trí phải-trên) */}
    <TouchableOpacity className="absolute top-2 right-2 p-1 bg-white/70 rounded-full">
      {/* Sử dụng HeartIcon màu đỏ và filled */}
      <HeartIcon size={20} color="#EF4444" fill="#EF4444" />
    </TouchableOpacity>

    <VStack className="p-3">
      <Text className="text-sm text-gray-800" numberOfLines={2}>
        {product.name}
      </Text>

      <HStack className="items-center mt-1">
        {/* Giá bán chính */}
        <Text className="text-red-500 font-bold text-lg mr-2">
          {product.price}
        </Text>

        {/* Giá gốc bị gạch ngang */}
        {product.originalPrice && (
          <Text className="text-gray-400 text-xs line-through">
            {product.originalPrice}
          </Text>
        )}
      </HStack>

      {/* Vị trí & Đã bán */}
      <HStack className="items-center justify-between mt-1">
        <HStack className="items-center">
          <Icon as={ClockIcon} size="xs" color="#9CA3AF" />
          <Text className="text-xs text-gray-500 ml-1">
            {product.deliveryTime}
          </Text>
        </HStack>
        <Text className="text-xs text-gray-500">{product.location}</Text>
      </HStack>
      <Text className="text-xs text-gray-600 mt-1">{product.soldCount}</Text>
    </VStack>
  </Pressable>
);

export default function FavoriteProductsScreen() {
  const router = useRouter();
  useHideTabBar();
  const ICON_COLOR = "#EF4444";

  const handleGoBack = () => {
    router.push('/(tabs)/(profile)/profile');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <Box className="bg-white px-4 py-3 border-b border-gray-200 z-10">
        <HStack className="items-center">
          <TouchableOpacity onPress={handleGoBack} className="mr-3">
            <ArrowLeftIcon size={24} />
          </TouchableOpacity>

          <Text className="text-xl font-bold text-gray-900">
            Sản phẩm Yêu thích
          </Text>
        </HStack>
      </Box>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Thông báo số lượng sản phẩm */}
        <Box className="p-4 bg-white border-b border-gray-200">
          <Text className="text-gray-700 text-sm font-medium">
            Bạn có {FAVORITE_PRODUCTS.length} sản phẩm trong danh sách yêu
            thích.
          </Text>
        </Box>

        {/* Product Grid */}
        <Box className="px-4 py-4">
          <HStack space="md" className="flex-wrap justify-between">
            {FAVORITE_PRODUCTS.map((product) => (
              <Box key={product.id} style={{ width: "48%" }}>
                <ProductBox product={product} />
              </Box>
            ))}
          </HStack>
        </Box>

      </ScrollView>
    </SafeAreaView>
  );
}
