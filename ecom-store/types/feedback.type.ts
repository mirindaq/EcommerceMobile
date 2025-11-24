export interface CreateFeedbackRequest {
  orderId: number;
  productVariantId: number;
  rating: number; // 1-5
  comment?: string;
  imageUrls?: string[];
}

export interface FeedbackResponse {
  id: number;
  orderId: number;
  productVariantId: number;
  productName: string;
  productImage: string;
  customerId: number;
  customerName: string;
  rating: number;
  comment?: string;
  imageUrls: string[];
  createdAt: string;
}
