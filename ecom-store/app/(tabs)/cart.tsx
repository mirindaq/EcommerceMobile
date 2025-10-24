import React, { useState } from "react";
import { ScrollView, Image } from "react-native";
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
import { ChevronLeftIcon, Trash2Icon } from "lucide-react-native";

export default function CartScreen() {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Áo Khoác Hoodie Zip Unisex Cao Cấp",
      variant: "MÀU ĐEN, XL - (73~87kg/1m8)",
      price: 238000,
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
      shop: "GLO OO",
    },
    {
      id: 2,
      name: "Sạc vivo 44w, sạc nhanh Flash charge",
      variant: "Cáp sạc Type C",
      price: 85000,
      image:
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop",
      shop: "VN Store Phụ kiện điện thoại",
    },
    {
      id: 3,
      name: "Tai Nghe Bluetooth Không Dây AirPods Pro 2",
      variant: "Màu trắng",
      price: 4990000,
      image:
        "https://images.unsplash.com/photo-1512499617640-c2f999018b72?w=400&h=300&fit=crop",
      shop: "Apple Center VN",
    },
    {
      id: 4,
      name: "Balo Thời Trang Nam Nữ Chống Nước",
      variant: "Màu đen",
      price: 320000,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
      shop: "Fashion Store",
    },
    {
      id: 5,
      name: "Đồng Hồ Thông Minh Smartwatch D20",
      variant: "Màu đen",
      price: 750000,
      image:
        "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=400&h=300&fit=crop",
      shop: "Tech World",
    },
  ]);

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
    return item ? sum + item.price : sum;
  }, 0);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <Box className="bg-white px-4 py-3 border-b border-gray-200">
        <HStack className="items-center space-x-3">
          <Pressable onPress={() => router.back()}>
            <ChevronLeftIcon size={22} color="#000" />
          </Pressable>
          <Text className="text-lg font-bold text-gray-900">
            Giỏ hàng ({cartItems.length})
          </Text>
        </HStack>
      </Box>

      {/* Cart Items */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {cartItems.map((item) => (
          <Box
            key={item.id}
            className="bg-white mt-3 px-4 py-3 rounded-xl mx-3 shadow-sm"
          >
            {/* Shop header */}
            <HStack className="items-center justify-between mb-3">
              <Text className="font-bold text-gray-800">{item.shop}</Text>
              <Pressable>
                <Text className="text-sm text-[#EF4444] font-medium">Sửa</Text>
              </Pressable>
            </HStack>

            {/* Product Row */}
            <HStack className="space-x-3 items-start">
              <Checkbox
                value={item.id.toString()}
                isChecked={selectedItems.includes(item.id)}
                onChange={() => toggleSelect(item.id)}
              >
                <CheckboxIndicator
                  className={`w-5 h-5 rounded-md border-2 ${
                    selectedItems.includes(item.id)
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
                source={{ uri: item.image }}
                className="w-20 h-20 rounded-lg border border-gray-100"
              />

              <VStack className="flex-1">
                <Text
                  numberOfLines={2}
                  className="text-gray-900 font-medium text-sm mb-1"
                >
                  {item.name}
                </Text>
                <Text className="text-xs text-gray-500 mb-1">
                  {item.variant}
                </Text>
                <Text className="text-[#EF4444] font-bold text-base">
                  {item.price.toLocaleString()}₫
                </Text>
              </VStack>

              <Pressable className="mt-1">
                <Icon as={Trash2Icon} size="sm" color="#9CA3AF" />
              </Pressable>
            </HStack>
          </Box>
        ))}
        <Box className="h-28" />
      </ScrollView>

      {/* Footer */}
      <Box className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <HStack className="items-center justify-between mb-2">
          <HStack className="items-center space-x-2">
            <Checkbox
              value="all"
              isChecked={selectedItems.length === cartItems.length}
              onChange={toggleSelectAll}
            >
              <CheckboxIndicator
                className={`w-5 h-5 rounded-md border-2 ${
                  selectedItems.length === cartItems.length
                    ? "bg-[#EF4444] border-[#EF4444]"
                    : "border-gray-400 bg-white"
                } items-center justify-center`}
              >
                {selectedItems.length === cartItems.length && (
                  <CheckboxIcon color="#fff" />
                )}
              </CheckboxIndicator>
              <CheckboxLabel className="text-gray-700 text-sm ml-2">
                Tất cả
              </CheckboxLabel>
            </Checkbox>
          </HStack>

          <Text className="text-gray-700 text-sm">
            Tạm tính:{" "}
            <Text className="text-[#EF4444] font-bold text-base">
              {totalPrice.toLocaleString()}₫
            </Text>
          </Text>
        </HStack>

        {/* <Button
          className={`rounded-full ${
            selectedItems.length === 0
              ? "bg-gray-300"
              : "bg-[#EF4444] active:bg-red-600"
          }`}
          isDisabled={selectedItems.length === 0}
        >
          <ButtonText className="font-bold text-white text-base">
            Mua hàng ({selectedItems.length})
          </ButtonText>
        </Button> */}

        <Pressable
          className="bg-red-500 rounded-lg px-6 py-3 flex-1"
          style={({ pressed }) => [
            {
              backgroundColor: pressed ? "#dc2626" : "#ef4444",
              opacity: pressed ? 0.9 : 1,
            },
          ]}
          // isDisabled={selectedItems.length === 0}
        >
          <VStack className="items-center">
            <Text className="text-white font-bold text-lg">
              Mua hàng ({selectedItems.length})
            </Text>
          </VStack>
        </Pressable>
      </Box>
    </SafeAreaView>
  );
}
