import React, { useState, useEffect, ReactNode } from "react";
import { supabase } from "../integrations/supabaseClient";
import { toast } from "../components/ui/use-toast";
import { useAuthModal } from "./AuthModalContext";
import { useCustomerAuth } from "../hooks/useCustomerAuth";
// Removed supabase types import as the types file doesn't exist
import { CartItem, CartContextType } from './CartTypes';
import { CartContext } from './CartContextValue';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { openModal } = useAuthModal();

  // Cache auth state to avoid repeated checks
  useEffect(() => {
    const loadCart = async () => {
      if (!user) {
        setCart([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data: cartData, error } = await supabase
          .from('cart')
          .select(`
            id,
            quantity,
            dresses (
              id,
              name,
              price,
              size,
              color,
              category,
              image_url,
              shop_id,
              shops (
                name,
                location
              )
            )
          `)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error loading cart:', error);
          return;
        }

        // Define interface for the joined data to avoid 'any'
        interface SupabaseCartResponse {
          id: string;
          quantity: number;
          dresses: {
            id: string;
            name: string;
            price: number;
            size: string;
            color: string | null;
            category: string | null;
            image_url: string | null;
            shop_id: string;
            shops: {
              name: string;
              location: string | null;
            } | null;
          } | null;
        }

        const cartItems: CartItem[] = (cartData as unknown as SupabaseCartResponse[])?.map((item) => ({
          id: item.dresses?.id || '',
          name: item.dresses?.name || '',
          price: item.dresses?.price || 0,
          size: item.dresses?.size || '',
          color: item.dresses?.color,
          category: item.dresses?.category,
          image_url: item.dresses?.image_url,
          shop_id: item.dresses?.shop_id || '',
          shop: item.dresses?.shops ? {
            name: item.dresses.shops.name,
            location: item.dresses.shops.location || ''
          } : undefined,
          quantity: item.quantity
        })) || [];

        setCart(cartItems);
      } catch (error: unknown) {
        console.error('Error loading cart:', error);
        if ((error as { status?: number })?.status === 401 || (error as { status?: number })?.status === 403 || (error as { status?: number })?.status === 406) {
          signOut();
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const addToCart = async (item: Omit<CartItem, "quantity">) => {
    // Use cached auth state instead of checking every time
    if (isAuthenticated === false) {
      // Trigger auth modal with callback to add to cart after login
      openModal(() => addToCart(item));
      return;
    }

    try {
      // Check stock availability
      const { data: dressData, error: stockError } = await supabase
        .from('dresses')
        .select('stock')
        .eq('id', item.id)
        .single();

      if (stockError) {
        console.error('Error checking stock:', stockError);
        if ((stockError as { status?: number })?.status === 401 || (stockError as { status?: number })?.status === 403 || (stockError as { status?: number })?.status === 406) {
          signOut();
          return;
        }
        toast({
          title: "Error",
          description: "Failed to check stock availability. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!dressData.stock || dressData.stock <= 0) {
        toast({
          title: "Out of Stock",
          description: "This dress is currently out of stock and cannot be added to your cart.",
          variant: "destructive",
        });
        return;
      }
      // Check if item already exists in cart
      const { data: existingCartItem, error: fetchError } = await supabase
        .from('cart')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('dress_id', item.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error checking cart item:', fetchError);
        if ((fetchError as { status?: number })?.status === 401 || (fetchError as { status?: number })?.status === 403 || (fetchError as { status?: number })?.status === 406) {
          signOut();
          return;
        }
        return;
      }

      if (existingCartItem) {
        // Update quantity
        const { error: updateError } = await supabase
          .from('cart')
          .update({ quantity: (existingCartItem as { quantity: number }).quantity + 1 })
          .eq('id', (existingCartItem as { id: string }).id);

        if (updateError) {
          console.error('Error updating cart item:', updateError);
          if ((updateError as { status?: number })?.status === 401 || (updateError as { status?: number })?.status === 403 || (updateError as { status?: number })?.status === 406) {
            signOut();
            return;
          }
          return;
        }
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });

    toast({
      title: "Added to cart!",
      description: `${item.name} has been added to your cart.`,
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalQuantity = cart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, totalQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
