import { HStack, SafeAreaView, Text, VStack } from "@/components/ui";
import { articleCategoryService } from "@/services/article-category.service"; // Import service mới
import { articleService } from "@/services/article.service";
import type { ArticleCategory } from "@/types/article-category.type";
import type { Article } from "@/types/article.type";
import { useRouter } from "expo-router";
import { ClockIcon, UserIcon } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";

// ... (Giữ nguyên interface PostDisplay và component PostItem như cũ)
interface PostDisplay extends Article {
  author: string;
  time: string;
  imageUri: string;
}

const PostItem: React.FC<{ post: PostDisplay }> = ({ post }) => {
  const router = useRouter();
  const handlePress = () => {
    router.push(`/post-detail?id=${post.id}`);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="flex-row items-start py-3 border-b border-gray-100"
    >
      <Image
        source={{ uri: post.imageUri || "placeholder_uri" }}
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
              {post.time.split("T")[0]}
            </Text>
          </HStack>
        </HStack>
      </VStack>
    </TouchableOpacity>
  );
};

export default function FeaturedPostsScreen() {
  const router = useRouter();

  // State cho bài viết
  const [posts, setPosts] = useState<PostDisplay[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // State cho danh mục
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );

  const formatArticleForDisplay = (article: Article): PostDisplay => {
    return {
      ...article,
      id: article.id,
      author: article.staffName || "Admin",
      time: article.createdAt || "",
      imageUri: article.thumbnail || "https://via.placeholder.com/150",
    };
  };

  // 1. Hàm load danh mục
  const loadCategories = async () => {
    try {
      const res = await articleCategoryService.getCategories(1, 100);
      if (res.data && res.data.data) {
        setCategories(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // 2. Hàm load bài viết (có nhận categoryId)
  const loadPosts = async () => {
    try {
      setLoadingPosts(true);
      // Gọi hàm getArticles, tham số thứ 5 là categoryId
      const response = await articleService.getArticles(
        1,
        10,
        "",
        true,
        selectedCategoryId // Truyền ID danh mục đang chọn vào đây
      );

      const fetchedPosts: PostDisplay[] = response.data.data
        ? response.data.data.map(formatArticleForDisplay)
        : [];

      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Load categories khi màn hình mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load posts mỗi khi selectedCategoryId thay đổi
  useEffect(() => {
    loadPosts();
  }, [selectedCategoryId]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <VStack className="px-4 pt-4 pb-2 bg-white border-b border-gray-200 items-center">
        <Text className="text-2xl font-bold text-gray-900">Bài viết</Text>
      </VStack>

      {/* --- PHẦN TAB DANH MỤC --- */}
      <VStack className="bg-white pb-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 mt-2"
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {/* Tab "Tất cả" */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setSelectedCategoryId(null)}
            className={`px-4 py-2 rounded-full mr-2 ${
              selectedCategoryId === null ? "bg-red-500" : "bg-gray-200"
            }`}
          >
            <Text
              className={`font-medium ${
                selectedCategoryId === null ? "text-white" : "text-gray-700"
              }`}
            >
              Tất cả
            </Text>
          </TouchableOpacity>

          {/* Các tab danh mục lấy từ API */}
          {categories.map((cat) => (
            <TouchableOpacity
              activeOpacity={1}
              key={cat.id}
              onPress={() => setSelectedCategoryId(cat.id)}
              className={`px-4 py-2 rounded-full mr-2 ${
                selectedCategoryId === cat.id ? "bg-red-500" : "bg-gray-200"
              }`}
            >
              <Text
                className={`font-medium ${
                  selectedCategoryId === cat.id ? "text-white" : "text-gray-700"
                }`}
              >
                {cat.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </VStack>
      {/* --- KẾT THÚC PHẦN TAB --- */}

      {/* Danh sách bài viết */}
      {loadingPosts ? (
        <VStack className="flex-1 justify-center items-center mt-10">
          <ActivityIndicator size="large" color="#EF4444" />
        </VStack>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} className="px-4 py-2">
          {posts.map((post) => (
            <PostItem key={post.id} post={post} />
          ))}
          {posts.length === 0 && (
            <Text className="text-center text-gray-500 mt-10">
              Không tìm thấy bài viết nào thuộc danh mục này.
            </Text>
          )}
          {/* Thêm khoảng trắng dưới cùng để không bị che mất item cuối */}
          <VStack className="h-10" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
