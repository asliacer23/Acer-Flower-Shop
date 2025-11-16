-- Add photo_url column to profiles table for profile pictures
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS photo_url text;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(id);
