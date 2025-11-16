-- Add location and profile picture fields to customers table
ALTER TABLE customers
ADD COLUMN address TEXT,
ADD COLUMN city TEXT,
ADD COLUMN pincode TEXT,
ADD COLUMN latitude DOUBLE PRECISION,
ADD COLUMN longitude DOUBLE PRECISION,
ADD COLUMN profile_picture_url TEXT;
