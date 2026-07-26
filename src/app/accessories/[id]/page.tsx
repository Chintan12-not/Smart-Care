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
  PhoneCall
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { MOCK_ACCESSORIES, AccessoryProduct } from "@/lib/accessories";
import { formatINR, cn } from "@/lib/utils";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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

  // 1. Load wishlist status and load products list
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

  // 2. Fetch specific product
  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      
      // Fallback first
      const localFound = MOCK_ACCESSORIES.find(p => p.id === productId);
      if (localFound) {
        setProduct(localFound);
      }

      if (isSupabaseConfigured()) {
        try {
          // Fetch list for related
          const { data: allData } = await supabase.from("accessories").select("*").eq("is_active", true);
          if (allData && allData.length > 0) {
            const mappedAll = allData.map(item => ({
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
            setProductsList(mappedAll);
            
            const dbFound = mappedAll.find(p => p.id === productId);
            if (dbFound) {
              setProduct(dbFound);
            }
          }
        } catch (err) {
          console.error("Error fetching detailed product:", err);
        }
      }
      setIsLoading(false);
    }
    fetchProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="flex-grow max-w-7xl w-full mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-muted-foreground">Loading premium product details page...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex-grow max-w-7xl w-full mx-auto px-4 py-20 text-center space-y-4">
        <Smartphone className="h-12 w-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Accessory Not Found</h2>
        <p className="text-xs text-muted-foreground">The requested listing does not exist or has been disabled.</p>
        <Link href="/accessories" className="inline-flex items-center gap-1 text-xs font-bold text-cyan-500 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Return to Catalog
        </Link>
      </div>
    );
  }

  // Wishlist toggle
  const handleToggleWishlist = () => {
    let list: string[] = [];
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sc_wishlist");
      if (saved) {
        try { list = JSON.parse(saved); } catch (e) {}
      }
    }
    
    let updated;
    if (isWishlisted) {
      updated = list.filter(id => id !== product.id);
      setIsWishlisted(false);
    } else {
      updated = [...list, product.id];
      setIsWishlisted(true);
    }
    localStorage.setItem("sc_wishlist", JSON.stringify(updated));
  };

  // Add to cart
  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      type: "accessory",
      name: product.name,
      price: product.price,
      image: product.image
    });
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 3000);
  };

  // Image Zoom handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(1.5)"
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
      Object.values(product.specifications).some(val => val.toLowerCase().includes(query));

    setIsCompatible(isMatched);
  };

  // Get Related items
  const relatedProducts = productsList
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  // WhatsApp Order payload
  const whatsappNumber = "919289942313";
  const whatsappText = `Hello! I would like to purchase this product:
*Name*: ${product.name}
*Price*: ${formatINR(product.price)}
*Link*: https://smart-care-u57t.vercel.app/accessories/${product.id}`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`;

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
      
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 font-medium">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/accessories" className="hover:text-foreground">Accessories</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-bold truncate max-w-[200px]">{product.name}</span>
        </div>

        <Link href="/accessories" className="inline-flex items-center gap-1 font-bold text-cyan-500 hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Store
        </Link>
      </div>

      {/* Main product view grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Image Zoom Gallery */}
        <div className="space-y-4">
          <div 
            className="relative h-96 w-full rounded-3xl bg-muted overflow-hidden flex items-center justify-center border border-border/80 cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[activeImageIndex]}
                alt={product.name}
                style={zoomStyle}
                className="w-full h-full object-cover transition-transform duration-100"
                onError={(e) => { e.currentTarget.src = '/placeholder_acc.png'; }}
              />
            ) : (
              <img
                src={product.image}
                alt={product.name}
                style={zoomStyle}
                className="w-full h-full object-cover transition-transform duration-100"
                onError={(e) => { e.currentTarget.src = '/placeholder_acc.png'; }}
              />
            )}
            
            {/* Tag indicator */}
            <span className="absolute bottom-4 left-4 px-2.5 py-1 rounded-xl bg-black/70 text-white text-[9px] font-black uppercase tracking-wider">
              Hover to Zoom
            </span>
          </div>

          {/* Thumbnails grid */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={cn(
                    "h-16 w-16 rounded-xl border overflow-hidden bg-muted flex items-center justify-center flex-shrink-0 transition-all",
                    activeImageIndex === idx ? "border-cyan-500 scale-102 shadow-sm" : "border-border hover:border-muted-foreground/40"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder_acc.png'; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: details & Checkout panels */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-500 text-[10px] font-extrabold uppercase tracking-wider">{product.brand}</span>
              <div className="flex items-center text-amber-500 text-xs font-bold gap-1">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                {product.rating} <span className="text-muted-foreground text-[10px] font-medium">({product.reviewsCount} reviews)</span>
              </div>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-tight">{product.name}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          {/* Pricing Panel */}
          <div className="p-5 rounded-3xl bg-muted/40 border border-border/80 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Special Price</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-foreground">{formatINR(product.price)}</span>
                {product.id === "acc-7" && <span className="text-xs text-muted-foreground line-through font-semibold">₹399</span>}
              </div>
            </div>
            <div className="text-right">
              <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[9px] font-extrabold uppercase tracking-wider">In Stock</span>
              <p className="text-[9px] text-muted-foreground mt-1">Free delivery inside Gurugram</p>
            </div>
          </div>

          {/* Quick Actions (Add to Cart, Wishlist, WhatsApp Order) */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              className="flex-grow py-3.5 rounded-2xl bg-foreground text-background font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 shadow-md shadow-zinc-950/10 select-none"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              Add to Shopping Cart
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3.5 px-5 rounded-2xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-400 shadow-md shadow-emerald-500/10 select-none"
              title="Order directly on WhatsApp"
            >
              <PhoneCall className="h-4.5 w-4.5 fill-current" />
              WhatsApp Order
            </a>
            <button
              onClick={handleToggleWishlist}
              className="p-3.5 rounded-2xl bg-card border border-border text-muted-foreground hover:text-red-500 flex items-center justify-center"
              aria-label="Add to Wishlist"
            >
              <Heart className={cn("h-5 w-5", isWishlisted && "fill-red-500 text-red-500")} />
            </button>
          </div>

          {/* compatibility Checker */}
          <div className="glass-card rounded-3xl p-5 border border-border space-y-3.5">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-4.5 w-4.5 text-cyan-500 animate-pulse" />
              Smart compatibility Checker
            </h3>
            <form onSubmit={checkCompatibility} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter your phone model (e.g. S25, iPhone 15)..."
                value={compatibilityModel}
                onChange={(e) => setCompatibilityModel(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <button type="submit" className="px-4 py-2 rounded-xl bg-foreground text-background font-bold text-[10px]">
                Check
              </button>
            </form>
            {isCompatible !== null && (
              <p className={cn(
                "text-[10px] font-bold flex items-center gap-1",
                isCompatible ? "text-emerald-500" : "text-amber-500"
              )}>
                {isCompatible 
                  ? "✓ Guaranteed Compatible: This accessory fits your phone!" 
                  : "⚠ Unconfirmed: Check product specs or consult Rahul via repair chat."}
              </p>
            )}
          </div>

          {/* Shipping & Return Policy Details */}
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div className="flex gap-2.5">
              <Truck className="h-5 w-5 text-cyan-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-foreground">Fast Delivery</p>
                <p className="text-[10px] mt-0.5">Delivered in 24 hours inside Gurugram; 2-3 days pan India.</p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <RefreshCw className="h-5 w-5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-foreground">Easy 7-Day Returns</p>
                <p className="text-[10px] mt-0.5">Hassle-free replacement if catalog item doesn&apos;t fit your model.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Technical Specifications checklist Grid */}
      <section className="border-t border-border/40 pt-8 mt-6">
        <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">Technical Specifications Sheet</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {Object.entries(product.specifications).map(([key, value]) => (
            <div key={key} className="p-3.5 bg-card border border-border rounded-2xl flex items-center justify-between">
              <span className="text-muted-foreground font-semibold uppercase text-[9px] tracking-wider">{key}</span>
              <span className="text-foreground font-bold">{value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-border/40 pt-10 mt-10">
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-6">Related Accessories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map(p => (
              <div key={p.id} className="glass-card rounded-2xl p-4 border border-border flex flex-col justify-between hover:border-cyan-500/20 group transition-all">
                <div className="h-32 w-full rounded-xl bg-muted overflow-hidden flex items-center justify-center relative mb-3">
                  <img src={p.image} alt="" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" onError={(e) => { e.currentTarget.src = '/placeholder_acc.png'; }} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-foreground truncate">{p.name}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{formatINR(p.price)}</p>
                </div>
                <Link href={`/accessories/${p.id}`} className="mt-4 text-center block w-full py-2 bg-muted hover:bg-zinc-800/10 border border-border/50 text-[10px] font-bold rounded-xl">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sticky Bottom Mobile CTA Bar */}
      <div className="fixed bottom-0 left-0 w-full z-30 bg-background/95 border-t border-border/80 p-4 flex sm:hidden items-center justify-between shadow-lg backdrop-blur-md">
        <div className="flex flex-col">
          <span className="text-[9px] text-muted-foreground uppercase font-bold">Total Price</span>
          <span className="text-base font-extrabold text-foreground">{formatINR(product.price)}</span>
        </div>
        <button
          onClick={handleAddToCart}
          className="px-5 py-2.5 rounded-xl bg-foreground text-background font-bold text-xs flex items-center gap-1 shadow-md"
        >
          <ShoppingBag className="h-4 w-4" />
          Add to Cart
        </button>
      </div>

    </div>
  );
}
