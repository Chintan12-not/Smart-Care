"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
import { MOCK_ACCESSORIES, AccessoryProduct } from "@/lib/accessories";
import { formatINR, cn } from "@/lib/utils";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function AccessoriesPage() {
  const { addToCart } = useCart();
  
  // Search & Filter states
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  
  // Interactive feature states
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<AccessoryProduct | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedItemName, setAddedItemName] = useState("");
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Supabase items
  const [products, setProducts] = useState<AccessoryProduct[]>(
    isSupabaseConfigured() ? [] : MOCK_ACCESSORIES
  );
  const [isLoading, setIsLoading] = useState(false);

  // 1. Initial LocalStorage Hydration
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

  // 2. Fetch products from Supabase
  useEffect(() => {
    async function loadProducts() {
      if (!isSupabaseConfigured()) {
        console.log("Supabase not configured, using mock accessories.");
        return;
      }
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("accessories")
          .select("*")
          .eq("is_active", true);

        if (error) throw error;
        
        if (data && data.length > 0) {
          const mapped: AccessoryProduct[] = data.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            brand: item.brand,
            price: Number(item.price),
            rating: Number(item.rating_avg || 4.5),
            reviewsCount: Number(item.reviews_count || 10),
            image: (item.images && item.images.length > 0) ? item.images[0] : "/placeholder_acc.png",
            images: item.images || [],
            specifications: item.specifications || {},
            description: item.description || ""
          }));
          setProducts(mapped);
        } else {
          // Supabase table is empty - use mock accessories as fallback
          console.log("Accessories table is empty, using mock products.");
          setProducts(MOCK_ACCESSORIES);
        }
      } catch (err) {
        console.error("Error loading products from Supabase:", err);
        // Fallback to mock accessories on any error
        setProducts(MOCK_ACCESSORIES);
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
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

  // 8. Filters & Search matching
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = 
      prod.name.toLowerCase().includes(search.toLowerCase()) ||
      prod.brand.toLowerCase().includes(search.toLowerCase()) ||
      prod.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = 
      category === "all" || 
      prod.category.toLowerCase() === category.toLowerCase();

    return matchesSearch && matchesCategory;
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
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Smartphone className="h-7 w-7 text-cyan-500" />
            Premium Accessories Store
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Stripe-inspired e-commerce portal carrying genuine protective covers, high-speed wall chargers, and drop-proof cases.
          </p>
        </div>
        
        {/* Banner notification */}
        {addedItemName && (
          <div className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-300">
            <Check className="h-4 w-4" />
            <span>Added {addedItemName.substring(0, 15)}... to cart</span>
          </div>
        )}
      </div>

      {/* Catalog Search, Category Tabs, and Sorting Controls */}
      <div className="glass-card rounded-2xl p-5 border border-border flex flex-col lg:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search chargers, cases, brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-muted border border-border rounded-xl py-3 pl-11 pr-4 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        {/* Categories scroll tabs */}
        <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat.toLowerCase())}
              className={cn(
                "px-3.5 py-1.5 rounded-full border text-[11px] font-semibold whitespace-nowrap transition-all duration-200",
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
            className="bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 select-none"
          >
            <option value="default">Default Sorting</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Rating: High to Low</option>
          </select>
        </div>
      </div>

      {/* Loading Skeletons */}
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
        /* Product Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {sortedProducts.map((prod) => {
            const isWishlisted = wishlist.includes(prod.id);
            const isCompared = compareIds.includes(prod.id);
            const discountPercent = prod.id === "acc-7" ? "50% Off" : null;

            return (
              <div key={prod.id} className="glass-card rounded-2xl p-5 border border-border flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative group">
                
                {/* Wishlist and Compare float buttons */}
                <div className="absolute top-7 right-7 z-10 flex gap-2">
                  <button
                    onClick={() => toggleCompare(prod.id)}
                    className={cn(
                      "p-1.5 rounded-lg border text-[10px] font-bold transition-all shadow-sm",
                      isCompared 
                        ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/30"
                        : "bg-background/80 text-muted-foreground border-border/80 hover:text-foreground"
                    )}
                    title="Compare specifications"
                  >
                    Compare
                  </button>
                  <button
                    onClick={() => toggleWishlist(prod.id)}
                    className="p-1.5 rounded-lg bg-background/80 border border-border/80 text-muted-foreground hover:text-red-500 transition-colors shadow-sm"
                    aria-label="Add to Wishlist"
                  >
                    <Heart className={cn("h-4 w-4", isWishlisted && "fill-red-500 text-red-500")} />
                  </button>
                </div>

                {/* Product Visual */}
                <div className="h-44 w-full rounded-xl bg-muted/40 border border-border/40 overflow-hidden flex items-center justify-center relative mb-4 group-hover:border-cyan-500/20 transition-all duration-300">
                  {discountPercent && (
                    <span className="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-lg bg-red-500 text-white text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-0.5 z-10 animate-pulse">
                      <Percent className="h-3 w-3" /> {discountPercent}
                    </span>
                  )}
                  
                  {prod.image && (prod.id === "acc-7" || prod.image.startsWith("/")) ? (
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-purple-500/10 flex items-center justify-center w-full h-full">
                      {prod.category === "Chargers" && <Zap className="h-10 w-10 text-cyan-400 opacity-60" />}
                      {prod.category === "Cables" && <Smartphone className="h-10 w-10 text-cyan-400 opacity-60" />}
                      {prod.category === "Tempered Glass" && <ShieldCheck className="h-10 w-10 text-emerald-400 opacity-60" />}
                      {prod.category === "Cases" && <Smartphone className="h-10 w-10 text-cyan-400 opacity-60" />}
                      {prod.category === "Earbuds" && <Star className="h-10 w-10 text-purple-400 opacity-60" />}
                      {prod.category === "Power Banks" && <Zap className="h-10 w-10 text-cyan-400 opacity-60" />}
                    </div>
                  )}
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
                    <span className="text-sm font-extrabold text-foreground">{formatINR(prod.price)}</span>
                    {discountPercent && <span className="text-[9px] text-muted-foreground line-through">₹399</span>}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenQuickView(prod)}
                      className="p-2 rounded-xl bg-muted border border-border/80 text-muted-foreground hover:text-foreground"
                      title="Quick View Specifications"
                    >
                      <Eye className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => handleAddToCart(prod)}
                      className="px-4 py-2.5 rounded-xl bg-foreground text-background font-bold text-[10px] flex items-center gap-1 hover:opacity-90 transition-opacity"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      Add to Cart
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && sortedProducts.length === 0 && (
        <div className="text-center py-20 bg-muted/20 border border-border rounded-3xl space-y-3">
          <Smartphone className="h-10 w-10 text-muted-foreground mx-auto animate-pulse" />
          <h3 className="font-bold text-foreground">
            {products.length === 0 ? "Products coming soon" : "No accessories match search terms"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {products.length === 0 ? "We are currently updating our stock list. Please visit again soon!" : "Try clearing filters or search box query."}
          </p>
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
                  <img src={p.image} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder_acc.png'; }} />
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
                  <img src={p.image} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder_acc.png'; }} />
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
          <div className="w-full max-w-3xl bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Accessory Comparison Grid</h3>
              <button onClick={() => setIsCompareModalOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-4 text-xs">
              <div className="font-bold text-muted-foreground border-r border-border/40 p-2 flex items-center">Feature</div>
              {compareProductsList.map(p => (
                <div key={p.id} className="p-2 border border-border/40 rounded-xl bg-muted/20 text-center space-y-2">
                  <img src={p.image} alt="" className="h-12 w-12 rounded-lg object-cover mx-auto" onError={(e) => { e.currentTarget.src = '/placeholder_acc.png'; }} />
                  <p className="font-bold text-foreground truncate">{p.name}</p>
                </div>
              ))}
              {/* Fill remaining empty cells */}
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

    </div>
  );
}
