import React, { useState } from "react";
import { ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import {
  Box,
  HStack,
  VStack,
  Text,
  Pressable,
  Heading,
  Badge,
  BadgeText,
  Icon,
  Avatar,
  AvatarImage,
  AvatarFallbackText,
  SafeAreaView,
  Input,
  InputField,
  InputIcon,
  InputSlot,
} from "@/components/ui";
import {
  ShoppingCartIcon,
  MessageCircleIcon,
  SearchIcon,
  CameraIcon,
  ChevronRightIcon,
  LaptopIcon,
  SmartphoneIcon,
  WatchIcon,
  HeadphonesIcon,
  ShirtIcon,
  FootprintsIcon,
  BookIcon,
  HomeIcon,
} from "lucide-react-native";
import ProductBox from "@/components/ProductBox";

const banners = [
  {
    id: 1,
    title: "Siêu Sale 10.10",
    subtitle: "Giảm đến 50% toàn sàn!",
    image:
      "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=200&fit=crop",
  },
  {
    id: 2,
    title: "Flash Sale 12h mỗi ngày",
    subtitle: "Nhanh tay kẻo hết!",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop",
  },
];

const categories = [
  { id: 1, name: "Laptop", icon: LaptopIcon, color: "#FF6B6B" },
  { id: 2, name: "Điện thoại", icon: SmartphoneIcon, color: "#4ECDC4" },
  { id: 3, name: "Đồng hồ", icon: WatchIcon, color: "#45B7D1" },
  { id: 4, name: "Tai nghe", icon: HeadphonesIcon, color: "#96CEB4" },
  { id: 5, name: "Thời trang", icon: ShirtIcon, color: "#FFEAA7" },
  { id: 6, name: "Giày dép", icon: FootprintsIcon, color: "#DDA0DD" },
  { id: 7, name: "Sách", icon: BookIcon, color: "#98D8C8" },
  { id: 8, name: "Nội thất", icon: HomeIcon, color: "#F7DC6F" },
];

const products = [
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
    name: "Áo khoác nam dù chống nước",
    price: "299.000₫",
    originalPrice: "399.000₫",
    discount: "25",
    rating: 4.8,
    soldCount: "Đã bán 2k+",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
    deliveryTime: "2 Giờ",
    location: "Hà Nội",
    isLive: false,
  },
  {
    id: 3,
    name: "Giày thể thao nam Nike Air Max",
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
    name: "Áo khoác nam dù chống nước",
    price: "299.000₫",
    originalPrice: "399.000₫",
    discount: "25",
    rating: 4.8,
    soldCount: "Đã bán 2k+",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
    deliveryTime: "2 Giờ",
    location: "Hà Nội",
    isLive: false,
  },
  {
    id: 5,
    name: "Giày thể thao nam Nike Air Max",
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
];

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [cartCount] = useState(3);
  const [searchText, setSearchText] = useState("Áo Khoác Nam");

  const handleSearchPress = () => {
    navigation.navigate("search" as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Box className="bg-red-500 px-4 py-4 z-50">
        <HStack className="items-center justify-between">
          <Pressable onPress={handleSearchPress} className="flex-1 mr-3 py-2">
            <Input
              className="bg-white rounded-full"
              variant="rounded"
              pointerEvents="none"
            >
              <InputSlot className="pl-4">
                <InputIcon>
                  <SearchIcon size={16} color="#6B7280" />
                </InputIcon>
              </InputSlot>
              <InputField
                placeholder="Áo Khoác Nam"
                value={searchText}
                className="text-orange-500"
                placeholderTextColor="#F97316"
                editable={false}
              />
              <InputSlot className="pr-4">
                <InputIcon>
                  <CameraIcon size={16} color="#6B7280" />
                </InputIcon>
              </InputSlot>
            </Input>
          </Pressable>
          <Pressable
            className="relative mr-3"
            onPress={() => router.push("/cart")}
          >
            <ShoppingCartIcon size={24} color="white" />
            <Badge className="absolute -top-1 -right-1 bg-red-500"></Badge>
          </Pressable>

          <Pressable>
            <MessageCircleIcon size={24} color="white" />
          </Pressable>
        </HStack>
      </Box>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          className="py-4"
        >
          <HStack>
            {banners.map((b) => (
              <Box key={b.id} className="mx-2 w-80">
                <Pressable className="rounded-2xl overflow-hidden box-shadow-soft-1">
                  <Image
                    source={{ uri: b.image }}
                    className="w-full h-40 rounded-2xl"
                  />
                  <Box className="absolute bottom-3 left-3">
                    <Text className="text-white font-bold text-lg">
                      {b.title}
                    </Text>
                    <Text className="text-white text-xs">{b.subtitle}</Text>
                  </Box>
                </Pressable>
              </Box>
            ))}
          </HStack>
        </ScrollView>

        {/* Categories */}
        <Box className="px-4 mb-6">
          <Text className="text-gray-900 font-bold text-lg mb-3">
            Danh mục sản phẩm
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HStack space="md" className="px-1">
              {categories.map((category) => (
                <Pressable
                  key={category.id}
                  className="items-center min-w-[80px]"
                >
                  <Box
                    className="w-16 h-16 rounded-xl items-center justify-center mb-2 box-shadow-soft-1 "
                    style={{ backgroundColor: category.color + "20" }}
                  >
                    <Icon
                      as={category.icon}
                      size="lg"
                      style={{ color: category.color }}
                    />
                  </Box>
                  <Text className="text-gray-700 text-xs text-center font-medium">
                    {category.name}
                  </Text>
                </Pressable>
              ))}
            </HStack>
          </ScrollView>
        </Box>

        <Box className="px-4 mb-6">
          <HStack className="items-center justify-between mb-3">
            <Text className="text-gray-900 font-bold text-lg">Sản phẩm</Text>
            <Pressable className="flex-row items-center">
              <Text className="text-shopee text-sm text-orange-500">
                Xem tất cả
              </Text>
              <Icon
                as={ChevronRightIcon}
                size="sm"
                className="text-orange-500"
              />
            </Pressable>
          </HStack>

          <ScrollView>
            <HStack space="md" className="flex-wrap">
              {products.map((product, index) => (
                <Box key={product.id} style={{ width: "48%" }}>
                  <ProductBox product={product} />
                </Box>
              ))}
            </HStack>
          </ScrollView>
        </Box>

        <Box className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
