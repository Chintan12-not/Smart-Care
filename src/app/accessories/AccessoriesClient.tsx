"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Percent,
  Plus,
  Zap,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowUpDown,
  X,
  PhoneCall,
  Clock,
  Loader2
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { AccessoryProduct, fetchAccessoriesFromSupabase } from "@/lib/accessories";
import { formatINR, cn } from "@/lib/utils";
import PhoneModelFinder from "@/components/accessories/PhoneModelFinder";
import ProductCardImageSlider from "@/components/accessories/ProductCardImageSlider";
import ProductRequestModal from "@/components/accessories/ProductRequestModal";
import { isProductCompatibleWithModel } from "@/lib/compatibility";

interface AccessoriesClientProps {
  initialProducts?: AccessoryProduct[];
  initialTotalCount?: number;
  initialHasMore?: boolean;
}

export default function AccessoriesClient({ 
  initialProducts = [],
  initialTotalCount = 0,
  initialHasMore = false
}: AccessoriesClientProps) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  
  const queryBrand = searchParams.get("brand") || "";
  const queryModel = searchParams.get("model") || "";
  const queryCategory = searchParams.get("category") || "all";
  const queryQ = searchParams.get("q") || "";

  // Filter & Search states
  const [selectedBrand, setSelectedBrand] = useState<string>(queryBrand || "Apple");
  const [selectedModel, setSelectedModel] = useState<string>(queryModel || "");
  const [search, setSearch] = useState<string>(queryQ || "");
  const [category, setCategory] = useState<string>(queryCategory || "all");
  const [sortBy, setSortBy] = useState<string>("default");

  // Product List & Pagination states
  const [products, setProducts] = useState<AccessoryProduct[]>(initialProducts);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount || initialProducts.length);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Synchronize URL search params
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

  // Primary Database Query Runner (Handles Brand, Model, Category, Search, Sort & Pagination)
  const executeQuery = useCallback(async (
    targetPage: number,
    brandVal: string,
    modelVal: string,
    catVal: string,
    searchVal: string,
    sortVal: string,
    append: boolean = false
  ) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const res = await fetchAccessoriesFromSupabase({
        page: targetPage,
        pageSize: 24,
        brand: brandVal,
        model: modelVal,
        category: catVal,
        search: searchVal,
        sortBy: sortVal
      });

      // Apply strict boundary compatibility filter on returned items
      const compatibleBatch = res.products.filter(p => isProductCompatibleWithModel(p, brandVal, modelVal));

      if (append) {
        setProducts(prev => {
          const seen = new Set(prev.map(p => p.id));
          const newItems = compatibleBatch.filter(p => !seen.has(p.id));
          return [...prev, ...newItems];
        });
      } else {
        setProducts(compatibleBatch);
      }

      setHasMore(res.hasMore);
      setTotalCount(res.totalCount);
      setPage(targetPage);
    } catch (err) {
      console.error("Error fetching accessories from Supabase:", err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Trigger Supabase query when filters or selected model change
  const isInitialMount = React.useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Skip query on initial mount if server already provided initial products and no model/filter override
      if (initialProducts.length > 0 && !queryModel && category === "all" && !search) {
        return;
      }
    }
    executeQuery(0, selectedBrand, selectedModel, category, search, sortBy, false);
  }, [selectedBrand, selectedModel, category, search, sortBy, executeQuery]);

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;
    executeQuery(page + 1, selectedBrand, selectedModel, category, search, sortBy, true);
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

  // LocalStorage Hydration
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedWishlist = localStorage.getItem("sc_wishlist");
      if (savedWishlist) {
        try { setWishlist(JSON.parse(savedWishlist)); } catch (e) {}
      }
      
      const savedRecent = localStorage.getItem("sc_recently_viewed");
      if (savedRecent) {
        try { setRecentlyViewedIds(JSON.parse(savedRecent)); } catch (e) {}
      }
    }
  }, []);

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

  const trackRecentlyViewed = (id: string) => {
    const updated = [id, ...recentlyViewedIds.filter((item) => item !== id)].slice(0, 4);
    setRecentlyViewedIds(updated);
    localStorage.setItem("sc_recently_viewed", JSON.stringify(updated));
  };

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

  const handleOpenQuickView = (product: AccessoryProduct) => {
    setSelectedProduct(product);
    trackRecentlyViewed(product.id);
  };

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
    
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("open-cart-drawer"));
    }
  };

  // Final List Filtering for Display (guarantees boundary compliance)
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Stage 1: Compatibility Check
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

      // Stage 3: Search Text Filter
      if (!search.trim()) return true;

      const sLower = search.toLowerCase().trim();
      const prodCorpus = [
        prod.name,
        prod.brand,
        prod.category,
        prod.description || "",
        prod.specifications ? JSON.stringify(prod.specifications) : ""
      ].join(" ").toLowerCase();

      return prodCorpus.includes(sLower);
    });
  }, [products, selectedBrand, selectedModel, category, search]);

  const categoriesList = ["All", "Chargers", "Cables", "Tempered Glass", "Cases", "Earbuds", "Power Banks"];

  const compareProductsList = useMemo(() => {
    return products.filter(p => compareIds.includes(p.id));
  }, [products, compareIds]);

  const recentlyViewedProductsList = useMemo(() => {
    return products.filter(p => recentlyViewedIds.includes(p.id));
  }, [products, recentlyViewedIds]);

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

      {/* Product Grid & Loading States */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 border border-border space-y-4 animate-pulse">
              <div className="aspect-square w-full rounded-xl bg-muted" />
              <div className="h-4 w-2/3 bg-muted rounded" />
              <div className="h-4 w-1/3 bg-muted rounded" />
              <div className="h-10 w-full bg-muted rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredProducts.map((prod, idx) => {
              const isWishlisted = wishlist.includes(prod.id);
              const isCompared = compareIds.includes(prod.id);

              return (
                <div key={prod.id} className="glass-card rounded-2xl p-5 border border-border flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative group">
                  
                  {/* Product Image Container with Badges & Action Buttons */}
                  <div className="relative mb-4">
                    
                    {/* Badges */}
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

                    {/* Wishlist & Compare float buttons */}
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

                    {/* Image Slider */}
                    <Link href={`/accessories/${prod.id}`} className="block w-full cursor-pointer">
                      <ProductCardImageSlider
                        image={prod.image}
                        images={prod.images}
                        name={prod.name}
                        priority={idx < 4}
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

          {/* Database Pagination / Load More */}
          {hasMore && (
            <div className="flex flex-col items-center justify-center pt-6 pb-2 space-y-3 border-t border-border/40">
              <p className="text-xs text-muted-foreground font-medium">
                Showing <span className="font-bold text-foreground">{filteredProducts.length}</span> accessories
              </p>
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-6 py-3 rounded-2xl bg-foreground text-background font-bold text-xs hover:opacity-90 transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading Next Batch...</span>
                  </>
                ) : (
                  <span>Load More Accessories</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-muted/20 border border-border rounded-3xl space-y-6 px-4 max-w-2xl mx-auto shadow-sm">
          <Smartphone className="h-12 w-12 text-emerald-500 mx-auto opacity-80" />
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">
              No compatible accessories found for {selectedBrand} {selectedModel || ""}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              We don&apos;t have pre-listed accessories for this exact model right now. Request custom covers, tempered glass guards, chargers, or batteries and we will arrange it for you!
            </p>
          </div>

          <button
            onClick={() => handleOpenRequestModal(selectedBrand, selectedModel, category !== "all" ? category : "")}
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Request Accessory for {selectedBrand} {selectedModel}</span>
          </button>
        </div>
      )}

      {/* Recently Viewed Products */}
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

      {/* Modals */}
      {isRequestModalOpen && (
        <ProductRequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          initialBrand={requestModalParams.brand}
          initialModel={requestModalParams.model}
          initialProductType={requestModalParams.productType}
        />
      )}

      {/* Quick View Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="aspect-square rounded-2xl bg-white p-3 border border-border flex items-center justify-center">
                <img src={selectedProduct.image} alt="" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="space-y-3 text-xs">
                <p className="text-muted-foreground leading-relaxed">{selectedProduct.description}</p>
                <div className="text-lg font-extrabold text-foreground">{formatINR(selectedProduct.price)}</div>
                
                <div className="space-y-1 border-t border-border pt-2">
                  <h4 className="font-bold text-foreground uppercase text-[10px] tracking-wider">Specifications</h4>
                  {Object.entries(selectedProduct.specifications || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1 border-b border-border/40 text-[11px]">
                      <span className="text-muted-foreground font-medium">{key}</span>
                      <span className="font-bold text-foreground text-right">{value}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    handleAddToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Compare Bar */}
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
    </div>
  );
}
