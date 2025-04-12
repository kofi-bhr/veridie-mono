-- Create a function to automatically create consultant profiles
CREATE OR REPLACE FUNCTION public.create_consultant_profile()
RETURNS TRIGGER AS $$
DECLARE
  random_suffix TEXT;
  new_slug TEXT;
  slug_exists BOOLEAN;
BEGIN
  -- Only create a consultant profile if the role is 'consultant'
  IF NEW.role = 'consultant' THEN
    -- Generate a unique slug
    random_suffix := substr(md5(random()::text), 1, 6);
    new_slug := 'mentor-' || substr(NEW.id::text, 1, 8) || '-' || random_suffix;
    
    -- Check if slug already exists
    SELECT EXISTS (
      SELECT 1 FROM public.consultants WHERE slug = new_slug
    ) INTO slug_exists;
    
    -- If slug exists, generate a new one
    WHILE slug_exists LOOP
      random_suffix := substr(md5(random()::text), 1, 6);
      new_slug := 'mentor-' || substr(NEW.id::text, 1, 8) || '-' || random_suffix;
      
      SELECT EXISTS (
        SELECT 1 FROM public.consultants WHERE slug = new_slug
      ) INTO slug_exists;
    END LOOP;
    
    -- Insert the new consultant profile
    INSERT INTO public.consultants (
      user_id,
      headline,
      description,
      image_url,
      slug,
      university,
      major,
      sat_score,
      num_aps
    ) VALUES (
      NEW.id,
      'Coming Soon',
      'This mentor profile is currently being set up. Check back soon for more information!',
      'https://via.placeholder.com/300',
      new_slug,
      'Not specified',
      ARRAY['Undecided'],
      0,
      0
    );
    
    RAISE NOTICE 'Created consultant profile for user %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically create consultant profiles
DROP TRIGGER IF EXISTS create_consultant_profile_trigger ON public.profiles;
CREATE TRIGGER create_consultant_profile_trigger
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_consultant_profile();

-- Create a trigger to automatically create consultant profiles when role is updated to 'consultant'
DROP TRIGGER IF EXISTS update_consultant_profile_trigger ON public.profiles;
CREATE TRIGGER update_consultant_profile_trigger
AFTER UPDATE OF role ON public.profiles
FOR EACH ROW
WHEN (OLD.role <> 'consultant' AND NEW.role = 'consultant')
EXECUTE FUNCTION public.create_consultant_profile();
