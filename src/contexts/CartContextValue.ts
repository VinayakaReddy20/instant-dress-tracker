import React from 'react';
import { CartContextType } from './CartTypes';

export const CartContext = React.createContext<CartContextType | undefined>(undefined);