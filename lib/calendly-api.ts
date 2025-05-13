import type { CalendlyEventType } from "@/types"

const CALENDLY_API_URL = "https://api.calendly.com"

// Types
export interface CalendlyTokens {
  accessToken: string
  refreshToken: string
  expiresAt: Date
}

export interface CalendlyUser {
  uri: string
  name: string
  email: string
  schedulingUrl: string
  timezone: string
}

// Helper function to add delay for retries
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Generate OAuth authorization URL
export function getCalendlyAuthUrl(clientId: string, redirectUri: string): string {
  // Use the exact format specified
  return `https://auth.calendly.com/oauth/authorize?client_id=${encodeURIComponent(clientId)}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`
}

// Exchange authorization code for tokens
export async function exchangeCalendlyCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
): Promise<CalendlyTokens> {
  const response = await fetch("https://auth.calendly.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }).toString(),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Calendly token exchange error:", errorText)
    throw new Error(`Failed to exchange Calendly code: ${errorText}`)
  }

  const data = await response.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  }
}

// Refresh access token - this is the missing export
export async function refreshCalendlyToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string,
): Promise<CalendlyTokens> {
  console.log("Refreshing Calendly token with client ID:", clientId?.substring(0, 5) + "...")

  try {
    const response = await fetch("https://auth.calendly.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }).toString(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Token refresh error (${response.status}):`, errorText)
      throw new Error(`Token refresh failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("Token refresh successful")

    // Calculate when the token will expire
    const expiresIn = data.expires_in || 3600 // Default to 1 hour
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken, // Use the new refresh token if provided, otherwise keep the old one
      expiresAt: expiresAt,
    }
  } catch (error) {
    console.error("Error refreshing token:", error)
    throw error
  }
}

// Get user's event types with retry logic and auto token refresh
export async function getUserEventTypes(
  accessToken: string,
  userUri: string,
  refreshTokenFn?: () => Promise<string>,
  maxRetries = 3,
): Promise<CalendlyEventType[]> {
  let retries = 0
  let currentToken = accessToken

  while (retries < maxRetries) {
    try {
      console.log(`Fetching Calendly event types (attempt ${retries + 1})...`)
      console.log(`User URI: ${userUri}`)

      // Make sure the userUri is properly formatted
      // The API expects a full URI like https://api.calendly.com/users/USERID
      if (!userUri.includes("://")) {
        // If it's just a UUID, construct the full URI
        if (!userUri.includes("/")) {
          userUri = `https://api.calendly.com/users/${userUri}`
        } else if (userUri.startsWith("/")) {
          userUri = `https://api.calendly.com${userUri}`
        } else if (!userUri.startsWith("http")) {
          userUri = `https://api.calendly.com/${userUri}`
        }
      }

      console.log(`Formatted User URI: ${userUri}`)

      // Construct the API URL with the user parameter
      const apiUrl = `${CALENDLY_API_URL}/event_types?user=${encodeURIComponent(userUri)}`
      console.log(`API URL: ${apiUrl}`)

      const response = await fetch(apiUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
      })

      if (response.status === 429) {
        // Rate limited, wait and retry
        const backoffTime = Math.pow(2, retries) * 1000
        console.log(`Rate limited by Calendly API. Retrying in ${backoffTime}ms...`)
        await delay(backoffTime)
        retries++
        continue
      }

      // If unauthorized and we have a refresh function, try to refresh the token
      if (response.status === 401 && refreshTokenFn && retries === 0) {
        console.log("Access token expired, attempting to refresh...")
        try {
          currentToken = await refreshTokenFn()
          console.log("Token refreshed successfully, retrying request...")
          continue // Retry with the new token without incrementing retries
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError)
          // Continue with retry logic
        }
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Calendly API error (${response.status}):`, errorText)

        if (response.status === 401) {
          throw new Error("Calendly authentication failed. Please reconnect your account.")
        }

        throw new Error(`Calendly API error (${response.status}): ${errorText}`)
      }

      const data = await response.json()

      if (!data.collection) {
        console.error("Unexpected Calendly API response format:", data)
        throw new Error("Invalid response format from Calendly API")
      }

      return data.collection.map((eventType: any) => ({
        uri: eventType.uri,
        name: eventType.name,
        description: eventType.description,
        duration: eventType.duration,
        slug: eventType.slug,
        kind: eventType.kind,
        schedulingUrl: eventType.scheduling_url,
        active: eventType.active,
        secret: eventType.secret,
        color: eventType.color,
      }))
    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:`, error)

      if (retries === maxRetries - 1) {
        throw error
      }

      const backoffTime = Math.pow(2, retries) * 1000
      await delay(backoffTime)
      retries++
    }
  }

  throw new Error("Failed to fetch Calendly event types after multiple attempts")
}

// Get current user info
export async function getCurrentUser(accessToken: string) {
  try {
    const response = await fetch(`${CALENDLY_API_URL}/users/me`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`User info error (${response.status}):`, errorText)
      throw new Error(`Failed to get user info: ${response.status}`)
    }

    const data = await response.json()
    return {
      uri: data.resource.uri,
      name: data.resource.name,
      schedulingUrl: data.resource.scheduling_url,
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    throw error
  }
}

// Create a webhook subscription
export async function createWebhookSubscription(
  accessToken: string,
  userUri: string,
  webhookCallbackUrl: string,
): Promise<any> {
  try {
    const response = await fetch(`${CALENDLY_API_URL}/webhook_subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: webhookCallbackUrl,
        events: ["invitee.created", "invitee.canceled", "invitee.rescheduled"],
        organization: userUri.replace("users", "organizations"),
        scope: "organization",
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create webhook subscription")
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating Calendly webhook subscription:", error)
    throw error
  }
}
