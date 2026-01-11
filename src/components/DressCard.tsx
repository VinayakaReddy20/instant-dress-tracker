import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, MapPin, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthGuard } from "@/lib/authGuard";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/components/ui/use-toast";
import { useStockValidation } from "@/hooks/useStockValidation";
import { stockValidationMiddleware } from "@/lib/stockValidationMiddleware";
import { supabase } from "@/integrations/supabaseClient";
import type { Database } from "@/types";

type Dress = Database["public"]["Tables"]["dresses"]["Row"] & {
  shops?: { name: string; location: string | null; };
};

interface DressCardProps {
  dress: Dress;
  onQuickView?: (dress: Dress) => void;
}

export function DressCard({ dress, onQuickView }: DressCardProps) {
  const { protectRoute } = useAuthGuard();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { validateStock } = useStockValidation();

  // Animation variants for the card
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: {
      y: -8,
      scale: 1.02
    }
  };

  // Helper function to check if a dress is new (created within last 30 days)
  const isNewDress = (dress: Dress) => {
    if (!dress.created_at) return false;
    const createdDate = new Date(dress.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  const handleAddToCart = async () => {
    // Check if dress is out of stock before proceeding
    if (dress.stock !== null && dress.stock <= 0) {
      toast({
        title: "Cannot add to cart",
        description: "This dress is currently out of stock",
        variant: "destructive"
      });
      return;
    }

    const canProceed = protectRoute(async () => {
      try {
        // Validate stock before adding to cart
        const validation = await validateStock(dress.id, 1);
        
        if (!validation.isValid) {
          toast({
            title: "Cannot add to cart",
            description: validation.message,
            variant: "destructive"
          });
          return;
        }

        addToCart({
          id: dress.id,
          name: dress.name,
          price: dress.price || 0,
          size: dress.size,
          color: dress.color || undefined,
          category: dress.category || undefined,
          image_url: dress.image_url || undefined,
          shop_id: dress.shop_id,
          shop: dress.shops ? {
            name: dress.shops.name,
            location: dress.shops.location || ""
          } : undefined,
        });
        toast({
          title: "Added to cart!",
          description: `${dress.name} has been added to your cart.`,
        });
      } catch (error) {
        console.error("Error adding to cart:", error);
        toast({
          title: "Error",
          description: "Failed to add item to cart. Please try again.",
          variant: "destructive"
        });
      }
    }, `/dress/${dress.id}`);

    // If user is already authenticated, proceed with action
    if (canProceed) {
      try {
        // Validate stock before adding to cart
        const validation = await validateStock(dress.id, 1);
        
        if (!validation.isValid) {
          toast({
            title: "Cannot add to cart",
            description: validation.message,
            variant: "destructive"
          });
          return;
        }

        addToCart({
          id: dress.id,
          name: dress.name,
          price: dress.price || 0,
          size: dress.size,
          color: dress.color || undefined,
          category: dress.category || undefined,
          image_url: dress.image_url || undefined,
          shop_id: dress.shop_id,
          shop: dress.shops ? {
            name: dress.shops.name,
            location: dress.shops.location || ""
          } : undefined,
        });
        toast({
          title: "Added to cart!",
          description: `${dress.name} has been added to your cart.`,
        });
      } catch (error) {
        console.error("Error adding to cart:", error);
        toast({
          title: "Error",
          description: "Failed to add item to cart. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleQuickView = () => {
    const canProceed = protectRoute(() => {
      onQuickView?.(dress);
    }, `/dress/${dress.id}`);

    if (canProceed) {
      // User is already authenticated, proceed with action
      onQuickView?.(dress);
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
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="relative overflow-hidden">
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={dress.image_url || "https://via.placeholder.com/300x400?text=Dress+Image"}
            alt={dress.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNewDress(dress) && (
            <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-2 py-1">
              New
            </Badge>
          )}
          {dress.category && (
            <Badge className="bg-white/90 text-gray-800 backdrop-blur-sm text-xs font-medium px-2 py-1">
              {dress.category}
            </Badge>
          )}
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white hover:bg-gray-50 text-gray-900 font-medium shadow-lg"
            onClick={handleQuickView}
          >
            <Eye className="w-4 h-4 mr-2" />
            Quick View
          </Button>
        </div>
      </div>

      <div className="p-5">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">4.5 (89)</span>
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors text-sm leading-tight">
          {dress.name}
        </h3>

        {/* Shop Info */}
        <p className="text-xs text-gray-600 flex items-center mb-3">
          <MapPin className="w-3 h-3 mr-1 text-gray-400" />
          {dress.shops?.name}
        </p>

        {/* Price and Size */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary">₹{(dress.price || 0).toLocaleString("en-IN")}</span>
            {dress.color && (
              <span className="text-xs text-gray-500">Color: {dress.color}</span>
            )}
          </div>
          <Badge variant="outline" className="text-xs border-gray-300 font-medium">
            {dress.size}
          </Badge>
        </div>

        <Button
          className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg transition-all duration-200"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </motion.div>
  );
}