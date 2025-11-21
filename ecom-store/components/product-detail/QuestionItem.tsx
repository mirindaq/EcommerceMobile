import React, { useState } from 'react';
import { ActivityIndicator, TextInput } from 'react-native';
import {
  Avatar, AvatarFallbackText,
  Badge, BadgeText,
  Box, HStack, VStack, Text, Pressable, Icon,
} from '@/components/ui';
import {
  ClockIcon,
  MessageCircleIcon,
  SendIcon,
} from 'lucide-react-native';
import type { ProductQuestion } from '@/types/productQuestion.type';

interface QuestionItemProps {
  question: ProductQuestion;
  onAnswerSubmit: (questionId: number, content: string) => void;
  isSubmitting: boolean;
}

export default function QuestionItem({ question, onAnswerSubmit, isSubmitting }: QuestionItemProps) {
  const [answerContent, setAnswerContent] = useState('');
  const [showAnswerInput, setShowAnswerInput] = useState(false);
  const [expandedAnswers, setExpandedAnswers] = useState(question.answers && question.answers.length > 0);

  // Helper function to get user initials for avatar
  const getUserInitials = (name: string) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return words[words.length - 1].charAt(0).toUpperCase();
  };

  // Helper function to format time ago
  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Hôm nay';
    if (diffInDays === 1) return 'Hôm qua';
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} tuần trước`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} tháng trước`;
  };

  return (
    <Box className="bg-white border-b border-gray-200 pb-4 mb-4">
      <HStack className="items-start">
        {/* User Avatar */}
        <Avatar className="w-10 h-10 mr-3">
          <AvatarFallbackText className="bg-purple-600 text-white font-semibold text-sm">
            {getUserInitials(question.userName)}
          </AvatarFallbackText>
        </Avatar>

        <VStack className="flex-1">
          {/* Question Header */}
          <HStack className="items-center mb-2">
            <Text className="text-gray-900 font-semibold text-sm mr-2">{question.userName}</Text>
            {question.createdAt && (
              <HStack className="items-center">
                <ClockIcon size={12} color="#9CA3AF" />
                <Text className="text-gray-400 text-xs ml-1">{formatTimeAgo(question.createdAt)}</Text>
              </HStack>
            )}
          </HStack>

          {/* Question Content */}
          <Text className="text-gray-700 text-sm leading-relaxed mb-3">{question.content}</Text>

          {/* Action Buttons */}
          <HStack className="items-center mb-3">
            {question.answers && question.answers.length > 0 && (
              <Pressable
                onPress={() => setExpandedAnswers(!expandedAnswers)}
                className="mr-4"
              >
                <Text className="text-red-600 text-sm font-medium">
                  {expandedAnswers ? 'Thu gọn phản hồi' : `Chi tiết phản hồi (${question.answers.length})`}
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => setShowAnswerInput(!showAnswerInput)}
            >
              <HStack className="items-center">
                <Icon as={MessageCircleIcon} size="sm" className="text-red-600 mr-1" />
                <Text className="text-red-600 text-sm font-medium">Phản hồi</Text>
              </HStack>
            </Pressable>
          </HStack>

          {/* Answer Form */}
          {showAnswerInput && (
            <VStack className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200">
              <Text className="text-gray-800 font-semibold text-sm mb-3">Trả lời câu hỏi</Text>
              <TextInput
                value={answerContent}
                onChangeText={setAnswerContent}
                placeholder="Viết câu trả lời của bạn tại đây..."
                multiline
                numberOfLines={3}
                className="bg-white rounded-lg p-3 border border-gray-200 text-sm text-gray-900 mb-3"
                placeholderTextColor="#9CA3AF"
                style={{ minHeight: 80, textAlignVertical: 'top' }}
              />
              <HStack className="space-x-2">
                <Pressable
                  onPress={() => {
                    setShowAnswerInput(false);
                    setAnswerContent('');
                  }}
                  className="bg-gray-200 rounded-lg px-4 py-2 flex-1"
                >
                  <Text className="text-gray-700 font-semibold text-center">Hủy</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (answerContent.trim()) {
                      onAnswerSubmit(question.id, answerContent);
                      setAnswerContent('');
                      setShowAnswerInput(false);
                    }
                  }}
                  disabled={isSubmitting || !answerContent.trim()}
                  className={`bg-red-500 rounded-lg px-4 py-2 flex-1 ${(isSubmitting || !answerContent.trim()) ? 'opacity-50' : ''}`}
                >
                  {isSubmitting ? (
                    <HStack className="items-center justify-center">
                      <ActivityIndicator size="small" color="white" />
                      <Text className="text-white font-semibold ml-2">Đang gửi...</Text>
                    </HStack>
                  ) : (
                    <HStack className="items-center justify-center">
                      <Text className="text-white font-semibold mr-2">Gửi phản hồi</Text>
                      <Icon as={SendIcon} size="sm" className="text-white" />
                    </HStack>
                  )}
                </Pressable>
              </HStack>
            </VStack>
          )}

          {/* Answers Section */}
          {question.answers && question.answers.length > 0 && expandedAnswers && (
            <VStack className="mt-3 space-y-4">
              {question.answers.map((answer) => (
                <HStack key={answer.id} className="items-start pl-4 border-l-2 border-gray-100">
                  {/* Answer Avatar */}
                  <Avatar className="w-10 h-10 mr-3">
                    <AvatarFallbackText className={answer.admin ? 'bg-red-600 text-white font-bold text-xs' : 'bg-purple-600 text-white font-semibold text-sm'}>
                      {answer.admin ? 'S' : getUserInitials(answer.userName || 'U')}
                    </AvatarFallbackText>
                  </Avatar>

                  <VStack className="flex-1">
                    {/* Answer Header */}
                    <HStack className="items-center mb-2">
                      <Text className="text-gray-900 font-semibold text-sm mr-2">
                        {answer.admin ? 'Quản Trị Viên' : (answer.userName || 'Người dùng')}
                      </Text>
                      {answer.admin && (
                        <Badge className="bg-red-500">
                          <BadgeText className="text-white text-xs">QTV</BadgeText>
                        </Badge>
                      )}
                      {answer.createdAt && (
                        <HStack className="items-center ml-2">
                          <ClockIcon size={12} color="#9CA3AF" />
                          <Text className="text-gray-400 text-xs ml-1">{formatTimeAgo(answer.createdAt)}</Text>
                        </HStack>
                      )}
                    </HStack>

                    {/* Answer Content */}
                    <Text className="text-gray-700 text-sm leading-relaxed">{answer.content}</Text>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          )}
        </VStack>
      </HStack>
    </Box>
  );
}

