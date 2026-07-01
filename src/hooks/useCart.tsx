"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  type: "medicine" | "accessory";
  name: string;
  price: number;
  quantity: number;
  image: string;
  brandPrice?: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getSavingsTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("sc_cart");
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch (e) {
        setCart([]);
      }
    }
  }, []);

  // Save cart to localStorage on changes
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("sc_cart", JSON.stringify(newCart));
    // Dispatch storage event to update other instances (like navbar badge)
    window.dispatchEvent(new Event("storage"));
  };

  const addToCart = (item: Omit<CartItem, "quantity">, qty: number = 1) => {
    const existing = cart.find((i) => i.id === item.id);
    let newCart: CartItem[];
    if (existing) {
      newCart = cart.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + qty } : i
      );
    } else {
      newCart = [...cart, { ...item, quantity: qty }];
    }
    saveCart(newCart);
  };

  const removeFromCart = (id: string) => {
    const newCart = cart.filter((i) => i.id !== id);
    saveCart(newCart);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    const newCart = cart.map((i) =>
      i.id === id ? { ...i, quantity } : i
    );
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const getSavingsTotal = () => {
    return cart.reduce((acc, item) => {
      if (item.type === "medicine" && item.brandPrice) {
        const itemSavings = (item.brandPrice - item.price) * item.quantity;
        return acc + itemSavings;
      }
      return acc;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getSavingsTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
