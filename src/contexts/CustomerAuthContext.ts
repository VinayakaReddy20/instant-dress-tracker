import { createContext } from "react";
import { User, Session } from "@supabase/supabase-js";

interface CustomerProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  profile_picture_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerAuthContextType {
  user: User | null;
  session: Session | null;
  customerProfile: CustomerProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);