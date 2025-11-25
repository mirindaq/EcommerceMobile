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
  Input,
  InputField,
  InputIcon,
  InputSlot,
} from "@/components/ui";
import {
  ArrowLeftIcon,
  SearchIcon,
  FilterIcon,
  ClockIcon,
  ChevronRightIcon, // 👈 ĐÃ KHẮC PHỤC: Thêm import ChevronRightIcon
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useHideTabBar } from "@/hooks/use-hide-tab-bar";

// Khai báo kiểu dữ liệu cho sản phẩm (Tham khảo từ HomeScreen)
interface Product {
  id: number;
  name: string;
  price: string;
  originalPrice: string;
  discount: string;
  rating: number;
  soldCount: string;
  image: string;
  deliveryTime: string;
  location: string;
  isLive: boolean;
}

// Dữ liệu sản phẩm giả (Tất cả đều có discount)
const DISCOUNTED_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Đồng hồ nam dây da Casio MTP-V004L-1AUDF",
    price: "619.200₫",
    originalPrice: "825.600₫",
    discount: "25",
    rating: 5.0,
    soldCount: "Đã bán 8k+",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
    deliveryTime: "4 Giờ",
    location: "TP. Hồ Chí Minh",
    isLive: true,
  },
  {
    id: 2,
    name: "Tai nghe Bluetooth không dây Sony WH-1000XM5",
    price: "6.990.000₫",
    originalPrice: "8.490.000₫",
    discount: "18",
    rating: 4.8,
    soldCount: "Đã bán 1.5k+",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
    deliveryTime: "1 Ngày",
    location: "Hà Nội",
    isLive: false,
  },
  {
    id: 3,
    name: "Giày thể thao nam Nike Air Max 2024",
    price: "1.299.000₫",
    originalPrice: "1.599.000₫",
    discount: "19",
    rating: 4.9,
    soldCount: "Đã bán 5k+",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop",
    deliveryTime: "6 Giờ",
    location: "TP. Hồ Chí Minh",
    isLive: true,
  },
  {
    id: 4,
    name: "Bàn phím cơ DareU EK87 Pro RGB",
    price: "750.000₫",
    originalPrice: "950.000₫",
    discount: "21",
    rating: 4.7,
    soldCount: "Đã bán 3k+",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
    deliveryTime: "3 Giờ",
    location: "Đà Nẵng",
    isLive: true,
  },
  // Thêm sản phẩm khác để đảm bảo list đủ dài
  {
    id: 5,
    name: "Áo sơ mi nam Linen cao cấp",
    price: "350.000₫",
    originalPrice: "500.000₫",
    discount: "30",
    rating: 4.6,
    soldCount: "Đã bán 1.1k+",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
    deliveryTime: "5 Ngày",
    location: "Hải Phòng",
    isLive: false,
  },
];

// Component ProductBox (Mô phỏng lại từ ProductBox.tsx)
const ProductBox: React.FC<{ product: Product }> = ({ product }) => (
  <Pressable className="bg-white rounded-lg overflow-hidden shadow-sm mb-4 border border-gray-100">
    <Image
      source={{ uri: product.image }}
      className="w-full h-40 object-cover"
    />
    {/* Discount Badge */}
    <Badge
      action="muted"
      size="sm"
      className="absolute top-2 right-2 bg-red-500"
    >
      <BadgeText className="text-white text-xs font-bold">
        -{product.discount}%
      </BadgeText>
    </Badge>

    <VStack className="p-3">
      <Text className="text-sm text-gray-800" numberOfLines={2}>
        {product.name}
      </Text>
      <HStack className="items-center mt-1">
        <Text className="text-red-500 font-bold text-lg mr-2">
          {product.price}
        </Text>
        <Text className="text-gray-400 text-xs line-through">
          {product.originalPrice}
        </Text>
      </HStack>
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

export default function DiscountedProductsScreen() {
  useHideTabBar();
  const router = useRouter();
  const ICON_COLOR = "#EF4444";

  const handleGoBack = () => {
    router.push('/(tabs)/(profile)/profile');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Banner/Title Section */}
        <Box className="bg-red-500 pt-1 pl-4 pr-4 pb-6">
          <HStack className="items-center pt-5">
            <TouchableOpacity onPress={handleGoBack} className="mr-3">
              <ArrowLeftIcon size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-white">
              Ưu Đãi Giảm Giá Hiện Tại
            </Text>
          </HStack>
          <Text className="text-red-200 text-sm pl-10">
            Hàng ngàn sản phẩm đang sale shock, đừng bỏ lỡ!
          </Text>
        </Box>
        {/* Product Grid */}
        <Box className="px-4 py-4">
          <HStack space="md" className="flex-wrap justify-between">
            {DISCOUNTED_PRODUCTS.map((product) => (
              // Dùng width: "48%" để tạo bố cục 2 cột
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
