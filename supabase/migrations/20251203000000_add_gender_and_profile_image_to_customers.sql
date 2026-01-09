-- Add gender and profile_image_url columns to customers table
ALTER TABLE public.customers
ADD COLUMN gender TEXT,
ADD COLUMN profile_image_url TEXT;
