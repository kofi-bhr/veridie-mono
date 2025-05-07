import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Add calendly_username column to mentors table if it doesn't exist
    await supabase.rpc("execute_sql", {
      sql_query: `
        ALTER TABLE mentors ADD COLUMN IF NOT EXISTS calendly_username TEXT;
        ALTER TABLE mentors ADD COLUMN IF NOT EXISTS calendly_token TEXT;
        ALTER TABLE mentors ADD COLUMN IF NOT EXISTS calendly_refresh_token TEXT;
        ALTER TABLE mentors ADD COLUMN IF NOT EXISTS calendly_token_expires_at TIMESTAMP WITH TIME ZONE;
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS calendly_event_uri TEXT;
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error setting up Calendly columns:", error)
    return NextResponse.json({ error: error.message || "Failed to set up Calendly columns" }, { status: 500 })
  }
}
