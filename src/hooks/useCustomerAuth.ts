import { useContext } from "react";
import { CustomerAuthContext, CustomerAuthContextType } from "@/contexts/CustomerAuthContext";
import { User, Session } from "@supabase/supabase-js";

export const useCustomerAuth = (): CustomerAuthContextType => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
};
