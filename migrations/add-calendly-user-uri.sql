-- Add calendly_user_uri column to mentors table
DO $$
BEGIN
    -- Check if the column already exists
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'mentors' AND column_name = 'calendly_user_uri'
    ) THEN
        -- Add the column
        ALTER TABLE mentors ADD COLUMN calendly_user_uri text;
        
        -- Update existing records to copy the event_type_uri to user_uri if it's a user URI
        UPDATE mentors 
        SET calendly_user_uri = calendly_event_type_uri 
        WHERE calendly_event_type_uri LIKE '%/users/%';
    END IF;
END
$$;
