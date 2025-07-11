-- Create storage policies for productimages bucket
-- This migration adds RLS policies to allow product image uploads

-- Enable RLS on storage.objects if not already enabled
-- (This is usually enabled by default in Supabase)

-- Policy to allow authenticated users to upload images to productimages bucket
CREATE POLICY "Allow authenticated users to upload product images" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'productimages');

-- Policy to allow everyone to view product images (since bucket is public)
CREATE POLICY "Allow public access to view product images" ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'productimages');

-- Policy to allow authenticated users to update their uploaded images
CREATE POLICY "Allow authenticated users to update product images" ON storage.objects
FOR UPDATE 
TO authenticated
USING (bucket_id = 'productimages')
WITH CHECK (bucket_id = 'productimages');

-- Policy to allow authenticated users to delete product images
CREATE POLICY "Allow authenticated users to delete product images" ON storage.objects
FOR DELETE 
TO authenticated
USING (bucket_id = 'productimages');
