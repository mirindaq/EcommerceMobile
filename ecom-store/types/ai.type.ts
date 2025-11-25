import type { ResponseApi } from "./responseApi.type";

export interface ChatAIRequest {
  message: string;
  customerId: number | null;
  sessionId: string;
}

export interface ChatAIResponse {
  message: string;
  role: string;
}

export type AIApiResponse = ResponseApi<ChatAIResponse>;

