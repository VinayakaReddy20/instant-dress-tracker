// src/App.tsx
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
import AuthModal from "@/components/AuthModal";
import CustomerAuthModal from "@/components/CustomerAuthModal";
import CustomerAuth from "./pages/CustomerAuth";
import { supabase } from "@/integrations/supabaseClient";
import { CartProvider } from "@/contexts/CartContext";
import { AuthModalProvider, useAuthModal } from "@/contexts/AuthModalContext";
import { CustomerAuthProvider } from "@/contexts/CustomerAuthContext";

const queryClient = new QueryClient();

// --- Protected Route ---
const ProtectedRoute: React.FC<{ children: JSX.Element | null }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      setIsAuthenticated(!!data.user);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    return () => subscription?.unsubscribe();
  }, []);

  if (isAuthenticated === null) return null; // waiting for auth check
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

// --- App Content Component ---
const AppContent: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const { isOpen, closeModal } = useAuthModal();

  // Handle login success from AuthModal
  const handleLoginSuccess = (id: string) => {
    setOwnerId(id);
  };

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
      <BrowserRouter>
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
        <CustomerAuthModal
          isOpen={isOpen}
          onClose={closeModal}
        />

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dresses" element={<Dresses />} />
          <Route path="/dress/:dressId" element={<DressDetail />} />
          <Route path="/shops" element={<Shops />} />
          <Route path="/shop/:shopId" element={<ShopDetail />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/customer-auth" element={<CustomerAuth />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
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
          <CartProvider>
            <CustomerAuthProvider>
              <AppContent />
            </CustomerAuthProvider>
          </CartProvider>
        </AuthModalProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
