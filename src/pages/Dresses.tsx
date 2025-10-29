import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Filter, MapPin, Package, Eye, ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabaseClient";
import { useCart } from "@/contexts/CartContext";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { searchSchema, type SearchFormData } from "@/lib/validations";
import { toast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

import { logApiError, debugLog } from "@/lib/errorHandling";
import type { Dress } from "@/types/shared";

const Dresses = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const isMobile = useIsMobile();

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: "",
    },
  });

  const searchQuery = form.watch("query");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [selectedShop, setSelectedShop] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [shops, setShops] = useState<Pick<import("@/types/shared").ShopRow, "name">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDresses();
    const dressesChannel = supabase
      .channel('dresses_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dresses' }, () => {
        fetchDresses();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(dressesChannel);
    };
  }, []);

  useEffect(() => {
    fetchShops();
    const shopsChannel = supabase
      .channel('shops_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shops' }, () => {
        fetchShops();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(shopsChannel);
    };
  }, []);

  const fetchDresses = async () => {
    try {
      setLoading(true);

      // First, test basic connectivity with a simple query
      debugLog("Testing basic dresses query...");
      const { data: testData, error: testError } = await supabase
        .from("dresses")
        .select("id")
        .limit(1);

      if (testError) {
        logApiError("Basic dresses query test", testError);
        throw new Error(`Database connectivity test failed: ${testError.message}`);
      }

      debugLog("Basic query successful, proceeding with full query...");

      // Build the main query
      const query = supabase
        .from("dresses")
        .select(`
          *,
          shops (
            name,
            location
          )
        `)
        .order("created_at", { ascending: false });

      debugLog("Executing main dresses query...");

      const { data, error } = await query;

      if (error) {
        logApiError("Main dresses query", error);
        throw error;
      }

      if (data) {
        debugLog(`Successfully fetched ${data.length} dresses`);

        setDresses((data as Dress[]) ?? []);

        // Show success message in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Successfully loaded ${data.length} dresses`);
        }
      } else {
        debugLog("No dresses data returned");
        setDresses([]);
      }
    } catch (error: unknown) {
      logApiError("fetchDresses", error);

      // Provide more specific error messages based on error type
      let title = "Failed to load dresses";
      let description = "Please check your connection and try again.";

      if (error && typeof error === 'object' && 'code' in error) {
        const err = error as { code?: string; message?: string };
        if (err.code === 'PGRST116') {
          title = "Database connection issue";
          description = "Unable to connect to the database. Please try again later.";
        } else if (err.code === '42P01') {
          title = "Table not found";
          description = "The dresses table doesn't exist. Please contact support.";
        } else if (err.code === '42703') {
          title = "Column error";
          description = "There's an issue with the database schema. Please contact support.";
        }
      }

      toast({
        variant: "destructive",
        title,
        description,
      });

      // Set empty array on error to prevent UI crashes
      setDresses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchShops = async () => {
    try {
      const { data, error } = await supabase
        .from("shops")
        .select("name")
        .order("name");

      if (error) throw error;
      setShops((data as { name: string }[]) ?? []);
    } catch (error) {
      console.error("Error fetching shops:", error);
    }
  };

  let filteredDresses = dresses.filter((dress) => {
    const matchesSearch =
      dress.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dress.shops?.name &&
        dress.shops.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (dress.color && dress.color.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" ||
      (dress.category?.toLowerCase() ?? "") === selectedCategory;

    const matchesSize =
      selectedSize === "all" || dress.size === selectedSize;

    const matchesShop =
      selectedShop === "all" ||
      (dress.shops?.name && dress.shops.name === selectedShop);

    return matchesSearch && matchesCategory && matchesSize && matchesShop;
  });

  if (sortBy === "newest") {
    filteredDresses = filteredDresses.sort((a, b) => {
      const dateA = new Date(a.created_at || "");
      const dateB = new Date(b.created_at || "");
      return dateB.getTime() - dateA.getTime();
    });
  } else if (sortBy === "price-low") {
    filteredDresses = filteredDresses.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sortBy === "price-high") {
    filteredDresses = filteredDresses.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sortBy === "stock") {
    filteredDresses = filteredDresses.sort((a, b) => (b.stock || 0) - (a.stock || 0));
  }

  // Customer authentication check for addToCart
  const { openModal } = useAuthModal();

  const handleAddToCart = (dress: Dress) => {
    // Temporarily force modal to open for testing
    openModal(() => {
      addToCart({
        id: dress.id,
        name: dress.name,
        price: dress.price || 0,
        size: dress.size,
        color: dress.color || undefined,
        category: dress.category || undefined,
        image_url: dress.image_url || undefined,
        shop_id: dress.shop_id,
        shop: dress.shops ? { name: dress.shops.name, location: dress.shops.location ?? "" } : undefined
      });
      toast({
        title: "Added to cart!",
        description: `${dress.name} has been added to your cart.`,
      });
    });
    /*
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        openModal(() => handleAddToCart(dress));
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
          shop: dress.shops ? { name: dress.shops.name, location: dress.shops.location } : undefined
        });
        toast({
          title: "Added to cart!",
          description: `${dress.name} has been added to your cart.`,
        });
      }
    });
    */
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Search & Filter Section */}
      <section className="bg-muted/50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-4 flex items-center text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
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
                  onChange={(e) => form.setValue("query", e.target.value)}
                  className="pl-12 h-12 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Category */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-12">
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

              {/* Size */}
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="h-12">
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

              {/* Shop */}
              <Select value={selectedShop} onValueChange={setSelectedShop}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Shop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shops</SelectItem>
                  {shops.map((shop) => (
                    <SelectItem key={shop.name} value={shop.name}>
                      {shop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* More Filters */}
              <Button className="h-12 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
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
                <Select value={sortBy} onValueChange={setSortBy}>
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
                {filteredDresses.map((dress) => (
                  <div
                    key={dress.id}
                    className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                  >
                    {/* Image */}
                    <div className="relative">
                      <img
                        src={
                          dress.image_url ||
                          "https://via.placeholder.com/300x400?text=Dress+Image"
                        }
                        alt={dress.name}
                        className="w-full h-64 object-cover"
                      />

                      <Badge
                        variant={
                          dress.stock && dress.stock > 3
                            ? "default"
                            : dress.stock && dress.stock > 0
                            ? "secondary"
                            : "destructive"
                        }
                        className="absolute bottom-2 left-2"
                      >
                        {dress.stock && dress.stock > 0
                          ? `${dress.stock} in stock`
                          : "Out of stock"}
                      </Badge>
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-3">
                      <h3 className="font-semibold text-lg line-clamp-2">
                        {dress.name}
                      </h3>

                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-1" />
                          {dress.shops?.name} • {dress.shops?.location}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {dress.size && (
                              <Badge variant="outline">{dress.size}</Badge>
                            )}
                            {dress.color && (
                              <Badge variant="outline">{dress.color}</Badge>
                            )}
                          </div>
                          <span className="text-lg font-semibold text-primary">
                            ₹{Number(dress.price || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => handleAddToCart(dress)}
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
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Results */}
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
