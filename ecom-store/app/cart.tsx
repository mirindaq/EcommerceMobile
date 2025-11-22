import {
  Box,
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
  HStack,
  Icon,
  Pressable,
  SafeAreaView,
  Text,
  VStack,
  View,
} from "@/components/ui";
import { cartService } from "@/services/cart.service";
import type { CartDetailResponse } from "@/types/cart.type";
import AuthStorageUtil from "@/utils/authStorage.util";
import { useRouter } from "expo-router";
import { ArrowLeftIcon, CheckIcon, Trash2Icon } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView } from "react-native";

export default function CartScreen() {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [cartItems, setCartItems] = useState<CartDetailResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication first
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await AuthStorageUtil.isAuthenticated();
        if (!isAuthenticated) {
          router.replace("/login");
          return;
        }
      } catch (error) {
        console.error("Auth check error:", error);
        router.replace("/login");
        return;
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isCheckingAuth) return; // Don't load cart if still checking auth
    loadCart();
  }, [isCheckingAuth]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.getCart();
      setCartItems(response.data?.items || []);
    } catch (error: any) {
      console.error("Error loading cart:", error);
      // Cart might be empty, that's okay
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productVariantId: number) => {
    try {
      await cartService.removeProductFromCart(productVariantId);
      await loadCart();
      setSelectedItems((prev) => prev.filter((id) => id !== productVariantId));
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error?.response?.data?.message || "Không thể xóa sản phẩm"
      );
    }
  };

  const handleUpdateQuantity = async (
    productVariantId: number,
    newQuantity: number
  ) => {
    if (newQuantity < 1) {
      handleRemoveItem(productVariantId);
      return;
    }
    try {
      await cartService.updateCartItemQuantity(productVariantId, newQuantity);
      await loadCart();
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error?.response?.data?.message || "Không thể cập nhật số lượng"
      );
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((i) => i.id));
    }
  };

  const totalPrice = selectedItems.reduce((sum, id) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return sum;
    const itemPrice = item.price * (1 - (item.discount || 0) / 100);
    return sum + itemPrice * item.quantity;
  }, 0);

  if (isCheckingAuth) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <Box className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EF4444" />
          <Text className="text-gray-500 mt-4">Đang kiểm tra...</Text>
        </Box>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <HStack className="items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
          <Pressable onPress={() => router.back()}>
            <ArrowLeftIcon size={24} color="#000" />
          </Pressable>
          <Text className="text-lg font-semibold">Giỏ hàng</Text>
          <Box style={{ width: 24 }} />
        </HStack>
        <Box className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EF4444" />
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f5f5f5]">
      {/* Header */}
      <Box className="bg-white px-4 py-3 border-b border-gray-200 flex-row items-center shadow-sm z-10">
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <ArrowLeftIcon size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-medium ml-4 text-gray-800">
          Giỏ hàng ({cartItems.length})
        </Text>
      </Box>

      {/* Cart List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {cartItems.length === 0 ? (
          <Box className="items-center justify-center py-20">
            <Image
              source={{
                uri: "https://cdn-icons-png.flaticon.com/512/11329/11329060.png",
              }}
              className="w-32 h-32 opacity-50 mb-4"
            />
            <Text className="text-gray-500 text-base font-medium">
              Giỏ hàng trống
            </Text>
            <Pressable onPress={() => router.push("/")} className="mt-4">
              <Text className="text-[#ee4d2d] font-medium">
                Tiếp tục mua sắm
              </Text>
            </Pressable>
          </Box>
        ) : (
          cartItems.map((item) => {
            const finalPrice = item.price * (1 - (item.discount || 0) / 100);
            return (
              <Box
                key={item.id}
                className="bg-white mt-2 px-3 py-4 flex-row items-center"
              >
                {/* Checkbox */}
                <Checkbox
                  value={item.id.toString()}
                  isChecked={selectedItems.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  className="mr-3"
                >
                  <CheckboxIndicator
                    className={`w-5 h-5 rounded border ${
                      selectedItems.includes(item.id)
                        ? "bg-[#ee4d2d] border-[#ee4d2d]"
                        : "border-gray-300 bg-white"
                    } items-center justify-center`}
                  >
                    {selectedItems.includes(item.id) && (
                      <CheckboxIcon as={CheckIcon} color="#fff" size="md" />
                    )}
                  </CheckboxIndicator>
                </Checkbox>

                {/* Image */}
                <Image
                  source={{ uri: item.productImage }}
                  className="w-24 h-24 rounded border border-gray-100 bg-gray-50"
                  resizeMode="cover"
                />

                {/* Info */}
                <View className="flex-1 ml-3 h-24 justify-between">
                  <View>
                    <View className="flex-row justify-between items-start">
                      <Text
                        numberOfLines={2}
                        className="text-gray-800 text-sm leading-5 flex-1 mr-2"
                      >
                        {item.productName}
                      </Text>
                      <Pressable
                        onPress={() => handleRemoveItem(item.productVariantId)}
                        hitSlop={10}
                      >
                        <Icon
                          as={Trash2Icon}
                          size="xs"
                          className="text-gray-400"
                        />
                      </Pressable>
                    </View>

                    {/* SKU / Variant Badge */}
                    <View className="bg-gray-100 self-start px-2 py-0.5 rounded mt-1">
                      <Text className="text-xs text-gray-500">
                        Phân loại: {item.sku}
                      </Text>
                    </View>
                  </View>

                  <HStack className="items-end justify-between mt-2">
                    <Text className="text-[#ee4d2d] font-bold text-base">
                      {finalPrice.toLocaleString("vi-VN")}₫
                    </Text>

                    {/* Quantity Stepper */}
                    <View className="flex-row items-center border border-gray-300 rounded bg-white">
                      <Pressable
                        onPress={() =>
                          handleUpdateQuantity(
                            item.productVariantId,
                            item.quantity - 1
                          )
                        }
                        className="w-7 h-7 items-center justify-center border-r border-gray-300 active:bg-gray-100"
                      >
                        <Text className="text-gray-600 font-medium">-</Text>
                      </Pressable>

                      <View className="w-10 h-7 items-center justify-center bg-white">
                        <Text className="text-gray-800 font-medium text-sm">
                          {item.quantity}
                        </Text>
                      </View>

                      <Pressable
                        onPress={() =>
                          handleUpdateQuantity(
                            item.productVariantId,
                            item.quantity + 1
                          )
                        }
                        className="w-7 h-7 items-center justify-center border-l border-gray-300 active:bg-gray-100"
                      >
                        <Text className="text-gray-600 font-medium">+</Text>
                      </Pressable>
                    </View>
                  </HStack>
                </View>
              </Box>
            );
          })
        )}
      </ScrollView>

      {/* Footer - Fixed Bottom */}
      <Box className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
        <HStack className="items-center justify-between pl-4 pr-0 h-14">
          {/* Select All & Total */}
          <HStack className="flex-1 items-center space-x-3">
            <Checkbox
              value="all"
              isChecked={
                selectedItems.length > 0 &&
                selectedItems.length === cartItems.length
              }
              onChange={toggleSelectAll}
            >
              <CheckboxIndicator
                className={`w-5 h-5 rounded border ${
                  selectedItems.length === cartItems.length &&
                  cartItems.length > 0
                    ? "bg-[#ee4d2d] border-[#ee4d2d]"
                    : "border-gray-300 bg-white"
                } items-center justify-center`}
              >
                <CheckboxIcon as={CheckIcon} color="#fff" size="md" />
              </CheckboxIndicator>
              <CheckboxLabel className="text-gray-500 text-sm ml-2 font-normal">
                Tất cả
              </CheckboxLabel>
            </Checkbox>

            <VStack className="items-end flex-1 pr-3">
              <Text className="text-xs text-gray-500">Tổng thanh toán</Text>
              <Text className="text-[#ee4d2d] font-bold text-base">
                {totalPrice.toLocaleString("vi-VN")}₫
              </Text>
            </VStack>
          </HStack>

          {/* Buy Button */}
          <Pressable
            className={`h-full justify-center px-8 ${
              selectedItems.length === 0 ? "bg-gray-300" : "bg-red-500"
            }`}
            disabled={selectedItems.length === 0}
            onPress={() => {
              if (selectedItems.length === 0) return;
              router.push("/checkout");
            }}
            style={({ pressed }) => ({
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Text className="text-white font-bold text-base">
              Mua hàng ({selectedItems.length})
            </Text>
          </Pressable>
        </HStack>
        {/* Safe Area Bottom Padding buffer specifically for iOS swipe bar if needed */}
        <View className="h-safe-bottom bg-white" />
      </Box>
    </SafeAreaView>
  );
}
