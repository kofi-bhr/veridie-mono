// Function to fetch available times from Calendly API
export async function fetchAvailableTimes(date: Date, eventTypeUri: string, accessToken: string): Promise<string[]> {
  try {
    // Format date as YYYY-MM-DD
    const formattedDate = date.toISOString().split("T")[0]
    console.log("Fetching Calendly available times for:", { date: formattedDate, eventTypeUri })

    // Extract the event type UUID from the URI
    let eventTypeUuid = eventTypeUri

    if (eventTypeUri.includes("/")) {
      // It's a URI, extract the UUID
      const parts = eventTypeUri.split("/")
      eventTypeUuid = parts[parts.length - 1]

      // Clean up any query parameters
      eventTypeUuid = eventTypeUuid.split("?")[0]
    }

    if (!eventTypeUuid) {
      console.error("Invalid event type URI:", eventTypeUri)
      throw new Error(`Invalid event type URI: ${eventTypeUri}`)
    }

    console.log("Extracted event type UUID:", eventTypeUuid)

    // Get the user's timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
    console.log("User timezone:", timezone)

    // Create start_time and end_time for the specified date
    // start_time is the beginning of the day (00:00:00)
    // end_time is the end of the day (23:59:59)
    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(date)
    endDate.setHours(23, 59, 59, 999)

    // Format as ISO strings
    const startTime = startDate.toISOString()
    const endTime = endDate.toISOString()

    console.log("Time range:", { startTime, endTime })

    // Calendly API endpoint for available times
    const availableTimesUrl = `https://api.calendly.com/event_type_available_times`

    // Build query parameters
    const queryParams = new URLSearchParams({
      event_type: `https://api.calendly.com/event_types/${eventTypeUuid}`,
      start_time: startTime,
      end_time: endTime,
      timezone: timezone,
    })

    const fullUrl = `${availableTimesUrl}?${queryParams.toString()}`
    console.log("Calling Calendly API for available times:", fullUrl)

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })

    // Log the raw response for debugging
    const responseText = await response.text()
    console.log(`Calendly API response (${response.status}):`, responseText.substring(0, 500) + "...")

    if (!response.ok) {
      console.error(`Calendly API error (${response.status}): ${responseText}`)
      throw new Error(`Calendly API error (${response.status}): ${responseText}`)
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error("Error parsing Calendly API response:", e)
      throw new Error(`Error parsing Calendly API response: ${e instanceof Error ? e.message : String(e)}`)
    }

    console.log("Calendly API parsed response:", JSON.stringify(data, null, 2).substring(0, 500) + "...")

    // Check if the response has the expected structure
    if (!data.collection || !Array.isArray(data.collection)) {
      console.error("Unexpected Calendly API response format:", data)
      throw new Error("Unexpected Calendly API response format")
    }

    // Process the response to extract available times
    const availableTimes = data.collection
      .filter((slot: any) => slot.status === "available")
      .map((slot: any) => {
        const time = new Date(slot.start_time)
        // Convert to local time
        return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      })

    console.log("Extracted available times:", availableTimes)
    return availableTimes
  } catch (error) {
    console.error("Error fetching available times from Calendly:", error)
    // Re-throw the error so the caller can handle it
    throw error
  }
}

// Function to check if Calendly is configured for a service
export function isCalendlyConfigured(service: any, mentor: any): boolean {
  const eventUri = service.calendly_event_type_uri || service.calendly_event_uri
  return !!(eventUri && mentor.calendly_access_token)
}
