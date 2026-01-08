-- Drop wishlist table and related policies
DROP TABLE IF EXISTS customer_wishlist;

-- Remove any related functions or triggers if they exist
DROP FUNCTION IF EXISTS update_customer_wishlist_updated_at();