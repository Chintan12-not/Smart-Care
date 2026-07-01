"use client";

import React, { useState } from "react";
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
  ChevronRight
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { MOCK_ACCESSORIES, AccessoryProduct } from "@/lib/accessories";
import { formatINR, cn } from "@/lib/utils";

export default function AccessoriesPage() {
  const { addToCart } = useCart();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<AccessoryProduct | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [addedItemName, setAddedItemName] = useState("");

  const handleOpenSpecs = (product: AccessoryProduct) => {
    setSelectedProduct(product);
    setActiveImageIndex(0);
  };

  const toggleWishlist = (id: string) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter((item) => item !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
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
  };

  const filteredProducts = MOCK_ACCESSORIES.filter((prod) => {
    const matchesSearch = 
      prod.name.toLowerCase().includes(search.toLowerCase()) ||
      prod.brand.toLowerCase().includes(search.toLowerCase()) ||
      prod.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = 
      category === "all" || 
      prod.category.toLowerCase() === category.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const categories = ["All", "Chargers", "Cables", "Tempered Glass", "Cases", "Earbuds", "Power Banks"];

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
            Upgrade your smartphone with premium fast chargers, rugged cables, glass protectors, and case shells.
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

      {/* Catalog Search Controls */}
      <div className="glass-card rounded-2xl p-5 border border-border flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search chargers, cables, earbuds..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-muted border border-border rounded-xl py-3 pl-11 pr-4 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        {/* Categories scroll tabs */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
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
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredProducts.map((prod) => {
          const isWishlisted = wishlist.includes(prod.id);
          return (
            <div key={prod.id} className="glass-card rounded-2xl p-5 border border-border flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative group">
              {/* Product Visual */}
              <div className="h-44 w-full rounded-xl bg-muted/40 border border-border/40 overflow-hidden flex items-center justify-center relative mb-4 group-hover:border-cyan-500/20 transition-all duration-300">
                {prod.image && prod.id === "acc-7" ? (
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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

              {/* Product Info */}
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[9px] uppercase font-extrabold text-cyan-500 tracking-wider">
                      {prod.brand} &bull; {prod.category}
                    </span>
                    <h3 className="font-bold text-foreground text-sm mt-0.5 leading-tight group-hover:text-cyan-500 transition-colors">
                      {prod.name}
                    </h3>
                  </div>
                  
                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(prod.id)}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Heart className={cn("h-4 w-4", isWishlisted && "fill-red-500 text-red-500")} />
                  </button>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {prod.description}
                </p>

                {/* Rating display */}
                <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  <span>{prod.rating}</span>
                  <span className="text-muted-foreground font-normal">({prod.reviewsCount} reviews)</span>
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-4">
                <span className="text-base font-extrabold text-foreground">{formatINR(prod.price)}</span>
                
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleOpenSpecs(prod)}
                    className="p-2 rounded-xl bg-muted text-muted-foreground border border-border/60 hover:bg-muted/80 transition-colors"
                    title="Specs & Info"
                  >
                    <Info className="h-4.5 w-4.5" />
                  </button>
                  <button
                    onClick={() => handleAddToCart(prod)}
                    className="px-3 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Buy
                  </button>
                </div>
              </div>

            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground text-sm">
            No accessories found matching your criteria.
          </div>
        )}
      </div>

      {/* MODAL: Product Specifications */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-[9px] uppercase font-bold text-cyan-500 tracking-wider">
                  {selectedProduct.brand} &bull; {selectedProduct.category}
                </span>
                <h3 className="text-lg font-bold text-foreground leading-tight mt-0.5">
                  {selectedProduct.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-xs text-muted-foreground hover:text-foreground bg-muted border border-border/50 px-2.5 py-1 rounded-lg"
              >
                Close
              </button>
            </div>

            {/* Modal Product Image (Sliding system) */}
            <div className="h-56 w-full rounded-2xl bg-muted border border-border/50 overflow-hidden flex items-center justify-center relative group/modal">
              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                <>
                  <img
                    src={selectedProduct.images[activeImageIndex]}
                    alt={`${selectedProduct.name} - View ${activeImageIndex + 1}`}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                  
                  {/* Sliding controls */}
                  {selectedProduct.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImageIndex((prev) => (prev === 0 ? selectedProduct.images!.length - 1 : prev - 1))}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/10 opacity-0 group-hover/modal:opacity-100 transition-opacity duration-200"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setActiveImageIndex((prev) => (prev === selectedProduct.images!.length - 1 ? 0 : prev + 1))}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/10 opacity-0 group-hover/modal:opacity-100 transition-opacity duration-200"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      
                      {/* Dots Indicators */}
                      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {selectedProduct.images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveImageIndex(idx)}
                            className={cn(
                              "h-1.5 w-1.5 rounded-full transition-all",
                              activeImageIndex === idx ? "bg-cyan-500 w-3" : "bg-white/50"
                            )}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : selectedProduct.image && selectedProduct.id === "acc-7" ? (
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-purple-500/10 flex items-center justify-center w-full h-full">
                  {selectedProduct.category === "Chargers" && <Zap className="h-16 w-16 text-cyan-400 opacity-60" />}
                  {selectedProduct.category === "Cables" && <Smartphone className="h-16 w-16 text-cyan-400 opacity-60" />}
                  {selectedProduct.category === "Tempered Glass" && <ShieldCheck className="h-16 w-16 text-emerald-400 opacity-60" />}
                  {selectedProduct.category === "Cases" && <Smartphone className="h-16 w-16 text-cyan-400 opacity-60" />}
                  {selectedProduct.category === "Earbuds" && <Star className="h-16 w-16 text-purple-400 opacity-60" />}
                  {selectedProduct.category === "Power Banks" && <Zap className="h-16 w-16 text-cyan-400 opacity-60" />}
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {selectedProduct.description}
            </p>

            {/* Specifications Details Grid */}
            <div className="space-y-3.5">
              <span className="text-xs font-bold text-foreground block uppercase tracking-wider border-b border-border/50 pb-2">
                Technical Specifications
              </span>
              <div className="divide-y divide-border/40 text-xs">
                {Object.entries(selectedProduct.specifications).map(([key, val]) => (
                  <div key={key} className="py-2.5 flex justify-between gap-4">
                    <span className="text-muted-foreground font-medium">{key}:</span>
                    <span className="text-foreground font-bold text-right">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action */}
            <div className="flex gap-2 justify-end pt-4 border-t border-border/50">
              <button
                onClick={() => {
                  handleAddToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2.5 bg-foreground text-background text-xs font-semibold rounded-xl hover:opacity-90 flex items-center gap-1.5"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
