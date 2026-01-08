import React, { createContext } from 'react';
import { CartItem, CartContextType } from './CartTypes';

export const CartContext = createContext<CartContextType | undefined>(undefined);