import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"
import { fetchAvailableTimes } from "@/lib/calendly-availability"

export async function POST(request: Request) {
  try {
    const { mentorId, date, serviceId } = await request.json()
    console.log("Available times request:", { mentorId, date, serviceId })

    if (!mentorId || !date) {
      console.log("Missing required parameters")
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Get mentor's Calendly info
    const { data: mentor, error: mentorError } = await supabase
      .from("mentors")
      .select("calendly_username, calendly_access_token, calendly_refresh_token, calendly_event_type_uri")
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
      eventTypeUri: mentor.calendly_event_type_uri,
    })

    // Check if Calendly is configured
    if (!mentor.calendly_username || !mentor.calendly_access_token || !mentor.calendly_event_type_uri) {
      console.log("Calendly not configured for mentor, using simulated times")
      return simulateAvailableTimes(date)
    }

    console.log("Fetching real available times from Calendly for mentor:", mentorId)

    // Try to fetch available times with current token
    const accessToken = mentor.calendly_access_token
    const availableTimes = await fetchAvailableTimes(new Date(date), mentor.calendly_event_type_uri, accessToken)

    console.log("Calendly API returned times:", availableTimes)

    // If no times returned or there was an error, fall back to simulation
    if (availableTimes.length === 0) {
      console.log("No available times returned from Calendly, falling back to simulated times")
      return simulateAvailableTimes(date)
    }

    return NextResponse.json({ times: availableTimes, source: "calendly" })
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

  return NextResponse.json({ times, source: "simulated" })
}
