import { HStack, SafeAreaView, Text, VStack } from "@/components/ui";
import { articleService } from "@/services/article.service"; // Import service
import type { Article } from "@/types/article.type"; // Import Article type
import { useRouter } from "expo-router";
import { ClockIcon, UserIcon } from "lucide-react-native";
import React, { useEffect, useState } from "react"; // Thêm import useEffect, useState
import {
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native"; // Thêm ActivityIndicator

interface PostDisplay extends Article {
  author: string; // staffName
  time: string; // createdAt
  imageUri: string; // thumbnail
}

// Component hiển thị mỗi bài viết
const PostItem: React.FC<{ post: PostDisplay }> = ({ post }) => {
  const router = useRouter();

  const handlePress = () => {
    // Chuyển hướng đến màn hình chi tiết bài viết, dùng ID
    router.push(`/post-detail?id=${post.id}`);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="flex-row items-start py-3 border-b border-gray-100"
    >
      <Image
        source={{ uri: post.imageUri || "placeholder_uri" }} // Sửa thành post.imageUri
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
            <Text className="text-xs text-gray-600">{post.author}</Text>{" "}
            {/* staffName */}
          </HStack>
          <HStack className="items-center space-x-1">
            <ClockIcon size={14} color="#555" />
            <Text className="text-xs text-gray-600">
              {post.time.split("T")[0]} {/* Cắt chỉ lấy ngày */}
            </Text>
          </HStack>
        </HStack>
      </VStack>
    </TouchableOpacity>
  );
};

export default function FeaturedPostsScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostDisplay[]>([]); // Sửa DUMMY_POSTS thành posts
  const [loading, setLoading] = useState(true);
  const formatArticleForDisplay = (article: Article): PostDisplay => {
    return {
      ...article,
      id: article.id, // ID là số
      author: article.staffName || "Admin",
      time: article.createdAt || "", // 'YYYY-MM-DDTHH:MM:SS...'
      imageUri: article.thumbnail || "https://via.placeholder.com/150",
      // Các trường khác được kế thừa từ Article
    };
  };
  const loadPosts = async () => {
    try {
      setLoading(true);
      // Lấy các bài viết có status = true (đã xuất bản)
      const response = await articleService.getArticles(1, 10, "", true);

      const fetchedPosts: PostDisplay[] = response.data.data
        ? response.data.data.map(formatArticleForDisplay)
        : [];

      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching articles:", error);
      // Xử lý lỗi (ví dụ: hiển thị thông báo)
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadPosts();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <VStack className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#EF4444" />
        </VStack>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <VStack className="px-4 pt-4 pb-2 bg-white border-b border-gray-200 items-center">
        <Text className="text-2xl font-bold text-gray-900">Bài viết</Text>
      </VStack>
      <ScrollView showsVerticalScrollIndicator={false} className="px-4 py-2">
        {posts.map(
          (
            post // Dùng state posts
          ) => (
            <PostItem key={post.id} post={post} />
          )
        )}
        {posts.length === 0 && (
          <Text className="text-center text-gray-500 mt-10">
            Không tìm thấy bài viết nào.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
