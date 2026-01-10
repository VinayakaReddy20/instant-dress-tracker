// src/pages/DressDetail.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabaseClient";
import { useCart } from "@/hooks/useCart";
import { useAuthModal } from "@/contexts/useAuthModal";
import { useStockValidation } from "@/hooks/useStockValidation";
import { stockValidationMiddleware } from "@/lib/stockValidationMiddleware";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowLeft, ShoppingCart } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface DressDetailType {
  id: string;
  shop_id: string;
  name: string;
  price: number | null;
  stock: number | null;
  size: string;
  color: string | null;
  category: string | null;
  image_url: string | null;
  description: string | null;
  material: string | null;
  brand: string | null;
  created_at: string;
  updated_at: string;
  shops: { name: string; location: string | null } | null;
}

const DressDetail = () => {
  const { dressId } = useParams<{ dressId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { validateStock } = useStockValidation();
  const [dress, setDress] = useState<DressDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchDress = async () => {
      if (!dressId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("dresses")
          .select(`
            *,
            shops (
              name,
              location
            )
          `)
          .eq("id", dressId)
          .single();
        if (error) throw error;
        setDress(data);
      } catch (error) {
        console.error("Error fetching dress details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDress();
  }, [dressId]);

  // Customer authentication check for addToCart
  const { openModal } = useAuthModal();

  const handleAddToCart = async () => {
    if (!dress) return;
    
    // Check if dress is out of stock before proceeding
    if (dress.stock !== null && dress.stock <= 0) {
      toast({
        title: "Cannot add to cart",
        description: "This dress is currently out of stock",
        variant: "destructive"
      });
      return;
    }

    setIsAddingToCart(true);

    try {
      supabase.auth.getSession().then(async ({ data }) => {
        if (!data.session) {
          // Open auth modal with redirect back to this dress detail page
          openModal(() => handleAddToCart(), `/dress/${dress.id}`);
          setIsAddingToCart(false);
        } else {
          try {
            // Validate stock before adding to cart
            const validation = await validateStock(dress.id, 1);
            
            if (!validation.isValid) {
              toast({
                title: "Cannot add to cart",
                description: validation.message,
                variant: "destructive"
              });
              setIsAddingToCart(false);
              return;
            }

            addToCart({
              id: dress.id,
              name: dress.name,
              price: dress.price,
              size: dress.size,
              color: dress.color || undefined,
              category: dress.category || undefined,
              image_url: dress.image_url || undefined,
              shop_id: dress.shop_id,
              shop: dress.shops && dress.shops.location ? { name: dress.shops.name, location: dress.shops.location } : undefined
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
          } finally {
            setIsAddingToCart(false);
          }
        }
      });
    } catch (error) {
      console.error("Error in handleAddToCart:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-600">
        Loading dress details...
      </div>
    );
  }

  if (!dress) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-600">
        Dress not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Button
          variant="ghost"
          className="mb-6 flex items-center text-muted-foreground hover:text-primary"
          onClick={() => navigate("/dresses")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dresses
        </Button>

        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            <img
              src={dress.image_url || "https://via.placeholder.com/400x500?text=Dress+Image"}
              alt={dress.name}
              className="w-full h-auto object-cover rounded-md"
            />
          </div>
          <div className="md:w-1/2 space-y-4">
            <h1 className="text-3xl font-bold">{dress.name}</h1>
            {dress.shops && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Shop:</span>
                <Button
                  variant="link"
                  className="p-0 h-auto font-semibold text-primary hover:underline"
                  onClick={() => navigate(`/shop/${dress.shop_id}`)}
                >
                  {dress.shops.name}
                </Button>
              </div>
            )}
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-semibold text-primary">
                ₹{(dress.price || 0).toLocaleString("en-IN")}
              </span>
              {dress.stock && dress.stock > 0 ? (
                <Badge variant="default">{dress.stock} in stock</Badge>
              ) : (
                <Badge variant="destructive">Out of stock</Badge>
              )}
            </div>
            <div className="space-y-1">
              <p><strong>Size:</strong> {dress.size}</p>
              <p><strong>Color:</strong> {dress.color || 'N/A'}</p>
              <p><strong>Category:</strong> {dress.category || 'N/A'}</p>
              {dress.material && <p><strong>Material:</strong> {dress.material}</p>}
              {dress.brand && <p><strong>Brand:</strong> {dress.brand}</p>}
              {dress.description && (
                <p className="mt-4 whitespace-pre-line">{dress.description}</p>
              )}
            </div>
            <Button
              className="w-full"
              onClick={handleAddToCart}
              disabled={!dress.stock || dress.stock <= 0 || isAddingToCart}
              isLoading={isAddingToCart}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isAddingToCart ? "Adding..." : (dress.stock && dress.stock > 0 ? "Add to Cart" : "Out of Stock")}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DressDetail;
