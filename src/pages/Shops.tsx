import { useState, useEffect } from "react";
import { MapPin, Star, Package, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";

interface Shop {
  id: string;
  name: string;
  location: string;
  address: string;
  phone?: string;
  rating: number;
  review_count: number;
  hours: string;
  specialties: string[];
  description?: string;
  image_url?: string;
  dress_count?: number;
}

const Shops = () => {
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const { data: shopsData, error: shopsError } = await supabase
        .from('shops')
        .select('*');

      if (shopsError) throw shopsError;

      // Get dress count for each shop
      const shopsWithDressCount = await Promise.all(
        shopsData.map(async (shop) => {
          const { count } = await supabase
            .from('dresses')
            .select('*', { count: 'exact', head: true })
            .eq('shop_id', shop.id);

          return {
            ...shop,
            dress_count: count || 0
          };
        })
      );

      setShops(shopsWithDressCount);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-primary mb-6">
              Discover Local Shops
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse through our network of premium boutiques and discover their latest collections.
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading shops...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {shops.map((shop, index) => (
              <div
                key={shop.id}
                className="card-premium overflow-hidden animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                  <div className="relative">
                    <img
                      src={shop.image_url || "/api/placeholder/400/300"}
                      alt={shop.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 rounded-full px-3 py-1 flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold">{shop.rating}</span>
                    </div>
                  </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-playfair font-semibold text-primary mb-2">
                      {shop.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {shop.description}
                    </p>
                  </div>
                  
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        {shop.address}
                      </div>
                      
                      {shop.phone && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                          {shop.phone}
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                        {shop.hours}
                      </div>
                    </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {shop.specialties.map((specialty, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-1" />
                          {shop.dress_count} dresses
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          {shop.review_count} reviews
                        </div>
                      </div>
                    </div>
                  
                  <Button 
                    className="w-full btn-hero"
                    onClick={() => setSelectedShop(shop.id)}
                  >
                    Visit Shop
                  </Button>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Shops;