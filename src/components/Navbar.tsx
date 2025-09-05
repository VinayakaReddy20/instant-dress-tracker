import { useState } from "react";
import { Link } from "react-router-dom";
import { Store, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthModal from "./AuthModal";

const Navbar = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Search className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-playfair font-semibold text-primary">
                Instant Dress Tracker
              </span>
            </Link>

            {/* Navigation Buttons */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild className="hover:bg-accent hover:text-accent-foreground transition-colors duration-300">
                <Link to="/shops" className="flex items-center space-x-2">
                  <Store className="w-4 h-4" />
                  <span>Shops</span>
                </Link>
              </Button>
              
              <Button variant="ghost" asChild className="hover:bg-accent hover:text-accent-foreground transition-colors duration-300">
                <Link to="/dresses" className="flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <span>Dresses</span>
                </Link>
              </Button>
              
              <Button 
                onClick={() => setIsAuthModalOpen(true)}
                className="btn-hero flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Shop Owner</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;