import { supabase } from "@/lib/supabase-client"

export async function refreshCalendlyToken(mentorId: string) {
  try {
    // Get the mentor's refresh token
    const { data: mentor, error: mentorError } = await supabase
      .from("mentors")
      .select("calendly_refresh_token")
      .eq("id", mentorId)
      .single()

    if (mentorError || !mentor?.calendly_refresh_token) {
      console.error("Error getting refresh token:", mentorError)
      return { success: false, error: "Refresh token not found" }
    }

    // Call Calendly API to refresh the token
    const response = await fetch("https://auth.calendly.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "refresh_token",
        client_id: process.env.CALENDLY_CLIENT_ID,
        client_secret: process.env.CALENDLY_CLIENT_SECRET,
        refresh_token: mentor.calendly_refresh_token,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Token refresh error (${response.status}): ${errorText}`)
      return { success: false, error: `Token refresh failed: ${response.status}` }
    }

    const data = await response.json()

    // Update the tokens in the database
    const { error: updateError } = await supabase
      .from("mentors")
      .update({
        calendly_access_token: data.access_token,
        calendly_refresh_token: data.refresh_token,
        updated_at: new Date().toISOString(),
      })
      .eq("id", mentorId)

    if (updateError) {
      console.error("Error updating tokens:", updateError)
      return { success: false, error: "Failed to update tokens" }
    }

    return { success: true, accessToken: data.access_token }
  } catch (error) {
    console.error("Error refreshing Calendly token:", error)
    return { success: false, error: "Token refresh failed" }
  }
}
