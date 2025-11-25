import axiosClient from "@/configurations/axios.config";
import type { AIApiResponse, ChatAIRequest } from "@/types/ai.type";

export const aiService = {
  chat: async (request: ChatAIRequest) => {
    const response = await axiosClient.post<AIApiResponse>(
      "/ai/chat",
      request,
      {
        timeout: 60000, // 60 giây cho AI chat
      }
    );
    return response.data;
  },
};

