// src/components/LocationPickerModal.tsx
import { provinceService } from "@/services/province.service";
import { Province } from "@/types/province.type";
import { Ward } from "@/types/ward.type";
import { ChevronLeftIcon, SearchIcon, XIcon } from "lucide-react-native"; // Hoặc icon bạn đang dùng
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (province: Province, ward: Ward) => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  // Step 1: Chọn Tỉnh, Step 2: Chọn Xã
  const [step, setStep] = useState<1 | 2>(1);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    null
  );

  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Load danh sách tỉnh khi mở modal
  useEffect(() => {
    if (visible) {
      setStep(1);
      setSearchText("");
      fetchProvinces();
    }
  }, [visible]);

  const fetchProvinces = async () => {
    setLoading(true);
    try {
      const data = await provinceService.getAllProvinces();
      setProvinces(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách tỉnh:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProvince = async (province: Province) => {
    setSelectedProvince(province);
    setLoading(true);
    try {
      // Gọi API lấy xã theo tỉnh đã chọn
      const data = await provinceService.getWardsByProvince(province.id);
      setWards(data);
      setStep(2); // Chuyển sang bước chọn xã
      setSearchText(""); // Reset tìm kiếm cho list xã
    } catch (error) {
      console.error("Lỗi lấy danh sách xã:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWard = (ward: Ward) => {
    if (selectedProvince) {
      onSelect(selectedProvince, ward);
      onClose();
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSearchText("");
      setSelectedProvince(null);
    } else {
      onClose();
    }
  };

  // Lọc dữ liệu theo ô tìm kiếm
  const filteredData =
    step === 1
      ? provinces.filter((p) =>
          p.name.toLowerCase().includes(searchText.toLowerCase())
        )
      : wards.filter((w) =>
          w.name.toLowerCase().includes(searchText.toLowerCase())
        );

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
          <TouchableOpacity onPress={handleBack} className="p-2">
            {step === 2 ? (
              <ChevronLeftIcon size={24} color="#000" />
            ) : (
              <XIcon size={24} color="#000" />
            )}
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-bold">
            {step === 1 ? "Chọn Tỉnh/Thành phố" : selectedProvince?.name}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Bar */}
        <View className="px-4 py-2 bg-gray-50">
          <View className="flex-row items-center bg-white px-3 py-2 rounded-lg border border-gray-200">
            <SearchIcon size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-base"
              placeholder={
                step === 1 ? "Tìm tỉnh/thành..." : "Tìm phường/xã..."
              }
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* List */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#EF4444" />
          </View>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                className="p-4 border-b border-gray-100"
                onPress={() =>
                  step === 1
                    ? handleSelectProvince(item as Province)
                    : handleSelectWard(item as Ward)
                }
              >
                <Text className="text-base text-gray-800">{item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text className="text-center text-gray-500 mt-10">
                Không tìm thấy kết quả
              </Text>
            }
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};
