-- Migration: Add first_name, last_name, and phone_number fields to users table
-- This migration adds support for separate first/last name fields and phone numbers with country codes

-- Add first_name column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name TEXT;

-- Add last_name column  
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Add phone_number column for international phone numbers with country codes
-- Note: This is separate from Supabase Auth's phone field (used for SMS auth)
-- Our phone_number field is for contact/profile information
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Add check constraint to ensure phone numbers include country code (start with +)
ALTER TABLE users 
ADD CONSTRAINT phone_number_format_check 
CHECK (phone_number IS NULL OR phone_number ~ '^\+[1-9]\d{7,}$');

-- Create index for faster phone number lookups
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);

-- Migrate existing name data to first_name and last_name before dropping the column
UPDATE users 
SET 
  first_name = SPLIT_PART(name, ' ', 1),
  last_name = CASE 
    WHEN POSITION(' ' IN name) > 0 THEN 
      SUBSTRING(name FROM POSITION(' ' IN name) + 1)
    ELSE NULL
  END
WHERE name IS NOT NULL AND first_name IS NULL;

-- Drop the name column entirely - we'll use first_name and last_name only
ALTER TABLE users DROP COLUMN IF EXISTS name;

-- Add comments for documentation
COMMENT ON COLUMN users.first_name IS 'User first name (given name)';
COMMENT ON COLUMN users.last_name IS 'User last name (family name)';
COMMENT ON COLUMN users.phone_number IS 'User phone number with country code (e.g., +4512345678) - for contact/profile, separate from auth.users.phone which is for SMS authentication';
