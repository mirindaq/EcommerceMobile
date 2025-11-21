
export type WishList = {
  id: number;
  customerId: number;
  productVariantId: number;
};

export type WishListResponse = {
  id: number;
  productVariantId: number;
  productName: string;
  productImage: string;
  price: number;
  sku: string;
};

export type WishListRequest = {
  productVariantId: number;
};
