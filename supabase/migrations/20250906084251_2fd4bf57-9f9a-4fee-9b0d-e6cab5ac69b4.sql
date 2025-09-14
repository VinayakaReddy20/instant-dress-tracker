-- Create shop_owners table
CREATE TABLE public.shop_owners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  profile_image_url TEXT,
  business_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shops table
CREATE TABLE public.shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  hours TEXT DEFAULT '9 AM - 8 PM',
  specialties TEXT[] DEFAULT '{}',
  description TEXT,
  image_url TEXT,
  owner_id UUID REFERENCES public.shop_owners(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dresses table
CREATE TABLE public.dresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  material TEXT,
  brand TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dresses ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since this is a shop directory)
CREATE POLICY "Shops are viewable by everyone" 
ON public.shops 
FOR SELECT 
USING (true);

CREATE POLICY "Dresses are viewable by everyone" 
ON public.dresses 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_shops_updated_at
    BEFORE UPDATE ON public.shops
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dresses_updated_at
    BEFORE UPDATE ON public.dresses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert shops in Ballari, Karnataka
INSERT INTO public.shops (name, location, address, phone, rating, review_count, hours, specialties, description, image_url) VALUES
('Ananya Fashion Hub', 'Ballari, Karnataka', 'Shop No. 15, Gandhi Bazaar, Ballari, Karnataka 583101', '+91 8533-245678', 4.8, 145, '9 AM - 9 PM', ARRAY['Bridal', 'Traditional', 'Designer'], 'Premium boutique specializing in traditional and bridal wear with exquisite handwork and designer collections.', '/api/placeholder/400/300'),

('Silk Heritage', 'Ballari, Karnataka', 'Main Road, Near City Bus Stand, Ballari, Karnataka 583101', '+91 8533-156789', 4.6, 98, '10 AM - 8 PM', ARRAY['Silk Sarees', 'Lehengas', 'Party Wear'], 'Authentic silk collection featuring traditional Karnataka silk sarees and elegant party wear dresses.', '/api/placeholder/400/300'),

('Trends & Styles', 'Ballari, Karnataka', 'Commercial Street, Opposite SBI Bank, Ballari, Karnataka 583101', '+91 8533-987654', 4.7, 127, '9:30 AM - 8:30 PM', ARRAY['Western', 'Indo-Western', 'Casual'], 'Modern fashion boutique offering latest trends in western and indo-western outfits for contemporary women.', '/api/placeholder/400/300'),

('Royal Couture', 'Ballari, Karnataka', 'Hampi Road, Near District Court, Ballari, Karnataka 583101', '+91 8533-345612', 4.9, 89, '10 AM - 7 PM', ARRAY['Wedding', 'Heavy Work', 'Luxury'], 'Luxury fashion house specializing in heavy work dresses and exclusive wedding collections with royal touch.', '/api/placeholder/400/300');

-- Insert dresses for each shop
INSERT INTO public.dresses (shop_id, name, price, stock, size, color, category, description, material, brand) VALUES
-- Ananya Fashion Hub dresses
((SELECT id FROM public.shops WHERE name = 'Ananya Fashion Hub'), 'Royal Silk Lehenga', 1599.00, 2, 'M', 'Maroon', 'Bridal', 'Exquisite silk lehenga with golden zari work perfect for weddings', 'Pure Silk', 'Ananya'),
((SELECT id FROM public.shops WHERE name = 'Ananya Fashion Hub'), 'Designer Saree Gown', 899.00, 4, 'L', 'Navy Blue', 'Traditional', 'Elegant saree gown with contemporary styling and traditional embroidery', 'Georgette', 'Ananya'),
((SELECT id FROM public.shops WHERE name = 'Ananya Fashion Hub'), 'Embroidered Anarkali', 649.00, 3, 'S', 'Pink', 'Designer', 'Beautiful anarkali with intricate embroidery and mirror work', 'Cotton Silk', 'Ananya'),

-- Silk Heritage dresses  
((SELECT id FROM public.shops WHERE name = 'Silk Heritage'), 'Mysore Silk Saree Dress', 1299.00, 5, 'M', 'Green', 'Traditional', 'Premium Mysore silk converted into modern dress style', 'Mysore Silk', 'Heritage'),
((SELECT id FROM public.shops WHERE name = 'Silk Heritage'), 'Party Wear Lehenga', 999.00, 3, 'L', 'Purple', 'Party Wear', 'Stunning party wear lehenga with sequin work', 'Net', 'Heritage'),
((SELECT id FROM public.shops WHERE name = 'Silk Heritage'), 'Silk Kurta Dress', 399.00, 6, 'XL', 'Yellow', 'Casual', 'Comfortable silk kurta style dress for daily wear', 'Silk Cotton', 'Heritage'),

