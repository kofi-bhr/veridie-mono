-- Update packages table schema
ALTER TABLE packages
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS duration INTEGER,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Rename title to name for existing records if title exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'packages' 
    AND column_name = 'title'
  ) THEN
    ALTER TABLE packages RENAME COLUMN title TO name;
  END IF;
END $$; 