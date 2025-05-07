import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

export async function POST(request: Request) {
  try {
    const { mentorId, date } = await request.json()

    if (!mentorId || !date) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Get mentor's Calendly info
    const { data: mentor, error: mentorError } = await supabase
      .from("mentors")
      .select("calendly_username, calendly_access_token, calendly_event_type_uri")
      .eq("id", mentorId)
      .single()

    if (mentorError || !mentor) {
      return NextResponse.json({ error: "Mentor not found or Calendly not configured" }, { status: 404 })
    }

    if (!mentor.calendly_username || !mentor.calendly_access_token || !mentor.calendly_event_type_uri) {
      // If Calendly is not configured, return simulated times
      return simulateAvailableTimes(date)
    }

    // In a real implementation, you would call the Calendly API here
    // For now, we'll return simulated times
    return simulateAvailableTimes(date)
  } catch (error) {
    console.error("Error fetching available times:", error)
    return NextResponse.json({ error: "Failed to fetch available times" }, { status: 500 })
  }
}

function simulateAvailableTimes(dateString: string) {
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

  return NextResponse.json({ times })
}
