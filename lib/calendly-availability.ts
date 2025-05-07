// Function to fetch available times from Calendly API
export async function fetchAvailableTimes(date: Date, eventTypeUri: string, accessToken: string): Promise<string[]> {
  try {
    // Format date as YYYY-MM-DD
    const formattedDate = date.toISOString().split("T")[0]
    console.log("Fetching Calendly available times for:", { date: formattedDate, eventTypeUri })

    // Extract the event type UUID from the URI
    // Event type URI format: https://api.calendly.com/event_types/{uuid}
    const eventTypeUuid = eventTypeUri.split("/").pop()

    if (!eventTypeUuid) {
      console.error("Invalid event type URI:", eventTypeUri)
      return []
    }

    // Get the user's timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    // Calendly API endpoint for available times
    // This is the correct endpoint to get available time slots for a specific date
    const url = `https://api.calendly.com/event_types/${eventTypeUuid}/available_times?date=${formattedDate}&timezone=${encodeURIComponent(timezone)}`

    console.log("Calling Calendly API:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Calendly API error (${response.status}): ${errorText}`)
      throw new Error(`Failed to fetch available times: ${response.status}`)
    }

    const data = await response.json()
    console.log("Calendly API response:", JSON.stringify(data, null, 2))

    // Process the response to extract available times
    // The structure of Calendly's response for available_times endpoint
    const availableTimes = data.available_times.map((slot: any) => {
      const time = new Date(slot.start_time)
      return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    })

    console.log("Extracted available times:", availableTimes)
    return availableTimes
  } catch (error) {
    console.error("Error fetching available times from Calendly:", error)

    // If there's an error, return an empty array
    // The calling code will fall back to simulated times
    return []
  }
}

// Function to check if Calendly is configured for a mentor
export function isCalendlyConfigured(mentor: any): boolean {
  return !!(mentor.calendly_username && mentor.calendly_access_token && mentor.calendly_event_type_uri)
}
