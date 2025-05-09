import { supabase } from "@/lib/supabase-client"
import { refreshToken } from "./calendly-api"

export async function refreshCalendlyToken(mentorId: string) {
  try {
    console.log("Starting Calendly token refresh for mentor:", mentorId)

    // Get the mentor's refresh token
    const { data: mentor, error: mentorError } = await supabase
      .from("mentors")
      .select("calendly_refresh_token, calendly_token_expires_at, calendly_access_token")
      .eq("id", mentorId)
      .single()

    if (mentorError) {
      console.error("Error getting refresh token:", mentorError)
      return { success: false, error: "Mentor not found" }
    }

    if (!mentor?.calendly_refresh_token) {
      console.error("Mentor has no refresh token")
      return { success: false, error: "Refresh token not found" }
    }

    // Check if token is actually expired
    const tokenExpiresAt = mentor.calendly_token_expires_at ? new Date(mentor.calendly_token_expires_at) : null
    const now = new Date()

    // Add a buffer of 5 minutes to prevent edge cases
    const bufferTime = 5 * 60 * 1000 // 5 minutes in milliseconds
    const isExpired = !tokenExpiresAt || tokenExpiresAt.getTime() - now.getTime() < bufferTime

    if (!isExpired && mentor.calendly_access_token) {
      console.log("Token is still valid, no need to refresh")
      return { success: true, accessToken: mentor.calendly_access_token }
    }

    console.log("Token is expired or close to expiry, refreshing...")

    // Get environment variables
    const clientId = process.env.CALENDLY_CLIENT_ID
    const clientSecret = process.env.CALENDLY_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      console.error("Missing Calendly credentials")
      return { success: false, error: "Missing Calendly credentials" }
    }

    // Call Calendly API to refresh the token
    const tokens = await refreshToken(mentor.calendly_refresh_token, clientId, clientSecret)

    // Update the tokens in the database
    const { error: updateError } = await supabase
      .from("mentors")
      .update({
        calendly_access_token: tokens.accessToken,
        calendly_refresh_token: tokens.refreshToken,
        calendly_token_expires_at: tokens.expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", mentorId)

    if (updateError) {
      console.error("Error updating tokens:", updateError)
      return { success: false, error: "Failed to update tokens" }
    }

    console.log("Calendly token refreshed successfully")
    return { success: true, accessToken: tokens.accessToken }
  } catch (error) {
    console.error("Error refreshing Calendly token:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Token refresh failed",
    }
  }
}

// For backward compatibility
// export const refreshCalendlyToken = refreshToken
