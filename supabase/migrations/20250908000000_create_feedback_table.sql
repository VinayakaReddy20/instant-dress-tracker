-- Create feedback table
CREATE TABLE public.feedback (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT,
    email TEXT,
    category TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts (anyone can submit feedback)
CREATE POLICY "Allow public inserts on feedback"
ON public.feedback
FOR INSERT
WITH CHECK (true);

-- Create policy to allow authenticated users to view feedback (optional, for admin purposes)
CREATE POLICY "Allow authenticated users to view feedback"
ON public.feedback
FOR SELECT
USING (auth.role() = 'authenticated');
