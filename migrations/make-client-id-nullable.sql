-- Make client_id nullable in reviews table
ALTER TABLE reviews ALTER COLUMN client_id DROP NOT NULL;
