-- Create stripe_connect_accounts column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mentors' AND column_name = 'stripe_connect_accounts') THEN
        ALTER TABLE mentors ADD COLUMN stripe_connect_accounts TEXT;
    END IF;
END $$;

-- Check if stripe_account_id column exists, and migrate data if needed
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'mentors' AND column_name = 'stripe_account_id') THEN
        -- Migrate data from stripe_account_id to stripe_connect_accounts
        UPDATE mentors 
        SET stripe_connect_accounts = stripe_account_id 
        WHERE stripe_account_id IS NOT NULL AND (stripe_connect_accounts IS NULL OR stripe_connect_accounts = '');
    END IF;
END $$;

-- Check if stripe_connect_account_id column exists, and migrate data if needed
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'mentors' AND column_name = 'stripe_connect_account_id') THEN
        -- Migrate data from stripe_connect_account_id to stripe_connect_accounts
        UPDATE mentors 
        SET stripe_connect_accounts = stripe_connect_account_id 
        WHERE stripe_connect_account_id IS NOT NULL AND (stripe_connect_accounts IS NULL OR stripe_connect_accounts = '');
    END IF;
END $$;

-- Create other required columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mentors' AND column_name = 'stripe_account_details_submitted') THEN
        ALTER TABLE mentors ADD COLUMN stripe_account_details_submitted BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mentors' AND column_name = 'stripe_account_charges_enabled') THEN
        ALTER TABLE mentors ADD COLUMN stripe_account_charges_enabled BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mentors' AND column_name = 'stripe_account_payouts_enabled') THEN
        ALTER TABLE mentors ADD COLUMN stripe_account_payouts_enabled BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create service-related columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'services' AND column_name = 'stripe_product_id') THEN
        ALTER TABLE services ADD COLUMN stripe_product_id TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'services' AND column_name = 'stripe_price_id') THEN
        ALTER TABLE services ADD COLUMN stripe_price_id TEXT;
    END IF;
END $$;
