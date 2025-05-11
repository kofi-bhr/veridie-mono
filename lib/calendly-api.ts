// Calendly API Client

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

export interface CalendlyEventType {
  uri: string
  name: string
  description: string | null
  duration: number
  slug: string
  kind: string
  schedulingUrl: string
  active: boolean
  secret: boolean
  color: string | null
}

export interface CalendlySchedulingLink {
  url: string
  owner: string
  eventType: string
}

// Generate OAuth authorization URL
export function getCalendlyAuthUrl(clientId: string, redirectUri: string): string {
  // Use URLSearchParams to properly encode parameters
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "user:read event_types:read scheduling_links:read",
  })

  console.log("Generated Calendly Auth URL with redirect URI:", redirectUri)
  return `https://auth.calendly.com/oauth/authorize?${params.toString()}`
}

// Exchange authorization code for tokens
export async function exchangeCalendlyCode(code: string, clientId: string, clientSecret: string, redirectUri: string) {
  try {
    console.log("Exchanging code for token with redirect URI:", redirectUri)

    const response = await fetch("https://auth.calendly.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    })

    // Log the entire response for debugging
    const responseText = await response.text()
    console.log(`Token exchange response (${response.status}):`, responseText)

    if (!response.ok) {
      console.error(`Token exchange error (${response.status}):`, responseText)
      throw new Error(`Token exchange failed: ${response.status}`)
    }

    // Parse the response JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error("Error parsing token response:", e)
      throw new Error("Failed to parse token response")
    }

    // Calculate when the token will expire
    const expiresIn = data.expires_in || 3600 // Default to 1 hour
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: expiresAt,
    }
  } catch (error) {
    console.error("Error exchanging code for token:", error)
    throw error
  }
}

// Refresh access token
export async function refreshCalendlyToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string,
): Promise<CalendlyTokens> {
  try {
    const response = await fetch("https://auth.calendly.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }).toString(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error_description || "Failed to refresh token")
    }

    const data = await response.json()

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    }
  } catch (error) {
    console.error("Error refreshing Calendly token:", error)
    throw error
  }
}

// This file contains utility functions for interacting with the Calendly API

/**
 * Refreshes a Calendly access token using the refresh token
 */
export async function refreshToken(refreshToken: string, clientId: string, clientSecret: string) {
  console.log("Refreshing Calendly token")

  try {
    const response = await fetch("https://auth.calendly.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Token refresh error (${response.status}): ${errorText}`)
      throw new Error(`Token refresh failed: ${response.status}`)
    }

    const data = await response.json()
    console.log("Token refresh successful")

    // Calculate when the token will expire
    const expiresIn = data.expires_in || 3600 // Default to 1 hour
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: expiresAt,
    }
  } catch (error) {
    console.error("Error refreshing token:", error)
    throw error
  }
}

/**
 * Makes an authenticated request to the Calendly API
 */
export async function makeCalendlyRequest(endpoint: string, accessToken: string) {
  try {
    const baseUrl = "https://api.calendly.com"
    const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`

    console.log(`Making Calendly API request to: ${url}`)

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
      throw new Error(`Calendly API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error making Calendly API request:", error)
    throw error
  }
}

// Get current user info
export async function getCurrentUser(accessToken: string) {
  try {
    const response = await fetch("https://api.calendly.com/users/me", {
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

// Get user's event types
export async function getUserEventTypes(accessToken: string, userUri: string): Promise<CalendlyEventType[]> {
  try {
    const response = await fetch(`${CALENDLY_API_URL}/event_types?user=${userUri}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to get event types")
    }

    const data = await response.json()

    return data.collection.map((item: any) => ({
      uri: item.uri,
      name: item.name,
      description: item.description,
      duration: item.duration,
      slug: item.slug,
      kind: item.kind,
      schedulingUrl: item.scheduling_url,
      active: item.active,
      secret: item.secret,
      color: item.color,
    }))
  } catch (error) {
    console.error("Error getting Calendly event types:", error)
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
