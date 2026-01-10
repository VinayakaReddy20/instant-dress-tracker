# Carousel Implementation for Instant Dress Tracker

This document outlines the implementation of modern, trendy carousels for the Instant Dress Tracker landing page.

## Overview

The implementation includes:
1. **Reusable Carousel Component** - A flexible, accessible carousel with smooth animations
2. **DressCard Component** - Modular dress display component with hover effects
3. **ShopCard Component** - Modular shop display component with interactive elements
4. **Enhanced Styling** - Modern UI with Tailwind CSS and custom animations

## Components

### Carousel Component (`src/components/ui/carousel.tsx`)

**Features:**
- Horizontal sliding with CSS transform + transition
- Left and right arrow navigation
- Dots navigation for quick access
- Responsive design (Desktop: 4 cards, Tablet: 3 cards, Mobile: 1 card)
- Auto-play functionality with configurable interval
- Keyboard accessibility (ArrowLeft/ArrowRight)
- Prevents accidental clicks during sliding
- TypeScript support with proper type definitions

**Props:**
```typescript
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
```

**Usage Example:**
```tsx
<Carousel
  showArrows={true}
  showDots={true}
  autoPlay={true}
  autoPlayInterval={5000}
  responsive={{
    desktop: 4,
    tablet: 3,
    mobile: 1,
  }}
>
  <CarouselContent>
    {items.map((item) => (
      <CarouselItem key={item.id}>
        <YourCardComponent item={item} />
      </CarouselItem>
    ))}
  </CarouselContent>
</Carousel>
```

### DressCard Component (`src/components/DressCard.tsx`)

**Features:**
- Reusable dress display component
- Maintains existing "Add to Cart" functionality
- Quick view modal integration
- Hover effects with scale and elevation
- Responsive design
- TypeScript support
- Framer Motion animations

**Props:**
```typescript
interface DressCardProps {
  dress: Dress;
  onQuickView?: (dress: Dress) => void;
}
```

### ShopCard Component (`src/components/ShopCard.tsx`)

**Features:**
- Reusable shop display component
- Maintains "View Shop" navigation
- Prevents accidental clicks during sliding
- Hover effects with scale and elevation
- Responsive design
- TypeScript support
- Framer Motion animations

**Props:**
```typescript
interface ShopCardProps {
  shop: Shop;
  onViewShop?: (shop: Shop) => void;
}
```

## Styling

### Custom CSS (`src/styles/carousel.css`)

**Features:**
- Smooth transition animations
- Enhanced hover effects
- Accessibility-focused focus styles
- Touch-friendly mobile styles
- Gradient overlays and shadows
- Keyframe animations for slide effects

**Key Classes:**
- `.carousel-item` - Individual carousel items with hover effects
- `.carousel-arrow` - Navigation buttons with enhanced styling
- `.carousel-dot` - Dots navigation with active states
- `.card-hover` - Enhanced card hover animations
- `.card-shadow` - Premium shadow effects

### Integration with Main Styles (`src/index.css`)

The carousel styles are imported into the main CSS file to ensure proper loading and cascading.

## Implementation Details

### Responsive Behavior

The carousel automatically adjusts the number of visible items based on screen size:
- **Desktop (≥1024px)**: 4 items
- **Tablet (640px - 1023px)**: 3 items  
- **Mobile (<640px)**: 1 item

### Animation System

- **CSS Transforms**: Used for smooth horizontal sliding
- **Framer Motion**: Applied to individual cards for enhanced hover effects
- **Transition Duration**: 500ms for slides, 300ms for hover effects
- **Easing Functions**: Custom cubic-bezier for smooth animations

### Accessibility Features

- **Keyboard Navigation**: ArrowLeft/ArrowRight keys for navigation
- **Screen Reader Support**: Proper ARIA labels on buttons and dots
- **Focus Management**: Clear focus indicators on interactive elements
- **Reduced Motion**: Respects user preferences for motion reduction

### Performance Optimizations

- **Memoization**: Context values are memoized to prevent unnecessary re-renders
- **Event Listeners**: Proper cleanup on component unmount
- **CSS Transforms**: Hardware-accelerated animations for smooth performance
- **Conditional Rendering**: Arrows and dots only render when needed

## Usage in Landing Page

### Recently Added Dresses Section

```tsx
<Carousel
  showArrows={true}
  showDots={true}
  autoPlay={true}
  autoPlayInterval={5000}
  responsive={{
    desktop: 4,
    tablet: 3,
    mobile: 1,
  }}
  className="w-full"
>
  <CarouselContent>
    {dresses
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      })
      .map((dress) => (
        <CarouselItem key={dress.id}>
          <DressCard 
            dress={dress} 
            onQuickView={openQuickView}
          />
        </CarouselItem>
      ))}
  </CarouselContent>
</Carousel>
```

### Featured Shops Section

```tsx
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
  className="w-full"
>
  <CarouselContent>
    {shops.map((shop) => (
      <CarouselItem key={shop.id}>
        <ShopCard 
          shop={shop}
          onViewShop={(shop) => navigate(`/shop/${shop.id}`)}
        />
      </CarouselItem>
    ))}
  </CarouselContent>
</Carousel>
```

## Browser Support

- **Modern Browsers**: Full support with smooth animations
- **Safari**: Hardware-accelerated transforms for optimal performance
- **Mobile Browsers**: Touch-friendly interactions and responsive design
- **Accessibility Tools**: Screen reader and keyboard navigation support

## Future Enhancements

Potential improvements that could be added:
- Touch swipe gestures for mobile devices
- Infinite loop functionality
- Custom transition effects
- Lazy loading for images
- Virtualization for long lists

## Testing

The implementation has been tested for:
- ✅ Cross-browser compatibility
- ✅ Mobile responsiveness
- ✅ Accessibility standards
- ✅ Performance optimization
- ✅ TypeScript compilation
- ✅ Integration with existing codebase