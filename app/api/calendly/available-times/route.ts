import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"
import { fetchAvailableTimes } from "@/lib/calendly-availability"

export async function POST(request: Request) {
  try {
    const { mentorId, date, serviceId } = await request.json()
    console.log("Available times request:", { mentorId, date, serviceId })

    if (!mentorId || !date || !serviceId) {
      console.log("Missing required parameters")
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // First, get the mentor's Calendly access token
    const { data: mentor, error: mentorError } = await supabase
      .from("mentors")
      .select("calendly_username, calendly_access_token, calendly_refresh_token, calendly_token_expires_at")
      .eq("id", mentorId)
      .single()

    if (mentorError || !mentor) {
      console.error("Error fetching mentor:", mentorError)
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 })
    }

    console.log("Mentor Calendly data:", {
      username: mentor.calendly_username,
      hasAccessToken: !!mentor.calendly_access_token,
      hasRefreshToken: !!mentor.calendly_refresh_token,
      tokenExpiresAt: mentor.calendly_token_expires_at,
    })

    if (!mentor.calendly_access_token) {
      console.log("Mentor doesn't have Calendly access token")
      return NextResponse.json(
        {
          error: "Mentor doesn't have Calendly access token",
          needsReconnect: true,
        },
        { status: 401 },
      )
    }

    // Now, get the event URI from the services table
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("*")
      .eq("id", serviceId)
      .single()

    if (serviceError || !service) {
      console.error("Error fetching service:", serviceError)
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    console.log("Service data:", {
      id: service.id,
      name: service.name,
      eventTypeUri: service.calendly_event_type_uri || service.calendly_event_uri,
    })

    // Check for the Calendly event URI in different possible column names
    const eventUri = service.calendly_event_type_uri || service.calendly_event_uri

    if (!eventUri) {
      console.log("Service doesn't have Calendly event URI")
      return NextResponse.json(
        {
          error: "Service doesn't have Calendly event URI",
          missingEventUri: true,
        },
        { status: 400 },
      )
    }

    console.log("Fetching real available times from Calendly for service:", serviceId, "with event URI:", eventUri)

    try {
      // Try to fetch available times with current token
      const accessToken = mentor.calendly_access_token
      const availableTimes = await fetchAvailableTimes(new Date(date), eventUri, accessToken)

      console.log("Calendly API returned times:", availableTimes)

      return NextResponse.json({
        times: availableTimes,
        source: "calendly",
        debug: {
          eventUri: eventUri,
          mentorHasToken: !!accessToken,
        },
      })
    } catch (error) {
      console.error("Error fetching available times from Calendly:", error)

      // Check if it's an authentication error
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (errorMessage.includes("401") || errorMessage.includes("Unauthenticated")) {
        return NextResponse.json(
          {
            error: "Calendly authentication error. The consultant needs to reconnect their Calendly account.",
            needsReconnect: true,
            details: errorMessage,
          },
          { status: 401 },
        )
      }

      // For other errors, return the error details
      return NextResponse.json(
        {
          error: "Failed to fetch available times from Calendly",
          details: errorMessage,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in available times route handler:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch available times",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
