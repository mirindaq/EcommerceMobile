import React from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeftIcon } from "lucide-react-native";
import { useRouter } from "expo-router";

// Tên file: TermsOfServiceScreen.tsx
export default function TermsOfServiceScreen() {
  const router = useRouter();
  const ICON_COLOR = "#EF4444";

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={handleGoBack} className="mr-4">
          <ArrowLeftIcon size={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Điều khoản sử dụng</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-4">
        {/* Tiêu đề chính */}
        <Text className="text-3xl font-extrabold text-gray-900 text-center mt-2 mb-6">
          ĐIỀU KHOẢN SỬ DỤNG
        </Text>

        {/* Đoạn giới thiệu */}
        <Text className="text-base text-gray-700 leading-relaxed mb-6">
          Chúng tôi muốn xây dựng cộng đồng CellphoneZ thân thiện và tích cực!
          Tiêu chuẩn này được đưa ra để hướng dẫn người bán và người mua giữ gìn
          một thị trường mua bán an toàn. Vui lòng đọc Những việc nên và không
          nên làm dưới đây khi sử dụng ứng dụng CellphoneZ. Bằng việc dùng ứng
          dụng này, bạn đồng ý với các{" "}
          <Text className="font-bold text-red-500">Điều khoản sử dụng</Text> của
          chúng tôi. Chúng tôi cam kết nỗ lực gìn giữ sự an toàn cho cộng đồng
          mua bán này.
        </Text>

        {/* Tiêu đề phần "Nên làm" */}
        <Text
          className="text-xl font-bold text-teal-600 mb-4"
          style={{ color: "#00BFA5" }}
        >
          Những việc nên làm
        </Text>

        {/* Nội dung chi tiết - Mục 1 */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-2">
            1. Bán hàng thật, không quảng cáo
          </Text>
          <Text className="text-base text-gray-700 leading-relaxed mb-3">
            CellphoneZ là ứng dụng hỗ trợ người mua và người bán giao dịch với
            nhau chứ không phải là nền tảng để quảng cáo. Bạn chỉ nên đăng những
            sản phẩm mà bạn muốn bán trên CellphoneZ.
          </Text>

          <Text className="text-base font-semibold text-gray-800 mb-2">
            Dưới đây là một số ví dụ về việc vi phạm quy tắc này:
          </Text>
          <View className="ml-4">
            <Text className="text-base text-gray-700 leading-relaxed">
              • Kết nối trang đăng bán sản phẩm tới một website riêng biệt khác.
            </Text>
            <Text className="text-base text-gray-700 leading-relaxed">
              • Phần mô tả, hình ảnh hoặc tên gọi của sản phẩm đề cập đến thông
              tin liên lạc cá nhân.
            </Text>
            <Text className="text-base text-gray-700 leading-relaxed">
              • Đăng tải các sản phẩm hoặc dịch vụ không liên quan đến việc mua
              bán hàng hóa vật chất (ví dụ: các dịch vụ tư vấn, dịch vụ du lịch,
              v.v.).
            </Text>
          </View>
        </View>

        {/* Nội dung chi tiết - Mục 2 (Thêm giả định) */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-2">
            2. Tôn trọng người khác
          </Text>
          <Text className="text-base text-gray-700 leading-relaxed mb-3">
            Hãy cư xử lịch sự và tôn trọng đối với tất cả người dùng khác, bao
            gồm cả người mua, người bán và nhân viên hỗ trợ của chúng tôi.
          </Text>

          <Text className="text-base font-semibold text-gray-800 mb-2">
            Những hành vi không được chấp nhận:
          </Text>
          <View className="ml-4">
            <Text className="text-base text-gray-700 leading-relaxed">
              • Sử dụng ngôn ngữ thô tục, xúc phạm hoặc đe dọa.
            </Text>
            <Text className="text-base text-gray-700 leading-relaxed">
              • Phân biệt đối xử hoặc quấy rối dựa trên chủng tộc, giới tính,
              tôn giáo, hoặc bất kỳ đặc điểm cá nhân nào khác.
            </Text>
          </View>
        </View>

        {/* Tiêu đề phần "Không nên làm" */}
        <Text className="text-xl font-bold text-gray-900 mt-4 mb-4">
          Những việc không nên làm
        </Text>

        {/* Nội dung chi tiết - Mục 1 (Không nên làm) */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-2">
            1. Gian lận hoặc lợi dụng hệ thống
          </Text>
          <Text className="text-base text-gray-700 leading-relaxed mb-3">
            Không tham gia vào bất kỳ hoạt động nào nhằm thao túng hệ thống xếp
            hạng, đánh giá, hoặc các chương trình khuyến mãi.
          </Text>

          <Text className="text-base font-semibold text-gray-800 mb-2">
            Ví dụ về hành vi gian lận:
          </Text>
          <View className="ml-4">
            <Text className="text-base text-gray-700 leading-relaxed">
              • Tự mua hàng hoặc nhờ người khác mua hàng để tăng điểm đánh giá
              giả mạo (Fake Orders).
            </Text>
            <Text className="text-base text-gray-700 leading-relaxed">
              • Lạm dụng các mã giảm giá hoặc chương trình hoàn xu vượt quá giới
              hạn cho phép.
            </Text>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
