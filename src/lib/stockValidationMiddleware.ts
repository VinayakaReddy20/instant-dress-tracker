import { supabase } from "@/integrations/supabaseClient";
import { toast } from "@/components/ui/use-toast";
import type { Database } from "@/types";

export interface StockValidationOptions {
  showToast?: boolean;
  throwOnError?: boolean;
  quantity?: number;
}

export interface StockValidationResponse {
  success: boolean;
  message: string;
  data?: {
    valid: boolean;
    currentStock: number;
    dressId: string;
    dressName?: string;
  };
  error?: {
    type: 'OUT_OF_STOCK' | 'INSUFFICIENT_STOCK' | 'DRESS_NOT_FOUND' | 'VALIDATION_ERROR' | 'CART_ERROR';
    currentStock?: number;
    requestedQuantity?: number;
  };
}

interface ValidationError extends Error {
  type?: 'OUT_OF_STOCK' | 'INSUFFICIENT_STOCK' | 'DRESS_NOT_FOUND' | 'VALIDATION_ERROR' | 'CART_ERROR';
  currentStock?: number;
}

/**
 * Client-side middleware for stock validation
 * Provides a centralized way to validate stock before any cart operations
 */
export class StockValidationMiddleware {
  private static instance: StockValidationMiddleware;
  private isCheckingStock = false;

  static getInstance(): StockValidationMiddleware {
    if (!StockValidationMiddleware.instance) {
      StockValidationMiddleware.instance = new StockValidationMiddleware();
    }
    return StockValidationMiddleware.instance;
  }

