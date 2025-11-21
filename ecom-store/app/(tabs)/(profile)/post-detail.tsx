import { Box, HStack, SafeAreaView, Text, VStack } from "@/components/ui";
import { useHideTabBar } from "@/hooks/use-hide-tab-bar";
import { useRouter } from "expo-router";
import { ArrowLeftIcon } from "lucide-react-native";
import React from "react";
import { Dimensions, Image, ScrollView, TouchableOpacity } from "react-native";

// Dữ liệu giả lập nội dung chi tiết
const DUMMY_POST_DETAIL = {
  title: "Chi tiết đánh giá Apple Watch Series 11",
  subtitle: 'Thiết kế thực dụng đến mức thành "thương hiệu"',
  content: [
    {
      type: "text",
      data: "Apple Watch Series 11 dường như vẫn không có sự thay đổi lớn nào về mặt ngoại hình. Vẫn là mặt đồng hồ hình vuông; vẫn là khung kim loại bo cong được tiếp giáp rất mềm mại với mặt kính phía trước và hệ thống cảm biến ở phía sau; vẫn là núm Digital Crown cùng nút nhấn quen thuộc ở cạnh bên và cách lỗ khác của loa ở cạnh còn lại.",
    },
    {
      type: "image",
      uri: "https://cdn-media.sforum.vn/storage/app/media/thanhnam/danh-gia-apple-watch-series-11/danh-gia-apple-watch-series-11-thumb.jpg",
      source: "sforum",
    },
    {
      type: "text",
      data: "Các thông số về kích thước cũng như trọng lượng đều không có sự khác biệt đáng kể so với thế hệ tiền nhiệm. Các tiêu chuẩn bảo vệ đồng hồ khỏi nước và bụi bẩn vẫn không có bất kỳ thay đổi nào (IP6X, kháng nước ở độ sâu 50m và các tiêu chuẩn khác).",
    },
    {
      type: "images_row",
      images: [
        {
          uri: "https://cdn-media.sforum.vn/storage/app/media/thanhnam/danh-gia-apple-watch-series-11/danh-gia-apple-watch-series-11-thumb.jpg",
          source: "sforum",
        },
        {
          uri: "https://cdn-media.sforum.vn/storage/app/media/thanhnam/danh-gia-apple-watch-series-11/danh-gia-apple-watch-series-11-thumb.jpg",
          source: "sforum",
        },
      ],
    },
    {
      type: "text",
      data: 'Nhìn chung, thiết kế Apple Watch Series 11 vẫn theo đuổi phong cách "không hư thì không cần sửa". Điều đó đã tạo nên sự độc nhất, không thể nào nhầm lẫn của một mẫu đồng hồ đến từ Apple.',
    },
    // Thêm nội dung khác...
  ],
};

const windowWidth = Dimensions.get("window").width;

// Component render nội dung bài viết
const PostContent: React.FC<{
  content: (typeof DUMMY_POST_DETAIL.content)[0];
}> = ({ content }) => {
  if (content.type === "text") {
    return (
      <Text className="text-gray-800 text-base leading-relaxed mb-4">
        {content.data}
      </Text>
    );
  }
  if (content.type === "image") {
    return (
      <VStack className="mb-4">
        <Image
          source={{ uri: content.uri }}
          className="w-full h-60 rounded-lg object-cover"
        />
        <Text className="text-xs text-right text-gray-500 mt-1">
          {content.source}
        </Text>
      </VStack>
    );
  }
  if (content.type === "images_row") {
    const imageWidth = (windowWidth - 48 - 8) / 2; // windowWidth - padding(32) - margin(16) - space(8) / 2
    return (
      <HStack className="justify-between mb-4">
        {content.images?.map((img, index) => (
          <VStack key={index} className="w-[49%]">
            <Image
              source={{ uri: img.uri }}
              className="w-full h-28 rounded-lg object-cover"
            />
            <Text className="text-xs text-right text-gray-500 mt-1">
              {img.source}
            </Text>
          </VStack>
        ))}
      </HStack>
    );
  }
  return null;
};

export default function PostDetailScreen() {
  useHideTabBar();
  const router = useRouter();
  const ICON_COLOR = "#EF4444";

  // const { id } = useLocalSearchParams(); // Dùng để lấy id bài viết nếu cần

  const handleGoBack = () => {
    router.push('/(tabs)/(profile)/profile');
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header - Nút quay lại và Action Buttons */}
      <Box className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={handleGoBack}>
          <ArrowLeftIcon size={24} />
        </TouchableOpacity>
      </Box>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-4">
        {/* Title & Subtitle */}
        <VStack className="mb-4">
          <Text className="text-3xl font-extrabold text-gray-900 leading-9 mb-1">
            {DUMMY_POST_DETAIL.title}
          </Text>
          <Text className="text-lg font-semibold text-gray-700 leading-7 italic border-l-4 border-red-500 pl-3">
            {DUMMY_POST_DETAIL.subtitle}
          </Text>
        </VStack>

        {/* Content Body */}
        <VStack>
          {DUMMY_POST_DETAIL.content.map((block, index) => (
            <PostContent key={index} content={block} />
          ))}
        </VStack>

      </ScrollView>
    </SafeAreaView>
  );
}
