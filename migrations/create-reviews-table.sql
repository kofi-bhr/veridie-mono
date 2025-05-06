-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    booking_id UUID,
    title TEXT,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'pending', 'rejected'))
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS reviews_mentor_id_idx ON public.reviews(mentor_id);
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS reviews_service_id_idx ON public.reviews(service_id);

-- Add RLS policies
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policy for selecting reviews (anyone can read published reviews)
CREATE POLICY reviews_select_policy ON public.reviews
    FOR SELECT USING (status = 'published');

-- Policy for inserting reviews (authenticated users can create reviews)
CREATE POLICY reviews_insert_policy ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for updating reviews (users can only update their own reviews)
CREATE POLICY reviews_update_policy ON public.reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy for deleting reviews (users can only delete their own reviews)
CREATE POLICY reviews_delete_policy ON public.reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add review count and average rating to mentors table
ALTER TABLE public.mentors 
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0;

-- Create function to update mentor review stats
CREATE OR REPLACE FUNCTION update_mentor_review_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the review count and average rating for the mentor
    UPDATE public.mentors
    SET 
        review_count = (SELECT COUNT(*) FROM public.reviews WHERE mentor_id = NEW.mentor_id AND status = 'published'),
        rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE mentor_id = NEW.mentor_id AND status = 'published')
    WHERE id = NEW.mentor_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to update mentor stats when reviews change
CREATE TRIGGER after_review_insert
    AFTER INSERT ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_mentor_review_stats();

CREATE TRIGGER after_review_update
    AFTER UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_mentor_review_stats();

CREATE TRIGGER after_review_delete
    AFTER DELETE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_mentor_review_stats();
