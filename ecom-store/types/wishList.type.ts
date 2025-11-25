
export type WishList = {
  id: number;
  customerId: number;
  productVariantId: number;
};

export type WishListResponse = {
  id: number;
  productId: number; // Backend uses productId, not productVariantId
  productName: string;
  productSlug?: string; // Backend has productSlug
  productImage: string;
  price: number;
};

export type WishListRequest = {
  productId: number; // Backend expect productId, not productVariantId
};
