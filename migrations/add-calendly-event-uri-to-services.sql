-- Add calendly_event_uri column to services table if it doesn't exist
DO $$
BEGIN
    -- Check if the column already exists
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'calendly_event_uri'
    ) THEN
        -- Add the column
        ALTER TABLE services ADD COLUMN calendly_event_uri text;
    END IF;
END
$$;
