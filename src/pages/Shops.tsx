import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, Package, Phone, Clock, ArrowLeft, Search, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useShops } from "@/hooks/useShops";
import { getCurrentLocation, getCurrentLocationWithAccuracy, isLocationAccurate, getAccuracyDescription } from "@/lib/geolocation";
import type { ShopWithCount } from "@/types/shared";

const Shops = () => {
  const navigate = useNavigate();
  const { openModal } = useAuthModal();
  const { user } = useCustomerAuth();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const filters = {
    searchQuery: searchQuery || undefined,
    specialty: selectedSpecialty || undefined,
    location: userLocation && maxDistance ? {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      maxDistance,
    } : undefined,
  };

  const { shops, loading, error, refresh } = useShops(filters);

  const handleGetCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const locationResult = await getCurrentLocationWithAccuracy();
      if (locationResult) {
        const { coordinates, accuracy, source } = locationResult;
        setUserLocation({ latitude: coordinates.latitude, longitude: coordinates.longitude });
        if (!maxDistance) setMaxDistance(25); // Default to 25km if not set

        const accuracyDesc = getAccuracyDescription(accuracy);
        const isAccurate = isLocationAccurate(accuracy);

        // Could show a toast here if needed
        console.log(`Location captured: ${accuracyDesc} (±${Math.round(accuracy)}m, ${source})`);

        if (!isAccurate) {
          console.warn(`Location accuracy is ${accuracyDesc.toLowerCase()}. Results may be less accurate.`);
        }
      } else {
        console.error("Unable to get location for filtering");
        // Could show user feedback here
      }
    } catch (err) {
      console.error("Error getting location:", err);
      // Could show user feedback here
    } finally {
      setLocationLoading(false);
    }
  };

  const clearLocationFilter = () => {
    setUserLocation(null);
    setMaxDistance(null);
  };



  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-destructive">
            Error Loading Shops
          </h2>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Button onClick={refresh} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-4 flex items-center text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-primary mb-6">
              Discover Local Shops
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse our premium boutiques and discover their collections.
            </p>
          </div>

          {/* Search and filter controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-2 w-full lg:w-1/3">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-2/3">
              <div className="w-full">
                <Select
                  onValueChange={(value) => setSelectedSpecialty(value)}
                  value={selectedSpecialty}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null as unknown as string}>All Specialties</SelectItem>
                    {[...new Set(shops.flatMap((shop) => shop.specialties || []))].map(
                      (specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 w-full">
                <Button
                  variant={userLocation ? "default" : "outline"}
                  onClick={handleGetCurrentLocation}
                  disabled={locationLoading}
                  className="flex items-center gap-2 flex-shrink-0"
                >
                  <Navigation className="w-4 h-4" />
                  {locationLoading ? "Getting..." : userLocation ? "Near Me" : "Use Location"}
                </Button>

                {userLocation && (
                  <>
                    <Select
                      onValueChange={(value) => setMaxDistance(value ? parseInt(value) : null)}
                      value={maxDistance?.toString() || ""}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Distance" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 km</SelectItem>
                        <SelectItem value="10">10 km</SelectItem>
                        <SelectItem value="25">25 km</SelectItem>
                        <SelectItem value="50">50 km</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost"
                      onClick={clearLocationFilter}
                      className="flex-shrink-0"
                    >
                      Clear
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>



          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading shops...</p>
            </div>
          ) : shops.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No shops found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {shops.map((shop) => (
                  <div
                    key={shop.id}
                    className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow transform hover:scale-105"
                  >
                    <div className="relative">
                      <img
                        src={
                          shop.image_url ||
                          "https://via.placeholder.com/400x300?text=Shop+Image"
                        }
                        alt={shop.name}
                        className="w-full h-64 object-cover"
                      />
                    </div>

                    <div className="p-6 space-y-4">
                      <h3 className="text-xl font-playfair font-semibold text-primary mb-2">
                        {shop.name}
                      </h3>
                      {shop.rating !== undefined && shop.rating !== null && shop.rating > 0 && (
                        <div className="flex items-center space-x-2 mb-2">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(shop.rating!) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="text-sm font-medium">{shop.rating.toFixed(1)}</span>
                          {shop.review_count !== undefined && shop.review_count !== null && shop.review_count > 0 && (
                            <span className="text-sm text-muted-foreground">({shop.review_count} reviews)</span>
                          )}
                        </div>
                      )}
                      {shop.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {shop.description}
                        </p>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{shop.address}</span>
                        </div>
                        {shop.phone && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                            {shop.phone}
                          </div>
                        )}
                        {shop.hours && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                            {shop.hours}
                          </div>
                        )}
                      </div>

                      {shop.specialties && shop.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {shop.specialties.map((specialty, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-border text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Package className="w-4 h-4 mr-1" />
                            {shop.dress_count} dresses
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full"
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
          )}
        </div>
      </section>
    </div>
  );
};

export default Shops;
