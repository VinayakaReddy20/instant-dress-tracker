import { useState, useEffect } from "react";
import { Search, Filter, MapPin, Package, Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";

interface Dress {
  id: string;
  name: string;
  price: number;
  stock: number;
  size: string;
  color: string;
  category: string;
  description: string;
  material: string;
  brand: string;
  image_url: string;
  shop: {
    name: string;
    location: string;
  };
}

const Dresses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [selectedShop, setSelectedShop] = useState("all");
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [shops, setShops] = useState<{name: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDresses();
    fetchShops();
  }, []);

  const fetchDresses = async () => {
    try {
      const { data, error } = await supabase
        .from('dresses')
        .select(`
          *,
          shop:shops(name, location)
        `);

      if (error) throw error;
      setDresses(data || []);
    } catch (error) {
      console.error('Error fetching dresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShops = async () => {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('name');

      if (error) throw error;
      setShops(data || []);
    } catch (error) {
      console.error('Error fetching shops:', error);
    }
  };

  const filteredDresses = dresses.filter(dress => {
    const matchesSearch = dress.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dress.shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dress.color.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || dress.category.toLowerCase() === selectedCategory;
    const matchesSize = selectedSize === "all" || dress.size === selectedSize;
    const matchesShop = selectedShop === "all" || dress.shop.name === selectedShop;
    
    return matchesSearch && matchesCategory && matchesSize && matchesShop;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Search & Filter Section */}
      <section className="bg-muted/50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-playfair font-bold text-primary mb-8 text-center">
              Discover Available Dresses
            </h1>
            
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search dresses, shops, colors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-premium pl-12 h-12 text-lg"
                />
              </div>
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="input-premium">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="bridal">Bridal</SelectItem>
                  <SelectItem value="traditional">Traditional</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="party wear">Party Wear</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="indo-western">Indo-Western</SelectItem>
                  <SelectItem value="western">Western</SelectItem>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="input-premium">
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  <SelectItem value="XS">XS</SelectItem>
                  <SelectItem value="S">S</SelectItem>
                  <SelectItem value="M">M</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="XL">XL</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedShop} onValueChange={setSelectedShop}>
                <SelectTrigger className="input-premium">
                  <SelectValue placeholder="Shop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shops</SelectItem>
                  {shops.map((shop) => (
                    <SelectItem key={shop.name} value={shop.name}>{shop.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button className="btn-outline-premium h-12">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Results Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading dresses...</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <p className="text-muted-foreground">
                  Showing {filteredDresses.length} dresses
                </p>
                <Select defaultValue="newest">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="stock">Stock Available</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Dress Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDresses.map((dress, index) => (
                  <div
                    key={dress.id}
                    className="card-dress animate-scale-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative">
                      <img
                        src={dress.image_url || '/api/placeholder/300/400'}
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
                          {dress.shop.name} • {dress.shop.location}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Badge variant="outline">{dress.size}</Badge>
                            <Badge variant="outline">{dress.color}</Badge>
                          </div>
                          <span className="text-lg font-semibold text-primary">
                            ₹{dress.price.toLocaleString('en-IN')}
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
              
              {filteredDresses.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                    No dresses found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or filters
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dresses;