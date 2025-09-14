import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Store, Search, User, Menu, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/contexts/CartContext";

interface NavbarProps {
  onLogin?: () => void; // ✅ allow Dashboard to pass fetchDashboard
}

const Navbar: React.FC<NavbarProps> = ({ onLogin }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const { totalQuantity } = useCart();

  const isActive = (path: string) => location.pathname === path;

  const handleLoginSuccess = (ownerId: string) => {
    console.log("Login successful, owner ID:", ownerId);
    if (onLogin) {
      onLogin(); // ✅ notify parent (Dashboard)
    }
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
              <Button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-primary text-white hover:bg-primary-dark flex items-center space-x-1 px-3 py-2 rounded-md"
              >
                <User className="w-4 h-4" />
                <span>Shop Owner</span>
              </Button>
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

export default Navbar;
