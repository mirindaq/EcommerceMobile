import React, { useEffect, useState } from "react";
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { XIcon, StarIcon } from "lucide-react-native";
import { feedbackService } from "@/services/feedback.service";
import type { FeedbackResponse } from "@/types/feedback.type";

interface ViewFeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  orderId: number;
  productVariantId: number;
}

export const ViewFeedbackModal: React.FC<ViewFeedbackModalProps> = ({
  visible,
  onClose,
  orderId,
  productVariantId,
}) => {
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadFeedback();
    }
  }, [visible, orderId, productVariantId]);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const response = await feedbackService.getFeedbackDetail(
        orderId,
        productVariantId
      );
      setFeedback(response.data);
    } catch (error: any) {
      console.error("Error loading feedback:", error);
      Alert.alert("Lỗi", "Không thể tải đánh giá");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View className="flex-row gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            size={20}
            color="#FCD34D"
            fill={star <= rating ? "#FCD34D" : "transparent"}
          />
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[85%]">
          <SafeAreaView>
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
              <Text className="text-lg font-semibold flex-1">
                Chi tiết đánh giá
              </Text>
              <TouchableOpacity onPress={onClose}>
                <XIcon size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View className="py-10 items-center justify-center">
                <ActivityIndicator size="large" color="#EF4444" />
              </View>
            ) : feedback ? (
              <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
                {/* Product Info */}
                <View className="py-3 border-b border-gray-200">
                  <Text className="text-sm text-gray-600 mb-2">Sản phẩm:</Text>
                  <View className="flex-row gap-3">
                    <Image
                      source={{ uri: feedback.productImage }}
                      className="w-16 h-16 rounded-lg bg-gray-100"
                      resizeMode="cover"
                    />
                    <View className="flex-1">
                      <Text className="text-base font-medium" numberOfLines={2}>
                        {feedback.productName}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Rating */}
                <View className="py-4 border-b border-gray-200">
                  <Text className="text-sm text-gray-600 mb-2">Đánh giá:</Text>
                  <View className="flex-row items-center gap-2">
                    {renderStars(feedback.rating)}
                    <Text className="text-base font-semibold text-yellow-600 ml-2">
                      {feedback.rating}/5
                    </Text>
                  </View>
                </View>

                {/* Comment */}
                {feedback.comment && (
                  <View className="py-4 border-b border-gray-200">
                    <Text className="text-sm text-gray-600 mb-2">
                      Nhận xét:
                    </Text>
                    <Text className="text-base leading-6">
                      {feedback.comment}
                    </Text>
                  </View>
                )}

                {/* Images */}
                {feedback.imageUrls && feedback.imageUrls.length > 0 && (
                  <View className="py-4 border-b border-gray-200">
                    <Text className="text-sm text-gray-600 mb-2">
                      Hình ảnh:
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {feedback.imageUrls.map((uri, index) => (
                        <Image
                          key={index}
                          source={{ uri }}
                          className="w-24 h-24 rounded-lg bg-gray-100"
                          resizeMode="cover"
                        />
                      ))}
                    </View>
                  </View>
                )}

                {/* Date */}
                <View className="py-4">
                  <Text className="text-sm text-gray-600 mb-1">
                    Thời gian đánh giá:
                  </Text>
                  <Text className="text-base text-gray-800">
                    {feedback.createdAt}
                  </Text>
                </View>
              </ScrollView>
            ) : (
              <View className="py-10 items-center">
                <Text className="text-gray-500">Không tìm thấy đánh giá</Text>
              </View>
            )}
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};
