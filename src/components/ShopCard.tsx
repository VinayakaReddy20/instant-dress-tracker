import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthGuard } from "@/lib/authGuard";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabaseClient";
import type { Database } from "@/types";

type Shop = Database["public"]["Tables"]["shops"]["Row"];

interface ShopCardProps {
  shop: Shop;
  onViewShop?: (shop: Shop) => void;
}

export function ShopCard({ shop, onViewShop }: ShopCardProps) {
  const { protectRoute } = useAuthGuard();
  const navigate = useNavigate();

  // Animation variants for the card
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: {
      y: -8,
      scale: 1.02
    }
  };

  const handleViewShop = () => {
    const canProceed = protectRoute(() => {
      if (onViewShop) {
        onViewShop(shop);
      } else {
        navigate(`/shop/${shop.id}`);
      }
    }, `/shop/${shop.id}`);

    if (canProceed) {
      // User is already authenticated, proceed with action
      if (onViewShop) {
        onViewShop(shop);
      } else {
        navigate(`/shop/${shop.id}`);
      }
    }
  };

  return (
    <motion.div
      className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative overflow-hidden">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={shop.image_url || "https://via.placeholder.com/400x300?text=Shop+Image"}
            alt={shop.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
          {shop.name}
        </h3>
        
        <p className="text-sm text-gray-600 flex items-center mb-3">
          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
          {shop.location}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700 ml-1">{shop.rating || 4.8}</span>
            <span className="text-sm text-gray-500">({shop.review_count || 124})</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            Open
          </Badge>
        </div>
        
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg transition-all duration-200"
          onClick={handleViewShop}
        >
          <Eye className="w-4 h-4 mr-2" />
          View Shop
        </Button>
      </div>
    </motion.div>
  );
}