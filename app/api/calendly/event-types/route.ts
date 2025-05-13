import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { getUserEventTypes } from "@/lib/calendly-api"
import { refreshCalendlyToken } from "@/lib/calendly-token-refresh"

export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const supabase = createRouteHandlerClient({ cookies })
    const { data: sessionData } = await supabase.auth.getSession()

    if (!sessionData.session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = sessionData.session.user

    // Get mentor data including Calendly tokens
    const { data: mentor, error: mentorError } = await supabase
      .from("mentors")
      .select("calendly_access_token, calendly_refresh_token, calendly_token_expires_at, calendly_user_uri")
      .eq("id", user.id)
      .single()

    if (mentorError || !mentor) {
      console.error("Error getting mentor data:", mentorError)
      return NextResponse.json({ error: "Mentor data not found" }, { status: 404 })
    }

    // Check if Calendly is connected
    if (!mentor.calendly_access_token) {
      return NextResponse.json({ error: "Calendly not connected for user: " + user.id }, { status: 400 })
    }

    // Check if user URI is available
    if (!mentor.calendly_user_uri) {
      return NextResponse.json({ error: "Calendly user URI not found" }, { status: 400 })
    }

    // Check if token is expired and refresh if needed
    let accessToken = mentor.calendly_access_token
    const tokenExpiresAt = mentor.calendly_token_expires_at ? new Date(mentor.calendly_token_expires_at) : null
    const now = new Date()

    // If token is expired or will expire soon (within 30 minutes), refresh it
    if (!tokenExpiresAt || tokenExpiresAt.getTime() - now.getTime() < 30 * 60 * 1000) {
      console.log("Token expired or will expire soon, refreshing...")
      const refreshResult = await refreshCalendlyToken(user.id)

      if (!refreshResult.success) {
        console.error("Token refresh failed:", refreshResult.error)
        return NextResponse.json({ error: "Failed to refresh Calendly token" }, { status: 401 })
      }

      if (refreshResult.accessToken) {
        accessToken = refreshResult.accessToken
      }
    }

    // Get event types from Calendly
    const eventTypes = await getUserEventTypes(accessToken, mentor.calendly_user_uri)

    return NextResponse.json({ eventTypes })
  } catch (error) {
    console.error("Unexpected error in Calendly event types route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
