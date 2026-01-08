import React from 'react';
import { CartContext } from './CartContextValue';

export interface CartItem {
  id: string;
  name: string;
  price: number | null;
  size: string;
  color?: string | null | undefined;
  category?: string | null | undefined;
  image_url?: string | null | undefined;
  shop_id: string;
  shop?: { name: string; location: string };
  quantity: number;
}

export interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalQuantity: number;
}

export const useCart = (): CartContextType => {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};