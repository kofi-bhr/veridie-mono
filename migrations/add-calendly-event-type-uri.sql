-- Add Calendly event type URI to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS calendly_event_type_uri TEXT;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_services_calendly_event_type_uri ON services(calendly_event_type_uri);
