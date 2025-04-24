-- Add Stripe Connect fields to mentors table
ALTER TABLE mentors
ADD COLUMN stripe_connect_account_id TEXT,
ADD COLUMN stripe_connect_details_submitted BOOLEAN DEFAULT FALSE,
ADD COLUMN stripe_connect_charges_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN stripe_connect_payouts_enabled BOOLEAN DEFAULT FALSE;

-- Add Stripe product and price fields to services table
ALTER TABLE services
ADD COLUMN stripe_product_id TEXT,
ADD COLUMN stripe_price_id TEXT;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_mentors_stripe_connect_account_id ON mentors(stripe_connect_account_id);
CREATE INDEX IF NOT EXISTS idx_services_stripe_product_id ON services(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_services_stripe_price_id ON services(stripe_price_id);
