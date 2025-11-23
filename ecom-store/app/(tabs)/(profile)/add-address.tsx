import { HStack, Pressable, SafeAreaView, Text } from "@/components/ui";
import { useHideTabBar } from "@/hooks/use-hide-tab-bar";
import { addressService } from "@/services/address.service";
import { CreateAddressRequest } from "@/types/address.type";
import { useRouter } from "expo-router";
import { ArrowLeftIcon, ChevronRightIcon } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

// Import Modal và Type
import { LocationPickerModal } from "@/components/location-modal";
import { Province } from "@/types/province.type";
import { Ward } from "@/types/ward.type";

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
  const [loading, setLoading] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [subAddress, setSubAddress] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // State quản lý Modal
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  // State lưu Ward đã chọn
  const [selectedWard, setSelectedWard] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const ICON_COLOR = "#EF4444";

  const handleGoBack = () => {
    router.back();
  };

  // Mở Modal
  const handleSelectLocation = () => {
    setLocationModalVisible(true);
  };

  // Xử lý khi chọn xong từ Modal
  const onLocationSelect = (province: Province, ward: Ward) => {
    setSelectedWard({
      id: ward.id,
      name: `${ward.name}, ${province.name}`, // Format: Phường X, Tỉnh Y
    });
    setLocationModalVisible(false);
  };

  const handleSave = async () => {
    // Validate
    if (!fullName.trim() || !phone.trim() || !subAddress.trim()) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (!selectedWard) {
      Alert.alert(
        "Lỗi",
        "Vui lòng chọn Tỉnh/Thành phố, Quận/Huyện, Phường/Xã."
      );
      return;
    }

    setLoading(true);
    try {
      const payload: CreateAddressRequest = {
        fullName,
        phone,
        subAddress,
        wardId: selectedWard.id,
        isDefault,
      };

      await addressService.addAddress(payload);
      Alert.alert("Thành công", "Đã thêm địa chỉ mới", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể thêm địa chỉ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <HStack className="items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <Pressable onPress={handleGoBack}>
          <ArrowLeftIcon size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-semibold">Địa chỉ mới</Text>
        <View style={{ width: 24 }} />
      </HStack>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="bg-white mx-4 rounded-lg shadow-sm overflow-hidden mt-4 mb-4">
          <Text className="px-4 pt-3 font-semibold text-gray-800">Địa chỉ</Text>

          <AddressInput
            placeholder="Họ và tên"
            value={fullName}
            onChangeText={setFullName}
          />
          <AddressInput
            placeholder="Số điện thoại"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          {/* Chọn địa giới hành chính */}
          <TouchableOpacity
            onPress={handleSelectLocation}
            className="flex-row items-center justify-between p-4 border-b border-gray-200"
          >
            <Text
              className={`${
                selectedWard ? "text-gray-800" : "text-gray-500"
              } flex-1 pr-2`}
            >
              {selectedWard
                ? selectedWard.name
                : "Tỉnh/Thành phố, Quận/Huyện, Phường/Xã"}
            </Text>
            <ChevronRightIcon size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <AddressInput
            placeholder="Tên đường, Toà nhà, Số nhà."
            noBorder={true}
            value={subAddress}
            onChangeText={setSubAddress}
          />
        </View>

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

      {/* Footer */}
      <View className="p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          className={`py-3 bg-red-500 rounded-lg items-center ${
            loading ? "opacity-70" : ""
          }`}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-lg font-bold">HOÀN THÀNH</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* MODAL */}
      <LocationPickerModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onSelect={onLocationSelect}
      />
    </SafeAreaView>
  );
}
