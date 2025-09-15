import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, Users, Shield, Heart, Star, ShoppingBag, Clock, MapPin, Eye, X, Filter, Grid, List, ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroBoutique from "@/assets/hero-boutique.jpg";
import { supabase } from "@/integrations/supabaseClient";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Shop {
  id: string;
  name: string;
  location: string;
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
  created_at?: string;
  shop_id: string;
  shop?: { name: string; location: string };
}

interface DressWithShop {
  id: string;
  shop_id: string;
  name: string;
  price: number;
  size: string;
  color: string;
  category: string;
  image_url: string | null;
  shops: {
    name: string;
    location: string;
  } | null;
}

interface CartItem extends Dress {
  quantity: number;
}

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [shops, setShops] = useState<Shop[]>([]);
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [filteredDresses, setFilteredDresses] = useState<Dress[]>([]);
  const [selectedDress, setSelectedDress] = useState<Dress | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [sortOption, setSortOption] = useState("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // New state for newsletter email input and loading
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Cart state replaced by useCart context
  // const [cart, setCart] = useState<CartItem[]>([]);
  const { cart, addToCart } = useCart();

  const shopsRef = useRef<HTMLDivElement>(null);
  const dressesRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const featuredShopsRef = useRef<HTMLDivElement>(null);
  const newArrivalsRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const newsletterRef = useRef<HTMLDivElement>(null);

  // Helper function to check if a dress is new (created within last 30 days)
  const isNewDress = (dress: Dress) => {
    if (!dress.created_at) return false;
    const createdDate = new Date(dress.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };




  // Fetch shops
  const fetchShops = async () => {
    const { data, error } = await supabase.from("shops").select("*").limit(10);
    if (error) return console.error(error);
    if (data) setShops(data as Shop[]);
  };

  // Fetch dresses
  const fetchDresses = async () => {
    const { data, error } = await supabase
      .from("dresses")
      .select(`*, shops(name, location)`)
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) {
      console.error("Error fetching dresses:", error);
      return;
    }

    if (data) {
      const mapped: Dress[] = (data as DressWithShop[]).map((d) => ({
        id: d.id,
        name: d.name,
        price: d.price,
        size: d.size,
        color: d.color,
        category: d.category,
        image_url: d.image_url || undefined,
        shop_id: d.shop_id,
        shop: d.shops ? { name: d.shops.name, location: d.shops.location } : undefined,
      }));
      setDresses(mapped);
    }
  };

  // Fetch shops with real-time updates
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

  // Fetch dresses with real-time updates
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

  // Filter logic
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      setFilteredShops([]);
      setFilteredDresses([]);
      return;
    }

    setFilteredShops(
      shops.filter(
        (shop) =>
          shop.name.toLowerCase().includes(query) ||
          shop.location.toLowerCase().includes(query)
      )
    );

    setFilteredDresses(
      dresses.filter(
        (dress) =>
          dress.name.toLowerCase().includes(query) ||
          dress.size.toLowerCase().includes(query) ||
          (dress.color && dress.color.toLowerCase().includes(query)) ||
          (dress.category && dress.category.toLowerCase().includes(query)) ||
          (dress.shop?.name && dress.shop.name.toLowerCase().includes(query)) ||
          (dress.shop?.location && dress.shop.location.toLowerCase().includes(query))
      )
    );
  }, [searchQuery, shops, dresses]);

  // Sort filtered dresses
  const sortedDresses = [...filteredDresses].sort((a, b) => {
    switch (sortOption) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "newest":
        return 0; // Already sorted by creation date from supabase
      default:
        return 0;
    }
  });

  // Scroll handler
  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: "left" | "right") => {
    if (!ref.current) return;
    const scrollAmount = ref.current.offsetWidth * 0.7;
    ref.current.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
  };

  const openQuickView = (dress: Dress) => {
    setSelectedDress(dress);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDress(null);
  };

  const toggleWishlist = (dressId: string) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(dressId)) {
      newWishlist.delete(dressId);
    } else {
      newWishlist.add(dressId);
    }
    setWishlist(newWishlist);
  };

  // const addToCart = (dress: Dress) => {
  //   setCart(prevCart => {
  //     const existingItem = prevCart.find(item => item.id === dress.id);
  //     if (existingItem) {
  //       return prevCart.map(item =>
  //         item.id === dress.id
  //           ? { ...item, quantity: item.quantity + 1 }
  //           : item
  //       );
  //     } else {
  //       return [...prevCart, { ...dress, quantity: 1 }];
  //     }
  //   });
  //   toast({
  //     title: "Added to cart!",
  //     description: `${dress.name} has been added to your cart.`,
  //   });
  // };



  // Cart total quantity
  const totalCartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
  };

  const slideFromLeft = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }
  };

  const slideFromRight = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }
  };

  const slideFromBottom = {
    hidden: { opacity: 0, y: 100 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <motion.section
        className="min-h-[80vh] flex items-center justify-center relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${heroBoutique})` }}
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-playfair font-bold text-white leading-tight">
            Instant <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Dress Tracker</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mt-4">
            Find your perfect dress instantly and check real-time availability in local shops.
          </p>

          <div className="max-w-2xl mx-auto mt-8 relative">
            <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by dress, shop, or size..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 bg-white/90 border-0 text-lg placeholder:text-gray-500 focus:bg-white rounded-lg shadow-md transition-all"
            />
          </div>


        </div>
      </motion.section>

     

      {/* Search Results */}
      {searchQuery && (
        <div className="bg-gray-50 min-h-screen py-8">
          <div className="container mx-auto px-4">
            {/* Search Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Search Results for "<span className="text-primary">{searchQuery}</span>"
              </h1>
              <p className="text-gray-600">
                Found {filteredDresses.length} dresses and {filteredShops.length} shops
              </p>
            </div>

            {/* Results Filter and Sort Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex flex-wrap items-center gap-4">
                  <Button variant="outline" className="flex items-center gap-2 border-gray-300 hover:bg-gray-50">
                    <Filter className="w-4 h-4" />
                    Filters
                    <Badge variant="secondary" className="ml-1">0</Badge>
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">View:</span>
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="w-10 h-10 p-0"
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="w-10 h-10 p-0"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Sort by:</span>
                  <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger className="w-48 border-gray-300">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

          {/* Shops Results */}
          {filteredShops.length > 0 && (
            <div className="mb-16">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Shops ({filteredShops.length})</h2>
                  <p className="text-sm text-gray-600">Discover boutiques in your area</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => scroll(shopsRef, "left")}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => scroll(shopsRef, "right")}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div ref={shopsRef} className="flex space-x-6 overflow-x-auto scroll-smooth snap-x scrollbar-hide py-4">
                {filteredShops.map((shop) => (
                  <Card key={shop.id} className="min-w-[320px] flex-shrink-0 snap-start group hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white">
                    <Link to={`/shop/${shop.id}`} className="block">
                      <div className="relative overflow-hidden rounded-t-xl">
                        <img
                          src={shop.image_url || "https://via.placeholder.com/400x300?text=Shop+Image"}
                          alt={shop.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <CardContent className="p-6">
                        <CardTitle className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                          {shop.name}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 flex items-center mb-3">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          {shop.location}
                        </CardDescription>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-gray-700 ml-1">4.8</span>
                            <span className="text-sm text-gray-500">(124)</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            Open
                          </Badge>
                        </div>
                        <Button className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg transition-all duration-200">
                          Visit Shop
                        </Button>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Dresses Results */}
          {sortedDresses.length > 0 && (
            <div className="mb-16">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Dresses ({sortedDresses.length})</h2>
                  <p className="text-sm text-gray-600">Find your perfect outfit</p>
                </div>
              </div>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {sortedDresses.map((dress) => (
                    <Card key={dress.id} className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white">
                      <div className="relative overflow-hidden">
                        <Link to={`/dress/${dress.id}`}>
                          <div className="aspect-[3/4] overflow-hidden">
                            <img
                              src={dress.image_url || "https://via.placeholder.com/300x400?text=Dress+Image"}
                              alt={dress.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        </Link>

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

                        {/* Wishlist Button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-3 right-3 w-9 h-9 p-0 bg-white/80 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
                          onClick={() => toggleWishlist(dress.id)}
                        >
                          <Heart className={`w-4 h-4 ${wishlist.has(dress.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                        </Button>

                        {/* Quick Actions Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="bg-white hover:bg-gray-50 text-gray-900 font-medium shadow-lg"
                            onClick={() => openQuickView(dress)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Quick View
                          </Button>
                        </div>
                      </div>

                      <CardContent className="p-5">
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
                        <Link to={`/dress/${dress.id}`}>
                          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors text-sm leading-tight">
                            {dress.name}
                          </h3>
                        </Link>

                        {/* Shop Info */}
                        <p className="text-xs text-gray-600 flex items-center mb-3">
                          <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                          {dress.shop?.name}
                        </p>

                        {/* Price and Size */}
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-lg font-bold text-primary">₹{dress.price.toLocaleString("en-IN")}</span>
                            {dress.color && (
                              <span className="text-xs text-gray-500">Color: {dress.color}</span>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs border-gray-300 font-medium">
                            {dress.size}
                          </Badge>
                        </div>
                      </CardContent>

                      <CardFooter className="p-5 pt-0">
                        <Button
                          className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg transition-all duration-200"
                          onClick={() => { addToCart(dress); toast({ title: "Added to cart!", description: `${dress.name} has been added to your cart.` }); }}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedDresses.map((dress) => (
                    <Card key={dress.id} className="group overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white">
                      <div className="flex">
                        {/* Product Image */}
                        <div className="w-32 h-40 flex-shrink-0 relative overflow-hidden rounded-l-xl">
                          <Link to={`/dress/${dress.id}`}>
                            <img
                              src={dress.image_url || "https://via.placeholder.com/300x400?text=Dress+Image"}
                              alt={dress.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </Link>
                          {/* Badges on image */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {isNewDress(dress) && (
                              <Badge className="bg-green-500 text-white text-xs px-1.5 py-0.5">
                                New
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 p-6">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
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
                              <Link to={`/dress/${dress.id}`}>
                                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors text-base leading-tight">
                                  {dress.name}
                                </h3>
                              </Link>

                              {/* Shop Info */}
                              <p className="text-sm text-gray-600 flex items-center mb-3">
                                <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                                {dress.shop?.name} • {dress.shop?.location}
                              </p>

                              {/* Details */}
                              <div className="flex items-center gap-4 mb-4">
                                <Badge variant="outline" className="text-xs border-gray-300">
                                  Size: {dress.size}
                                </Badge>
                                {dress.color && (
                                  <Badge variant="outline" className="text-xs border-gray-300">
                                    Color: {dress.color}
                                  </Badge>
                                )}
                                {dress.category && (
                                  <Badge variant="outline" className="text-xs border-gray-300">
                                    {dress.category}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Price */}
                            <div className="text-right ml-4">
                              <span className="text-xl font-bold text-primary">₹{dress.price.toLocaleString("en-IN")}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <Button
                              className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg transition-all duration-200"
                              onClick={() => { addToCart(dress); toast({ title: "Added to cart!", description: `${dress.name} has been added to your cart.` }); }}
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Add to Cart
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="px-4 border-gray-300 hover:bg-gray-50"
                              onClick={() => toggleWishlist(dress.id)}
                            >
                              <Heart className={`w-4 h-4 ${wishlist.has(dress.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="px-4 border-gray-300 hover:bg-gray-50"
                              onClick={() => openQuickView(dress)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* No results */}
          {filteredShops.length === 0 && filteredDresses.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg border">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">No results found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any dresses or shops matching "<span className="text-primary font-medium">{searchQuery}</span>"
              </p>
              <div className="space-y-3">
                <p className="text-sm text-gray-500">Try adjusting your search:</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Check for spelling errors</li>
                  <li>• Try different keywords</li>
                  <li>• Use more general terms</li>
                  <li>• Browse through categories above</li>
                </ul>
              </div>
            </div>
          )}
          </div>
        </div>
      )}

      {/* About Section */}
      <motion.section
        id="about"
        className="py-20 bg-muted/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-playfair font-bold text-primary mb-4">About DressTracker</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Revolutionizing the way you shop for dresses by connecting you with local boutiques and their real-time inventory.
            </p>
          </div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              className="text-center p-6 bg-white rounded-2xl shadow-lg"
              variants={slideFromBottom}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Local Boutique Network</h3>
              <p className="text-gray-600">
                Connect with the best local boutiques and discover unique dresses you won't find anywhere else.
              </p>
            </motion.div>

            <motion.div
              className="text-center p-6 bg-white rounded-2xl shadow-lg"
              variants={slideFromBottom}
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-Time Inventory</h3>
              <p className="text-gray-600">
                See exactly what's available in stores right now, eliminating the frustration of sold-out items.
              </p>
            </motion.div>

            <motion.div
              className="text-center p-6 bg-white rounded-2xl shadow-lg"
              variants={slideFromBottom}
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Personalized Experience</h3>
              <p className="text-gray-600">
                Get personalized recommendations based on your style preferences and local availability.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* New Arrivals */}
<section className="py-20 bg-white">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-playfair font-bold text-center mb-12">New Arrivals</h2>

    {dresses.length > 0 ? (
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
        {dresses
          // Sort by created_at (latest first)
          .sort((a, b) => {
  const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
  const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
  return dateB - dateA;
})

          // Show only the top 8 new arrivals
          .slice(0, 4)
          .map((dress) => (
            <div
              key={dress.id}
              className="border rounded-2xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
            >
              <img
                src={dress.image_url || "https://via.placeholder.com/300x400?text=Dress+Image"}
                alt={dress.name}
                className="w-full h-56 object-cover rounded-xl"
              />
              <h3 className="mt-4 font-semibold text-lg">{dress.name}</h3>
              <p className="text-sm text-gray-500">
                {dress.shop?.name} • {dress.shop?.location}
              </p>
              <div className="flex justify-between items-center mt-2">
                <span className="font-bold text-primary">
                  ₹{dress.price.toLocaleString("en-IN")}
                </span>
                <Badge variant="outline">{dress.size}</Badge>
              </div>
              <Button className="mt-3 w-full bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70"
                onClick={() => {
                  addToCart(dress);
                  toast({
                    title: "Added to cart!",
                    description: `${dress.name} has been added to your cart.`,
                  });
                }}
              >
                Add to Cart
              </Button>
            </div>
          ))}
      </div>
    ) : (
      <p className="text-center text-gray-500">No dresses available</p>
    )}
  </div>
</section>

      {/* Featured Shops */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-playfair font-bold text-center mb-12">Featured Shops</h2>
          {shops.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {shops.map((shop) => (
                <div key={shop.id} className="border rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <img src={shop.image_url || "https://via.placeholder.com/400x300?text=Shop+Image"} alt={shop.name} className="w-full h-40 object-cover rounded-xl" />
                  <h3 className="text-xl font-semibold mt-4">{shop.name}</h3>
                  <p className="text-sm text-gray-500">{shop.location}</p>
              <Button className="mt-4 w-full bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70"
                onClick={() => navigate(`/shop/${shop.id}`)}
              >
                View Shop
              </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No shops available</p>
          )}
        </div>
      </section>


      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-playfair font-bold text-center mb-12">What Our Customers Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-muted/30 p-6 rounded-2xl">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.comment}"</p>
                <p className="font-semibold text-gray-800">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-playfair font-bold mb-4">Stay in Style</h2>
          <p className="text-xl mb-6 max-w-2xl mx-auto">Subscribe to our newsletter for exclusive offers, new arrivals, and style tips</p>
          <div className="max-w-md mx-auto flex gap-3">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-white/90 text-gray-900 border-0 focus:bg-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubscribing}
            />
            <Button
              className="bg-white text-primary hover:bg-gray-100"
              onClick={async () => {
                if (!email) {
                  toast({
                    variant: "destructive",
                    title: "Email is required",
                    description: "Please enter your email address to subscribe.",
                  });
                  return;
                }
                // Basic email format validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                  toast({
                    variant: "destructive",
                    title: "Invalid email",
                    description: "Please enter a valid email address.",
                  });
                  return;
                }
                setIsSubscribing(true);
                try {
                  // Simulate newsletter subscription (replace with actual API call when backend is ready)
                  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

                  toast({
                    title: "Subscribed!",
                    description: "Thank you for subscribing! We'll keep you updated with the latest fashion trends.",
                  });
                  setEmail("");
                } catch (err) {
                  toast({
                    variant: "destructive",
                    title: "Subscription failed",
                    description: "An unexpected error occurred. Please try again later.",
                  });
                } finally {
                  setIsSubscribing(false);
                }
              }}
            >
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      {isModalOpen && selectedDress && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2">
                <img
                  src={selectedDress.image_url || "https://via.placeholder.com/300x400?text=Dress+Image"}
                  alt={selectedDress.name}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">{selectedDress.name}</h2>
                  <Button variant="ghost" size="sm" onClick={closeModal}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-lg font-bold text-primary mb-4">₹{selectedDress.price.toLocaleString("en-IN")}</p>
                <div className="space-y-4 mb-6">
                  <div>
                    <span className="font-semibold">Size: </span>
                    <Badge variant="outline">{selectedDress.size}</Badge>
                  </div>
                  {selectedDress.color && (
                    <div>
                      <span className="font-semibold">Color: </span>
                      <span>{selectedDress.color}</span>
                    </div>
                  )}
                  {selectedDress.category && (
                    <div>
                      <span className="font-semibold">Category: </span>
                      <span>{selectedDress.category}</span>
                    </div>
                  )}
                  {selectedDress.shop && (
                    <div>
                      <span className="font-semibold">Available at: </span>
                      <span>{selectedDress.shop.name} • {selectedDress.shop.location}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1 bg-gradient-to-r from-primary to-primary/80 text-white" onClick={() => addToCart(selectedDress)}>
                    Add to Cart
                  </Button>
                  <Button variant="outline" onClick={() => toggleWishlist(selectedDress.id)}>
                    <Heart className={`w-4 h-4 mr-2 ${wishlist.has(selectedDress.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    Wishlist
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Landing;
