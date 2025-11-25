import { Box, Button, HStack, Pressable, Text, Textarea, TextareaInput, Image } from "@/components/ui";
import { Send, Loader2, Image as ImageIcon } from "lucide-react-native";
import React, { useState, useRef } from "react";
import { Keyboard, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadService } from "@/services/upload.service";

interface ChatInputProps {
  onSendMessage: (message: string, messageType?: "TEXT" | "IMAGE") => Promise<boolean>;
  isConnected: boolean;
  isSending: boolean;
  showStaffWarning?: boolean;
  hasChat?: boolean;
  allowImage?: boolean;
  buttonColor?: string;
}

export default function ChatInput({
  onSendMessage,
  isConnected,
  isSending,
  showStaffWarning = false,
  hasChat = false,
  allowImage = false,
  buttonColor = "bg-red-500",
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<any>(null);

  const handleSend = async () => {
    if (isSending || uploading || !isConnected) return;

    // Nếu có ảnh được chọn, upload ảnh trước
    if (selectedImage) {
      try {
        setUploading(true);
        const response = await uploadService.uploadImage({
          uri: selectedImage.uri,
          fileName: selectedImage.fileName || `image_${Date.now()}.jpg`,
          mimeType: selectedImage.mimeType || 'image/jpeg',
        });

        if (response.data && response.data.length > 0) {
          const imageUrl = response.data[0];
          const success = await onSendMessage(imageUrl, "IMAGE");
          if (success) {
            setSelectedImage(null);
            Keyboard.dismiss();
          }
        } else {
          Alert.alert("Lỗi", "Không thể upload ảnh");
        }
      } catch (error) {
        console.error("Upload error:", error);
        Alert.alert("Lỗi", "Upload ảnh thất bại");
      } finally {
        setUploading(false);
      }
    } else if (input.trim()) {
      // Gửi tin nhắn text
      const success = await onSendMessage(input.trim(), "TEXT");
      if (success) {
        setInput("");
        Keyboard.dismiss();
      }
    }
  };

  const handlePickImage = async () => {
    if (!allowImage || uploading) return;

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Quyền truy cập",
          "Cần quyền truy cập thư viện ảnh để gửi ảnh"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // Lưu ảnh đã chọn, sẽ upload khi nhấn gửi
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Lỗi", "Không thể chọn ảnh");
    }
  };

  return (
    <Box className="px-3 py-2 border-t border-gray-200 bg-white">
      {showStaffWarning && !hasChat && (
        <Box className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-2">
          <Text className="text-xs text-yellow-800 text-center">
            ⚠️ Chưa có nhân viên hỗ trợ. Vui lòng đợi trong giây lát...
          </Text>
        </Box>
      )}

      {!isConnected && (
        <Box className="bg-red-50 border border-red-200 rounded-lg p-2 mb-2">
          <Text className="text-xs text-red-800 text-center">
            🔴 Đang kết nối...
          </Text>
        </Box>
      )}

      {selectedImage && (
        <Box className="mb-2 relative">
          <Box className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-300">
            <Image
              source={{ uri: selectedImage.uri }}
              className="w-full h-full"
              alt="Preview"
            />
            <Pressable
              onPress={() => setSelectedImage(null)}
              className="absolute top-1 right-1 bg-red-500 rounded-full p-1"
            >
              <Text className="text-white text-xs font-bold">×</Text>
            </Pressable>
          </Box>
          <Text className="text-xs text-gray-500 mt-1">
            📷 Ảnh đã chọn, nhấn gửi để upload
          </Text>
        </Box>
      )}

      <HStack className="items-end gap-2">
        {allowImage && (
          <Pressable
            onPress={handlePickImage}
            disabled={isSending || uploading || !isConnected || !!selectedImage}
            className="bg-gray-100 rounded-full p-2"
          >
            <ImageIcon
              size={18}
              color={isSending || uploading || !isConnected || !!selectedImage ? "#9CA3AF" : "#6B7280"}
            />
          </Pressable>
        )}
        <Box className="flex-1">
          <Textarea
            className="min-h-[36px] max-h-[80px]"
            size="sm"
            isDisabled={isSending || uploading || !isConnected || !!selectedImage}
          >
            <TextareaInput
              ref={textareaRef}
              value={input}
              onChangeText={setInput}
              placeholder={selectedImage ? "Nhấn gửi để upload ảnh..." : "Nhập tin nhắn..."}
              multiline
              className="text-sm py-2"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />
          </Textarea>
        </Box>
        <Button
          onPress={handleSend}
          isDisabled={(selectedImage ? false : !input.trim()) || isSending || uploading || !isConnected}
          className={`${buttonColor} h-[36px] px-3`}
        >
          {isSending || uploading ? (
            <Loader2 size={18} color="white" className="animate-spin" />
          ) : (
            <Send size={18} color="white" />
          )}
        </Button>
      </HStack>
    </Box>
  );
}
