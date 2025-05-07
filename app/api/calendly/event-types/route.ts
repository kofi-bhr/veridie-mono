import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"
import { getUserEventTypes, refreshCalendlyToken } from "@/lib/calendly-api"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseServiceRole)

// Calendly OAuth credentials
const CALENDLY_CLIENT_ID = process.env.CALENDLY_CLIENT_ID || ""
const CALENDLY_CLIENT_SECRET = process.env.CALENDLY_CLIENT_SECRET || ""

export async function GET() {
  try {
    // Get the authenticated user
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get mentor's Calendly tokens
    const { data: mentor, error: mentorError } = await supabase
      .from("mentors")
      .select("calendly_access_token, calendly_refresh_token, calendly_token_expires_at, calendly_user_uri")
      .eq("id", userId)
      .single()

    if (mentorError || !mentor) {
      return NextResponse.json({ error: "Mentor profile not found" }, { status: 404 })
    }

    if (!mentor.calendly_access_token || !mentor.calendly_refresh_token || !mentor.calendly_user_uri) {
      return NextResponse.json({ error: "Calendly not connected" }, { status: 400 })
    }

    // Check if token is expired and refresh if needed
    let accessToken = mentor.calendly_access_token
    const tokenExpiresAt = mentor.calendly_token_expires_at ? new Date(mentor.calendly_token_expires_at) : null

    if (!tokenExpiresAt || tokenExpiresAt < new Date()) {
      // Token is expired, refresh it
      try {
        const tokens = await refreshCalendlyToken(
          mentor.calendly_refresh_token,
          CALENDLY_CLIENT_ID,
          CALENDLY_CLIENT_SECRET,
        )

        // Update tokens in database
        await supabase
          .from("mentors")
          .update({
            calendly_access_token: tokens.accessToken,
            calendly_refresh_token: tokens.refreshToken,
            calendly_token_expires_at: tokens.expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)

        accessToken = tokens.accessToken
      } catch (refreshError) {
        console.error("Error refreshing Calendly token:", refreshError)
        return NextResponse.json({ error: "Failed to refresh Calendly authorization" }, { status: 401 })
      }
    }

    // Get event types from Calendly
    const eventTypes = await getUserEventTypes(accessToken, mentor.calendly_user_uri)

    return NextResponse.json({ eventTypes })
  } catch (error: any) {
    console.error("Error fetching Calendly event types:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred while fetching event types" },
      { status: 500 },
    )
  }
}
