import { HStack, Pressable, SafeAreaView, Text } from "@/components/ui";
import { useHideTabBar } from "@/hooks/use-hide-tab-bar";
import { useRouter } from "expo-router";
import { ArrowLeftIcon, ChevronRightIcon } from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  Switch,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

interface AddressInputProps extends TextInputProps {
  placeholder: string;
  noBorder?: boolean;
}

const AddressInput: React.FC<AddressInputProps> = ({
  placeholder,
  value,
  onChangeText,
  noBorder = false,
  ...rest
}) => {
  return (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor="#9CA3AF"
      className={`p-4 text-base text-gray-800 ${
        noBorder ? "" : "border-b border-gray-200"
      }`}
      {...rest}
    />
  );
};

export default function AddAddressScreen() {
  const router = useRouter();
  useHideTabBar();
  const [isDefault, setIsDefault] = useState(false);
  const ICON_COLOR = "#EF4444";
  const PRIMARY_COLOR = "text-red-500";

  const handleGoBack = () => {
    router.push('/(tabs)/(profile)/profile');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <HStack className="items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <Pressable onPress={handleGoBack}>
          <ArrowLeftIcon size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-semibold">Địa chỉ mới</Text>
        <View style={{ width: 24 }} />
      </HStack>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* 1. Khu vực Form Nhập Địa Chỉ */}
        <View className="bg-white mx-4 rounded-lg shadow-sm overflow-hidden mt-4 mb-4">
          <Text className="px-4 pt-3 font-semibold text-gray-800">Địa chỉ</Text>

          <AddressInput placeholder="Họ và tên" />
          <AddressInput placeholder="Số điện thoại" />

          {/* Tỉnh/Thành phố, Quận/Huyện, Phường/Xã (Chọn) */}
          <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-gray-500 flex-1">
              Tỉnh/Thành phố, Quận/Huyện, Phường/Xã
            </Text>
            <ChevronRightIcon size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <AddressInput
            placeholder="Tên đường, Toà nhà, Số nhà."
            noBorder={true}
          />
        </View>

        {/* 2. Khu vực Cài đặt Địa chỉ (Đã bỏ Loại địa chỉ) */}
        <View className="bg-white mx-4 rounded-lg shadow-sm mb-4">
          <View className="flex-row items-center justify-between p-4">
            <Text className="text-base font-medium text-gray-800">
              Đặt làm địa chỉ mặc định
            </Text>
            <Switch
              trackColor={{ false: "#E5E7EB", true: ICON_COLOR }}
              thumbColor={"#FFFFFF"}
              value={isDefault}
              onValueChange={setIsDefault}
            />
          </View>
        </View>

      </ScrollView>

      {/* Footer - Nút HOÀN THÀNH */}
      <View className="p-4 bg-white border-t border-gray-200">
        <TouchableOpacity className="py-3 bg-red-500 rounded-lg items-center">
          <Text className="text-white text-lg font-bold">HOÀN THÀNH</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
