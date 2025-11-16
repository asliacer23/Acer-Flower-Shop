-- Storage RLS Policies for 'profiles' bucket

-- SELECT Policy: Anyone can view profile photos (public)
CREATE POLICY "Anyone can view profile photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'profiles');

-- INSERT Policy: Only authenticated users can upload
CREATE POLICY "Authenticated users can upload profile photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'profiles' 
  AND auth.role() = 'authenticated'
);

-- UPDATE Policy: Users can update their own files
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

-- DELETE Policy: Users can delete their own files
CREATE POLICY "Users can delete their own profile photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'profiles'
  AND auth.uid()::text = owner_id::text
);
