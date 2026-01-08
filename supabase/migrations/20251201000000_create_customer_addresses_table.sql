-- Create customer_addresses table
CREATE TABLE public.customer_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  house_street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

-- Create policies for customer_addresses
CREATE POLICY "Customers can view their own addresses"
ON public.customer_addresses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Customers can insert their own addresses"
ON public.customer_addresses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Customers can update their own addresses"
ON public.customer_addresses
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Customers can delete their own addresses"
ON public.customer_addresses
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_customer_addresses_updated_at
    BEFORE UPDATE ON public.customer_addresses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure only one default address per user
CREATE UNIQUE INDEX idx_customer_addresses_user_default
ON public.customer_addresses (user_id)
WHERE is_default = true;
