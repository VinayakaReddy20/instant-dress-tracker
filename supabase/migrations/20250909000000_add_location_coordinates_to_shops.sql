-- Add latitude and longitude columns to shops table
ALTER TABLE public.shops
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Update existing shops with coordinates for Ballari, Karnataka
-- Approximate coordinates for Ballari city center: 15.1394° N, 76.9214° E
-- Adding slight variations for different shop locations

-- Ananya Fashion Hub
UPDATE public.shops
SET latitude = 15.1394, longitude = 76.9214
WHERE name = 'Ananya Fashion Hub';

-- Silk Heritage
UPDATE public.shops
SET latitude = 15.1402, longitude = 76.9221
WHERE name = 'Silk Heritage';

-- Trends & Styles
UPDATE public.shops
SET latitude = 15.1386, longitude = 76.9207
WHERE name = 'Trends & Styles';

-- Royal Couture
UPDATE public.shops
SET latitude = 15.1411, longitude = 76.9232
WHERE name = 'Royal Couture';
