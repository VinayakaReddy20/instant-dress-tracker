import { useContext } from 'react';
import { CartContext } from '../contexts/CartContextValue';
import { CartContextType } from '../contexts/CartTypes';

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
