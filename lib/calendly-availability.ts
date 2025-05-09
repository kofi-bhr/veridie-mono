import { makeCalendlyRequest } from "./calendly-api"

export async function fetchAvailableTimes(date: Date, eventTypeUri: string, accessToken: string) {
  try {
    // Format date as ISO string and get just the date part (YYYY-MM-DD)
    const formattedDate = date.toISOString().split("T")[0]

    // Get the event type ID from the URI
    const eventTypeId = eventTypeUri.split("/").pop()

    if (!eventTypeId) {
      throw new Error("Invalid event type URI")
    }

    // Construct the API endpoint
    const endpoint = `/event_type_available_times/${eventTypeId}?date=${formattedDate}`

    // Make the API request
    const data = await makeCalendlyRequest(endpoint, accessToken)

    // Extract and format the available times
    const availableTimes = data.available_times.map((slot: any) => {
      const time = new Date(slot.start_time)
      return time.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    })

    return availableTimes
  } catch (error) {
    console.error("Error fetching available times:", error)
    throw error
  }
}
