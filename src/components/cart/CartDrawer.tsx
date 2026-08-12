"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background body scrolling when cart is open
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }
    }
    return () => {
      if (typeof window !== "undefined") {
        document.body.style.overflow = "unset";
      }
    };
  }, [isOpen]);

  if (!mounted) return null;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex justify-end">
          {/* Full Screen Dark Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Full Height Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 240 }}
            className="relative z-10 h-full h-[100dvh] w-full sm:w-[440px] max-w-full bg-background dark:bg-[#0a0d14] text-foreground border-l border-border/80 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-border/80 flex items-center justify-between bg-card/90 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center border border-cyan-500/20 shadow-sm shrink-0">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-foreground text-base leading-tight">Your Shopping Cart</h3>
                  <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">
                    {cart.length} {cart.length === 1 ? "Item" : "Items"} Selected
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted/80 transition-colors border border-border/40 shrink-0"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Cart Items Section */}
            <div 
              className="p-5 space-y-4 overflow-y-auto flex-1"
              style={{ minHeight: "0px" }}
            >
              {cart.length === 0 ? (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center space-y-4 py-12">
                  <div className="h-20 w-20 bg-muted/60 border border-border rounded-full flex items-center justify-center text-muted-foreground shadow-inner">
                    <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-extrabold text-foreground text-base">Your cart is currently empty</p>
                    <p className="text-xs text-muted-foreground max-w-[220px] mx-auto leading-relaxed">
                      Explore our catalog of premium chargers, cases, screen protectors & cables.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      router.push("/accessories");
                    }}
                    className="px-6 py-3 rounded-2xl bg-cyan-500 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-cyan-400 transition-colors shadow-md shadow-cyan-500/10"
                  >
                    Explore Accessories
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3.5 bg-muted/30 border border-border/70 rounded-2xl transition-all hover:border-cyan-500/30"
                  >
                    {/* Item Image */}
                    <div 
                      className="rounded-xl overflow-hidden bg-card border border-border shrink-0"
                      style={{ width: "68px", height: "68px" }}
                    >
                      <img
                        src={item.image || "/shop_accessories.png"}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/shop_accessories.png";
                        }}
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-grow min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <h4 className="font-extrabold text-xs text-foreground truncate">{item.name}</h4>
                        <span className="text-xs font-black text-cyan-500 block mt-1">
                          {formatINR(item.price)}
                        </span>
                      </div>

                      {/* Quantity & Delete Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-border/80 rounded-xl bg-card overflow-hidden shadow-sm">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-3 text-xs font-black text-foreground select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-muted-foreground hover:text-red-500 rounded-xl hover:bg-red-500/10 transition-colors"
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
              <div className="p-5 border-t border-border/80 bg-card dark:bg-[#0c0f17] space-y-3.5 shadow-2xl shrink-0">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">Subtotal Amount:</span>
                  <strong className="text-foreground text-base font-black text-cyan-500">
                    {formatINR(getCartTotal())}
                  </strong>
                </div>

                <div className="space-y-2 pt-1">
                  <Link
                    href="/billing"
                    onClick={onClose}
                    className="flex w-full justify-center items-center gap-2 py-3.5 rounded-2xl bg-cyan-500 text-black font-black text-xs uppercase tracking-wider hover:bg-cyan-400 active:scale-[0.99] transition-all shadow-lg shadow-cyan-500/20"
                  >
                    <span>Proceed to Billing</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </Link>

                  <button
                    onClick={onClose}
                    className="w-full py-3 rounded-2xl bg-muted border border-border text-foreground font-extrabold text-xs uppercase tracking-wider hover:bg-muted/80 transition-colors text-center"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
