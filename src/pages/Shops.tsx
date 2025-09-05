import { useState } from "react";
import { MapPin, Star, Package, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";

// Mock data - replace with real data from Supabase
const mockShops = [
  {
    id: 1,
    name: "Bella's Boutique",
    location: "Downtown Plaza, 123 Main St",
    phone: "(555) 123-4567",
    rating: 4.8,
    reviewCount: 124,
    dressCount: 45,
    image: "/api/placeholder/400/300",
    hours: "9 AM - 8 PM",
    specialties: ["Evening Wear", "Bridal", "Formal"],
    description: "Luxury boutique specializing in elegant evening wear and formal dresses for special occasions."
  },
  {
    id: 2,
    name: "Garden Style",
    location: "Main Street, 456 Oak Ave",
    phone: "(555) 234-5678",
    rating: 4.6,
    reviewCount: 89,
    dressCount: 32,
    image: "/api/placeholder/400/300",
    hours: "10 AM - 7 PM",
    specialties: ["Casual", "Summer", "Boho"],
    description: "Fresh and vibrant collection of casual and summer dresses perfect for everyday wear."
  },
  {
    id: 3,
    name: "Elite Fashion",
    location: "Fashion District, 789 Style Blvd",
    phone: "(555) 345-6789",
    rating: 4.9,
    reviewCount: 156,
    dressCount: 67,
    image: "/api/placeholder/400/300",
    hours: "9 AM - 9 PM",
    specialties: ["Designer", "Cocktail", "Business"],
    description: "High-end fashion boutique featuring designer collections and exclusive cocktail dresses."
  },
  {
    id: 4,
    name: "Free Spirit",
    location: "Arts Quarter, 321 Creative Way",
    phone: "(555) 456-7890",
    rating: 4.7,
    reviewCount: 92,
    dressCount: 28,
    image: "/api/placeholder/400/300",
    hours: "11 AM - 6 PM",
    specialties: ["Bohemian", "Vintage", "Artistic"],
    description: "Unique bohemian and vintage-inspired dresses for the free-spirited fashionista."
  }
];

const Shops = () => {
  const [selectedShop, setSelectedShop] = useState<number | null>(null);

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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockShops.map((shop, index) => (
              <div
                key={shop.id}
                className="card-premium overflow-hidden animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative">
                  <img
                    src={shop.image}
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
                      {shop.location}
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      {shop.phone}
                    </div>
                    
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
                        {shop.dressCount} dresses
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        {shop.reviewCount} reviews
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
        </div>
      </section>
    </div>
  );
};

export default Shops;