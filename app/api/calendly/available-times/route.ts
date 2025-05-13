import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { fetchAvailableTimes } from "@/lib/calendly-availability"
import { refreshCalendlyToken } from "@/lib/calendly-token-refresh"

// Create a Supabase client with admin privileges
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mentorId, date, serviceId } = body

    if (!mentorId || !date || !serviceId) {
      return NextResponse.json({ error: "Missing required parameters: mentorId, date, serviceId" }, { status: 400 })
    }

    console.log("Fetching available times for:", { mentorId, date, serviceId })

    // Get the mentor data
    const { data: mentor, error: mentorError } = await supabaseAdmin
      .from("mentors")
      .select("calendly_access_token, calendly_token_expires_at")
      .eq("id", mentorId)
      .single()

    if (mentorError) {
      console.error("Error fetching mentor:", mentorError)
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 })
    }

    // Get the service data
    const { data: service, error: serviceError } = await supabaseAdmin
      .from("services")
      .select("calendly_event_type_uri")
      .eq("id", serviceId)
      .single()

    if (serviceError) {
      console.error("Error fetching service:", serviceError)
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    const eventTypeUri = service.calendly_event_type_uri

    if (!eventTypeUri) {
      console.error("Service is missing Calendly event type URI")
      return NextResponse.json(
        { error: "Service is not configured with Calendly", missingEventUri: true },
        { status: 400 },
      )
    }

    // Check if token needs refreshing
    let accessToken = mentor.calendly_access_token
    const tokenExpiresAt = mentor.calendly_token_expires_at ? new Date(mentor.calendly_token_expires_at) : null
    const now = new Date()

    // Add a buffer of 30 minutes to prevent edge cases
    const bufferTime = 30 * 60 * 1000 // 30 minutes in milliseconds
    const isExpired = !tokenExpiresAt || tokenExpiresAt.getTime() - now.getTime() < bufferTime

    // If token is expired or close to expiry, refresh it
    if (isExpired || !accessToken) {
      console.log("Token is expired or close to expiry, refreshing...")

      // Refresh the token
      const refreshResult = await refreshCalendlyToken(mentorId)

      if (!refreshResult.success) {
        console.error("Failed to refresh Calendly token:", refreshResult.error)
        return NextResponse.json({ error: "Failed to refresh Calendly token", needsReconnect: true }, { status: 401 })
      }

      // Use the new access token
      accessToken = refreshResult.accessToken
      console.log("Successfully refreshed Calendly token")
    } else {
      console.log("Calendly token is still valid, no need to refresh")
    }

    if (!accessToken) {
      console.error("No Calendly access token available")
      return NextResponse.json({ error: "Consultant needs to connect Calendly", needsReconnect: true }, { status: 401 })
    }

    // Fetch available times from Calendly
    try {
      const dateObj = new Date(date)
      const times = await fetchAvailableTimes(dateObj, eventTypeUri, accessToken)

      return NextResponse.json({
        times,
        source: "calendly",
        debug: {
          mentorId,
          serviceId,
          eventTypeUri: eventTypeUri.substring(0, 20) + "...", // Truncate for security
          date,
        },
      })
    } catch (error) {
      console.error("Error fetching available times from Calendly:", error)

      // Check if it's an authentication error
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes("401") || errorMessage.includes("auth")) {
        return NextResponse.json({ error: "Calendly authentication failed", needsReconnect: true }, { status: 401 })
      }

      return NextResponse.json({ error: `Failed to fetch available times: ${errorMessage}` }, { status: 500 })
    }
  } catch (error) {
    console.error("Unexpected error in available-times API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
