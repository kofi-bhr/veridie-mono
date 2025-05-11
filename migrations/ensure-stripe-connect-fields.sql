-- Check if stripe_connect_accounts column exists in mentors table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'mentors'
        AND column_name = 'stripe_connect_accounts'
    ) THEN
        ALTER TABLE public.mentors
        ADD COLUMN stripe_connect_accounts text;
    END IF;

    -- Check if stripe_account_details_submitted column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'mentors'
        AND column_name = 'stripe_account_details_submitted'
    ) THEN
        ALTER TABLE public.mentors
        ADD COLUMN stripe_account_details_submitted boolean DEFAULT false;
    END IF;

    -- Check if stripe_account_charges_enabled column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'mentors'
        AND column_name = 'stripe_account_charges_enabled'
    ) THEN
        ALTER TABLE public.mentors
        ADD COLUMN stripe_account_charges_enabled boolean DEFAULT false;
    END IF;

    -- Check if stripe_account_payouts_enabled column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'mentors'
        AND column_name = 'stripe_account_payouts_enabled'
    ) THEN
        ALTER TABLE public.mentors
        ADD COLUMN stripe_account_payouts_enabled boolean DEFAULT false;
    END IF;

    -- Migrate data from old columns if they exist
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'mentors'
        AND column_name = 'stripe_account_id'
    ) THEN
        -- Update stripe_connect_accounts with values from stripe_account_id
        UPDATE public.mentors
        SET stripe_connect_accounts = stripe_account_id
        WHERE stripe_account_id IS NOT NULL AND (stripe_connect_accounts IS NULL OR stripe_connect_accounts = '');
    END IF;
END $$;
