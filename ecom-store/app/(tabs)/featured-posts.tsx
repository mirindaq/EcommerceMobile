import { HStack, SafeAreaView, Text, VStack } from "@/components/ui";
import { articleService } from "@/services/article.service";
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
  const [posts, setPosts] = useState<PostDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const formatArticleForDisplay = (article: Article): PostDisplay => {
    return {
      ...article,
      id: article.id,
      author: article.staffName || "Admin",
      time: article.createdAt || "",
      imageUri: article.thumbnail || "https://via.placeholder.com/150",
    };
  };
  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await articleService.getArticles(1, 10, "", true);

      const fetchedPosts: PostDisplay[] = response.data.data
        ? response.data.data.map(formatArticleForDisplay)
        : [];

      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching articles:", error);
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
        {posts.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
        {posts.length === 0 && (
          <Text className="text-center text-gray-500 mt-10">
            Không tìm thấy bài viết nào.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
