"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Search, 
  ShoppingBag, 
  Star, 
  Filter, 
  Info, 
  Check, 
  Smartphone, 
  Heart, 
  HeartOff,
  Percent,
  Plus,
  Zap,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowUpDown,
  X,
  Share2,
  PhoneCall,
  Clock
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { MOCK_ACCESSORIES, AccessoryProduct } from "@/lib/accessories";
import { formatINR, cn } from "@/lib/utils";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import PhoneModelFinder from "@/components/accessories/PhoneModelFinder";
import ProductCardImageSlider from "@/components/accessories/ProductCardImageSlider";
import ProductRequestModal from "@/components/accessories/ProductRequestModal";
import { isProductCompatibleWithModel } from "@/lib/compatibility";
import { trackCTAClick, trackEvent } from "@/lib/analytics";

// Client-side in-memory cache to prevent redundant Supabase fetches
let cachedProductsList: AccessoryProduct[] | null = null;

function getInitialProducts(): AccessoryProduct[] {
  if (cachedProductsList && cachedProductsList.length > 0) {
    return cachedProductsList;
  }
  return MOCK_ACCESSORIES;
}

function AccessoriesContent({ initialProducts }: { initialProducts?: AccessoryProduct[] }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const queryBrand = searchParams.get("brand") || "";
  const queryModel = searchParams.get("model") || "";
  const queryCategory = searchParams.get("category") || "all";
  const queryQ = searchParams.get("q") || "";
  
  // Phone selection & Filter states
  const [selectedBrand, setSelectedBrand] = useState<string>(queryBrand || "Apple");
  const [selectedModel, setSelectedModel] = useState<string>(queryModel || "");
  const [search, setSearch] = useState<string>(queryQ || "");
  const [category, setCategory] = useState<string>(queryCategory || "all");
  const [sortBy, setSortBy] = useState<string>("default");
  
  // Progressive loading / batching state (initial 12 items)
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    setVisibleCount(12);
  }, [search, category, sortBy, selectedBrand, selectedModel]);

  useEffect(() => {
    if (queryBrand) setSelectedBrand(queryBrand);
    if (queryModel !== null && queryModel !== undefined) setSelectedModel(queryModel);
    if (queryCategory) setCategory(queryCategory);
    if (queryQ) setSearch(queryQ);
  }, [queryBrand, queryModel, queryCategory, queryQ]);

  const updateUrlParams = (brand: string, model: string, cat: string, qStr: string) => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams();
      if (brand) params.set("brand", brand);
      if (model) params.set("model", model);
      if (cat && cat !== "all") params.set("category", cat);
      if (qStr) params.set("q", qStr);
      const newUrl = `${window.location.pathname}${params.toString() ? "?" + params.toString() : ""}`;
      window.history.replaceState(null, "", newUrl);
    }
  };

  const handleSelectModelFromFinder = (brand: string, model: string) => {
    setSelectedBrand(brand);
    setSelectedModel(model);
    updateUrlParams(brand, model, category, search);
    if (model) {
      const el = document.getElementById("accessories-grid-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleResetPhoneSelection = () => {
    setSelectedBrand("Apple");
    setSelectedModel("");
    setSearch("");
    setCategory("all");
    setSortBy("default");
    updateUrlParams("", "", "all", "");
  };
  
  // Interactive feature states
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<AccessoryProduct | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedItemName, setAddedItemName] = useState("");
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  
  // Product Request Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestModalParams, setRequestModalParams] = useState({
    brand: "",
    model: "",
    productType: ""
  });

  const handleOpenRequestModal = (brand = "", model = "", productType = "") => {
    setRequestModalParams({ brand, model, productType });
    setIsRequestModalOpen(true);
  };

  // Admin Panel & Supabase items
  const [products, setProducts] = useState<AccessoryProduct[]>(getInitialProducts);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 1. Initial LocalStorage Hydration & Live Update Listener
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Wishlist
      const savedWishlist = localStorage.getItem("sc_wishlist");
      if (savedWishlist) {
        try { setWishlist(JSON.parse(savedWishlist)); } catch (e) {}
      }
      
      // Recently Viewed
      const savedRecent = localStorage.getItem("sc_recently_viewed");
      if (savedRecent) {
        try { setRecentlyViewedIds(JSON.parse(savedRecent)); } catch (e) {}
      }
    }
  }, []);

  // 2. Fetch products directly from Supabase
  useEffect(() => {
    async function loadProducts() {
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from("accessories")
            .select("*");

          if (!error && data && data.length > 0) {
            const dbMapped: AccessoryProduct[] = data
              .filter((item) => item.is_active !== false)
              .map((item) => ({
                id: String(item.id),
                name: item.name || "Accessory",
                category: item.category || "General",
                brand: item.brand || "Generic",
                price: Number(item.price || 0),
                originalPrice: item.original_price ? Number(item.original_price) : (item.specifications?.original_price ? parseFloat(item.specifications.original_price) : null),
                inStock: item.in_stock ?? (item.specifications?.in_stock !== undefined ? item.specifications.in_stock === "true" : true),
                isOnSale: item.is_on_sale ?? (item.specifications?.is_on_sale !== undefined ? item.specifications.is_on_sale === "true" : false),
                rating: Number(item.rating_avg || item.rating || 4.8),
                reviewsCount: Number(item.reviews_count || item.reviewsCount || 15),
                image: (item.images && item.images.length > 0) ? item.images[0] : (item.image || "/shop_accessories.png"),
                images: item.images || [item.image || "/shop_accessories.png"],
                specifications: item.specifications || {},
                description: item.description || ""
              }));

            const seenKeys = new Set<string>();
            const finalUnique: AccessoryProduct[] = [];

            for (const item of dbMapped) {
              if (!item) continue;
              const idKey = String(item.id || "").trim();
              const nameKey = String(item.name || "").toLowerCase().trim();
              
              if (!seenKeys.has(idKey) && !seenKeys.has(nameKey)) {
                if (idKey) seenKeys.add(idKey);
                if (nameKey) seenKeys.add(nameKey);
                finalUnique.push(item);
              }
            }

            cachedProductsList = finalUnique;
            setProducts(finalUnique);
          }
        } catch (err) {
          console.error("Error loading products from Supabase:", err);
        } finally {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    const handleUpdate = () => {
      cachedProductsList = null;
      loadProducts();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("sc-products-updated", handleUpdate);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("sc-products-updated", handleUpdate);
      }
    };
  }, []);

  // 3. Wishlist persistent toggle
  const toggleWishlist = (id: string) => {
    let updated;
    if (wishlist.includes(id)) {
      updated = wishlist.filter((item) => item !== id);
    } else {
      updated = [...wishlist, id];
    }
    setWishlist(updated);
    localStorage.setItem("sc_wishlist", JSON.stringify(updated));
  };

  // 4. Track Recently Viewed
  const trackRecentlyViewed = (id: string) => {
    const updated = [id, ...recentlyViewedIds.filter((item) => item !== id)].slice(0, 4);
    setRecentlyViewedIds(updated);
    localStorage.setItem("sc_recently_viewed", JSON.stringify(updated));
  };

  // 5. Compare toggler
  const toggleCompare = (id: string) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter((item) => item !== id));
    } else {
      if (compareIds.length >= 3) {
        alert("You can compare up to 3 accessories at a time.");
        return;
      }
      setCompareIds([...compareIds, id]);
    }
  };

  // 6. Open Specs & Track Recently Viewed
  const handleOpenQuickView = (product: AccessoryProduct) => {
    setSelectedProduct(product);
    setActiveImageIndex(0);
    trackRecentlyViewed(product.id);
  };

  // 7. Cart adder
  const handleAddToCart = (product: AccessoryProduct) => {
    addToCart({
      id: product.id,
      type: "accessory",
      name: product.name,
      price: product.price,
      image: product.image
    });
    setAddedItemName(product.name);
    setTimeout(() => setAddedItemName(""), 2000);
    
    // Slide open Cart Drawer
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("open-cart-drawer"));
    }
  };

  // 8. Exact Compatibility Engine & Multi-Stage Filter Pipeline
  const filteredProducts = products.filter((prod) => {
    // Stage 1: Exact Phone Model Compatibility
    const isCompatible = isProductCompatibleWithModel(prod, selectedBrand, selectedModel);
    if (!isCompatible) return false;

    // Stage 2: Category Filter
    const prodCatNorm = prod.category.toLowerCase().trim();
    const selCatNorm = category.toLowerCase().trim();
    const prodStem = prodCatNorm.endsWith("s") ? prodCatNorm.slice(0, -1) : prodCatNorm;
    const selStem = selCatNorm.endsWith("s") ? selCatNorm.slice(0, -1) : selCatNorm;

    const matchesCategory = 
      category === "all" || 
      prodCatNorm === selCatNorm ||
      prodStem === selStem;

    if (!matchesCategory) return false;

    // Stage 3: Search Bar Text Filter
    if (!search.trim()) return true;

    const sLower = search.toLowerCase().trim();
    const sTokens = sLower.split(/\s+/).filter(Boolean);

    const prodCorpus = [
      prod.name,
      prod.brand,
      prod.category,
      prod.description || "",
      prod.specifications ? JSON.stringify(prod.specifications) : ""
    ].join(" ").toLowerCase();

    return (
      prodCorpus.includes(sLower) ||
      sTokens.some((token) => token.length > 1 && prodCorpus.includes(token))
    );
  });

  // 9. Sorting execution
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0; // default
  });

  const categoriesList = ["All", "Chargers", "Cables", "Tempered Glass", "Cases", "Earbuds", "Power Banks"];

  // Filter out products mapped for comparison
  const compareProductsList = products.filter(p => compareIds.includes(p.id));

  // Filter out recently viewed products
  const recentlyViewedProductsList = products.filter(p => recentlyViewedIds.includes(p.id));

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Smartphone className="h-7 w-7 text-emerald-500" />
            <span>Mobile Accessories Store</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Genuine protective covers, fast chargers, tempered glass, and cables compatible with 600+ phone models.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-extrabold text-xs shadow-md flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4 text-white" />
              <span>+ Add Product to Store (Admin Access)</span>
            </Link>
          )}

          {/* Banner notification */}
          {addedItemName && (
            <div className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-300">
              <Check className="h-4 w-4" />
              <span>Added {addedItemName.substring(0, 15)}... to cart</span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Phone Model Finder */}
      <PhoneModelFinder 
        onSelectModel={handleSelectModelFromFinder} 
        initialBrand={selectedBrand}
        initialModel={selectedModel}
      />

      {/* Active Phone Compatibility Status Indicator Bar */}
      {(selectedBrand || selectedModel) && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="text-foreground">
              Showing exact compatible accessories for: <strong className="text-emerald-500 font-extrabold">{selectedBrand} {selectedModel}</strong>
            </span>
          </div>
          <button
            onClick={handleResetPhoneSelection}
            className="px-3.5 py-1.5 rounded-xl bg-muted hover:bg-border text-foreground font-bold text-[11px] flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            <X className="h-3.5 w-3.5 text-red-400" />
            <span>Reset / Change Phone</span>
          </button>
        </div>
      )}

      {/* Banner for Custom Phone Model Product Request */}
      <div className="glass-card rounded-2xl p-5 border border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Can&apos;t find an accessory for your specific phone model?</h4>
            <p className="text-xs text-muted-foreground">Request custom covers, tempered glass guards, chargers, or batteries for any model.</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenRequestModal(selectedBrand, selectedModel)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Request For Your Model</span>
        </button>
      </div>

      {/* Catalog Search, Category Tabs, and Sorting Controls */}
      <div id="accessories-grid-section" className="glass-card rounded-2xl p-5 border border-border flex flex-col lg:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search chargers, cases, brand..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              updateUrlParams(selectedBrand, selectedModel, category, e.target.value);
            }}
            className="w-full bg-muted border border-border rounded-xl py-3 pl-11 pr-4 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        {/* Categories scroll tabs */}
        <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                const newCat = cat.toLowerCase();
                setCategory(newCat);
                updateUrlParams(selectedBrand, selectedModel, newCat, search);
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-full border text-[11px] font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer",
                category === cat.toLowerCase()
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 select-none cursor-pointer"
          >
            <option value="default">Default Sorting</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Rating: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Grid with Progressive Item Batching */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 border border-border space-y-4 animate-pulse">
              <div className="h-44 w-full rounded-xl bg-muted" />
              <div className="h-4 w-2/3 bg-muted rounded" />
              <div className="h-4 w-1/3 bg-muted rounded" />
              <div className="h-10 w-full bg-muted rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {sortedProducts.slice(0, visibleCount).map((prod, idx) => {
              const isWishlisted = wishlist.includes(prod.id);
              const isCompared = compareIds.includes(prod.id);

              return (
                <div key={prod.id} className="glass-card rounded-2xl p-5 border border-border flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative group">
                  
                  {/* Product Image Container with Badges & Action Buttons */}
                  <div className="aspect-square rounded-2xl bg-white overflow-hidden relative border border-white/20 group-hover:border-cyan-500/50 transition-all flex items-center justify-center p-3 pt-12 mb-4 shadow-sm">
                    
                    {/* Badges: On Sale, Discount %, Out of Stock (Top Left z-30) */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-30 pointer-events-none">
                      {prod.isOnSale && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 text-black shadow-md flex items-center gap-0.5">
                          <Zap className="h-2.5 w-2.5 fill-black" />
                          ON SALE
                        </span>
                      )}

                      {prod.originalPrice && prod.originalPrice > prod.price && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-black shadow-md">
                          {Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}% OFF
                        </span>
                      )}

                      {prod.inStock === false && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500 text-white shadow-md">
                          OUT OF STOCK
                        </span>
                      )}
                    </div>

                    {/* Wishlist & Compare float buttons (Top Right z-30) */}
                    <div className="absolute top-2.5 right-2.5 z-30 flex items-center gap-1.5">
                      <button
                        onClick={() => toggleCompare(prod.id)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all shadow-md backdrop-blur-md",
                          isCompared 
                            ? "bg-cyan-500 text-black border-cyan-400 font-extrabold"
                            : "bg-zinc-950/90 text-white border-zinc-800 hover:bg-black"
                        )}
                        title="Compare specifications"
                      >
                        Compare
                      </button>
                      <button
                        onClick={() => toggleWishlist(prod.id)}
                        className="p-1.5 rounded-lg bg-zinc-950/90 border border-zinc-800 text-white hover:text-red-400 transition-colors shadow-md backdrop-blur-md"
                        aria-label="Add to Wishlist"
                      >
                        <Heart className={cn("h-3.5 w-3.5", isWishlisted && "fill-red-500 text-red-500")} />
                      </button>
                    </div>

                    {/* Automatic Image Slider Container (z-10) */}
                    <Link href={`/accessories/${prod.id}`} className="block w-full h-full cursor-pointer">
                      <ProductCardImageSlider
                        image={prod.image}
                        images={prod.images}
                        name={prod.name}
                        priority={idx < 6}
                      />
                    </Link>
                  </div>

                  {/* Product details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{prod.brand}</span>
                      <div className="flex items-center text-amber-500 text-[10px] font-bold">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500 mr-0.5" />
                        {prod.rating}
                      </div>
                    </div>
                    
                    {/* Title links to detailed dynamic product page */}
                    <Link href={`/accessories/${prod.id}`} className="block">
                      <h3 className="text-sm font-bold text-foreground group-hover:text-cyan-500 transition-colors line-clamp-1">{prod.name}</h3>
                    </Link>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed h-8">{prod.description}</p>
                  </div>

                  {/* Pricing & Checkout trigger */}
                  <div className="flex items-center justify-between mt-5 border-t border-border/40 pt-4 gap-2">
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-extrabold text-foreground">{formatINR(prod.price)}</span>
                        {prod.originalPrice && prod.originalPrice > prod.price && (
                          <span className="text-[10px] text-muted-foreground line-through font-semibold">
                            {formatINR(prod.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenQuickView(prod)}
                        className="p-2 rounded-xl bg-muted border border-border/80 text-muted-foreground hover:text-foreground"
                        title="Quick View Specifications"
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </button>

                      {prod.inStock === false ? (
                        <button
                          disabled
                          className="px-3.5 py-2.5 rounded-xl bg-muted border border-border/60 text-muted-foreground font-bold text-[10px] cursor-not-allowed opacity-60"
                        >
                          Out of Stock
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(prod)}
                          className="px-4 py-2.5 rounded-xl bg-foreground text-background font-bold text-[10px] flex items-center gap-1 hover:opacity-90 transition-opacity"
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Progressive Load More Controls */}
          {visibleCount < sortedProducts.length && (
            <div className="flex flex-col items-center justify-center pt-6 pb-2 space-y-3 border-t border-border/40">
              <p className="text-xs text-muted-foreground font-medium">
                Showing <span className="font-bold text-foreground">{Math.min(visibleCount, sortedProducts.length)}</span> of <span className="font-bold text-foreground">{sortedProducts.length}</span> accessories
              </p>
              <button
                onClick={() => setVisibleCount((prev) => prev + 12)}
                className="px-6 py-3 rounded-2xl bg-foreground text-background font-bold text-xs hover:opacity-90 transition-all shadow-md active:scale-95"
              >
                Load More Accessories
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty State with FormSubmit Customer Request Form */}
      {!isLoading && sortedProducts.length === 0 && (
        <div className="text-center py-12 bg-muted/20 border border-border rounded-3xl space-y-6 px-4 max-w-2xl mx-auto shadow-sm">
          <Smartphone className="h-12 w-12 text-emerald-500 mx-auto opacity-80" />
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">
              {products.length === 0 
                ? "No accessories available yet" 
                : `No accessories found for ${selectedBrand} ${selectedModel || ""} yet.`}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Can&apos;t find an accessory for your specific phone model? Request custom covers, tempered glass guards, chargers, or batteries for any model. We will stock it for you within 24-48 hours!
            </p>
          </div>

          {/* FormSubmit.co Inline Request Form */}
          <form
            action="https://formsubmit.co/chintanmaheshwari714@gmail.com"
            method="POST"
            className="p-5 rounded-2xl bg-card border border-border text-left space-y-3 shadow-md"
          >
            <input type="hidden" name="_subject" value={`Product Request for ${selectedBrand} ${selectedModel}`} />
            <input type="hidden" name="_captcha" value="false" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phone Brand *</label>
                <input
                  type="text"
                  name="brand"
                  defaultValue={selectedBrand}
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-xs text-foreground font-medium"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phone Model *</label>
                <input
                  type="text"
                  name="phone_model"
                  defaultValue={selectedModel}
                  placeholder="e.g. iPhone 16 Pro, S24 Ultra"
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-xs text-foreground font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Customer Name"
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-xs text-foreground font-medium"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">WhatsApp / Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="10-digit Mobile No."
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-xs text-foreground font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Product / Accessory Needed *</label>
              <input
                type="text"
                name="product_type"
                placeholder="e.g. Shockproof Case, 9H Tempered Glass, Fast Charger..."
                className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-xs text-foreground font-medium"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Submit Product Request</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenRequestModal(selectedBrand, selectedModel, category !== "all" ? category : "")}
                className="py-3 px-4 rounded-xl bg-muted hover:bg-border text-foreground font-bold text-xs transition-colors cursor-pointer"
              >
                Open Full Modal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FLOATING COMPARE BAR */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-950/95 border border-zinc-800 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-6 max-w-lg w-[90%] animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Compare ({compareIds.length})</span>
            <div className="flex gap-1">
              {compareProductsList.map(p => (
                <div key={p.id} className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center flex-shrink-0 relative">
                  <img src={p.image} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/shop_accessories.png'; }} />
                  <button onClick={() => toggleCompare(p.id)} className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-black text-white rounded-full p-0.5">
                    <X className="h-2 w-2" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCompareIds([])} className="text-[10px] text-zinc-400 font-bold hover:text-white">Clear</button>
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-bold text-[10px]"
            >
              Compare Specs
            </button>
          </div>
        </div>
      )}

      {/* 10. RECENTLY VIEWED PRODUCTS CAROUSEL */}
      {recentlyViewedProductsList.length > 0 && (
        <section className="border-t border-border/40 pt-10 mt-10">
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-1">
            <Clock className="h-4 w-4 text-cyan-500" />
            Recently Viewed Accessories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recentlyViewedProductsList.map(p => (
              <Link href={`/accessories/${p.id}`} key={p.id} className="p-3 bg-card border border-border/80 rounded-xl hover:border-cyan-500/20 transition-all flex items-center gap-3 group">
                <div className="h-10 w-10 rounded-lg bg-muted border border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <img src={p.image} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/shop_accessories.png'; }} />
                </div>
                <div className="truncate">
                  <h4 className="text-[11px] font-bold text-foreground truncate group-hover:text-cyan-500 transition-colors">{p.name}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{formatINR(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* MODAL: Compare Specifications */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-card border border-border rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Accessory Comparison Grid</h3>
              <button onClick={() => setIsCompareModalOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <div className="grid grid-cols-4 gap-4 text-xs min-w-[400px]">
                <div className="font-bold text-muted-foreground border-r border-border/40 p-2 flex items-center">Feature</div>
                {compareProductsList.map(p => (
                  <div key={p.id} className="p-2 border border-border/40 rounded-xl bg-muted/20 text-center space-y-2">
                    <img src={p.image} alt="" className="h-12 w-12 rounded-lg object-cover mx-auto" onError={(e) => { e.currentTarget.src = '/shop_accessories.png'; }} />
                    <p className="font-bold text-foreground truncate">{p.name}</p>
                  </div>
                ))}
                {[...Array(3 - compareProductsList.length)].map((_, i) => <div key={i} className="bg-transparent" />)}

                {/* Price */}
                <div className="font-bold text-muted-foreground border-r border-border/40 p-2">Price</div>
                {compareProductsList.map(p => <div key={p.id} className="p-2 font-extrabold text-foreground text-center">{formatINR(p.price)}</div>)}
                {[...Array(3 - compareProductsList.length)].map((_, i) => <div key={i} className="bg-transparent" />)}

                {/* Brand */}
                <div className="font-bold text-muted-foreground border-r border-border/40 p-2">Brand</div>
                {compareProductsList.map(p => <div key={p.id} className="p-2 text-center text-muted-foreground font-medium">{p.brand}</div>)}
                {[...Array(3 - compareProductsList.length)].map((_, i) => <div key={i} className="bg-transparent" />)}

                {/* Rating */}
                <div className="font-bold text-muted-foreground border-r border-border/40 p-2">Rating</div>
                {compareProductsList.map(p => <div key={p.id} className="p-2 text-center text-foreground font-bold flex items-center justify-center gap-1"><Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {p.rating}</div>)}
                {[...Array(3 - compareProductsList.length)].map((_, i) => <div key={i} className="bg-transparent" />)}

                {/* Category */}
                <div className="font-bold text-muted-foreground border-r border-border/40 p-2">Category</div>
                {compareProductsList.map(p => <div key={p.id} className="p-2 text-center text-muted-foreground">{p.category}</div>)}
                {[...Array(3 - compareProductsList.length)].map((_, i) => <div key={i} className="bg-transparent" />)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK VIEW MODAL (OLD SPEC SHEET) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">{selectedProduct.brand}</span>
                <h3 className="text-base font-bold text-foreground mt-0.5">{selectedProduct.name}</h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 rounded-lg bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Product Sliding Images Carousel */}
            <div className="relative h-64 w-full rounded-2xl bg-muted overflow-hidden flex items-center justify-center border border-border/80 group/carousel">
              {(() => {
                const productImages = selectedProduct.images || [];
                if (productImages.length > 0) {
                  return (
                    <>
                      <img
                        src={productImages[activeImageIndex]}
                        alt={`${selectedProduct.name} View ${activeImageIndex + 1}`}
                        className="w-full h-full object-cover transition-all duration-300"
                        onError={(e) => { e.currentTarget.src = '/placeholder_acc.png'; }}
                      />
                      
                      {/* Left Arrow */}
                      {productImages.length > 1 && (
                        <button
                          onClick={() => setActiveImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1))}
                          className="absolute left-3 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                        >
                          <ChevronLeft className="h-4.5 w-4.5" />
                        </button>
                      )}
                      {/* Right Arrow */}
                      {productImages.length > 1 && (
                        <button
                          onClick={() => setActiveImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1))}
                          className="absolute right-3 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                        >
                          <ChevronRight className="h-4.5 w-4.5" />
                        </button>
                      )}
                      {/* Indicators */}
                      {productImages.length > 1 && (
                        <div className="absolute bottom-3 flex gap-1.5">
                          {productImages.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveImageIndex(idx)}
                              className={cn(
                                "h-2 w-2 rounded-full transition-all",
                                activeImageIndex === idx ? "bg-cyan-500 w-4" : "bg-white/40"
                              )}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  );
                }
                return <Smartphone className="h-16 w-16 text-muted-foreground opacity-50" />;
              })()}
            </div>

            {/* Description */}
            <div className="text-xs text-muted-foreground leading-relaxed">
              <p className="font-semibold text-foreground">Overview</p>
              <p className="mt-1">{selectedProduct.description || "No product overview details listed."}</p>
            </div>

            {/* Technical Specifications */}
            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-xs font-bold text-foreground">Technical Specifications</p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                  <div key={key} className="p-2 bg-muted/30 border border-border/40 rounded-xl">
                    <span className="text-muted-foreground block font-medium">{key}</span>
                    <span className="text-foreground font-semibold block mt-0.5">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Buy now direct links */}
            <div className="flex gap-2 justify-end pt-4 border-t border-border mt-4">
              <Link
                href={`/accessories/${selectedProduct.id}`}
                className="px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground font-bold text-xs"
              >
                Full Product Page
              </Link>
              <button
                onClick={() => {
                  handleAddToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs flex items-center gap-1 hover:bg-cyan-400"
              >
                <ShoppingBag className="h-4 w-4" />
                Add to Cart {formatINR(selectedProduct.price)}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal: Product Request */}
      <ProductRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        initialBrand={requestModalParams.brand}
        initialModel={requestModalParams.model}
        initialProductType={requestModalParams.productType}
      />

    </div>
  );
}

export default function AccessoriesClient({ initialProducts }: { initialProducts?: AccessoryProduct[] }) {
  if (initialProducts && initialProducts.length > 0 && !cachedProductsList) {
    cachedProductsList = initialProducts;
  }
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AccessoriesContent initialProducts={initialProducts} />
    </Suspense>
  );
}
