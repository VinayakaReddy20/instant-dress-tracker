import { useState, useEffect, useRef, memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Store, Search, User, Menu, ShoppingCart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/contexts/CartContext";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavbarProps {
  onLogin?: () => void; // ✅ allow Dashboard to pass fetchDashboard
  onSearch?: (query: string) => void; // Optional search handler for Landing page
}

const Navbar: React.FC<NavbarProps> = ({ onLogin, onSearch }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const { totalQuantity } = useCart();
  const { user, customerProfile, signOut } = useCustomerAuth();
  const { openModal } = useAuthModal();
  const isMobile = useIsMobile();

  const isActive = (path: string) => location.pathname === path;

  const handleLoginSuccess = (ownerId: string) => {
    console.log("Login successful, owner ID:", ownerId);
    if (onLogin) {
      onLogin(); // ✅ notify parent (Dashboard)
    }
  };

  const handleCustomerLogin = () => {
    openModal(() => {});
  };

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-primary font-playfair">
                IDT
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {onSearch && (
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search dresses, shops, styles..."
                    className="pl-12 pr-4 py-3 w-80 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                    onChange={(e) => onSearch(e.target.value)}
                  />
                </div>
              )}
              <Link
                to="/shops"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/shops")
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                } flex items-center space-x-1`}
              >
                <Store className="w-4 h-4" />
                <span>Shops</span>
              </Link>
              <Link
                to="/dresses"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/dresses")
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                } flex items-center space-x-1`}
              >
                <Search className="w-4 h-4" />
                <span>Dresses</span>
              </Link>
              <Button
                variant="ghost"
                className="relative flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-gray-100"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Cart</span>
                {totalQuantity > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 py-0 min-w-[18px] h-5 flex items-center justify-center">
                    {totalQuantity}
                  </Badge>
                )}
              </Button>
              {user ? (
                <Link
                  to="/customer-dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 ${
                    isActive("/customer-dashboard")
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Button
                  onClick={handleCustomerLogin}
                  className="bg-primary text-white hover:bg-primary-dark flex items-center space-x-1 px-3 py-2 rounded-md"
                >
                  <User className="w-4 h-4" />
                  <span>Customer</span>
                </Button>
              )}
              {shopOwnerUser ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 font-medium">Hello, {customerProfile?.full_name || user.email?.split('@')[0]}</span>
                  <Link
                    to="/customer-profile"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("/customer-profile")
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    } flex items-center space-x-1`}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => signOut()}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleCustomerLogin}
                    variant="outline"
                    className="flex items-center space-x-1 px-3 py-2 rounded-md"
                  >
                    <User className="w-4 h-4" />
                    <span>Customer</span>
                  </Button>
                  <Button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-primary text-white hover:bg-primary-dark flex items-center space-x-1 px-3 py-2 rounded-md"
                  >
                    <User className="w-4 h-4" />
                    <span>Shop Owner</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <Button
                variant="ghost"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-2 space-y-1 pb-4 border-t border-gray-200">
              <Link
                to="/shops"
                className="block px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <Store className="w-4 h-4" />
                <span>Shops</span>
              </Link>
              <Link
                to="/dresses"
                className="block px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Dresses</span>
              </Link>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-start space-x-2 px-4 py-2 rounded-md hover:bg-gray-100"
                onClick={() => {
                  setIsCartOpen(true);
                  setMobileMenuOpen(false);
                }}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Cart</span>
                {totalQuantity > 0 && (
                  <Badge className="bg-red-500 text-white text-xs px-1 py-0 min-w-[18px] h-5 flex items-center justify-center">
                    {totalQuantity}
                  </Badge>
                )}
              </Button>
              {user ? (
                <Link
                  to="/customer-dashboard"
                  className="flex items-center space-x-2 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Button
                  onClick={() => {
                    handleCustomerLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-primary text-white hover:bg-primary-dark flex items-center justify-center space-x-2 px-4 py-2 rounded-md"
                >
                  <User className="w-4 h-4" />
                  <span>Customer</span>
                </Button>
              )}
              {shopOwnerUser ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              ) : user ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-primary text-white hover:bg-primary-dark flex items-center justify-center space-x-2 px-4 py-2 rounded-md"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
              ) : (
                <Button
                  onClick={handleCustomerLogin}
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md"
                >
                  <User className="w-4 h-4" />
                  <span>Customer</span>
                </Button>
              )}
              <Button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-primary text-white hover:bg-primary-dark flex items-center justify-center space-x-2 px-4 py-2 rounded-md"
              >
                <User className="w-4 h-4" />
                <span>Shop Owner</span>
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Dashboard Button - Only show if shop owner is logged in and not on dashboard page */}
      {shopOwnerUser && location.pathname !== "/dashboard" && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <Button
              onClick={() => navigate("/dashboard")}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
              variant="default"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </Button>
          </div>
        </div>
      )}

      {/* Hidden Option - Not visible in navbar but accessible via direct URL */}
      {shopOwnerUser && (
        <div style={{ display: 'none' }} data-hidden-option="true">
          <span>Hidden Dashboard Access</span>
        </div>
      )}

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onOpenChange={setIsCartOpen}
      />
    </>
  );
};

export default memo(Navbar);
