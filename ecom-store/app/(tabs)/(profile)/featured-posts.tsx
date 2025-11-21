import React from "react";
import { ScrollView, Image, TouchableOpacity } from "react-native";
import { Box, VStack, HStack, Text, Icon, SafeAreaView } from "@/components/ui";
import { ArrowLeftIcon, UserIcon, ClockIcon } from "lucide-react-native";
import { useRouter } from "expo-router";

// Khai báo kiểu dữ liệu cho một bài viết
interface Post {
  id: number;
  title: string;
  author: string;
  time: string;
  imageUri: string;
}

// Dữ liệu giả (Dựa trên hình ảnh bạn cung cấp)
const DUMMY_POSTS: Post[] = [
  {
    id: 1,
    title:
      "Đánh giá Apple Watch Series 11: Yếu tố quan trọng nhất đã được nâng cấp!",
    author: "Jay Nguyen",
    time: "19/11/2025 16:30",
    imageUri:
      "https://cdn-media.sforum.vn/storage/app/media/thanhnam/danh-gia-apple-watch-series-11/danh-gia-apple-watch-series-11-thumb.jpg",
  },
  {
    id: 2,
    title:
      "Trên tay Cuktech 10 Mini: Sạc dự phòng siêu nhỏ gọn, dung lượng 10,000mAh, công suất 55W, giá 820K",
    author: "minhcab_",
    time: "19/11/2025 14:19",
    imageUri:
      "https://cdn-media.sforum.vn/storage/app/media/hoangminh/tren-tay-cuktech-10-mini/tren-tay-cuktech-10-mini-thumbnail.jpg",
  },
  {
    id: 3,
    title:
      "3 năm dùng MacBook Air M2: Điều gì khiến mình vẫn chưa thấy cần nâng cấp?",
    author: "Hải Trần",
    time: "19/11/2025 09:58",
    imageUri:
      "https://cdn-media.sforum.vn/storage/app/media/thongvo/danh-gia-macbook-air-m2-sau-3-nam/danh-gia-macbook-air-m2-13-inch-cover.jpg",
  },
  {
    id: 4,
    title: "Review chi tiết Galaxy S25 Ultra: Camera 200MP và AI đột phá",
    author: "AnhKhoa",
    time: "18/11/2025 21:00",
    imageUri:
      "https://cdn-media.sforum.vn/storage/app/media/trannghia/Galaxy-S25-Ultra-cau-hinh-cover.jpg",
  },
];

// Component hiển thị mỗi bài viết
const PostItem: React.FC<{ post: Post }> = ({ post }) => {
  const router = useRouter();

  const handlePress = () => {
    // Chuyển hướng đến màn hình chi tiết bài viết
    router.push(`/post-detail?id=${post.id}`);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="flex-row items-start py-3 border-b border-gray-100"
    >
      <Image
        source={{ uri: post.imageUri }}
        className="w-24 h-24 rounded-lg mr-4 object-cover"
      />
      <VStack className="flex-1 justify-between h-24">
        <Text
          className="font-semibold text-base text-gray-900 leading-5"
          numberOfLines={3}
        >
          {post.title}
        </Text>
        <HStack className="items-center justify-start space-x-3 mt-1">
          <HStack className="items-center space-x-1 mr-3">
            <UserIcon size={14} color="#555" />
            <Text className="text-xs text-gray-600">{post.author}</Text>
          </HStack>
          <HStack className="items-center space-x-1">
            <ClockIcon size={14} color="#555" />
            <Text className="text-xs text-gray-600">
              {post.time.split(" ")[0]}
            </Text>{" "}
            {/* Chỉ lấy ngày */}
          </HStack>
        </HStack>
      </VStack>
    </TouchableOpacity>
  );
};

export default function FeaturedPostsScreen() {
  const router = useRouter();
  const ICON_COLOR = "#EF4444";

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <Box className="flex-row items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={handleGoBack} className="mr-4">
          <ArrowLeftIcon size={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Bài viết nổi bật</Text>
      </Box>

      <ScrollView showsVerticalScrollIndicator={false} className="px-4 py-2">
        {DUMMY_POSTS.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
        <Box className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
