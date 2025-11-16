-- ============================================
-- COMPLETE SETUP FOR PROFILE FEATURES
-- ============================================

-- Step 1: Add photo_url column to profiles table (if not exists)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS photo_url text;

-- Step 2: Enable RLS on profiles table (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can create profiles" ON public.profiles;

-- Step 4: Create RLS policies for profiles table
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can create profiles"
ON public.profiles
FOR INSERT
WITH CHECK (true);

-- Step 5: Create storage bucket RLS policies
-- (Run these if your profiles storage bucket RLS policies don't exist)

DROP POLICY IF EXISTS "Anyone can view profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile photos" ON storage.objects;

CREATE POLICY "Anyone can view profile photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'profiles');

CREATE POLICY "Authenticated users can upload profile photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'profiles' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own profile photos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'profiles'
  AND auth.uid()::text = owner_id::text
)
WITH CHECK (
  bucket_id = 'profiles'
  AND auth.uid()::text = owner_id::text
);

CREATE POLICY "Users can delete their own profile photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'profiles'
  AND auth.uid()::text = owner_id::text
);
