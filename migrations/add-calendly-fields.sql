-- Add Calendly username column to mentors table
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS calendly_username TEXT;

-- Add Calendly event ID column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS calendly_event_id TEXT;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_calendly_event_id ON bookings(calendly_event_id);
