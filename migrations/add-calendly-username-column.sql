-- Add Calendly username column to mentors table
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS calendly_username TEXT;

-- Add Calendly token columns to mentors table
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS calendly_token TEXT;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS calendly_refresh_token TEXT;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS calendly_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Add Calendly event URI column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS calendly_event_uri TEXT;
