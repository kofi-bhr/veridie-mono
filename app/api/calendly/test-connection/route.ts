import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/calendly-api"
import { supabaseAdmin } from "@/lib/supabase-server" // Import the existing supabaseAdmin client

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Use the existing supabaseAdmin client instead of creating a new one
    // Get the mentor record for this user
    const { data: mentor, error: mentorError } = await supabaseAdmin
      .from("mentors")
      .select("id, calendly_access_token, calendly_refresh_token, calendly_expires_at")
      .eq("user_id", userId)
      .single()

    if (mentorError) {
      console.error("Error fetching mentor:", mentorError)
      return NextResponse.json({ error: "Failed to fetch mentor data", valid: false }, { status: 404 })
    }

    if (!mentor.calendly_access_token) {
      return NextResponse.json({ error: "No Calendly connection found", valid: false }, { status: 200 })
    }

    // Check if token is expired
    const expiresAt = mentor.calendly_expires_at ? new Date(mentor.calendly_expires_at) : null
    const isExpired = expiresAt ? expiresAt < new Date() : true

    if (isExpired) {
      return NextResponse.json({ error: "Calendly token is expired", valid: false }, { status: 200 })
    }

    // Test the connection by making a simple API call
    try {
      const userInfo = await getCurrentUser(mentor.calendly_access_token)
      return NextResponse.json({ valid: true, user: userInfo }, { status: 200 })
    } catch (error) {
      console.error("Error testing Calendly connection:", error)
      return NextResponse.json({ error: "Failed to connect to Calendly API", valid: false }, { status: 200 })
    }
  } catch (error) {
    console.error("Error in test-connection route:", error)
    return NextResponse.json({ error: "Internal server error", valid: false }, { status: 500 })
  }
}
