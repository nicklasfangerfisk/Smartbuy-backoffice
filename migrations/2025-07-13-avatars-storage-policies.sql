-- Create storage policies for avatars bucket
-- This migration adds RLS policies to allow user avatar uploads

-- Enable RLS on storage.objects if not already enabled
-- (This is usually enabled by default in Supabase)

-- Policy to allow authenticated users to upload their own avatars
CREATE POLICY "Allow users to upload their own avatars" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = split_part(name, '_', 1)
);

-- Policy to allow everyone to view avatars (since they are profile pictures)
CREATE POLICY "Allow public access to view avatars" ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'avatars');

-- Policy to allow users to update their own avatars
CREATE POLICY "Allow users to update their own avatars" ON storage.objects
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = split_part(name, '_', 1)
)
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = split_part(name, '_', 1)
);

-- Policy to allow users to delete their own avatars
CREATE POLICY "Allow users to delete their own avatars" ON storage.objects
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = split_part(name, '_', 1)
);