  /**
   * Validate stock using Supabase function
   */
  private async validateStockViaFunction(
    dressId: string,
    quantity: number = 1
  ): Promise<StockValidationResponse> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.rpc as any)('validate_dress_stock', {
          p_dress_id: dressId,
          p_quantity: quantity
        });

      if (error) {
        throw error;
      }

      if (data && typeof data === 'object') {
        const responseData = data as {
          valid: boolean;
          message?: string;
          current_stock?: number;
          dress_id?: string;
          dress_name?: string;
          error_type?: string;
          requested_quantity?: number;
        };
        if (responseData.valid) {
          return {
            success: true,
            message: responseData.message || "Stock validation successful",
            data: {
              valid: true,
              currentStock: responseData.current_stock || 0,
              dressId: responseData.dress_id || dressId,
              dressName: responseData.dress_name
            }
          };
        } else {
          return {
            success: false,
            message: responseData.message || "Stock validation failed",
            error: {
              type: responseData.error_type as 'OUT_OF_STOCK' | 'INSUFFICIENT_STOCK' | 'DRESS_NOT_FOUND' | 'VALIDATION_ERROR',
              currentStock: responseData.current_stock,
              requestedQuantity: responseData.requested_quantity
            }
          };
        }
      }

      throw new Error("Invalid response format from validation function");

    } catch (error: unknown) {
      console.error("Stock validation error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Stock validation failed",
        error: {
          type: 'VALIDATION_ERROR'
        }
      };
    }
  }

  /**
   * Validate stock using direct database query (fallback)
   */
  private async validateStockDirect(
    dressId: string, 
    quantity: number = 1
  ): Promise<StockValidationResponse> {
    try {
      const { data, error } = await supabase
        .from("dresses")
        .select("id, name, stock, price")
        .eq("id", dressId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        return {
          success: false,
          message: "Dress not found",
          error: {
            type: 'DRESS_NOT_FOUND'
          }
        };
      }

      const currentStock = data.stock || 0;

      if (currentStock <= 0) {
        return {
          success: false,
          message: "This dress is currently out of stock",
          error: {
            type: 'OUT_OF_STOCK',
            currentStock: 0
          }
        };
      }

      if (currentStock < quantity) {
        return {
          success: false,
          message: `Only ${currentStock} item(s) available in stock`,
          error: {
            type: 'INSUFFICIENT_STOCK',
            currentStock,
            requestedQuantity: quantity
          }
        };
      }

      return {
        success: true,
        message: "Stock validation successful",
        data: {
          valid: true,
          currentStock,
          dressId: data.id,
          dressName: data.name
        }
      };

    } catch (error: unknown) {
      console.error("Direct stock validation error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Stock validation failed",
        error: {
          type: 'VALIDATION_ERROR'
        }
      };
    }
  }

  /**
   * Main validation method with fallback mechanism
   */
  async validateStock(
    dressId: string, 
    options: StockValidationOptions = {}
  ): Promise<StockValidationResponse> {
    const {
      showToast = true,
      throwOnError = false,
      quantity = 1
    } = options;

    // Prevent concurrent validation requests
    if (this.isCheckingStock) {
      return {
        success: false,
        message: "Stock validation in progress",
        error: {
          type: 'VALIDATION_ERROR'
        }
      };
    }

    this.isCheckingStock = true;

    try {
      // Try Supabase function first
      let result = await this.validateStockViaFunction(dressId, quantity);

      // If function fails, try direct query as fallback
      if (!result.success && result.error?.type === 'VALIDATION_ERROR') {
        result = await this.validateStockDirect(dressId, quantity);
      }

      // Show toast notification if requested
      if (showToast && !result.success) {
        toast({
          title: "Cannot add to cart",
          description: result.message,
          variant: "destructive"
        });
      }

      // Throw error if requested
      if (throwOnError && !result.success) {
        const validationError = new Error(result.message) as ValidationError;
        if (result.error) {
          validationError.type = result.error.type;
          validationError.currentStock = result.error.currentStock;
        }
        throw validationError;
      }

      return result;

    } finally {
      this.isCheckingStock = false;
    }
  }

  /**
   * Add item to cart with validation using Supabase function
   */
  async addToCartWithValidation(
    userId: string,
    dressId: string,
    quantity: number = 1,
    options: StockValidationOptions = {}
  ): Promise<StockValidationResponse> {
    const validation = await this.validateStock(dressId, { ...options, quantity });

    if (!validation.success) {
      return validation;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.rpc as any)('add_to_cart_with_validation', {
          p_user_id: userId,
          p_dress_id: dressId,
          p_quantity: quantity
        });

      if (error) {
        throw error;
      }

      if (data && typeof data === 'object') {
        const responseData = data as {
          success: boolean;
          message?: string;
          error_type?: string;
        };
        if (responseData.success) {
          if (options.showToast) {
            toast({
              title: "Added to cart!",
              description: responseData.message || "Item added to cart successfully"
            });
          }
          return {
            success: true,
            message: responseData.message || "Item added to cart successfully",
            data: {
              valid: true,
              currentStock: validation.data?.currentStock || 0,
              dressId: dressId
            }
          };
        } else {
          return {
            success: false,
            message: responseData.message || "Failed to add item to cart",
            error: {
              type: responseData.error_type as 'OUT_OF_STOCK' | 'INSUFFICIENT_STOCK' | 'DRESS_NOT_FOUND' | 'VALIDATION_ERROR' || 'CART_ERROR'
            }
          };
        }
      }

      throw new Error("Invalid response format from add_to_cart function");

    } catch (error: unknown) {
      console.error("Add to cart error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to add item to cart",
        error: {
          type: 'CART_ERROR'
        }
      };
    }
  }

  /**
   * Update cart quantity with validation
   */
  async updateCartQuantityWithValidation(
    userId: string,
    dressId: string,
    newQuantity: number,
    options: StockValidationOptions = {}
  ): Promise<StockValidationResponse> {
    const validation = await this.validateStock(dressId, { ...options, quantity: newQuantity });

    if (!validation.success) {
      return validation;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.rpc as any)('update_cart_quantity_with_validation', {
          p_user_id: userId,
          p_dress_id: dressId,
          p_new_quantity: newQuantity
        });

      if (error) {
        throw error;
      }

      if (data && typeof data === 'object') {
        const responseData = data as {
          success: boolean;
          message?: string;
          error_type?: string;
        };
        if (responseData.success) {
          if (options.showToast) {
            toast({
              title: "Cart updated!",
              description: responseData.message || "Cart quantity updated successfully"
            });
          }
          return {
            success: true,
            message: responseData.message || "Cart quantity updated successfully",
            data: {
              valid: true,
              currentStock: validation.data?.currentStock || 0,
              dressId: dressId
            }
          };
        } else {
          return {
            success: false,
            message: responseData.message || "Failed to update cart quantity",
            error: {
              type: responseData.error_type as 'OUT_OF_STOCK' | 'INSUFFICIENT_STOCK' | 'DRESS_NOT_FOUND' | 'VALIDATION_ERROR' || 'CART_ERROR'
            }
          };
        }
      }

      throw new Error("Invalid response format from update_cart_quantity function");

    } catch (error: unknown) {
      console.error("Update cart quantity error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update cart quantity",
        error: {
          type: 'CART_ERROR'
        }
      };
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(
    userId: string,
    dressId: string,
    options: StockValidationOptions = {}
  ): Promise<StockValidationResponse> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.rpc as any)('remove_from_cart', {
          p_user_id: userId,
          p_dress_id: dressId
        });

      if (error) {
        throw error;
      }

      if (data && typeof data === 'object') {
        const responseData = data as {
          success: boolean;
          message?: string;
          error_type?: string;
        };
        if (responseData.success) {
          if (options.showToast) {
            toast({
              title: "Removed from cart",
              description: responseData.message || "Item removed from cart successfully"
            });
          }
          return {
            success: true,
            message: responseData.message || "Item removed from cart successfully"
          };
        } else {
          return {
            success: false,
            message: responseData.message || "Failed to remove item from cart",
            error: {
              type: responseData.error_type as 'OUT_OF_STOCK' | 'INSUFFICIENT_STOCK' | 'DRESS_NOT_FOUND' | 'VALIDATION_ERROR' || 'CART_ERROR'
            }
          };
        }
      }

      throw new Error("Invalid response format from remove_from_cart function");

    } catch (error: unknown) {
      console.error("Remove from cart error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to remove item from cart",
        error: {
          type: 'CART_ERROR'
        }
      };
    }
  }

  /**
   * Check if stock validation is currently in progress
   */
  isValidationInProgress(): boolean {
    return this.isCheckingStock;
  }
}

// Export singleton instance
export const stockValidationMiddleware = StockValidationMiddleware.getInstance();