import { SafeAreaView, Text } from "@/components/ui";
import { useHideTabBar } from "@/hooks/use-hide-tab-bar";
import { addressService } from "@/services/address.service";
import { CreateAddressRequest } from "@/types/address.type";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  Trash2Icon,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
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

export default function EditAddressScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Lấy ID từ params
  const addressId = Number(id);

  useHideTabBar();
  const ICON_COLOR = "#EF4444";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [subAddress, setSubAddress] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // State quản lý Modal
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  const [selectedWard, setSelectedWard] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Fetch chi tiết Address khi vào màn hình
  useEffect(() => {
    const fetchDetail = async () => {
      if (!addressId) return;
      try {
        const data = await addressService.getAddressById(addressId);
        if (data) {
          setFullName(data.fullName);
          setPhone(data.phone);
          setSubAddress(data.subAddress);
          setIsDefault(data.isDefault);

          // Set ward info từ API response
          if (data.wardId) {
            // Kết hợp wardName và provinceName để hiển thị
            const displayLocation = `${data.wardName || ""}, ${
              data.provinceName || ""
            }`;
            setSelectedWard({ id: data.wardId, name: displayLocation });
          }
        }
      } catch (error) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin địa chỉ.");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [addressId]);

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
      name: `${ward.name}, ${province.name}`,
    });
    setLocationModalVisible(false);
  };

  const handleUpdate = async () => {
    if (!fullName || !phone || !subAddress || !selectedWard) {
      Alert.alert("Lỗi", "Vui lòng nhập đủ thông tin.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateAddressRequest = {
        fullName,
        phone,
        subAddress,
        wardId: selectedWard.id,
        isDefault,
      };

      await addressService.updateAddress(addressId, payload);
      Alert.alert("Thành công", "Cập nhật địa chỉ thành công", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể cập nhật địa chỉ.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAddress = () => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa địa chỉ này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          onPress: async () => {
            try {
              setSubmitting(true);
              await addressService.deleteAddress(addressId);
              router.back();
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xóa địa chỉ.");
              setSubmitting(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color={ICON_COLOR} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={handleGoBack} className="mr-4">
            <ArrowLeftIcon size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-bold">Chỉnh sửa địa chỉ</Text>
        </View>

        <TouchableOpacity onPress={handleDeleteAddress} className="p-2">
          <Trash2Icon size={24} color={ICON_COLOR} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="bg-white mx-4 rounded-lg shadow-sm overflow-hidden mt-4 mb-4">
          <Text className="px-4 pt-3 font-semibold text-gray-800">Địa chỉ</Text>

          <AddressInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Họ và tên"
          />
          <AddressInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Số điện thoại"
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            onPress={handleSelectLocation}
            className="flex-row items-center justify-between p-4 border-b border-gray-200"
          >
            <Text className="text-gray-800 flex-1 pr-2">
              {selectedWard ? selectedWard.name : "Chọn Tỉnh/Xã"}
            </Text>
            <ChevronRightIcon size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <AddressInput
            value={subAddress}
            onChangeText={setSubAddress}
            placeholder="Tên đường, Toà nhà, Số nhà."
            noBorder={true}
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
            submitting ? "opacity-70" : ""
          }`}
          onPress={handleUpdate}
          disabled={submitting}
        >
          {submitting ? (
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
