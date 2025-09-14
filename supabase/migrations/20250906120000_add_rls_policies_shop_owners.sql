-- Enable Row Level Security on shop_owners table
ALTER TABLE ONLY shop_owners ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Insert own shop_owner" ON shop_owners;
DROP POLICY IF EXISTS "Select own shop_owner" ON shop_owners;
DROP POLICY IF EXISTS "Update own shop_owner" ON shop_owners;
DROP POLICY IF EXISTS "Delete own shop_owner" ON shop_owners;

-- Create policy to allow authenticated users to insert their own shop_owner record
CREATE POLICY "Insert own shop_owner" ON shop_owners
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow authenticated users to select their own shop_owner record
CREATE POLICY "Select own shop_owner" ON shop_owners
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy to allow authenticated users to update their own shop_owner record
CREATE POLICY "Update own shop_owner" ON shop_owners
FOR UPDATE
USING (auth.uid() = user_id);

-- Create policy to allow authenticated users to delete their own shop_owner record
CREATE POLICY "Delete own shop_owner" ON shop_owners
FOR DELETE
USING (auth.uid() = user_id);
