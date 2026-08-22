"use client";

import React, { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { Heart, Package, Trash2, Eye, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { formatINR } from "@/lib/utils";

interface Accessory {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  stock_quantity: number;
  images: string[];
}

export default function WishlistPage() {
  const [items, setItems] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlistItems = async () => {
    setLoading(true);
    const savedWishlist = localStorage.getItem("sc_wishlist");
    if (!savedWishlist) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      const wishlistIds = JSON.parse(savedWishlist) as string[];
      if (wishlistIds.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      let loadedItems: Accessory[] = [];
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from("accessories")
            .select("*")
            .in("id", wishlistIds);

          if (!error && data) {
            loadedItems = data;
          }
        } catch (err) {
          console.warn("Supabase wishlist load error:", err);
        }
      }

      if (loadedItems.length === 0 && typeof window !== "undefined") {
        const savedCustom = localStorage.getItem("sc_custom_accessories");
        if (savedCustom) {
          try {
            const parsedCustom: Accessory[] = JSON.parse(savedCustom);
            loadedItems = parsedCustom.filter(item => wishlistIds.includes(String(item.id)));
          } catch (e) {}
        }
      }

      setItems(loadedItems);
    } catch (e) {
      console.error("Error reading wishlist:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWishlistItems();

    // Listen for storage changes (if modified in other tabs/pages)
    const handleStorage = () => {
      fetchWishlistItems();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleRemoveFromWishlist = (id: string) => {
    const savedWishlist = localStorage.getItem("sc_wishlist");
    if (!savedWishlist) return;

    try {
      const wishlistIds = JSON.parse(savedWishlist) as string[];
      const updatedWishlist = wishlistIds.filter(item => item !== id);
      localStorage.setItem("sc_wishlist", JSON.stringify(updatedWishlist));
      
      // Dispatch custom event to notify components/navbars
      window.dispatchEvent(new Event("storage"));
      
      // Directly update state
      setItems(items.filter(item => item.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10">
          <Heart className="h-5 w-5 fill-current" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Saved & Wishlist</h2>
          <p className="text-xs text-muted-foreground">Keep track of your favorite accessories and gadgets</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-border flex flex-col items-center justify-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <Heart className="h-8 w-8" />
          </div>
          <div className="max-w-sm">
            <h3 className="font-semibold text-foreground text-base">Your wishlist is empty</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Tap the heart icon on any product in our catalog to save it here for quick access later!
            </p>
          </div>
          <Link
            href="/accessories"
            className="px-6 py-2.5 bg-foreground text-background text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="glass-card rounded-2xl border border-border overflow-hidden flex flex-col group relative">
              {/* Product Image */}
              <div className="h-48 bg-muted border-b border-border flex items-center justify-center overflow-hidden relative">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <Package className="h-12 w-12 text-muted-foreground" />
                )}
                
                {/* Remove button overlay */}
                <button
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  title="Remove from wishlist"
                  className="absolute top-3 right-3 h-8 w-8 rounded-lg bg-black/60 hover:bg-red-500/90 text-white flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Details card */}
              <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">
                    {item.brand} • {item.category}
                  </span>
                  <h4 className="font-semibold text-foreground text-sm line-clamp-2 min-h-[40px]">
                    {item.name}
                  </h4>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-base">
                    {formatINR(item.price)}
                  </span>
                  <span className={`text-[10px] font-bold ${item.stock_quantity > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {item.stock_quantity > 0 ? 'IN STOCK' : 'OUT OF STOCK'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                  <Link
                    href={`/accessories/${item.id}`}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-muted hover:bg-muted/80 text-[10px] font-bold text-foreground transition-all duration-200"
                  >
                    <Eye className="h-3 w-3" />
                    Details
                  </Link>
                  <Link
                    href={`/accessories/${item.id}`}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-foreground hover:opacity-90 text-[10px] font-bold text-background transition-all duration-200"
                  >
                    <ShoppingCart className="h-3 w-3" />
                    Order Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
