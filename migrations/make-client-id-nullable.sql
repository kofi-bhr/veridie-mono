-- Make client_id column nullable in bookings table
ALTER TABLE bookings ALTER COLUMN client_id DROP NOT NULL;
