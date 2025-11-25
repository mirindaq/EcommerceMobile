export type VariantValue = {
  id: number;
  value: string;
  status: boolean;
  variantId: number;
  variantName: string;
  slug?: string;
};

export type Variant = {
  id: number;
  name: string;
  status: boolean;
  slug: string;
  variantValues?: VariantValue[];
};

