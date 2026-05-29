"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface CartItem {
  id: number;
  nameEn: string;
  nameBn: string;
  icon: string;
  iconBg: string;
  image: string;
  duration: string;
  priceBdt: number;
  priceUsdt: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  totalBdt: number;
  totalUsdt: number;
  toast: string | null;
  clearToast: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const addToCart = useCallback((item: CartItem) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === item.id && i.duration === item.duration);
      if (exists) {
        setToast("Already in cart!");
        return prev;
      }
      setToast("Added to cart!");
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const clearToast = useCallback(() => setToast(null), []);

  const totalBdt = items.reduce((sum, i) => sum + i.priceBdt, 0);
  const totalUsdt = items.reduce((sum, i) => sum + i.priceUsdt, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, clearCart, totalBdt, totalUsdt, toast, clearToast }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
