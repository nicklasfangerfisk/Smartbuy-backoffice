-- Add image URL field to Products table for product images
-- This migration adds image support for product catalog

-- Add ImageUrl column to Products table
ALTER TABLE "Products" 
ADD COLUMN IF NOT EXISTS "image_url" TEXT;

-- Add index for better query performance when filtering by image presence
CREATE INDEX IF NOT EXISTS idx_products_imageurl ON "Products"("image_url");

-- Add comment for documentation
COMMENT ON COLUMN "Products"."image_url" IS 'URL path to product image stored in Supabase storage bucket';
