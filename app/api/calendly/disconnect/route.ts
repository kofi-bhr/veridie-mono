import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get the mentor record for this user
    const { data: mentor, error: mentorError } = await supabaseAdmin
      .from("mentors")
      .select("id")
      .eq("user_id", userId)
      .single()

    if (mentorError) {
      console.error("Error fetching mentor:", mentorError)
      return NextResponse.json({ error: "Failed to fetch mentor data" }, { status: 404 })
    }

    // Update the mentor record to remove Calendly information
    const { error: updateError } = await supabaseAdmin
      .from("mentors")
      .update({
        calendly_access_token: null,
        calendly_refresh_token: null,
        calendly_expires_at: null,
        calendly_username: null,
        calendly_user_uri: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", mentor.id)

    if (updateError) {
      console.error("Error updating mentor:", updateError)
      return NextResponse.json({ error: "Failed to disconnect Calendly" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Calendly disconnected successfully" })
  } catch (error) {
    console.error("Error in disconnect route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
