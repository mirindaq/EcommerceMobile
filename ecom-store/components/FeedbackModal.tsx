import React, { useState } from "react";
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { XIcon, StarIcon, ImageIcon, Trash2Icon } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { feedbackService } from "@/services/feedback.service";
import { uploadService } from "@/services/upload.service";
import type { CreateFeedbackRequest } from "@/types/feedback.type";

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orderId: number;
  productVariantId: number;
  productName: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  onClose,
  onSuccess,
  orderId,
  productVariantId,
  productName,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert("Thông báo", "Chỉ được tải lên tối đa 5 ảnh");
      return;
    }

    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Thông báo", "Bạn cần cấp quyền truy cập thư viện ảnh");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0]);
    }
  };

  const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
    setUploadingImage(true);
    try {
      const response = await uploadService.uploadImage({
        uri: asset.uri,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
      });

      if (response.data && response.data.length > 0) {
        setImages([...images, response.data[0]]);
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      Alert.alert("Lỗi", "Không thể tải ảnh lên. Vui lòng thử lại");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      Alert.alert("Lỗi", "Vui lòng chọn số sao từ 1 đến 5");
      return;
    }

    setLoading(true);
    try {
      const request: CreateFeedbackRequest = {
        orderId,
        productVariantId,
        rating,
        comment: comment.trim() || undefined,
        imageUrls: images.length > 0 ? images : undefined,
      };

      await feedbackService.createFeedback(request);
      Alert.alert("Thành công", "Đánh giá của bạn đã được gửi");
      setRating(5);
      setComment("");
      setImages([]);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error creating feedback:", error);
      const message = error.response?.data?.message || "Không thể gửi đánh giá";
      Alert.alert("Lỗi", message);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <View className="flex-row justify-center gap-2 my-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            disabled={loading}
          >
            <StarIcon
              size={40}
              color={star <= rating ? "#FCD34D" : "#E5E7EB"}
              fill={star <= rating ? "#FCD34D" : "transparent"}
              strokeWidth={2}
            />
          </TouchableOpacity>
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
        <View className="bg-white rounded-t-3xl max-h-[80%]">
          <SafeAreaView>
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
              <Text className="text-lg font-semibold flex-1">
                Đánh giá sản phẩm
              </Text>
              <TouchableOpacity onPress={onClose} disabled={loading}>
                <XIcon size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
              {/* Product Name */}
              <View className="py-3 border-b border-gray-200">
                <Text className="text-sm text-gray-600 mb-1">Sản phẩm:</Text>
                <Text className="text-base font-medium" numberOfLines={2}>
                  {productName}
                </Text>
              </View>

              {/* Star Rating */}
              <View className="py-4">
                <Text className="text-center text-sm text-gray-600 mb-2">
                  Chọn số sao đánh giá
                </Text>
                {renderStars()}
                <Text className="text-center text-lg font-semibold text-yellow-600">
                  {rating} / 5 sao
                </Text>
              </View>

              {/* Comment */}
              <View className="py-4">
                <Text className="text-sm font-medium mb-2">
                  Nhận xét (tùy chọn)
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 min-h-[100px] text-base"
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={comment}
                  onChangeText={setComment}
                  editable={!loading}
                  maxLength={500}
                />
                <Text className="text-xs text-gray-500 mt-1 text-right">
                  {comment.length}/500
                </Text>
              </View>

              {/* Images */}
              <View className="py-4">
                <Text className="text-sm font-medium mb-2">
                  Hình ảnh (tùy chọn, tối đa 5 ảnh)
                </Text>

                {/* Image Grid */}
                {images.length > 0 && (
                  <View className="flex-row flex-wrap gap-2 mb-3">
                    {images.map((uri, index) => (
                      <View key={index} className="relative">
                        <Image
                          source={{ uri }}
                          className="w-20 h-20 rounded-lg bg-gray-100"
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1"
                          onPress={() => removeImage(index)}
                          disabled={loading}
                        >
                          <Trash2Icon size={14} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Add Image Button */}
                {images.length < 5 && (
                  <TouchableOpacity
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 items-center justify-center"
                    onPress={pickImage}
                    disabled={loading || uploadingImage}
                  >
                    {uploadingImage ? (
                      <ActivityIndicator color="#EF4444" />
                    ) : (
                      <>
                        <ImageIcon size={32} color="#9CA3AF" />
                        <Text className="text-gray-500 mt-2 text-sm">
                          Chọn ảnh từ thư viện
                        </Text>
                        <Text className="text-gray-400 text-xs mt-1">
                          {images.length}/5 ảnh
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {/* Submit Button */}
              <View className="pb-4">
                <TouchableOpacity
                  className={`rounded-lg py-3 ${
                    loading ? "bg-gray-400" : "bg-red-600"
                  }`}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text className="text-white text-center font-semibold text-base">
                      Gửi đánh giá
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};
