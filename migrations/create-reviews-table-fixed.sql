-- First, check if the reviews table already exists and get its structure
DO $$
DECLARE
    table_exists BOOLEAN;
    has_user_id BOOLEAN;
BEGIN
    -- Check if the table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'reviews'
    ) INTO table_exists;

    IF table_exists THEN
        -- Check if user_id column exists
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'reviews' 
            AND column_name = 'user_id'
        ) INTO has_user_id;
        
        -- If the table exists but doesn't have user_id, we need to handle this case
        IF NOT has_user_id THEN
            RAISE NOTICE 'Reviews table exists but does not have user_id column. Adding it...';
            -- Add the user_id column if it doesn't exist
            ALTER TABLE public.reviews ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
    ELSE
        -- Create the reviews table if it doesn't exist
        CREATE TABLE public.reviews (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            client_id UUID,
            name TEXT,
            service TEXT,
            text TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Add indexes for faster lookups
        CREATE INDEX IF NOT EXISTS reviews_mentor_id_idx ON public.reviews(mentor_id);
        CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON public.reviews(user_id);
    END IF;
END $$;

-- Enable RLS on the reviews table
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS reviews_select_policy ON public.reviews;
DROP POLICY IF EXISTS reviews_insert_policy ON public.reviews;
DROP POLICY IF EXISTS reviews_update_policy ON public.reviews;
DROP POLICY IF EXISTS reviews_delete_policy ON public.reviews;

-- Create new policies
-- Policy for selecting reviews (anyone can read reviews)
CREATE POLICY reviews_select_policy ON public.reviews
    FOR SELECT USING (true);

-- Policy for inserting reviews (authenticated users can create reviews)
CREATE POLICY reviews_insert_policy ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy for updating reviews (users can only update their own reviews)
CREATE POLICY reviews_update_policy ON public.reviews
    FOR UPDATE USING (
        -- Check if the user is the author of the review
        (auth.uid() = user_id) OR
        -- Or if the user is the mentor being reviewed
        (auth.uid() = mentor_id)
    );

-- Policy for deleting reviews (users can only delete their own reviews)
CREATE POLICY reviews_delete_policy ON public.reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Add or update the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add the trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add review count and average rating to mentors table if they don't exist
ALTER TABLE public.mentors 
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0;

-- Create or replace function to update mentor review stats
CREATE OR REPLACE FUNCTION update_mentor_review_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the review count and average rating for the mentor
    UPDATE public.mentors
    SET 
        review_count = (SELECT COUNT(*) FROM public.reviews WHERE mentor_id = NEW.mentor_id),
        rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE mentor_id = NEW.mentor_id)
    WHERE id = NEW.mentor_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS after_review_insert ON public.reviews;
DROP TRIGGER IF EXISTS after_review_update ON public.reviews;
DROP TRIGGER IF EXISTS after_review_delete ON public.reviews;

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