-- Trends & Styles dresses
((SELECT id FROM public.shops WHERE name = 'Trends & Styles'), 'Indo-Western Gown', 499.00, 4, 'S', 'Black', 'Indo-Western', 'Trendy indo-western gown perfect for parties and events', 'Crepe', 'Trends'),
((SELECT id FROM public.shops WHERE name = 'Trends & Styles'), 'Casual Maxi Dress', 499.00, 8, 'M', 'Blue', 'Casual', 'Comfortable maxi dress for everyday wear', 'Cotton', 'Trends'),
((SELECT id FROM public.shops WHERE name = 'Trends & Styles'), 'Office Wear Dress', 999.00, 5, 'L', 'Grey', 'Western', 'Professional office wear dress with modern cut', 'Polyester', 'Trends'),

-- Royal Couture dresses
((SELECT id FROM public.shops WHERE name = 'Royal Couture'), 'Wedding Lehenga Choli', 2599.00, 1, 'M', 'Red', 'Wedding', 'Luxurious wedding lehenga with heavy gold work and precious stones', 'Velvet', 'Royal'),
((SELECT id FROM public.shops WHERE name = 'Royal Couture'), 'Heavy Work Gown', 1899.00, 2, 'L', 'Wine', 'Luxury', 'Designer gown with heavy embroidery and beadwork', 'Silk Velvet', 'Royal'),
((SELECT id FROM public.shops WHERE name = 'Royal Couture'), 'Bridal Sharara Set', 2299.00, 1, 'S', 'Golden', 'Bridal', 'Exquisite bridal sharara with intricate craftsmanship', 'Brocade', 'Royal');


-- 🏬 Update Shops with Real Images
UPDATE shops 
SET image_url = 'https://images.unsplash.com/photo-1521334884684-d80222895322?w=800'
WHERE name = 'Ananya Fashion Hub';

UPDATE shops 
SET image_url = 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800'
WHERE name = 'Silk Heritage';

UPDATE shops 
SET image_url = 'https://images.unsplash.com/photo-1520975918318-5f1c6c546f83?w=800'
WHERE name = 'Trends & Styles';

UPDATE shops 
SET image_url = 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800'
WHERE name = 'Royal Couture';


-- 👗 Update Dresses with Real Images
UPDATE dresses 
SET image_url = 'https://images.unsplash.com/photo-1602810318383-e6e6ef3c14b9?w=800'
WHERE name = 'Royal Silk Lehenga';

UPDATE dresses 
SET image_url = 'https://images.unsplash.com/photo-1520975918318-5f1c6c546f83?w=800'
WHERE name = 'Designer Saree Gown';

UPDATE dresses 
SET image_url = 'https://images.unsplash.com/photo-1593032465171-8f3c60a4b29c?w=800'
WHERE name = 'Embroidered Anarkali';

UPDATE dresses 
SET image_url = 'https://images.unsplash.com/photo-1617059248559-70b78dcb74e8?w=800'
WHERE name = 'Mysore Silk Saree Dress';

UPDATE dresses 
SET image_url = 'https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?w=800'
WHERE name = 'Party Wear Lehenga';

UPDATE dresses 
SET image_url = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'
WHERE name = 'Silk Kurta Dress';

UPDATE dresses 
SET image_url = 'https://images.unsplash.com/photo-1523413651479-597eb2da0ad1?w=800'
WHERE name = 'Indo-Western Gown';

UPDATE dresses 
SET image_url = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'
WHERE name = 'Casual Maxi Dress';

UPDATE dresses 
SET image_url = 'https://images.unsplash.com/photo-1602810318383-e6e6ef3c14b9?w=800'
WHERE name = 'Office Wear Dress';

UPDATE dresses 
SET image_url = 'https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?w=800'
WHERE name = 'Wedding Lehenga Choli';

UPDATE dresses 
SET image_url = 'https://images.unsplash.com/photo-1523413651479-597eb2da0ad1?w=800'
WHERE name = 'Heavy Work Gown';

UPDATE dresses 
SET image_url = 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800'
WHERE name = 'Bridal Sharara Set';
