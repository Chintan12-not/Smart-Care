export interface AccessoryProduct {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number | null;
  inStock?: boolean;
  isOnSale?: boolean;
  rating: number;
  reviewsCount: number;
  image: string;
  images?: string[];
  specifications: Record<string, string>;
  description: string;
}

// Store products are managed exclusively via the Admin Panel (/admin) & Supabase Database.
export const MOCK_ACCESSORIES: AccessoryProduct[] = [];
