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
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalQuantity: number;
}

export interface SupabaseCartItem {
  id: string;
  quantity: number;
  dress_id: string;
  dresses: {
    id: string;
    name: string;
    price: number | null;
    size: string;
    color?: string | null | undefined;
    category?: string | null | undefined;
    image_url?: string | null | undefined;
    shop_id: string;
    shops: {
      name: string;
      location: string | null;
    };
  };
}
