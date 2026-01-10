import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabaseClient";
import { User, Session } from "@supabase/supabase-js";

export interface CustomerProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  profile_picture_url: string | null;
  created_at: string;
  updated_at: string;
  location_method: string | null;
}

export interface CustomerAuthContextType {
  user: User | null;
  session: Session | null;
  customerProfile: CustomerProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);
