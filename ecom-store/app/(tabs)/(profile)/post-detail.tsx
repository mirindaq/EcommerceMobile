import { Box, HStack, SafeAreaView, Text, VStack } from "@/components/ui";
import { useHideTabBar } from "@/hooks/use-hide-tab-bar";
import { articleService } from "@/services/article.service"; // Import service
import type { Article } from "@/types/article.type"; // Import Article type
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeftIcon, ClockIcon, UserIcon } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
const parseContentToBlocks = (content: string) => {
  return [{ type: "text", data: content }];
};

const windowWidth = Dimensions.get("window").width;

// Component render nội dung bài viết
const PostContent: React.FC<any> = ({ content }) => {
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
  const { id } = useLocalSearchParams<{ id: string }>(); // Lấy id từ URL

  const [postDetail, setPostDetail] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPostDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const postId = Number(id);
      const response = await articleService.getArticleById(postId);

      setPostDetail(response.data);
    } catch (error) {
      console.error("Error fetching article detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPostDetail();
  }, [id]);

  const handleGoBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <VStack className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#EF4444" />
        </VStack>
      </SafeAreaView>
    );
  }

  if (!postDetail) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <VStack className="flex-1 justify-center items-center">
          <Text className="text-gray-700">Không tìm thấy bài viết.</Text>
        </VStack>
      </SafeAreaView>
    );
  }

  // 1. Phân tích cú pháp nội dung
  const contentBlocks = parseContentToBlocks(postDetail.content);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <Box className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={handleGoBack}>
          <ArrowLeftIcon size={24} />
        </TouchableOpacity>
      </Box>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-4">
        {/* Thumbnail */}
        <Image
          source={{
            uri: postDetail.thumbnail || "https://via.placeholder.com/400x200",
          }}
          className="w-full h-48 rounded-lg object-cover mb-4"
        />

        {/* Title & Info */}
        <VStack className="mb-6">
          <Text className="text-3xl font-extrabold text-gray-900 leading-9 mb-1">
            {postDetail.title}
          </Text>
          <HStack className="items-center justify-start space-x-4 mt-2 border-b pb-3 border-gray-100">
            <HStack className="items-center space-x-1">
              <UserIcon size={16} color="#555" />
              <Text className="text-sm text-gray-600 font-medium">
                {postDetail.staffName || "Admin"}
              </Text>
            </HStack>
            <HStack className="items-center space-x-1">
              <ClockIcon size={16} color="#555" />
              <Text className="text-sm text-gray-600">
                {postDetail.createdAt
                  ? postDetail.createdAt.split("T")[0]
                  : "N/A"}
              </Text>
            </HStack>
          </HStack>
        </VStack>

        {/* Content Body */}
        <VStack>
          {contentBlocks.map((block, index) => (
            // Truyền block đã được phân tích cú pháp
            <PostContent key={index} content={block} />
          ))}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
