import React from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

// Simple example data
const exampleItems = [
  { id: 1, title: "Elegant Evening Gown", price: "₹12,999", image: "https://via.placeholder.com/300x400?text=Dress+1" },
  { id: 2, title: "Casual Summer Dress", price: "₹4,999", image: "https://via.placeholder.com/300x400?text=Dress+2" },
  { id: 3, title: "Office Wear Blazer", price: "₹8,999", image: "https://via.placeholder.com/300x400?text=Dress+3" },
  { id: 4, title: "Party Wear Skirt", price: "₹6,499", image: "https://via.placeholder.com/300x400?text=Dress+4" },
  { id: 5, title: "Designer Saree", price: "₹15,999", image: "https://via.placeholder.com/300x400?text=Dress+5" },
  { id: 6, title: "Casual T-Shirt", price: "₹1,999", image: "https://via.placeholder.com/300x400?text=Dress+6" },
];

const exampleShops = [
  { id: 1, name: "Boutique Elegance", location: "South Mumbai", rating: 4.8 },
  { id: 2, name: "Urban Style", location: "Andheri", rating: 4.6 },
  { id: 3, name: "Fashion Hub", location: "Bandra", rating: 4.7 },
  { id: 4, name: "Trendy Closet", location: "Juhu", rating: 4.5 },
];

export function SimpleCarouselExample() {
  return (
    <div className="space-y-12 p-8">
      {/* Basic Carousel Example */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Basic Carousel</h2>
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
            {exampleItems.map((item) => (
              <CarouselItem key={item.id}>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-primary">{item.price}</span>
                      <Button className="bg-primary hover:bg-primary/90 text-white">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      {/* Shop Carousel Example */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Shop Carousel</h2>
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
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-semibold">
                      {shop.name}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{shop.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{shop.location}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm font-medium">{shop.rating}</span>
                      </div>
                      <Button className="bg-primary hover:bg-primary/90 text-white">
                        View Shop
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      {/* Custom Content Carousel */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Custom Content Carousel</h2>
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
                <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-6 rounded-2xl h-48 flex items-center justify-center text-xl font-bold shadow-lg hover:shadow-xl transition-shadow duration-300">
                  Feature {index + 1}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      {/* Carousel with Different Settings */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Carousel Variations</h2>
        
        {/* No Dots */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Without Dots</h3>
          <Carousel
            showArrows={true}
            showDots={false}
            responsive={{
              desktop: 2,
              tablet: 2,
              mobile: 1,
            }}
          >
            <CarouselContent>
              {exampleItems.slice(0, 4).map((item) => (
                <CarouselItem key={item.id}>
                  <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl h-32 flex items-center justify-center text-gray-500">
                    {item.title}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* No Arrows */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Without Arrows (Dots Only)</h3>
          <Carousel
            showArrows={false}
            showDots={true}
            responsive={{
              desktop: 3,
              tablet: 2,
              mobile: 1,
            }}
          >
            <CarouselContent>
              {exampleItems.slice(0, 6).map((item) => (
                <CarouselItem key={item.id}>
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl h-32 flex items-center justify-center text-purple-800 font-semibold">
                    {item.title}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </section>
    </div>
  );
}