import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Filter, MapPin, Package, Eye, Heart, Star, Phone, Clock, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import Navbar from "@/components/Navbar";
import { searchSchema, type SearchFormData } from "@/lib/validations";
import { useShops, type ShopFilters } from "@/hooks/useShops";

import { supabase } from "@/integrations/supabaseClient";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useNavigate } from "react-router-dom";

// Mock data - same as in Dresses and Shops pages
const mockDresses = [
  {
    id: 1,
    name: "Elegant Evening Gown",
    shop: "Bella's Boutique",
    location: "Downtown Plaza",
    price: 299,
    stock: 3,
    image: "/api/placeholder/300/400",
    size: "M",
    color: "Navy Blue",
    category: "Evening"
  },
  {
    id: 2,
    name: "Floral Summer Dress",
    shop: "Garden Style",
    location: "Main Street",
    price: 89,
    stock: 7,
    image: "/api/placeholder/300/400",
    size: "S",
    color: "Pink",
    category: "Casual"
  },
  {
    id: 3,
    name: "Classic Black Cocktail",
    shop: "Elite Fashion",
    location: "Fashion District",
    price: 199,
    stock: 1,
    image: "/api/placeholder/300/400",
    size: "L",
    color: "Black",
    category: "Cocktail"
  },
  {
    id: 4,
    name: "Bohemian Maxi Dress",
    shop: "Free Spirit",
    location: "Arts Quarter",
    price: 149,
    stock: 5,
    image: "/api/placeholder/300/400",
    size: "M",
    color: "Teal",
    category: "Casual"
  }
];

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

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDistance, setSelectedDistance] = useState("");
  const navigate = useNavigate();
  const { openModal } = useAuthModal();

  // Geolocation variables (removed hook)
  const location = null;
  const locationLoading = false;
  const locationError = null;
  const requestLocation = () => {};
  const clearLocation = () => {};

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: searchParams.get("q") || "",
    },
  });

  const searchQuery = form.watch("query");

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      form.setValue("query", query);
    }
  }, [searchParams, form]);

  // Build shop filters
  const shopFilters: ShopFilters = {
    searchQuery: searchQuery || undefined,
  };

  // Use real shop data
  const { shops: realShops, loading: shopsLoading } = useShops(shopFilters);

  // Filter dresses based on search query (keeping mock data for now)
  const filteredDresses = mockDresses.filter(dress => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return dress.name.toLowerCase().includes(query) ||
           dress.shop.toLowerCase().includes(query) ||
           dress.color.toLowerCase().includes(query) ||
           dress.category.toLowerCase().includes(query);
  });

  // Use real shop data instead of mock
  const filteredShops = realShops;

  const totalResults = filteredDresses.length + filteredShops.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Search Header */}
      <section className="bg-muted/50 py-4">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-primary mb-4 text-center">
              Search Results
            </h1>

            {/* Filters */}
            <div className="mb-4 space-y-4">
              {/* Location filters for shops */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <div className="w-full sm:w-auto">
                  <Select
                    onValueChange={(value) => setSelectedDistance(value)}
                    value={selectedDistance}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Distance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null as unknown as string}>All Distances</SelectItem>
                      <SelectItem value="1">Within 1 km</SelectItem>
                      <SelectItem value="5">Within 5 km</SelectItem>
                      <SelectItem value="10">Within 10 km</SelectItem>
                      <SelectItem value="25">Within 25 km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  {!location && !locationLoading && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={requestLocation}
                      disabled={locationLoading}
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Use my location
                    </Button>
                  )}

                  {locationLoading && (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Getting location...</span>
                    </div>
                  )}

                  {location && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearLocation}
                    >
                      Clear location
                    </Button>
                  )}
                </div>
              </div>

              {locationError && (
                <p className="text-sm text-destructive text-center">
                  {locationError}
                </p>
              )}
            </div>

            {searchQuery && (
              <p className="text-muted-foreground text-center">
                Showing {totalResults} results for "{searchQuery}"
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
              <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
              <TabsTrigger value="dresses">Dresses ({filteredDresses.length})</TabsTrigger>
              <TabsTrigger value="shops">Shops ({filteredShops.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-12">
              {/* Dresses Results */}
              {filteredDresses.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-playfair font-semibold text-primary">
                      Dresses ({filteredDresses.length})
                    </h2>
                    <Link to="/dresses" className="text-primary hover:underline">
                      View all dresses →
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredDresses.slice(0, 8).map((dress, index) => (
                      <div
                        key={dress.id}
                        className="card-dress animate-scale-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="relative">
                          <img
                            src={dress.image}
                            alt={dress.name}
                            className="w-full h-64 object-cover"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2 w-8 h-8 p-0 bg-white/80 hover:bg-white"
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Badge
                            variant={dress.stock > 3 ? "default" : dress.stock > 0 ? "secondary" : "destructive"}
                            className="absolute bottom-2 left-2"
                          >
                            {dress.stock > 0 ? `${dress.stock} in stock` : "Out of stock"}
                          </Badge>
                        </div>
                        
                        <div className="p-4 space-y-3">
                          <h3 className="font-semibold text-lg text-card-foreground line-clamp-2">
                            {dress.name}
                          </h3>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4 mr-1" />
                              {dress.shop} • {dress.location}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex gap-2">
                                <Badge variant="outline">{dress.size}</Badge>
                                <Badge variant="outline">{dress.color}</Badge>
                              </div>
                              <span className="text-lg font-semibold text-primary">
                                ${dress.price}
                              </span>
                            </div>
                          </div>
                          
                          <Button className="w-full btn-hero" disabled={dress.stock === 0}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shops Results */}
              {filteredShops.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-playfair font-semibold text-primary">
                      Shops ({filteredShops.length})
                    </h2>
                    <Link to="/shops" className="text-primary hover:underline">
                      View all shops →
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredShops.slice(0, 6).map((shop, index) => (
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
                            {shop.specialties?.map((specialty: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-border">
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Package className="w-4 h-4 mr-1" />
                                0 dresses
                              </div>
                              <div className="flex items-center">
                                <Star className="w-4 h-4 mr-1" />
                                {shop.review_count || 0} reviews
                              </div>
                            </div>
                          </div>
                          
                          <Button className="w-full btn-hero">
                            Visit Shop
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="dresses">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDresses.map((dress, index) => (
                  <div
                    key={dress.id}
                    className="card-dress animate-scale-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    
                    <div className="relative">
                      <img
                        src={dress.image}
                        alt={dress.name}
                        className="w-full h-64 object-cover"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 w-8 h-8 p-0 bg-white/80 hover:bg-white"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Badge
                        variant={dress.stock > 3 ? "default" : dress.stock > 0 ? "secondary" : "destructive"}
                        className="absolute bottom-2 left-2"
                      >
                        {dress.stock > 0 ? `${dress.stock} in stock` : "Out of stock"}
                      </Badge>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <h3 className="font-semibold text-lg text-card-foreground line-clamp-2">
                        {dress.name}
                      </h3>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-1" />
                          {dress.shop} • {dress.location}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Badge variant="outline">{dress.size}</Badge>
                            <Badge variant="outline">{dress.color}</Badge>
                          </div>
                          <span className="text-lg font-semibold text-primary">
                            ${dress.price}
                          </span>
                        </div>
                      </div>
                      
                      <Button className="w-full btn-hero" disabled={dress.stock === 0}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="shops">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredShops.map((shop, index) => (
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
                        {shop.specialties?.map((specialty: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Package className="w-4 h-4 mr-1" />
                            0 dresses
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1" />
                            {shop.review_count || 0} reviews
                          </div>
                        </div>
                      </div>

                      <Button className="w-full btn-hero">
                        Visit Shop
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* No Results */}
          {totalResults === 0 && searchQuery && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                No results found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or browse our collections
              </p>
              <div className="flex gap-4 justify-center mt-6">
                <Link to="/dresses">
                  <Button variant="outline">Browse Dresses</Button>
                </Link>
                <Link to="/shops">
                  <Button variant="outline">Browse Shops</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SearchResults;
