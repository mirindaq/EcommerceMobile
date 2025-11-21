import React, { useState, useEffect } from "react";
import { ScrollView, Image, ActivityIndicator, Alert, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Box,
  HStack,
  VStack,
  Text,
  Pressable,
  SafeAreaView,
  Checkbox,
  CheckboxIndicator,
  CheckboxIcon,
  CheckboxLabel,
  Button,
  ButtonText,
  Icon,
} from "@/components/ui";
import { ArrowLeftIcon, CheckIcon, ChevronLeftIcon, Trash2Icon } from "lucide-react-native";
import { cartService } from "@/services/cart.service";
import type { CartDetailResponse } from "@/types/cart.type";
import AuthStorageUtil from "@/utils/authStorage.util";

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
          router.replace('/login');
          return;
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/login');
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
      Alert.alert("Lỗi", error?.response?.data?.message || "Không thể xóa sản phẩm");
    }
  };

  const handleUpdateQuantity = async (productVariantId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(productVariantId);
      return;
    }
    try {
      await cartService.updateCartItemQuantity(productVariantId, newQuantity);
      await loadCart();
    } catch (error: any) {
      Alert.alert("Lỗi", error?.response?.data?.message || "Không thể cập nhật số lượng");
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
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <Box className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EF4444" />
          <Text className="text-gray-500 mt-4">Đang kiểm tra...</Text>
        </Box>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
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
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <HStack className="items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
        <Pressable onPress={() => router.back()}>
          <ArrowLeftIcon size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-semibold">Giỏ hàng ({cartItems.length})</Text>
        <Box style={{ width: 24 }} />
      </HStack>

      {/* Cart Items */}
      <ScrollView className="pb-4" showsVerticalScrollIndicator={false} bounces={false}>
        {cartItems.length === 0 ? (
          <Box className="items-center justify-center py-20">
            <Text className="text-gray-500 text-lg">Giỏ hàng trống</Text>
          </Box>
        ) : (
          cartItems.map((item) => (
            <Box
              key={item.id}
              className="bg-white mt-3 px-4 py-3 rounded-md mx-3 border border-gray-200"
            >
              {/* Product Row */}
              <HStack className="items-start gap-3">
                <Checkbox
                  value={item.id.toString()}
                  isChecked={selectedItems.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                >
                  <CheckboxIndicator
                    className={`w-5 h-5 rounded-md border-2 ${selectedItems.includes(item.id)
                      ? "bg-[#EF4444] border-[#EF4444]"
                      : "border-gray-400 bg-white"
                      } items-center justify-center`}
                  >
                    {selectedItems.includes(item.id) && (
                      <CheckboxIcon color="#fff" />
                    )}
                  </CheckboxIndicator>
                </Checkbox>

                <Image
                  source={{ uri: item.productImage }}
                  className="w-20 h-20 rounded-lg border border-gray-100"
                />

                <VStack className="flex-1">
                  <Text
                    numberOfLines={2}
                    className="text-gray-900 font-medium text-sm mb-1"
                  >
                    {item.productName}
                  </Text>
                  <Text className="text-xs text-gray-500 mb-1">
                    SKU: {item.sku}
                  </Text>
                  <Text className="text-[#EF4444] font-bold text-base mb-2">
                    {((item.price * (1 - (item.discount || 0) / 100)) * item.quantity).toLocaleString('vi-VN')}₫
                  </Text>
                  <HStack className="items-center space-x-2">
                    <Pressable
                      onPress={() => handleUpdateQuantity(item.productVariantId, item.quantity - 1)}
                      className="w-6 h-6 bg-gray-200 rounded items-center justify-center"
                    >
                      <Text className="text-gray-700">-</Text>
                    </Pressable>
                    <Text className="text-gray-900 font-medium">{item.quantity}</Text>
                    <Pressable
                      onPress={() => handleUpdateQuantity(item.productVariantId, item.quantity + 1)}
                      className="w-6 h-6 bg-gray-200 rounded items-center justify-center"
                    >
                      <Text className="text-gray-700">+</Text>
                    </Pressable>
                  </HStack>
                </VStack>

                <Pressable onPress={() => handleRemoveItem(item.productVariantId)} className="mt-1">
                  <Icon as={Trash2Icon} size="sm" color="#9CA3AF" />
                </Pressable>
              </HStack>
            </Box>
          ))
        )}
      </ScrollView>

      {/* Footer */}
      <Box className="bg-white border-t border-gray-200 px-4 py-3">
        <HStack className="items-center justify-between mb-2">
          <HStack className="items-center space-x-2">
            <Checkbox
              value="all"
              isChecked={selectedItems.length === cartItems.length}
              onChange={toggleSelectAll}
            >
              <CheckboxIndicator
                className={`w-5 h-5 rounded-md border-2 ${selectedItems.length === cartItems.length
                  ? "bg-[#EF4444] border-[#EF4444]"
                  : "border-gray-400 bg-white"
                  } items-center justify-center`}
              >
                {selectedItems.length === cartItems.length && (
                  <CheckboxIcon color="#fff" />
                )}
              </CheckboxIndicator>
              <CheckboxLabel className="text-gray-700 text-md ml-2">
                Tất cả
              </CheckboxLabel>
            </Checkbox>
          </HStack>

          <Text className="text-gray-700 text-md">
            Tạm tính:{" "}
            <Text className="text-[#EF4444] font-bold">
              {totalPrice.toLocaleString()}₫
            </Text>
          </Text>
        </HStack>

        <Pressable
          className="bg-red-500 rounded-lg px-6 py-3"
          onPress={() => {
            if (selectedItems.length === 0) {
              Alert.alert("Thông báo", "Vui lòng chọn sản phẩm để mua");
              return;
            }
            // Navigate to checkout or order screen
            router.push('/checkout');
          }}
          style={({ pressed }) => [
            {
              backgroundColor: pressed ? '#dc2626' : '#ef4444',
              opacity: pressed ? 0.9 : 1,
            }
          ]}
        >
          <VStack className="items-center">
            <Text className="text-white font-bold text-lg">Mua hàng ({selectedItems.length})</Text>
          </VStack>
        </Pressable>
      </Box>
    </SafeAreaView>
  );
}
