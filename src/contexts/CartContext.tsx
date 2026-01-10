import React, { useState, useEffect, ReactNode } from "react";
import { supabase } from "../integrations/supabaseClient";
import { toast } from "../components/ui/use-toast";
import { useAuthModal } from "./useAuthModal";
import { useCustomerAuth } from "../hooks/useCustomerAuth";
import { CartItem, CartContextType, SupabaseCartItem } from './CartTypes';
import { CartContext } from './CartContextValue';
import { stockValidationMiddleware } from "../lib/stockValidationMiddleware";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { user } = useCustomerAuth();
  const { openModal } = useAuthModal();

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
      }
    }
  }, []);

  // Sync cart with localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Sync with Supabase when user logs in
  useEffect(() => {
    const syncWithSupabase = async () => {
      if (!user) return;

      try {
        // Fetch cart items from Supabase
        const { data: supabaseCart, error } = await supabase
          .from("cart")
          .select(`
            id,
            quantity,
            dress_id,
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
          .eq("user_id", user.id);

        if (error) throw error;

        if (supabaseCart && supabaseCart.length > 0) {
          const transformedCart: CartItem[] = supabaseCart.map((item: SupabaseCartItem) => ({
            id: item.dresses.id,
            name: item.dresses.name,
            price: item.dresses.price,
            size: item.dresses.size,
            color: item.dresses.color,
            category: item.dresses.category,
            image_url: item.dresses.image_url,
            shop_id: item.dresses.shop_id,
            shop: item.dresses.shops.location ? {
              name: item.dresses.shops.name,
              location: item.dresses.shops.location
            } : undefined,
            quantity: item.quantity
          }));

          // Merge local cart with Supabase cart (prioritizing Supabase for now)
          setCart(transformedCart);
        }
      } catch (error) {
        console.error("Error syncing cart with Supabase:", error);
      }
    };

    syncWithSupabase();
  }, [user]);

  const addToCart = async (item: Omit<CartItem, "quantity">) => {
    if (!user) {
      // If not logged in, we still add to local cart but show auth modal if needed
      // (The DressDetail page handles showing the modal, but we can also handle it here if preferred)
      setCart((prevCart) => {
        const existingItem = prevCart.find((i) => i.id === item.id);
        if (existingItem) {
          return prevCart.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [...prevCart, { ...item, quantity: 1 }];
      });
      return;
    }

    try {
      // Validate stock before adding to cart
      const validation = await stockValidationMiddleware.validateStock(item.id, {
        quantity: 1,
        showToast: true,
        throwOnError: false
      });

      if (!validation.success) {
        return; // Stock validation failed, don't proceed
      }

      // Use Supabase function for atomic operation with stock validation
      const result = await stockValidationMiddleware.addToCartWithValidation(
        user.id,
        item.id,
        1,
        { showToast: true }
      );

      if (result.success) {
        // Update local state
        setCart((prevCart) => {
          const existingItem = prevCart.find((i) => i.id === item.id);
          if (existingItem) {
            return prevCart.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            );
          }
          return [...prevCart, { ...item, quantity: 1 }];
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );

    if (user) {
      try {
        // Validate stock before updating quantity
        const validation = await stockValidationMiddleware.validateStock(id, {
          quantity,
          showToast: true,
          throwOnError: false
        });

        if (!validation.success) {
          // Revert the local state change if validation fails
          setCart((prevCart) =>
            prevCart.map((item) =>
              item.id === id ? { ...item, quantity: item.quantity } : item
            )
          );
          return;
        }

        // Use Supabase function for atomic operation with stock validation
        const result = await stockValidationMiddleware.updateCartQuantityWithValidation(
          user.id,
          id,
          quantity,
          { showToast: true }
        );

        if (!result.success) {
          // Revert the local state change if the operation fails
          setCart((prevCart) =>
            prevCart.map((item) =>
              item.id === id ? { ...item, quantity: item.quantity } : item
            )
          );
        }
      } catch (error) {
        console.error("Error updating quantity:", error);
        toast({
          title: "Error",
          description: "Failed to update cart quantity. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const removeFromCart = async (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));

    if (user) {
      try {
        const { error } = await supabase
          .from("cart")
          .delete()
          .eq("user_id", user.id)
          .eq("dress_id", id);

        if (error) throw error;
      } catch (error) {
        console.error("Error removing from cart in Supabase:", error);
      }
    }
  };

  const clearCart = async () => {
    setCart([]);
    localStorage.removeItem("cart");

    if (user) {
      try {
        const { error } = await supabase
          .from("cart")
          .delete()
          .eq("user_id", user.id);

        if (error) throw error;
      } catch (error) {
        console.error("Error clearing cart in Supabase:", error);
      }
    }
  };

  const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);

  const value = {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalQuantity
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
