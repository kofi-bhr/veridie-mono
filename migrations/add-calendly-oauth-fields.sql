-- Add Calendly OAuth fields to mentors table
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS calendly_access_token TEXT;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS calendly_refresh_token TEXT;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS calendly_user_uri TEXT;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS calendly_token_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS calendly_organization_uri TEXT;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS calendly_webhook_subscriptions JSONB;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_mentors_calendly_user_uri ON mentors(calendly_user_uri);
