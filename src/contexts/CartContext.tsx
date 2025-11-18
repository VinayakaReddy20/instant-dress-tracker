import React, { useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabaseClient";
import { toast } from "@/components/ui/use-toast";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Tables } from "@/integrations/supabase/types";
import { CartItem, CartContextType } from './CartTypes';
import { CartContext } from './CartContextValue';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { openModal } = useAuthModal();
  const { user, signOut } = useCustomerAuth();

  // Load cart from database when user changes
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cartItems: CartItem[] = cartData?.map((item: any) => ({
          id: item.dresses.id,
          name: item.dresses.name,
          price: item.dresses.price,
          size: item.dresses.size,
          color: item.dresses.color,
          category: item.dresses.category,
          image_url: item.dresses.image_url,
          shop_id: item.dresses.shop_id,
          shop: item.dresses.shops ? {
            name: item.dresses.shops.name,
            location: item.dresses.shops.location
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

    loadCart();
  }, [user, signOut]);

  // Cache auth state to avoid repeated checks
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Auth state changes are handled by the customer auth context
    });

    return () => subscription.unsubscribe();
  }, []);

  const addToCart = async (item: Omit<CartItem, "quantity">) => {
    // Check if customer is logged in
    if (!user) {
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
          .update({ quantity: existingCartItem.quantity + 1 })
          .eq('id', existingCartItem.id);

        if (updateError) {
          console.error('Error updating cart item:', updateError);
          if ((updateError as { status?: number })?.status === 401 || (updateError as { status?: number })?.status === 403 || (updateError as { status?: number })?.status === 406) {
            signOut();
            return;
          }
          return;
        }
      } else {
        // Insert new item
        const { error: insertError } = await supabase
          .from('cart')
          .insert({
            user_id: user.id,
            dress_id: item.id,
            quantity: 1
          });

        if (insertError) {
          console.error('Error inserting cart item:', insertError);
          if ((insertError as { status?: number })?.status === 401 || (insertError as { status?: number })?.status === 403 || (insertError as { status?: number })?.status === 406) {
            signOut();
            return;
          }
          return;
        }
      }

      // Update local state
      setCart((prevCart) => {
        const existingItem = prevCart.find((i) => i.id === item.id);
        if (existingItem) {
          return prevCart.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        } else {
          return [...prevCart, { ...item, quantity: 1 }];
        }
      });

      toast({
        title: "Added to cart!",
        description: `${item.name} has been added to your cart.`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id)
        .eq('dress_id', id);

      if (error) {
        console.error('Error removing from cart:', error);
        if ((error as { status?: number })?.status === 401 || (error as { status?: number })?.status === 403 || (error as { status?: number })?.status === 406) {
          signOut();
          return;
        }
        toast({
          title: "Error",
          description: "Failed to remove item from cart. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (!user) return;

    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('dress_id', id);

      if (error) {
        console.error('Error updating cart quantity:', error);
        if ((error as { status?: number })?.status === 401 || (error as { status?: number })?.status === 403 || (error as { status?: number })?.status === 406) {
          signOut();
          return;
        }
        toast({
          title: "Error",
          description: "Failed to update item quantity. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update item quantity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    if (!user) {
      setCart([]);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing cart:', error);
        if ((error as { status?: number })?.status === 401 || (error as { status?: number })?.status === 403 || (error as { status?: number })?.status === 406) {
          signOut();
          return;
        }
        toast({
          title: "Error",
          description: "Failed to clear cart. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setCart([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        title: "Error",
        description: "Failed to clear cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, totalQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
};
