-- Add notes column to Orders table
ALTER TABLE "Orders" 
ADD COLUMN notes TEXT;

-- Add comment
COMMENT ON COLUMN "Orders".notes IS 'Optional notes or comments for the order';
