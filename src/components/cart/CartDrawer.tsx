"use client";

import React, { useEffect } from "react";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatINR } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const router = useRouter();

  // Listen for global open events from page triggers
  useEffect(() => {
    const handleOpen = () => {
      // Trigger opening cart drawer
      if (typeof window !== "undefined") {
        // Can call a custom listener
      }
    };
    window.addEventListener("open-cart-drawer", handleOpen);
    return () => window.removeEventListener("open-cart-drawer", handleOpen);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 z-50 h-full w-full sm:w-[450px] bg-card border-l border-border shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-foreground text-sm">Shopping Cart</h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    {cart.length} {cart.length === 1 ? "Item" : "Items"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-colors"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Items List */}
            <div 
              className="p-5 space-y-4"
              style={{ flex: "1 1 0%", overflowY: "auto", minHeight: "0px" }}
            >
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                    <ShoppingBag className="h-8 w-8 stroke-[1.5]" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">Your cart is empty</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
                      Explore our premium mobile accessories to add items to your cart.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      router.push("/accessories");
                    }}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs uppercase tracking-wider hover:bg-cyan-400 transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 bg-muted/40 border border-border/50 rounded-2xl transition-all"
                  >
                    {/* Item Image */}
                    <div 
                      className="rounded-xl overflow-hidden bg-muted border border-border"
                      style={{ width: "64px", height: "64px", flexShrink: 0 }}
                    >
                      <img
                        src={item.image || "/placeholder.jpg"}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-grow min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <h4 className="font-bold text-xs text-foreground truncate">{item.name}</h4>
                        <span className="text-[11px] font-extrabold text-cyan-500 block mt-0.5">
                          {formatINR(item.price)}
                        </span>
                      </div>

                      {/* Quantity & Delete Controls */}
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center border border-border rounded-lg bg-card overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-3 text-xs font-bold text-foreground select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-border bg-card/50 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium">Cart Subtotal:</span>
                  <strong className="text-foreground text-sm font-extrabold">
                    {formatINR(getCartTotal())}
                  </strong>
                </div>

                <div className="space-y-2">
                  <Link
                    href="/billing"
                    onClick={onClose}
                    className="flex w-full justify-center items-center gap-1.5 py-4 rounded-2xl bg-cyan-500 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-cyan-400 active:scale-[0.99] transition-all shadow-md shadow-cyan-500/15"
                  >
                    <span>Proceed to Billing</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <button
                    onClick={onClose}
                    className="w-full text-center py-2 text-[10px] text-muted-foreground hover:text-foreground font-semibold uppercase tracking-wider transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
