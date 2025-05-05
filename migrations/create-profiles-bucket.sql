-- This is a SQL representation of what we're doing in the API route
-- This is for documentation purposes only, as bucket creation is done via the API

-- Create a storage bucket for profiles
-- Note: This cannot be done directly in SQL, it's done via the Supabase API
-- The equivalent API call would be:
-- supabase.storage.createBucket('profiles', { public: true })

-- For RLS policies, we can define them in SQL:

-- Allow public read access to all objects
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'profiles');

-- Allow authenticated users to upload objects to their own folder
CREATE POLICY "User Upload Access" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to update and delete their own objects
CREATE POLICY "User Update Access" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "User Delete Access" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text);
