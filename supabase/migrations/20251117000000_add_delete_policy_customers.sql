-- Add DELETE policy for customers table to allow users to delete their own records
CREATE POLICY "Customers can delete their own data"
ON public.customers
FOR DELETE
USING (auth.uid() = user_id);
