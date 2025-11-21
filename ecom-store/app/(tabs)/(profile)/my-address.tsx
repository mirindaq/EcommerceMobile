import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { ArrowLeftIcon } from "lucide-react-native";
import { useRouter } from "expo-router";
import { SafeAreaView, HStack, Pressable } from "@/components/ui";
import { useHideTabBar } from "@/hooks/use-hide-tab-bar";

// Khai báo kiểu dữ liệu cho một đối tượng địa chỉ
interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  default: boolean;
}

export default function MyAddressScreen() {
  const router = useRouter();
  useHideTabBar();

  const handleGoBack = () => {
    router.push('/(tabs)/(profile)/profile');
  };

  const handleAddNewAddress = () => {
    router.push("/add-address");
  };

  const handleEditAddress = (addressId: number) => {
    router.push(`/edit-address?id=${addressId}`);
  };

  const PRIMARY_COLOR = "text-red-500";
  const PRIMARY_BORDER = "border-red-500";
  const ICON_COLOR = "#EF4444";

  const addresses: Address[] = [
    {
      id: 1,
      name: "Trần Văn An",
      phone: "(+84) 901 234 567",
      address:
        "Tòa nhà S2.03, Căn 1502, Khu Đô thị Vinhomes Grand Park\nPhường Long Bình, Thành phố Thủ Đức, TP. Hồ Chí Minh",
      default: true, // Giữ địa chỉ đầu tiên là mặc định
    },
    {
      id: 2,
      name: "Phạm Thị Loan",
      phone: "(+84) 385 777 999",
      address:
        "Số 45, Ngõ 102, Phố Trường Chinh\nPhường Phương Mai, Quận Đống Đa, Hà Nội",
      default: false,
    },
    {
      id: 3,
      name: "Nguyễn Minh Dũng",
      phone: "(+84) 978 111 222",
      address:
        "Lô A20, Đường Nguyễn Tất Thành\nPhường Hòa Hải, Quận Ngũ Hành Sơn, Đà Nẵng",
      default: false,
    },
    {
      id: 4,
      name: "Hoàng Thanh Mai",
      phone: "(+84) 765 432 109",
      address:
        "Khu Phố 5, Đường CMT8, Ấp An Hòa\nXã Phước Đồng, Thành phố Nha Trang, Khánh Hòa",
      default: false,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <HStack className="items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <Pressable onPress={handleGoBack}>
          <ArrowLeftIcon size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-semibold">Địa chỉ của Tôi</Text>
        <View style={{ width: 24 }} />
      </HStack>

      <ScrollView className="px-4 pt-2">
        <Text className="text-gray-500 mb-2">Địa Chỉ</Text>

        {/* Danh sách địa chỉ */}
        {addresses.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => handleEditAddress(item.id)}
            className={`pb-4 relative ${
              index !== addresses.length - 1 ? "mb-4" : ""
            }`}
          >
            {/* Tên và Số điện thoại */}
            <View className="flex-row items-center justify-between">
              <Text className="font-bold text-[17px]">{item.name}</Text>
              <Text className="text-gray-600 text-[15px]">{item.phone}</Text>
            </View>

            {/* Địa chỉ chi tiết */}
            <Text className="text-gray-700 mt-1 leading-5">
              {item.address.replace(/\n/g, ", ")}
            </Text>

            {/* Thẻ "Mặc định" - Màu đỏ */}
            {item.default && (
              <View
                className={`mt-2 border ${PRIMARY_BORDER} px-3 py-[2px] rounded-sm self-start`}
              >
                <Text className={`text-sm text-center ${PRIMARY_COLOR}`}>
                  Mặc định
                </Text>
              </View>
            )}

            {/* Phân cách cho các item không phải cuối cùng */}
            {index !== addresses.length - 1 && (
              <View className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-gray-200 mx-[-16px]" />
            )}
          </TouchableOpacity>
        ))}

        {/* Nút "Thêm Địa Chỉ Mới" - Gọi hàm chuyển hướng */}
        <TouchableOpacity
          className="flex-row items-center py-4 mb-4"
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
