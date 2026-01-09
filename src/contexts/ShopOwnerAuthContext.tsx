import { createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";

export interface ShopOwnerAuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export const ShopOwnerAuthContext = createContext<ShopOwnerAuthContextType | undefined>(undefined);

export const useShopOwnerAuth = (): ShopOwnerAuthContextType => {
  const context = useContext(ShopOwnerAuthContext);
  if (!context) {
    throw new Error("useShopOwnerAuth must be used within a ShopOwnerAuthProvider");
  }
  return context;
};
