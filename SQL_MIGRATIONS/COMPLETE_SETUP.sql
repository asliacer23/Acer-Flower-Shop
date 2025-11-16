-- ============================================
-- COMPLETE PROFILE SOLUTION - RUN ALL AT ONCE
-- ============================================
-- Copy and paste this entire script into Supabase SQL Editor

-- Step 1: Add photo_url column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS photo_url text;

-- Step 2: Create RPC function for name updates
CREATE OR REPLACE FUNCTION update_user_name(user_id UUID, new_name TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET name = new_name,
      updated_at = now()
  WHERE id = user_id;
  
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$;

-- Grant permission to authenticated users
GRANT EXECUTE ON FUNCTION update_user_name(UUID, TEXT) TO authenticated;

-- Step 3: Drop old storage policies (if they exist)
DROP POLICY IF EXISTS "Anyone can view profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile photos" ON storage.objects;

-- Step 4: Create new storage RLS policies
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

-- ============================================
-- INSTRUCTIONS AFTER RUNNING THIS SCRIPT:
-- ============================================
-- 1. Go to Supabase Storage Dashboard
-- 2. Create a new bucket named: profiles
-- 3. Set it to PUBLIC access
-- 4. Click Create
-- 5. Refresh your app and test!
-- ============================================
