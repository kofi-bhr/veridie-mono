import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { getUserEventTypes, refreshCalendlyToken } from "@/lib/calendly-api"

export async function GET(request: NextRequest) {
  try {
    // Validate the user is authenticated
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Authentication error:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the mentor's Calendly information
    const { data: mentor, error: mentorError } = await supabase
      .from("mentors")
      .select("calendly_access_token, calendly_refresh_token, calendly_token_expires_at, calendly_user_uri")
      .eq("id", user.id)
      .single()

    if (mentorError || !mentor?.calendly_access_token) {
      console.error("Error fetching mentor or no Calendly connection:", mentorError)
      return NextResponse.json({ error: "Calendly not connected" }, { status: 404 })
    }

    // Check if the token is expired
    const tokenExpiresAt = new Date(mentor.calendly_token_expires_at)
    let accessToken = mentor.calendly_access_token

    if (tokenExpiresAt < new Date()) {
      // Refresh the token
      const clientId = process.env.CALENDLY_CLIENT_ID
      const clientSecret = process.env.CALENDLY_CLIENT_SECRET

      if (!clientId || !clientSecret) {
        console.error("Missing Calendly credentials")
        return NextResponse.json({ error: "Calendly integration not configured" }, { status: 500 })
      }

      const tokens = await refreshCalendlyToken(mentor.calendly_refresh_token, clientId, clientSecret)

      // Update the mentor's Calendly information
      await supabase
        .from("mentors")
        .update({
          calendly_access_token: tokens.accessToken,
          calendly_refresh_token: tokens.refreshToken,
          calendly_token_expires_at: tokens.expiresAt.toISOString(),
        })
        .eq("id", user.id)

      accessToken = tokens.accessToken
    }

    // Get the user's Calendly event types
    const eventTypes = await getUserEventTypes(accessToken, mentor.calendly_user_uri)

    return NextResponse.json({ eventTypes })
  } catch (error) {
    console.error("Unexpected error in Calendly event types route:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
