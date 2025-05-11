-- Ensure profile_image_url column exists in mentors table
ALTER TABLE public.mentors
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Sync profile_image_url with avatar from profiles where it's missing
UPDATE public.mentors m
SET profile_image_url = p.avatar
FROM public.profiles p
WHERE m.id = p.id
AND (m.profile_image_url IS NULL OR m.profile_image_url = '')
AND p.avatar IS NOT NULL;

-- Set proper permissions for storage access
GRANT SELECT ON storage.objects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
