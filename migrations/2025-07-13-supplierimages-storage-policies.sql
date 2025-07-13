-- Create storage policies for supplierimages bucket
-- This migration adds RLS policies to allow supplier image uploads

-- Enable RLS on storage.objects if not already enabled
-- (This is usually enabled by default in Supabase)

-- Policy to allow authenticated users to upload images to supplierimages bucket
CREATE POLICY "Allow authenticated users to upload supplier images" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'supplierimages');

-- Policy to allow everyone to view supplier images (since bucket is public)
CREATE POLICY "Allow public access to view supplier images" ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'supplierimages');

-- Policy to allow authenticated users to update their uploaded images
CREATE POLICY "Allow authenticated users to update supplier images" ON storage.objects
FOR UPDATE 
TO authenticated
USING (bucket_id = 'supplierimages')
WITH CHECK (bucket_id = 'supplierimages');

-- Policy to allow authenticated users to delete supplier images
CREATE POLICY "Allow authenticated users to delete supplier images" ON storage.objects
FOR DELETE 
TO authenticated
USING (bucket_id = 'supplierimages');
