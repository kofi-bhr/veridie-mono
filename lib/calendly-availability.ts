// Function to fetch available times from Calendly API
export async function fetchAvailableTimes(date: Date, eventTypeUri: string, accessToken: string): Promise<string[]> {
  try {
    // Format date as YYYY-MM-DD
    const formattedDate = date.toISOString().split("T")[0]

    // Calendly API endpoint for available times
    const url = `https://api.calendly.com/scheduling_links`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        max_event_count: 1,
        owner: eventTypeUri.split("/event_types/")[0],
        event_types: [eventTypeUri],
        availability_rule: {
          date: formattedDate,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch available times: ${response.status}`)
    }

    const data = await response.json()

    // Process the response to extract available times
    // This is a simplified example - actual implementation would depend on Calendly's response format
    const availableTimes = data.resource.available_times.map((slot: any) => {
      const time = new Date(slot.start_time)
      return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    })

    return availableTimes
  } catch (error) {
    console.error("Error fetching available times from Calendly:", error)
    return []
  }
}

// Function to check if Calendly is configured for a mentor
export function isCalendlyConfigured(mentor: any): boolean {
  return !!(mentor.calendly_username && mentor.calendly_access_token && mentor.calendly_event_type_uri)
}
