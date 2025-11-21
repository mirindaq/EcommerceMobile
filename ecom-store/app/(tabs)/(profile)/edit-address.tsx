import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  TextInputProps,
  Alert,
} from "react-native";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  Trash2Icon,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { SafeAreaView, HStack, Pressable, Text } from "@/components/ui";
import { useHideTabBar } from "@/hooks/use-hide-tab-bar";

// Khai báo kiểu Props cho component phụ AddressInput
interface AddressInputProps extends TextInputProps {
  placeholder: string;
  noBorder?: boolean;
}

// Component phụ cho ô nhập liệu
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

export default function EditAddressScreen() {
  const router = useRouter();
  useHideTabBar();
  const [isDefault, setIsDefault] = useState(true);
  const ICON_COLOR = "#EF4444";

  const handleGoBack = () => {
    router.push('/(tabs)/(profile)/profile');
  };

  const handleDeleteAddress = () => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa địa chỉ này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          onPress: () => {
            console.log("Đã xóa địa chỉ");
            router.push('/(tabs)/(profile)/profile');
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header - Có nút Xóa Địa Chỉ */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={handleGoBack} className="mr-4">
            <ArrowLeftIcon size={24} />
          </TouchableOpacity>
          <Text className="text-xl font-bold">Chỉnh sửa địa chỉ</Text>
        </View>

        {/* Nút XÓA ĐỊA CHỈ */}
        <TouchableOpacity onPress={handleDeleteAddress} className="p-2">
          <Trash2Icon size={24} color={ICON_COLOR} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* 1. Khu vực Form Nhập Địa Chỉ */}
        <View className="bg-white mx-4 rounded-lg shadow-sm overflow-hidden mt-4 mb-4">
          <Text className="px-4 pt-3 font-semibold text-gray-800">Địa chỉ</Text>

          <AddressInput value="Lê Việt Hoàng" placeholder="Họ và tên" />
          <AddressInput value="0123 456 789" placeholder="Số điện thoại" />

          {/* Tỉnh/Thành phố, Quận/Huyện, Phường/Xã (Chọn) */}
          <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-gray-800 flex-1">
              TP. Hồ Chí Minh, Thủ Đức
            </Text>
            <ChevronRightIcon size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <AddressInput
            value="Đường 123, phố ABC"
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
