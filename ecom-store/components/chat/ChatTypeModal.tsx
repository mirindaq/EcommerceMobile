import { Box, HStack, Pressable, Text, VStack } from "@/components/ui";
import { useRouter } from "expo-router";
import { MessageCircle, Bot, X } from "lucide-react-native";
import React from "react";
import { Modal } from "react-native";

interface ChatTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatTypeModal({
  isOpen,
  onClose,
}: ChatTypeModalProps) {
  const router = useRouter();

  const handleSelectChatType = (type: "support" | "ai") => {
    onClose();
    if (type === "support") {
      router.push("/chat-support");
    } else {
      router.push("/chat-ai");
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/50 items-center justify-center px-4"
        onPress={onClose}
      >
        <Pressable
          className="bg-white rounded-2xl w-full max-w-sm overflow-hidden"
          onPress={(e) => e.stopPropagation()}
        >
          <Box className="p-4 border-b border-gray-200">
            <HStack className="items-center justify-between">
              <Text className="text-lg font-bold text-gray-900">
                Chọn loại chat
              </Text>
              <Pressable onPress={onClose} className="p-2">
                <X size={20} color="#6B7280" />
              </Pressable>
            </HStack>
          </Box>

          <VStack className="p-4 gap-3">
            <Pressable
              onPress={() => handleSelectChatType("support")}
              className="bg-red-50 border-2 border-red-200 rounded-xl p-4 active:bg-red-100"
            >
              <HStack className="items-center gap-4">
                <Box className="bg-red-500 rounded-full p-3">
                  <MessageCircle size={24} color="white" />
                </Box>
                <VStack className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    Chat với hỗ trợ
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    Nhân viên sẽ hỗ trợ bạn trực tiếp
                  </Text>
                </VStack>
              </HStack>
            </Pressable>

            <Pressable
              onPress={() => handleSelectChatType("ai")}
              className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 active:bg-purple-100"
            >
              <HStack className="items-center gap-4">
                <Box className="bg-purple-600 rounded-full p-3 relative">
                  <Bot size={24} color="white" />
                </Box>
                <VStack className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    Chat với AI
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    Trợ lý AI thông minh 24/7
                  </Text>
                </VStack>
              </HStack>
            </Pressable>
          </VStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

