import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { fetchAvailableTimes } from "@/lib/calendly-availability"
import { refreshCalendlyToken } from "@/lib/calendly-token-refresh"

export async function POST(request: Request) {
  try {
    const { mentorId, date, serviceId } = await request.json()
    console.log("Available times request:", { mentorId, date, serviceId })

    if (!mentorId || !date || !serviceId) {
      console.log("Missing required parameters")
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Create a Supabase client using the route handler client
    const supabase = createRouteHandlerClient({ cookies })

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

    if (!mentor.calendly_access_token && !mentor.calendly_refresh_token) {
      console.log("Mentor doesn't have Calendly tokens, using simulated times")
      return simulateAvailableTimes(date)
    }

    // Try to refresh the token if we have a refresh token
    let accessToken = mentor.calendly_access_token
    if (mentor.calendly_refresh_token) {
      console.log("Attempting to refresh Calendly token")
      const refreshResult = await refreshCalendlyToken(mentorId)

      if (refreshResult.success && refreshResult.accessToken) {
        console.log("Token refreshed successfully")
        // Update the access token with the newly refreshed one
        accessToken = refreshResult.accessToken
      } else {
        console.error("Failed to refresh token:", refreshResult.error)
        // If we can't refresh and don't have a valid access token, fall back to simulated times
        if (!accessToken) {
          return simulateAvailableTimes(date)
        }
      }
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

    console.log("Service data:", service)

    // Check for the Calendly event URI in different possible column names
    const eventUri = service.calendly_event_type_uri || service.calendly_event_uri

    if (!eventUri) {
      console.log("Service doesn't have Calendly event URI, using simulated times")
      return simulateAvailableTimes(date)
    }

    console.log("Fetching real available times from Calendly for service:", serviceId, "with event URI:", eventUri)

    try {
      // Try to fetch available times with current token
      const availableTimes = await fetchAvailableTimes(new Date(date), eventUri, accessToken)

      console.log("Calendly API returned times:", availableTimes)

      // If no times were returned from Calendly, use simulated times
      if (availableTimes.length === 0) {
        console.log("No available times returned from Calendly, using simulated times")
        return simulateAvailableTimes(date)
      }

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
      return simulateAvailableTimes(date)
    }
  } catch (error) {
    console.error("Error fetching available times:", error)
    return NextResponse.json({ error: "Failed to fetch available times" }, { status: 500 })
  }
}

function simulateAvailableTimes(dateString: string) {
  console.log("Using simulated times for date:", dateString)
  const date = new Date(dateString)
  const day = date.getDay()
  let times: string[] = []

  if (day === 0 || day === 6) {
    // Weekend
    times = ["10:00 AM", "11:00 AM", "2:00 PM"]
  } else {
    // Weekday
    times = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"]
  }

  return NextResponse.json({
    times,
    source: "simulated",
  })
}
