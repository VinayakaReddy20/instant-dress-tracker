import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";


import Landing from "./pages/Landing";
import Dresses from "./pages/Dresses";
import DressDetail from "./pages/DressDetail";
import Shops from "./pages/Shops";
import ShopDetail from "./pages/ShopDetail";
import Dashboard from "./pages/Dashboard";
import SearchResults from "./pages/SearchResults";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import AuthModal from "@/components/AuthModal";
import CustomerAuthModal from "@/components/CustomerAuthModal";
import CustomerAuth from "./pages/CustomerAuth";
import CustomerProfile from "./pages/CustomerProfile";
import SessionConfirmModal from "@/components/SessionConfirmModal";
import { supabase } from "@/integrations/supabaseClient";
import { CartProvider } from "@/contexts/CartContext";
import { AuthModalProvider, useAuthModal } from "@/contexts/AuthModalContext";
import { CustomerAuthProvider } from "@/contexts/CustomerAuthProvider";
import { useCustomerAuth } from "./hooks/useCustomerAuth";

const queryClient = new QueryClient();

// --- Protected Route ---
const ProtectedRoute: React.FC<{ children: JSX.Element | null }> = ({ children }) => {
  const { user, isLoading } = useCustomerAuth();

  if (isLoading) return null; // waiting for auth check
  if (!user) return <Navigate to="/" replace />;
  return children;
};

// --- App Content Component ---
const AppContent: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [showSessionConfirm, setShowSessionConfirm] = useState(false);
  const [pendingSession, setPendingSession] = useState<{ type: 'shop_owner' | 'customer'; email?: string } | null>(null);
  const { isOpen, closeModal } = useAuthModal();

  // Handle login success from AuthModal
  const handleLoginSuccess = (id: string) => {
    setOwnerId(id);
  };

  // Session confirmation handlers
  const handleConfirmSession = () => {
    setShowSessionConfirm(false);
    setPendingSession(null);
  };

  const handleDenySession = async () => {
    setShowSessionConfirm(false);
    setPendingSession(null);
    
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      console.error("Logout error:", error);
    }
    
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('sb-' + (import.meta.env.VITE_SUPABASE_URL || '').split('.')[0].split('//')[1] + '-auth-token');
    sessionStorage.clear();
    
    window.location.replace('/');
  };

  // Clear sessions and check for returning users on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          const user = data.session.user;
          
          try {
            const { data: shopOwnerData, error } = await supabase
              .from("shop_owners")
              .select("id")
              .eq("user_id", user.id)
              .maybeSingle();

            if (shopOwnerData && !error) {
              setPendingSession({ type: 'shop_owner', email: user.email });
              setShowSessionConfirm(true);
            }
            // For customers, no modal needed - they can proceed directly
          } catch (queryError) {
            // If query fails, assume customer and proceed without modal
            console.warn("Failed to check shop owner status:", queryError);
          }
        }
      } catch (error) {
        console.error("Session initialization error:", error);
      }
    };

    initializeSession();
  }, []);

  // Keep ownerId in sync with Supabase session
  useEffect(() => {
    const fetchUserId = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) setOwnerId(data.user.id);
    };

    fetchUserId();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setOwnerId(session.user.id);
      } else {
        setOwnerId(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  return (
    <>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
        <CustomerAuthModal
          isOpen={isOpen}
          onClose={closeModal}
        />
        
        {showSessionConfirm && pendingSession && (
          <SessionConfirmModal
            userEmail={pendingSession.email || ""}
            userType={pendingSession.type}
            onConfirm={handleConfirmSession}
            onDeny={handleDenySession}
          />
        )}

        <Routes>
           <Route path="/" element={<Landing />} />
           <Route
             path="/dresses"
             element={
               <ProtectedRoute>
                 <Dresses />
               </ProtectedRoute>
             }
           />
           <Route
             path="/dress/:dressId"
             element={
               <ProtectedRoute>
                 <DressDetail />
               </ProtectedRoute>
             }
           />
           <Route
             path="/shops"
             element={
               <ProtectedRoute>
                 <Shops />
               </ProtectedRoute>
             }
           />
           <Route
             path="/shop/:shopId"
             element={
               <ProtectedRoute>
                 <ShopDetail />
               </ProtectedRoute>
             }
           />
           <Route
             path="/search"
             element={
               <ProtectedRoute>
                 <SearchResults />
               </ProtectedRoute>
             }
           />
           <Route path="/customer-auth" element={<CustomerAuth />} />
           <Route path="/reset-password" element={<ResetPassword />} />

           <Route
             path="/dashboard"
             element={
               <ProtectedRoute>
                 <Dashboard />
               </ProtectedRoute>
             }
           />

           <Route
             path="/customer-profile"
             element={
               <ProtectedRoute>
                 <CustomerProfile />
               </ProtectedRoute>
             }
           />

           {/* Catch-all */}
           <Route path="*" element={<NotFound />} />
         </Routes>
      </BrowserRouter>
    </>
  );
};

// --- Main App ---
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthModalProvider>
          <CustomerAuthProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </CustomerAuthProvider>
        </AuthModalProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
