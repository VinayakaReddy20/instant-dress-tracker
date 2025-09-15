// src/pages/ShopDetail.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Phone, Clock, Star, Package, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabaseClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useToast } from "@/components/ui/use-toast";

interface Shop {
  id: string;
  name: string;
  address: string;
  location: string;
  phone?: string;
  hours?: string;
  rating?: number;
  review_count?: number;
  specialties?: string[];
  description?: string;
  image_url?: string;
}

interface Dress {
  id: string;
  name: string;
  price: number;
  size: string;
  color?: string;
  category?: string;
  image_url?: string;
  stock?: number;
}

const ShopDetail = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { openModal } = useAuthModal();

  const [shop, setShop] = useState<Shop | null>(null);
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch shop + dresses
  useEffect(() => {
    const fetchData = async () => {
      if (!shopId) return;

      try {
        setLoading(true);

        // Get shop details
        const { data: shopData, error: shopError } = await supabase
          .from("shops")
          .select("*")
          .eq("id", shopId)
          .single();

        if (shopError) throw shopError;
        setShop(shopData as Shop);

        // Get dresses for this shop
        const { data: dressData, error: dressError } = await supabase
          .from("dresses")
          .select("*")
          .eq("shop_id", shopId)
          .order("created_at", { ascending: false });

        if (dressError) throw dressError;
        setDresses(dressData as Dress[]);
      } catch (err) {
        console.error("Error fetching shop details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shopId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-600">
        Loading shop details...
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-600">
        Shop not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Shop Banner */}
      <div className="relative h-72 md:h-96 w-full overflow-hidden">
        <img
          src={shop.image_url || "https://via.placeholder.com/1200x400?text=Shop+Image"}
          alt={shop.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-white drop-shadow-lg">
            {shop.name}
          </h1>
        </div>
      </div>

      {/* Shop Info */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
          {shop.description && (
            <p className="text-gray-700 text-lg">{shop.description}</p>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 text-gray-600">
              <p className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-primary" />
                {shop.address}
              </p>
              {shop.phone && (
                <p className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-primary" />
                  {shop.phone}
                </p>
              )}
              {shop.hours && (
                <p className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-primary" />
                  {shop.hours}
                </p>
              )}
            </div>

            <div className="space-y-2 text-gray-600">
              {shop.rating && (
                <p className="flex items-center">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  {shop.rating} ({shop.review_count ?? 0} reviews)
                </p>
              )}
              <p className="flex items-center">
                <Package className="w-4 h-4 mr-2 text-primary" />
                {dresses.length} dresses available
              </p>
            </div>
          </div>

          {shop.specialties && shop.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {shop.specialties.map((s, i) => (
                <Badge key={i} variant="secondary">
                  {s}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dresses in this Shop */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold mb-8">Available Dresses</h2>
        {dresses.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {dresses.map((dress) => (
              <div
                key={dress.id}
                className="bg-white border rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="h-64 overflow-hidden">
                  <img
                    src={dress.image_url || "https://via.placeholder.com/300x400?text=Dress+Image"}
                    alt={dress.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-lg">{dress.name}</h3>
                  <p className="text-sm text-gray-500">
                    {dress.category} {dress.color && `• ${dress.color}`}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-primary">
                      ₹{dress.price.toLocaleString("en-IN")}
                    </span>
                    <Badge variant="outline">{dress.size}</Badge>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      className="flex-1 bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70"
                      onClick={() => {
                        supabase.auth.getSession().then(({ data }) => {
                          if (!data.session) {
                            openModal(() => {
                              addToCart({
                                id: dress.id,
                                name: dress.name,
                                price: dress.price,
                                size: dress.size,
                                color: dress.color,
                                category: dress.category,
                                image_url: dress.image_url,
                                shop_id: shopId!,
                                shop: { name: shop.name, location: shop.location }
                              });
                            });
                          } else {
                            addToCart({
                              id: dress.id,
                              name: dress.name,
                              price: dress.price,
                              size: dress.size,
                              color: dress.color,
                              category: dress.category,
                              image_url: dress.image_url,
                              shop_id: shopId!,
                              shop: { name: shop.name, location: shop.location }
                            });
                            toast({
                              title: "Added to cart!",
                              description: `${dress.name} has been added to your cart.`,
                            });
                          }
                        });
                      }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        supabase.auth.getSession().then(({ data }) => {
                          if (!data.session) {
                            openModal(() => navigate(`/dress/${dress.id}`));
                          } else {
                            navigate(`/dress/${dress.id}`);
                          }
                        });
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No dresses available in this shop.</p>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ShopDetail;
