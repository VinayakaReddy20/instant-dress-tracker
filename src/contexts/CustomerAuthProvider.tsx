import React, { useContext, useState, useEffect, ReactNode, useRef } from "react";
import { supabase } from "../integrations/supabaseClient";
import { User, Session, AuthChangeEvent, AuthError } from "@supabase/supabase-js";
import { CustomerAuthContext, CustomerAuthContextType, CustomerProfile } from "./CustomerAuthContext";

const handleOAuthUserProfile = async (user: User) => {
  try {
    // Check if this is an OAuth user (has identities)
    if (!user.identities || user.identities.length === 0) {
      return; // Not an OAuth user, skip
    }

    // Check if customer profile already exists
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existingCustomer) {
      return; // Profile already exists
    }

    // Extract Google profile data from user metadata
    const customerData = {
      user_id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      phone: user.user_metadata?.phone || '',
    };

    // Create customer profile
    const { error: insertError } = await supabase
      .from("customers")
      .insert(customerData);

    if (insertError) {
      console.error("Error creating OAuth customer profile:", insertError);
    } else {
      console.log("OAuth customer profile created successfully");
    }
  } catch (error) {
    console.error("Error handling OAuth user profile:", error);
  }
};

const fetchCustomerProfile = async (userId: string): Promise<CustomerProfile | null> => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching customer profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching customer profile:", error);
    return null;
  }
};

export const CustomerAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Refs to prevent duplicate auth checks and ensure loading always resolves
  const authInitializedRef = useRef(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const authChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Prevent duplicate initialization
    if (authInitializedRef.current) {
      return;
    }
    authInitializedRef.current = true;

    // Set a timeout to ensure loading always resolves (failsafe)
    loadingTimeoutRef.current = setTimeout(() => {
      console.warn("CustomerAuthProvider: Auth check timeout - forcing loading to false");
      setIsLoading(false);
    }, 10000); // 10 second timeout

    // Get initial session with error handling
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("CustomerAuthProvider: Error getting session:", error);
          setIsLoading(false);
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
          }
          return;
        }

        // Set session and user state
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch customer profile if user exists
        if (session?.user) {
          const profile = await fetchCustomerProfile(session.user.id);
          setCustomerProfile(profile);
        }
      } catch (error) {
        console.error("CustomerAuthProvider: Unexpected error during auth initialization:", error);
      } finally {
        setIsLoading(false);
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes with debouncing
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      // Debounce auth changes to prevent rapid firing
      if (authChangeTimeoutRef.current) {
        clearTimeout(authChangeTimeoutRef.current);
      }

      authChangeTimeoutRef.current = setTimeout(async () => {
        try {
          // Set session and user state
          setSession(session);
          setUser(session?.user ?? null);

          // Fetch customer profile if user exists
          if (session?.user) {
            const profile = await fetchCustomerProfile(session.user.id);
            setCustomerProfile(profile);
          } else {
            setCustomerProfile(null);
          }

          // Handle OAuth user profile creation if user just signed in
          if (session?.user && _event === 'SIGNED_IN') {
            await handleOAuthUserProfile(session.user);
            
            // Handle post-authentication redirect using our new utility
            const { RedirectStateStorage } = await import('@/lib/authGuard');
            const redirectState = RedirectStateStorage.getRedirectPath();
            
            if (redirectState) {
              const targetPath = redirectState.search 
                ? `${redirectState.path}${redirectState.search}`
                : redirectState.path;
              
              RedirectStateStorage.clearRedirectPath();
              // Use setTimeout to ensure the redirect happens after the auth state is fully established
              setTimeout(() => {
                window.location.href = targetPath;
              }, 100);
            }
          }
        } catch (error) {
          console.error("CustomerAuthProvider: Error during auth state change:", error);
        }
      }, 100); // 100ms debounce
    });

    return () => {
      subscription.unsubscribe();
      if (authChangeTimeoutRef.current) {
        clearTimeout(authChangeTimeoutRef.current);
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  const signOut = async () => {
    console.log("CustomerAuthContext: Starting sign out...");

    try {
      // Clear local state immediately to prevent UI from getting stuck
      setUser(null);
      setSession(null);
      setCustomerProfile(null);

      // Sign out from Supabase (this will clear storage automatically)
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("CustomerAuthContext: Sign out error:", error);
      } else {
        console.log("CustomerAuthContext: Sign out completed successfully");
      }
    } catch (error) {
      console.error("CustomerAuthContext: Sign out failed:", error);
    }
  };

  const value: CustomerAuthContextType = {
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
