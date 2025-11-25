import { Box, HStack, Icon, Text, VStack } from "@/components/ui";
import { FeedbackResponse, RatingStatistics } from "@/types/feedback.type";
import { StarIcon } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Image, ScrollView } from "react-native";

interface ProductReviewsProps {
  ratings?: RatingStatistics;
  reviews?: FeedbackResponse[];
  loading?: boolean;
}

export default function ProductReviews({
  ratings,
  reviews,
  loading,
}: ProductReviewsProps) {
  if (loading) {
    return (
      <Box className="p-4">
        <ActivityIndicator size="large" color="#3b82f6" />
      </Box>
    );
  }

  if (!ratings || ratings.totalReviews === 0) {
    return (
      <Box className="p-4 bg-white">
        <Text className="text-gray-500 text-center">Chưa có đánh giá nào</Text>
      </Box>
    );
  }

  const renderStars = (rating: number, size: "xs" | "sm" | "md" = "sm") => {
    return (
      <HStack className="items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            as={StarIcon}
            size={size}
            className={star <= rating ? "text-yellow-400" : "text-gray-300"}
          />
        ))}
      </HStack>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Box className="bg-white mb-6">
      {/* Rating Summary */}
      <Box className="px-4 py-4 border-b border-gray-200">
        <Text className="text-gray-900 font-bold text-lg mb-4">
          Đánh giá sản phẩm
        </Text>

        <HStack className="items-start">
          {/* Average Rating */}
          <VStack className="items-center mr-6">
            <Text className="text-red-500 font-bold text-4xl">
              {ratings.averageRating.toFixed(1)}
            </Text>
            <Box className="my-2">
              {renderStars(Math.round(ratings.averageRating), "sm")}
            </Box>
            <Text className="text-gray-500 text-sm">
              {ratings.totalReviews} đánh giá
            </Text>
          </VStack>

          {/* Rating Distribution */}
          <VStack className="flex-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratings.ratingDistribution[star] || 0;
              const percentage =
                ratings.totalReviews > 0
                  ? (count / ratings.totalReviews) * 100
                  : 0;

              return (
                <HStack key={star} className="items-center mb-2">
                  <HStack className="items-center w-14">
                    <Text className="text-gray-700 text-sm mr-1">{star}</Text>
                    <Icon as={StarIcon} size="xs" className="text-yellow-400" />
                  </HStack>

                  <Box className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden mx-3">
                    <Box
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </Box>

                  <Text className="text-gray-500 text-sm w-8 text-right">
                    {count}
                  </Text>
                </HStack>
              );
            })}
          </VStack>
        </HStack>
      </Box>

      {/* Reviews List */}
      {reviews && reviews.length > 0 && (
        <VStack className="px-4 py-4">
          {reviews.map((review) => (
            <Box key={review.id} className="border-b border-gray-100 pb-4 mb-4">
              {/* Customer Info */}
              <HStack className="items-center mb-2">
                <Box className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                  <Text className="text-blue-600 font-semibold">
                    {review.customerName.charAt(0).toUpperCase()}
                  </Text>
                </Box>
                <VStack className="flex-1">
                  <Text className="text-gray-900 font-medium">
                    {review.customerName}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    {formatDate(review.createdAt)}
                  </Text>
                </VStack>
              </HStack>

              {/* Rating */}
              <Box className="mb-2">{renderStars(review.rating, "xs")}</Box>

              {/* Comment */}
              {review.comment && (
                <Text className="text-gray-700 text-sm mb-2">
                  {review.comment}
                </Text>
              )}

              {/* Images */}
              {review.imageUrls && review.imageUrls.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <HStack>
                    {review.imageUrls.map((url, index) => (
                      <Box key={index} className="mr-2">
                        <Image
                          source={{ uri: url }}
                          style={{ width: 80, height: 80, borderRadius: 8 }}
                          resizeMode="cover"
                        />
                      </Box>
                    ))}
                  </HStack>
                </ScrollView>
              )}
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
}
