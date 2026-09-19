import { supabase, isSupabaseConfigured } from "./supabase";

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

export const ACCESSORY_CARD_FIELDS = 
  "id, name, category, brand, price, stock_quantity, rating_avg, reviews_count, images, is_active, specifications, description";

export function mapSupabaseRowToProduct(item: any): AccessoryProduct {
  let rawImages: string[] = [];
  if (item.images && Array.isArray(item.images) && item.images.length > 0) {
    rawImages = item.images;
  } else if (item.image) {
    rawImages = [item.image];
  } else {
    rawImages = ["/shop_accessories.png"];
  }

  // Preserve user-uploaded product images (both HTTP URLs and base64 data URIs)
  const validImages = rawImages
    .map(img => (typeof img === "string" ? img.trim() : ""))
    .filter(img => img.length > 0);

  // Prioritize real uploaded images (base64 data URIs or image URLs) over placeholder fallbacks
  const userUploadedImages = validImages.filter(img => img !== "/shop_accessories.png" && img !== "/placeholder.png");
  const cleanImages = userUploadedImages.length > 0 ? userUploadedImages : validImages;

  const primaryImage = cleanImages[0] || "/shop_accessories.png";

  return {
    id: String(item.id),
    name: item.name || "Accessory Product",
    category: item.category || "General",
    brand: item.brand || "Generic",
    price: Number(item.price || 0),
    originalPrice: item.original_price ? Number(item.original_price) : (item.specifications?.original_price ? parseFloat(item.specifications.original_price) : null),
    inStock: item.in_stock ?? (item.stock_quantity === undefined || item.stock_quantity > 0),
    isOnSale: item.is_on_sale ?? (item.specifications?.is_on_sale === "true"),
    rating: Number(item.rating_avg || item.rating || 4.8),
    reviewsCount: Number(item.reviews_count || item.reviewsCount || 15),
    image: primaryImage,
    images: cleanImages,
    specifications: item.specifications || {},
    description: item.description || ""
  };
}

// Memory cache to prevent redundant Supabase queries during user navigation
const queryCache = new Map<string, { products: AccessoryProduct[]; totalCount: number; hasMore: boolean }>();

export interface FetchAccessoriesOptions {
  page?: number;
  pageSize?: number;
  brand?: string;
  model?: string;
  category?: string;
  search?: string;
  sortBy?: string;
  forceRefresh?: boolean;
}

export interface FetchAccessoriesResult {
  products: AccessoryProduct[];
  totalCount: number;
  hasMore: boolean;
}

export async function fetchAccessoriesFromSupabase(options: FetchAccessoriesOptions = {}): Promise<FetchAccessoriesResult> {
  const {
    page = 0,
    pageSize = 24,
    brand = "",
    model = "",
    category = "all",
    search = "",
    sortBy = "default",
    forceRefresh = false
  } = options;

  if (!isSupabaseConfigured()) {
    return { products: [], totalCount: 0, hasMore: false };
  }

  const cacheKey = `${page}-${pageSize}-${brand}-${model}-${category}-${search}-${sortBy}`;
  if (!forceRefresh && queryCache.has(cacheKey)) {
    return queryCache.get(cacheKey)!;
  }

  try {
    let query = supabase
      .from("accessories")
      .select(ACCESSORY_CARD_FIELDS)
      .eq("is_active", true);

    // Filter by category
    if (category && category !== "all") {
      const catNorm = category.toLowerCase().trim();
      query = query.ilike("category", `%${catNorm}%`);
    }

    // Filter by Brand or Model at DB level
    if (model && model.trim()) {
      const modelNorm = model.toLowerCase().trim();
      const shortModel = modelNorm
        .replace(/^(apple\s+iphone|iphone|apple|samsung\s+galaxy|samsung|oppo|oneplus|poco|realme|redmi|vivo|xiaomi|google)\s+/, "")
        .trim();

      const modelTerms = [modelNorm];
      if (shortModel && shortModel.length >= 2 && shortModel !== modelNorm) {
        modelTerms.push(shortModel);
      }

      const orConditions = modelTerms
        .flatMap(term => [
          `name.ilike.%${term}%`,
          `description.ilike.%${term}%`
        ])
        .concat([
          "category.ilike.%charger%",
          "category.ilike.%cable%",
          "category.ilike.%power%",
          "brand.ilike.Generic",
          "brand.ilike.Universal"
        ])
        .join(",");

      query = query.or(orConditions);
    } else if (brand && brand !== "all") {
      const brandNorm = brand.toLowerCase().trim();
      query = query.or(`brand.ilike.%${brandNorm}%,name.ilike.%${brandNorm}%,description.ilike.%${brandNorm}%,brand.ilike.Generic,brand.ilike.Universal`);
    }

    // Filter by Search Query
    if (search && search.trim()) {
      const q = search.trim();
      query = query.or(`name.ilike.%${q}%,category.ilike.%${q}%,brand.ilike.%${q}%,description.ilike.%${q}%`);
    }

    // Sorting
    if (sortBy === "price-low") {
      query = query.order("price", { ascending: true });
    } else if (sortBy === "price-high") {
      query = query.order("price", { ascending: false });
    } else if (sortBy === "rating") {
      query = query.order("rating_avg", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    // Database Pagination range (fetch pageSize + 1 to know if hasMore is true without count query)
    const start = page * pageSize;
    const end = start + pageSize;
    query = query.range(start, end);

    const { data, error } = await query;

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Supabase query notice in fetchAccessoriesFromSupabase:", error.message || error);
      }
      return { products: [], totalCount: 0, hasMore: false };
    }

    const rawList = data || [];
    const hasMore = rawList.length > pageSize;
    const pageItems = hasMore ? rawList.slice(0, pageSize) : rawList;

    const mapped = pageItems.map(mapSupabaseRowToProduct);
    const totalCount = mapped.length;

    const result: FetchAccessoriesResult = {
      products: mapped,
      totalCount,
      hasMore
    };

    queryCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error("Error in fetchAccessoriesFromSupabase:", err);
    return { products: [], totalCount: 0, hasMore: false };
  }
}

export function clearAccessoriesQueryCache() {
  queryCache.clear();
}
