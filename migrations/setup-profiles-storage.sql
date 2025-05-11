-- This SQL will be executed by the API route to set up the storage bucket
-- We're creating it here for documentation purposes

-- Create the storage bucket for profiles if it doesn't exist
-- Note: This is typically done via the Supabase API, not SQL directly
-- But we include the SQL for RLS policies that will be applied

-- RLS policies for the profiles bucket
CREATE POLICY "Public profiles are viewable by everyone" 
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles' AND auth.role() = 'authenticated');

CREATE POLICY "Users can upload their own profile pictures" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'profiles' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile pictures" 
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profiles' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile pictures" 
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profiles' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Update profiles table to ensure avatar column exists
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar TEXT;
