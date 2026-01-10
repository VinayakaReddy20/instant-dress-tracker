"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
  showArrows?: boolean;
  showDots?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  responsive?: {
    desktop?: number;
    tablet?: number;
    mobile?: number;
  };
  preventClickWhileSliding?: boolean;
}

interface CarouselContextValue {
  currentIndex: number;
  totalItems: number;
  itemsPerView: number;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  isAutoPlaying: boolean;
  setIsAutoPlaying: (isPlaying: boolean) => void;
  isSliding: boolean;
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a Carousel");
  }
  return context;
}

export function Carousel({
  children,
  className,
  showArrows = true,
  showDots = true,
  autoPlay = false,
  autoPlayInterval = 4000,
  responsive = {
    desktop: 4,
    tablet: 3,
    mobile: 1,
  },
  preventClickWhileSliding = true,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(autoPlay);
  const [itemsPerView, setItemsPerView] = React.useState(responsive.desktop || 4);
  const [isSliding, setIsSliding] = React.useState(false);
  const carouselRef = React.useRef<HTMLDivElement>(null);

  const childrenArray = React.Children.toArray(children);
  const totalItems = childrenArray.length;

  // Handle responsive breakpoints
  React.useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setItemsPerView(responsive.mobile || 1);
      } else if (width < 1024) {
        setItemsPerView(responsive.tablet || 3);
      } else {
        setItemsPerView(responsive.desktop || 4);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, [responsive]);

  // Auto-play logic
  React.useEffect(() => {
    if (!isAutoPlaying || totalItems <= itemsPerView) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = Math.max(0, totalItems - itemsPerView);
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, totalItems, itemsPerView, autoPlayInterval]);

  const next = React.useCallback(() => {
    if (preventClickWhileSliding && isSliding) return;
    
    const maxIndex = Math.max(0, totalItems - itemsPerView);
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
    setIsAutoPlaying(false);
    setIsSliding(true);
    setTimeout(() => setIsSliding(false), 500); // Match CSS transition duration
  }, [totalItems, itemsPerView, preventClickWhileSliding, isSliding]);

  const prev = React.useCallback(() => {
    if (preventClickWhileSliding && isSliding) return;
    
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
    setIsAutoPlaying(false);
    setIsSliding(true);
    setTimeout(() => setIsSliding(false), 500); // Match CSS transition duration
  }, [preventClickWhileSliding, isSliding]);

  const goTo = React.useCallback((index: number) => {
    if (preventClickWhileSliding && isSliding) return;
    
    const maxIndex = Math.max(0, totalItems - itemsPerView);
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
    setIsAutoPlaying(false);
    setIsSliding(true);
    setTimeout(() => setIsSliding(false), 500); // Match CSS transition duration
  }, [totalItems, itemsPerView, preventClickWhileSliding, isSliding]);

  const contextValue = React.useMemo(
    () => ({
      currentIndex,
      totalItems,
      itemsPerView,
      next,
      prev,
      goTo,
      isAutoPlaying,
      setIsAutoPlaying,
      isSliding,
    }),
    [currentIndex, totalItems, itemsPerView, next, prev, goTo, isAutoPlaying, isSliding]
  );

  return (
    <CarouselContext.Provider value={contextValue}>
      <div className={`relative ${className}`} ref={carouselRef}>
        {children}
        
        {/* Navigation Arrows */}
        {showArrows && totalItems > itemsPerView && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-0 shadow-xl z-10 transition-all duration-300 hover:scale-110"
              onClick={prev}
              disabled={currentIndex === 0 || isSliding}
              aria-label="Previous slide"
              title="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-0 shadow-xl z-10 transition-all duration-300 hover:scale-110"
              onClick={next}
              disabled={currentIndex >= Math.max(0, totalItems - itemsPerView) || isSliding}
              aria-label="Next slide"
              title="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Dots Navigation */}
        {showDots && totalItems > itemsPerView && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {Array.from({ length: Math.max(1, Math.ceil(totalItems / itemsPerView)) }).map((_, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className={`w-3 h-3 rounded-full p-0 transition-all duration-300 ${
                  index === Math.floor(currentIndex / itemsPerView)
                    ? "bg-white/90 scale-125 ring-2 ring-primary/50"
                    : "bg-white/60 hover:bg-white/80 scale-100"
                }`}
                onClick={() => goTo(index * itemsPerView)}
                aria-label={`Go to slide ${index + 1}`}
                disabled={isSliding}
              />
            ))}
          </div>
        )}
      </div>
    </CarouselContext.Provider>
  );
}

export function CarouselContent({ children }: { children: React.ReactNode }) {
  const { currentIndex, itemsPerView, isSliding } = useCarousel();
  
  return (
    <div className="overflow-hidden">
      <div
        className={`flex transition-transform duration-500 ease-in-out ${
          isSliding ? 'pointer-events-none' : ''
        }`}
        style={{
          transform: `translateX(-${(currentIndex * 100) / itemsPerView}%)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function CarouselItem({ children, className }: { children: React.ReactNode; className?: string }) {
  const { itemsPerView } = useCarousel();
  
  return (
    <div
      className={`flex-shrink-0 px-2 ${className}`}
      style={{
        width: `${100 / itemsPerView}%`,
      }}
    >
      {children}
    </div>
  );
}

// Export only the components, not the hook
