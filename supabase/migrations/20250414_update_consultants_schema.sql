-- Add missing columns to consultants table
ALTER TABLE consultants
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_consultants_updated_at ON consultants;
CREATE TRIGGER update_consultants_updated_at
    BEFORE UPDATE ON consultants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 