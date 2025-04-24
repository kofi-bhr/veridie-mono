-- Check if stripe_connect_accounts column exists in mentors table, if not add it
DO $
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mentors' AND column_name = 'stripe_connect_accounts') THEN
        ALTER TABLE mentors ADD COLUMN stripe_connect_accounts TEXT;
    END IF;
END $;

-- Migrate data from stripe_account_id to stripe_connect_accounts if needed
DO $
BEGIN
    UPDATE mentors 
    SET stripe_connect_accounts = stripe_account_id 
    WHERE stripe_account_id IS NOT NULL AND stripe_connect_accounts IS NULL;
END $;

-- Migrate data from stripe_connect_account_id to stripe_connect_accounts if needed
DO $
BEGIN
    UPDATE mentors 
    SET stripe_connect_accounts = stripe_connect_account_id 
    WHERE stripe_connect_account_id IS NOT NULL AND stripe_connect_accounts IS NULL;
END $;

-- Check if stripe_account_details_submitted column exists in mentors table, if not add it
DO $
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mentors' AND column_name = 'stripe_account_details_submitted') THEN
        ALTER TABLE mentors ADD COLUMN stripe_account_details_submitted BOOLEAN DEFAULT FALSE;
    END IF;
END $;

-- Check if stripe_account_charges_enabled column exists in mentors table, if not add it
DO $
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mentors' AND column_name = 'stripe_account_charges_enabled') THEN
        ALTER TABLE mentors ADD COLUMN stripe_account_charges_enabled BOOLEAN DEFAULT FALSE;
    END IF;
END $;

-- Check if stripe_account_payouts_enabled column exists in mentors table, if not add it
DO $
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mentors' AND column_name = 'stripe_account_payouts_enabled') THEN
        ALTER TABLE mentors ADD COLUMN stripe_account_payouts_enabled BOOLEAN DEFAULT FALSE;
    END IF;
END $;

-- Check if stripe_product_id column exists in services table, if not add it
DO $
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'services' AND column_name = 'stripe_product_id') THEN
        ALTER TABLE services ADD COLUMN stripe_product_id TEXT;
    END IF;
END $;

-- Check if stripe_price_id column exists in services table, if not add it
DO $
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'services' AND column_name = 'stripe_price_id') THEN
        ALTER TABLE services ADD COLUMN stripe_price_id TEXT;
    END IF;
END $;
