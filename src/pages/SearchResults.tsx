import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Filter, MapPin, Package, Eye, Heart, Star, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { useShops, type ShopFilters } from "@/hooks/useShops";
import { useDresses, type DressFilters } from "@/hooks/useDresses";

import { supabase } from "@/integrations/supabaseClient";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useNavigate } from "react-router-dom";


const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();
  const { openModal } = useAuthModal();
  const { user } = useCustomerAuth();


  const searchQuery = searchParams.get("q") || "";

  // Build filters
  const shopFilters: ShopFilters = useMemo(() => ({
    searchQuery: searchQuery || undefined,
  }), [searchQuery]);

  const dressFilters: DressFilters = useMemo(() => ({
    searchQuery: searchQuery || undefined,
  }), [searchQuery]);

  // Use real data
  const { shops: realShops, loading: shopsLoading } = useShops(shopFilters);
  const { dresses: realDresses, loading: dressesLoading } = useDresses(dressFilters);

  // Use real dress and shop data
  const filteredDresses = realDresses;
  const filteredShops = realShops;

  const totalResults = filteredDresses.length + filteredShops.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Search Header */}
      <section className="bg-muted/50 py-4">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-center mb-4">
              <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                Back to Home
              </Button>
            </div>
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-primary mb-4 text-center">
              Search Results
            </h1>

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
                            src={dress.image_url || "/api/placeholder/300/400"}
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
                            variant={(dress.stock ?? 0) > 3 ? "default" : (dress.stock ?? 0) > 0 ? "secondary" : "destructive"}
                            className="absolute bottom-2 left-2"
                          >
                            {(dress.stock ?? 0) > 0 ? `${dress.stock} in stock` : "Out of stock"}
                          </Badge>
                        </div>
                        
                        <div className="p-4 space-y-3">
                           <h3 className="font-semibold text-lg text-card-foreground line-clamp-2">
                             {dress.name}
                           </h3>

                           <div className="space-y-2">
                             <div className="flex items-center text-sm text-muted-foreground">
                               <MapPin className="w-4 h-4 mr-1" />
                               {dress.shop?.name || 'Unknown Shop'} • {dress.shop?.location || 'Unknown Location'}
                             </div>

                             <div className="flex items-center justify-between">
                               <div className="flex gap-2">
                                 <Badge variant="outline">{dress.size}</Badge>
                                 {dress.color && <Badge variant="outline">{dress.color}</Badge>}
                                 {dress.category && <Badge variant="outline">{dress.category}</Badge>}
                               </div>
                               {dress.price && (
                                 <span className="text-lg font-semibold text-primary">
                                   ₹{dress.price.toLocaleString("en-IN")}
                                 </span>
                               )}
                             </div>
                           </div>
                          
                          <Button
                            className="w-full btn-hero"
                            disabled={(dress.stock ?? 0) === 0}
                            onClick={() => {
                              if (!user) {
                                openModal(() => navigate(`/dress/${dress.id}`));
                              } else {
                                navigate(`/dress/${dress.id}`);
                              }
                            }}
                          >
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
                            {shop.specialties?.map((specialty, idx) => (
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
                          
                          <Button
                            className="w-full btn-hero"
                            onClick={() => {
                              if (!user) {
                                openModal(() => navigate(`/shop/${shop.id}`));
                              } else {
                                navigate(`/shop/${shop.id}`);
                              }
                            }}
                          >
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
                        src={dress.image_url || "/api/placeholder/300/400"}
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
                        variant={(dress.stock ?? 0) > 3 ? "default" : (dress.stock ?? 0) > 0 ? "secondary" : "destructive"}
                        className="absolute bottom-2 left-2"
                      >
                        {(dress.stock ?? 0) > 0 ? `${dress.stock} in stock` : "Out of stock"}
                      </Badge>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <h3 className="font-semibold text-lg text-card-foreground line-clamp-2">
                        {dress.name}
                      </h3>

                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-1" />
                          {dress.shop?.name || 'Unknown Shop'} • {dress.shop?.location || 'Unknown Location'}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Badge variant="outline">{dress.size}</Badge>
                            {dress.color && <Badge variant="outline">{dress.color}</Badge>}
                            {dress.category && <Badge variant="outline">{dress.category}</Badge>}
                          </div>
                          {dress.price && (
                            <span className="text-lg font-semibold text-primary">
                              ₹{dress.price.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        className="w-full btn-hero"
                        disabled={(dress.stock ?? 0) === 0}
                        onClick={() => {
                          if (!user) {
                            openModal(() => navigate(`/dress/${dress.id}`));
                          } else {
                            navigate(`/dress/${dress.id}`);
                          }
                        }}
                      >
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
                        {shop.specialties?.map((specialty, idx) => (
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

                      <Button
                        className="w-full btn-hero"
                        onClick={() => {
                          if (!user) {
                            openModal(() => navigate(`/shop/${shop.id}`));
                          } else {
                            navigate(`/shop/${shop.id}`);
                          }
                        }}
                      >
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
