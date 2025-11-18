// src/pages/DressDetail.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabaseClient";
import { useCart } from "@/contexts/CartTypes";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
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
  const [dress, setDress] = useState<DressDetailType | null>(null);
  const [loading, setLoading] = useState(true);

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
  const { user } = useCustomerAuth();

  const handleAddToCart = () => {
    if (!dress) return;
    if (!dress.stock || dress.stock <= 0) {
      toast({
        title: "Out of Stock",
        description: "This dress is currently out of stock and cannot be added to your cart.",
        variant: "destructive",
      });
      return;
    }
    if (!user) {
      openModal(() => handleAddToCart());
    } else {
      addToCart({
        id: dress.id,
        name: dress.name,
        price: dress.price,
        size: dress.size,
        color: dress.color || undefined,
        category: dress.category || undefined,
        image_url: dress.image_url || undefined,
        shop_id: dress.shop_id,
        shop: dress.shops ? { name: dress.shops.name, location: dress.shops.location || "" } : undefined
      });
      toast({
        title: "Added to cart!",
        description: `${dress.name} has been added to your cart.`,
      });
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
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-semibold text-primary">
                {dress.price ? `₹${dress.price.toLocaleString("en-IN")}` : "Price not available"}
              </span>
              {dress.stock && dress.stock > 0 ? (
                <Badge variant="default">{dress.stock} in stock</Badge>
              ) : (
                <Badge variant="destructive">Out of stock</Badge>
              )}
            </div>
            <div className="space-y-1">
              <p><strong>Size:</strong> {dress.size}</p>
              <p><strong>Color:</strong> {dress.color || "Not specified"}</p>
              <p><strong>Category:</strong> {dress.category || "Not specified"}</p>
              {dress.material && <p><strong>Material:</strong> {dress.material}</p>}
              {dress.brand && <p><strong>Brand:</strong> {dress.brand}</p>}
              {dress.description && (
                <p className="mt-4 whitespace-pre-line">{dress.description}</p>
              )}
            </div>
            <Button
              className="w-full"
              onClick={handleAddToCart}
              disabled={!dress.stock || dress.stock <= 0 || !dress.price}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {!dress.price ? "Price not available" : dress.stock && dress.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DressDetail;
