import { Box, HStack, Pressable, SafeAreaView, Text } from "@/components/ui";
import { chatService } from "@/services/chat.service";
import { webSocketService } from "@/services/websocket.service";
import type { Chat, Message } from "@/types/chat.type";
import AuthStorageUtil from "@/utils/authStorage.util";
import { useRouter } from "expo-router";
import { ArrowLeft, Loader2, MessageCircle } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";

export default function ChatSupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const scrollRef = useRef<any>(null);

  const formatTime = (date: string) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = messageDate.toDateString() === today.toDateString();
    const isYesterday = messageDate.toDateString() === yesterday.toDateString();

    if (isToday) {
      return messageDate.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (isYesterday) {
      return (
        "Hôm qua " +
        messageDate.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } else {
      return (
        messageDate.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        }) +
        " " +
        messageDate.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
  };

  const initializeChat = useCallback(async () => {
    console.log("🔄 initializeChat() called");
    try {
      setLoading(true);
      const isAuthenticated = await AuthStorageUtil.isAuthenticated();
      if (!isAuthenticated) {
        console.log("❌ User not authenticated, redirecting to login");
        router.push("/login");
        return;
      }

      const user = await AuthStorageUtil.getUserData();
      if (user) {
        setCurrentUserName(user.fullName || user.name || user.email || "");
        console.log("✅ User data loaded:", JSON.stringify(user, null, 2));
      }

      try {
        console.log("🔍 Fetching my chat...");
        const response = await chatService.getMyChat();
        const chatData = response.data;
        console.log("✅ Chat found:", chatData.id);
        setChat(chatData);
        setMessages(chatData.messages || []);

        if (chatData.id) {
          await chatService.markMessagesAsReadByCustomer(chatData.id);
        }
      } catch (error: any) {
        const status = error.response?.status;
        if (status === 404) {
          console.log(
            "ℹ️ No chat found for current customer (404), chat will be created on first message"
          );
          setChat(null);
          setMessages([]);
        } else {
          console.error("❌ Error loading chat:", error);
        }
      }
    } catch (error) {
      console.error("❌ Error initializing chat:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const chatSubscriptionRef = useRef<any>(null);

  const connectWebSocket = useCallback((chatId: number) => {
    console.log("📞 connectWebSocket called with chatId:", chatId);

    if (!chatId) {
      console.error("❌ Invalid chatId:", chatId);
      return;
    }

    const handleMessageReceived = (message: Message) => {
      if (message.chatId === chatId) {
        console.log(
          "📨 Message received for chat:",
          chatId,
          message.content?.substring(0, 50)
        );
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      }
    };

    // Connect WebSocket và subscribe vào chat room
    console.log("🔌 Calling webSocketService.connect()...");
    webSocketService.connect(
      () => {
        console.log(
          "✅ WebSocket connected callback, subscribing to chat:",
          chatId
        );
        if (chatSubscriptionRef.current) {
          chatSubscriptionRef.current.unsubscribe();
        }
        const subscription = webSocketService.subscribeToChatRoom(
          chatId,
          handleMessageReceived
        );
        if (subscription) {
          chatSubscriptionRef.current = subscription;
          console.log("✅ Successfully subscribed to chat:", chatId);
        } else {
          console.error("❌ Failed to subscribe to chat:", chatId);
        }
        setIsConnected(true);
      },
      (error) => {
        console.error("❌ WebSocket connection error:", error);
        setIsConnected(false);
      }
    );
  }, []);

  const handleSendMessage = useCallback(
    async (message: string, messageType: "TEXT" | "IMAGE" = "TEXT") => {
      try {
        setSending(true);

        const user = await AuthStorageUtil.getUserData();
        if (!user) {
          router.push("/login");
          return false;
        }

        let userId: number | null = null;
        if (typeof user.id === "number") {
          userId = user.id;
        } else if (typeof user.id === "string") {
          userId = parseInt(user.id);
        } else if (user.userId) {
          userId =
            typeof user.userId === "number"
              ? user.userId
              : parseInt(user.userId);
        }

        if (!userId || isNaN(userId)) {
          console.error("❌ Cannot get userId from user object:", user);
          return false;
        }

        let targetChatId = chat?.id;

        // Nếu chưa có chat, tạo chat mới -> connect socket -> gửi tin nhắn
        if (!targetChatId) {
          try {
            const createResponse = await chatService.createChat();
            const newChat = createResponse.data;
            setChat(newChat);
            setMessages([]);
            targetChatId = newChat.id;

            if (!isConnected) {
              const handleMessageReceived = (msg: Message) => {
                if (msg.chatId === targetChatId) {
                  setMessages((prev) => {
                    if (prev.some((m) => m.id === msg.id)) {
                      return prev;
                    }
                    return [...prev, msg];
                  });
                }
              };

              webSocketService.connect(
                () => {
                  console.log(
                    "✅ WebSocket connected, subscribing to new chat:",
                    targetChatId
                  );
                  if (chatSubscriptionRef.current) {
                    chatSubscriptionRef.current.unsubscribe();
                  }
                  chatSubscriptionRef.current =
                    webSocketService.subscribeToChatRoom(
                      targetChatId!,
                      handleMessageReceived
                    );
                  setIsConnected(true);

                  const messageRequest = {
                    chatId: targetChatId!,
                    content: message.trim(),
                    messageType: messageType,
                    senderId: userId,
                    isStaff: false,
                  };
                  webSocketService.sendMessage(messageRequest);
                },
                (error) => {
                  console.error("WebSocket error:", error);
                  setIsConnected(false);
                }
              );
            } else {
              const handleMessageReceived = (msg: Message) => {
                if (msg.chatId === targetChatId) {
                  setMessages((prev) => {
                    if (prev.some((m) => m.id === msg.id)) {
                      return prev;
                    }
                    return [...prev, msg];
                  });
                }
              };
              if (chatSubscriptionRef.current) {
                chatSubscriptionRef.current.unsubscribe();
              }
              chatSubscriptionRef.current =
                webSocketService.subscribeToChatRoom(
                  targetChatId!,
                  handleMessageReceived
                );

              const messageRequest = {
                chatId: targetChatId!,
                content: message.trim(),
                messageType: messageType,
                senderId: userId,
                isStaff: false,
              };
              webSocketService.sendMessage(messageRequest);
            }

            return true;
          } catch (error) {
            console.error("Error creating chat:", error);
            return false;
          }
        } else {
          if (!isConnected) {
            connectWebSocket(targetChatId);
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }

          const messageRequest = {
            chatId: targetChatId,
            content: message.trim(),
            messageType: messageType,
            senderId: userId,
            isStaff: false,
          };

          webSocketService.sendMessage(messageRequest);
          return true;
        }
      } catch (error) {
        console.error("Error sending message:", error);
        return false;
      } finally {
        setSending(false);
      }
    },
    [chat?.id, isConnected, connectWebSocket, router]
  );

  useEffect(() => {
    initializeChat();

    return () => {
      if (chatSubscriptionRef.current) {
        chatSubscriptionRef.current.unsubscribe();
        chatSubscriptionRef.current = null;
      }
      webSocketService.disconnect();
      setIsConnected(false);
    };
  }, [initializeChat]);

  useEffect(() => {
    console.log(
      "🔄 useEffect - chat?.id:",
      chat?.id,
      "isConnected:",
      isConnected
    );
    if (chat?.id) {
      console.log("✅ Chat ID found, connecting WebSocket:", chat.id);
      connectWebSocket(chat.id);
    } else {
      console.log(
        "ℹ️ No chat ID yet, WebSocket will connect when chat is created"
      );
    }

    return () => {
      if (chatSubscriptionRef.current) {
        chatSubscriptionRef.current.unsubscribe();
        chatSubscriptionRef.current = null;
      }
    };
  }, [chat?.id, connectWebSocket]);

  return (
    <Box className="flex-1 bg-white">
      {/* 1. SafeAreaView chỉ quản lý Top */}
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* 2. Header nằm ngoài KeyboardAvoidingView */}
        <Box className="bg-red-500 px-4 py-4 z-10">
          <HStack className="items-center justify-between">
            <HStack className="items-center gap-3 flex-1">
              <Pressable
                onPress={() => router.back()}
                className="p-2 -ml-2 active:opacity-70"
              >
                <ArrowLeft size={22} color="white" />
              </Pressable>
              <Box className="bg-white/20 rounded-full p-2">
                <MessageCircle size={20} color="white" />
              </Box>
              <Box className="flex-1">
                <Text className="text-white font-semibold text-base">
                  Hỗ trợ khách hàng
                </Text>
                <Text className="text-white/90 text-xs">
                  Chúng tôi sẽ phản hồi sớm nhất
                </Text>
              </Box>
            </HStack>
          </HStack>
        </Box>

        {/* 3. KeyboardAvoidingView bao bọc nội dung và ChatInput */}
        {Platform.OS === "ios" ? (
          <KeyboardAvoidingView
            behavior="padding"
            className="flex-1"
            keyboardVerticalOffset={0}
          >
            <Box className="flex-1 bg-gray-50 min-h-0">
              {loading ? (
                <Box className="flex-1 items-center justify-center">
                  <Loader2 size={32} color="#EF4444" className="animate-spin" />
                  <Text className="text-gray-600 mt-4">Đang tải...</Text>
                </Box>
              ) : (
                <>
                  <ChatMessages
                    messages={messages}
                    formatTime={formatTime}
                    scrollRef={scrollRef}
                    currentUserName={currentUserName}
                  />
                  <ChatInput
                    onSendMessage={handleSendMessage}
                    isConnected={isConnected}
                    isSending={sending}
                    showStaffWarning={!chat?.staffId && messages.length === 0}
                    hasChat={!!chat}
                    allowImage={true}
                  />
                </>
              )}
            </Box>
          </KeyboardAvoidingView>
        ) : (
          <Box className="flex-1 bg-gray-50 min-h-0">
            {loading ? (
              <Box className="flex-1 items-center justify-center">
                <Loader2 size={32} color="#EF4444" className="animate-spin" />
                <Text className="text-gray-600 mt-4">Đang tải...</Text>
              </Box>
            ) : (
              <>
                <ChatMessages
                  messages={messages}
                  formatTime={formatTime}
                  scrollRef={scrollRef}
                  currentUserName={currentUserName}
                />
                <ChatInput
                  onSendMessage={handleSendMessage}
                  isConnected={isConnected}
                  isSending={sending}
                  showStaffWarning={!chat?.staffId && messages.length === 0}
                  hasChat={!!chat}
                  allowImage={true}
                />
              </>
            )}
          </Box>
        )}
      </SafeAreaView>
    </Box>
  );
}
