import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartTypes';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import { CartItem } from '../../contexts/CartTypes';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { toast } from '../../components/ui/use-toast';

export const CartSection: React.FC = () => {
  const { user } = useCustomerAuth();
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to proceed with checkout.",
        variant: "destructive",
      });
      return;
    }
    navigate('/checkout');
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!user) return;

    try {
      await removeFromCart(itemId);
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart.",
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (!user) return;

    try {
      await updateQuantity(itemId, newQuantity);
      if (newQuantity === 0) {
        toast({
          title: "Item Removed",
          description: "Item has been removed from your cart.",
        });
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update item quantity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total: number, item: CartItem) => total + ((item.price ?? 0) * item.quantity), 0);
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Please sign in to view your cart.</p>
          <Button 
            onClick={() => navigate('/customer-auth')}
            className="mt-4"
          >
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (cart.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Your cart is empty.</p>
          <Button 
            onClick={() => navigate('/dresses')}
            className="mt-4"
          >
            Browse Dresses
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Cart</CardTitle>
        <CardDescription>
          Review and manage the items in your cart
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cart.map((item: CartItem) => (
            <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
              <img
                src={item.image_url || '/placeholder.svg'}
                alt={item.name}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.shop?.name}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary">{item.size}</Badge>
                  <Badge variant="secondary">{item.color}</Badge>
                  <Badge variant="outline">{item.category}</Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">Location: {item.shop?.location}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  disabled={isLoading}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-right">
                <p className="font-semibold">₹{item.price ? item.price.toLocaleString() : '0'}</p>
                <p className="text-sm text-gray-600">Total: ₹{item.price ? (item.price * item.quantity).toLocaleString() : '0'}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveItem(item.id)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between items-center border-t pt-4">
          <div>
            <p className="text-lg font-semibold">
              Total: ₹{calculateTotal().toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              {cart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0)} items
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={clearCart}
              disabled={isLoading}
            >
              Clear Cart
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={isLoading}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};