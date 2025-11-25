import { HStack, Pressable, SafeAreaView } from "@/components/ui";
import { useHideTabBar } from "@/hooks/use-hide-tab-bar";
import { addressService } from "@/services/address.service";
import { Address } from "@/types/address.type";
import { useFocusEffect, useRouter } from "expo-router";
import { ArrowLeftIcon } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function MyAddressScreen() {
  const router = useRouter();
  useHideTabBar();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Hàm gọi API lấy danh sách
  const fetchAddresses = async () => {
    try {
      const data = await addressService.getAddresses();
      // Backend trả về list, sắp xếp default lên đầu (backend đã làm việc này rồi)
      setAddresses(data);
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách địa chỉ.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Gọi lại API mỗi khi màn hình được focus (quay lại từ màn hình thêm/sửa)
  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAddresses();
  };

  const handleGoBack = () => {
    router.push("/(tabs)/(profile)/profile");
  };

  const handleAddNewAddress = () => {
    router.push("/add-address");
  };

  const handleEditAddress = (addressId: number) => {
    // Truyền ID sang màn hình edit
    router.push({ pathname: "/edit-address", params: { id: addressId } });
  };

  const PRIMARY_COLOR = "text-red-500";
  const PRIMARY_BORDER = "border-red-500";

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#EF4444" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <HStack className="items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <Pressable onPress={handleGoBack}>
          <ArrowLeftIcon size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-semibold">Địa chỉ của Tôi</Text>
        <View style={{ width: 24 }} />
      </HStack>

      <ScrollView
        className="px-4 pt-2"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text className="text-gray-500 mb-2 mt-2">Địa Chỉ</Text>

        {addresses.length === 0 ? (
          <Text className="text-center text-gray-400 mt-10">
            Bạn chưa có địa chỉ nào.
          </Text>
        ) : (
          addresses.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleEditAddress(item.id)}
              className={`pb-4 relative ${
                index !== addresses.length - 1 ? "mb-4" : ""
              }`}
            >
              {/* Tên và Số điện thoại */}
              <View className="flex-row items-center justify-between">
                <Text className="font-bold text-[17px]">{item.fullName}</Text>
                <Text className="text-gray-600 text-[15px]">{item.phone}</Text>
              </View>

              {/* Địa chỉ chi tiết (Dùng fullAddress từ backend trả về) */}
              <Text className="text-gray-700 mt-1 leading-5">
                {item.fullAddress
                  ? item.fullAddress
                  : `${item.subAddress}, ${item.wardName}, ${item.provinceName}`}
              </Text>

              {/* Thẻ "Mặc định" */}
              {item.isDefault && (
                <View
                  className={`mt-2 border ${PRIMARY_BORDER} px-3 py-[2px] rounded-sm self-start`}
                >
                  <Text className={`text-sm text-center ${PRIMARY_COLOR}`}>
                    Mặc định
                  </Text>
                </View>
              )}

              {/* Phân cách */}
              {index !== addresses.length - 1 && (
                <View className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-gray-200 mx-[-16px]" />
              )}
            </TouchableOpacity>
          ))
        )}

        {/* Nút "Thêm Địa Chỉ Mới" */}
        <TouchableOpacity
          className="flex-row items-center py-4 mb-4 mt-2"
          onPress={handleAddNewAddress}
        >
          <Text className={`text-3xl mr-2 ${PRIMARY_COLOR}`}>+</Text>
          <Text className={`font-semibold text-lg ${PRIMARY_COLOR}`}>
            Thêm Địa Chỉ Mới
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
