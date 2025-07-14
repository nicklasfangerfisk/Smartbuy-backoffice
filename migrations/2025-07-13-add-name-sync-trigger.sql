-- Supplementary Migration: Add trigger to keep name field synchronized
-- Run this after the main user profile fields migration

-- Create trigger to keep name field in sync when first_name/last_name change
CREATE OR REPLACE FUNCTION sync_user_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Update name field when first_name or last_name changes
  NEW.name = TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically sync name field
DROP TRIGGER IF EXISTS trigger_sync_user_name ON users;
CREATE TRIGGER trigger_sync_user_name
  BEFORE INSERT OR UPDATE OF first_name, last_name ON users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_name();

-- Sync existing data to ensure consistency
UPDATE users 
SET name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
WHERE first_name IS NOT NULL OR last_name IS NOT NULL;

-- Update comments
COMMENT ON COLUMN users.name IS 'Full name (automatically synced from first_name + last_name)';
COMMENT ON FUNCTION sync_user_name() IS 'Trigger function to keep name field in sync with first_name and last_name';
