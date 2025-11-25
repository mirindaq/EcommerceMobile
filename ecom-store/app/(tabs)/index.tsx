import CartIcon from "@/components/CartIcon";
import ProductBox from "@/components/ProductBox";
import ChatTypeModal from "@/components/chat/ChatTypeModal";
import {
  Box,
  HStack,
  Icon,
  Input,
  InputField,
  InputIcon,
  InputSlot,
  Pressable,
  SafeAreaView,
  Text,
} from "@/components/ui";
import { cartService } from "@/services/cart.service";
import { categoryService } from "@/services/category.service";
import { productService } from "@/services/product.service";
import { wishListService } from "@/services/wishList.service";
import type { Category } from "@/types/category.type";
import type { Product } from "@/types/product.type";
import { WishListResponse } from "@/types/wishList.type";
import AuthStorageUtil from "@/utils/authStorage.util";
import { useRouter } from "expo-router";
import {
  BookIcon,
  CameraIcon,
  ChevronRightIcon,
  FootprintsIcon,
  HeadphonesIcon,
  HomeIcon,
  LaptopIcon,
  MessageCircleIcon,
  SearchIcon,
  ShirtIcon,
  SmartphoneIcon,
  WatchIcon,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView } from "react-native";

const banners = [
  {
    id: 1,
    title: "Siêu Sale 10.10",
    subtitle: "Giảm đến 50% toàn sàn!",
    image:
      "https://cdn2.cellphones.com.vn/insecure/rs:fill:1036:450/q:90/plain/https://dashboard.cellphones.com.vn/storage/home_Nubia_Neo-3-Series-1125.jpg",
  },
  {
    id: 2,
    title: "Flash Sale 12h mỗi ngày",
    subtitle: "Nhanh tay kẻo hết!",
    image:
      "https://cdn2.cellphones.com.vn/insecure/rs:fill:1036:450/q:90/plain/https://dashboard.cellphones.com.vn/storage/coros-pace4_home.png",
  },
];

const categoryIcons: { [key: string]: any } = {
  Laptop: LaptopIcon,
  "Điện thoại": SmartphoneIcon,
  "Đồng hồ": WatchIcon,
  "Tai nghe": HeadphonesIcon,
  "Thời trang": ShirtIcon,
  "Giày dép": FootprintsIcon,
  Sách: BookIcon,
  "Nội thất": HomeIcon,
};

const categoryColors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
];

export default function HomeScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("Áo Khoác Nam");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [wishListItems, setWishListItems] = useState<WishListResponse[]>([]);
  const [showChatModal, setShowChatModal] = useState(false);

  const refetchWishlist = useCallback(async () => {
    const isAuthenticated = await AuthStorageUtil.isAuthenticated();
    if (isAuthenticated) {
      try {
        const wishListRes = await wishListService.getMyWishList();
        setWishListItems(wishListRes || []);
      } catch (error) {
        console.error("Error loading wishlist:", error);
        setWishListItems([]);
      }
    } else {
      setWishListItems([]);
    }
  }, []);

  useEffect(() => {
    loadData();
    refetchWishlist();
  }, [refetchWishlist]);

  const loadData = async () => {
    try {
      setLoading(true);

      const categoriesRes = await categoryService.getAllCategoriesSimple();
      setCategories(categoriesRes.data?.data || []);

      const productsRes = await productService.getProducts(1, 10, "");
      setProducts(productsRes.data?.data || []);

      const isAuthenticated = await AuthStorageUtil.isAuthenticated();
      if (isAuthenticated) {
        try {
          const cartRes = await cartService.getCart();
          const itemCount =
            cartRes.data?.items?.reduce(
              (sum: number, item: any) => sum + item.quantity,
              0
            ) || 0;
          setCartCount(itemCount);
        } catch (error) {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
        setWishListItems([]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchPress = () => {
    router.push("/search");
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <Box className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EF4444" />
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <Box className="bg-red-500 px-4 py-4 z-50">
        <HStack className="items-center justify-between gap-4">
          <Pressable onPress={handleSearchPress} className="flex-1 mr-3 py-2">
            <Input
              className="bg-white rounded-md"
              variant="rounded"
              pointerEvents="none"
            >
              <InputSlot className="pl-4">
                <InputIcon as={SearchIcon} size="sm" className="text-gray-500" />
              </InputSlot>
              <InputField
                placeholder="Áo Khoác Nam"
                value={searchText}
                className="text-orange-500"
                placeholderTextColor="#F97316"
                editable={false}
              />
              <InputSlot className="pr-4">
                <InputIcon as={CameraIcon} size="sm" className="text-gray-500" />
              </InputSlot>
            </Input>
          </Pressable>
          <CartIcon
            size={24}
            color="white"
            badgeCount={cartCount}
            className="mr-3"
          />

          <Pressable onPress={() => setShowChatModal(true)}>
            <MessageCircleIcon size={24} color="white" />
          </Pressable>
        </HStack>
      </Box>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
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

        <Box className="px-4 mb-6">
          <Text className="text-gray-900 font-bold text-lg mb-3">
            Danh mục sản phẩm
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HStack space="md" className="px-1">
              {categories.slice(0, 8).map((category, index) => {
                const IconComponent = categoryIcons[category.name] || HomeIcon;
                const color = categoryColors[index % categoryColors.length];

                const handleCategoryPress = () => {
                  if (category.slug) {
                    router.push(`/search-category?slug=${category.slug}`);
                  }
                };

                return (
                  <Pressable
                    key={category.id}
                    className="items-center min-w-[80px]"
                    onPress={handleCategoryPress}
                  >
                    <Box
                      className="w-16 h-16 rounded-xl items-center justify-center mb-2 box-shadow-soft-1"
                      style={{ backgroundColor: color + "20" }}
                    >
                      <Icon
                        as={IconComponent}
                        size="lg"
                        style={{ color: color }}
                      />
                    </Box>
                    <Text className="text-gray-700 text-xs text-center font-medium">
                      {category.name}
                    </Text>
                  </Pressable>
                );
              })}
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
              {products.map((product) => {
                return (
                  <Box key={product.id} style={{ width: "48%" }}>
                    <ProductBox
                      product={product}
                      wishListItems={wishListItems}
                      onWishlistChange={refetchWishlist}
                    />
                  </Box>
                );
              })}
            </HStack>
          </ScrollView>
        </Box>
      </ScrollView>

      <ChatTypeModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
      />
    </SafeAreaView>
  );
}
