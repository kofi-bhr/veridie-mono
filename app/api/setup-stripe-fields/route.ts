import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export async function POST(request: Request) {
  try {
    // Get the current user from the session
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user.email?.endsWith("@admin.com")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Run the migration SQL
    const migrationSQL = `
      -- Check if stripe_connect_accounts column exists in mentors table, if not add it
      DO $
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'mentors' AND column_name = 'stripe_connect_accounts') THEN
              ALTER TABLE mentors ADD COLUMN stripe_connect_accounts TEXT;
          END IF;
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
    `

    const { error } = await supabase.rpc("exec_sql", { sql: migrationSQL })

    if (error) {
      console.error("Error running migration:", error)
      return NextResponse.json({ error: "Failed to run migration" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in setup route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
