import React from "react";
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart, CartItem } from "@/contexts/CartTypes";

interface CartDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onOpenChange }) => {
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart, totalQuantity } = useCart();

  const totalPrice = cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  const handleIncreaseQuantity = (item: CartItem) => {
    addToCart(item);
  };

  const handleDecreaseQuantity = (item: CartItem) => {
    updateQuantity(item.id, item.quantity - 1);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Shopping Cart ({totalQuantity})
          </SheetTitle>
          <SheetDescription>
            Manage your shopping cart items
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {cart.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border-b border-gray-200">
                    <img
                      src={item.image_url || "https://via.placeholder.com/100x100?text=Dress"}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      <p className="text-xs text-gray-500">{item.shop?.name}</p>
                      <p className="text-sm font-bold text-primary">{item.price ? `₹${item.price.toLocaleString("en-IN")}` : "Price not available"}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{item.size}</Badge>
                        {item.color && <Badge variant="outline" className="text-xs">{item.color}</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDecreaseQuantity(item)}
                        className="w-8 h-8 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleIncreaseQuantity(item)}
                        className="w-8 h-8 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="w-8 h-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-bold text-primary">₹{totalPrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={clearCart} className="flex-1">
                    Clear Cart
                  </Button>
                  <Button className="flex-1 bg-primary text-white hover:bg-primary/90">
                    Checkout
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
