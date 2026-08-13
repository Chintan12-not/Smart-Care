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
  ChevronLeft,
  Play,
  Pause,
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
import confetti from "canvas-confetti";

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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  
  // Resolve params promise
  const resolvedParams = React.use(params);
  const productId = resolvedParams.id;

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
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHoveringGallery, setIsHoveringGallery] = useState(false);

  const displayImages = product?.images && product.images.length > 0 
    ? product.images 
    : [product?.image || "/shop_accessories.png"];

  // Automatic sliding interval
  useEffect(() => {
    if (!isAutoPlaying || isHoveringGallery || displayImages.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setActiveImageIndex((prevIndex) => (prevIndex + 1) % displayImages.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [isAutoPlaying, isHoveringGallery, displayImages.length]);

  // Load wishlist status
  useEffect(() => {
    if (typeof window !== "undefined") {
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
      setIsLoading(true);
      let foundProd: AccessoryProduct | null = null;
      
      // 1. Search Mock Accessories
      const mockMatch = MOCK_ACCESSORIES.find(p => String(p.id) === String(productId));
      if (mockMatch) {
        foundProd = mockMatch;
      }

      // 2. Search Custom LocalStorage Accessories (added via Admin panel)
      if (typeof window !== "undefined") {
        const savedCustom = localStorage.getItem("sc_custom_accessories");
        if (savedCustom) {
          try {
            const parsedCustom: any[] = JSON.parse(savedCustom);
            const customMatch = parsedCustom.find((p: any) => String(p.id) === String(productId));
            if (customMatch) {
              foundProd = {
                id: String(customMatch.id),
                name: customMatch.name || "Accessory Product",
                category: customMatch.category || "case",
                brand: customMatch.brand || "Generic",
                price: Number(customMatch.price || 0),
                originalPrice: customMatch.originalPrice ? Number(customMatch.originalPrice) : null,
                inStock: customMatch.inStock !== false,
                isOnSale: customMatch.isOnSale || false,
                rating: Number(customMatch.rating || 4.8),
                reviewsCount: Number(customMatch.reviewsCount || 15),
                image: customMatch.image || (customMatch.images && customMatch.images[0]) || "/shop_accessories.png",
                images: customMatch.images || [customMatch.image || "/shop_accessories.png"],
                specifications: customMatch.specifications || {},
                description: customMatch.description || ""
              };
            }
          } catch (e) {
            console.warn("Failed to parse custom accessories from localStorage:", e);
          }
        }
      }

      // 3. Search Supabase database if configured
      if (isSupabaseConfigured()) {
        try {
          const { data: allData } = await supabase.from("accessories").select("*").eq("is_active", true);
          if (allData && allData.length > 0) {
            const mappedAll = allData.map(item => ({
              id: String(item.id),
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
            setProductsList(mappedAll);
            
            const dbFound = mappedAll.find(p => String(p.id) === String(productId));
            if (dbFound) {
              foundProd = dbFound;
            }
          }
        } catch (err) {
          console.error("Error loading products from Supabase:", err);
        }
      }

      setProduct(foundProd);
      setIsLoading(false);
    }

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

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
      <div className="min-h-[70vh] flex items-center justify-center bg-background">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground">Product Not Found</h2>
          <p className="text-xs text-muted-foreground">The requested accessory item does not exist or has been removed.</p>
          <Link href="/accessories" className="inline-block px-5 py-2.5 bg-cyan-500 text-white rounded-xl text-xs font-bold">
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
        confetti({ particleCount: 40, spread: 30, origin: { y: 0.8 } });
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
    confetti({ particleCount: 80, spread: 60 });
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
    
    // Dispatch a storage change event so that the navbar cart count updates immediately
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
    }
    
    // Redirect directly to the billing / checkout page
    router.push("/billing");
  };

  // Image Zoom handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(1.6)"
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({});
  };

  // Check compatibility
  const checkCompatibility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compatibilityModel.trim()) return;

    const query = compatibilityModel.toLowerCase();
    const isMatched = 
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      Object.values(product.specifications).some(val => String(val).toLowerCase().includes(query));

    setIsCompatible(isMatched);
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


  // Mock Reviews data
  const mockReviews = [
    { name: "Rahul Verma", rating: 5, date: "12 May 2026", text: "Amazing quality case! Completely transparent and does not turn yellow quickly like other cheap covers. Worth every rupee." },
    { name: "Sneha Sharma", rating: 4, date: "28 April 2026", text: "Perfect fit for my device. The camera bumper lip offers extra safety protection. Recommended!" },
    { name: "Amit Yadav", rating: 5, date: "15 April 2026", text: "Ordered on WhatsApp and got same day delivery in Sector 47. Case fits beautifully and material feels premium." }
  ];

  // Product JSON-LD Schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image.startsWith("/") ? `https://smartcaremobile.in${product.image}` : product.image,
    "description": product.description || `${product.name} compatible with ${product.brand} smartphones. Available at Smart Care & Mobile Point.`,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Smart Care"
    },
    "sku": product.id,
    "offers": {
      "@type": "Offer",
      "url": `https://smartcaremobile.in/accessories/${product.id}`,
      "priceCurrency": "INR",
      "price": product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Smart Care & Mobile Point"
      }
    }
  };

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/40 pb-4">
        <div className="flex items-center gap-1.5 font-medium">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/accessories" className="hover:text-foreground">Accessories</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-semibold truncate max-w-[200px]">{product.name}</span>
        </div>

        <Link href="/accessories" className="inline-flex items-center gap-1 font-bold text-cyan-500 hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Store
        </Link>
      </div>

      {/* Main Product Column split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Premium Animated Auto-Slide Gallery (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div 
            className="relative h-96 sm:h-[480px] w-full rounded-3xl overflow-hidden flex items-center justify-center border border-white/20 cursor-zoom-in group shadow-md bg-white p-3 sm:p-5"
            onMouseEnter={() => setIsHoveringGallery(true)}
            onMouseLeave={() => {
              setIsHoveringGallery(false);
              handleMouseLeave();
            }}
            onMouseMove={handleMouseMove}
          >
            {/* Smooth Animated Image Slide */}
            <img
              key={activeImageIndex}
              src={displayImages[activeImageIndex]}
              alt={product.name}
              style={zoomStyle}
              className="w-full h-full object-contain z-10 transition-all duration-500 ease-out animate-in fade-in zoom-in-95 rounded-2xl"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/shop_accessories.png'; }}
            />
            
            {/* Previous Slide Arrow */}
            {displayImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/70 hover:bg-black text-white backdrop-blur-md shadow-lg transition-all opacity-80 group-hover:opacity-100 hover:scale-110"
                aria-label="Previous Image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}

            {/* Next Slide Arrow */}
            {displayImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev + 1) % displayImages.length);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/70 hover:bg-black text-white backdrop-blur-md shadow-lg transition-all opacity-80 group-hover:opacity-100 hover:scale-110"
                aria-label="Next Image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}

            {/* Auto-Slide Play/Pause Toggle Indicator */}
            {displayImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAutoPlaying(!isAutoPlaying);
                }}
                className="absolute top-4 right-4 z-30 px-2.5 py-1 rounded-full bg-black/75 hover:bg-black backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md border border-white/20 transition-all"
                title={isAutoPlaying ? "Pause Auto-Slide" : "Play Auto-Slide"}
              >
                {isAutoPlaying ? (
                  <>
                    <Pause className="h-2.5 w-2.5 fill-white text-white" />
                    Auto-Sliding
                  </>
                ) : (
                  <>
                    <Play className="h-2.5 w-2.5 fill-white text-white" />
                    Paused
                  </>
                )}
              </button>
            )}

            {/* Bottom Animated Slide Dots Indicator */}
            {displayImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md shadow-md border border-white/10">
                {displayImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex(idx);
                    }}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      activeImageIndex === idx ? "w-6 bg-cyan-400" : "w-2 bg-white/50 hover:bg-white"
                    )}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Hover to zoom badge */}
            <span className="absolute bottom-4 left-4 z-20 hidden sm:inline-block px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-wider">
              Hover to Zoom
            </span>

            {/* Sale label bubble */}
            <span className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-red-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
              Sale
            </span>
          </div>

          {/* Thumbnails row with active slide glow */}
          {displayImages.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto py-1 no-scrollbar">
              {displayImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={cn(
                    "h-16 w-16 rounded-xl border-2 overflow-hidden bg-white flex items-center justify-center flex-shrink-0 transition-all relative",
                    activeImageIndex === idx ? "border-cyan-500 scale-105 shadow-md ring-2 ring-cyan-500/50" : "border-white/20 hover:border-cyan-500/30 opacity-70 hover:opacity-100"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-contain p-1 rounded-lg" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/shop_accessories.png'; }} />
                  {activeImageIndex === idx && (
                    <span className="absolute inset-0 border-2 border-cyan-500 rounded-xl pointer-events-none animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Buyer Assurance & Store Guarantee Feature Block (Fills empty space beneath gallery) */}
          <div className="glass-card rounded-3xl p-5 sm:p-6 border border-border/80 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-border/50">
              <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold shadow-sm flex-shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-foreground">Smart Care Certified Guarantee</h4>
                <p className="text-[11px] text-muted-foreground">100% Genuine quality product verified by technical team</p>
              </div>
            </div>

            {/* 4 Feature Badges Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-muted/30 border border-border/40">
                <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-[11px] text-foreground">Store Warranty</h5>
                  <p className="text-[10px] text-muted-foreground">Smart Care direct replacement</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-muted/30 border border-border/40">
                <Truck className="h-4 w-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-[11px] text-foreground">Express Delivery</h5>
                  <p className="text-[10px] text-muted-foreground">Same-day Gurugram shipping</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-muted/30 border border-border/40">
                <RefreshCw className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-[11px] text-foreground">Easy Replacement</h5>
                  <p className="text-[10px] text-muted-foreground">7-Day hassle-free return</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-muted/30 border border-border/40">
                <Lock className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-[11px] text-foreground">Razorpay Secure</h5>
                  <p className="text-[10px] text-muted-foreground">UPI, Cards & Netbanking</p>
                </div>
              </div>
            </div>

            {/* Store Pickup Banner & Instant Assistance */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-emerald-500/5 to-cyan-500/10 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-cyan-500 flex-shrink-0" />
                <div>
                  <span className="text-[9px] font-black uppercase text-cyan-500 tracking-wider">Store Pick-up Available</span>
                  <p className="text-[11px] font-bold text-foreground">Shop 28, Ninex Residency, Sec 37C</p>
                </div>
              </div>
              <a
                href="https://wa.me/919289942313?text=Hi%20Smart%20Care,%20I%20have%20a%20question%20about%20this%20accessory"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-md flex-shrink-0 transition-colors"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                Ask Store Expert
              </a>
            </div>
          </div>

          {/* Ratings & Quality Breakdown Card */}
          <div className="glass-card rounded-3xl p-5 sm:p-6 border border-border/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-foreground">Customer Satisfaction Score</h4>
                <p className="text-[11px] text-muted-foreground">Based on verified Smart Care store purchases</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-amber-400">4.9 / 5</span>
                <div className="flex text-amber-400 justify-end">
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-muted-foreground">Product Build & Quality</span>
                  <span className="text-emerald-500">98% Positive</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[98%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-muted-foreground">Packaging & Protection</span>
                  <span className="text-cyan-500">100% Safe</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full w-[100%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-muted-foreground">Value for Money</span>
                  <span className="text-amber-500">95% Top Rating</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[95%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Frequently Asked Questions Card */}
          <div className="glass-card rounded-3xl p-5 sm:p-6 border border-border/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border/50">
              <MessageSquare className="h-4 w-4 text-cyan-500" />
              <h4 className="font-extrabold text-xs sm:text-sm text-foreground">Frequently Asked Questions</h4>
            </div>

            <div className="space-y-3 divide-y divide-border/40">
              <div className="pt-2">
                <h5 className="font-bold text-[11px] text-foreground flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                  Is this product 100% genuine & tested?
                </h5>
                <p className="text-[10px] text-muted-foreground mt-1 pl-5">
                  Yes, every accessory at Smart Care undergoes a multi-point quality test before dispatch or store placement.
                </p>
              </div>

              <div className="pt-2.5">
                <h5 className="font-bold text-[11px] text-foreground flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                  Can I get free installation at your Gurugram shop?
                </h5>
                <p className="text-[10px] text-muted-foreground mt-1 pl-5">
                  Absoluty! Bring your receipt to Shop No. 28, Ninex Residency, Sec 37C for complimentary professional fitting.
                </p>
              </div>

              <div className="pt-2.5">
                <h5 className="font-bold text-[11px] text-foreground flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                  How fast is delivery in Gurugram?
                </h5>
                <p className="text-[10px] text-muted-foreground mt-1 pl-5">
                  Orders placed before 4 PM receive same-day express doorstep delivery within Gurugram & NCR.
                </p>
              </div>

              <div className="pt-2.5">
                <h5 className="font-bold text-[11px] text-foreground flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                  What is the return & replacement policy?
                </h5>
                <p className="text-[10px] text-muted-foreground mt-1 pl-5">
                  We offer a 7-Day hassle-free replacement guarantee for any manufacturing defects or sizing issues.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: checkout and description panel (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Header Details */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-500 text-[10px] font-extrabold uppercase tracking-wider">
                {product.brand} • {product.category}
              </span>
              
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

          {/* Color Selection Component for Ordering */}
          {(() => {
            const colorsList = product.specifications?.["Colour"]
              ? product.specifications["Colour"].split(",").map((c: string) => c.trim()).filter(Boolean)
              : ["Blue", "Black", "Clear", "Teal"];

            if (colorsList.length === 0) return null;

            return (
              <div className="space-y-2 p-4 rounded-2xl bg-muted/30 border border-border/50">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Select Color Preference:
                </span>
                <div className="flex flex-wrap gap-2">
                  {colorsList.map((color: string) => (
                    <button
                      key={color}
                      type="button"
                      className="px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all bg-cyan-500/10 border-cyan-500/40 text-cyan-400 flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 inline-block" />
                      <span>{color}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Pricing Box details */}
          <div className="p-5 rounded-3xl bg-muted/40 border border-border/80 space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Special Sale Price</span>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl font-black text-foreground">{formatINR(product.price)}</span>
                  {originalPrice > product.price && (
                    <span className="text-sm text-muted-foreground line-through font-medium">{formatINR(originalPrice)}</span>
                  )}
                  {discountPercentage > 0 && (
                    <span className="text-xs text-emerald-500 font-extrabold">{discountPercentage}% OFF</span>
                  )}
                </div>
              </div>
              <div className="text-right space-y-1">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[9px] font-extrabold uppercase tracking-wider">In Stock</span>
                <span className="text-[9px] text-muted-foreground block mt-1">Free Doorstep Delivery</span>
              </div>
            </div>
          </div>

          {/* Quantity selector & Actions */}
          <div className="space-y-4">
            
            {/* Quantity Selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Quantity:</span>
              <div className="flex items-center bg-muted border border-border rounded-xl p-1">
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="p-1.5 hover:bg-card rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="px-4 text-xs font-extrabold text-foreground">{quantity}</span>
                <button 
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="p-1.5 hover:bg-card rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Checkouts Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3.5 rounded-2xl border border-border bg-card hover:bg-muted text-foreground font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all duration-200 select-none"
              >
                <ShoppingBag className="h-4.5 w-4.5" />
                Add to Cart
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 py-3.5 rounded-2xl bg-cyan-500 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-cyan-400 active:scale-[0.99] transition-all duration-200 select-none shadow-md shadow-cyan-500/10"
              >
                <Zap className="h-4.5 w-4.5 fill-current" />
                Buy It Now
              </button>

              <button
                onClick={handleToggleWishlist}
                className="p-3.5 rounded-2xl bg-card border border-border text-muted-foreground hover:text-red-500 flex items-center justify-center transition-colors"
                aria-label="Add to Wishlist"
              >
                <Heart className={cn("h-5 w-5 transition-colors", isWishlisted && "fill-red-500 text-red-500")} />
              </button>

            </div>

            {/* WhatsApp CTA */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 font-bold text-xs flex items-center justify-center gap-2 transition-colors duration-200 select-none"
            >
              <PhoneCall className="h-4.5 w-4.5 fill-current" />
              Order Instantly via WhatsApp Chat
            </a>

            {/* Requirement 13: Product Page B2B CTA */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-cyan-500/10 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
              <div>
                <p className="font-extrabold text-xs text-foreground flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-purple-400" />
                  Buying in bulk?
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Get special pricing for corporate & bulk orders.
                </p>
              </div>
              <Link
                href="/corporate-orders"
                className="px-3.5 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500 text-purple-300 hover:text-black font-extrabold text-xs transition-all border border-purple-500/30 shrink-0 text-center"
              >
                Request Bulk Pricing
              </Link>
            </div>

          </div>

          {/* Quick Checker */}
          <div className="glass-card rounded-3xl p-5 border border-border space-y-3 bg-card/40">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-cyan-500" />
              Smart Device Compatibility Check
            </h3>
            <form onSubmit={checkCompatibility} className="flex gap-2">
              <input
                type="text"
                placeholder="Type your model name (e.g. S24, iPhone 14)..."
                value={compatibilityModel}
                onChange={(e) => setCompatibilityModel(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold"
              />
              <button type="submit" className="px-4 py-2.5 rounded-xl bg-foreground text-background font-bold text-[10px]">
                Verify
              </button>
            </form>
            {isCompatible !== null && (
              <p className={cn(
                "text-[10px] font-bold flex items-center gap-1",
                isCompatible ? "text-emerald-500" : "text-amber-500"
              )}>
                {isCompatible 
                  ? "✓ Verified Compatible: This accessory is guaranteed to fit your smartphone model!" 
                  : "⚠ Unconfirmed: Check product specifications sheet below or ask Rahul via repair assistant."}
              </p>
            )}
          </div>

          {/* Trust points */}
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground border-t border-border/40 pt-4">
            <div className="flex gap-2.5">
              <Truck className="h-5 w-5 text-cyan-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-foreground">Next Day Delivery</p>
                <p className="text-[10px] mt-0.5 leading-relaxed">Delivered within 24 hours in Gurugram. 2-4 days pan India shipping.</p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <RefreshCw className="h-5 w-5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-foreground">7-Day Fit Guarantee</p>
                <p className="text-[10px] mt-0.5 leading-relaxed">No-fuss replacement if the product doesn&apos;t fit your phone model perfectly.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Dynamic Tab Info System (Description, Specs, Reviews) */}
      <section className="border-t border-border/40 pt-10 mt-10">
        
        {/* Tab Controls */}
        <div className="flex border-b border-border gap-6">
          <button
            onClick={() => setActiveTab("description")}
            className={cn(
              "pb-3.5 text-xs font-bold uppercase tracking-wider border-b-2 px-1 transition-colors",
              activeTab === "description" ? "border-cyan-500 text-cyan-500" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Product Description
          </button>
          <button
            onClick={() => setActiveTab("specifications")}
            className={cn(
              "pb-3.5 text-xs font-bold uppercase tracking-wider border-b-2 px-1 transition-colors",
              activeTab === "specifications" ? "border-cyan-500 text-cyan-500" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Technical Sheet
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={cn(
              "pb-3.5 text-xs font-bold uppercase tracking-wider border-b-2 px-1 transition-colors",
              activeTab === "reviews" ? "border-cyan-500 text-cyan-500" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Reviews ({mockReviews.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="py-6 min-h-[200px]">
          
          {/* Tab 1: Description */}
          {activeTab === "description" && (
            <div className="space-y-6 text-xs text-muted-foreground leading-relaxed animate-in fade-in duration-200">
              <div className="max-w-3xl space-y-4">
                <p>
                  Elevate your smartphone daily utility with this high-grade accessory designed with certified material standards. Specially tailored structure fits device control buttons and port alignments securely.
                </p>
                <p>
                  Constructed with durable AAA-grade elements to resist abrasions, discoloration, and daily impact wear. Ideal for smartphone owners looking for robust protective utility without hiding their original design aesthetics.
                </p>
              </div>

              {/* Guarantees grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="p-4 bg-muted/30 border border-border/40 rounded-2xl text-center space-y-2">
                  <ShieldCheck className="h-6 w-6 text-cyan-500 mx-auto" />
                  <p className="font-bold text-foreground text-xs uppercase tracking-wider">100% Genuine</p>
                  <p className="text-[10px] text-muted-foreground">Certified accessory sourced from official brand channels.</p>
                </div>
                <div className="p-4 bg-muted/30 border border-border/40 rounded-2xl text-center space-y-2">
                  <Truck className="h-6 w-6 text-emerald-500 mx-auto" />
                  <p className="font-bold text-foreground text-xs uppercase tracking-wider">Safe Packaging</p>
                  <p className="text-[10px] text-muted-foreground">Double packed in ESD-safe logistics buffers to prevent transit scratches.</p>
                </div>
                <div className="p-4 bg-muted/30 border border-border/40 rounded-2xl text-center space-y-2">
                  <Lock className="h-6 w-6 text-amber-500 mx-auto" />
                  <p className="font-bold text-foreground text-xs uppercase tracking-wider">Secure Payment</p>
                  <p className="text-[10px] text-muted-foreground">Pay with Cash on Delivery or Secure UPI at the doorstep.</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Specifications */}
          {activeTab === "specifications" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Optional Warranty Banner Card */}
              {(product.specifications?.["Warranty"] || (product as any).warranty) && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center gap-3 max-w-2xl">
                  <ShieldCheck className="h-6 w-6 flex-shrink-0 text-emerald-400" />
                  <div>
                    <p className="font-extrabold text-xs uppercase tracking-wider text-emerald-400">Official Product Warranty</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                      {product.specifications?.["Warranty"] || (product as any).warranty}
                    </p>
                  </div>
                </div>
              )}

              {/* Structured E-Commerce Specifications Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs max-w-3xl">
                <div className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between">
                  <span className="text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">Brand</span>
                  <span className="text-foreground font-bold">{product.brand || "Generic"}</span>
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
      <section className="border-t border-border/40 pt-10 mt-10 text-center space-y-4">
        <div className="space-y-2 max-w-lg mx-auto p-6 rounded-3xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-pink-500/20">
          <a href="https://www.instagram.com/smart.care313?igsh=c2JxcHRmaW1mNXkz" target="_blank" rel="noopener noreferrer" className="inline-block hover:scale-110 transition-transform">
            <InstagramIcon className="h-8 w-8 text-pink-500 mx-auto" />
          </a>
          <h3 className="text-base font-extrabold text-foreground">
            <a href="https://www.instagram.com/smart.care313?igsh=c2JxcHRmaW1mNXkz" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition-colors">
              Follow Us on Instagram
            </a>
          </h3>
          <p className="text-xs text-muted-foreground">
            Tag us in your phone cases photos at <span className="font-extrabold text-pink-500">@smart.care313</span> to get featured!
          </p>
          <div className="pt-2">
            <a
              href="https://www.instagram.com/smart.care313?igsh=c2JxcHRmaW1mNXkz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs shadow-md hover:opacity-90 transition-opacity"
            >
              <InstagramIcon className="h-4 w-4" />
              Follow @smart.care313
            </a>
          </div>
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
