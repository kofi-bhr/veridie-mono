import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  try {
    // Create a Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // SQL to add Stripe Connect fields
    const sql = `
      -- Add Stripe Connect fields to mentors table if they don't exist
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentors' AND column_name = 'stripe_connect_account_id') THEN
          ALTER TABLE mentors
          ADD COLUMN stripe_connect_account_id TEXT,
          ADD COLUMN stripe_connect_details_submitted BOOLEAN DEFAULT FALSE,
          ADD COLUMN stripe_connect_charges_enabled BOOLEAN DEFAULT FALSE,
          ADD COLUMN stripe_connect_payouts_enabled BOOLEAN DEFAULT FALSE;
        END IF;

        -- Add Stripe product and price fields to services table if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'stripe_product_id') THEN
          ALTER TABLE services
          ADD COLUMN stripe_product_id TEXT,
          ADD COLUMN stripe_price_id TEXT;
        END IF;
      END $$;

      -- Create indexes for faster lookups
      CREATE INDEX IF NOT EXISTS idx_mentors_stripe_connect_account_id ON mentors(stripe_connect_account_id);
      CREATE INDEX IF NOT EXISTS idx_services_stripe_product_id ON services(stripe_product_id);
      CREATE INDEX IF NOT EXISTS idx_services_stripe_price_id ON services(stripe_price_id);
    `

    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", { sql_query: sql })

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, message: "Stripe Connect fields added to database" })
  } catch (error) {
    console.error("Error setting up Stripe Connect fields:", error)
    return NextResponse.json({ error: "Failed to set up Stripe Connect fields" }, { status: 500 })
  }
}
