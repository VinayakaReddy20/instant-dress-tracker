import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabaseClient";
import { toast } from "@/components/ui/use-toast";

export interface StockValidationResult {
  isValid: boolean;
  currentStock: number;
  message: string;
  dressId: string;
}

export interface StockValidationError extends Error {
  type: 'OUT_OF_STOCK' | 'INSUFFICIENT_STOCK' | 'DRESS_NOT_FOUND' | 'VALIDATION_ERROR';
  currentStock?: number;
}

export const useStockValidation = () => {
  const [isCheckingStock, setIsCheckingStock] = useState(false);

  /**
   * Validate if a dress is available for adding to cart
   * @param dressId - The ID of the dress to validate
   * @param quantity - The quantity to add (default: 1)
   * @returns Promise with validation result
   */
  const validateStock = useCallback(async (
    dressId: string, 
    quantity: number = 1
  ): Promise<StockValidationResult> => {
    setIsCheckingStock(true);
    
    try {
      // Fetch current stock from database
      const { data, error } = await supabase
        .from("dresses")
        .select("id, name, stock, price")
        .eq("id", dressId)
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        return {
          isValid: false,
          currentStock: 0,
          message: "Dress not found",
          dressId
        };
      }

      const currentStock = data.stock || 0;

      if (currentStock <= 0) {
        return {
          isValid: false,
          currentStock: 0,
          message: "This dress is currently out of stock",
          dressId
        };
      }

      if (currentStock < quantity) {
        return {
          isValid: false,
          currentStock,
          message: `Only ${currentStock} item(s) available in stock`,
          dressId
        };
      }

      return {
        isValid: true,
        currentStock,
        message: "Item available",
        dressId
      };

    } catch (error) {
      console.error("Stock validation error:", error);
      return {
        isValid: false,
        currentStock: 0,
        message: "Unable to verify stock availability. Please try again.",
        dressId
      };
    } finally {
      setIsCheckingStock(false);
    }
  }, []);

  /**
   * Validate stock and throw error if invalid
   * @param dressId - The ID of the dress to validate
   * @param quantity - The quantity to add (default: 1)
   * @throws StockValidationError if validation fails
   */
  const validateStockOrThrow = useCallback(async (
    dressId: string, 
    quantity: number = 1
  ): Promise<void> => {
    const result = await validateStock(dressId, quantity);
    
    if (!result.isValid) {
      const error = new Error(result.message) as StockValidationError;
      
      if (result.currentStock === 0) {
        error.type = 'OUT_OF_STOCK';
      } else if (result.currentStock < quantity) {
        error.type = 'INSUFFICIENT_STOCK';
        error.currentStock = result.currentStock;
      } else {
        error.type = 'VALIDATION_ERROR';
      }
      
      throw error;
    }
  }, [validateStock]);

  /**
   * Check stock availability and show toast notification
   * @param dressId - The ID of the dress to validate
   * @param quantity - The quantity to add (default: 1)
   * @returns boolean indicating if stock is valid
   */
  const checkStockWithToast = useCallback(async (
    dressId: string, 
    quantity: number = 1
  ): Promise<boolean> => {
    const result = await validateStock(dressId, quantity);
    
    if (!result.isValid) {
      toast({
        title: "Cannot add to cart",
        description: result.message,
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  }, [validateStock]);

  /**
   * Reserve stock for a specific duration (for advanced cart management)
   * @param dressId - The ID of the dress
   * @param quantity - The quantity to reserve
   * @returns Promise indicating success
   */
  const reserveStock = useCallback(async (
    dressId: string, 
    quantity: number = 1
  ): Promise<boolean> => {
    try {
      // This would require a separate reservations table in production
      // For now, we'll just validate stock availability
      const result = await validateStock(dressId, quantity);
      return result.isValid;
    } catch (error) {
      console.error("Stock reservation error:", error);
      return false;
    }
  }, [validateStock]);

  return {
    isCheckingStock,
    validateStock,
    validateStockOrThrow,
    checkStockWithToast,
    reserveStock
  };
};