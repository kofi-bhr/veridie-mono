import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Create a Supabase admin client directly in this file
const createSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey)
}

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log(`Attempting to disconnect Calendly for user ID: ${userId}`)

    // Create a Supabase client
    let supabase
    try {
      supabase = createSupabaseAdmin()
    } catch (error: any) {
      console.error("Error creating Supabase client:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update the mentor record directly using the user ID
    const { error: updateError } = await supabase
      .from("mentors")
      .update({
        calendly_access_token: null,
        calendly_refresh_token: null,
        calendly_expires_at: null,
        calendly_username: null,
        calendly_user_uri: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateError) {
      console.error("Error updating mentor:", updateError)
      return NextResponse.json({ error: "Failed to disconnect Calendly" }, { status: 500 })
    }

    console.log(`Successfully disconnected Calendly for user ID: ${userId}`)
    return NextResponse.json({ success: true, message: "Calendly disconnected successfully" })
  } catch (error) {
    console.error("Error in disconnect route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
