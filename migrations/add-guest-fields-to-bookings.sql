-- Add guest_name and guest_email columns to bookings table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'guest_name') THEN
        ALTER TABLE bookings ADD COLUMN guest_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'guest_email') THEN
        ALTER TABLE bookings ADD COLUMN guest_email TEXT;
    END IF;
END
$$;
