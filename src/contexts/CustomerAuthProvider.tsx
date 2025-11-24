import React, { useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../integrations/supabaseClient";
import { User, Session, AuthChangeEvent, AuthError } from "@supabase/supabase-js";
import { CustomerAuthContext, CustomerAuthContextType } from "./CustomerAuthContext";

interface CustomerProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  location_method: string | null;
  created_at: string;
  updated_at: string;
}

export const CustomerAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      // Check if session is expired or invalid
      if (session && ((session.expires_at && session.expires_at < Date.now() / 1000) || !session.user)) {
        console.log("CustomerAuthProvider: Session expired or invalid, clearing...");
        // Clear local storage
        localStorage.removeItem('supabase.auth.token');
        const supabaseKey = (import.meta.env.VITE_SUPABASE_URL || '').split('.')[0].split('//')[1];
        if (supabaseKey) {
          localStorage.removeItem('sb-' + supabaseKey + '-auth-token');
        }
        sessionStorage.clear();
        supabase.auth.signOut({ scope: 'local' });
        setSession(null);
        setUser(null);
        setCustomerProfile(null);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
        // TODO: Load customer profile if needed
        setCustomerProfile(null); // For now, set to null
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      // Check if session is expired
      if (session && session.expires_at && session.expires_at < Date.now() / 1000) {
        console.log("CustomerAuthProvider: Session expired during auth change, clearing...");
        // Clear local storage
        localStorage.removeItem('supabase.auth.token');
        const supabaseKey = (import.meta.env.VITE_SUPABASE_URL || '').split('.')[0].split('//')[1];
        if (supabaseKey) {
          localStorage.removeItem('sb-' + supabaseKey + '-auth-token');
        }
        sessionStorage.clear();
        supabase.auth.signOut({ scope: 'local' });
        setSession(null);
        setUser(null);
        setCustomerProfile(null);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
        setCustomerProfile(null); // For now, set to null
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    console.log("CustomerAuthContext: Starting sign out...");

    // Clear local state immediately to prevent UI from getting stuck
    setUser(null);
    setSession(null);
    setCustomerProfile(null);
    localStorage.removeItem('supabase.auth.token');
    const supabaseKey = (import.meta.env.VITE_SUPABASE_URL || '').split('.')[0].split('//')[1];
    if (supabaseKey) {
      localStorage.removeItem('sb-' + supabaseKey + '-auth-token');
    }
    sessionStorage.clear();

    // Attempt server-side sign out in background (don't wait for it)
    supabase.auth.signOut({ scope: 'local' }).then(({ error }: { error: AuthError | null }) => {
      if (error) {
        if (error.message?.includes('Invalid Refresh Token') || error.message?.includes('Refresh Token Not Found')) {
          console.warn("CustomerAuthContext: Refresh token expired (handled gracefully)");
        } else {
          console.error("CustomerAuthContext: Sign out error:", error);
        }
      } else {
        console.log("CustomerAuthContext: Sign out completed successfully");
      }
    }).catch((error: Error) => {
      console.error("CustomerAuthContext: Sign out failed:", error);
    });
  };

  const value = {
    user,
    session,
    customerProfile,
    isLoading,
    signOut,
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
};


