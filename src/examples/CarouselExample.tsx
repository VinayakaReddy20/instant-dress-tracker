import React from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { DressCard } from "@/components/DressCard";
import { ShopCard } from "@/components/ShopCard";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types";

// Example data for demonstration
const exampleDresses: (Database["public"]["Tables"]["dresses"]["Row"] & {
  shops?: { name: string; location: string | null; };
})[] = [
  {
    id: "1",
    name: "Elegant Evening Gown",
    price: 12999,
    size: "M",
    color: "Navy Blue",
    category: "Evening",
    image_url: "https://via.placeholder.com/300x400?text=Dress+1",
    description: "Perfect for formal occasions",
    material: "Silk",
    brand: "Luxury Brand",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    shop_id: "1",
    stock: 5,
    shops: {
      name: "Boutique Elegance",
      location: "South Mumbai"
    }
  },
  {
    id: "2",
    name: "Casual Summer Dress",
    price: 4999,
    size: "S",
    color: "Floral Print",
    category: "Casual",
    image_url: "https://via.placeholder.com/300x400?text=Dress+2",
    description: "Light and comfortable",
    material: "Cotton",
    brand: "Casual Wear",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    shop_id: "2",
    stock: 10,
    shops: {
      name: "Urban Style",
      location: "Andheri"
    }
  }
];

const exampleShops = [
  {
    id: "1",
    name: "Boutique Elegance",
    location: "South Mumbai",
    image_url: "https://via.placeholder.com/400x300?text=Shop+1",
    rating: 4.8,
    review_count: 156,
    address: null,
    business_name: null,
    created_at: new Date().toISOString(),
    description: null,
    full_name: null,
    hours: null,
    updated_at: new Date().toISOString(),
    coordinates: null,
    profile_picture: null,
    gender: null,
    latitude: null,
    longitude: null,
    owner_id: "owner-1",
    phone: null,
    specialties: null
  },
  {
    id: "2",
    name: "Urban Style",
    location: "Andheri",
    image_url: "https://via.placeholder.com/400x300?text=Shop+2",
    rating: 4.6,
    review_count: 89,
    address: null,
    business_name: null,
    created_at: new Date().toISOString(),
    description: null,
    full_name: null,
    hours: null,
    updated_at: new Date().toISOString(),
    coordinates: null,
    profile_picture: null,
    gender: null,
    latitude: null,
    longitude: null,
    owner_id: "owner-2",
    phone: null,
    specialties: null
  }
];

export function CarouselExample() {
  const handleQuickView = (dress: Database["public"]["Tables"]["dresses"]["Row"] & {
    shops?: { name: string; location: string | null; };
  }) => {
    console.log("Quick view:", dress.name);
  };

  const handleViewShop = (shop: Database["public"]["Tables"]["shops"]["Row"]) => {
    console.log("View shop:", shop.name);
  };

  return (
    <div className="space-y-12">
      {/* Dresses Carousel Example */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Dresses Carousel Example</h2>
        <Carousel
          showArrows={true}
          showDots={true}
          autoPlay={true}
          autoPlayInterval={4000}
          responsive={{
            desktop: 3,
            tablet: 2,
            mobile: 1,
          }}
        >
          <CarouselContent>
            {exampleDresses.map((dress) => (
              <CarouselItem key={dress.id}>
                <DressCard 
                  dress={dress} 
                  onQuickView={handleQuickView}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      {/* Shops Carousel Example */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Shops Carousel Example</h2>
        <Carousel
          showArrows={true}
          showDots={true}
          autoPlay={true}
          autoPlayInterval={3000}
          responsive={{
            desktop: 3,
            tablet: 2,
            mobile: 1,
          }}
        >
          <CarouselContent>
            {exampleShops.map((shop) => (
              <CarouselItem key={shop.id}>
                <ShopCard 
                  shop={shop}
                  onViewShop={handleViewShop}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      {/* Custom Carousel Example */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Custom Content Carousel</h2>
        <Carousel
          showArrows={true}
          showDots={true}
          responsive={{
            desktop: 4,
            tablet: 2,
            mobile: 1,
          }}
        >
          <CarouselContent>
            {Array.from({ length: 8 }).map((_, index) => (
              <CarouselItem key={index}>
                <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-6 rounded-2xl h-48 flex items-center justify-center text-xl font-bold shadow-lg">
                  Custom Item {index + 1}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      {/* Carousel Controls Example */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Carousel with Custom Controls</h2>
        <div className="space-y-4">
          <Carousel
            showArrows={false}
            showDots={false}
            responsive={{
              desktop: 2,
              tablet: 2,
              mobile: 1,
            }}
          >
            <CarouselContent>
              {Array.from({ length: 6 }).map((_, index) => (
                <CarouselItem key={index}>
                  <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl h-32 flex items-center justify-center text-gray-500">
                    Item {index + 1}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          
          <div className="flex justify-center gap-4">
            <Button variant="outline">Custom Previous</Button>
            <Button variant="outline">Custom Next</Button>
          </div>
        </div>
      </section>
    </div>
  );
}