-- Function to validate stock before inserting/updating cart items
CREATE OR REPLACE FUNCTION validate_cart_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_dress_stock INTEGER;
  v_cart_quantity INTEGER;
  v_total_quantity INTEGER;
BEGIN
  -- Get current stock for the dress
  SELECT stock INTO v_dress_stock
  FROM dresses 
  WHERE id = NEW.dress_id;
  
  -- Check if dress exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Dress with ID % not found', NEW.dress_id;
  END IF;
  
  -- Check if dress is out of stock
  IF v_dress_stock IS NULL OR v_dress_stock <= 0 THEN
    RAISE EXCEPTION 'Cannot add to cart: Dress "%" is out of stock', 
      (SELECT name FROM dresses WHERE id = NEW.dress_id);
  END IF;
  
  -- Check if requested quantity exceeds stock
  IF NEW.quantity > v_dress_stock THEN
    RAISE EXCEPTION 'Cannot add to cart: Only % item(s) available in stock for dress "%"', 
      v_dress_stock, (SELECT name FROM dresses WHERE id = NEW.dress_id);
  END IF;
  
  -- If updating existing cart item, check total quantity
  IF TG_OP = 'UPDATE' THEN
    -- Get current quantity in cart for this user and dress (excluding the current update)
    SELECT COALESCE(SUM(quantity), 0) INTO v_cart_quantity
    FROM cart 
    WHERE user_id = NEW.user_id 
      AND dress_id = NEW.dress_id 
      AND id != NEW.id;
    
    v_total_quantity := v_cart_quantity + NEW.quantity;
    
    -- Check if total quantity exceeds stock
    IF v_total_quantity > v_dress_stock THEN
      RAISE EXCEPTION 'Cannot update cart: Total quantity % exceeds available stock % for dress "%"', 
        v_total_quantity, v_dress_stock, (SELECT name FROM dresses WHERE id = NEW.dress_id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for cart table
DROP TRIGGER IF EXISTS trigger_validate_cart_stock ON cart;
CREATE TRIGGER trigger_validate_cart_stock
  BEFORE INSERT OR UPDATE ON cart
  FOR EACH ROW
  EXECUTE FUNCTION validate_cart_stock();

-- Function to prevent negative stock updates
CREATE OR REPLACE FUNCTION prevent_negative_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent stock from going negative
  IF NEW.stock < 0 THEN
    RAISE EXCEPTION 'Stock cannot be negative for dress "%"', NEW.name;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for dresses table
DROP TRIGGER IF EXISTS trigger_prevent_negative_stock ON dresses;
CREATE TRIGGER trigger_prevent_negative_stock
  BEFORE UPDATE ON dresses
  FOR EACH ROW
  EXECUTE FUNCTION prevent_negative_stock();

-- Function to validate stock during checkout (if we had an orders table)
-- This is a placeholder for future implementation
CREATE OR REPLACE FUNCTION validate_checkout_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_dress_stock INTEGER;
BEGIN
  -- This would be used when creating orders from cart items
  -- For now, it's a placeholder function
  RETURN NEW;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION validate_cart_stock() TO authenticated;
GRANT EXECUTE ON FUNCTION prevent_negative_stock() TO authenticated;
GRANT EXECUTE ON FUNCTION validate_checkout_stock() TO authenticated;