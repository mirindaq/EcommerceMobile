import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Box, HStack, Text, VStack } from "@/components/ui";
import type { Message } from "@/types/chat.type";
import React from "react";
import { ScrollView, Image } from "react-native";

interface ChatMessagesProps {
  messages: Message[];
  formatTime: (date: string) => string;
  scrollRef: React.RefObject<any>;
  currentUserName?: string;
}

export default function ChatMessages({
  messages,
  formatTime,
  scrollRef,
  currentUserName,
}: ChatMessagesProps) {
  return (
    <ScrollView
      className="flex-1 px-4 py-2"
      showsVerticalScrollIndicator={false}
      ref={scrollRef}
      onContentSizeChange={() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }}
    >
      <VStack space="md" className="pb-4">
        {messages.map((msg) => {
          const isCurrentUser = !msg.isStaff;
          const senderInitial = msg.senderName
            ? msg.senderName.charAt(0).toUpperCase()
            : "U";

          return (
            <HStack
              key={msg.id}
              className={isCurrentUser ? "justify-end" : "justify-start"}
            >
              {!isCurrentUser && (
                <Avatar className="h-8 w-8 mr-2 bg-red-500">
                  <AvatarFallbackText className="text-white text-xs font-semibold">
                    {senderInitial}
                  </AvatarFallbackText>
                </Avatar>
              )}

              <VStack className="max-w-[75%]" space="xs">
                <Box
                  className={`rounded-2xl px-4 py-2.5 ${
                    isCurrentUser
                      ? "bg-red-500"
                      : "bg-gray-100 border border-gray-200"
                  }`}
                >
                  {!isCurrentUser && (
                    <Text className="text-xs font-medium text-gray-600 mb-1">
                      {msg.senderName}
                    </Text>
                  )}
                  {msg.messageType === "IMAGE" ? (
                    <Image
                      source={{ uri: msg.content }}
                      className="w-48 h-48 rounded-lg"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text
                      className={`text-sm ${
                        isCurrentUser ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {msg.content}
                    </Text>
                  )}
                </Box>
                <Text className="text-xs text-gray-500 px-2">
                  {formatTime(msg.createdAt)}
                </Text>
              </VStack>

              {isCurrentUser && (
                <Avatar className="h-8 w-8 ml-2 bg-red-500">
                  <AvatarFallbackText className="text-white text-xs font-semibold">
                    {currentUserName
                      ? currentUserName.charAt(0).toUpperCase()
                      : "K"}
                  </AvatarFallbackText>
                </Avatar>
              )}
            </HStack>
          );
        })}
      </VStack>
    </ScrollView>
  );
}

