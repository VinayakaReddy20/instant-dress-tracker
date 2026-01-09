-- Create customer_wishlist table
CREATE TABLE public.customer_wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dress_id UUID NOT NULL REFERENCES public.dresses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, dress_id)
);

-- Enable Row Level Security
ALTER TABLE public.customer_wishlist ENABLE ROW LEVEL SECURITY;

-- Create policies for customer_wishlist
CREATE POLICY "Customers can view their own wishlist"
ON public.customer_wishlist
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Customers can insert into their own wishlist"
ON public.customer_wishlist
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Customers can delete from their own wishlist"
ON public.customer_wishlist
FOR DELETE
USING (auth.uid() = user_id);
