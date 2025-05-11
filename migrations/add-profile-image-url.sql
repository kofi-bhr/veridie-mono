-- Add profile_image_url column to mentors table if it doesn't exist
ALTER TABLE public.mentors
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Update existing mentors to use their profile avatar if available
UPDATE public.mentors m
SET profile_image_url = p.avatar
FROM public.profiles p
WHERE m.id = p.id AND p.avatar IS NOT NULL AND m.profile_image_url IS NULL;
