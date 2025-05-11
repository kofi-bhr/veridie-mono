-- Make sure the profile_image_url column exists in the mentors table
ALTER TABLE IF EXISTS public.mentors
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Update any null profile_image_url values with the corresponding avatar from profiles
UPDATE public.mentors m
SET profile_image_url = p.avatar
FROM public.profiles p
WHERE m.id = p.id
AND m.profile_image_url IS NULL
AND p.avatar IS NOT NULL;

-- Create an index on the profile_image_url column for better performance
CREATE INDEX IF NOT EXISTS idx_mentors_profile_image_url ON public.mentors (profile_image_url);

-- Make sure the storage.objects table has the correct permissions
GRANT SELECT ON storage.objects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
