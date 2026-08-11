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
      
      const localFound = MOCK_ACCESSORIES.find(p => p.id === productId);
      if (localFound) {
        setProduct(localFound);
      }

      if (isSupabaseConfigured()) {
        try {
          const { data: allData } = await supabase.from("accessories").select("*").eq("is_active", true);
          if (allData && allData.length > 0) {
            const mappedAll = allData.map(item => ({
              id: item.id,
              name: item.name,
              category: item.category,
              brand: item.brand,
              price: Number(item.price),
              rating: Number(item.rating_avg || 4.7),
              reviewsCount: Number(item.reviews_count || 24),
              image: (item.images && item.images.length > 0) ? item.images[0] : "/placeholder_acc.png",
              images: item.images || [],
              specifications: item.specifications || {},
              description: item.description || ""
            }));
            setProductsList(mappedAll);
            
            const dbFound = mappedAll.find(p => p.id === productId);
            if (dbFound) {
              setProduct(dbFound);
            }
          }
        } catch (err) {
          console.error("Error loading products from Supabase:", err);
        }
      }
      setIsLoading(false);
    }
    fetchProduct();
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
*URL*: https://smart-care-u57t.vercel.app/accessories/${product.id}`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`;

  // Product Images Array compiled
  const displayImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];

  // Mock Reviews data
  const mockReviews = [
    { name: "Rahul Verma", rating: 5, date: "12 May 2026", text: "Amazing quality case! Completely transparent and does not turn yellow quickly like other cheap covers. Worth every rupee." },
    { name: "Sneha Sharma", rating: 4, date: "28 April 2026", text: "Perfect fit for my device. The camera bumper lip offers extra safety protection. Recommended!" },
    { name: "Amit Yadav", rating: 5, date: "15 April 2026", text: "Ordered on WhatsApp and got same day delivery in Sector 47. Case fits beautifully and material feels premium." }
  ];

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
      
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
        
        {/* Left Column: Premium Gallery (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div 
            className="relative h-96 sm:h-[450px] w-full rounded-3xl bg-muted overflow-hidden flex items-center justify-center border border-border/80 cursor-zoom-in group shadow-sm bg-card"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={displayImages[activeImageIndex]}
              alt={product.name}
              style={zoomStyle}
              className="w-full h-full object-contain p-4 transition-transform duration-100"
              onError={(e) => { e.currentTarget.src = '/placeholder_acc.png'; }}
            />
            
            {/* Hover to zoom badge */}
            <span className="absolute bottom-4 left-4 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-wider">
              Hover to Zoom
            </span>

            {/* Sale label bubble */}
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-red-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
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
                    "h-16 w-16 rounded-xl border-2 overflow-hidden bg-card flex items-center justify-center flex-shrink-0 transition-all",
                    activeImageIndex === idx ? "border-cyan-500 scale-102 shadow-sm" : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-contain p-1" onError={(e) => { e.currentTarget.src = '/placeholder_acc.png'; }} />
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
            
            <p className="text-xs text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          {/* Pricing Box details */}
          <div className="p-5 rounded-3xl bg-muted/40 border border-border/80 space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Special Sale Price</span>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl font-black text-foreground">{formatINR(product.price)}</span>
                  <span className="text-sm text-muted-foreground line-through font-medium">{formatINR(originalPrice)}</span>
                  <span className="text-xs text-emerald-500 font-extrabold">{discountPercentage}% OFF</span>
                </div>
              </div>
              <div className="text-right space-y-1">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[9px] font-extrabold uppercase tracking-wider">In Stock</span>
                <span className="text-[9px] text-muted-foreground block mt-1">Free Doorstep Delivery</span>
              </div>
            </div>
          </div>

          {/* Product Bullet highlights */}
          <div className="p-4 bg-muted/30 border border-border/50 rounded-2xl space-y-2 text-xs">
            <p className="font-extrabold text-[10px] uppercase tracking-wider text-cyan-500">Key Features & Highlights</p>
            <ul className="space-y-1.5 text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-500 mt-0.5">✔</span>
                <span><strong>Anti-Yellow Protection:</strong> Advanced clarity coating guarantees long transparent life.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-500 mt-0.5">✔</span>
                <span><strong>Slim profile & Grip:</strong> Ergonomic layout fits nicely without adding bulky weight.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-500 mt-0.5">✔</span>
                <span><strong>Impact Bumper corners:</strong> Shock absorption shields device against accidental drops.</span>
              </li>
            </ul>
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
              {/* Product origin info card */}
              <div className="p-4 bg-muted/30 border border-border/50 rounded-2xl max-w-2xl text-xs space-y-2 mb-4">
                <p className="font-bold text-foreground text-xs">Standard Product Meta Information</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-muted-foreground mt-2">
                  <p>• <strong>Net Quantity:</strong> 1 Unit</p>
                  <p>• <strong>Country of Origin:</strong> India</p>
                  <p>• <strong>Manufacturer:</strong> Smart Care Logistics Hub, Gurugram</p>
                  <p>• <strong>Warranty:</strong> 6 Months Limited Warranty</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between">
                    <span className="text-muted-foreground font-semibold uppercase text-[9px] tracking-wider">{key}</span>
                    <span className="text-foreground font-bold">{value}</span>
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

        {/* Instashow images grid placeholder */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 max-w-4xl mx-auto">
          {[1, 2, 3, 4, 5, 6].map(num => (
            <div key={num} className="aspect-square rounded-2xl bg-muted border border-border/60 overflow-hidden relative group cursor-pointer">
              <div className="absolute inset-0 bg-cyan-500/10 group-hover:bg-cyan-500/0 transition-colors z-5" />
              <img 
                src={`/accessories.png`} 
                alt="" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 filter grayscale-[20%] group-hover:grayscale-0" 
                onError={(e) => { e.currentTarget.src = '/placeholder_acc.png'; }}
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
                    <img src={p.image} alt="" className="w-full h-full object-contain p-1 group-hover:scale-102 transition-transform duration-300" onError={(e) => { e.currentTarget.src = '/placeholder_acc.png'; }} />
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
