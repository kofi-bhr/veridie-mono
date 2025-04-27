-- Add stripe_account_status to consultants
ALTER TABLE consultants
ADD COLUMN IF NOT EXISTS stripe_account_status text DEFAULT 'pending';

-- Add is_active to consultants if it doesn't exist
ALTER TABLE consultants
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Add updated_at to purchases if it doesn't exist
ALTER TABLE purchases
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Add updated_at to consultants if it doesn't exist
ALTER TABLE consultants
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
