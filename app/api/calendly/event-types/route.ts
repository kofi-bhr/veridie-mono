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

    if (mentorError) {
      console.error("Error fetching mentor:", mentorError)
      return NextResponse.json({ error: "Failed to fetch mentor data" }, { status: 500 })
    }

    if (!mentor?.calendly_access_token) {
      console.error(`Calendly not connected for user: ${user.id}`)
      return NextResponse.json({ error: "Calendly not connected" }, { status: 400 })
    }

    if (!mentor?.calendly_user_uri) {
      console.error(`Missing Calendly user URI for user: ${user.id}`)
      return NextResponse.json(
        { error: "Missing Calendly user URI. Please reconnect your Calendly account." },
        { status: 400 },
      )
    }

    // Check if the token is expired
    const tokenExpiresAt = mentor.calendly_token_expires_at ? new Date(mentor.calendly_token_expires_at) : null
    let accessToken = mentor.calendly_access_token

    // Define a token refresh function that can be called if needed
    const refreshToken = async () => {
      console.log("Refreshing token in event-types route...")

      // Get environment variables
      const clientId = process.env.CALENDLY_CLIENT_ID
      const clientSecret = process.env.CALENDLY_CLIENT_SECRET

      if (!clientId || !clientSecret) {
        throw new Error("Missing Calendly credentials")
      }

      if (!mentor.calendly_refresh_token) {
        throw new Error("Missing refresh token")
      }

      const tokens = await refreshCalendlyToken(mentor.calendly_refresh_token, clientId, clientSecret)

      // Update the mentor's Calendly information
      await supabase
        .from("mentors")
        .update({
          calendly_access_token: tokens.accessToken,
          calendly_refresh_token: tokens.refreshToken,
          calendly_token_expires_at: tokens.expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      return tokens.accessToken
    }

    // If token is expired, refresh it proactively
    if (tokenExpiresAt && tokenExpiresAt < new Date()) {
      try {
        console.log("Token expired, refreshing proactively...")
        accessToken = await refreshToken()
      } catch (refreshError) {
        console.error("Error refreshing Calendly token:", refreshError)
        return NextResponse.json(
          { error: "Failed to refresh Calendly token. Please reconnect your account." },
          { status: 401 },
        )
      }
    }

    try {
      // Get the user's Calendly event types with the refresh function
      console.log("Fetching event types for user:", user.id)
      console.log("User URI:", mentor.calendly_user_uri)

      const eventTypes = await getUserEventTypes(
        accessToken,
        mentor.calendly_user_uri,
        // Pass the refresh function to allow auto-refresh if needed
        async () => {
          const newToken = await refreshToken()
          return newToken
        },
      )

      return NextResponse.json({ eventTypes })
    } catch (error: any) {
      console.error("Error getting Calendly event types:", error)

      // If we get a 401 error, the token is invalid and needs to be refreshed
      if (error.message && error.message.includes("401")) {
        return NextResponse.json(
          {
            error: "Calendly authentication failed. Please reconnect your account.",
            needsReconnect: true,
          },
          { status: 401 },
        )
      }

      return NextResponse.json({ error: error.message || "Failed to fetch Calendly event types" }, { status: 500 })
    }
  } catch (error) {
    console.error("Unexpected error in Calendly event types route:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
