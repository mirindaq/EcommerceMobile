import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  TextInputProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeftIcon, ChevronRightIcon } from "lucide-react-native";
import { useRouter } from "expo-router";

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
  const [isDefault, setIsDefault] = useState(false);
  const ICON_COLOR = "#EF4444";
  const PRIMARY_COLOR = "text-red-500";

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={handleGoBack} className="mr-4">
          <ArrowLeftIcon size={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Địa chỉ mới</Text>
      </View>

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

        <View className="h-20" />
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
