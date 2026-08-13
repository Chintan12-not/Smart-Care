"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ShoppingBag, 
  Star, 
  Check, 
  Truck, 
  ShieldAlert, 
  MessageSquare, 
  Heart, 
  Share2, 
  Smartphone, 
  Zap, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  RefreshCw,
  PhoneCall,
  Plus,
  Minus,
  Lock,
  UserCheck,
  Building2
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { MOCK_ACCESSORIES, AccessoryProduct } from "@/lib/accessories";
import { formatINR, cn } from "@/lib/utils";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

interface ProductDetailClientProps {
  id: string;
}

export default function ProductDetailClient({ id: productId }: ProductDetailClientProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<AccessoryProduct | null>(null);
  const [productsList, setProductsList] = useState<AccessoryProduct[]>(MOCK_ACCESSORIES);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedMessage, setAddedMessage] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const [compatibilityModel, setCompatibilityModel] = useState("");
  const [isCompatible, setIsCompatible] = useState<boolean | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specifications" | "reviews" | "shipping">("description");

  // Load wishlist status
  useEffect(() => {
    if (productId && typeof window !== "undefined") {
      const savedWishlist = localStorage.getItem("sc_wishlist");
      if (savedWishlist) {
        try {
          const parsed = JSON.parse(savedWishlist);
          setIsWishlisted(parsed.includes(productId));
        } catch (e) {}
      }
    }
  }, [productId]);

  // Fetch product details
  useEffect(() => {
    async function fetchProduct() {
      if (!productId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      
      let localCustomItems: AccessoryProduct[] = [];
      if (typeof window !== "undefined") {
        const local = localStorage.getItem("sc_custom_accessories");
        if (local) {
          try { localCustomItems = JSON.parse(local); } catch (e) {}
        }
      }

      const allLocal = [...localCustomItems, ...MOCK_ACCESSORIES];
      const localFound = allLocal.find(p => String(p.id).toLowerCase() === String(productId).toLowerCase());
      if (localFound) {
        setProduct(localFound);
      }
      setProductsList(allLocal);

      if (isSupabaseConfigured()) {
        try {
          // Query single item directly by ID
          const { data: dbData } = await supabase
            .from("accessories")
            .select("*")
            .eq("id", productId)
            .maybeSingle();

          if (dbData) {
            const mappedProduct: AccessoryProduct = {
              id: dbData.id,
              name: dbData.name,
              category: dbData.category,
              brand: dbData.brand,
              price: Number(dbData.price),
              originalPrice: dbData.original_price ?? (dbData.specifications?.original_price ? parseFloat(dbData.specifications.original_price) : null),
              inStock: dbData.in_stock ?? (dbData.specifications?.in_stock !== undefined ? dbData.specifications.in_stock === "true" : true),
              isOnSale: dbData.is_on_sale ?? (dbData.specifications?.is_on_sale !== undefined ? dbData.specifications.is_on_sale === "true" : false),
              rating: Number(dbData.rating_avg || 4.7),
              reviewsCount: Number(dbData.reviews_count || 24),
              image: (dbData.images && dbData.images.length > 0) ? dbData.images[0] : "/shop_accessories.png",
              images: dbData.images || [],
              specifications: dbData.specifications || {},
              description: dbData.description || ""
            };
            setProduct(mappedProduct);
          }

          // Fetch all items for related products list
          const { data: allData } = await supabase.from("accessories").select("*").eq("is_active", true);
          if (allData && allData.length > 0) {
            const mappedAll = allData.map(item => ({
              id: item.id,
              name: item.name,
              category: item.category,
              brand: item.brand,
              price: Number(item.price),
              originalPrice: item.original_price ?? (item.specifications?.original_price ? parseFloat(item.specifications.original_price) : null),
              inStock: item.in_stock ?? (item.specifications?.in_stock !== undefined ? item.specifications.in_stock === "true" : true),
              isOnSale: item.is_on_sale ?? (item.specifications?.is_on_sale !== undefined ? item.specifications.is_on_sale === "true" : false),
              rating: Number(item.rating_avg || 4.7),
              reviewsCount: Number(item.reviews_count || 24),
              image: (item.images && item.images.length > 0) ? item.images[0] : "/shop_accessories.png",
              images: item.images || [],
              specifications: item.specifications || {},
              description: item.description || ""
            }));
            const combined = [...localCustomItems, ...mappedAll];
            const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
            setProductsList(unique);
            
            if (!dbData) {
              const fallbackFound = unique.find(p => String(p.id).toLowerCase() === String(productId).toLowerCase());
              if (fallbackFound) setProduct(fallbackFound);
            }
          }
        } catch (err) {
          console.error("Error loading product from Supabase:", err);
        }
      }
      setIsLoading(false);
    }
    fetchProduct();
  }, [productId]);

  // Image Zoom handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(2.2)",
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: "center center",
      transform: "scale(1)",
    });
  };

  // Check Compatibility logic
  const handleCheckCompatibility = () => {
    if (!compatibilityModel.trim() || !product) return;
    const userModel = compatibilityModel.toLowerCase().trim();
    const compatibleList = (
      product.specifications?.["Compatible Phone Models"] || 
      product.specifications?.["Compatible Devices"] || 
      product.specifications?.["Compatible Model"] || 
      ""
    ).toLowerCase();

    const universal = compatibleList.includes("universal") || compatibleList.includes("all model") || compatibleList.includes("all compatible");
    
    if (universal || compatibleList.includes(userModel) || userModel.split(" ").some(part => part.length > 2 && compatibleList.includes(part))) {
      setIsCompatible(true);
    } else {
      setIsCompatible(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Loading Product Details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-background px-4">
        <div className="max-w-md text-center space-y-4">
          <div className="h-16 w-16 bg-muted border border-border rounded-full flex items-center justify-center mx-auto text-muted-foreground">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Product Not Found</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The requested accessory item does not exist, has been deleted, or is unavailable in our store.
          </p>
          <Link href="/accessories" className="inline-block px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl text-xs font-extrabold uppercase tracking-wider transition-colors shadow-md">
            Back to Accessories Store
          </Link>
        </div>
      </div>
    );
  }

  // Calculate pricing elements
  const originalPrice = Math.round(product.price * 2.2);
  const discountPercentage = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  // Toggle wishlist
  const handleToggleWishlist = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sc_wishlist");
      let list = saved ? JSON.parse(saved) : [];
      
      if (isWishlisted) {
        list = list.filter((id: string) => id !== productId);
        setIsWishlisted(false);
      } else {
        list.push(productId);
        setIsWishlisted(true);
        import("canvas-confetti").then((m) => m.default({ particleCount: 40, spread: 30, origin: { y: 0.8 } })).catch(() => {});
      }
      localStorage.setItem("sc_wishlist", JSON.stringify(list));
    }
  };

  // Add to cart
  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      type: "accessory",
      name: product.name,
      price: product.price,
      image: product.image
    }, quantity);
    setAddedMessage(true);
    if (typeof window !== "undefined") {
      import("canvas-confetti").then((m) => m.default({ particleCount: 80, spread: 60 })).catch(() => {});
    }
    setTimeout(() => setAddedMessage(false), 3000);
    
    // Slide open Cart Drawer
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("open-cart-drawer"));
    }
  };

  // Buy Now (Add to cart and go to checkout/billing)
  const handleBuyNow = () => {
    addToCart({
      id: product.id,
      type: "accessory",
      name: product.name,
      price: product.price,
      image: product.image
    }, quantity);
    
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
    }
    router.push("/billing");
  };

  // Get other products from the store (excluding the current one)
  const otherProducts = productsList
    .filter(p => p.id !== product.id)
    .slice(0, 6);

  // WhatsApp Order payload
  const whatsappNumber = "919289942313";
  const whatsappText = `Hello Smart Care! I would like to order this accessory item:
*Product*: ${product.name}
*Price*: ${formatINR(product.price)}
*Quantity*: ${quantity}
*URL*: https://smartcaremobile.in/accessories/${product.id}`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`;

  // Product Images Array compiled
  const displayImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];

  // Auto slideshow timer for product gallery images
  useEffect(() => {
    if (displayImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % displayImages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [displayImages]);

  const [shareSuccessToast, setShareSuccessToast] = useState(false);

  const handleShareProduct = async () => {
    const url = typeof window !== "undefined" ? window.location.href : `https://smartcaremobile.in/accessories/${product.id}`;
    const shareData = {
      title: product.name,
      text: `${product.name} at Smart Care & Mobile Point Gurugram`,
      url: url,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {}
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setShareSuccessToast(true);
        setTimeout(() => setShareSuccessToast(false), 2500);
      } catch (err) {}
    }
  };

  // Mock Reviews data
  const mockReviews = [
    { name: "Rahul Verma", rating: 5, date: "12 May 2026", text: "Amazing quality product! Completely transparent and genuine material. Worth every rupee." },
    { name: "Sneha Sharma", rating: 4, date: "28 April 2026", text: "Perfect fit for my device. High safety protection and premium finish. Recommended!" },
    { name: "Amit Yadav", rating: 5, date: "15 April 2026", text: "Ordered on WhatsApp and got same day delivery in Sector 37C Gurugram. Fits beautifully!" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Top Breadcrumbs & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
        <Link 
          href="/accessories" 
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Accessories Catalog</span>
        </Link>

        <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/accessories" className="hover:text-foreground">Accessories</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-cyan-400 truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      {/* Main Product Column split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Premium Gallery (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div 
            className="relative h-96 sm:h-[480px] w-full rounded-3xl overflow-hidden flex items-center justify-center border border-white/20 cursor-zoom-in group shadow-md bg-white p-3 sm:p-5"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={displayImages[activeImageIndex]}
              alt={product.name}
              style={zoomStyle}
              className="w-full h-full object-contain z-10 transition-transform duration-100 rounded-2xl"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/shop_accessories.png'; }}
            />
            
            {/* Hover to zoom badge */}
            <span className="absolute bottom-4 left-4 z-20 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-wider">
              Hover to Zoom
            </span>

            {/* Sale label bubble */}
            <span className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-red-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
              Sale
            </span>
          </div>

          {/* Thumbnails row */}
          {displayImages.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto py-1 no-scrollbar">
              {displayImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={cn(
                    "h-16 w-16 rounded-xl border-2 overflow-hidden bg-white flex items-center justify-center flex-shrink-0 transition-all",
                    activeImageIndex === idx ? "border-cyan-500 scale-102 shadow-sm" : "border-white/20 hover:border-cyan-500/30"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-contain p-1 rounded-lg" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/shop_accessories.png'; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: checkout and description panel (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Header Details */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-500 text-[10px] font-extrabold uppercase tracking-wider">
                  {product.brand} • {product.category}
                </span>
                <button
                  onClick={handleShareProduct}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-card border border-border text-muted-foreground hover:text-cyan-400 hover:border-cyan-500/40 text-[11px] font-bold transition-all shadow-sm"
                  title="Share product link"
                >
                  <Share2 className="h-3.5 w-3.5 text-cyan-500" />
                  <span>Share</span>
                </button>
              </div>
              
              <div className="flex items-center gap-1.5 text-xs">
                <div className="flex text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <Star className="h-3.5 w-3.5 fill-current opacity-60" />
                </div>
                <span className="font-bold text-foreground">{product.rating}</span>
                <span className="text-muted-foreground text-[10px] font-medium">({product.reviewsCount} reviews)</span>
              </div>
            </div>

            {/* Share Toast */}
            {shareSuccessToast && (
              <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
                <Check className="h-4 w-4 text-cyan-500" />
                <span>Product link copied to clipboard!</span>
              </div>
            )}

            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight leading-tight">{product.name}</h1>
            
            {/* Line-by-Line Bullet Point Description */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              {(product.description || "")
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean)
                .map((line, idx) => {
                  const parts = line.split(":");
                  if (parts.length > 1) {
                    const titlePart = parts[0].replace(/^[•\*\-\s]+/, "").trim();
                    const bodyPart = parts.slice(1).join(":").trim();
                    return (
                      <div key={idx} className="flex items-start gap-2 text-xs leading-relaxed">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 flex-shrink-0 mt-2" />
                        <p className="text-foreground font-medium">
                          <strong className="text-cyan-400 font-extrabold uppercase tracking-wide mr-1.5">{titlePart}:</strong>
                          <span className="text-muted-foreground">{bodyPart}</span>
                        </p>
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="flex items-start gap-2 text-xs leading-relaxed">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 flex-shrink-0 mt-2" />
                      <p className="text-muted-foreground font-medium">{line}</p>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-2 shadow-sm">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {formatINR(product.price)}
              </span>
              {originalPrice > product.price && (
                <>
                  <span className="text-sm text-muted-foreground line-through font-semibold">
                    {formatINR(originalPrice)}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-extrabold uppercase border border-emerald-500/20">
                    {discountPercentage}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground font-medium">
              Inclusive of all taxes. Free 45-min doorstep delivery available in Sector 37C & Gurugram.
            </p>
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Quantity:</span>
              <div className="flex items-center border border-border rounded-xl bg-card">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="px-3 text-xs font-bold text-foreground">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="w-full py-3.5 rounded-xl bg-card border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20"
              >
                <Zap className="h-4 w-4 fill-current" />
                <span>Buy Now (Instant Checkout)</span>
              </button>
            </div>

            {/* Added to Cart Feedback Banner */}
            {addedMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between animate-in fade-in duration-200">
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  Added {quantity}x item to your shopping cart!
                </span>
                <Link href="/billing" className="underline hover:text-emerald-300 font-extrabold">View Cart</Link>
              </div>
            )}

            {/* WhatsApp Quick Order & Wishlist buttons */}
            <div className="flex gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <PhoneCall className="h-4 w-4" />
                <span>Order via WhatsApp Direct</span>
              </a>

              <button
                onClick={handleToggleWishlist}
                className={cn(
                  "p-3 rounded-xl border transition-all flex items-center justify-center",
                  isWishlisted 
                    ? "bg-red-500/10 border-red-500/40 text-red-500" 
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                )}
                title="Add to Wishlist"
              >
                <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
              </button>
            </div>
          </div>

          {/* Compatibility Checker Box */}
          <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Device Compatibility Checker</h4>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter your phone model (e.g. Galaxy S24, iPhone 15)..."
                value={compatibilityModel}
                onChange={(e) => {
                  setCompatibilityModel(e.target.value);
                  setIsCompatible(null);
                }}
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-background border border-border focus:outline-none focus:border-cyan-500 text-foreground"
              />
              <button
                onClick={handleCheckCompatibility}
                className="px-4 py-2 bg-foreground text-background font-bold text-xs rounded-xl hover:opacity-90 transition-opacity"
              >
                Check
              </button>
            </div>

            {isCompatible === true && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Great news! This accessory is 100% compatible with &quot;{compatibilityModel}&quot;.</span>
              </div>
            )}

            {isCompatible === false && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                <span>May not be exact match. WhatsApp our support at +91 92899 42313 to verify.</span>
              </div>
            )}
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[10px] font-semibold text-muted-foreground border-t border-border/40">
            <div className="p-2.5 rounded-xl bg-card border border-border/60 flex flex-col items-center gap-1">
              <Truck className="h-4 w-4 text-cyan-400" />
              <span>Same Day Pickup</span>
            </div>
            <div className="p-2.5 rounded-xl bg-card border border-border/60 flex flex-col items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>6 Months Warranty</span>
            </div>
            <div className="p-2.5 rounded-xl bg-card border border-border/60 flex flex-col items-center gap-1">
              <RefreshCw className="h-4 w-4 text-amber-400" />
              <span>7 Days Return</span>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs Section: Specifications, Reviews, Description */}
      <section className="border-t border-border/40 pt-8">
        <div className="flex border-b border-border/60 gap-6">
          <button
            onClick={() => setActiveTab("description")}
            className={cn(
              "pb-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-colors",
              activeTab === "description" ? "border-cyan-400 text-cyan-400" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Description & Features
          </button>
          <button
            onClick={() => setActiveTab("specifications")}
            className={cn(
              "pb-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-colors",
              activeTab === "specifications" ? "border-cyan-400 text-cyan-400" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={cn(
              "pb-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1.5",
              activeTab === "reviews" ? "border-cyan-400 text-cyan-400" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <span>Customer Reviews</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-400 text-[9px] font-bold">
              {product.reviewsCount}
            </span>
          </button>
        </div>

        <div className="py-6">
          
          {/* Tab 1: Description */}
          {activeTab === "description" && (
            <div className="space-y-4 max-w-3xl text-xs leading-relaxed text-muted-foreground animate-in fade-in duration-200">
              <p className="text-foreground font-medium">{product.description}</p>
              <p>
                Engineered with high grade materials to provide maximum safety protection for your mobile device. Smart Care & Mobile Point delivers 100% genuine guaranteed accessories across Sector 37C Gurugram.
              </p>
            </div>
          )}

          {/* Tab 2: Specifications Grid */}
          {activeTab === "specifications" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs max-w-3xl">
                <div className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between">
                  <span className="text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">Brand Name</span>
                  <span className="text-foreground font-bold">{product.brand}</span>
                </div>
                
                <div className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between">
                  <span className="text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">Category</span>
                  <span className="text-foreground font-bold">{product.category}</span>
                </div>

                <div className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between">
                  <span className="text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">Warranty</span>
                  <span className="text-foreground font-bold">
                    {product.specifications?.["Warranty"] || "6 Months Manufacturer Warranty"}
                  </span>
                </div>

                <div className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between">
                  <span className="text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">Colour</span>
                  <span className="text-foreground font-bold">
                    {product.specifications?.["Colour"] || "Multi-Color / Clear"}
                  </span>
                </div>

                <div className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between sm:col-span-2">
                  <span className="text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">Compatible Devices</span>
                  <span className="text-foreground font-bold truncate max-w-[400px]">
                    {product.specifications?.["Compatible Phone Models"] || product.specifications?.["Compatible Model"] || "Universal / All Compatible Models"}
                  </span>
                </div>

                <div className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between sm:col-span-2">
                  <span className="text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">Material</span>
                  <span className="text-foreground font-bold">
                    {product.specifications?.["Material"] || "Thermoplastic Polyurethane"}
                  </span>
                </div>
              </div>

              {/* Other Technical Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs max-w-3xl pt-2 border-t border-border/40">
                {Object.entries(product.specifications)
                  .filter(([k]) => !["original_price", "in_stock", "is_on_sale", "Brand", "Colour", "Material", "Warranty", "Compatible Phone Models"].includes(k))
                  .map(([key, value]) => (
                    <div key={key} className="p-3.5 bg-card border border-border rounded-2xl flex items-center justify-between">
                      <span className="text-muted-foreground font-semibold uppercase text-[9px] tracking-wider">{key}</span>
                      <span className="text-foreground font-bold truncate max-w-[150px]">{value}</span>
                    </div>
                  ))}
              </div>

            </div>
          )}

          {/* Tab 3: Reviews */}
          {activeTab === "reviews" && (
            <div className="space-y-4 max-w-3xl animate-in fade-in duration-200">
              {mockReviews.map((rev, idx) => (
                <div key={idx} className="p-5 bg-card border border-border rounded-2xl space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-cyan-500/10 text-cyan-500 font-black text-xs flex items-center justify-center">
                        {rev.name.split(" ")[0][0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground leading-none">{rev.name}</p>
                        <span className="text-[10px] text-muted-foreground mt-1 block">{rev.date}</span>
                      </div>
                    </div>
                    
                    <div className="flex text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-10">{rev.text}</p>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Instagram Banner Section */}
      <section className="border-t border-border/40 pt-10 mt-10 text-center space-y-6">
        <div className="space-y-2">
          <a href="https://www.instagram.com/smart.care313?igsh=c2JxcHRmaW1mNXkz" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-opacity">
            <InstagramIcon className="h-7 w-7 text-cyan-500 mx-auto animate-pulse" />
          </a>
          <h3 className="text-base font-extrabold text-foreground">
            <a href="https://www.instagram.com/smart.care313?igsh=c2JxcHRmaW1mNXkz" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-500 transition-colors">
              Follow Us on Instagram
            </a>
          </h3>
          <p className="text-xs text-muted-foreground">
            Tag us in your phone cases photos at <span className="font-extrabold text-cyan-500">@smart.care313</span> to get featured!
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 max-w-4xl mx-auto">
          {[1, 2, 3, 4, 5, 6].map(num => (
            <div key={num} className="aspect-square rounded-2xl bg-muted border border-border/60 overflow-hidden relative group cursor-pointer">
              <div className="absolute inset-0 bg-cyan-500/10 group-hover:bg-cyan-500/0 transition-colors z-5" />
              <img 
                src={`/accessories.png`} 
                alt="" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 filter grayscale-[20%] group-hover:grayscale-0" 
                onError={(e) => { e.currentTarget.src = '/shop_accessories.png'; }}
              />
              <span className="absolute bottom-2 right-2 text-[8px] bg-black/60 text-white font-bold px-1.5 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                ♥ 4.2k
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* RELATED PRODUCTS */}
      {otherProducts.length > 0 && (
        <section className="border-t border-border/40 pt-10 mt-10">
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-6">More Accessories You May Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {otherProducts.map(p => (
              <div key={p.id} className="glass-card rounded-2xl p-3 border border-border flex flex-col justify-between hover:border-cyan-500/20 group transition-all bg-card shadow-sm text-xs">
                <div>
                  <div className="h-28 w-full rounded-xl bg-muted overflow-hidden flex items-center justify-center relative mb-2.5">
                    <img src={p.image} alt="" className="w-full h-full object-contain p-1 group-hover:scale-102 transition-transform duration-300" onError={(e) => { e.currentTarget.src = '/shop_accessories.png'; }} />
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-red-500 text-white text-[8px] font-bold uppercase tracking-wider">Sale</span>
                  </div>
                  <h4 className="font-bold text-[11px] text-foreground line-clamp-2 min-h-[32px] leading-tight mb-1">{p.name}</h4>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="font-extrabold text-foreground text-xs">{formatINR(p.price)}</span>
                    <span className="text-[10px] text-muted-foreground line-through">{formatINR(Math.round(p.price * 2.2))}</span>
                  </div>
                </div>
                <div className="space-y-1.5 pt-1">
                  <button
                    onClick={() => {
                      addToCart({
                        id: p.id,
                        type: "accessory",
                        name: p.name,
                        price: p.price,
                        image: p.image
                      }, 1);
                      alert(`Added "${p.name}" to cart!`);
                    }}
                    className="w-full py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-[9px] uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <ShoppingBag className="h-3 w-3" />
                    Add to Cart
                  </button>
                  <Link href={`/accessories/${p.id}`} className="text-center block w-full py-1.5 bg-muted hover:bg-border/60 text-[9px] font-bold rounded-lg border border-border/40 transition-colors">
                    View Specs
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sticky Bottom Mobile Purchase Drawer */}
      <div className="fixed bottom-0 left-0 w-full z-40 bg-background/90 border-t border-border/80 p-4 flex sm:hidden items-center justify-between shadow-xl backdrop-blur-md">
        <div className="flex flex-col">
          <span className="text-[9px] text-muted-foreground uppercase font-bold">Price per item</span>
          <span className="text-base font-extrabold text-foreground">{formatINR(product.price)}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            className="px-4 py-2.5 rounded-xl border border-border bg-card text-foreground font-bold text-xs flex items-center justify-center"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
          <button
            onClick={handleBuyNow}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 text-black font-extrabold text-xs flex items-center gap-1 shadow-md shadow-cyan-500/10"
          >
            <Zap className="h-4 w-4 fill-current" />
            Buy Now
          </button>
        </div>
      </div>

    </div>
  );
}
