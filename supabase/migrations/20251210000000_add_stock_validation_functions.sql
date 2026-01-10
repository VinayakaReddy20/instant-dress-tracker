-- Function to validate stock before adding to cart
CREATE OR REPLACE FUNCTION validate_dress_stock(
  p_dress_id UUID,
  p_quantity INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_dress_record RECORD;
  v_result JSONB;
BEGIN
  -- Input validation
  IF p_dress_id IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Dress ID is required',
      'error_type', 'INVALID_INPUT'
    );
  END IF;
  
  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Quantity must be greater than 0',
      'error_type', 'INVALID_QUANTITY'
    );
  END IF;

  -- Fetch dress information
  SELECT id, name, stock, price INTO v_dress_record
  FROM dresses 
  WHERE id = p_dress_id;
  
  -- Check if dress exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Dress not found',
      'error_type', 'DRESS_NOT_FOUND'
    );
  END IF;
  
  -- Check stock availability
  IF v_dress_record.stock IS NULL OR v_dress_record.stock <= 0 THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'This dress is currently out of stock',
      'error_type', 'OUT_OF_STOCK',
      'current_stock', 0,
      'dress_id', p_dress_id
    );
  END IF;
  
  -- Check if requested quantity is available
  IF v_dress_record.stock < p_quantity THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', format('Only %s item(s) available in stock', v_dress_record.stock),
      'error_type', 'INSUFFICIENT_STOCK',
      'current_stock', v_dress_record.stock,
      'requested_quantity', p_quantity,
      'dress_id', p_dress_id
    );
  END IF;
  
  -- Stock is valid
  RETURN jsonb_build_object(
    'valid', true,
    'message', 'Stock validation successful',
    'current_stock', v_dress_record.stock,
    'available_quantity', v_dress_record.stock,
    'dress_id', p_dress_id,
    'dress_name', v_dress_record.name
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'valid', false,
    'message', 'Stock validation failed: ' || SQLERRM,
    'error_type', 'VALIDATION_ERROR',
    'dress_id', p_dress_id
  );
END;
$$;

-- Function to add item to cart with stock validation
CREATE OR REPLACE FUNCTION add_to_cart_with_validation(
  p_user_id UUID,
  p_dress_id UUID,
  p_quantity INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_validation_result JSONB;
  v_cart_item RECORD;
  v_result JSONB;
BEGIN
  -- Validate stock first
  v_validation_result := validate_dress_stock(p_dress_id, p_quantity);
  
  IF (v_validation_result->>'valid')::BOOLEAN = false THEN
    RETURN v_validation_result;
  END IF;
  
  -- Check if user exists
  PERFORM 1 FROM auth.users WHERE id = p_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User not found',
      'error_type', 'USER_NOT_FOUND'
    );
  END IF;
  
  -- Check if item already exists in cart
  SELECT id, quantity INTO v_cart_item
  FROM cart 
  WHERE user_id = p_user_id AND dress_id = p_dress_id;
  
  IF FOUND THEN
    -- Update existing cart item
    UPDATE cart 
    SET quantity = v_cart_item.quantity + p_quantity,
        updated_at = NOW()
    WHERE id = v_cart_item.id;
    
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Cart item updated successfully',
      'action', 'UPDATED',
      'new_quantity', v_cart_item.quantity + p_quantity
    );
  ELSE
    -- Insert new cart item
    INSERT INTO cart (user_id, dress_id, quantity)
    VALUES (p_user_id, p_dress_id, p_quantity);
    
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Item added to cart successfully',
      'action', 'ADDED',
      'quantity', p_quantity
    );
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'message', 'Failed to add item to cart: ' || SQLERRM,
    'error_type', 'CART_ERROR'
  );
END;
$$;

-- Function to update cart item quantity with stock validation
CREATE OR REPLACE FUNCTION update_cart_quantity_with_validation(
  p_user_id UUID,
  p_dress_id UUID,
  p_new_quantity INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_validation_result JSONB;
  v_result JSONB;
BEGIN
  -- Validate stock for new quantity
  v_validation_result := validate_dress_stock(p_dress_id, p_new_quantity);
  
  IF (v_validation_result->>'valid')::BOOLEAN = false THEN
    RETURN v_validation_result;
  END IF;
  
  -- Update cart item
  UPDATE cart 
  SET quantity = p_new_quantity,
      updated_at = NOW()
  WHERE user_id = p_user_id AND dress_id = p_dress_id;
  
  -- Check if update was successful
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Cart item not found',
      'error_type', 'ITEM_NOT_FOUND'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Cart quantity updated successfully',
    'new_quantity', p_new_quantity
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'message', 'Failed to update cart quantity: ' || SQLERRM,
    'error_type', 'CART_ERROR'
  );
END;
$$;

-- Function to remove item from cart
CREATE OR REPLACE FUNCTION remove_from_cart(
  p_user_id UUID,
  p_dress_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM cart 
  WHERE user_id = p_user_id AND dress_id = p_dress_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Cart item not found',
      'error_type', 'ITEM_NOT_FOUND'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Item removed from cart successfully'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'message', 'Failed to remove item from cart: ' || SQLERRM,
    'error_type', 'CART_ERROR'
  );
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION validate_dress_stock(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION add_to_cart_with_validation(UUID, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION update_cart_quantity_with_validation(UUID, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_from_cart(UUID, UUID) TO authenticated;