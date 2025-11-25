import {
  Box,
  HStack,
  Pressable,
  SafeAreaView,
  Text,
  VStack,
} from "@/components/ui";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { aiService } from "@/services/ai.service";
import type { ChatAIRequest } from "@/types/ai.type";
import AuthStorageUtil from "@/utils/authStorage.util";
import { useRouter } from "expo-router";
import { ArrowLeft, Bot, Sparkles } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import ChatInput from "./ChatInput";

interface AIMessage {
  id: string;
  content: string;
  isAI: boolean;
  createdAt: Date;
}

export default function AIChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [userName, setUserName] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  const sessionId = useMemo(() => {
    return `ai-chat-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;
  }, []);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const user = await AuthStorageUtil.getUserData();
      if (user) {
        setUserName(user.fullName || user.name || user.email || "");
      }
    } catch (error) {
      console.error("Error loading user info:", error);
    }
  };

  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async (
    message: string,
    messageType?: "TEXT" | "IMAGE"
  ) => {
    if (!message.trim() || sending) return false;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      content: message.trim(),
      isAI: false,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setSending(true);

    const thinkingMessage: AIMessage = {
      id: "thinking",
      content: "...",
      isAI: true,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, thinkingMessage]);

    try {
      const user = await AuthStorageUtil.getUserData();
      const request: ChatAIRequest = {
        message: userMessage.content,
        customerId: user?.id ? parseInt(user.id) : null,
        sessionId: sessionId,
      };

      const response = await aiService.chat(request);

      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        content: response.data.message,
        isAI: true,
        createdAt: new Date(),
      };

      setMessages((prev) =>
        prev.filter((m) => m.id !== "thinking").concat(aiMessage)
      );
      return true;
    } catch (error) {
      console.error("Error sending message to AI:", error);
      setMessages((prev) => prev.filter((m) => m.id !== "thinking"));
      return false;
    } finally {
      setSending(false);
    }
  };

  return (
    <Box className="flex-1 bg-white">
      {/* 1. SafeAreaView chỉ xử lý phần Top (Tai thỏ) */}
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* 2. Header nằm NGOÀI KeyboardAvoidingView để luôn cố định */}
        <Box className="bg-purple-600 px-4 py-4 z-10">
          <HStack className="items-center justify-between">
            <HStack className="items-center gap-3 flex-1">
              <Pressable
                onPress={() => router.back()}
                className="p-2 -ml-2 active:opacity-70"
              >
                <ArrowLeft size={22} color="white" />
              </Pressable>
              <Box className="bg-white/20 rounded-full p-2">
                <Bot size={20} color="white" />
              </Box>
              <Box className="flex-1">
                <Text className="text-white font-semibold text-base">
                  Trợ lý AI
                </Text>
                <Text className="text-white/90 text-xs">
                  Sẵn sàng hỗ trợ bạn
                </Text>
              </Box>
            </HStack>
          </HStack>
        </Box>

        {/* 3. KeyboardAvoidingView bao bọc phần nội dung và input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <Box className="flex-1 bg-gray-50">
            <ScrollView
              ref={scrollRef}
              className="flex-1 px-4 py-4"
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => {
                scrollRef.current?.scrollToEnd({ animated: true });
              }}
              // Quan trọng: giúp chạm vào list để ẩn bàn phím nếu cần (hoặc dùng 'handled')
              keyboardShouldPersistTaps="handled"
            >
              {messages.length === 0 ? (
                <Box className="items-center py-8">
                  <Box className="bg-purple-100 w-16 h-16 rounded-full items-center justify-center mb-4">
                    <Bot size={32} color="#9333EA" />
                  </Box>
                  <Text className="font-medium text-gray-700 text-base mb-2">
                    Xin chào! Tôi là trợ lý AI
                  </Text>
                  <Text className="text-sm text-gray-600 mb-2">
                    Hãy đặt câu hỏi về:
                  </Text>
                  <VStack className="items-start gap-1 mt-2">
                    <Text className="text-sm text-gray-600">
                      • Tư vấn sản phẩm phù hợp
                    </Text>
                    <Text className="text-sm text-gray-600">
                      • Trạng thái đơn hàng
                    </Text>
                    <Text className="text-sm text-gray-600">
                      • Hướng dẫn sử dụng, bảo hành
                    </Text>
                  </VStack>
                </Box>
              ) : (
                <VStack space="md" className="pb-4">
                  {messages.map((msg) => (
                    <HStack
                      key={msg.id}
                      className={msg.isAI ? "justify-start" : "justify-end"}
                    >
                      {msg.isAI && (
                        <Box className="h-8 w-8 mr-2 border-2 border-purple-200 bg-purple-600 rounded-full items-center justify-center">
                          <Bot size={16} color="white" />
                        </Box>
                      )}

                      <VStack className="max-w-[75%]" space="xs">
                        <Box
                          className={`rounded-2xl px-4 py-2.5 ${
                            msg.isAI
                              ? "bg-gray-100 border border-gray-200"
                              : "bg-purple-600"
                          }`}
                        >
                          {msg.isAI && (
                            <HStack className="items-center gap-1 mb-1">
                              <Sparkles size={12} color="#9333EA" />
                              <Text className="text-xs font-medium text-purple-600">
                                Trợ lý AI
                                {msg.id === "thinking" && (
                                  <Text className="text-purple-500 ml-1">
                                    {" "}
                                    đang suy nghĩ...
                                  </Text>
                                )}
                              </Text>
                            </HStack>
                          )}
                          {msg.id === "thinking" ? (
                            <HStack className="items-center gap-1">
                              <Box className="w-2 h-2 bg-purple-400 rounded-full" />
                              <Box className="w-2 h-2 bg-purple-400 rounded-full" />
                              <Box className="w-2 h-2 bg-purple-400 rounded-full" />
                            </HStack>
                          ) : (
                            <Text
                              className={`text-sm ${
                                msg.isAI ? "text-gray-800" : "text-white"
                              }`}
                            >
                              {msg.content}
                            </Text>
                          )}
                        </Box>
                        {msg.id !== "thinking" && (
                          <Text className="text-xs text-gray-500 px-2">
                            {new Date(msg.createdAt).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </Text>
                        )}
                      </VStack>

                      {!msg.isAI && (
                        <Avatar className="h-8 w-8 ml-2 border-2 border-purple-200 bg-purple-600">
                          <AvatarFallbackText className="text-white text-xs font-semibold">
                            {userName ? userName.charAt(0).toUpperCase() : "K"}
                          </AvatarFallbackText>
                        </Avatar>
                      )}
                    </HStack>
                  ))}
                </VStack>
              )}
            </ScrollView>

            {/* ChatInput sẽ tự động được đẩy lên trên bàn phím */}
            <ChatInput
              onSendMessage={handleSendMessage}
              isConnected={true}
              isSending={sending}
              allowImage={false}
              buttonColor="bg-purple-600"
            />
          </Box>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Box>
  );
}
