-- Create a separate table for guest bookings
CREATE TABLE IF NOT EXISTS guest_bookings (
  id UUID PRIMARY KEY,
  mentor_id UUID NOT NULL,
  service_id UUID NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  calendly_event_uri TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);
