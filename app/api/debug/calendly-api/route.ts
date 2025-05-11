import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

export async function POST(request: Request) {
  try {
    const { mentorId, eventTypeUri } = await request.json()

    if (!mentorId || !eventTypeUri) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Get the mentor's Calendly access token
    const { data: mentor, error: mentorError } = await supabase
      .from("mentors")
      .select("calendly_access_token")
      .eq("id", mentorId)
      .single()

    if (mentorError || !mentor || !mentor.calendly_access_token) {
      return NextResponse.json({ error: "Mentor not found or missing access token" }, { status: 404 })
    }

    // Extract the event type UUID from the URI
    let eventTypeUuid = eventTypeUri
    if (eventTypeUri.includes("/")) {
      const parts = eventTypeUri.split("/")
      eventTypeUuid = parts[parts.length - 1]
      eventTypeUuid = eventTypeUuid.split("?")[0]
    }

    // Get today's date
    const today = new Date()
    const startDate = new Date(today)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(today)
    endDate.setHours(23, 59, 59, 999)

    // Format as ISO strings
    const startTime = startDate.toISOString()
    const endTime = endDate.toISOString()

    // Get timezone
    const timezone = "UTC"

    // Call Calendly API
    const availableTimesUrl = `https://api.calendly.com/event_type_available_times`
    const queryParams = new URLSearchParams({
      event_type: `https://api.calendly.com/event_types/${eventTypeUuid}`,
      start_time: startTime,
      end_time: endTime,
      timezone: timezone,
    })

    const fullUrl = `${availableTimesUrl}?${queryParams.toString()}`

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mentor.calendly_access_token}`,
      },
    })

    const responseText = await response.text()

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
      body: responseText,
      requestDetails: {
        url: fullUrl,
        eventTypeUuid,
        startTime,
        endTime,
        timezone,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error testing Calendly API",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
