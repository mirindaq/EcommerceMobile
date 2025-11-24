import {
  Box,
  HStack,
  Icon,
  Pressable,
  SafeAreaView,
  Text,
  VStack,
} from "@/components/ui";
import { useHideTabBar } from "@/hooks/use-hide-tab-bar";
import { useRouter } from "expo-router";
import {
  ArrowLeftIcon,
  BadgeCheck,
  HeadphonesIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  WrenchIcon,
} from "lucide-react-native";
import React from "react";
import { Image, ScrollView } from "react-native";

const PolicyItem = ({
  icon,
  title,
  content,
}: {
  icon: any;
  title: string;
  content: string;
}) => (
  <Box className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100">
    <HStack className="items-start space-x-3">
      <Box className="bg-red-50 p-2 rounded-lg">
        <Icon as={icon} size="xl" className="text-red-500" />
      </Box>
      <VStack className="flex-1 ml-3">
        <Text className="font-bold text-gray-900 text-base mb-1">{title}</Text>
        <Text className="text-gray-600 text-sm leading-5">{content}</Text>
      </VStack>
    </HStack>
  </Box>
);

export default function WarrantyPolicyScreen() {
  const router = useRouter();
  useHideTabBar();

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <HStack className="items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <Pressable onPress={() => router.back()}>
          <Icon as={ArrowLeftIcon} size="lg" color="#000" />
        </Pressable>
        <Text className="text-lg font-semibold text-gray-900">
          Bảo hành & Sửa chữa
        </Text>
        <Box className="w-6" />
      </HStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <Box className="w-full h-60 bg-red-500 relative mb-4">
          <Image
            source={{
              uri: "https://cdn.ahit.vn/maxoaudio/wp-content/uploads/2021/11/15122838/chinh-sach-bao-hanh.png",
            }}
            className="w-full h-full object-cover opacity-90"
          />
          <Box className="absolute bottom-0 left-0 right-0 bg-black/40 p-4">
            <Text className="text-white font-bold text-xl">
              Chính sách Tận tâm
            </Text>
            <Text className="text-white text-sm">
              Cam kết bảo hành uy tín - Nhanh chóng - Chất lượng
            </Text>
          </Box>
        </Box>

        <VStack className="px-4 pb-8 space-y-4">
          {/* Intro */}
          <Text className="text-gray-500 text-center text-sm mb-2">
            Tại CellphoneZ, chúng tôi luôn đặt quyền lợi của khách hàng lên hàng
            đầu. Dưới đây là các chính sách bảo hành chi tiết.
          </Text>

          {/* Policies List */}
          <PolicyItem
            icon={RefreshCwIcon}
            title="Trả hàng & Hoàn tiền trong 15 ngày"
            content="Đổi trả dễ dàng nếu sản phẩm có lỗi, không đúng mô tả hoặc hư hỏng do vận chuyển. Áp dụng cho cả trường hợp đổi ý (với sản phẩm đủ điều kiện)."
          />

          <PolicyItem
            icon={ShieldCheckIcon}
            title="Cam kết chính hãng 100%"
            content="Đảm bảo nguồn gốc xuất xứ rõ ràng. Hoàn tiền gấp đôi nếu phát hiện hàng giả/hàng nhái đối với các sản phẩm thuộc gian hàng Chính hãng (Mall)."
          />

          <PolicyItem
            icon={BadgeCheck}
            title="Bảo vệ người mua hàng"
            content="An tâm mua sắm với chính sách Đảm Bảo: Số tiền của bạn sẽ được giữ an toàn và chỉ thanh toán cho người bán khi bạn xác nhận đã nhận hàng và hài lòng."
          />

          <PolicyItem
            icon={WrenchIcon}
            title="Trung tâm bảo hành & Hỗ trợ"
            content="Hỗ trợ bảo hành điện tử theo chính sách của Nhà sản xuất (đối với hàng điện tử/gia dụng). Mạng lưới trung tâm bảo hành ủy quyền trên toàn quốc."
          />

          {/* Contact Support */}
          <Box className="mt-4 bg-blue-50 p-4 rounded-xl border border-blue-100 items-center">
            <Icon
              as={HeadphonesIcon}
              size="xl"
              className="text-blue-600 mb-2"
            />
            <Text className="font-bold text-blue-800 text-lg">
              Cần hỗ trợ thêm?
            </Text>
            <Text className="text-blue-600 text-center text-sm mb-3">
              Liên hệ ngay tổng đài chăm sóc khách hàng của chúng tôi (8h00 -
              22h00 hàng ngày)
            </Text>
            <Pressable className="bg-blue-600 px-6 py-3 rounded-full shadow-sm active:opacity-90">
              <Text className="text-white font-bold">Hotline: 1234.5678</Text>
            </Pressable>
          </Box>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
