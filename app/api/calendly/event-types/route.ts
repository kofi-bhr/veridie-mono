import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { getUserEventTypes, refreshCalendlyToken } from "@/lib/calendly-api"
import { CALENDLY_CLIENT_ID, CALENDLY_CLIENT_SECRET } from "@/lib/api-config"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = userData.user

    // Get mentor's Calendly credentials
    const { data: mentor, error: mentorError } = await supabase
      .from("mentors")
      .select("calendly_access_token, calendly_refresh_token, calendly_token_expires_at, calendly_user_uri")
      .eq("id", user.id)
      .single()

    if (mentorError) {
      console.error("Error fetching mentor:", mentorError)
      return NextResponse.json({ error: "Failed to fetch mentor data" }, { status: 500 })
    }

    // Check if Calendly is connected
    if (!mentor.calendly_access_token) {
      console.error(`Calendly not connected for user: ${user.id}`)
      return NextResponse.json({ error: "Calendly not connected" }, { status: 400 })
    }

    // Check if user URI is available
    if (!mentor.calendly_user_uri) {
      console.error(`Missing Calendly user URI for user: ${user.id}`)
      return NextResponse.json(
        { error: "Missing Calendly user URI. Please reconnect your Calendly account." },
        { status: 400 },
      )
    }

    let accessToken = mentor.calendly_access_token

    // Check if token is expired and refresh if needed
    const tokenExpiresAt = mentor.calendly_token_expires_at ? new Date(mentor.calendly_token_expires_at) : null
    const isTokenExpired = tokenExpiresAt ? tokenExpiresAt < new Date() : true

    if (isTokenExpired && mentor.calendly_refresh_token) {
      try {
        console.log("Token expired, refreshing...")

        if (!CALENDLY_CLIENT_ID || !CALENDLY_CLIENT_SECRET) {
          throw new Error("Missing Calendly credentials")
        }

        const refreshedTokens = await refreshCalendlyToken(
          mentor.calendly_refresh_token,
          CALENDLY_CLIENT_ID,
          CALENDLY_CLIENT_SECRET,
        )

        // Update tokens in database
        const { error: updateError } = await supabase
          .from("mentors")
          .update({
            calendly_access_token: refreshedTokens.accessToken,
            calendly_refresh_token: refreshedTokens.refreshToken,
            calendly_token_expires_at: refreshedTokens.expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)

        if (updateError) {
          console.error("Error updating tokens:", updateError)
        }

        accessToken = refreshedTokens.accessToken
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError)
        return NextResponse.json(
          { error: "Failed to refresh Calendly token. Please reconnect your account." },
          { status: 401 },
        )
      }
    }

    // Fetch event types
    try {
      const eventTypes = await getUserEventTypes(accessToken, mentor.calendly_user_uri)
      return NextResponse.json({ eventTypes })
    } catch (error) {
      console.error("Error getting Calendly event types:", error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Unexpected error in Calendly event types" },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Unexpected error in Calendly event types route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
