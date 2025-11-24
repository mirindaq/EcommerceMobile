import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Calendar, Tag, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
} from "react-native";

import ArticleContent from "@/components/ArticleContent";
import { Box, HStack, Pressable, Text, VStack } from "@/components/ui";

import { articleService } from "@/services/article.service";
import type { Article } from "@/types/article.type";

const { width } = Dimensions.get("window");

export default function ArticleDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticleDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await articleService.getArticleById(Number(id));
        if (response.data) {
          setArticle(response.data);
        } else {
          setError("Không tìm thấy dữ liệu bài viết");
        }
      } catch (err) {
        console.error("Lỗi lấy chi tiết bài viết:", err);
        setError("Có lỗi xảy ra khi tải bài viết");
      } finally {
        setLoading(false);
      }
    };
    fetchArticleDetail();
  }, [id]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <Box className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#EF4444" />
      </Box>
    );
  }

  if (error || !article) {
    return (
      <Box className="flex-1 justify-center items-center bg-white px-4">
        <Text className="text-gray-500 mb-4">
          {error || "Không tìm thấy bài viết"}
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-red-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-bold">Quay lại</Text>
        </Pressable>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-white">
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Box className="relative">
          <Image
            source={{
              uri: article.thumbnail || "https://via.placeholder.com/400x250",
            }}
            style={{ width: width, height: 250 }}
            resizeMode="cover"
          />
          <Box className="absolute inset-0 bg-black/20" />
          <Pressable
            onPress={() => router.back()}
            className="absolute top-12 left-4 w-10 h-10 bg-white/30 rounded-full items-center justify-center backdrop-blur-md"
            style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
          >
            <ArrowLeft size={24} color="#000" />
          </Pressable>
        </Box>

        <Box className="bg-white -mt-6 rounded-t-3xl shadow-sm flex-1">
          <Box className="px-5 pt-6 pb-4">
            {article.category && (
              <HStack className="mb-3">
                <Box className="bg-red-50 px-3 py-1 rounded-full flex-row items-center border border-red-100">
                  <Tag size={12} color="#EF4444" style={{ marginRight: 4 }} />
                  <Text className="text-red-500 text-xs font-bold uppercase tracking-wider">
                    {article.category.title}
                  </Text>
                </Box>
              </HStack>
            )}

            <Text className="text-2xl font-bold text-gray-900 leading-8 mb-4">
              {article.title}
            </Text>

            <HStack className="items-center justify-between border-b border-gray-100 pb-4 mb-2">
              <HStack className="items-center">
                <Box className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mr-2">
                  <User size={16} color="#6B7280" />
                </Box>
                <VStack>
                  <Text className="text-xs text-gray-500">Tác giả</Text>
                  <Text className="text-sm font-semibold text-gray-800">
                    {article.staffName || "Admin"}
                  </Text>
                </VStack>
              </HStack>

              <HStack className="items-center">
                <Calendar
                  size={14}
                  color="#9CA3AF"
                  style={{ marginRight: 4 }}
                />
                <Text className="text-gray-500 text-sm">
                  {formatDate(article.createdAt)}
                </Text>
              </HStack>
            </HStack>
          </Box>

          <Box className="px-3 pb-10">
            <ArticleContent content={article.content} />
          </Box>
        </Box>
      </ScrollView>
    </Box>
  );
}
