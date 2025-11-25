import React, { useState } from 'react';
import { ActivityIndicator, TextInput } from 'react-native';
import {
  Box, HStack, VStack, Text, Pressable, Icon,
} from '@/components/ui';
import {
  MessageCircleIcon,
  SendIcon,
} from 'lucide-react-native';
import type { ProductQuestion } from '@/types/productQuestion.type';
import QuestionItem from './QuestionItem';

interface ProductQuestionsProps {
  questions: ProductQuestion[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  questionContent: string;
  isSubmittingQuestion: boolean;
  isSubmittingAnswer: boolean;
  onQuestionChange: (content: string) => void;
  onSubmitQuestion: () => void;
  onAnswerSubmit: (questionId: number, content: string) => void;
  onLoadMore: () => void;
}

export default function ProductQuestions({
  questions,
  loading,
  currentPage,
  totalPages,
  totalItems,
  questionContent,
  isSubmittingQuestion,
  isSubmittingAnswer,
  onQuestionChange,
  onSubmitQuestion,
  onAnswerSubmit,
  onLoadMore,
}: ProductQuestionsProps) {
  return (
    <Box className="mb-6">
      <HStack className="items-center justify-between mb-4 px-4">
        <HStack className="items-center">
          <Icon as={MessageCircleIcon} size="sm" className="text-blue-600 mr-2" />
          <Text className="text-gray-900 font-bold text-lg">Hỏi và đáp</Text>
        </HStack>
      </HStack>

      {/* Question Input */}
      <Box className="bg-gray-50 rounded-lg p-4 mb-4 mx-4">
        <TextInput
          value={questionContent}
          onChangeText={onQuestionChange}
          placeholder="Viết câu hỏi của bạn tại đây"
          multiline
          numberOfLines={3}
          className="bg-white rounded-lg p-3 border border-gray-200 text-sm text-gray-900 mb-3"
          placeholderTextColor="#9CA3AF"
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />
        <Pressable
          onPress={onSubmitQuestion}
          disabled={isSubmittingQuestion || !questionContent.trim()}
          className={`bg-red-500 rounded-lg px-4 py-3 items-center ${(isSubmittingQuestion || !questionContent.trim()) ? 'opacity-50' : ''}`}
        >
          {isSubmittingQuestion ? (
            <HStack className="items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white font-semibold ml-2">Đang gửi...</Text>
            </HStack>
          ) : (
            <HStack className="items-center">
              <Text className="text-white font-semibold mr-2">Gửi câu hỏi</Text>
              <Icon as={SendIcon} size="sm" className="text-white" />
            </HStack>
          )}
        </Pressable>
      </Box>

      {/* Questions List */}
      {loading && questions.length === 0 ? (
        <Box className="items-center py-8">
          <ActivityIndicator size="small" color="#EF4444" />
        </Box>
      ) : questions.length === 0 ? (
        <Box className="bg-gray-50 rounded-lg p-6 items-center mx-4">
          <Icon as={MessageCircleIcon} size="lg" className="text-gray-300 mb-2" />
          <Text className="text-gray-500 text-sm text-center">Chưa có câu hỏi nào</Text>
          <Text className="text-gray-400 text-xs text-center mt-1">Hãy là người đầu tiên đặt câu hỏi!</Text>
        </Box>
      ) : (
        <VStack className="space-y-4 px-4">
          {questions.map((question) => (
            <QuestionItem
              key={question.id}
              question={question}
              onAnswerSubmit={onAnswerSubmit}
              isSubmitting={isSubmittingAnswer}
            />
          ))}
          {currentPage < totalPages && (
            <Pressable
              onPress={onLoadMore}
              disabled={loading}
              className="bg-gray-100 rounded-lg p-3 items-center"
            >
              {loading ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Text className="text-gray-700 font-semibold">
                  Xem thêm câu hỏi ({totalItems - questions.length} còn lại)
                </Text>
              )}
            </Pressable>
          )}
        </VStack>
      )}
    </Box>
  );
}

